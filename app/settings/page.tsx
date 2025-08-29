"use client"

import { useEffect, useState } from 'react'

const THEME_KEY = 'chat:theme'

type Theme = 'light' | 'dark' | 'auto'

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>('auto')

  useEffect(() => {
    const t = (localStorage.getItem(THEME_KEY) as Theme) || 'auto'
    setTheme(t)
    applyTheme(t)
  }, [])

  const applyTheme = (t: Theme) => {
    const root = document.documentElement
    if (t === 'dark') root.setAttribute('data-theme', 'dark')
    else if (t === 'light') root.removeAttribute('data-theme')
    else {
      // auto: 跟随系统
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      if (mq.matches) root.setAttribute('data-theme', 'dark')
      else root.removeAttribute('data-theme')
    }
  }

  const onChange = (t: Theme) => {
    setTheme(t)
    localStorage.setItem(THEME_KEY, t)
    applyTheme(t)
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">设置</h1>
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-700 mb-2">主题</div>
          <div className="flex items-center gap-3">
            {(['light','dark','auto'] as Theme[]).map(t => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="theme" checked={theme===t} onChange={() => onChange(t)} />
                <span className="text-sm">{t==='light'?'浅色':t==='dark'?'深色':'跟随系统'}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
