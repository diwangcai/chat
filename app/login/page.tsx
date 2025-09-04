"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { setCurrentUser } from '@/lib/userStore'

const STORAGE_KEY = 'chat:user'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) router.replace('/')
    }
  }, [router])

  const submit = () => {
    const user = { id: 'user_' + Math.random().toString(36).substr(2, 9), name: name || '未命名用户', isAdmin, createdAt: new Date().toISOString() }
    setCurrentUser(user as any)
    router.replace('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-6 border" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-xl font-semibold mb-4">登录 / 注册</h1>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">昵称</div>
            <input className="w-full border rounded-xl px-3 py-2" style={{ borderColor: 'var(--border)' }} value={name} onChange={e => setName(e.target.value)} placeholder="输入昵称" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} />
            这是管理员账号
          </label>
          <button className="btn-primary w-full" onClick={submit}>进入</button>
        </div>
      </div>
    </div>
  )
}


