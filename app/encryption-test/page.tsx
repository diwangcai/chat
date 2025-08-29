'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useEncryption } from '@/hooks/useEncryption'
import EncryptionStatus from '@/components/EncryptionStatus'
import { encryptionManager } from '@/lib/e2ee/manager'

export default function EncryptionTestPage() {
  const [testMessage, setTestMessage] = useState('')
  const [encryptedMessage, setEncryptedMessage] = useState('')
  const [decryptedMessage, setDecryptedMessage] = useState('')
  const [testResults, setTestResults] = useState<Array<{
    test: string
    result: boolean
    message: string
  }>>([])

  const {
    isEnabled,
    isEstablishing,
    error,
    enable,
    disable,
    encryptMessage,
    decryptMessage,
    isEncryptedMessage
  } = useEncryption({
    participants: ['test-user-1', 'test-user-2'],
    autoEnable: false
  })

  const runTests = async () => {
    const results = []

    try {
      // 测试1: 启用加密
      try {
        await enable()
        results.push({
          test: '启用加密',
          result: true,
          message: '加密系统启用成功'
        })
      } catch (error) {
        results.push({
          test: '启用加密',
          result: false,
          message: `启用失败: ${error instanceof Error ? error.message : '未知错误'}`
        })
      }

      // 测试2: 消息加密
      if (isEnabled) {
        try {
          const testText = '这是一条测试消息 🔐'
          const encrypted = await encryptMessage(testText, 'test-user-1')
          setEncryptedMessage(JSON.stringify(encrypted, null, 2))
          results.push({
            test: '消息加密',
            result: true,
            message: '消息加密成功'
          })
        } catch (error) {
          results.push({
            test: '消息加密',
            result: false,
            message: `加密失败: ${error instanceof Error ? error.message : '未知错误'}`
          })
        }
      }

      // 测试3: 消息解密
      if (encryptedMessage) {
        try {
          const encrypted = JSON.parse(encryptedMessage)
          const decrypted = await decryptMessage(encrypted)
          setDecryptedMessage(decrypted)
          results.push({
            test: '消息解密',
            result: true,
            message: `解密成功: "${decrypted}"`
          })
        } catch (error) {
          results.push({
            test: '消息解密',
            result: false,
            message: `解密失败: ${error instanceof Error ? error.message : '未知错误'}`
          })
        }
      }

      // 测试4: 加密消息检测
      if (encryptedMessage) {
        const encrypted = JSON.parse(encryptedMessage)
        const isEncrypted = isEncryptedMessage(encrypted)
        results.push({
          test: '加密检测',
          result: isEncrypted,
          message: isEncrypted ? '正确识别加密消息' : '未能识别加密消息'
        })
      }

      // 测试5: 会话管理
      const activeSessions = encryptionManager.getActiveSessions()
      results.push({
        test: '会话管理',
        result: activeSessions.length > 0,
        message: `活跃会话数量: ${activeSessions.length}`
      })

    } catch (error) {
      results.push({
        test: '测试执行',
        result: false,
        message: `测试执行失败: ${error instanceof Error ? error.message : '未知错误'}`
      })
    }

    setTestResults(results)
  }

  const handleSendTestMessage = async () => {
    if (!testMessage.trim()) return

    try {
      if (isEnabled) {
        const encrypted = await encryptMessage(testMessage, 'test-user-1')
        setEncryptedMessage(JSON.stringify(encrypted, null, 2))
      } else {
        setEncryptedMessage('加密未启用，无法加密消息')
      }
    } catch (error) {
      setEncryptedMessage(`加密失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleDecryptTestMessage = async () => {
    if (!encryptedMessage) return

    try {
      const encrypted = JSON.parse(encryptedMessage)
      const decrypted = await decryptMessage(encrypted)
      setDecryptedMessage(decrypted)
    } catch (error) {
      setDecryptedMessage(`解密失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔐 Telegram 风格加密系统测试
          </h1>

          {/* 加密状态 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">加密状态</h2>
            <EncryptionStatus
              isEnabled={isEnabled}
              isEstablishing={isEstablishing}
              error={error ?? ''}
              onToggle={isEnabled ? disable : enable}
            />
          </div>

          {/* 测试控制 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">功能测试</h2>
            <div className="flex space-x-4">
              <button
                onClick={runTests}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                运行完整测试
              </button>
            </div>
          </div>

          {/* 消息测试 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">消息测试</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  测试消息
                </label>
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="输入要加密的消息..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleSendTestMessage}
                  disabled={!isEnabled || !testMessage.trim()}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  加密消息
                </button>
                <button
                  onClick={handleDecryptTestMessage}
                  disabled={!encryptedMessage}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  解密消息
                </button>
              </div>
            </div>
          </div>

          {/* 结果显示 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 加密消息 */}
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-2">加密消息</h3>
              <div className="bg-gray-100 p-3 rounded-lg">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {encryptedMessage || '暂无加密消息'}
                </pre>
              </div>
            </div>

            {/* 解密消息 */}
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-2">解密消息</h3>
              <div className="bg-gray-100 p-3 rounded-lg">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {decryptedMessage || '暂无解密消息'}
                </pre>
              </div>
            </div>
          </div>

          {/* 测试结果 */}
          {testResults.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">测试结果</h2>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      result.result ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <span className="font-medium text-gray-800">{result.test}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${result.result ? 'text-green-600' : 'text-red-600'}`}>
                        {result.result ? '✅ 通过' : '❌ 失败'}
                      </span>
                      <span className="text-sm text-gray-600">{result.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
