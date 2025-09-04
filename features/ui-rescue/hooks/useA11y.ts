/* Telegram UI Rescue - 可访问性 Hook */

import { useEffect, useRef } from 'react'

/**
 * 可访问性 Hook - 提供焦点管理和键盘导航支持
 */
export const useA11y = () => {
  const focusableElementsRef = useRef<HTMLElement[]>([])

  // 获取可聚焦元素
  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ')

    return Array.from(container.querySelectorAll(focusableSelectors))
  }

  // 焦点陷阱 - 限制焦点在指定容器内
  const trapFocus = (container: HTMLElement) => {
    const focusableElements = getFocusableElements(container)
    focusableElementsRef.current = focusableElements

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }

  // 恢复焦点
  const restoreFocus = (element: HTMLElement) => {
    element?.focus()
  }

  return {
    trapFocus,
    restoreFocus,
    getFocusableElements,
  }
}

/**
 * 对比度检查 Hook
 */
export const useContrastCheck = () => {
  // 检查颜色对比度
  const checkContrast = (foreground: string, background: string): number => {
    // 简化的对比度计算
    // 实际项目中应使用更精确的算法
    const getLuminance = (color: string): number => {
      // 移除 # 前缀
      const hex = color.replace('#', '')
      
      // 转换为 RGB
      const r = parseInt(hex.substr(0, 2), 16) / 255
      const g = parseInt(hex.substr(2, 2), 16) / 255
      const b = parseInt(hex.substr(4, 2), 16) / 255

      // 应用 gamma 校正
      const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)

      return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
    }

    const lum1 = getLuminance(foreground)
    const lum2 = getLuminance(background)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)

    return (brightest + 0.05) / (darkest + 0.05)
  }

  // 验证对比度是否符合 WCAG 标准
  const validateContrast = (foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = checkContrast(foreground, background)
    const minRatio = level === 'AA' ? 4.5 : 7
    return ratio >= minRatio
  }

  return {
    checkContrast,
    validateContrast,
  }
}

/**
 * 屏幕阅读器支持 Hook
 */
export const useScreenReader = () => {
  // 向屏幕阅读器宣布消息
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'tg-sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // 清理
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  // 设置页面标题（用于屏幕阅读器）
  const setPageTitle = (title: string) => {
    document.title = title
  }

  return {
    announce,
    setPageTitle,
  }
}
