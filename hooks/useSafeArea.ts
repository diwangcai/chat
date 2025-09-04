import { useState, useEffect } from 'react'

interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

/**
 * 安全区域 Hook
 * 获取设备的安全区域信息，用于处理刘海屏、底部指示器等
 */
export function useSafeArea(): SafeAreaInsets {
  const [safeArea, setSafeArea] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement)
      
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0', 10),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0', 10),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0', 10),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0', 10)
      })
    }

    // 初始更新
    updateSafeArea()

    // 监听窗口大小变化
    window.addEventListener('resize', updateSafeArea)
    window.addEventListener('orientationchange', updateSafeArea)

    return () => {
      window.removeEventListener('resize', updateSafeArea)
      window.removeEventListener('orientationchange', updateSafeArea)
    }
  }, [])

  return safeArea
}

/**
 * 获取安全区域样式的工具函数
 */
export function getSafeAreaStyles(insets: SafeAreaInsets) {
  return {
    paddingTop: Math.max(16, insets.top),
    paddingRight: Math.max(16, insets.right),
    paddingBottom: Math.max(16, insets.bottom),
    paddingLeft: Math.max(16, insets.left)
  }
}

/**
 * 获取底部安全区域样式的工具函数
 */
export function getSafeAreaBottomStyle(insets: SafeAreaInsets, minPadding = 16) {
  return {
    paddingBottom: Math.max(minPadding, insets.bottom)
  }
}
