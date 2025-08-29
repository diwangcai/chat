/**
 * E2EE React Hook
 * 提供在组件中使用端到端加密的便捷接口
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { createE2EEService, getE2EEService, resetE2EEService, type E2EEServiceConfig } from '@/lib/e2ee/service'
import type { EncryptedMessage, EncryptedMedia, DecryptionResult } from '@/lib/e2ee/message'
import type { SessionEstablishmentResult } from '@/lib/e2ee/session'

export interface UseE2EEOptions {
  currentUserId: string
  enableLogging?: boolean
  autoInitialize?: boolean
}

export interface E2EEState {
  isInitialized: boolean
  isInitializing: boolean
  error: string | null
  myFingerprint: string | null
}

export interface E2EEActions {
  initialize: () => Promise<void>
  establishSession: (peerUserId: string) => Promise<SessionEstablishmentResult>
  encryptText: (peerUserId: string, plaintext: string) => Promise<EncryptedMessage>
  encryptMedia: (peerUserId: string, file: File) => Promise<EncryptedMedia>
  decryptText: (peerUserId: string, encryptedMessage: EncryptedMessage) => Promise<DecryptionResult>
  decryptMedia: (peerUserId: string, encryptedMedia: EncryptedMedia) => Promise<DecryptionResult>
  verifyFingerprint: (peerUserId: string, expectedFingerprint: string) => Promise<boolean>
  getSessionInfo: (peerUserId: string) => Promise<any>
  rotateSessionKey: (peerUserId: string) => Promise<boolean>
  reset: () => Promise<void>
}

export function useE2EE(options: UseE2EEOptions): [E2EEState, E2EEActions] {
  const { currentUserId, enableLogging = false, autoInitialize = true } = options
  
  const [state, setState] = useState<E2EEState>({
    isInitialized: false,
    isInitializing: false,
    error: null,
    myFingerprint: null
  })

  const serviceRef = useRef<ReturnType<typeof createE2EEService> | null>(null)

  // 初始化E2EE服务
  const initialize = useCallback(async () => {
    if (state.isInitialized || state.isInitializing) {
      return
    }

    setState(prev => ({ ...prev, isInitializing: true, error: null }))

    try {
      const config: E2EEServiceConfig = {
        currentUserId,
        enableLogging
      }

      const service = createE2EEService(config)
      serviceRef.current = service

      await service.initialize()

      // 获取用户指纹
      const fingerprint = await service.getMyFingerprint()

      setState(prev => ({
        ...prev,
        isInitialized: true,
        isInitializing: false,
        myFingerprint: fingerprint
      }))

      console.log('E2EE initialized successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize E2EE'
      setState(prev => ({
        ...prev,
        isInitializing: false,
        error: errorMessage
      }))
      console.error('E2EE initialization failed:', error)
    }
  }, [currentUserId, enableLogging, state.isInitialized, state.isInitializing])

  // 建立会话
  const establishSession = useCallback(async (peerUserId: string): Promise<SessionEstablishmentResult> => {
    if (!serviceRef.current) {
      throw new Error('E2EE service not initialized')
    }

    try {
      const result = await serviceRef.current.establishSession(peerUserId)
      return result
    } catch (error) {
      console.error(`Failed to establish session with ${peerUserId}:`, error)
      throw error
    }
  }, [])

  // 加密文本
  const encryptText = useCallback(async (peerUserId: string, plaintext: string): Promise<EncryptedMessage> => {
    if (!serviceRef.current) {
      throw new Error('E2EE service not initialized')
    }

    try {
      const encryptedMessage = await serviceRef.current.encryptAndSendText(peerUserId, plaintext)
      return encryptedMessage
    } catch (error) {
      console.error(`Failed to encrypt text for ${peerUserId}:`, error)
      throw error
    }
  }, [])

  // 加密媒体
  const encryptMedia = useCallback(async (peerUserId: string, file: File): Promise<EncryptedMedia> => {
    if (!serviceRef.current) {
      throw new Error('E2EE service not initialized')
    }

    try {
      const encryptedMedia = await serviceRef.current.encryptAndSendMedia(peerUserId, file)
      return encryptedMedia
    } catch (error) {
      console.error(`Failed to encrypt media for ${peerUserId}:`, error)
      throw error
    }
  }, [])

  // 解密文本
  const decryptText = useCallback(async (peerUserId: string, encryptedMessage: EncryptedMessage): Promise<DecryptionResult> => {
    if (!serviceRef.current) {
      return {
        plaintext: '',
        isValid: false,
        error: 'E2EE service not initialized'
      }
    }

    try {
      const result = await serviceRef.current.decryptTextMessage(peerUserId, encryptedMessage)
      return result
    } catch (error) {
      console.error(`Failed to decrypt text from ${peerUserId}:`, error)
      return {
        plaintext: '',
        isValid: false,
        error: error instanceof Error ? error.message : 'Decryption failed'
      }
    }
  }, [])

  // 解密媒体
  const decryptMedia = useCallback(async (peerUserId: string, encryptedMedia: EncryptedMedia): Promise<DecryptionResult> => {
    if (!serviceRef.current) {
      return {
        plaintext: new ArrayBuffer(0),
        isValid: false,
        error: 'E2EE service not initialized'
      }
    }

    try {
      const result = await serviceRef.current.decryptMediaMessage(peerUserId, encryptedMedia)
      return result
    } catch (error) {
      console.error(`Failed to decrypt media from ${peerUserId}:`, error)
      return {
        plaintext: new ArrayBuffer(0),
        isValid: false,
        error: error instanceof Error ? error.message : 'Media decryption failed'
      }
    }
  }, [])

  // 验证指纹
  const verifyFingerprint = useCallback(async (peerUserId: string, expectedFingerprint: string): Promise<boolean> => {
    if (!serviceRef.current) {
      return false
    }

    try {
      return await serviceRef.current.verifyPeerFingerprint(peerUserId, expectedFingerprint)
    } catch (error) {
      console.error(`Failed to verify fingerprint for ${peerUserId}:`, error)
      return false
    }
  }, [])

  // 获取会话信息
  const getSessionInfo = useCallback(async (peerUserId: string) => {
    if (!serviceRef.current) {
      return null
    }

    try {
      return await serviceRef.current.getSessionInfo(peerUserId)
    } catch (error) {
      console.error(`Failed to get session info for ${peerUserId}:`, error)
      return null
    }
  }, [])

  // 轮换会话密钥
  const rotateSessionKey = useCallback(async (peerUserId: string): Promise<boolean> => {
    if (!serviceRef.current) {
      return false
    }

    try {
      return await serviceRef.current.rotateSessionKey(peerUserId)
    } catch (error) {
      console.error(`Failed to rotate session key for ${peerUserId}:`, error)
      return false
    }
  }, [])

  // 重置E2EE
  const reset = useCallback(async () => {
    if (serviceRef.current) {
      try {
        await serviceRef.current.reset()
      } catch (error) {
        console.error('Failed to reset E2EE service:', error)
      }
    }

    resetE2EEService()
    serviceRef.current = null

    setState({
      isInitialized: false,
      isInitializing: false,
      error: null,
      myFingerprint: null
    })
  }, [])

  // 自动初始化
  useEffect(() => {
    if (autoInitialize && currentUserId && !state.isInitialized && !state.isInitializing) {
      initialize()
    }
  }, [autoInitialize, currentUserId, state.isInitialized, state.isInitializing, initialize])

  // 清理函数
  useEffect(() => {
    return () => {
      // 组件卸载时不重置服务，保持全局状态
    }
  }, [])

  const actions: E2EEActions = {
    initialize,
    establishSession,
    encryptText,
    encryptMedia,
    decryptText,
    decryptMedia,
    verifyFingerprint,
    getSessionInfo,
    rotateSessionKey,
    reset
  }

  return [state, actions]
}

// 便捷Hook：用于获取E2EE状态
export function useE2EEState() {
  const [state] = useE2EE({
    currentUserId: '1', // 默认用户ID
    autoInitialize: false
  })
  return state
}

// 便捷Hook：用于E2EE操作
export function useE2EEActions(currentUserId: string) {
  const [, actions] = useE2EE({
    currentUserId,
    autoInitialize: true
  })
  return actions
}
