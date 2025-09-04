'use client';

import React, { useState, useRef } from 'react';
import { Paperclip, Image, X } from 'lucide-react';

interface EmojiPanelProps {
  onEmojiSelect: (emoji: string) => void;
  onFileSelect: (file: File) => void;
  onImageSelect: (file: File) => void;
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  { name: '表情', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'] },
  { name: '手势', emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏'] },
  { name: '物品', emojis: ['📱', '💻', '⌨️', '🖥️', '🖨️', '📷', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳'] },
  { name: '符号', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯'] }
];

export default function EmojiPanel({ onEmojiSelect, onFileSelect, onImageSelect, isOpen, onClose }: EmojiPanelProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'file') {
        onFileSelect(file);
      } else {
        onImageSelect(file);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 z-50 panel-float bg-white/90">
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="上传文件"
          >
            <Paperclip className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => imageInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="上传图片"
          >
            <Image className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* 表情分类标签 */}
      <div className="flex border-b border-gray-100">
        {EMOJI_CATEGORIES.map((category, index) => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(index)}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              activeCategory === index
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* 表情网格 */}
      <div className="p-3 max-h-48 overflow-y-auto">
        <div className="grid grid-cols-8 gap-1">
          {(() => {
            const safeIndex = activeCategory >= 0 && activeCategory < EMOJI_CATEGORIES.length ? activeCategory : 0;
            // eslint-disable-next-line security/detect-object-injection
            const emojis = EMOJI_CATEGORIES[safeIndex]?.emojis ?? [];
            return emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => onEmojiSelect(emoji)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors text-lg"
              >
                {emoji}
              </button>
            ))
          })()}
        </div>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
        onChange={(e) => handleFileChange(e, 'file')}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, 'image')}
        className="hidden"
      />
    </div>
  );
}
