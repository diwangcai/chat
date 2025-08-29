import zhCN, { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'


export function formatMessageTime(date: Date): string {
  if (isToday(date)) {
    return format(date, 'HH:mm')
  } else if (isYesterday(date)) {
    return '昨天'
  } else {
    return format(date, 'MM-dd')
  }
}

export function formatConversationTime(date: Date): string {
  if (isToday(date)) {
    return format(date, 'HH:mm')
  } else if (isYesterday(date)) {
    return '昨天'
  } else {
    return format(date, 'MM-dd')
  }
}

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: zhCN })
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return format(date1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd')
}

export function shouldGroupMessages(currentDate: Date, prevDate: Date, currentSender: string, prevSender: string): boolean {
  // 不同发送者不分组
  if (currentSender !== prevSender) return false
  
  // 不同日期不分组
  if (!isSameDay(currentDate, prevDate)) return false
  
  // 同一发送者，同一天，如果时间间隔超过5分钟就不分组
  const timeDiff = Math.abs(currentDate.getTime() - prevDate.getTime())
  const fiveMinutes = 5 * 60 * 1000
  
  return timeDiff <= fiveMinutes
}
