/**
 * E2EE 消息加密解密模块
 * 实现文本和媒体消息的端到端加密
 */

import {
  deriveMessageKey,
  deriveMediaKey,
  aesGcmEncrypt,
  aesGcmDecrypt,
  base64ToArrayBuffer,
  arrayBufferToBase64,
  generateRandomBytes
} from './crypto'
import { e2eeSessionManager } from './session'
import type { Session } from './storage'

export interface EncryptedMessage {
  ciphertext: string // base64 encoded
  iv: string // base64 encoded
  counter: number
  algorithm: string
  sessionId?: string
}

export interface EncryptedMedia {
  ciphertext: Blob
  iv: string // base64 encoded
  counter: number
  algorithm: string
  metadata: {
    size: number
    type: string
    name: string
  }
}

export interface DecryptionResult {
  plaintext: string | ArrayBuffer
  isValid: boolean
  error?: string
}

export class E2EEMessageManager {
  /**
   * 加密文本消息
   */
  async encryptText(peerUserId: string, plaintext: string): Promise<EncryptedMessage> {
    const session = await e2eeSessionManager.getSession(peerUserId)
    if (!session) {
      throw new Error(`No session found for peer: ${peerUserId}`)
    }

    // 派生消息密钥
    const nextCounter = session.sendCounter + 1
    const messageKey = await deriveMessageKey(
      base64ToArrayBuffer(session.rootKey),
      nextCounter,
      'encrypt'
    )

    // 生成随机IV
    const iv = generateRandomBytes(12)

    // 加密消息
    const plaintextBytes = new TextEncoder().encode(plaintext)
    const ciphertext = await aesGcmEncrypt(messageKey, plaintextBytes, iv)

    // 更新会话计数器
    await e2eeSessionManager.updateSessionCounters(peerUserId, nextCounter)

    return {
      ciphertext: arrayBufferToBase64(ciphertext.buffer.slice(ciphertext.byteOffset, ciphertext.byteOffset + ciphertext.byteLength)),
      iv: arrayBufferToBase64(iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength)),
      counter: nextCounter,
      algorithm: 'AES-GCM-256'
    }
  }

  /**
   * 解密文本消息
   */
  async decryptText(peerUserId: string, encryptedMessage: EncryptedMessage): Promise<DecryptionResult> {
    try {
      const session = await e2eeSessionManager.getSession(peerUserId)
      if (!session) {
        return {
          plaintext: '',
          isValid: false,
          error: 'No session found'
        }
      }

      // 验证计数器
      if (encryptedMessage.counter <= session.recvCounter) {
        return {
          plaintext: '',
          isValid: false,
          error: 'Message counter too low (possible replay attack)'
        }
      }

      // 派生消息密钥
      const messageKey = await deriveMessageKey(
        base64ToArrayBuffer(session.rootKey),
        encryptedMessage.counter,
        'decrypt'
      )

      // 解密消息
      const ciphertext = base64ToArrayBuffer(encryptedMessage.ciphertext)
      const iv = base64ToArrayBuffer(encryptedMessage.iv)
      const plaintext = await aesGcmDecrypt(messageKey, new Uint8Array(ciphertext), new Uint8Array(iv))

      // 更新会话计数器
      await e2eeSessionManager.updateSessionCounters(peerUserId, undefined, encryptedMessage.counter)

      return {
        plaintext: new TextDecoder().decode(plaintext),
        isValid: true
      }
    } catch (error) {
      return {
        plaintext: '',
        isValid: false,
        error: error instanceof Error ? error.message : 'Decryption failed'
      }
    }
  }

  /**
   * 加密媒体文件
   */
  async encryptMedia(peerUserId: string, file: File): Promise<EncryptedMedia> {
    const session = await e2eeSessionManager.getSession(peerUserId)
    if (!session) {
      throw new Error(`No session found for peer: ${peerUserId}`)
    }

    // 派生媒体密钥
    const nextCounter = session.sendCounter + 1
    const mediaKey = await deriveMediaKey(
      base64ToArrayBuffer(session.rootKey),
      nextCounter
    )

    // 生成随机IV
    const iv = generateRandomBytes(12)

    // 读取文件内容
    const fileBuffer = await file.arrayBuffer()
    const fileBytes = new Uint8Array(fileBuffer)

    // 加密文件
    const ciphertext = await aesGcmEncrypt(mediaKey, fileBytes, iv)

    // 更新会话计数器
    await e2eeSessionManager.updateSessionCounters(peerUserId, nextCounter)

    const blobPart = new Uint8Array(ciphertext.length)
    blobPart.set(ciphertext)
    return {
      ciphertext: new Blob([blobPart], { type: 'application/octet-stream' }),
      iv: arrayBufferToBase64(iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength)),
      counter: nextCounter,
      algorithm: 'AES-GCM-256',
      metadata: {
        size: file.size,
        type: file.type,
        name: file.name
      }
    }
  }

  /**
   * 解密媒体文件
   */
  async decryptMedia(
    peerUserId: string,
    encryptedMedia: EncryptedMedia
  ): Promise<DecryptionResult> {
    try {
      const session = await e2eeSessionManager.getSession(peerUserId)
      if (!session) {
        return {
          plaintext: new ArrayBuffer(0),
          isValid: false,
          error: 'No session found'
        }
      }

      // 验证计数器
      if (encryptedMedia.counter <= session.recvCounter) {
        return {
          plaintext: new ArrayBuffer(0),
          isValid: false,
          error: 'Media counter too low (possible replay attack)'
        }
      }

      // 派生媒体密钥
      const mediaKey = await deriveMediaKey(
        base64ToArrayBuffer(session.rootKey),
        encryptedMedia.counter
      )

      // 读取加密的Blob
      const ciphertextBuffer = await encryptedMedia.ciphertext.arrayBuffer()
      const ciphertext = new Uint8Array(ciphertextBuffer)
      const iv = base64ToArrayBuffer(encryptedMedia.iv)

      // 解密文件
      const plaintext = await aesGcmDecrypt(mediaKey, ciphertext, new Uint8Array(iv))

      // 更新会话计数器
      await e2eeSessionManager.updateSessionCounters(peerUserId, undefined, encryptedMedia.counter)

      // 返回严格的 ArrayBuffer，避免 ArrayBufferLike/SharedArrayBuffer 类型不兼容
      const resultBuffer = new ArrayBuffer(plaintext.byteLength)
      new Uint8Array(resultBuffer).set(plaintext)
      return {
        plaintext: resultBuffer,
        isValid: true
      }
    } catch (error) {
      return {
        plaintext: new ArrayBuffer(0),
        isValid: false,
        error: error instanceof Error ? error.message : 'Media decryption failed'
      }
    }
  }

  /**
   * 批量加密消息（用于离线消息）
   */
  async encryptMessages(
    peerUserId: string,
    messages: string[]
  ): Promise<EncryptedMessage[]> {
    const session = await e2eeSessionManager.getSession(peerUserId)
    if (!session) {
      throw new Error(`No session found for peer: ${peerUserId}`)
    }

    const encryptedMessages: EncryptedMessage[] = []
    let currentCounter = session.sendCounter

    for (const message of messages) {
      currentCounter++
      const messageKey = await deriveMessageKey(
        base64ToArrayBuffer(session.rootKey),
        currentCounter,
        'encrypt'
      )

      const iv = generateRandomBytes(12)
      const plaintextBytes = new TextEncoder().encode(message)
      const ciphertext = await aesGcmEncrypt(messageKey, plaintextBytes, iv)

      encryptedMessages.push({
        ciphertext: arrayBufferToBase64(ciphertext.buffer.slice(ciphertext.byteOffset, ciphertext.byteOffset + ciphertext.byteLength)),
        iv: arrayBufferToBase64(iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength)),
        counter: currentCounter,
        algorithm: 'AES-GCM-256'
      })
    }

    // 更新会话计数器
    await e2eeSessionManager.updateSessionCounters(peerUserId, currentCounter)

    return encryptedMessages
  }

  /**
   * 验证消息完整性
   */
  async verifyMessageIntegrity(
    peerUserId: string,
    encryptedMessage: EncryptedMessage
  ): Promise<boolean> {
    try {
      const session = await e2eeSessionManager.getSession(peerUserId)
      if (!session) {
        return false
      }

      // 检查计数器
      if (encryptedMessage.counter <= session.recvCounter) {
        return false
      }

      // 检查算法
      if (encryptedMessage.algorithm !== 'AES-GCM-256') {
        return false
      }

      // 检查数据格式
      try {
        base64ToArrayBuffer(encryptedMessage.ciphertext)
        base64ToArrayBuffer(encryptedMessage.iv)
      } catch {
        return false
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * 获取会话状态信息
   */
  async getSessionInfo(peerUserId: string): Promise<{
    isEstablished: boolean
    sendCounter: number
    recvCounter: number
    establishedAt?: Date
    lastUsedAt?: Date
  } | null> {
    const session = await e2eeSessionManager.getSession(peerUserId)
    if (!session) {
      return null
    }

    return {
      isEstablished: session.rootKey.length > 0 && session.sendCounter >= 0,
      sendCounter: session.sendCounter,
      recvCounter: session.recvCounter,
      establishedAt: session.establishedAt,
      lastUsedAt: session.lastUsedAt
    }
  }

  /**
   * 重新生成会话密钥（用于密钥轮换）
   */
  async rotateSessionKey(peerUserId: string): Promise<boolean> {
    try {
      const session = await e2eeSessionManager.getSession(peerUserId)
      if (!session) {
        return false
      }

      // 生成新的根密钥
      const newRootKey = generateRandomBytes(32)
      
      // 更新会话
      await e2eeSessionManager.updateSessionCounters(peerUserId, 0, 0)
      // 使用存储层的专用方法更新根密钥
      const { e2eeStorage } = await import('./storage')
      await e2eeStorage.updateSessionWithRootKey(
        peerUserId,
        0,
        0,
        arrayBufferToBase64(newRootKey.buffer.slice(newRootKey.byteOffset, newRootKey.byteOffset + newRootKey.byteLength))
      )

      return true
    } catch {
      return false
    }
  }
}

// 导出单例实例
export const e2eeMessageManager = new E2EEMessageManager()

// 工具函数：将ArrayBuffer转换为Blob
export function arrayBufferToBlob(buffer: ArrayBuffer, type: string = 'application/octet-stream'): Blob {
  return new Blob([buffer], { type })
}

// 工具函数：将Blob转换为ArrayBuffer
export async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return await blob.arrayBuffer()
}

// 工具函数：创建媒体文件的Object URL
export function createMediaObjectURL(decryptedBuffer: ArrayBuffer, mimeType: string): string {
  const blob = new Blob([decryptedBuffer], { type: mimeType })
  return URL.createObjectURL(blob)
}

// 工具函数：释放Object URL
export function revokeMediaObjectURL(url: string): void {
  URL.revokeObjectURL(url)
}
