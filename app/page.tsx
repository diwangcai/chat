'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle, AlertCircle } from 'lucide-react'
import { setCurrentUser } from '@/lib/userStore'

const STORAGE_KEY = 'chat:user'

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  isAdmin: boolean
}

interface ValidationErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  phone?: string
}

export default function HomePage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    isAdmin: false
  })
  const [errors, setErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      router.replace('/chats')
    }
  }, [router])

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空'
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少3个字符'
    }

    if (!isLogin) {
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

      if (!formData.phone.trim()) {
        newErrors.phone = '手机号不能为空'
      } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = '请输入有效的手机号'
      }
    } else {
      if (!formData.password) {
        newErrors.password = '密码不能为空'
      }
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

      if (isLogin) {
        // 登录逻辑
        const user = {
          id: Date.now().toString(),
          name: formData.username,
          email: formData.email,
          isAdmin: formData.isAdmin,
          createdAt: new Date().toISOString()
        }
        setCurrentUser(user as any)
        router.replace('/chats')
      } else {
        // 注册逻辑
        const user = {
          id: Date.now().toString(),
          name: formData.username,
          email: formData.email,
          phone: formData.phone,
          isAdmin: formData.isAdmin,
          createdAt: new Date().toISOString()
        }
        setCurrentUser(user as any)
        router.replace('/chats')
      }
    } catch (error) {
      console.error('Authentication error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setErrors({})
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      isAdmin: false
    })
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
          {/* Logo和标题 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white font-bold">聊</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? '欢迎回来' : '创建账号'}
            </h1>
            <p className="text-gray-600">
              {isLogin ? '登录您的账号继续聊天' : '注册新账号开始聊天之旅'}
            </p>
          </div>

          {/* 表单 */}
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
            {/* 用户名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
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
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.username}
                </motion.div>
              )}
            </div>

            {/* 邮箱 - 仅注册时显示 */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="请输入邮箱地址"
                    />
                  </div>
                  {errors.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center mt-2 text-sm text-red-600"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 手机号 - 仅注册时显示 */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    手机号
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="请输入手机号"
                    />
                  </div>
                  {errors.phone && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center mt-2 text-sm text-red-600"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phone}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={isLogin ? '请输入密码' : '请设置密码'}
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
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </motion.div>
              )}
            </div>

            {/* 确认密码 - 仅注册时显示 */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    确认密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
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
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.confirmPassword}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 管理员选项 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAdmin"
                checked={formData.isAdmin}
                onChange={(e) => handleInputChange('isAdmin', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="isAdmin" className="ml-2 text-sm text-gray-700">
                这是管理员账号
              </label>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? '登录中...' : '注册中...'}
                </div>
              ) : (
                isLogin ? '登录' : '注册'
              )}
            </button>
          </form>

          {/* 切换模式 */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? '还没有账号？' : '已有账号？'}
              <button
                onClick={toggleMode}
                className="ml-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {isLogin ? '立即注册' : '立即登录'}
              </button>
            </p>
          </div>

          {/* 其他登录方式 */}
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
        </motion.div>
      </div>
    </div>
  )
}
