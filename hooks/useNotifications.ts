import { useState, useEffect, useCallback } from 'react'

export interface NotificationOptions {
  title: string
  body?: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  requireInteraction?: boolean
  silent?: boolean
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // 检查浏览器支持
    setIsSupported('Notification' in window)
    
    if (isSupported) {
      setPermission(Notification.permission)
    }
  }, [isSupported])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Notifications not supported')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }, [isSupported])

  const showNotification = useCallback((options: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      console.warn('Notifications not available or not granted')
      return null
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body ?? '',
        icon: options.icon || '/icon-192.png',
        badge: options.badge || '/icon-192.png',
        tag: options.tag ?? '',
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false
      })

      // 自动关闭通知（除非需要交互）
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      return notification
    } catch (error) {
      console.error('Failed to show notification:', error)
      return null
    }
  }, [isSupported, permission])

  const playSound = useCallback(async (soundType: 'message' | 'mention' | 'call' = 'message') => {
    try {
      const soundMap = {
        message: '/sounds/message.mp3',
        mention: '/sounds/mention.mp3',
        call: '/sounds/call.mp3'
      }

      const audio = new Audio(soundMap[soundType])
      audio.volume = 0.5
      await audio.play()
    } catch (error) {
      console.warn('Failed to play sound:', error)
    }
  }, [])

  const notify = useCallback((options: NotificationOptions & { sound?: boolean }) => {
    const { sound = true, ...notificationOptions } = options
    
    // 显示通知
    const notification = showNotification(notificationOptions)
    
    // 播放声音
    if (sound) {
      playSound('message')
    }

    return notification
  }, [showNotification, playSound])

  const notifyMessage = useCallback((senderName: string, message: string, isMention = false) => {
    notify({
      title: isMention ? `@${senderName} 提到了你` : `来自 ${senderName} 的新消息`,
      body: message,
      tag: 'message',
      sound: true
    })
  }, [notify])

  const notifyReaction = useCallback((senderName: string, emoji: string) => {
    notify({
      title: `${senderName} 对你的消息做出了反应`,
      body: emoji,
      tag: 'reaction',
      sound: false
    })
  }, [notify])

  const notifyCall = useCallback((callerName: string, isVideo = false) => {
    notify({
      title: `${callerName} 正在呼叫你`,
      body: isVideo ? '视频通话' : '语音通话',
      tag: 'call',
      requireInteraction: true,
      sound: true
    })
  }, [notify])

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    playSound,
    notify,
    notifyMessage,
    notifyReaction,
    notifyCall
  }
}
