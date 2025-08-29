// 表情最近使用存储
const RECENT_EMOJIS_KEY = 'recent-emojis'
const MAX_RECENT_EMOJIS = 30

export function getRecentEmojis(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_EMOJIS_KEY) || '[]')
  } catch {
    return []
  }
}

export function pushRecentEmoji(emoji: string): void {
  try {
    const recent = getRecentEmojis()
    const updated = [emoji, ...recent.filter(e => e !== emoji)].slice(0, MAX_RECENT_EMOJIS)
    localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(updated))
  } catch (error) {
    console.warn('Failed to save recent emoji:', error)
  }
}

// 聊天设置存储
const CHAT_SETTINGS_KEY = 'chat-settings'

export interface ChatSettings {
  notifications: boolean
  sound: boolean
  theme: 'light' | 'dark' | 'auto'
  language: string
  fontSize: 'small' | 'medium' | 'large'
}

const defaultSettings: ChatSettings = {
  notifications: true,
  sound: true,
  theme: 'auto',
  language: 'zh-CN',
  fontSize: 'medium'
}

export function getChatSettings(): ChatSettings {
  try {
    const saved = localStorage.getItem(CHAT_SETTINGS_KEY)
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

export function saveChatSettings(settings: Partial<ChatSettings>): void {
  try {
    const current = getChatSettings()
    const updated = { ...current, ...settings }
    localStorage.setItem(CHAT_SETTINGS_KEY, JSON.stringify(updated))
  } catch (error) {
    console.warn('Failed to save chat settings:', error)
  }
}

// 用户偏好存储
const USER_PREFERENCES_KEY = 'user-preferences'

export interface UserPreferences {
  displayName?: string
  status?: string
  avatar?: string
}

export function getUserPreferences(): UserPreferences {
  try {
    return JSON.parse(localStorage.getItem(USER_PREFERENCES_KEY) || '{}')
  } catch {
    return {}
  }
}

export function saveUserPreferences(preferences: Partial<UserPreferences>): void {
  try {
    const current = getUserPreferences()
    const updated = { ...current, ...preferences }
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(updated))
  } catch (error) {
    console.warn('Failed to save user preferences:', error)
  }
}
