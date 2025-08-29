/**
 * E2EE 状态显示组件
 * 展示端到端加密的详细状态信息
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  AlertCircle, 
  Key, 
  Users, 
  Lock, 
  Unlock,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react'

interface E2EEStatusProps {
  isInitialized: boolean
  isInitializing: boolean
  error: string | null
  myFingerprint: string | null
  onInitialize: () => Promise<void>
  onReset?: () => Promise<void>
  sessionInfo?: {
    peerUserId: string
    isEstablished: boolean
    sendCounter: number
    recvCounter: number
    establishedAt?: Date
  } | null
}

export default function E2EEStatus({
  isInitialized,
  isInitializing,
  error,
  myFingerprint,
  onInitialize,
  onReset,
  sessionInfo
}: E2EEStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onInitialize()
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusColor = () => {
    if (isInitializing) return 'text-yellow-500'
    if (isInitialized) return 'text-green-500'
    if (error) return 'text-red-500'
    return 'text-gray-400'
  }

  const getStatusIcon = () => {
    if (isInitializing) return <Shield className="w-4 h-4 text-yellow-500 animate-pulse" />
    if (isInitialized) return <ShieldCheck className="w-4 h-4 text-green-500" />
    if (error) return <ShieldX className="w-4 h-4 text-red-500" />
    return <Shield className="w-4 h-4 text-gray-400" />
  }

  const getStatusText = () => {
    if (isInitializing) return '正在初始化端到端加密...'
    if (isInitialized) return '端到端加密已启用'
    if (error) return '加密初始化失败'
    return '加密未初始化'
  }

  return (
    <div className="bg-white border-b border-gray-200">
      {/* 主状态栏 */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
              {myFingerprint && isInitialized && (
                <div className="text-xs text-gray-500 mt-1">
                  指纹: <code className="bg-gray-100 px-1 rounded">{myFingerprint.slice(0, 16)}...</code>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {error && (
              <span title={error}>
                <AlertCircle className="w-4 h-4 text-red-500 cursor-help" />
              </span>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center space-x-2 mt-2">
          <button
            onClick={handleRefresh}
            disabled={isInitializing || isRefreshing}
            className="flex items-center space-x-1 text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>重新初始化</span>
          </button>
          
          {onReset && isInitialized && (
            <button
              onClick={onReset}
              className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              重置加密
            </button>
          )}
        </div>
      </div>

      {/* 详细信息面板 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100 bg-gray-50"
          >
            <div className="px-4 py-3 space-y-3">
              {/* 加密算法信息 */}
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">加密算法: AES-GCM-256</span>
              </div>

              {/* 密钥协议 */}
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">密钥协议: X3DH-lite (ECDH P-256)</span>
              </div>

              {/* 会话状态 */}
              {sessionInfo && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">会话状态</span>
                  </div>
                  <div className="ml-6 space-y-1 text-xs text-gray-500">
                    <div>对等方: {sessionInfo.peerUserId}</div>
                    <div>状态: {sessionInfo.isEstablished ? '已建立' : '未建立'}</div>
                    <div>发送计数器: {sessionInfo.sendCounter}</div>
                    <div>接收计数器: {sessionInfo.recvCounter}</div>
                    {sessionInfo.establishedAt && (
                      <div>建立时间: {sessionInfo.establishedAt.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              )}

              {/* 安全特性 */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">安全特性</span>
                </div>
                <div className="ml-6 space-y-1 text-xs text-gray-500">
                  <div>• 前向保密 (Forward Secrecy)</div>
                  <div>• 消息完整性验证</div>
                  <div>• 重放攻击防护</div>
                  <div>• 密钥指纹验证</div>
                </div>
              </div>

              {/* 错误信息 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-2">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700">错误详情</span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
