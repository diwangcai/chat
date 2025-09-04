'use client'

import { useRef, useMemo, useImperativeHandle, forwardRef, useLayoutEffect } from 'react'
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

export type MessageListHandle = {
  scrollToBottom: () => void
}

function MessageList(
{ 
  messages, 
  currentUserId, 
  currentUser,
  currentConversation,
  onImageClick, 
  onReply, 
  onDelete, 
  onToggleStar, 
  onRetry 
}: MessageListProps,
ref: React.Ref<MessageListHandle>
) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 暴露滚动到底部方法
  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      if (!containerRef.current) return
      // 下一帧再滚动，确保布局完成
      requestAnimationFrame(() => {
        if (!containerRef.current) return
        containerRef.current.scrollTop = containerRef.current.scrollHeight
      })
    }
  }), [])

  // 自动滚动到底部（消息变更）
  useLayoutEffect(() => {
    if (!containerRef.current) return
    containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [messages])

  // 分组消息（同一发送者的连续消息为一组）
  const groupedMessages = useMemo(() => {
    const groups: Message[][] = []
    let currentGroup: Message[] = []
    
    messages.forEach((message, index) => {
      const prevMessage = messages.at(index - 1)
      
      if (prevMessage && 
          prevMessage.senderId === message.senderId && 
          new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() < 5 * 60 * 1000) {
        currentGroup.push(message)
      } else {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup])
        }
        currentGroup = [message]
      }
    })
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup)
    }
    
    return groups
  }, [messages])

  const renderMessageGroup = (group: Message[], _groupIndex: number) => {
    if (group.length === 0) return null
    
    return (
      <div key={group[0]?.id || `group-${_groupIndex}`}>
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
    )
  }

  return (
    <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 scroll-smooth" data-testid="message-list">
      {groupedMessages.map((group, index) => renderMessageGroup(group, index))}
      
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

export default forwardRef<MessageListHandle, MessageListProps>(MessageList)
