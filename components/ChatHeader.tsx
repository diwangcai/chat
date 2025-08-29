'use client'

import { motion } from 'framer-motion'
import { Phone, Video, MoreVertical, ChevronLeft } from 'lucide-react'
import { Conversation } from '@/types/chat'

import { EncryptionIndicator } from './EncryptionStatus'

interface ChatHeaderProps {
  conversation?: Conversation
  onBack?: () => void
  isEncryptionEnabled?: boolean
  isEncryptionEstablishing?: boolean
  typingText?: string
  onStartCall?: () => void
  onStartVideo?: () => void
  onOpenInfo?: () => void
  onInfo?: () => void
  onMenu?: () => void
}

export default function ChatHeader({ 
  conversation, 
  onBack, 
  isEncryptionEnabled = false,
  isEncryptionEstablishing = false,
  typingText,
  onStartCall,
  onStartVideo,
  onOpenInfo
}: ChatHeaderProps) {
  const others = conversation?.participants.filter(p => p.id !== '1') || []
  const otherParticipant = others[0]
  const isGroup = conversation?.isGroup || false

  const renderAvatar = () => {
    if (!isGroup) {
      return (
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium">
            {otherParticipant?.name?.charAt(0) || 'U'}
          </div>
          {otherParticipant?.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>
      )
    }
    return (
      <div className="flex -space-x-2">
        {others.slice(0, 3).map((m) => (
          <div key={m.id} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white">
            {m.name?.charAt(0) || 'U'}
          </div>
        ))}
      </div>
    )
  }

  const subtitle = isGroup
    ? `${others.length} 人`
    : typingText || (otherParticipant?.isOnline ? '在线' : '离线')

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect border-b border-gray-200/50 px-4 py-3 safe-area-inset-top"
      data-testid="chat-header"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="icon-btn touch-feedback"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          
          <div className="flex items-center space-x-3">
            {renderAvatar()}
            
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-semibold text-gray-900">
                  {conversation?.isGroup ? conversation.groupName : otherParticipant?.name}
                </h1>
                <EncryptionIndicator 
                  isEnabled={isEncryptionEnabled}
                  isEstablishing={isEncryptionEstablishing}
                />
              </div>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button className="icon-btn touch-feedback" onClick={onStartCall}>
            <Phone className="w-5 h-5" />
          </button>
          <button className="icon-btn touch-feedback" onClick={onStartVideo}>
            <Video className="w-5 h-5" />
          </button>
          <button className="icon-btn touch-feedback" onClick={onOpenInfo}>
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
