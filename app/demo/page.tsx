'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Zap, Smartphone, Palette, Shield, Globe } from 'lucide-react'
import Link from 'next/link'

export default function DemoPage() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)

  const features = [
    {
      id: 'chat',
      icon: MessageCircle,
      title: '流畅聊天',
      description: '实时消息传递，支持文本、图片、表情等多种消息类型',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'performance',
      icon: Zap,
      title: '极致性能',
      description: '60fps 流畅动画，虚拟化列表，苹果级用户体验',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'responsive',
      icon: Smartphone,
      title: '全平台适配',
      description: '完美适配手机、平板、桌面，响应式设计',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'design',
      icon: Palette,
      title: '简约设计',
      description: '极简主义设计理念，专注内容与交互',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'security',
      icon: Shield,
      title: '安全可靠',
      description: '端到端加密，隐私保护，安全传输',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'modern',
      icon: Globe,
      title: '现代技术',
      description: '基于 Next.js 14、React 19、TypeScript 构建',
      color: 'from-indigo-500 to-indigo-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">极简聊天室</h1>
              <p className="text-gray-600 mt-2">体验下一代聊天应用</p>
            </div>
            <Link
              href="/"
              className="bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              开始体验
            </Link>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 特性展示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
              onMouseEnter={() => setActiveFeature(feature.id)}
              onMouseLeave={() => setActiveFeature(null)}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* 技术栈 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">技术栈</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Next.js 14', desc: 'React 框架' },
              { name: 'React 19', desc: 'UI 库' },
              { name: 'TypeScript', desc: '类型安全' },
              { name: 'Tailwind CSS', desc: '样式框架' },
              { name: 'Framer Motion', desc: '动画库' },
              { name: 'Socket.IO', desc: '实时通信' },
              { name: 'PWA', desc: '渐进式应用' },
              { name: '响应式设计', desc: '全平台适配' }
            ].map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-4 text-center"
              >
                <div className="font-semibold text-gray-900">{tech.name}</div>
                <div className="text-sm text-gray-600">{tech.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
