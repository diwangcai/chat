'use client'

import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVirtualizer } from '@tanstack/react-virtual'
import MessageItem from './MessageItem'
import { Message } from '@/types/chat'
import { formatMessageTime, isSameDay, shouldGroupMessages } from '@/utils/date'

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  onImageClick: (imageUrl: string) => void
  onReply?: (messageId: string) => void
  onDelete?: (messageId: string) => void
  onToggleStar?: (messageId: string) => void
  onRetry?: (messageId: string) => void
}

export default function MessageList({ messages, currentUserId, onImageClick, onReply, onDelete, onToggleStar, onRetry }: MessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [isSticky, setIsSticky] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showUnreadIndicator, setShowUnreadIndicator] = useState(false)

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 5,
    measureElement: (el) => el?.getBoundingClientRect().height || 64,
  })

  // 找到第一条未读消息（非自己发送且未 read）
  const firstUnreadIndex = useMemo(() => {
    return messages.findIndex(m => m.senderId !== currentUserId && m.status !== 'read')
  }, [messages, currentUserId])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (parentRef.current) {
      parentRef.current.scrollTo({
        top: parentRef.current.scrollHeight,
        behavior
      })
    }
  }, [])

  const handleScroll = useCallback(() => {
    if (!parentRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = parentRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    const wasSticky = isSticky

    setIsSticky(isNearBottom)

    // 如果从粘底状态变为非粘底状态，且有新消息，显示未读提示
    if (wasSticky && !isNearBottom && unreadCount > 0) {
      setShowUnreadIndicator(true)
    }
  }, [isSticky, unreadCount])

  useEffect(() => {
    const scrollElement = parentRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll)
      return () => scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  useEffect(() => {
    if (isSticky) {
      scrollToBottom('auto')
      setUnreadCount(0)
      setShowUnreadIndicator(false)
    } else {
      // 如果不是粘底状态，新消息到来时增加未读数
      setUnreadCount(prev => prev + 1)
    }
  }, [messages.length, isSticky, scrollToBottom])

  const handleUnreadClick = useCallback(() => {
    scrollToBottom()
    setUnreadCount(0)
    setShowUnreadIndicator(false)
  }, [scrollToBottom])

  const renderMessageGroup = (message: Message, index: number) => {
    const prevMessage = index > 0 ? messages[index - 1] : null
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null

    const showDate = !prevMessage || !isSameDay(message.timestamp, prevMessage.timestamp)
    const isUnreadDivider = firstUnreadIndex >= 0 && index === firstUnreadIndex
    
    // 判断是否是分组中的最后一条消息（应该显示时间戳）
    const isLastInGroup = !nextMessage || 
      !shouldGroupMessages(
        nextMessage.timestamp, 
        message.timestamp, 
        nextMessage.senderId, 
        message.senderId
      )

    return (
      <div key={message.id}>
        {isUnreadDivider && (
          <div className="flex items-center my-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="mx-3 text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">未读消息</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        )}
        {showDate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center my-4"
          >
            <div className="bg-gray-200/50 px-3 py-1 rounded-full text-xs text-gray-600">
              {formatMessageTime(message.timestamp)}
            </div>
          </motion.div>
        )}

        <MessageItem
          message={message}
          isOwn={message.senderId === currentUserId}
          isLastInGroup={isLastInGroup}
          onImageClick={onImageClick}
          currentUserId={currentUserId}
          onReply={(id) => onReply?.(id)}
          onDelete={(id) => onDelete?.(id)}
          onToggleStar={(id) => onToggleStar?.(id)}
          onRetry={(id) => onRetry?.(id)}
        />
      </div>
    )
  }

  return (
    <div className="relative h-full overflow-hidden" data-testid="msg-list">
      <div
        ref={parentRef}
        className="h-full overflow-y-auto scrollbar-hide px-4 py-2"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          <AnimatePresence>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const message = messages[virtualRow.index]
              return (
                <div
                  key={virtualRow.key}
                  ref={virtualizer.measureElement}
                  data-index={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    style={{ height: '100%' }}
                  >
                    {message && renderMessageGroup(message, virtualRow.index)}
                  </motion.div>
                </div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* 未读消息提示 */}
      <AnimatePresence>
        {showUnreadIndicator && unreadCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
          >
            <button
              onClick={handleUnreadClick}
              className="bg-primary-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-primary-600 transition-colors text-sm font-medium"
            >
              {unreadCount} 条新消息
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 跳至首条未读 */}
      <AnimatePresence>
        {firstUnreadIndex >= 0 && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={() => virtualizer.scrollToIndex(firstUnreadIndex, { align: 'start' })}
            className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full shadow text-xs text-gray-700 border"
            style={{ borderColor: 'var(--border)' }}
          >
            跳至未读
          </motion.button>
        )}
      </AnimatePresence>

      {/* 滚动到底部按钮 */}
      <AnimatePresence>
        {!isSticky && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
