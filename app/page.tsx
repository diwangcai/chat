'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react'
import { setCurrentUser } from '@/lib/userStore'

const STORAGE_KEY = 'chat:user'

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
}

interface ValidationErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
}

type ViewMode = 'login' | 'register' | 'forgot-password'

export default function HomePage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        router.replace('/chats')
      }
    }
  }, [router])

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空'
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少3个字符'
    }

    switch (viewMode) {
      case 'register':
        if (!formData.email.trim()) {
          newErrors.email = '邮箱不能为空'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = '请输入有效的邮箱地址'
        }

        if (!formData.password) {
          newErrors.password = '密码不能为空'
        } else if (formData.password.length < 6) {
          newErrors.password = '密码至少6个字符'
        }

        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = '两次输入的密码不一致'
        }
        break

      case 'login':
        if (!formData.password) {
          newErrors.password = '密码不能为空'
        }
        break

      case 'forgot-password':
        if (!formData.email.trim()) {
          newErrors.email = '邮箱不能为空'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = '请输入有效的邮箱地址'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      switch (viewMode) {
        case 'login': {
          // 登录逻辑
          const loginUser = {
        id: Date.now().toString(),
            name: formData.username,
            email: formData.email,
            isAdmin: false, // 管理员权限由后台控制，用户无法自选
            createdAt: new Date().toISOString()
          }
          setCurrentUser(loginUser as any)
          router.replace('/chats')
          break
        }

        case 'register': {
          // 注册逻辑
          const registerUser = {
            id: Date.now().toString(),
            name: formData.username,
            email: formData.email,
            isAdmin: false, // 管理员权限由后台控制，用户无法自选
            createdAt: new Date().toISOString()
          }
          setCurrentUser(registerUser as any)
          router.replace('/chats')
          break
        }

        case 'forgot-password':
          // 忘记密码逻辑
          alert('重置密码链接已发送到您的邮箱，请查收邮件进行密码重置。')
          setViewMode('login')
          break
      }
    } catch (error) {
      console.error('Authentication error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const switchView = (mode: ViewMode) => {
    setViewMode(mode)
    setErrors({})
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
  }

  const getTitle = () => {
    switch (viewMode) {
      case 'login':
        return '欢迎回来'
      case 'register':
        return '创建账号'
      case 'forgot-password':
        return '找回密码'
      default:
        return '欢迎回来'
    }
  }

  const getSubtitle = () => {
    switch (viewMode) {
      case 'login':
        return '登录您的账号继续聊天'
      case 'register':
        return '注册新账号开始聊天之旅'
      case 'forgot-password':
        return '输入您的邮箱地址，我们将发送重置密码链接'
      default:
        return '登录您的账号继续聊天'
    }
  }

  const getButtonText = () => {
    if (isLoading) {
      switch (viewMode) {
        case 'login':
          return '登录中...'
        case 'register':
          return '注册中...'
        case 'forgot-password':
          return '发送中...'
        default:
          return '处理中...'
      }
    }
    
    switch (viewMode) {
      case 'login':
        return '登录'
      case 'register':
        return '注册'
      case 'forgot-password':
        return '发送重置链接'
      default:
        return '登录'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          {/* 返回按钮 - 仅在忘记密码页面显示 */}
          {viewMode === 'forgot-password' && (
            <button
              onClick={() => switchView('login')}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回登录
            </button>
          )}

          {/* Logo和标题 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white font-bold">聊</span>
      </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {getTitle()}
            </h1>
            <p className="text-gray-600">
              {getSubtitle()}
            </p>
        </div>

          {/* 表单 */}
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
            {/* 用户名 - 登录和注册时显示 */}
            {(viewMode === 'login' || viewMode === 'register') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    autoComplete="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.username ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="请输入用户名"
                  />
                </div>
                {errors.username && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center mt-2 text-sm text-red-600"
                  >
                    <span className="w-4 h-4 mr-1">⚠️</span>
                    {errors.username}
                  </motion.div>
                )}
              </div>
            )}

            {/* 邮箱 - 注册和忘记密码时显示 */}
            {(viewMode === 'register' || viewMode === 'forgot-password') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={viewMode === 'register' ? '请输入邮箱地址' : '请输入注册时的邮箱地址'}
          />
        </div>
                {errors.email && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center mt-2 text-sm text-red-600"
                  >
                    <span className="w-4 h-4 mr-1">⚠️</span>
                    {errors.email}
                  </motion.div>
                )}
              </div>
            )}

            {/* 密码 - 登录和注册时显示 */}
            {(viewMode === 'login' || viewMode === 'register') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={viewMode === 'login' ? 'current-password' : 'new-password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={viewMode === 'login' ? '请输入密码' : '请设置密码'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center mt-2 text-sm text-red-600"
                  >
                    <span className="w-4 h-4 mr-1">⚠️</span>
                    {errors.password}
                  </motion.div>
                )}
              </div>
            )}

            {/* 确认密码 - 仅注册时显示 */}
            {viewMode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  确认密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="请再次输入密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center mt-2 text-sm text-red-600"
                  >
                    <span className="w-4 h-4 mr-1">⚠️</span>
                    {errors.confirmPassword}
                  </motion.div>
                )}
              </div>
            )}

            {/* 忘记密码链接 - 仅登录时显示 */}
            {viewMode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => switchView('forgot-password')}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  忘记密码？
                </button>
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {getButtonText()}
                </div>
              ) : (
                getButtonText()
              )}
            </button>
          </form>

          {/* 切换模式 */}
          {viewMode !== 'forgot-password' && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {viewMode === 'login' ? '还没有账号？' : '已有账号？'}
                <button
                  onClick={() => switchView(viewMode === 'login' ? 'register' : 'login')}
                  className="ml-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  {viewMode === 'login' ? '立即注册' : '立即登录'}
                </button>
              </p>
            </div>
          )}

          {/* 其他登录方式 - 仅登录时显示 */}
          {viewMode === 'login' && (
            <div className="mt-8">
        <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">或使用以下方式</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-700">微信登录</span>
                </button>
                <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-700">QQ登录</span>
                </button>
              </div>
            </div>
          )}
              </motion.div>
      </div>
    </div>
  )
}
