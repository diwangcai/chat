'use client'

import { useEffect, useRef } from 'react'
import MessageItem from './MessageItem'
import { Message, User, Conversation } from '@/types/chat'

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  currentUser?: User
  currentConversation?: Conversation
  onImageClick: (imageUrl: string) => void
  onReply?: (messageId: string) => void
  onDelete?: (messageId: string) => void
  onToggleStar?: (messageId: string) => void
  onRetry?: (messageId: string) => void
}

export default function MessageList({ 
  messages, 
  currentUserId, 
  currentUser,
  currentConversation,
  onImageClick, 
  onReply, 
  onDelete, 
  onToggleStar, 
  onRetry 
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  // 分组消息（同一发送者的连续消息为一组）
  const groupedMessages = messages.reduce((groups, message, index) => {
    const prevMessage = messages[index - 1]
    const isNewGroup = !prevMessage || 
      prevMessage.senderId !== message.senderId ||
      new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 5 * 60 * 1000 // 5分钟间隔

    if (isNewGroup) {
      groups.push([message])
    } else {
      groups[groups.length - 1].push(message)
    }
    return groups
  }, [] as Message[][])

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {groupedMessages.map((group, groupIndex) => (
        <div key={group[0].id}>
          {group.map((message, messageIndex) => (
            <MessageItem
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
              isLastInGroup={messageIndex === group.length - 1}
              onImageClick={onImageClick}
              currentUserId={currentUserId}
              currentUser={currentUser}
              participants={currentConversation?.participants || []}
              isGroup={currentConversation?.isGroup || false}
              onReply={onReply}
              onDelete={onDelete}
              onToggleStar={onToggleStar}
              onRetry={onRetry}
            />
          ))}
        </div>
      ))}
      
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-4">💬</div>
            <p>开始聊天吧！</p>
          </div>
        </div>
      )}
    </div>
  )
}
