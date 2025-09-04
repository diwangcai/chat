import { describe, it, expect } from 'vitest'
import { cn } from '@/utils/cn'

describe('cn 工具函数', () => {
  it('应该正确合并 className', () => {
    const result = cn('px-2 py-1', 'text-blue-500')
    expect(result).toBe('px-2 py-1 text-blue-500')
  })

  it('应该正确处理条件类名', () => {
    const isActive = true
    const result = cn('px-2 py-1', isActive && 'bg-blue-500')
    expect(result).toBe('px-2 py-1 bg-blue-500')
  })

  it('应该正确处理 false 条件', () => {
    const isActive = false
    const result = cn('px-2 py-1', isActive && 'bg-blue-500')
    expect(result).toBe('px-2 py-1')
  })

  it('应该正确处理对象形式的类名', () => {
    const result = cn('px-2', {
      'py-1': true,
      'bg-blue-500': false,
      'text-white': true
    })
    expect(result).toBe('px-2 py-1 text-white')
  })

  it('应该正确处理数组形式的类名', () => {
    const result = cn(['px-2', 'py-1'], ['text-blue-500'])
    expect(result).toBe('px-2 py-1 text-blue-500')
  })

  it('应该正确处理 Tailwind 冲突类名', () => {
    const result = cn('px-2 px-4', 'py-1 py-2')
    // Tailwind merge 应该保留后面的类名
    expect(result).toBe('px-4 py-2')
  })

  it('应该正确处理空值', () => {
    const result = cn('px-2', null, undefined, false, '')
    expect(result).toBe('px-2')
  })

  it('应该正确处理复杂的嵌套情况', () => {
    const isActive = true
    const size = 'large'
    const result = cn(
      'base-class',
      isActive && 'active-class',
      size === 'large' && 'large-class',
      {
        'conditional-true': true,
        'conditional-false': false
      }
    )
    expect(result).toBe('base-class active-class large-class conditional-true')
  })
})
