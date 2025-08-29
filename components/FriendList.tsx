'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, UserPlus, UserMinus, Search, X } from 'lucide-react'

interface Friend {
  id: string
  name: string
  avatar?: string
  isOnline: boolean
  addedAt: string
}

interface FriendListProps {
  currentUserId: string
  onSelectFriend: (friendId: string) => void
}

export default function FriendList({ currentUserId, onSelectFriend }: FriendListProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [newFriendId, setNewFriendId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 从 localStorage 加载好友列表
    const savedFriends = localStorage.getItem(`friends:${currentUserId}`)
    if (savedFriends) {
      setFriends(JSON.parse(savedFriends))
    }
  }, [currentUserId])

  const addFriend = async () => {
    if (!newFriendId.trim()) return
    
    setLoading(true)
    try {
      // 模拟添加好友
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newFriend: Friend = {
        id: newFriendId,
        name: `用户${newFriendId}`,
        isOnline: false,
        addedAt: new Date().toISOString()
      }
      
      const updatedFriends = [...friends, newFriend]
      setFriends(updatedFriends)
      localStorage.setItem(`friends:${currentUserId}`, JSON.stringify(updatedFriends))
      
      setNewFriendId('')
      setShowAddFriend(false)
    } catch (error) {
      console.error('添加好友失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFriend = (friendId: string) => {
    const updatedFriends = friends.filter(f => f.id !== friendId)
    setFriends(updatedFriends)
    localStorage.setItem(`friends:${currentUserId}`, JSON.stringify(updatedFriends))
  }

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="text-lg font-semibold">好友列表</h2>
        <button
          onClick={() => setShowAddFriend(true)}
          className="icon-btn"
          aria-label="添加好友"
        >
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      {/* 搜索 */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索好友..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 好友列表 */}
      <div className="flex-1 overflow-auto">
        {filteredFriends.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <User className="w-12 h-12 mb-4" />
            <p>暂无好友</p>
            <button
              onClick={() => setShowAddFriend(true)}
              className="mt-2 text-primary-600 hover:text-primary-700"
            >
              添加好友
            </button>
          </div>
        ) : (
          <div className="p-2">
            {filteredFriends.map((friend) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectFriend(friend.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.name} className="w-full h-full rounded-full" />
                      ) : (
                        <User className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    {friend.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{friend.name}</p>
                    <p className="text-sm text-gray-500">
                      {friend.isOnline ? '在线' : '离线'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFriend(friend.id)
                  }}
                  className="icon-btn text-red-500 hover:bg-red-50"
                  aria-label="删除好友"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 添加好友弹层 */}
      <AnimatePresence>
        {showAddFriend && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowAddFriend(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">添加好友</h3>
                  <button
                    onClick={() => setShowAddFriend(false)}
                    className="icon-btn"
                    aria-label="关闭"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      用户ID
                    </label>
                    <input
                      type="text"
                      value={newFriendId}
                      onChange={(e) => setNewFriendId(e.target.value)}
                      placeholder="输入用户ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addFriend()
                        }
                      }}
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowAddFriend(false)}
                      className="flex-1 btn-secondary"
                      disabled={loading}
                    >
                      取消
                    </button>
                    <button
                      onClick={addFriend}
                      disabled={!newFriendId.trim() || loading}
                      className="flex-1 btn-primary"
                    >
                      {loading ? '添加中...' : '添加'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
