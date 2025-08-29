export interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  isAdmin?: boolean;
}

export interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'emoji';
  senderId: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  replyTo?: string;
  reactions?: Reaction[];
  starred?: boolean;
  uploadProgress?: number; // 0-100，用于图片/文件发送进度
  imageUrl?: string;
  imageThumbnail?: string;
  imageSize?: {
    width: number;
    height: number;
  };
}

export interface Reaction {
  emoji: string;
  userId: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  // 侧栏UI可选字段
  pinned?: boolean;
  muted?: boolean;
  updatedAt?: string | Date;
  lastMessagePreview?: string;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation?: Conversation;
  messages: Message[];
  users: User[];
  currentUser: User;
  isLoading: boolean;
  error?: string;
}

export interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: Emoji[];
}

export interface Emoji {
  emoji: string;
  name: string;
  category: string;
  keywords: string[];
}

export interface ImageUpload {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export interface ChatSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoScroll: boolean;
}
