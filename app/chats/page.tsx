'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// import { MessageCircle, Users, Compass } from 'lucide-react'
import MessageList, { MessageListHandle } from '@/components/MessageList'
import MessageInput from '@/components/MessageInput'
import EmojiPanel from '@/components/EmojiPanel'
import ConversationList from '@/components/ConversationList'
import FriendList from '@/components/FriendList'
import ChatHeader from '@/components/ChatHeader'
import InfoDrawer from '@/components/InfoDrawer'
import ImageViewer from '@/components/ImageViewer'
import { Message, Conversation, User } from '@/types/chat'

export default function ChatPage() {
  // 状态管理
  const [activeId, setActiveId] = useState('')
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts' | 'explore'>('chats')
  const [showSidebar, setShowSidebar] = useState(false)
  const [showEmojiPanel, setShowEmojiPanel] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isSending, setIsSending] = useState(false)

  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messageListRef = useRef<MessageListHandle>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // 当前用户
  const currentUser: User = {
    id: '1',
    name: '我',
    avatar: '/avatars/user1.jpg',
    isOnline: true
  }

  // 当前对话
  const currentConversation = conversations.find(c => c.id === activeId)

  // 加密状态管理
  const [isEncryptionEnabled, _setIsEncryptionEnabled] = useState(false)
  const [isEncryptionEstablishing, _setIsEncryptionEstablishing] = useState(false)

  // 加载持久化消息或初始化
  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedMessages = localStorage.getItem(`messages:${activeId}`)
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages)
      const messagesWithDate = parsedMessages.map((_msg: Message) => ({
        ..._msg,
        timestamp: new Date(_msg.timestamp)
      }))
      setMessages(messagesWithDate)
    } else {
      const initialMessages: Message[] = [
        {
          id: '1',
          content: '你好！',
          type: 'text',
          senderId: '2',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          status: 'sent'
        },
        {
          id: '2',
          content: '苹果级体验真的很丝滑',
          type: 'text',
          senderId: '2',
          timestamp: new Date('2024-01-01T10:02:00Z'),
          status: 'sent'
        },
        {
          id: '3',
          content: '是的，这个设计很棒！',
          type: 'text',
          senderId: '1',
          timestamp: new Date('2024-01-01T10:04:00Z'),
          status: 'sent'
        }
      ]
      setMessages(initialMessages)
    }
  }, [activeId])

  // 保存消息到本地存储
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (messages.length > 0) {
      localStorage.setItem(`messages:${activeId}`, JSON.stringify(messages))
    }
  }, [messages, activeId])

  // 初始化对话列表
  useEffect(() => {
    const initialConversations: Conversation[] = [
      {
        id: '1',
        participants: [
          { id: '1', name: '我', isOnline: true },
          { id: '2', name: '张三', isOnline: true }
        ],
        unreadCount: 0,
        isGroup: false,
        pinned: false,
        lastMessagePreview: '是的，这个设计很棒！',
        updatedAt: '2024-01-01T10:04:00Z'
      },
      {
        id: '2',
        participants: [
          { id: '1', name: '我', isOnline: true },
          { id: '3', name: '李四', isOnline: false }
        ],
        unreadCount: 2,
        isGroup: false,
        pinned: true,
        lastMessagePreview: '好的，明天见',
        updatedAt: '2023-12-31T10:00:00Z'
      }
    ]
    setConversations(initialConversations)
  }, [])

  // 发送消息
  const handleSendMessage = async (content: string, type: 'text' | 'image' = 'text') => {
    if (isSending) return // 防止重复发送
    
    setIsSending(true)
    const tempId = `temp_${Date.now()}`
    const newMessage: Message = {
      id: tempId,
      content,
      type,
      senderId: currentUser.id,
      timestamp: new Date(),
      status: 'sending'
    }
    
    // 立即显示消息
    setMessages(prev => [...prev, newMessage])
    setInputValue('')
    requestAnimationFrame(() => messageListRef.current?.scrollToBottom())
    
    try {
      // 模拟发送过程
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 更新为已发送状态
      const finalId = `msg_${Date.now()}`
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, id: finalId, status: 'sent' }
            : msg
        )
      )
      
      // 模拟送达
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === finalId 
              ? { ...msg, status: 'delivered' }
              : msg
          )
        )
      }, 2000)
      
      // 模拟已读
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === finalId 
              ? { ...msg, status: 'read' }
              : msg
          )
        )
      }, 4000)
      
    } catch (error) {
      // 发送失败处理
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, status: 'failed' }
            : msg
        )
      )
    } finally {
      setIsSending(false)
    }
  }

  const handleSelectFriend = (friendId: string) => {
    const friendConversation: Conversation = {
      id: `friend-${friendId}`,
      participants: [
        currentUser,
        { id: friendId, name: `用户${friendId}`, isOnline: true }
      ],
      unreadCount: 0,
      isGroup: false,
      pinned: false,
      lastMessagePreview: '',
      updatedAt: new Date().toISOString()
    }
    
    setConversations(prev => [friendConversation, ...prev])
    setActiveId(`friend-${friendId}`)
    setShowSidebar(false)
  }

  const handleImageSelect = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      handleSendMessage(imageUrl, 'image')
    }
    reader.readAsDataURL(file)
  }

  const handleFileSelect = useCallback((file: File) => {
    console.log('File selected:', file.name)
  }, [])

  const retryUpload = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: 'sending' } : m
    ))
  }

  const togglePin = (id: string, pinned: boolean) => setConversations(prev => prev.map(c => c.id === id ? { ...c, pinned } : c))
  const toggleMute = (id: string, muted: boolean) => setConversations(prev => prev.map(c => c.id === id ? { ...c, muted } : c))

  return (
    <div className="app h-screen-mobile">
      <div className="responsive-container">
        <div className="responsive-grid">
          {/* 侧边栏 - 响应式显示 */}
          <aside className={`sidebar-responsive ${showSidebar ? 'open' : ''} md:block`}>
            <div className="h-full bg-bg-secondary border-r border-border">
              {/* 标签切换 */}
              <div className="flex border-b border-border-light">
                <button
                  onClick={() => setActiveTab('chats')}
                  className={`flex-1 py-3 text-center font-medium transition-colors ${
                    activeTab === 'chats'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-text-tertiary'
                  }`}
                >
                  聊天
                </button>
                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`flex-1 py-3 text-center font-medium transition-colors ${
                    activeTab === 'contacts'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-text-tertiary'
                  }`}
                >
                  联系人
                </button>
                <button
                  onClick={() => setActiveTab('explore')}
                  className={`flex-1 py-3 text-center font-medium transition-colors ${
                    activeTab === 'explore'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-text-tertiary'
                  }`}
                >
                  探索
                </button>
              </div>

              {/* 内容区域 */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'chats' && (
                  <ConversationList 
                    conversations={conversations} 
                    currentUserId={currentUser.id} 
                    onSelect={(id) => { 
                      setActiveId(id); 
                      setInfoOpen(false);
                      setShowSidebar(false);
                    }} 
                  />
                )}
                {activeTab === 'contacts' && (
                  <FriendList
                    currentUserId={currentUser.id}
                    onSelectFriend={handleSelectFriend}
                  />
                )}
                {activeTab === 'explore' && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-6xl mb-4">👑</div>
                      <h2 className="text-xl font-semibold text-text-primary mb-2">探索功能</h2>
                      <p className="text-text-secondary mb-4">暂未开启，等待帝王才开发</p>
                      <div className="text-sm text-text-tertiary">敬请期待...</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* 主内容区 */}
          <main className="flex flex-col h-full">
            {activeId ? (
              // 聊天界面
              <>
                <header className="header safe-area-inset-top">
                  <ChatHeader
                    conversation={currentConversation || undefined}
                    currentUserId={currentUser.id}
                    onBack={() => setActiveId('')}
                    onInfo={() => setInfoOpen(true)}
                    onMenu={() => setShowSidebar(true)}
                    isEncryptionEnabled={isEncryptionEnabled}
                    isEncryptionEstablishing={isEncryptionEstablishing}
                  />
                </header>

                <div className="flex-1 flex flex-col">
                  {/* 消息列表 */}
                  <div ref={messagesContainerRef} className="messages scrollbar-hide flex-1">
                    <MessageList
                      ref={messageListRef}
                      messages={messages}
                      currentUserId={currentUser.id}
                      currentUser={currentUser}
                      currentConversation={currentConversation || undefined}
                      onImageClick={setSelectedImage}
                      onReply={(id) => setReplyTo(id)}
                      onDelete={(id) => setMessages(prev => prev.filter(m => m.id !== id))}
                      onToggleStar={(id) => setMessages(prev => prev.map(m => m.id === id ? { ...m, starred: !m.starred } : m))}
                      onRetry={(id) => retryUpload(id)}
                    />
                  </div>

                  {/* 输入区域 */}
                  <footer className="footer input-area safe-area-inset-bottom">
                    {replyTo && (
                      <div className="px-4 py-2 text-xs text-text-secondary flex items-center justify-between border-b border-border-light">
                        <div>回复 · #{replyTo}</div>
                        <button className="text-primary-600" onClick={() => setReplyTo(null)}>取消</button>
                      </div>
                    )}
                    <MessageInput 
                      ref={inputRef}
                      value={inputValue} 
                      onChange={setInputValue} 
                      onSend={handleSendMessage} 
                      onEmojiClick={() => setShowEmojiPanel(!showEmojiPanel)} 
                      onPlusClick={() => setShowEmojiPanel(!showEmojiPanel)}
                      disabled={isEncryptionEstablishing}
                      isSending={isSending}
                    />
                  </footer>
                </div>
              </>
            ) : (
              // 主界面（显示侧边栏内容）
              <div className="flex-1 flex flex-col">
                {/* 头部 */}
                <header className="header safe-area-inset-top">
                  <div className="flex items-center justify-between px-4 py-3">
                    <h1 className="text-lg font-semibold text-text-primary">
                      {activeTab === 'chats' && '聊天'}
                      {activeTab === 'contacts' && '联系人'}
                      {activeTab === 'explore' && '探索'}
                    </h1>
                    <button
                      onClick={() => setShowSidebar(true)}
                      className="md:hidden icon-btn"
                      aria-label="打开菜单"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </header>

                {/* 主内容区 */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === 'chats' && (
                    <ConversationList
                      conversations={conversations}
                      currentUserId={currentUser.id}
                      onSelect={(id: string) => setActiveId(id)}
                    />
                  )}
                  
                  {activeTab === 'contacts' && (
                    <FriendList
                      currentUserId={currentUser.id}
                      onSelectFriend={handleSelectFriend}
                    />
                  )}
                  
                  {activeTab === 'explore' && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-6xl mb-4">👑</div>
                        <h2 className="text-xl font-semibold text-text-primary mb-2">探索功能</h2>
                        <p className="text-text-secondary mb-4">暂未开启，等待帝王才开发</p>
                        <div className="text-sm text-text-tertiary">敬请期待...</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 移动端遮罩层 */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* 表情面板 */}
      <AnimatePresence>
        {showEmojiPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setShowEmojiPanel(false)}
            />
            <EmojiPanel
              onEmojiSelect={(emoji) => {
                setInputValue(prev => prev + emoji)
                setShowEmojiPanel(false)
              }}
              onFileSelect={handleFileSelect}
              onImageSelect={handleImageSelect}
              isOpen={showEmojiPanel}
              onClose={() => setShowEmojiPanel(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* 信息抽屉 */}
      <InfoDrawer
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        conversation={currentConversation}
        currentUserId={currentUser.id}
        onTogglePin={togglePin}
        onToggleMute={toggleMute}
      />

      {/* 图片查看器 */}
      <AnimatePresence>
        {selectedImage && (
          <ImageViewer
            imageUrl={selectedImage} 
            onClose={() => setSelectedImage(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}