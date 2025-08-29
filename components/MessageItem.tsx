'use client'

import { motion } from 'framer-motion'
import { Check, CheckCheck, Lock, Copy, Reply, Star, Trash2 } from 'lucide-react'
import { Message, User } from '@/types/chat'
import { formatMessageTime } from '@/utils/date'
import { cn } from '@/utils/cn'
import { encryptionManager } from '@/lib/e2ee/manager'
import { useState } from 'react'

interface MessageItemProps {
  message: Message
  isOwn: boolean
  isLastInGroup: boolean
  onImageClick: (imageUrl: string) => void
  currentUserId: string
  currentUser?: User
  participants?: User[]
  isGroup?: boolean
  onReply?: (messageId: string) => void
  onDelete?: (messageId: string) => void
  onToggleStar?: (messageId: string) => void
  onRetry?: (messageId: string) => void
}

export default function MessageItem({ 
  message, 
  isOwn, 
  isLastInGroup, 
  onImageClick, 
  currentUserId,
  currentUser,
  participants = [],
  isGroup = false,
  onReply, 
  onDelete, 
  onToggleStar, 
  onRetry 
}: MessageItemProps) {
  const [copied, setCopied] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null)

  // 获取发送者信息
  const sender = participants.find(p => p.id === message.senderId)
  const senderName = sender?.name || '未知用户'
  const isCurrentUser = message.senderId === currentUserId

  const renderStatus = () => {
    switch (message.status) {
      case 'sending':
        return (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
          </div>
        )
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      case 'failed':
        return <div className="w-3 h-3 bg-red-500 rounded-full" />
      default:
        return null
    }
  }

  const handleCopy = async () => {
    if (message.type !== 'text') return
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 800)
    } catch {}
  }

  const handleRetry = () => {
    try {
      onRetry?.(message.id)
    } catch (error) {
      console.error('Failed to retry message:', error)
    }
  }

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    try {
      const img = event.currentTarget
      const { naturalWidth, naturalHeight } = img
      setImageSize({ width: naturalWidth, height: naturalHeight })
    } catch (error) {
      console.error('Failed to load image:', error)
    }
  }

  const renderContent = () => {
    if (message.type === 'image') {
      return (
        <div className="relative cursor-pointer rounded-lg overflow-hidden max-w-xs" onClick={() => onImageClick(message.content)}>
          <img src={message.content} alt="消息图片" className="w-full h-auto object-cover" loading="lazy" onLoad={handleImageLoad} />
          {message.status === 'sending' && (
            <div className="absolute inset-0 bg-black/40 flex items-end">
              <div className="w-full h-1 bg-white/30">
                <div className="h-full bg-white" style={{ width: `${Math.max(5, message.uploadProgress ?? 0)}%` }} />
              </div>
            </div>
          )}
          {message.status === 'failed' && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <button className="px-3 py-1 bg-white/90 rounded text-xs" onClick={(e) => { e.stopPropagation(); handleRetry() }}>重试</button>
            </div>
          )}
        </div>
      )
    }

    // 检查是否是加密消息
    const isEncrypted = encryptionManager.isEncryptedMessage(message.content)
    if (isEncrypted) {
      return (
        <div className="flex items-center space-x-2 text-white/90">
          <Lock className="w-4 h-4" />
          <span className="text-sm">🔒 加密消息</span>
        </div>
      )
    }

    return (
      <div className="text-selection" onDoubleClick={handleCopy}>
        {message.replyTo && (
          <div className="mb-1 p-2 rounded-lg text-xs" style={{ background: 'rgba(0,0,0,.04)' }}>
            回复 · #{message.replyTo}
          </div>
        )}
        {message.content}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex mb-1",
        isOwn ? "justify-end" : "justify-start"
      )}
      onContextMenu={(e) => { e.preventDefault(); setMenuOpen(true) }}
      onPointerDown={(e) => {
        // 长按 500ms 打开
        if ((e as any).pointerType === 'touch') {
          const timer = setTimeout(() => setMenuOpen(true), 500)
          const clear = () => { clearTimeout(timer as any) }
          const target = e.currentTarget
          target.addEventListener('pointerup', clear, { once: true })
          target.addEventListener('pointercancel', clear, { once: true })
        }
      }}
    >
      <div className={cn(
        "flex flex-col max-w-[70%]",
        isOwn ? "items-end" : "items-start"
      )}>
        {/* 群聊时显示发送者姓名 */}
        {isGroup && !isOwn && (
          <div className="text-xs text-gray-500 mb-1 px-1">
            {isCurrentUser ? '我' : senderName}
          </div>
        )}
        
        <motion.div
          animate={copied ? { scale: 1.02 } : { scale: 1 }}
          transition={{ duration: 0.12 }}
          className={cn(
            "message-bubble",
            isOwn ? "sent" : "received"
          )}
        >
          {renderContent()}
        </motion.div>
        
        {isLastInGroup && (
          <div className={cn(
            "flex items-center space-x-1 mt-1 text-xs text-gray-500",
            isOwn ? "justify-end" : "justify-start"
          )}>
            <span>{formatMessageTime(message.timestamp)}</span>
            {isOwn && renderStatus()}
          </div>
        )}
      </div>

      {/* 菜单 */}
      {menuOpen && (
        <div className="absolute z-20 mt-8 bg-white rounded-xl shadow border p-1 flex" style={{ borderColor: 'var(--border)' }} onMouseLeave={() => setMenuOpen(false)}>
          <button className="icon-btn" onClick={() => { handleCopy(); setMenuOpen(false) }} title="复制"><Copy className="w-4 h-4" /></button>
          <button className="icon-btn" onClick={() => { onReply?.(message.id); setMenuOpen(false) }} title="回复"><Reply className="w-4 h-4" /></button>
          <button className="icon-btn" onClick={() => { onToggleStar?.(message.id); setMenuOpen(false) }} title="标星"><Star className={cn("w-4 h-4", message.starred && "text-yellow-500") } /></button>
          <button className="icon-btn" onClick={() => { onDelete?.(message.id); setMenuOpen(false) }} title="删除"><Trash2 className="w-4 h-4 text-red-500" /></button>
        </div>
      )}
    </motion.div>
  )
}
