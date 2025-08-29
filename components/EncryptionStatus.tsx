/**
 * Telegram 风格的端到端加密状态组件
 * 提供简洁的UI和用户友好的交互
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Shield, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface EncryptionStatusProps {
  isEnabled: boolean
  isEstablishing: boolean
  error?: string
  onToggle?: () => void
  onEnable?: () => void
  onDisable?: () => void
  className?: string
}

export default function EncryptionStatus({
  isEnabled,
  isEstablishing,
  error,
  onToggle,
  className
}: EncryptionStatusProps) {
  const renderContent = () => {
    if (isEstablishing) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2 text-blue-600"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">正在建立加密连接...</span>
        </motion.div>
      )
    }

    if (error) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2 text-red-600"
        >
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">加密连接失败</span>
        </motion.div>
      )
    }

    if (isEnabled) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-2 text-green-600"
        >
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">端到端加密已启用</span>
        </motion.div>
      )
    }

    return (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onToggle}
        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <Shield className="w-4 h-4" />
        <span className="text-sm font-medium">启用端到端加密</span>
      </motion.button>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${isEnabled}-${isEstablishing}-${error}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex items-center justify-center px-3 py-2 rounded-lg border",
          isEnabled && !error && "bg-green-50 border-green-200",
          isEstablishing && "bg-blue-50 border-blue-200",
          error && "bg-red-50 border-red-200",
          !isEnabled && !isEstablishing && !error && "bg-gray-50 border-gray-200",
          className
        )}
        data-testid="encryption-status"
      >
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  )
}

// 简化版状态指示器 (用于聊天头部)
export function EncryptionIndicator({ isEnabled, isEstablishing }: { isEnabled: boolean; isEstablishing: boolean }) {
  return (
    <div className="flex items-center space-x-1">
      <AnimatePresence mode="wait">
        {isEnabled ? (
          <motion.div
            key="enabled"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center space-x-1 text-green-600"
          >
            <Lock className="w-3 h-3" />
            <span className="text-xs font-medium">加密</span>
          </motion.div>
        ) : isEstablishing ? (
          <motion.div
            key="establishing"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center space-x-1 text-blue-600"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-xs font-medium">连接中</span>
          </motion.div>
        ) : (
          <motion.div
            key="disabled"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center space-x-1 text-gray-400"
          >
            <Shield className="w-3 h-3" />
            <span className="text-xs font-medium">未加密</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
