/**
 * Telegram 风格的端到端加密管理器
 * 提供简洁的API和自动化的密钥管理
 */

import { generateRandomBytes, aesGcmEncrypt, aesGcmDecrypt, arrayBufferToBase64, base64ToArrayBuffer } from './crypto'

export interface EncryptionSession {
  id: string
  participants: string[]
  sharedKey: ArrayBuffer
  createdAt: Date
  lastActivity: Date
  messageCount: number
  isActive: boolean
}

export interface EncryptedMessage {
  sessionId: string
  ciphertext: string
  iv: string
  timestamp: number
  messageId: string
  senderId: string
}

export interface EncryptionStatus {
  isEnabled: boolean
  isEstablishing: boolean
  sessionId?: string
  error?: string
  lastActivity?: Date
}

class EncryptionManager {
  private sessions = new Map<string, EncryptionSession>()
  private status: EncryptionStatus = {
    isEnabled: false,
    isEstablishing: false
  }
  private listeners: Set<(status: EncryptionStatus) => void> = new Set()

  /**
   * 启用端到端加密
   */
  async enable(participants: string[]): Promise<string> {
    try {
      this.updateStatus({ isEstablishing: true, error: undefined as unknown as string })
      
      // 生成会话ID
      const sessionId = this.generateSessionId()
      
      // 生成共享密钥 (简化版，实际应该使用ECDH)
      const sharedKey = await this.generateSharedKey()
      
      // 创建会话
      const session: EncryptionSession = {
        id: sessionId,
        participants,
        sharedKey,
        createdAt: new Date(),
        lastActivity: new Date(),
        messageCount: 0,
        isActive: true
      }
      
      this.sessions.set(sessionId, session)
      this.updateStatus({
        isEnabled: true,
        isEstablishing: false,
        sessionId,
        lastActivity: new Date()
      })
      
      console.log('🔐 端到端加密已启用')
      return sessionId
    } catch (error) {
      this.updateStatus({
        isEstablishing: false,
        error: error instanceof Error ? error.message : '启用加密失败'
      })
      throw error
    }
  }

  /**
   * 禁用端到端加密
   */
  disable(): void {
    this.sessions.clear()
    this.updateStatus({
      isEnabled: false,
      isEstablishing: false,
      sessionId: undefined as unknown as string,
      error: undefined as unknown as string
    })
    console.log('🔓 端到端加密已禁用')
  }

  /**
   * 加密消息
   */
  async encryptMessage(sessionId: string, plaintext: string, senderId: string): Promise<EncryptedMessage> {
    const session = this.sessions.get(sessionId)
    if (!session || !session.isActive) {
      throw new Error('加密会话不存在或已失效')
    }

    try {
      // 生成随机IV
      const iv = generateRandomBytes(12)
      
      // 加密消息
      const plaintextBytes = new TextEncoder().encode(plaintext)
      const ciphertext = await aesGcmEncrypt(session.sharedKey, plaintextBytes, iv)
      
      // 更新会话状态
      session.messageCount++
      session.lastActivity = new Date()
      
      const encryptedMessage: EncryptedMessage = {
        sessionId,
        ciphertext: arrayBufferToBase64(ciphertext.buffer.slice(ciphertext.byteOffset, ciphertext.byteOffset + ciphertext.byteLength)),
        iv: arrayBufferToBase64(iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength)),
        timestamp: Date.now(),
        messageId: this.generateMessageId(),
        senderId
      }
      
      return encryptedMessage
    } catch (error) {
      throw new Error(`消息加密失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 解密消息
   */
  async decryptMessage(encryptedMessage: EncryptedMessage): Promise<string> {
    const session = this.sessions.get(encryptedMessage.sessionId)
    if (!session || !session.isActive) {
      throw new Error('加密会话不存在或已失效')
    }

    try {
      // 解密消息
      const ciphertext = base64ToArrayBuffer(encryptedMessage.ciphertext)
      const iv = base64ToArrayBuffer(encryptedMessage.iv)
      
      const plaintext = await aesGcmDecrypt(session.sharedKey, new Uint8Array(ciphertext), new Uint8Array(iv))
      
      // 更新会话状态
      session.lastActivity = new Date()
      
      return new TextDecoder().decode(plaintext)
    } catch (error) {
      throw new Error(`消息解密失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 获取加密状态
   */
  getStatus(): EncryptionStatus {
    return { ...this.status }
  }

  /**
   * 订阅状态变化
   */
  subscribe(listener: (status: EncryptionStatus) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * 检查消息是否加密
   */
  isEncryptedMessage(message: any): boolean {
    return message && 
           typeof message === 'object' && 
           message.sessionId && 
           message.ciphertext && 
           message.iv
  }

  /**
   * 获取活跃会话
   */
  getActiveSessions(): EncryptionSession[] {
    return Array.from(this.sessions.values()).filter(session => session.isActive)
  }

  /**
   * 清理过期会话
   */
  cleanupExpiredSessions(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now()
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity.getTime() > maxAge) {
        session.isActive = false
        console.log('🗑️ 清理过期会话')
      }
    }
  }

  // 私有方法

  private updateStatus(updates: Partial<EncryptionStatus>): void {
    this.status = { ...this.status, ...updates }
    this.listeners.forEach(listener => listener(this.status))
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async generateSharedKey(): Promise<ArrayBuffer> {
    // 简化版：生成随机密钥
    // 实际应该使用ECDH密钥协商
    const keyBytes = generateRandomBytes(32)
    // 拷贝到新的 ArrayBuffer，避免 SharedArrayBuffer 类型兼容问题
    const copy = new Uint8Array(keyBytes.length)
    copy.set(keyBytes)
    return copy.buffer
  }
}

// 单例实例
export const encryptionManager = new EncryptionManager()
