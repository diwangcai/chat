'use client'

import { useState, useEffect } from 'react'
import { useE2EE } from '@/hooks/useE2EE'
import { useEncryption as _useEncryption } from '@/hooks/useEncryption'
import { encryptionManager as _encryptionManager } from '@/lib/e2ee/manager'
import { motion } from 'framer-motion'
import { Shield, Lock, Unlock, Key, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

export default function E2EETestPage() {
  const [e2eeState, e2eeActions] = useE2EE({
    currentUserId: '1',
    enableLogging: true,
    autoInitialize: true
  })

  const [testMessage, setTestMessage] = useState('Hello, E2EE!')
  const [encryptedMessage, setEncryptedMessage] = useState<any>(null)
  const [decryptedMessage, setDecryptedMessage] = useState<string>('')
  const [testResults, setTestResults] = useState<Array<{ test: string; result: boolean; message: string }>>([])

  const runTests = async () => {
    const results: Array<{ test: string; result: boolean; message: string }> = []

    try {
      // 测试1: 初始化
      if (e2eeState.isInitialized) {
        results.push({
          test: 'E2EE 初始化',
          result: true,
          message: '端到端加密系统已成功初始化'
        })
      } else {
        results.push({
          test: 'E2EE 初始化',
          result: false,
          message: '端到端加密系统初始化失败'
        })
      }

      // 测试2: 指纹生成
      if (e2eeState.myFingerprint) {
        results.push({
          test: '密钥指纹',
          result: true,
          message: `指纹生成成功: ${e2eeState.myFingerprint.slice(0, 16)}...`
        })
      } else {
        results.push({
          test: '密钥指纹',
          result: false,
          message: '密钥指纹生成失败'
        })
      }

      // 测试3: 会话建立
      try {
        const sessionResult = await e2eeActions.establishSession('2')
        results.push({
          test: '会话建立',
          result: true,
          message: `会话建立成功，指纹: ${sessionResult.fingerprint.slice(0, 16)}...`
        })
      } catch (error) {
        results.push({
          test: '会话建立',
          result: false,
          message: `会话建立失败: ${error instanceof Error ? error.message : '未知错误'}`
        })
      }

      // 测试4: 消息加密
      try {
        const encrypted = await e2eeActions.encryptText('2', testMessage)
        setEncryptedMessage(encrypted)
        results.push({
          test: '消息加密',
          result: true,
          message: `消息加密成功，算法: ${encrypted.algorithm}`
        })
      } catch (error) {
        results.push({
          test: '消息加密',
          result: false,
          message: `消息加密失败: ${error instanceof Error ? error.message : '未知错误'}`
        })
      }

      // 测试5: 消息解密
      if (encryptedMessage) {
        try {
          const decrypted = await e2eeActions.decryptText('2', encryptedMessage)
          setDecryptedMessage(decrypted.plaintext as string)
          results.push({
            test: '消息解密',
            result: decrypted.isValid,
            message: decrypted.isValid 
              ? `消息解密成功: "${decrypted.plaintext}"`
              : `消息解密失败: ${decrypted.error}`
          })
        } catch (error) {
          results.push({
            test: '消息解密',
            result: false,
            message: `消息解密失败: ${error instanceof Error ? error.message : '未知错误'}`
          })
        }
      }

      // 测试6: 会话信息
      try {
        const sessionInfo = await e2eeActions.getSessionInfo('2')
        if (sessionInfo) {
          results.push({
            test: '会话信息',
            result: true,
            message: `会话状态: ${sessionInfo.isEstablished ? '已建立' : '未建立'}`
          })
        } else {
          results.push({
            test: '会话信息',
            result: false,
            message: '无法获取会话信息'
          })
        }
      } catch (error) {
        results.push({
          test: '会话信息',
          result: false,
          message: `获取会话信息失败: ${error instanceof Error ? error.message : '未知错误'}`
        })
      }

    } catch (error) {
      results.push({
        test: '测试执行',
        result: false,
        message: `测试执行失败: ${error instanceof Error ? error.message : '未知错误'}`
      })
    }

    setTestResults(results)
  }

  useEffect(() => {
    if (e2eeState.isInitialized) {
      runTests()
    }
  }, [e2eeState.isInitialized])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">E2EE 端到端加密测试</h1>
              <p className="text-gray-600">验证端到端加密系统的各项功能</p>
            </div>
          </div>

          {/* 状态指示器 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {e2eeState.isInitializing ? (
                <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
              ) : e2eeState.isInitialized ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {e2eeState.isInitializing ? '初始化中...' : 
                 e2eeState.isInitialized ? '已初始化' : '未初始化'}
              </span>
            </div>

            {e2eeState.myFingerprint && (
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  指纹: <code className="bg-gray-100 px-1 rounded">{e2eeState.myFingerprint.slice(0, 16)}...</code>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 测试控制面板 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">测试控制</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                测试消息
              </label>
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入要加密的测试消息"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={runTests}
                disabled={!e2eeState.isInitialized || e2eeState.isInitializing}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                运行测试
              </button>

              <button
                onClick={() => e2eeActions.initialize()}
                disabled={e2eeState.isInitializing || e2eeState.isInitialized}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                重新初始化
              </button>

              <button
                onClick={() => e2eeActions.reset()}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                重置
              </button>
            </div>
          </div>
        </div>

        {/* 测试结果 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">测试结果</h2>
          
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-3 p-3 rounded-md ${
                  result.result ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                {result.result ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <div className="font-medium text-gray-900">{result.test}</div>
                  <div className="text-sm text-gray-600">{result.message}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 加密/解密结果 */}
        {(encryptedMessage || decryptedMessage) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">加密/解密结果</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {encryptedMessage && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>加密结果</span>
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-600 mb-2">算法: {encryptedMessage.algorithm}</div>
                    <div className="text-sm text-gray-600 mb-2">计数器: {encryptedMessage.counter}</div>
                    <div className="text-sm text-gray-600 mb-2">IV: {encryptedMessage.iv.slice(0, 16)}...</div>
                    <div className="text-sm text-gray-600">
                      密文: {encryptedMessage.ciphertext.slice(0, 50)}...
                    </div>
                  </div>
                </div>
              )}

              {decryptedMessage && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <Unlock className="w-4 h-4" />
                    <span>解密结果</span>
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-600">
                      明文: &quot;{decryptedMessage}&quot;
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 错误信息 */}
        {e2eeState.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-700">错误信息</span>
            </div>
            <p className="text-red-600 mt-2">{e2eeState.error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
