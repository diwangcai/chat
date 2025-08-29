// 测试环境设置
import { beforeAll, vi } from 'vitest'

beforeAll(() => {
  // 模拟浏览器环境
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  })

  // 模拟 fetch
  global.fetch = vi.fn()
})
