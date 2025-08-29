/**
 * Telegram 风格的端到端加密 Hook
 * 提供简洁的API和自动化的状态管理
 */

import { useState, useEffect, useCallback } from 'react'
import { encryptionManager, EncryptionStatus, EncryptedMessage } from '@/lib/e2ee/manager'

export interface UseEncryptionOptions {
  participants?: string[]
  autoEnable?: boolean
}

export interface UseEncryptionReturn {
  // 状态
  isEnabled: boolean
  isEstablishing: boolean
  sessionId?: string
  error?: string
  lastActivity?: Date
  
  // 操作
  enable: () => Promise<void>
  disable: () => void
  
  // 消息处理
  encryptMessage: (plaintext: string, senderId: string) => Promise<EncryptedMessage>
  decryptMessage: (encryptedMessage: EncryptedMessage) => Promise<string>
  isEncryptedMessage: (message: any) => boolean
}

export function useEncryption(options: UseEncryptionOptions = {}): UseEncryptionReturn {
  const { participants = [], autoEnable = false } = options
  
  const [status, setStatus] = useState<EncryptionStatus>(encryptionManager.getStatus())

  // 订阅状态变化
  useEffect(() => {
    const unsubscribe = encryptionManager.subscribe(setStatus)
    return unsubscribe
  }, [])

  // 自动启用加密
  useEffect(() => {
    if (autoEnable && participants.length > 0 && !status.isEnabled && !status.isEstablishing) {
      enable()
    }
  }, [autoEnable, participants, status.isEnabled, status.isEstablishing])

  // 启用加密
  const enable = useCallback(async () => {
    if (participants.length === 0) {
      throw new Error('需要指定参与者才能启用加密')
    }
    
    try {
      await encryptionManager.enable(participants)
    } catch (error) {
      console.error('启用加密失败:', error)
      throw error
    }
  }, [participants])

  // 禁用加密
  const disable = useCallback(() => {
    encryptionManager.disable()
  }, [])

  // 加密消息
  const encryptMessage = useCallback(async (plaintext: string, senderId: string): Promise<EncryptedMessage> => {
    if (!status.isEnabled || !status.sessionId) {
      throw new Error('加密未启用')
    }
    
    return await encryptionManager.encryptMessage(status.sessionId, plaintext, senderId)
  }, [status.isEnabled, status.sessionId])

  // 解密消息
  const decryptMessage = useCallback(async (encryptedMessage: EncryptedMessage): Promise<string> => {
    return await encryptionManager.decryptMessage(encryptedMessage)
  }, [])

  // 检查消息是否加密
  const isEncryptedMessage = useCallback((message: any): boolean => {
    return encryptionManager.isEncryptedMessage(message)
  }, [])

  return {
    // 状态
    isEnabled: status.isEnabled,
    isEstablishing: status.isEstablishing,
    ...(status.sessionId !== undefined ? { sessionId: status.sessionId } : {}),
    ...(status.error !== undefined ? { error: status.error } : {}),
    ...(status.lastActivity !== undefined ? { lastActivity: status.lastActivity } : {}),
    
    // 操作
    enable,
    disable,
    
    // 消息处理
    encryptMessage,
    decryptMessage,
    isEncryptedMessage
  }
}
