/**
 * E2EE 服务层
 * 提供高级API接口，集成会话管理和消息加密
 */

import { e2eeSessionManager } from './session'
import { e2eeMessageManager } from './message'
import type { EncryptedMessage, EncryptedMedia, DecryptionResult } from './message'
import type { PeerKeys, SessionEstablishmentResult } from './session'

export interface E2EEMessage {
  id: string
  senderId: string
  receiverId: string
  type: 'text' | 'image' | 'file'
  encryptedData: EncryptedMessage | EncryptedMedia
  timestamp: Date
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
}

export interface E2EEServiceConfig {
  currentUserId: string
  apiBaseUrl?: string
  enableLogging?: boolean
}

export class E2EEService {
  private config: E2EEServiceConfig
  private isInitialized = false

  constructor(config: E2EEServiceConfig) {
    this.config = {
      apiBaseUrl: '/api',
      enableLogging: false,
      ...config
    }
  }

  /**
   * 初始化E2EE服务
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      // 初始化身份密钥
      await e2eeSessionManager.initializeIdentity()
      
      // 生成预共享密钥
      await e2eeSessionManager.generatePreKeys(50)
      
      // 上传密钥到服务器
      await this.uploadKeysToServer()
      
      this.isInitialized = true
      this.log('E2EE service initialized successfully')
    } catch (error) {
      this.log('Failed to initialize E2EE service:', error)
      throw error
    }
  }

  /**
   * 上传密钥到服务器
   */
  private async uploadKeysToServer(): Promise<void> {
    try {
      const identityKeyInfo = await e2eeSessionManager.getIdentityKeyInfo()
      const preKeys = await e2eeSessionManager.getPreKeysForUpload(50)

      if (!identityKeyInfo) {
        throw new Error('Identity key not found')
      }

      // 生成签名预共享密钥
      const signedPreKeyPair = await e2eeSessionManager.generatePreKeys(1)
      const signedPreKey = signedPreKeyPair[0]!

      const payload = {
        userId: this.config.currentUserId,
        identityKey: identityKeyInfo.publicKey,
        signedPreKey: signedPreKey.publicKey,
        signedPreKeyId: signedPreKey.id,
        oneTimePreKeys: preKeys
      }

      const response = await fetch(`${this.config.apiBaseUrl}/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Failed to upload keys: ${response.statusText}`)
      }

      this.log('Keys uploaded to server successfully')
    } catch (error) {
      this.log('Failed to upload keys to server:', error)
      throw error
    }
  }

  /**
   * 建立与对等方的会话
   */
  async establishSession(peerUserId: string): Promise<SessionEstablishmentResult> {
    try {
      // 从服务器获取对等方密钥
      const peerKeys = await this.fetchPeerKeys(peerUserId)
      
      // 建立会话
      const result = await e2eeSessionManager.establishSession(peerKeys)
      
      this.log(`Session established with ${peerUserId}, fingerprint: ${result.fingerprint}`)
      
      return result
    } catch (error) {
      this.log(`Failed to establish session with ${peerUserId}:`, error)
      throw error
    }
  }

  /**
   * 从服务器获取对等方密钥
   */
  private async fetchPeerKeys(peerUserId: string): Promise<PeerKeys> {
    const response = await fetch(`${this.config.apiBaseUrl}/keys/${peerUserId}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch peer keys: ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      userId: data.userId,
      identityKey: data.identityKey,
      signedPreKey: data.signedPreKey,
      signedPreKeyId: data.signedPreKeyId,
      oneTimePreKey: data.oneTimePreKey
    }
  }

  /**
   * 加密并发送文本消息
   */
  async encryptAndSendText(peerUserId: string, plaintext: string): Promise<EncryptedMessage> {
    try {
      // 确保会话已建立
      await this.ensureSession(peerUserId)
      
      // 加密消息
      const encryptedMessage = await e2eeMessageManager.encryptText(peerUserId, plaintext)
      
      this.log(`Text message encrypted for ${peerUserId}`)
      
      return encryptedMessage
    } catch (error) {
      this.log(`Failed to encrypt text message for ${peerUserId}:`, error)
      throw error
    }
  }

  /**
   * 加密并发送媒体文件
   */
  async encryptAndSendMedia(peerUserId: string, file: File): Promise<EncryptedMedia> {
    try {
      // 确保会话已建立
      await this.ensureSession(peerUserId)
      
      // 加密媒体文件
      const encryptedMedia = await e2eeMessageManager.encryptMedia(peerUserId, file)
      
      this.log(`Media file encrypted for ${peerUserId}: ${file.name}`)
      
      return encryptedMedia
    } catch (error) {
      this.log(`Failed to encrypt media file for ${peerUserId}:`, error)
      throw error
    }
  }

  /**
   * 解密接收到的文本消息
   */
  async decryptTextMessage(peerUserId: string, encryptedMessage: EncryptedMessage): Promise<DecryptionResult> {
    try {
      const result = await e2eeMessageManager.decryptText(peerUserId, encryptedMessage)
      
      if (result.isValid) {
        this.log(`Text message decrypted from ${peerUserId}`)
      } else {
        this.log(`Failed to decrypt text message from ${peerUserId}: ${result.error}`)
      }
      
      return result
    } catch (error) {
      this.log(`Error decrypting text message from ${peerUserId}:`, error)
      return {
        plaintext: '',
        isValid: false,
        error: error instanceof Error ? error.message : 'Decryption error'
      }
    }
  }

  /**
   * 解密接收到的媒体文件
   */
  async decryptMediaMessage(peerUserId: string, encryptedMedia: EncryptedMedia): Promise<DecryptionResult> {
    try {
      const result = await e2eeMessageManager.decryptMedia(peerUserId, encryptedMedia)
      
      if (result.isValid) {
        this.log(`Media file decrypted from ${peerUserId}: ${encryptedMedia.metadata.name}`)
      } else {
        this.log(`Failed to decrypt media file from ${peerUserId}: ${result.error}`)
      }
      
      return result
    } catch (error) {
      this.log(`Error decrypting media file from ${peerUserId}:`, error)
      return {
        plaintext: new ArrayBuffer(0),
        isValid: false,
        error: error instanceof Error ? error.message : 'Media decryption error'
      }
    }
  }

  /**
   * 确保与对等方的会话已建立
   */
  private async ensureSession(peerUserId: string): Promise<void> {
    const session = await e2eeSessionManager.getSession(peerUserId)
    
    if (!session || session.rootKey.length === 0) {
      await this.establishSession(peerUserId)
    }
  }

  /**
   * 获取会话状态信息
   */
  async getSessionInfo(peerUserId: string) {
    return await e2eeMessageManager.getSessionInfo(peerUserId)
  }

  /**
   * 验证对等方指纹
   */
  async verifyPeerFingerprint(peerUserId: string, expectedFingerprint: string): Promise<boolean> {
    return await e2eeSessionManager.verifyPeerFingerprint(peerUserId, expectedFingerprint)
  }

  /**
   * 重新生成会话密钥
   */
  async rotateSessionKey(peerUserId: string): Promise<boolean> {
    return await e2eeMessageManager.rotateSessionKey(peerUserId)
  }

  /**
   * 获取当前用户的指纹
   */
  async getMyFingerprint(): Promise<string | null> {
    const identityKeyInfo = await e2eeSessionManager.getIdentityKeyInfo()
    return identityKeyInfo?.fingerprint || null
  }

  /**
   * 清理过期数据
   */
  async cleanup(): Promise<void> {
    await e2eeSessionManager.cleanupExpiredSessions()
    // 清理过期的预共享密钥
    const { e2eeStorage } = await import('./storage')
    await e2eeStorage.cleanupExpiredPreKeys()
  }

  /**
   * 重置所有E2EE数据（用于测试）
   */
  async reset(): Promise<void> {
    await e2eeSessionManager.reset()
    this.isInitialized = false
  }

  /**
   * 日志记录
   */
  private log(...args: any[]): void {
    if (this.config.enableLogging) {
      console.log('[E2EE Service]', ...args)
    }
  }
}

// 创建全局E2EE服务实例
let globalE2EEService: E2EEService | null = null

export function createE2EEService(config: E2EEServiceConfig): E2EEService {
  if (!globalE2EEService) {
    globalE2EEService = new E2EEService(config)
  }
  return globalE2EEService
}

export function getE2EEService(): E2EEService | null {
  return globalE2EEService
}

export function resetE2EEService(): void {
  globalE2EEService = null
}
