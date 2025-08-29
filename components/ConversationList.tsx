"use client"

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Pin, BellOff } from 'lucide-react'
import { Conversation, User } from '@/types/chat'
import { cn } from '@/utils/cn'
import Link from 'next/link'

interface ConversationListProps {
  conversations: Conversation[]
  currentUserId: string
  activeId?: string
  onSelect: (id: string) => void
}

export default function ConversationList({ conversations, currentUserId, activeId, onSelect }: ConversationListProps) {
  const [query, setQuery] = useState('')
  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = conversations.filter(c => {
      const other = c.participants.find(p => p.id !== currentUserId) as User | undefined
      const name = (c.isGroup ? c.groupName : other?.name) || ''
      const preview = c.lastMessagePreview || ''
      return name.toLowerCase().includes(q) || preview.toLowerCase().includes(q)
    })
    // 置顶在前，更新时间倒序
    return filtered.sort((a, b) => {
      const ap = a.pinned ? 1 : 0
      const bp = b.pinned ? 1 : 0
      if (ap !== bp) return bp - ap
      const at = a.updatedAt ? new Date(a.updatedAt as any).getTime() : 0
      const bt = b.updatedAt ? new Date(b.updatedAt as any).getTime() : 0
      return bt - at
    })
  }, [conversations, currentUserId, query])

  return (
    <div className="h-full flex flex-col border-r" style={{ borderColor: 'var(--border)' }} data-testid="conversation-list">
      {/* 搜索 */}
      <div className="p-3">
        <div className="flex items-center gap-2 bg-white rounded-xl border px-3 py-2 shadow-sm" style={{ borderColor: 'var(--border)' }}>
          <Search className="w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索"
            className="flex-1 outline-none bg-transparent text-sm"
          />
        </div>
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto">
        {items.map((c) => {
          const other = c.participants.find(p => p.id !== currentUserId) as User | undefined
          const isActive = c.id === activeId
          return (
            <Link key={c.id} href={`/chats/${c.id}`} className="block" onClick={() => onSelect(c.id)}>
              <motion.div
                data-testid="conversation-item"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50",
                  isActive && "bg-gray-100"
                )}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium">
                    {(c.isGroup ? c.groupName?.charAt(0) : other?.name?.charAt(0)) || 'U'}
                  </div>
                  {(other?.isOnline || c.isGroup) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-gray-900 truncate">
                      {c.isGroup ? c.groupName : other?.name}
                    </div>
                    {c.pinned && <Pin className="w-3 h-3 text-gray-400" />}
                    {c.muted && <BellOff className="w-3 h-3 text-gray-400" />}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{c.lastMessagePreview || '开始聊天吧'}</div>
                </div>
                <div className="ml-auto flex flex-col items-end gap-1">
                  <div className="text-xs text-gray-400">{c.updatedAt ? new Date(c.updatedAt as any).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                  {c.unreadCount > 0 && (
                    <div className="min-w-[20px] px-1.5 h-5 rounded-full bg-primary-500 text-white text-[10px] flex items-center justify-center">
                      {c.unreadCount}
                    </div>
                  )}
                </div>
              </motion.div>
            </Link>
          )
        })}
        {items.length === 0 && (
          <div className="px-4 py-6 text-sm text-gray-500">未找到相关会话</div>
        )}
      </div>
    </div>
  )
}
