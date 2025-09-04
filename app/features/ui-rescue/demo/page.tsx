'use client'

import React, { useState } from 'react'
import { TgInput, TgButton, TgModal } from '@/features/ui-rescue/components'

export default function TgRescueDemo() {
  const [inputValue, setInputValue] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [inputError, setInputError] = useState(false)

  const handleInputChange = (value: string) => {
    setInputValue(value)
    setInputError(value.length < 3)
  }

  return (
    <div className="tg-min-h-screen tg-bg-gray-50 tg-py-8">
      <div className="tg-max-w-2xl tg-mx-auto tg-px-4">
        <h1 className="tg-text-3xl tg-font-bold tg-text-gray-900 tg-mb-8">
          Telegram UI Rescue 演示
        </h1>

        <div className="tg-bg-white tg-rounded-xl tg-shadow-lg tg-p-6 tg-space-y-6">
          {/* 输入框演示 */}
          <section>
            <h2 className="tg-text-xl tg-font-semibold tg-text-gray-800 tg-mb-4">
              输入框组件
            </h2>
            
            <div className="tg-space-y-4">
              <TgInput
                label="基础输入框"
                placeholder="请输入内容"
                value={inputValue}
                onChange={handleInputChange}
                helpText="这是一个帮助文本"
              />

              <TgInput
                label="错误状态输入框"
                placeholder="请输入内容"
                error={inputError}
                errorMessage={inputError ? "内容长度不能少于3个字符" : undefined}
                helpText="当输入内容少于3个字符时会显示错误"
              />

              <TgInput
                label="禁用输入框"
                placeholder="禁用状态"
                disabled
                defaultValue="禁用内容"
              />

              <TgInput
                label="大尺寸输入框"
                size="lg"
                placeholder="大尺寸输入框"
                helpText="这是大尺寸的输入框"
              />
            </div>
          </section>

          {/* 按钮演示 */}
          <section>
            <h2 className="tg-text-xl tg-font-semibold tg-text-gray-800 tg-mb-4">
              按钮组件
            </h2>
            
            <div className="tg-space-y-4">
              <div className="tg-flex tg-gap-4 tg-flex-wrap">
                <TgButton variant="primary" onClick={() => setModalOpen(true)}>
                  主要按钮
                </TgButton>
                
                <TgButton variant="secondary">
                  次要按钮
                </TgButton>
                
                <TgButton variant="outline">
                  轮廓按钮
                </TgButton>
                
                <TgButton variant="ghost">
                  幽灵按钮
                </TgButton>
                
                <TgButton variant="danger">
                  危险按钮
                </TgButton>
              </div>

              <div className="tg-flex tg-gap-4 tg-flex-wrap">
                <TgButton size="sm">
                  小按钮
                </TgButton>
                
                <TgButton size="md">
                  中按钮
                </TgButton>
                
                <TgButton size="lg">
                  大按钮
                </TgButton>
              </div>

              <div className="tg-flex tg-gap-4 tg-flex-wrap">
                <TgButton disabled>
                  禁用按钮
                </TgButton>
                
                <TgButton loading>
                  加载按钮
                </TgButton>
                
                <TgButton fullWidth>
                  全宽按钮
                </TgButton>
              </div>
            </div>
          </section>

          {/* 模态框演示 */}
          <section>
            <h2 className="tg-text-xl tg-font-semibold tg-text-gray-800 tg-mb-4">
              模态框组件
            </h2>
            
            <TgButton variant="primary" onClick={() => setModalOpen(true)}>
              打开模态框
            </TgButton>
          </section>
        </div>

        {/* 隔离验证 */}
        <div className="tg-mt-8 tg-bg-white tg-rounded-xl tg-shadow-lg tg-p-6">
          <h2 className="tg-text-xl tg-font-semibold tg-text-gray-800 tg-mb-4">
            样式隔离验证
          </h2>
          
          <p className="tg-text-gray-600 tg-mb-4">
            下面的元素使用标准 HTML 和 CSS，应该不受 tg- 前缀样式影响：
          </p>
          
          <div className="tg-space-y-4">
            <input 
              type="text" 
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="标准 HTML 输入框（无 tg- 前缀）"
            />
            
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              标准 HTML 按钮（无 tg- 前缀）
            </button>
            
            <div className="p-4 bg-gray-100 rounded-md">
              <p className="text-gray-700">
                这个区域使用标准的 Tailwind 类名，应该保持原有样式。
                如果样式被污染，说明隔离失败。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 模态框 */}
      <TgModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="演示模态框"
        description="这是一个使用 TgModal 组件创建的模态框"
      >
        <div className="tg-space-y-4">
          <p className="tg-text-gray-700">
            这个模态框使用了 Telegram UI Rescue 组件系统，具有完整的可访问性支持。
          </p>
          
          <TgInput
            label="模态框内的输入框"
            placeholder="在模态框内输入内容"
            helpText="这个输入框在模态框内"
          />
          
          <div className="tg-flex tg-justify-end tg-gap-2">
            <TgButton variant="secondary" onClick={() => setModalOpen(false)}>
              取消
            </TgButton>
            <TgButton variant="primary" onClick={() => setModalOpen(false)}>
              确认
            </TgButton>
          </div>
        </div>
      </TgModal>
    </div>
  )
}
