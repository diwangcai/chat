"use client"

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Pin, Bell, BellOff } from 'lucide-react'
import { Conversation, User } from '@/types/chat'

interface InfoDrawerProps {
  open: boolean
  onClose: () => void
  conversation: Conversation
  currentUserId: string
  onTogglePin: (id: string, pinned: boolean) => void
  onToggleMute: (id: string, muted: boolean) => void
}

const NOTES_KEY = 'chat:conv_notes'

function loadNotes(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '{}') } catch { return {} }
}
function saveNotes(map: Record<string, string>) {
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(map)) } catch {}
}

export default function InfoDrawer({ open, onClose, conversation, currentUserId, onTogglePin, onToggleMute }: InfoDrawerProps) {
  const others = useMemo(() => conversation.participants.filter(p => p.id !== currentUserId), [conversation, currentUserId])
  const [notesMap, setNotesMap] = useState<Record<string, string>>({})
  const note = notesMap[conversation.id] || ''

  useEffect(() => { setNotesMap(loadNotes()) }, [open])

  const handleSaveNote = (value: string) => {
    const next = { ...notesMap, [conversation.id]: value }
    setNotesMap(next)
    saveNotes(next)
  }

  const handlePinToggle = () => {
    try {
      onTogglePin(conversation.id, !conversation.pinned)
    } catch (error) {
      console.error('Failed to toggle pin:', error)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/30"
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="absolute right-0 top-0 bottom-0 w-[320px] bg-white shadow-xl border-l"
            style={{ borderColor: 'var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="font-semibold text-gray-900">会话信息</div>
              <button onClick={onClose} className="icon-btn"><X className="w-5 h-5" /></button>
            </div>

            {/* 成员 */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="text-sm font-medium text-gray-700 mb-2">成员</div>
              <div className="space-y-2">
                {others.map((u: User) => (
                  <div key={u.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium">
                      {u.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="text-sm text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.isOnline ? '在线' : '离线'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 备注 */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">备注</div>
                <div className="text-xs text-gray-400">仅本机可见</div>
              </div>
              <textarea
                value={note}
                onChange={(e) => handleSaveNote(e.target.value)}
                placeholder="添加一些对该对话的备注..."
                className="w-full h-24 p-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>

            {/* 设置 */}
            <div className="p-4 space-y-3">
              <button
                onClick={handlePinToggle}
                className="w-full flex items-center gap-2 px-3 py-2 rounded border hover:bg-gray-50"
                style={{ borderColor: 'var(--border)' }}
              >
                <Pin className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-800">{conversation.pinned ? '取消置顶' : '置顶此会话'}</span>
              </button>
              <button
                onClick={() => onToggleMute(conversation.id, !(conversation.muted))}
                className="w-full flex items-center gap-2 px-3 py-2 rounded border hover:bg-gray-50"
                style={{ borderColor: 'var(--border)' }}
              >
                {conversation.muted ? <Bell className="w-4 h-4 text-gray-600" /> : <BellOff className="w-4 h-4 text-gray-600" />}
                <span className="text-sm text-gray-800">{conversation.muted ? '取消静音' : '静音此会话'}</span>
              </button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
