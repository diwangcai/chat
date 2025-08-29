'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { emojiCategories, searchEmojis } from '@/data/emojis'
import { getRecentEmojis, pushRecentEmoji } from '@/lib/storage'
import { cn } from '@/utils/cn'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState('recent')
  const [searchQuery, setSearchQuery] = useState('')
  const [recentEmojis, setRecentEmojis] = useState<string[]>([])

  useEffect(() => {
    // 加载最近使用的表情
    setRecentEmojis(getRecentEmojis())
  }, [])

  const handleEmojiSelect = (emoji: string) => {
    // 保存到最近使用
    pushRecentEmoji(emoji)
    setRecentEmojis(getRecentEmojis())
    
    // 调用父组件的选择回调
    onSelect(emoji)
  }

  const getFilteredEmojis = () => {
    if (searchQuery) {
      return searchEmojis(searchQuery)
    }

    if (activeCategory === 'recent') {
      return recentEmojis.map(emoji => ({
        emoji,
        name: '最近使用',
        category: 'recent',
        keywords: []
      }))
    }

    return emojiCategories.find(cat => cat.id === activeCategory)?.emojis || []
  }

  const filteredEmojis = getFilteredEmojis()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl shadow-apple-lg border border-gray-200 max-h-96 overflow-hidden"
    >
      {/* 搜索栏 */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索表情..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 分类标签 */}
      {!searchQuery && (
        <div className="flex border-b border-gray-100">
          {emojiCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "flex-1 py-2 text-center text-sm transition-colors",
                activeCategory === category.id
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <span className="text-lg">{category.icon}</span>
            </button>
          ))}
        </div>
      )}

      {/* 表情网格 */}
      <div className="p-3 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-8 gap-1">
          {filteredEmojis.map((emoji, index) => (
            <motion.button
              key={`${emoji.emoji}-${index}`}
              onClick={() => handleEmojiSelect(emoji.emoji)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
              title={emoji.name}
            >
              {emoji.emoji}
            </motion.button>
          ))}
        </div>

        {filteredEmojis.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">没有找到相关表情</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
