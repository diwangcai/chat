'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatHeader from '@/components/ChatHeader'
import MessageList from '@/components/MessageList'
import MessageInput from '@/components/MessageInput'
import EmojiPicker from '@/components/EmojiPicker'
import ImageViewer from '@/components/ImageViewer'
import ConversationList from '@/components/ConversationList'
import FriendList from '@/components/FriendList'
import InfoDrawer from '@/components/InfoDrawer'
import { Message, User, Conversation } from '@/types/chat'
import EncryptionStatus from '@/components/EncryptionStatus'
import { useRouter } from 'next/navigation'

export default function ChatPage() {
  const isE2E = process.env.NEXT_PUBLIC_E2E === '1'
  const isAutomation = typeof navigator !== 'undefined' && (navigator as Navigator & { webdriver?: boolean }).webdriver === true
  const isRuntimeE2E = isE2E || isAutomation
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentUser, setCurrentUser] = useState<User>({ id: '1', name: '我', avatar: '/avatars/user1.jpg', isOnline: true })
  const [showSidebar, setShowSidebar] = useState(false)
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts' | 'explore'>('chats')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    try {
      const raw = localStorage.getItem('chat:user')
      if (raw) {
        const u = JSON.parse(raw)
        setCurrentUser({ id: u.id, name: u.name, isOnline: true, isAdmin: !!u.isAdmin })
      } else {
        if (isRuntimeE2E) {
          const u = { id: 'e2e-user', name: 'E2E用户', isAdmin: false }
          localStorage.setItem('chat:user', JSON.stringify(u))
          setCurrentUser({ id: u.id, name: u.name, isOnline: true, isAdmin: false })
        } else {
          // 未登录跳转
          router.replace('/')
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    }
  }, [isRuntimeE2E, router])

  const [conversations, setConversations] = useState<Conversation[]>([])
  useEffect(() => {
    // 构建基础会话
    const peer: Conversation = {
      id: '1',
      participants: [
        { ...currentUser },
        { id: '2', name: '张三', isOnline: true }
      ],
      unreadCount: 2,
      isGroup: false,
      pinned: false,
      lastMessagePreview: '苹果级体验真的很丝滑',
      updatedAt: new Date().toISOString()
    }

    const convs: Conversation[] = [peer]

    // 管理员群：仅管理员可见，并默认置顶
    if (currentUser.isAdmin) {
      const admins: User[] = [
        { id: '100', name: '管理员A', isOnline: true, isAdmin: true },
        { id: '101', name: '管理员B', isOnline: false, isAdmin: true },
        { ...currentUser }
      ]
      convs.push({
        id: 'admin-group',
        participants: admins,
        isGroup: true,
        groupName: '管理员聊天室',
        unreadCount: 0,
        muted: false,
        pinned: true,
        lastMessagePreview: '欢迎加入管理员群',
        updatedAt: new Date(Date.now() - 1000*60*30).toISOString()
      })
    }

    setConversations(convs)
  }, [currentUser])

  const [activeId, setActiveId] = useState<string>('1')
  const currentConversation = useMemo(() => conversations.find(c => c.id === activeId) || null, [conversations, activeId])

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [infoOpen, setInfoOpen] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  // 加密状态管理
  const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(() => {
    // 管理员聊天室默认启用加密
    return activeId === '1' || localStorage.getItem('chat:encryption:enabled') === 'true'
  })
  const [isEncryptionEstablishing, setIsEncryptionEstablishing] = useState(false)
  const [encryptionError, setEncryptionError] = useState<string | null>(null)

  const enableEncryption = () => {
    setIsEncryptionEstablishing(true)
    setTimeout(() => {
      setIsEncryptionEnabled(true)
      setIsEncryptionEstablishing(false)
      localStorage.setItem('chat:encryption:enabled', 'true')
    }, 1000)
  }

  const disableEncryption = () => {
    setIsEncryptionEnabled(false)
    localStorage.setItem('chat:encryption:enabled', 'false')
  }

  // 加载持久化消息或初始化
  useEffect(() => {
    const savedMessages = localStorage.getItem(`messages:${activeId}`)
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages)
      // 将timestamp字符串转换为Date对象
      const messagesWithDate = parsedMessages.map((_msg: any) => ({
        ..._msg,
        timestamp: new Date(_msg.timestamp)
      }))
      setMessages(messagesWithDate)
    } else {
      // 初始化一些示例消息
      const initialMessages: Message[] = [
        {
          id: '1',
          content: '你好！',
          type: 'text',
          senderId: '2',
          timestamp: new Date(Date.now() - 1000*60*5),
          status: 'sent'
        },
        {
          id: '2',
          content: '苹果级体验真的很丝滑',
          type: 'text',
          senderId: '2',
          timestamp: new Date(Date.now() - 1000*60*3),
          status: 'sent'
        },
        {
          id: '3',
          content: '确实很棒！',
          type: 'text',
          senderId: '1',
          timestamp: new Date(Date.now() - 1000*60*1),
          status: 'sent'
        }
      ]
      setMessages(initialMessages)
    }
  }, [activeId])

  // 保存消息到 localStorage
  useEffect(() => {
    if (messages.length > 0) {
      // 将Date对象转换为字符串以便存储
      const messagesForStorage = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
      localStorage.setItem(`messages:${activeId}`, JSON.stringify(messagesForStorage))
    }
  }, [messages, activeId])

  // 软键盘处理
  useEffect(() => {
    const handleResize = () => {
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          })
        }, 100)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSendMessage = (content: string, type: 'text' | 'image' = 'text') => {
    if (!content.trim()) return
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      type,
      senderId: currentUser.id,
      timestamp: new Date(),
      status: 'sending'
    }
    
    setMessages(prev => [...prev, newMessage])
    setInputValue('')
    
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      }
    }, 100)
  }

  const handleSelectFriend = (friendId: string) => {
    // 创建与好友的对话
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

  const retryUpload = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: 'sending' } : m
    ))
  }

  const togglePin = (id: string, pinned: boolean) => setConversations(prev => prev.map(c => c.id === id ? { ...c, pinned } : c))
  const toggleMute = (id: string, muted: boolean) => setConversations(prev => prev.map(c => c.id === id ? { ...c, muted } : c))

  return (
    <div className="app h-screen-mobile">
      {activeId ? (
        // 聊天界面
        <>
          <header className="header safe-area-inset-top">
            <ChatHeader
              conversation={currentConversation || undefined}
              onBack={() => setActiveId('')}
              onInfo={() => setInfoOpen(true)}
              onMenu={() => setShowSidebar(true)}
            />
          </header>

          <main className="main">
            {/* 加密状态 */}
            <div className="px-4 py-2 border-b" style={{ background: 'var(--color-bg)', borderColor: 'var(--border-color)' }}>
              <EncryptionStatus 
                isEnabled={isEncryptionEnabled}
                isEstablishing={isEncryptionEstablishing}
                error={encryptionError || undefined}
                onEnable={enableEncryption}
                onDisable={disableEncryption}
              />
            </div>

            {/* 消息列表 */}
            <div ref={messagesContainerRef} className="messages scrollbar-hide">
              <MessageList
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
                <div className="px-4 py-2 text-xs text-gray-600 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <div>回复 · #{replyTo}</div>
                  <button className="text-primary-600" onClick={() => setReplyTo(null)}>取消</button>
                </div>
              )}
              <MessageInput 
                ref={inputRef}
                value={inputValue} 
                onChange={setInputValue} 
                onSend={handleSendMessage} 
                onEmojiClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                onImageSelect={handleImageSelect}
                disabled={isEncryptionEstablishing}
              />
            </footer>
          </main>
        </>
      ) : (
        // 主界面（底部导航）
        <>
          {/* 头部 */}
          <header className="header safe-area-inset-top">
            <div className="flex items-center justify-between px-4 py-3">
              <h1 className="text-lg font-semibold text-gray-900">
                {activeTab === 'chats' && '聊天'}
                {activeTab === 'contacts' && '联系人'}
                {activeTab === 'explore' && '探索'}
              </h1>
            </div>
          </header>

          {/* 主内容区 */}
          <main className="main">
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">探索功能</h2>
                  <p className="text-gray-500 mb-4">暂未开启，等待帝王才开发</p>
                  <div className="text-sm text-gray-400">敬请期待...</div>
                </div>
              </div>
            )}
          </main>

          {/* 底部导航栏 */}
          <footer className="footer bg-white border-t safe-area-inset-bottom" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-around py-2">
              <button
                onClick={() => setActiveTab('chats')}
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                  activeTab === 'chats'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-xs font-medium">聊天</span>
              </button>
              
              <button
                onClick={() => setActiveTab('contacts')}
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                  activeTab === 'contacts'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-xs font-medium">联系人</span>
              </button>
              
              <button
                onClick={() => setActiveTab('explore')}
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                  activeTab === 'explore'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-xs font-medium">探索</span>
              </button>
            </div>
          </footer>
        </>
      )}

      {/* 移动端侧边栏 */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowSidebar(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 md:hidden safe-area-inset-left"
            >
              {/* 标签切换 */}
              <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  onClick={() => setActiveTab('chats')}
                  className={`flex-1 py-3 text-center font-medium transition-colors ${
                    activeTab === 'chats'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500'
                  }`}
                >
                  聊天
                </button>
                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`flex-1 py-3 text-center font-medium transition-colors ${
                    activeTab === 'contacts'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500'
                  }`}
                >
                  联系人
                </button>
                <button
                  onClick={() => setActiveTab('explore')}
                  className={`flex-1 py-3 text-center font-medium transition-colors ${
                    activeTab === 'explore'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500'
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
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">探索功能</h2>
                      <p className="text-gray-500 mb-4">暂未开启，等待帝王才开发</p>
                      <div className="text-sm text-gray-400">敬请期待...</div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 表情选择器 */}
      <AnimatePresence>
        {showEmojiPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setShowEmojiPicker(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom"
            >
              <EmojiPicker
                onSelect={(emoji) => {
                  setInputValue(prev => prev + emoji)
                  setShowEmojiPicker(false)
                }}
                onClose={() => setShowEmojiPicker(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 右侧信息抽屉 */}
      <AnimatePresence>
        {infoOpen && (
          <InfoDrawer 
            open={infoOpen}
            onClose={() => setInfoOpen(false)}
            conversation={currentConversation || undefined}
            currentUserId={currentUser.id}
            onTogglePin={togglePin}
            onToggleMute={toggleMute}
          />
        )}
      </AnimatePresence>

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
