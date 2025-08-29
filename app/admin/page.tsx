"use client"

import { useEffect, useMemo, useState } from 'react'
import { getUsers, getCurrentUser, removeUser, setCurrentUser } from '@/lib/userStore'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState(() => getUsers())
  const me = useMemo(() => getCurrentUser(), [])

  useEffect(() => {
    const cur = getCurrentUser()
    if (!cur?.isAdmin) {
      router.replace('/login')
    }
  }, [router])

  const refresh = () => setUsers(getUsers())

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">用户管理</h1>
        <button className="btn-secondary" onClick={refresh}>刷新</button>
      </div>

      <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">昵称</th>
              <th className="text-left p-3">角色</th>
              <th className="text-left p-3">注册时间</th>
              <th className="text-right p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                <td className="p-3">{u.id}</td>
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.isAdmin ? '管理员' : '普通用户'}</td>
                <td className="p-3">{new Date(u.createdAt).toLocaleString()}</td>
                <td className="p-3 text-right space-x-2">
                  <button className="btn-secondary" onClick={() => { setCurrentUser(u as any); router.push('/') }}>模拟登录</button>
                  <button className="btn-primary" onClick={() => { const updated = { ...u, isAdmin: !u.isAdmin }; localStorage.setItem('chat:users', JSON.stringify(getUsers().map(x => x.id===u.id?updated:x))); refresh() }}>{u.isAdmin ? '降级' : '升级为管理员'}</button>
                  <button className="btn-secondary" onClick={() => { removeUser(u.id); refresh() }}>删除</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td className="p-6 text-center text-gray-500" colSpan={5}>暂无用户</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


