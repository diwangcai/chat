'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, User, Users, Hash, Plus, Check, Clock, X } from 'lucide-react'
import { useDebounceFn } from '@/hooks/useDebounceFn'
import { useSafeArea, getSafeAreaBottomStyle } from '@/hooks/useSafeArea'

interface SearchResult {
  id: string
  name: string
  handle?: string
  avatar?: string
  status: 'online' | 'offline' | 'last_seen'
  type: 'user' | 'group' | 'channel'
  isFriend?: boolean
  isPending?: boolean
}

interface AddFriendPageProps {
  onClose: () => void
  onAddFriend: (friendId: string) => void
}

export default function AddFriendPage({ onClose, onAddFriend }: AddFriendPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef<number>(0)

  const safeArea = useSafeArea()

  // 防抖搜索 - 使用自定义 hook
  const debouncedSearch = useDebounceFn((query: string) => {
    performSearch(query)
  }, 250)

  // 执行搜索
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setError(null)
      return
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setLoading(true)
    setError(null)

    try {
      // 模拟 API 调用
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&cursor=${cursor || ''}`, {
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error('搜索失败')
      }

      const data = await response.json()
      
      if (cursor) {
        setSearchResults(prev => [...prev, ...data.results])
      } else {
        setSearchResults(data.results)
      }
      
      setHasMore(data.hasMore)
      setCursor(data.nextCursor)
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // 处理搜索输入
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setSelectedIndex(-1)
    setCursor(null)
    debouncedSearch(value)
  }

  // 输入聚焦优化 - 防抖滚动
  const debouncedScrollIntoView = useDebounceFn((element: HTMLElement) => {
    if (element && element.scrollIntoViewIfNeeded) {
      element.scrollIntoViewIfNeeded(false)
    }
  }, 50)

  const handleInputFocus = () => {
    // 保存当前滚动位置
    scrollPositionRef.current = window.scrollY
    // 延迟滚动到输入框
    if (searchInputRef.current) {
      debouncedScrollIntoView(searchInputRef.current)
    }
  }

  const handleInputBlur = () => {
    // 恢复滚动位置
    setTimeout(() => {
      window.scrollTo(0, scrollPositionRef.current)
    }, 100)
  }

  // 添加好友
  const handleAddFriend = async (result: SearchResult) => {
    if (result.isFriend || result.isPending) return

    try {
      const response = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: result.id })
      })

      if (response.ok) {
        setSearchResults(prev => 
          prev.map(item => 
            item.id === result.id 
              ? { ...item, isPending: true }
              : item
          )
        )
        onAddFriend(result.id)
      } else if (response.status === 409) {
        setSearchResults(prev => 
          prev.map(item => 
            item.id === result.id 
              ? { ...item, isFriend: true }
              : item
          )
        )
      }
    } catch (err) {
      console.error('添加好友失败:', err)
    }
  }

  // 键盘事件处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      const result = searchResults[selectedIndex]
      if (result) {
        handleAddFriend(result)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    }
  }

  // Android 返回键处理
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      e.preventDefault()
      onClose()
    }

    // 添加历史记录，用于返回键检测
    window.history.pushState({ addFriendPage: true }, '')
    
    window.addEventListener('popstate', handleBackButton)
    
    return () => {
      window.removeEventListener('popstate', handleBackButton)
      // 清理历史记录
      if (window.history.state?.addFriendPage) {
        window.history.back()
      }
    }
  }, [onClose])

  // 设置无限滚动
  useEffect(() => {
    if (!loadMoreRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          performSearch(searchQuery)
        }
      },
      { threshold: 0.1 }
    )

    observerRef.current.observe(loadMoreRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loading, searchQuery])

  // 组件挂载时聚焦搜索框
  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  // 清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // 分组结果
  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = []
    }
    acc[result.type].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-telegram-bg"
      style={{ 
        height: 'var(--mobile-viewport-height)',
        minHeight: '100dvh'
      }}
      role="dialog"
      aria-label="添加联系人"
      aria-modal="true"
    >
      {/* 头部 */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-telegram-surface border-b border-border-light"
        style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
      >
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors focus-ring"
          aria-label="返回"
        >
          <ArrowLeft className="w-6 h-6 text-telegram-text" />
        </button>
        
        <h1 className="text-lg font-semibold text-telegram-text">添加好友</h1>
        
        <div className="w-10" /> {/* 占位符保持居中 */}
      </div>

      {/* 搜索框 */}
      <div className="p-4 bg-telegram-surface">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-telegram-subtext" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="搜索用户、群组或频道"
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-telegram-text placeholder-telegram-subtext focus:bg-white focus:border-telegram-brand focus:ring-2 focus:ring-telegram-brand/20 transition-all focus-ring"
            style={{ 
              fontSize: 'var(--telegram-font-size-large)',
              borderRadius: 'var(--telegram-radius-input)'
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>
      </div>

      {/* 内容区域 */}
      <div 
        className="flex-1 overflow-auto"
        style={{ 
          height: 'calc(var(--mobile-viewport-height) - 140px)',
          WebkitOverflowScrolling: 'touch',
          overflow: 'auto'
        }}
      >
        {error ? (
          <ErrorState message={error} onRetry={() => performSearch(searchQuery)} />
        ) : loading && searchResults.length === 0 ? (
          <LoadingSkeleton />
        ) : searchResults.length === 0 && searchQuery ? (
          <EmptyState query={searchQuery} />
        ) : (
          <ResultList
            results={groupedResults}
            selectedIndex={selectedIndex}
            onSelect={handleAddFriend}
            onItemClick={(index) => setSelectedIndex(index)}
          />
        )}

        {/* 加载更多触发器 */}
        {hasMore && (
          <div ref={loadMoreRef} className="h-4" />
        )}

        {/* 底部安全区域 */}
        <div style={getSafeAreaBottomStyle(safeArea, 16)} />
      </div>
    </motion.div>
  )
}

// 搜索结果列表组件
function ResultList({ 
  results, 
  selectedIndex, 
  onSelect, 
  onItemClick 
}: {
  results: Record<string, SearchResult[]>
  selectedIndex: number
  onSelect: (result: SearchResult) => void
  onItemClick: (index: number) => void
}) {
  let currentIndex = 0

  return (
    <div className="bg-telegram-surface">
      {Object.entries(results).map(([type, items]) => (
        <div key={type}>
          {/* 分组标题 */}
          <div className="px-4 py-2 bg-gray-50">
            <div className="flex items-center gap-2 text-telegram-subtext">
              {type === 'user' && <User className="w-4 h-4" />}
              {type === 'group' && <Users className="w-4 h-4" />}
              {type === 'channel' && <Hash className="w-4 h-4" />}
              <span className="text-sm font-medium uppercase tracking-wide">
                {type === 'user' ? '用户' : type === 'group' ? '群组' : '频道'}
              </span>
            </div>
          </div>

          {/* 结果项 */}
          {items.map((result) => {
            const index = currentIndex++
            return (
              <ResultItem
                key={result.id}
                result={result}
                isSelected={index === selectedIndex}
                onClick={() => onItemClick(index)}
                onAdd={() => onSelect(result)}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

// 单个结果项组件
function ResultItem({ 
  result, 
  isSelected, 
  onClick, 
  onAdd 
}: {
  result: SearchResult
  isSelected: boolean
  onClick: () => void
  onAdd: () => void
}) {
  const getStatusText = () => {
    if (result.isFriend) return '已是好友'
    if (result.isPending) return '请求中'
    if (result.status === 'online') return '在线'
    if (result.status === 'offline') return '离线'
    return '最近在线'
  }

  const getStatusColor = () => {
    if (result.isFriend) return 'text-green-600'
    if (result.isPending) return 'text-yellow-600'
    if (result.status === 'online') return 'text-green-600'
    return 'text-telegram-subtext'
  }

  return (
    <div
      className={`flex items-center px-4 py-3 cursor-pointer transition-combined ${
        isSelected ? 'bg-telegram-brand/10' : 'hover:bg-gray-50'
      }`}
      style={{ 
        minHeight: 'var(--search-result-height)',
        transform: 'translateZ(0)' // 强制硬件加速
      }}
      onClick={onClick}
      onMouseDown={(e) => {
        // 点击态优化 - 仅使用 opacity/transform
        e.currentTarget.style.opacity = '0.7'
        e.currentTarget.style.transform = 'translateZ(0) scale(0.98)'
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.opacity = '1'
        e.currentTarget.style.transform = 'translateZ(0) scale(1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1'
        e.currentTarget.style.transform = 'translateZ(0) scale(1)'
      }}
      tabIndex={0}
      role="button"
      aria-label={`选择 ${result.name}`}
    >
      {/* 头像 */}
      <div className="relative mr-3">
        <div 
          className="bg-gray-200 rounded-full flex items-center justify-center overflow-hidden"
          style={{ 
            width: 'var(--search-avatar-size)', 
            height: 'var(--search-avatar-size)' 
          }}
        >
          {result.avatar ? (
            <img 
              src={result.avatar} 
              alt={result.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-gray-500" />
          )}
        </div>
        {result.status === 'online' && !result.isFriend && !result.isPending && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>

      {/* 信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 
            className="font-medium text-telegram-text truncate"
            style={{ fontSize: 'var(--telegram-font-size-medium)' }}
          >
            {result.name}
          </h3>
          {result.handle && (
            <span 
              className="text-telegram-subtext truncate"
              style={{ fontSize: 'var(--telegram-font-size-small)' }}
            >
              @{result.handle}
            </span>
          )}
        </div>
        <p 
          className={`text-sm truncate ${getStatusColor()}`}
          style={{ fontSize: 'var(--telegram-font-size-small)' }}
        >
          {getStatusText()}
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="ml-2">
        {result.isFriend ? (
          <div className="flex items-center gap-1 text-green-600">
            <Check className="w-4 h-4" />
            <span className="text-sm">好友</span>
          </div>
        ) : result.isPending ? (
          <div className="flex items-center gap-1 text-yellow-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">请求中</span>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAdd()
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-telegram-brand text-white rounded-lg hover:bg-telegram-brand/90 transition-colors focus-ring"
            style={{ 
              fontSize: 'var(--telegram-font-size-small)',
              borderRadius: 'var(--telegram-radius-button)'
            }}
          >
            <Plus className="w-4 h-4" />
            <span>添加</span>
          </button>
        )}
      </div>
    </div>
  )
}

// 空状态组件
function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-telegram-text mb-2">未找到结果</h3>
      <p className="text-telegram-subtext mb-4">
        没有找到与 "<span className="font-medium">{query}</span>" 相关的用户、群组或频道
      </p>
      <p className="text-sm text-telegram-subtext">
        请尝试其他关键词或检查拼写
      </p>
    </div>
  )
}

// 错误状态组件
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <X className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-telegram-text mb-2">搜索失败</h3>
      <p className="text-telegram-subtext mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-telegram-brand text-white rounded-lg hover:bg-telegram-brand/90 transition-colors focus-ring"
        style={{ borderRadius: 'var(--telegram-radius-button)' }}
      >
        重试
      </button>
    </div>
  )
}

// 加载骨架组件
function LoadingSkeleton() {
  return (
    <div className="bg-telegram-surface">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center px-4 py-3">
          <div className="w-9 h-9 bg-gray-200 rounded-full mr-3 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" style={{ width: '60%' }} />
            <div className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: '40%' }} />
          </div>
          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}
