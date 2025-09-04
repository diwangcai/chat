import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Telegram UI Rescue 可访问性测试
test.describe('Telegram UI Rescue - 可访问性测试', () => {
  test('TgInput 组件可访问性检查', async ({ page }) => {
    // 创建测试页面
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TgInput 可访问性测试</title>
        <link rel="stylesheet" href="/features/ui-rescue/styles/index.css">
      </head>
      <body>
        <div class="tg-p-8">
          <h1>输入框可访问性测试</h1>
          
          <!-- 基础输入框 -->
          <div class="tg-mb-4">
            <label class="tg-block tg-text-sm tg-font-medium tg-text-gray-700 tg-mb-1" for="basic-input">
              基础输入框
            </label>
            <input 
              id="basic-input"
              type="text" 
              class="tg-w-full tg-h-11 tg-px-3 tg-text-base tg-border tg-border-solid tg-rounded-lg tg-bg-white tg-text-gray-900 tg-placeholder-gray-500 tg-transition-all tg-duration-200 tg-ease-out tg-outline-none tg-reset"
              placeholder="请输入内容"
              aria-label="基础输入框"
            />
          </div>

          <!-- 带错误状态的输入框 -->
          <div class="tg-mb-4">
            <label class="tg-block tg-text-sm tg-font-medium tg-text-gray-700 tg-mb-1" for="error-input">
              错误输入框
            </label>
            <input 
              id="error-input"
              type="text" 
              class="tg-w-full tg-h-11 tg-px-3 tg-text-base tg-border tg-border-solid tg-rounded-lg tg-bg-white tg-text-gray-900 tg-placeholder-gray-500 tg-transition-all tg-duration-200 tg-ease-out tg-outline-none tg-reset tg-border-red-500"
              placeholder="请输入内容"
              aria-label="错误输入框"
              aria-invalid="true"
            />
            <p class="tg-mt-1 tg-text-sm tg-text-red-600" role="alert">
              请输入有效内容
            </p>
          </div>

          <!-- 禁用输入框 -->
          <div class="tg-mb-4">
            <label class="tg-block tg-text-sm tg-font-medium tg-text-gray-700 tg-mb-1" for="disabled-input">
              禁用输入框
            </label>
            <input 
              id="disabled-input"
              type="text" 
              class="tg-w-full tg-h-11 tg-px-3 tg-text-base tg-border tg-border-solid tg-rounded-lg tg-bg-gray-50 tg-text-gray-500 tg-placeholder-gray-500 tg-transition-all tg-duration-200 tg-ease-out tg-outline-none tg-reset tg-cursor-not-allowed"
              placeholder="禁用状态"
              disabled
              aria-label="禁用输入框"
            />
          </div>
        </div>
      </body>
      </html>
    `)

    // 运行 axe-core 检查
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    // 检查是否有违规
    expect(accessibilityScanResults.violations).toEqual([])

    // 输出详细报告（如果有违规）
    if (accessibilityScanResults.violations.length > 0) {
      console.log('TgInput 可访问性违规详情:')
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id}: ${violation.description}`)
        console.log(`   影响元素: ${violation.nodes.length} 个`)
        violation.nodes.forEach((node, nodeIndex) => {
          console.log(`   ${nodeIndex + 1}. ${node.html}`)
        })
        console.log('')
      })
    }
  })

  test('TgButton 组件可访问性检查', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TgButton 可访问性测试</title>
        <link rel="stylesheet" href="/features/ui-rescue/styles/index.css">
      </head>
      <body>
        <div class="tg-p-8">
          <h1>按钮可访问性测试</h1>
          
          <!-- 主要按钮 -->
          <button 
            class="tg-inline-flex tg-items-center tg-justify-center tg-h-10 tg-px-4 tg-text-base tg-gap-2 tg-border tg-border-solid tg-rounded-md tg-font-medium tg-transition-all tg-duration-200 tg-ease-out tg-outline-none tg-focus-visible tg-reset tg-bg-blue-600 tg-text-white tg-border-blue-600 tg-hover:bg-blue-700 tg-hover:border-blue-700 tg-active:bg-blue-800 tg-active:border-blue-800 tg-focus:ring-blue-500"
            aria-label="主要按钮"
          >
            主要按钮
          </button>

          <!-- 次要按钮 -->
          <button 
            class="tg-inline-flex tg-items-center tg-justify-center tg-h-10 tg-px-4 tg-text-base tg-gap-2 tg-border tg-border-solid tg-rounded-md tg-font-medium tg-transition-all tg-duration-200 tg-ease-out tg-outline-none tg-focus-visible tg-reset tg-bg-gray-100 tg-text-gray-900 tg-border-gray-300 tg-hover:bg-gray-200 tg-hover:border-gray-400 tg-active:bg-gray-300 tg-active:border-gray-500 tg-focus:ring-gray-500"
            aria-label="次要按钮"
          >
            次要按钮
          </button>

          <!-- 禁用按钮 -->
          <button 
            class="tg-inline-flex tg-items-center tg-justify-center tg-h-10 tg-px-4 tg-text-base tg-gap-2 tg-border tg-border-solid tg-rounded-md tg-font-medium tg-transition-all tg-duration-200 tg-ease-out tg-outline-none tg-focus-visible tg-reset tg-bg-gray-300 tg-text-gray-500 tg-border-gray-300 tg-cursor-not-allowed"
            disabled
            aria-label="禁用按钮"
          >
            禁用按钮
          </button>

          <!-- 危险按钮 -->
          <button 
            class="tg-inline-flex tg-items-center tg-justify-center tg-h-10 tg-px-4 tg-text-base tg-gap-2 tg-border tg-border-solid tg-rounded-md tg-font-medium tg-transition-all tg-duration-200 tg-ease-out tg-outline-none tg-focus-visible tg-reset tg-bg-red-600 tg-text-white tg-border-red-600 tg-hover:bg-red-700 tg-hover:border-red-700 tg-active:bg-red-800 tg-active:border-red-800 tg-focus:ring-red-500"
            aria-label="危险按钮"
          >
            删除
          </button>
        </div>
      </body>
      </html>
    `)

    // 运行 axe-core 检查
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    // 检查是否有违规
    expect(accessibilityScanResults.violations).toEqual([])

    // 输出详细报告（如果有违规）
    if (accessibilityScanResults.violations.length > 0) {
      console.log('TgButton 可访问性违规详情:')
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id}: ${violation.description}`)
        console.log(`   影响元素: ${violation.nodes.length} 个`)
        violation.nodes.forEach((node, nodeIndex) => {
          console.log(`   ${nodeIndex + 1}. ${node.html}`)
        })
        console.log('')
      })
    }
  })

  test('TgModal 组件可访问性检查', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TgModal 可访问性测试</title>
        <link rel="stylesheet" href="/features/ui-rescue/styles/index.css">
      </head>
      <body>
        <div class="tg-p-8">
          <h1>模态框可访问性测试</h1>
          
          <!-- 模态框 -->
          <div 
            class="tg-fixed tg-inset-0 tg-z-50 tg-overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <!-- 背景遮罩 -->
            <div class="tg-fixed tg-inset-0 tg-bg-black tg-bg-opacity-50" aria-hidden="true"></div>
            
            <!-- 模态框容器 -->
            <div class="tg-flex tg-min-h-full tg-items-center tg-justify-center tg-p-4">
              <div class="tg-relative tg-w-full tg-max-w-md tg-transform tg-rounded-xl tg-bg-white tg-shadow-xl tg-focus:outline-none">
                <!-- 头部 -->
                <div class="tg-flex tg-items-center tg-justify-between tg-px-6 tg-py-4 tg-border-b tg-border-gray-200">
                  <div class="tg-flex-1">
                    <h2 id="modal-title" class="tg-text-lg tg-font-semibold tg-text-gray-900">
                      模态框标题
                    </h2>
                    <p id="modal-description" class="tg-mt-1 tg-text-sm tg-text-gray-500">
                      这是一个模态框的描述文本
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    class="tg-ml-4 tg-inline-flex tg-items-center tg-justify-center tg-w-8 tg-h-8 tg-rounded-full tg-text-gray-400 tg-hover:text-gray-600 tg-hover:bg-gray-100"
                    aria-label="关闭"
                  >
                    <svg class="tg-w-5 tg-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <!-- 内容区域 -->
                <div class="tg-px-6 tg-py-4">
                  <p class="tg-text-gray-700">这是模态框的内容区域。</p>
                  
                  <div class="tg-mt-4 tg-flex tg-justify-end tg-gap-2">
                    <button 
                      class="tg-inline-flex tg-items-center tg-justify-center tg-h-10 tg-px-4 tg-text-base tg-gap-2 tg-border tg-border-solid tg-rounded-md tg-font-medium tg-transition-all tg-duration-200 tg-ease-out tg-outline-none tg-focus-visible tg-reset tg-bg-gray-100 tg-text-gray-900 tg-border-gray-300 tg-hover:bg-gray-200"
                      aria-label="取消"
                    >
                      取消
                    </button>
                    <button 
                      class="tg-inline-flex tg-items-center tg-justify-center tg-h-10 tg-px-4 tg-text-base tg-gap-2 tg-border tg-border-solid tg-rounded-md tg-font-medium tg-transition-all tg-duration-200 tg-ease-out tg-outline-none tg-focus-visible tg-reset tg-bg-blue-600 tg-text-white tg-border-blue-600"
                      aria-label="确认"
                    >
                      确认
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `)

    // 运行 axe-core 检查
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    // 检查是否有违规
    expect(accessibilityScanResults.violations).toEqual([])

    // 输出详细报告（如果有违规）
    if (accessibilityScanResults.violations.length > 0) {
      console.log('TgModal 可访问性违规详情:')
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id}: ${violation.description}`)
        console.log(`   影响元素: ${violation.nodes.length} 个`)
        violation.nodes.forEach((node, nodeIndex) => {
          console.log(`   ${nodeIndex + 1}. ${node.html}`)
        })
        console.log('')
      })
    }
  })

  test('对比度测试 - 确保所有组件符合 WCAG AA 标准', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>对比度测试</title>
        <link rel="stylesheet" href="/features/ui-rescue/styles/index.css">
      </head>
      <body>
        <div class="tg-p-8">
          <h1>对比度测试</h1>
          
          <!-- 测试各种颜色组合 -->
          <div class="tg-space-y-4">
            <!-- 主要按钮 - 蓝色背景白色文字 -->
            <button class="tg-bg-blue-600 tg-text-white tg-px-4 tg-py-2 tg-rounded">
              主要按钮 (蓝色背景白色文字)
            </button>
            
            <!-- 次要按钮 - 灰色背景深色文字 -->
            <button class="tg-bg-gray-100 tg-text-gray-900 tg-px-4 tg-py-2 tg-rounded">
              次要按钮 (灰色背景深色文字)
            </button>
            
            <!-- 危险按钮 - 红色背景白色文字 -->
            <button class="tg-bg-red-600 tg-text-white tg-px-4 tg-py-2 tg-rounded">
              危险按钮 (红色背景白色文字)
            </button>
            
            <!-- 输入框 - 白色背景深色文字 -->
            <input 
              type="text" 
              class="tg-bg-white tg-text-gray-900 tg-border tg-border-gray-300 tg-px-3 tg-py-2 tg-rounded"
              placeholder="输入框 (白色背景深色文字)"
            />
          </div>
        </div>
      </body>
      </html>
    `)

    // 运行对比度检查
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('button, input')
      .analyze()

    // 检查对比度违规
    const contrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast' || violation.id === 'color-contrast-enhanced'
    )

    // 如果有对比度问题，输出详细信息
    if (contrastViolations.length > 0) {
      console.log('对比度问题详情:')
      contrastViolations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.description}`)
        violation.nodes.forEach((node, nodeIndex) => {
          console.log(`   元素 ${nodeIndex + 1}: ${node.html}`)
          console.log(`   预期对比度: ${node.any[0]?.data?.expectedContrastRatio}`)
          console.log(`   实际对比度: ${node.any[0]?.data?.actualContrastRatio}`)
        })
      })
    }

    // 这个测试应该通过，除非真的有对比度问题
    expect(contrastViolations).toEqual([])
  })

  test('键盘导航测试', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>键盘导航测试</title>
        <link rel="stylesheet" href="/features/ui-rescue/styles/index.css">
      </head>
      <body>
        <div class="tg-p-8">
          <h1>键盘导航测试</h1>
          
          <div class="tg-space-y-4">
            <button class="tg-bg-blue-600 tg-text-white tg-px-4 tg-py-2 tg-rounded" tabindex="0">
              按钮 1
            </button>
            <input 
              type="text" 
              class="tg-bg-white tg-text-gray-900 tg-border tg-border-gray-300 tg-px-3 tg-py-2 tg-rounded"
              placeholder="输入框"
              tabindex="0"
            />
            <button class="tg-bg-gray-100 tg-text-gray-900 tg-px-4 tg-py-2 tg-rounded" tabindex="0">
              按钮 2
            </button>
          </div>
        </div>
      </body>
      </html>
    `)

    // 测试 Tab 键导航
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // 检查焦点是否在可交互元素上
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(['BUTTON', 'INPUT', 'TEXTAREA', 'A', 'SELECT']).toContain(focusedElement)

    // 测试 Enter 键激活
    await page.keyboard.press('Enter')

    // 页面应该仍然正常加载
    await page.waitForLoadState('networkidle')
  })
})
