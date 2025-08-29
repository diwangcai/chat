'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Share2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'

interface ImageViewerProps {
  imageUrl: string
  onClose: () => void
}

export default function ImageViewer({ imageUrl, onClose }: ImageViewerProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case '=':
        case '+':
          e.preventDefault()
          setScale(prev => Math.min(prev * 1.2, 3))
          break
        case '-':
          e.preventDefault()
          setScale(prev => Math.max(prev / 1.2, 0.5))
          break
        case '0':
          e.preventDefault()
          resetView()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const resetView = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(prev => Math.max(0.5, Math.min(3, prev * delta)))
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = 'image.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '分享图片',
          text: '查看这张图片',
          url: imageUrl
        })
      } catch (error) {
        console.log('分享失败:', error)
      }
    } else {
      // 降级到复制链接
      navigator.clipboard.writeText(imageUrl)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* 工具栏 */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
          <button
            onClick={handleDownload}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={resetView}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 缩放控制 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 z-10">
          <button
            onClick={() => setScale(prev => Math.max(0.5, prev / 1.2))}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-white text-sm px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(prev => Math.min(3, prev * 1.2))}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        {/* 图片容器 */}
        <div
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.img
            ref={imageRef}
            src={imageUrl}
            alt="查看图片"
            className="max-w-full max-h-full object-contain"
            style={{
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
              transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: 'center',
            }}
            drag={scale > 1}
            dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
            dragElastic={0.1}
            dragMomentum={false}
            onDoubleClick={() => setScale(prev => prev === 1 ? 2 : 1)}
          />
        </div>

        {/* 提示信息 */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white/60 text-sm text-center">
          <p>双击缩放 • 滚轮缩放 • 拖拽移动 • ESC关闭</p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
