'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatHeader from '@/components/ChatHeader'
import MessageList from '@/components/MessageList'
import MessageInput from '@/components/MessageInput'
import EmojiPicker from '@/components/EmojiPicker'
import ImageViewer from '@/components/ImageViewer'
import ConversationList from '@/components/ConversationList'
import InfoDrawer from '@/components/InfoDrawer'
import { Message, User, Conversation } from '@/types/chat'
import { useEncryption } from '@/hooks/useEncryption'
import EncryptionStatus from '@/components/EncryptionStatus'
import { useRouter } from 'next/navigation'

export default function ChatPage() {
  const isE2E = process.env.NEXT_PUBLIC_E2E === '1'
  const isAutomation = typeof navigator !== 'undefined' && (navigator as Navigator & { webdriver?: boolean }).webdriver === true
  const isRuntimeE2E = isE2E || isAutomation
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentUser, setCurrentUser] = useState<User>({ id: '1', name: '我', avatar: '/avatars/user1.jpg', isOnline: true })
  
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
          router.replace('/login')
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
  const [typingText, setTypingText] = useState<string | undefined>(undefined)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  // Telegram 风格的加密系统
  const { isEnabled: isEncryptionEnabled, isEstablishing: isEncryptionEstablishing, error: encryptionError, enable: enableEncryption, disable: disableEncryption, encryptMessage } = useEncryption({ participants: ['1', '2'], autoEnable: !isRuntimeE2E })

  // 加载持久化消息或初始化
  useEffect(() => {
    try {
      const key = `chat:messages:${activeId}`
      const raw = localStorage.getItem(key)
      if (raw) {
        const arr = JSON.parse(raw) as Message[]
        const restored: Message[] = arr.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
        setMessages(restored)
        return
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }

    const now = Date.now()
    const initialMessages: Message[] = [
      { id: '1', content: '你好！欢迎使用极简聊天室 👋', type: 'text', senderId: '2', timestamp: new Date(now - 20*60*1000), status: 'read' },
      { id: '2', content: '这个界面设计真的很棒', type: 'text', senderId: '2', timestamp: new Date(now - 19*60*1000), status: 'read' },
      { id: '3', content: '流畅度也很赞！', type: 'text', senderId: '2', timestamp: new Date(now - 18*60*1000), status: 'read' },
      { id: '4', content: '谢谢！我们确实花了很多心思', type: 'text', senderId: '1', timestamp: new Date(now - 10*60*1000), status: 'read' },
      { id: '5', content: '是的，采用了苹果级的设计理念，追求极致的流畅体验 🍎', type: 'text', senderId: '2', timestamp: new Date(now - 5*60*1000), status: 'read' },
      { id: '6', content: '每个细节都很用心', type: 'text', senderId: '2', timestamp: new Date(now - 1000), status: 'read' }
    ]
    if (activeId === 'admin-group') {
      initialMessages.push({ id: 'sys-1', content: '这是管理员聊天室（演示）', type: 'text', senderId: '100', timestamp: new Date(now - 60*1000), status: 'read' })
    }
    setMessages(initialMessages)
  }, [activeId])

  // 持久化当前会话消息
  useEffect(() => {
    try {
      const key = `chat:messages:${activeId}`
      localStorage.setItem(key, JSON.stringify(messages))
    } catch (error) {
      console.error('Failed to persist messages:', error)
    }
  }, [messages, activeId])

  // 模拟对方正在输入与来消息（用于演示未读与打字状态/Telegram 行为）
  useEffect(() => {
    const timer = setInterval(() => {
      const target = conversations[Math.floor(Math.random() * conversations.length)]
      if (!target) return
      const other = target.participants.find(p => p.id !== currentUser.id)
      if (!other) return

      // 打字指示
      if (target.id === activeId) {
        setTypingText('对方正在输入…')
      }

      setTimeout(() => {
        if (target.id === activeId) {
          setTypingText(undefined)
          const autoMessage: Message = { id: (Date.now() + Math.random()).toString(), content: '收到～', type: 'text', senderId: other.id, timestamp: new Date(), status: 'read' }
          setMessages(prev => [...prev, autoMessage])
          setConversations(prev => prev.map(c => c.id === target.id ? { ...c, lastMessagePreview: '收到～', updatedAt: new Date().toISOString() } : c))
        } else {
          // 非当前会话：仅更新未读计数与预览
          setConversations(prev => prev.map(c => c.id === target.id ? { ...c, lastMessagePreview: '收到～', updatedAt: new Date().toISOString(), unreadCount: (c.unreadCount || 0) + 1 } : c))
        }
      }, 2000)
    }, 20000)

    return () => clearInterval(timer)
  }, [activeId, conversations, currentUser.id])

  // 进入会话时清零未读并标记消息为已读
  useEffect(() => {
    setConversations(prev => prev.map(c => c.id === activeId ? { ...c, unreadCount: 0 } : c))
    setMessages(prev => prev.map(m => ({ ...m, status: m.senderId !== currentUser.id ? 'read' as const : m.status })))
  }, [activeId, currentUser.id])

  const handleSendMessage = async (content: string, type: 'text' | 'image' = 'text') => {
    try {
      let messageContent = content
      if (type === 'text' && isEncryptionEnabled) {
        try { const encryptedMessage = await encryptMessage(content, currentUser.id); messageContent = JSON.stringify(encryptedMessage) } catch (error) { console.error('加密失败:', error) }
      }
      const newMessage: Message = {
        id: Date.now().toString(),
        content: messageContent,
        type,
        senderId: currentUser.id,
        timestamp: new Date(),
        status: 'sending',
        ...(replyTo ? { replyTo } : {})
      }
      setMessages(prev => [...prev, newMessage])
      setInputValue('')
      setReplyTo(null)
      setShowEmojiPicker(false)
      setTimeout(() => { setMessages(prev => prev.map(msg => msg.id === newMessage.id ? { ...msg, status: 'sent' as const } : msg)) }, 500)
      setTimeout(() => { setMessages(prev => prev.map(msg => msg.id === newMessage.id ? { ...msg, status: 'delivered' as const } : msg)) }, 1200)
      setTimeout(() => { setMessages(prev => prev.map(msg => msg.id === newMessage.id ? { ...msg, status: 'read' as const } : msg)) }, 2500)
      setConversations(prev => prev.map(c => c.id === activeId ? { ...c, lastMessagePreview: type === 'text' ? content : '图片', updatedAt: new Date().toISOString(), unreadCount: 0 } : c))

      // 调用后端假模型以生成回显
      if (type === 'text') {
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content }] })
          })
          if (res.ok) {
            const data = await res.json()
            const reply: Message = {
              id: (Date.now() + Math.random()).toString(),
              content: String(data.content ?? 'OK'),
              type: 'text',
              senderId: '2',
              timestamp: new Date(),
              status: 'read'
            }
            setMessages(prev => [...prev, reply])
            setConversations(prev => prev.map(c => c.id === activeId ? { ...c, lastMessagePreview: reply.content, updatedAt: new Date().toISOString() } : c))
          }
        } catch (e) {
          console.error('调用假模型失败', e)
        }
      }
    } catch (error) { console.error('发送消息失败:', error) }
  }

  const handleImageSelect = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      // 先插入一条 sending 消息，带进度
      const tempId = 'upload-' + Date.now()
      const uploading: Message = { id: tempId, content: imageUrl, type: 'image', senderId: currentUser.id, timestamp: new Date(), status: 'sending', uploadProgress: 1 }
      setMessages(prev => [...prev, uploading])

      // 模拟上传进度
      let progress = 1
      const timer = setInterval(() => {
        progress = Math.min(100, progress + Math.round(Math.random() * 20))
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, uploadProgress: progress } : m))
        if (progress >= 100) {
          clearInterval(timer)
          // 上传成功后发送正式消息
          handleSendMessage(imageUrl, 'image')
          // 移除占位消息
          setMessages(prev => prev.filter(m => m.id !== tempId))
        }
      }, 300)

      // 5% 概率模拟失败
      setTimeout(() => {
        if (Math.random() < 0.05) {
          clearInterval(timer)
          setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed', uploadProgress: undefined as unknown as number } : m))
        }
      }, 2500)
    }
    reader.readAsDataURL(file)
  }

  const retryUpload = (id: string) => {
    const target = messages.find(m => m.id === id)
    if (!target) return
    // 重新触发模拟上传
    const newId = 'upload-' + Date.now()
    setMessages(prev => prev.map(m => m.id === id ? { ...m, id: newId, status: 'sending', uploadProgress: 1 } : m))
    let progress = 1
    const timer = setInterval(() => {
      progress = Math.min(100, progress + Math.round(Math.random() * 20))
      setMessages(prev => prev.map(m => m.id === newId ? { ...m, uploadProgress: progress } : m))
      if (progress >= 100) {
        clearInterval(timer)
        handleSendMessage(target.content, 'image')
        setMessages(prev => prev.filter(m => m.id !== newId))
      }
    }, 300)
  }

  const handleEncryptionToggle = async () => { if (isEncryptionEnabled) { disableEncryption() } else { try { await enableEncryption() } catch (e) { console.error('启用加密失败:', e) } } }

  const togglePin = (id: string, pinned: boolean) => setConversations(prev => prev.map(c => c.id === id ? { ...c, pinned } : c))
  const toggleMute = (id: string, muted: boolean) => setConversations(prev => prev.map(c => c.id === id ? { ...c, muted } : c))

  return (
    <div className="flex h-screen" style={{ background: 'var(--surface)' }} data-testid="chat-root">
      {/* 侧栏 */}
      <div className="hidden md:flex w-72 flex-col" style={{ background: 'var(--bg)' }}>
        <ConversationList conversations={conversations} currentUserId={currentUser.id} activeId={activeId} onSelect={(id) => { setActiveId(id); setInfoOpen(false) }} />
      </div>

      {/* 主区 */}
      <div className="flex-1 flex flex-col">
        {/* 加密状态 */}
        <div className="px-4 py-2 border-b" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <EncryptionStatus isEnabled={isEncryptionEnabled} isEstablishing={isEncryptionEstablishing} error={encryptionError ?? ''} onToggle={handleEncryptionToggle} />
            <button className="icon-btn" onClick={() => setInfoOpen(true)}>详情</button>
          </div>
        </div>

        {/* 聊天头部 */}
        {currentConversation && (
          <ChatHeader
            conversation={currentConversation}
            isEncryptionEnabled={isEncryptionEnabled}
            isEncryptionEstablishing={isEncryptionEstablishing}
            typingText={typingText ?? ''}
            onStartCall={() => router.push('/call')}
            onStartVideo={() => router.push('/call')}
            onOpenInfo={() => setInfoOpen(true)}
          />
        )}

        {/* 消息列表 */}
        <div className="flex-1 overflow-hidden">
          <MessageList 
            messages={messages} 
            currentUserId={currentUser.id} 
            onImageClick={setSelectedImage}
            onReply={(id) => setReplyTo(id)}
            onDelete={(id) => setMessages(prev => prev.filter(m => m.id !== id))}
            onToggleStar={(id) => setMessages(prev => prev.map(m => m.id === id ? { ...m, starred: !m.starred } : m))}
            onRetry={(id) => retryUpload(id)}
          />
        </div>

        {/* 输入区域 */}
        <div className="relative">
          {replyTo && (
            <div className="px-4 py-2 text-xs text-gray-600 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
              <div>回复 · #{replyTo}</div>
              <button className="text-primary-600" onClick={() => setReplyTo(null)}>取消</button>
            </div>
          )}
          <MessageInput value={inputValue} onChange={setInputValue} onSend={handleSendMessage} onEmojiClick={() => setShowEmojiPicker(!showEmojiPicker)} onImageSelect={handleImageSelect} />
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.2 }} className="absolute bottom-full left-0 right-0 mb-2">
                <EmojiPicker onSelect={(e) => setInputValue((v) => v + e)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 右侧信息抽屉 */}
      {currentConversation && (
        <InfoDrawer open={infoOpen} onClose={() => setInfoOpen(false)} conversation={currentConversation} currentUserId={currentUser.id} onTogglePin={togglePin} onToggleMute={toggleMute} />
      )}

      {/* 图片查看器 */}
      <AnimatePresence>{selectedImage && (<ImageViewer imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />)}</AnimatePresence>
    </div>
  )
}
