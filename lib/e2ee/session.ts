/**
 * E2EE 会话管理模块
 * 实现 X3DH-lite 协议和会话建立
 */

import {
  generateIdentityKeyPair,
  generatePreKeyPair,
  importPublicKey,
  importPrivateKey,
  exportPublicKey,
  exportPrivateKey,
  deriveSharedSecret,
  hkdf,
  calculateFingerprint,
  arrayBufferToBase64,
  // base64ToArrayBuffer,
  concatArrayBuffers,
  generateRandomBytes
} from './crypto'
import { e2eeStorage, fallbackStorage, isIndexedDBSupported, type IdentityKey, type PreKey, type Session, type TrustedPeer } from './storage'

export interface PeerKeys {
  userId: string
  identityKey: JsonWebKey
  signedPreKey: JsonWebKey
  signedPreKeyId: string
  oneTimePreKey?: {
    id: string
    publicKey: JsonWebKey
  }
}

export interface SessionEstablishmentResult {
  session: Session
  fingerprint: string
  isNewTrust: boolean
}

export class E2EESessionManager {
  private storage = isIndexedDBSupported() ? e2eeStorage : fallbackStorage

  /**
   * 初始化用户身份密钥
   */
  async initializeIdentity(): Promise<IdentityKey> {
    // 检查是否已有身份密钥
    const existing = await this.storage.getIdentityKey()
    if (existing) {
      return existing
    }

    // 生成新的身份密钥对
    const keyPair = await generateIdentityKeyPair()
    const publicKey = await exportPublicKey(keyPair.publicKey!)
    const privateKey = await exportPrivateKey(keyPair.privateKey!)
    const fingerprint = await calculateFingerprint(keyPair.publicKey!)

    const identityKey: IdentityKey = {
      privateKey,
      publicKey,
      fingerprint,
      createdAt: new Date()
    }

    await this.storage.saveIdentityKey(identityKey)
    return identityKey
  }

  /**
   * 生成预共享密钥
   */
  async generatePreKeys(count: number = 100): Promise<PreKey[]> {
    const preKeys: PreKey[] = []

    for (let i = 0; i < count; i++) {
      const keyPair = await generatePreKeyPair()
      const publicKey = await exportPublicKey(keyPair.publicKey!)
      const privateKey = await exportPrivateKey(keyPair.privateKey!)

      const preKey: PreKey = {
        id: `prekey_${Date.now()}_${i}`,
        privateKey,
        publicKey,
        createdAt: new Date(),
        used: false
      }

      await this.storage.savePreKey(preKey)
      preKeys.push(preKey)
    }

    return preKeys
  }

  /**
   * 建立与对等方的会话（X3DH-lite 协议）
   */
  async establishSession(peerKeys: PeerKeys): Promise<SessionEstablishmentResult> {
    const identityKey = await this.storage.getIdentityKey()
    if (!identityKey) {
      throw new Error('Identity key not initialized')
    }

    // 导入密钥
    const myPrivateKey = await importPrivateKey(identityKey.privateKey)
    const peerIdentityKey = await importPublicKey(peerKeys.identityKey)
    const peerSignedPreKey = await importPublicKey(peerKeys.signedPreKey)

    // 生成一次性临时密钥
    const ephemeralKeyPair = await generateIdentityKeyPair()
    const ephemeralPrivateKey = ephemeralKeyPair.privateKey!

    // 执行 X3DH-lite 密钥协商
    const sharedSecrets: ArrayBuffer[] = []

    // 1. DH1: IK(A) × SPK(B)
    const dh1 = await deriveSharedSecret(myPrivateKey, peerSignedPreKey)
    sharedSecrets.push(dh1)

    // 2. DH2: EPK(A) × IK(B)
    const dh2 = await deriveSharedSecret(ephemeralPrivateKey, peerIdentityKey)
    sharedSecrets.push(dh2)

    // 3. DH3: EPK(A) × OPK(B) (如果可用)
    let usedPreKeyId: string | undefined
    if (peerKeys.oneTimePreKey) {
      const peerOneTimeKey = await importPublicKey(peerKeys.oneTimePreKey.publicKey)
      const dh3 = await deriveSharedSecret(ephemeralPrivateKey, peerOneTimeKey)
      sharedSecrets.push(dh3)
      usedPreKeyId = peerKeys.oneTimePreKey.id
    }

    // 组合共享密钥并派生根密钥
    const combinedSecret = concatArrayBuffers(...sharedSecrets)
    const salt = generateRandomBytes(32)
    const saltArrayBuffer = new ArrayBuffer(salt.byteLength)
    new Uint8Array(saltArrayBuffer).set(salt)
    const rootKey = await hkdf(
      combinedSecret,
      saltArrayBuffer,
      'E2EE-Root-Key',
      32
    )

    // 创建会话
    const session: Session = {
      peerUserId: peerKeys.userId,
      rootKey: arrayBufferToBase64(rootKey),
      sendCounter: 0,
      recvCounter: 0,
      peerIdentityKey: peerKeys.identityKey,
      peerSignedPreKey: peerKeys.signedPreKey,
      usedPreKeyId: usedPreKeyId as unknown as string,
      establishedAt: new Date(),
      lastUsedAt: new Date()
    }

    await this.storage.saveSession(session)

    // 检查是否为新的可信对等方
    const trustedPeer = await this.storage.getTrustedPeer(peerKeys.userId)
    const isNewTrust = !trustedPeer

    if (isNewTrust) {
      // 保存为可信对等方（TOFU）
      const newTrustedPeer: TrustedPeer = {
        userId: peerKeys.userId,
        fingerprint: await calculateFingerprint(peerIdentityKey),
        trustedAt: new Date()
      }
      await this.storage.saveTrustedPeer(newTrustedPeer)
    }

    return {
      session,
      fingerprint: await calculateFingerprint(peerIdentityKey),
      isNewTrust
    }
  }

