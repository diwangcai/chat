export interface User {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  isAdmin?: boolean
  status?: string
  lastSeen?: Date
}

export interface Message {
  id: string
  content: string
  type: 'text' | 'image' | 'file' | 'audio' | 'video'
  senderId: string
  timestamp: Date
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  // 新增字段
  replyToId?: string
  editedAt?: Date
  deletedAt?: Date
  reactions?: Array<{
    emoji: string
    userId: string
    timestamp: Date
  }>
  linkPreview?: {
    title?: string
    description?: string
    image?: string
    url: string
  }
  upload?: {
    progress: number
    state: 'idle' | 'uploading' | 'failed' | 'done'
    retryCount: number
    error?: string
  }
  // E2EE 相关字段
  isEncrypted?: boolean
  encryptedData?: any // EncryptedMessage 或 EncryptedMedia
  decryptedContent?: string // 解密后的内容，用于显示
}

export interface Reaction {
  emoji: string
  userId: string
  timestamp: Date
}

export interface Conversation {
  id: string
  participants: User[]
  unreadCount: number
  isGroup: boolean
  groupName?: string
  // 新增字段
  pinned?: boolean
  visibility?: 'all' | 'admin'
  displayNamePerUser?: Record<string, string>
  lastMessage?: Message
  lastActivity?: Date
  isArchived?: boolean
  isMuted?: boolean
}

export interface ChatState {
  messages: Message[]
  currentUser: User
  currentConversation: Conversation
  conversations: Conversation[]
  showEmojiPicker: boolean
  selectedImage: string | null
  inputValue: string
  // 新增字段
  unreadCount: number
  isSticky: boolean
  showUnreadIndicator: boolean
  notifications: Notification[]
}

export interface EmojiCategory {
  id: string
  name: string
  icon: string
  emojis: Emoji[]
}

export interface Emoji {
  emoji: string
  name: string
  category: string
  keywords: string[]
}

export interface ImageUpload {
  file: File
  preview: string
  progress: number
  state: 'idle' | 'uploading' | 'failed' | 'done'
  error?: string
}

export interface ChatSettings {
  notifications: boolean
  sound: boolean
  theme: 'light' | 'dark' | 'auto'
  language: string
  fontSize: 'small' | 'medium' | 'large'
}

export interface Notification {
  id: string
  type: 'message' | 'mention' | 'reaction' | 'system'
  title: string
  body?: string
  timestamp: Date
  read: boolean
  data?: any
}

export interface LinkPreview {
  title?: string
  description?: string
  image?: string
  url: string
  domain?: string
}

export interface MessageAction {
  id: string
  label: string
  icon: string
  action: (message: Message) => void
  condition?: (message: Message, currentUser: User) => boolean
}
