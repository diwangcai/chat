'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, UserPlus, UserMinus, Search, X } from 'lucide-react'
import AddFriendPage from './AddFriendPage'
import ClientOnly from './ClientOnly'

interface Friend {
  id: string
  name: string
  avatar?: string
  isOnline: boolean
}

interface FriendListProps {
  currentUserId: string
  onSelectFriend: (friendId: string) => void
}

export default function FriendList({ currentUserId, onSelectFriend }: FriendListProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [showAddFriendPage, setShowAddFriendPage] = useState(false)
  const [addFriendInput, setAddFriendInput] = useState('')
  const [searchResult, setSearchResult] = useState<{ found: boolean; name?: string } | null>(null)
  const [loading, setLoading] = useState(false)

  // 初始化好友列表
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedFriends = localStorage.getItem('chat:friends')
      if (storedFriends) {
        setFriends(JSON.parse(storedFriends))
      } else {
        setFriends([
          { id: '2', name: '张三', isOnline: true },
          { id: '3', name: '李四', isOnline: false },
          { id: '4', name: '王五', isOnline: true },
        ])
      }
      setIsLoaded(true)
    }
  }, [])

  // 保存好友列表到本地存储
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      localStorage.setItem('chat:friends', JSON.stringify(friends))
    }
  }, [friends, isLoaded])

  const filteredFriends = friends
    .filter(friend => friend.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-u-co-pinyin'))

  const addFriend = async () => {
    if (!addFriendInput.trim()) return
    
    setLoading(true)
    try {
      // 模拟搜索用户
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const found = Math.random() > 0.3 // 70% 概率找到用户
      setSearchResult({ found, name: addFriendInput })
      
      if (found) {
        // 模拟添加好友
        await new Promise(resolve => setTimeout(resolve, 500))
        const newFriend: Friend = {
          id: Date.now().toString(),
          name: addFriendInput,
          isOnline: true
        }
        setFriends(prev => [newFriend, ...prev])
        setShowAddFriend(false)
        setAddFriendInput('')
        setSearchResult(null)
      }
    } catch {
      setSearchResult({ found: false })
    } finally {
      setLoading(false)
    }
  }

  const removeFriend = (friendId: string) => {
    setFriends(prev => prev.filter(f => f.id !== friendId))
  }

  const handleAddFriendFromPage = (friendId: string) => {
    // 从 AddFriendPage 添加好友
    const newFriend: Friend = {
      id: friendId,
      name: `用户${friendId}`,
      isOnline: true
    }
    setFriends(prev => [newFriend, ...prev])
    setShowAddFriendPage(false)
  }

  return (
    <ClientOnly fallback={
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-xl font-semibold text-text-primary">联系人</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-text-tertiary">加载中...</div>
        </div>
      </div>
    }>
      <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-xl font-semibold text-text-primary">联系人</h2>
        <button
          onClick={() => setShowAddFriend(true)}
          className="icon-btn text-primary-600 hover:bg-primary-50"
          aria-label="添加好友"
        >
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-3 sticky top-0 z-10 bg-bg-secondary">
        <div 
          className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 cursor-pointer hover:bg-white transition-colors focus-ring"
          onClick={() => setShowAddFriendPage(true)}
          tabIndex={0}
          role="button"
          aria-label="搜索用户、群组或频道"
        >
          <Search className="w-5 h-5 text-text-tertiary" />
          <span className="flex-1 text-sm text-text-tertiary">搜索用户、群组或频道...</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredFriends.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">暂无好友</h3>
            <p className="text-text-secondary mb-4">添加一些好友开始聊天吧</p>
            <button
              onClick={() => setShowAddFriend(true)}
              className="btn-primary"
            >
              添加好友
            </button>
          </div>
        ) : (
          <div className="p-2">
            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-tertiary cursor-pointer transition-combined hover-lift focus-ring"
                onClick={() => onSelectFriend(friend.id)}
                tabIndex={0}
                role="button"
                aria-label={`选择好友 ${friend.name}`}
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
              </div>
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
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-xl p-6 z-50 max-w-sm mx-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">添加好友</h3>
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
                  <input
                    type="text"
                    value={addFriendInput}
                    onChange={(e) => setAddFriendInput(e.target.value)}
                    placeholder="输入用户名或ID"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    onKeyDown={(e) => e.key === 'Enter' && addFriend()}
                  />
                </div>
                
                {searchResult && (
                  <div className={`p-3 rounded-lg text-sm ${
                    searchResult.found 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {searchResult.found 
                      ? `找到用户: ${searchResult.name}` 
                      : '未找到该用户'
                    }
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddFriend(false)}
                    className="flex-1 btn-secondary"
                  >
                    取消
                  </button>
                  <button
                    onClick={addFriend}
                    disabled={!addFriendInput.trim() || loading}
                    className="flex-1 btn-primary"
                  >
                    {loading ? (searchResult?.found ? '添加中...' : '搜索中...') : '添加好友'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AddFriendPage 全屏搜索 */}
      <AnimatePresence>
        {showAddFriendPage && (
          <AddFriendPage
            onClose={() => setShowAddFriendPage(false)}
            onAddFriend={handleAddFriendFromPage}
          />
        )}
      </AnimatePresence>
      </div>
    </ClientOnly>
  )
}