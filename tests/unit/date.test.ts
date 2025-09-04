import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isSameDay, shouldGroupMessages } from '@/utils/date'

describe('日期工具函数', () => {
  beforeEach(() => {
    // Mock 系统时间为固定值以确保测试稳定性
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
  })


  describe('isSameDay', () => {
    it('应该正确判断同一天的不同时间', () => {
      // 使用本地时区的日期，避免时区转换问题
      const date1 = new Date(2024, 0, 1, 10, 0, 0) // 2024-01-01 10:00:00
      const date2 = new Date(2024, 0, 1, 20, 0, 0) // 2024-01-01 20:00:00
      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('应该正确判断不同天的时间', () => {
      const date1 = new Date(2024, 0, 1, 23, 59, 0) // 2024-01-01 23:59:00
      const date2 = new Date(2024, 0, 2, 0, 1, 0)   // 2024-01-02 00:01:00
      expect(isSameDay(date1, date2)).toBe(false)
    })

    it('应该正确判断跨年的日期', () => {
      const date1 = new Date(2023, 11, 31, 23, 59, 0) // 2023-12-31 23:59:00
      const date2 = new Date(2024, 0, 1, 0, 1, 0)     // 2024-01-01 00:01:00
      expect(isSameDay(date1, date2)).toBe(false)
    })
  })

  describe('shouldGroupMessages', () => {
    const baseTime = new Date('2024-01-15T12:00:00Z')

    it('同一发送者、同一天、5分钟内应该分组', () => {
      const time1 = new Date(baseTime.getTime())
      const time2 = new Date(baseTime.getTime() + 3 * 60 * 1000) // 3分钟后
      expect(shouldGroupMessages(time2, time1, 'user1', 'user1')).toBe(true)
    })

    it('同一发送者、同一天、超过5分钟不应该分组', () => {
      const time1 = new Date(baseTime.getTime())
      const time2 = new Date(baseTime.getTime() + 6 * 60 * 1000) // 6分钟后
      expect(shouldGroupMessages(time2, time1, 'user1', 'user1')).toBe(false)
    })

    it('不同发送者不应该分组', () => {
      const time1 = new Date(baseTime.getTime())
      const time2 = new Date(baseTime.getTime() + 1 * 60 * 1000) // 1分钟后
      expect(shouldGroupMessages(time2, time1, 'user1', 'user2')).toBe(false)
    })

    it('不同日期不应该分组', () => {
      const time1 = new Date('2024-01-15T12:00:00Z')
      const time2 = new Date('2024-01-16T12:01:00Z') // 第二天
      expect(shouldGroupMessages(time2, time1, 'user1', 'user1')).toBe(false)
    })

    it('边界情况：正好5分钟应该分组', () => {
      const time1 = new Date(baseTime.getTime())
      const time2 = new Date(baseTime.getTime() + 5 * 60 * 1000) // 正好5分钟
      expect(shouldGroupMessages(time2, time1, 'user1', 'user1')).toBe(true)
    })

    it('时间顺序反过来也应该正确处理', () => {
      const time1 = new Date(baseTime.getTime() + 3 * 60 * 1000)
      const time2 = new Date(baseTime.getTime()) // 较早的时间
      expect(shouldGroupMessages(time1, time2, 'user1', 'user1')).toBe(true)
    })
  })
})