  /**
   * 获取或建立会话
   */
  async getOrEstablishSession(peerKeys: PeerKeys): Promise<Session> {
    // 检查是否已有会话
    const existingSession = await this.storage.getSession(peerKeys.userId)
    if (existingSession) {
      return existingSession
    }

    // 建立新会话
    const result = await this.establishSession(peerKeys)
    return result.session
  }

  /**
   * 验证对等方指纹
   */
  async verifyPeerFingerprint(userId: string, expectedFingerprint: string): Promise<boolean> {
    const trustedPeer = await this.storage.getTrustedPeer(userId)
    if (!trustedPeer) {
      return false
    }

    const isValid = trustedPeer.fingerprint === expectedFingerprint
    if (isValid) {
      await this.storage.updateTrustedPeerVerification(userId)
    }

    return isValid
  }

  /**
   * 更新会话计数器
   */
  async updateSessionCounters(peerUserId: string, sendCounter?: number, recvCounter?: number): Promise<void> {
    if (isIndexedDBSupported()) {
      await e2eeStorage.updateSessionWithRootKey(peerUserId, sendCounter, recvCounter)
    } else {
      const updates: Partial<Session> = {}
      
      if (sendCounter !== undefined) {
        updates.sendCounter = sendCounter
      }
      
      if (recvCounter !== undefined) {
        updates.recvCounter = recvCounter
      }

      await this.storage.updateSession(peerUserId, updates)
    }
  }

  /**
   * 获取会话
   */
  async getSession(peerUserId: string): Promise<Session | null> {
    return await this.storage.getSession(peerUserId)
  }

  /**
   * 删除会话
   */
  async deleteSession(peerUserId: string): Promise<void> {
    // 注意：这里需要在存储层添加删除方法
    // 暂时通过更新为无效状态来实现
    await this.storage.updateSession(peerUserId, {
      rootKey: '',
      sendCounter: -1,
      recvCounter: -1
    })
  }

  /**
   * 获取所有会话
   */
  async getAllSessions(): Promise<Session[]> {
    return await this.storage.getAllSessions()
  }

  /**
   * 清理过期会话
   */
  async cleanupExpiredSessions(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
    const sessions = await this.storage.getAllSessions()
    const cutoff = Date.now() - maxAge

    for (const session of sessions) {
      if (session.lastUsedAt.getTime() < cutoff) {
        await this.deleteSession(session.peerUserId)
      }
    }
  }

  /**
   * 获取身份密钥信息（用于上传到服务器）
   */
  async getIdentityKeyInfo(): Promise<{ publicKey: JsonWebKey; fingerprint: string } | null> {
    const identityKey = await this.storage.getIdentityKey()
    if (!identityKey) {
      return null
    }

    return {
      publicKey: identityKey.publicKey,
      fingerprint: identityKey.fingerprint
    }
  }

  /**
   * 获取预共享密钥（用于上传到服务器）
   */
  async getPreKeysForUpload(count: number = 100): Promise<Array<{ id: string; publicKey: JsonWebKey }>> {
    const preKeys = await this.storage.getPreKeys(count)
    return preKeys
      .filter(pk => !pk.used)
      .map(pk => ({
        id: pk.id,
        publicKey: pk.publicKey
      }))
  }

  /**
   * 标记预共享密钥为已使用
   */
  async markPreKeyAsUsed(id: string): Promise<void> {
    await this.storage.markPreKeyAsUsed(id)
  }

  /**
   * 重置所有数据（用于测试）
   */
  async reset(): Promise<void> {
    if (isIndexedDBSupported()) {
      await e2eeStorage.clearAll()
    } else {
      // 清理 localStorage
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('e2ee_')) {
          localStorage.removeItem(key)
        }
      })
    }
  }
}

// 导出单例实例
export const e2eeSessionManager = new E2EESessionManager()
