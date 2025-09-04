'use client'

import { useState, useRef, useCallback, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Smile, Plus } from 'lucide-react'
import { cn } from '@/utils/cn'

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (content: string, type?: 'text' | 'image') => void
  onEmojiClick: () => void
  onPlusClick: () => void
  disabled?: boolean
  isSending?: boolean
}

const MessageInput = forwardRef<HTMLTextAreaElement, MessageInputProps>(({ 
  value, 
  onChange, 
  onSend, 
  onEmojiClick, 
  onPlusClick, 
  disabled: _disabled = false,
  isSending = false
}, _ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const [composing, setComposing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    if (value.trim()) {
      onSend(value.trim())
    }
  }, [value, onSend])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !composing) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend, composing])

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    setIsTyping(true)

    // 自动调整高度 - 适配新的最大高度
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px'

    // 清除打字状态
    setTimeout(() => setIsTyping(false), 1000)
  }, [onChange])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-3 safe-area-inset-bottom"
    >
      {/* 统一的输入框容器 */}
      <div className="unified-input-container">
        <div 
          className={cn(
            "input-wrapper transition-combined",
            isFocused && "ring-2 ring-blue-500 border-transparent",
            isHovered && "hover-state",
            isTyping && "typing-state"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Plus按钮 - 左侧 */}
          <button
            type="button"
            onClick={onPlusClick}
            className="input-button left transition-combined hover-scale focus-ring"
            aria-label="打开附件面板"
          >
            <Plus className="w-5 h-5" />
          </button>



          {/* 主输入框 */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextareaChange}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={(e) => { 
              setComposing(false)
              onChange((e.currentTarget as HTMLTextAreaElement).value) 
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="输入消息..."
            className="unified-input transition-combined input-focus"
            rows={1}
            aria-label="消息输入框"
            data-testid="chat-input"
          />

          {/* 表情按钮 - 右侧 */}
          <button
            type="button"
            onClick={onEmojiClick}
            className="input-button right transition-combined hover-scale focus-ring"
            aria-label="打开表情选择器"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* 发送按钮 - 最右侧 */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!value.trim() || isSending}
            className="send-button transition-combined hover-scale focus-ring"
            aria-label="发送消息"
            data-testid="send-button"
          >
            {isSending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <div className={`transition-transform ${value.trim() ? 'rotate-0' : 'rotate-45'}`}>
                <Send className="w-5 h-5" />
              </div>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
})

MessageInput.displayName = 'MessageInput'

export default MessageInput