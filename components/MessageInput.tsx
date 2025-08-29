'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Send, Smile, Image, Paperclip } from 'lucide-react'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/utils/cn'

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (content: string, type?: 'text' | 'image') => void
  onEmojiClick: () => void
  onImageSelect: (file: File) => void
  disabled?: boolean
}

export default function MessageInput({ value, onChange, onSend, onEmojiClick, onImageSelect, disabled = false }: MessageInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [composing, setComposing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadImage } = useImageUpload()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        if (acceptedFiles[0]) onImageSelect(acceptedFiles[0])
      }
    }
  })

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

    // 自动调整高度
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }, [onChange])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect border-t border-gray-200/50 px-4 py-3 safe-area-inset-bottom"
    >
      <div className="flex items-end space-x-2">
        {/* 附件按钮 */}
        <div {...getRootProps()} className="relative">
          <input {...getInputProps()} />
          <button
            type="button"
            className={cn(
              "icon-btn touch-feedback",
              isDragActive && "bg-primary-100 text-primary-600"
            )}
            aria-label="拖拽上传文件"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-primary-500/20 rounded-full"
            />
          )}
        </div>

        {/* 图片按钮 */}
        <button
          type="button"
          onClick={() => document.getElementById('image-input')?.click()}
          className="icon-btn touch-feedback"
          aria-label="选择图片"
        >
          <Image className="w-5 h-5" />
        </button>
        <input
          id="image-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              onImageSelect(file)
            }
          }}
        />

        {/* 输入框 */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextareaChange}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={(e) => { setComposing(false); onChange((e.currentTarget as HTMLTextAreaElement).value) }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="输入消息..."
            className="chat-input"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
            aria-label="消息输入框"
            data-testid="chat-input"
          />
        </div>

        {/* 表情按钮 */}
        <button
          type="button"
          onClick={onEmojiClick}
          className="icon-btn touch-feedback"
          aria-label="打开表情选择器"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* 发送按钮 */}
        <motion.button
          type="button"
          onClick={handleSend}
          disabled={!value.trim()}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
            value.trim()
              ? "bg-primary-500 text-white hover:bg-primary-600"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          )}
          aria-label="发送消息"
          data-testid="send"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  )
}
