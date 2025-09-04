// 测试环境设置
import { beforeAll, vi } from 'vitest'
import '@testing-library/jest-dom'

beforeAll(() => {
  // 模拟浏览器环境 - localStorage
  const localStorageData = new Map<string, string>()
  const localStorageMock = {
    getItem: vi.fn((key: string) => localStorageData.get(key) || null),
    setItem: vi.fn((key: string, value: string) => localStorageData.set(key, value)),
    removeItem: vi.fn((key: string) => localStorageData.delete(key)),
    clear: vi.fn(() => localStorageData.clear()),
  }
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })
  
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })

  // 模拟 fetch
  global.fetch = vi.fn()

  // 模拟 matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // 模拟 ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // 模拟 IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // 模拟 crypto API
  Object.defineProperty(global, 'crypto', {
    value: {
      getRandomValues: vi.fn().mockImplementation((arr: any) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256)
        }
        return arr
      }),
      randomUUID: vi.fn().mockReturnValue('test-uuid-123'),
      subtle: {
        generateKey: vi.fn(),
        importKey: vi.fn(),
        exportKey: vi.fn(),
        encrypt: vi.fn(),
        decrypt: vi.fn(),
        sign: vi.fn(),
        verify: vi.fn(),
        deriveBits: vi.fn(),
        deriveKey: vi.fn(),
      }
    }
  })

  // 企业级 date-fns mock - 基于 Google/Microsoft 测试最佳实践
  // 避免动态导入超时，提供稳定的测试环境
  vi.mock('date-fns', () => ({
    format: vi.fn((date: Date, formatStr: string) => {
      if (formatStr === 'HH:mm') {
        return date.toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      }
      if (formatStr === 'MM-dd') {
        return date.toLocaleDateString('zh-CN', { 
          month: '2-digit', 
          day: '2-digit' 
        })
      }
      if (formatStr === 'yyyy-MM-dd') {
        return date.toLocaleDateString('zh-CN', { 
          year: 'numeric',
          month: '2-digit', 
          day: '2-digit' 
        })
      }
      return date.toISOString()
    }),
    isToday: vi.fn((date: Date) => {
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }),
    isYesterday: vi.fn((date: Date) => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return date.toDateString() === yesterday.toDateString()
    }),
    formatDistanceToNow: vi.fn((date: Date, options?: { addSuffix?: boolean; locale?: any }) => {
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMinutes < 1) return '刚刚'
      if (diffMinutes < 60) return `${diffMinutes}分钟前`
      if (diffHours < 24) return `${diffHours}小时前`
      if (diffDays < 7) return `${diffDays}天前`
      
      return options?.addSuffix ? `${diffDays}天前` : `${diffDays}天`
    })
  }))

  vi.mock('date-fns/locale', () => ({
    zhCN: {
      code: 'zh-CN',
      formatDistance: vi.fn()
    }
  }))
})
