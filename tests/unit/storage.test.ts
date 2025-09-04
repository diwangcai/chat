import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  getRecentEmojis, 
  pushRecentEmoji, 
  getChatSettings, 
  saveChatSettings, 
  getUserPreferences, 
  saveUserPreferences,
  type ChatSettings,
  type UserPreferences
} from '@/lib/storage'

describe('存储工具函数', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 清理 localStorage 数据
    localStorage.clear()
  })

  describe('表情最近使用存储', () => {
    describe('getRecentEmojis', () => {
      it('应该返回空数组当没有存储数据时', () => {
        const result = getRecentEmojis()
        expect(result).toEqual([])
      })

      it('应该正确解析存储的表情数据', () => {
        const mockEmojis = ['😀', '😃', '😄']
        localStorage.setItem('recent-emojis', JSON.stringify(mockEmojis))
        
        const result = getRecentEmojis()
        expect(result).toEqual(mockEmojis)
      })

      it('应该处理无效的JSON数据', () => {
        localStorage.setItem('recent-emojis', 'invalid json')
        
        const result = getRecentEmojis()
        expect(result).toEqual([])
      })
    })

    describe('pushRecentEmoji', () => {
      it('应该将新表情添加到列表开头', () => {
        pushRecentEmoji('😀')
        
        const result = getRecentEmojis()
        expect(result).toEqual(['😀'])
      })

      it('应该将已存在的表情移到开头', () => {
        localStorage.setItem('recent-emojis', JSON.stringify(['😃', '😀', '😄']))
        
        pushRecentEmoji('😀')
        
        const result = getRecentEmojis()
        expect(result).toEqual(['😀', '😃', '😄'])
      })

      it('应该限制最大表情数量为30个', () => {
        const existingEmojis = Array.from({ length: 30 }, (_, i) => `emoji-${i}`)
        localStorage.setItem('recent-emojis', JSON.stringify(existingEmojis))
        
        pushRecentEmoji('new-emoji')
        
        const result = getRecentEmojis()
        const expectedEmojis = ['new-emoji', ...existingEmojis.slice(0, 29)]
        expect(result).toEqual(expectedEmojis)
        expect(result.length).toBe(30)
      })

      it('应该处理localStorage错误', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        // 模拟 setItem 抛出错误
        const originalSetItem = localStorage.setItem
        localStorage.setItem = vi.fn().mockImplementation(() => {
          throw new Error('Storage quota exceeded')
        })
        
        pushRecentEmoji('😀')
        
        expect(consoleSpy).toHaveBeenCalledWith('Failed to save recent emoji:', expect.any(Error))
        
        // 恢复原始方法
        localStorage.setItem = originalSetItem
        consoleSpy.mockRestore()
      })
    })
  })

  describe('聊天设置存储', () => {
    const defaultSettings: ChatSettings = {
      notifications: true,
      sound: true,
      theme: 'auto',
      language: 'zh-CN',
      fontSize: 'medium'
    }

    describe('getChatSettings', () => {
      it('应该返回默认设置当没有存储数据时', () => {
        const result = getChatSettings()
        expect(result).toEqual(defaultSettings)
      })

      it('应该合并存储的设置与默认设置', () => {
        const savedSettings = { theme: 'dark', fontSize: 'large' }
        localStorage.setItem('chat-settings', JSON.stringify(savedSettings))
        
        const result = getChatSettings()
        expect(result).toEqual({
          ...defaultSettings,
          theme: 'dark',
          fontSize: 'large'
        })
      })

      it('应该处理无效的JSON数据', () => {
        localStorage.setItem('chat-settings', 'invalid json')
        
        const result = getChatSettings()
        expect(result).toEqual(defaultSettings)
      })
    })

    describe('saveChatSettings', () => {
      it('应该合并并保存设置', () => {
        const newSettings = { theme: 'dark' as const, fontSize: 'large' as const }
        saveChatSettings(newSettings)
        
        const result = getChatSettings()
        expect(result).toEqual({ ...defaultSettings, ...newSettings })
      })

      it('应该处理localStorage错误', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const originalSetItem = localStorage.setItem
        localStorage.setItem = vi.fn().mockImplementation(() => {
          throw new Error('Storage quota exceeded')
        })
        
        saveChatSettings({ theme: 'dark' })
        
        expect(consoleSpy).toHaveBeenCalledWith('Failed to save chat settings:', expect.any(Error))
        
        localStorage.setItem = originalSetItem
        consoleSpy.mockRestore()
      })
    })
  })

  describe('用户偏好存储', () => {
    describe('getUserPreferences', () => {
      it('应该返回空对象当没有存储数据时', () => {
        const result = getUserPreferences()
        expect(result).toEqual({})
      })

      it('应该正确解析存储的用户偏好', () => {
        const mockPreferences: UserPreferences = {
          displayName: 'John Doe',
          status: 'online',
          avatar: 'https://example.com/avatar.jpg'
        }
        localStorage.setItem('user-preferences', JSON.stringify(mockPreferences))
        
        const result = getUserPreferences()
        expect(result).toEqual(mockPreferences)
      })

      it('应该处理无效的JSON数据', () => {
        localStorage.setItem('user-preferences', 'invalid json')
        
        const result = getUserPreferences()
        expect(result).toEqual({})
      })
    })

    describe('saveUserPreferences', () => {
      it('应该合并并保存用户偏好', () => {
        const existingPreferences = { displayName: 'Jane Doe' }
        localStorage.setItem('user-preferences', JSON.stringify(existingPreferences))
        
        const newPreferences = { status: 'away', avatar: 'new-avatar.jpg' }
        saveUserPreferences(newPreferences)
        
        const result = getUserPreferences()
        expect(result).toEqual({ ...existingPreferences, ...newPreferences })
      })

      it('应该处理localStorage错误', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const originalSetItem = localStorage.setItem
        localStorage.setItem = vi.fn().mockImplementation(() => {
          throw new Error('Storage quota exceeded')
        })
        
        saveUserPreferences({ displayName: 'John' })
        
        expect(consoleSpy).toHaveBeenCalledWith('Failed to save user preferences:', expect.any(Error))
        
        localStorage.setItem = originalSetItem
        consoleSpy.mockRestore()
      })
    })
  })
})
