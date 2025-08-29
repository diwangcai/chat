import { describe, it, expect } from 'vitest'
import { formatMessageTime, formatConversationTime as _formatConversationTime, formatRelativeTime as _formatRelativeTime, isSameDay, shouldGroupMessages } from '@/utils/date'

describe('日期工具函数', () => {
  it('应该正确格式化消息时间', () => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    expect(formatMessageTime(now)).toMatch(/^\d{2}:\d{2}$/)
    expect(formatMessageTime(yesterday)).toBe('昨天')
    expect(formatMessageTime(lastWeek)).toMatch(/^\d{2}-\d{2}$/)
  })

  it('应该正确判断是否为同一天', () => {
    const date1 = new Date('2024-01-01T10:00:00')
    const date2 = new Date('2024-01-01T20:00:00')
    const date3 = new Date('2024-01-02T10:00:00')

    expect(isSameDay(date1, date2)).toBe(true)
    expect(isSameDay(date1, date3)).toBe(false)
  })

  it('应该正确判断消息分组', () => {
    const now = new Date()
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000)
    const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000)

    expect(shouldGroupMessages(fiveMinutesLater, now, 'user1', 'user1')).toBe(true)
    expect(shouldGroupMessages(tenMinutesLater, now, 'user1', 'user1')).toBe(false)
    expect(shouldGroupMessages(fiveMinutesLater, now, 'user1', 'user2')).toBe(false)
  })
})
