import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// 可访问性测试配置
const a11yConfig = {
  rules: {
    // 关键的可访问性规则
    'color-contrast': { enabled: true },
    'color-contrast-enhanced': { enabled: true },
    'button-name': { enabled: true },
    'image-alt': { enabled: true },
    'input-button-name': { enabled: true },
    'link-name': { enabled: true },
    'heading-order': { enabled: true },
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },
    'landmark-one-main': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'region': { enabled: true },
    'skip-link': { enabled: true },
    'tabindex': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'focusable-content': { enabled: true },
    'interactive-supports-focus': { enabled: true },
    'keyboard': { enabled: true },
    'no-focusable-content': { enabled: true },
    'role-has-required-aria-props': { enabled: true },
    'role-supports-aria-props': { enabled: true },
    'aria-allowed-attr': { enabled: true },
    'aria-allowed-role': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-valid-role': { enabled: true },
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
}

// 测试关键页面的可访问性
test.describe('可访问性测试', () => {
  test('首页可访问性检查', async ({ page }) => {
    await page.goto('/')
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle')
    
    // 运行 axe-core 检查
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    
    // 检查是否有违规
    expect(accessibilityScanResults.violations).toEqual([])
    
    // 输出详细报告（如果有违规）
    if (accessibilityScanResults.violations.length > 0) {
      console.log('可访问性违规详情:')
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

  test('聊天页面可访问性检查', async ({ page }) => {
    await page.goto('/chats')
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle')
    
    // 等待聊天界面渲染
    await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 })
    
    // 运行 axe-core 检查
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    
    // 检查是否有违规
    expect(accessibilityScanResults.violations).toEqual([])
    
    // 输出详细报告（如果有违规）
    if (accessibilityScanResults.violations.length > 0) {
      console.log('聊天页面可访问性违规详情:')
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

  test('联系人页面可访问性检查', async ({ page }) => {
    await page.goto('/chats')
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle')
    
    // 切换到联系人标签
    await page.click('text=联系人')
    await page.waitForTimeout(1000) // 等待内容加载
    
    // 运行 axe-core 检查
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    
    // 检查是否有违规
    expect(accessibilityScanResults.violations).toEqual([])
    
    // 输出详细报告（如果有违规）
    if (accessibilityScanResults.violations.length > 0) {
      console.log('联系人页面可访问性违规详情:')
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

  test('添加好友页面可访问性检查', async ({ page }) => {
    await page.goto('/chats')
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle')
    
    // 切换到联系人标签
    await page.click('text=联系人')
    await page.waitForTimeout(1000)
    
    // 点击搜索框打开添加好友页面
    await page.click('text=搜索用户、群组或频道')
    await page.waitForTimeout(1000)
    
    // 运行 axe-core 检查
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    
    // 检查是否有违规
    expect(accessibilityScanResults.violations).toEqual([])
    
    // 输出详细报告（如果有违规）
    if (accessibilityScanResults.violations.length > 0) {
      console.log('添加好友页面可访问性违规详情:')
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

  test('对比度测试 - 按钮文本与背景同色时应失败', async ({ page }) => {
    // 这个测试用于验证对比度检测是否正常工作
    // 在实际应用中，如果发现对比度问题，这个测试会失败
    
    await page.goto('/chats')
    await page.waitForLoadState('networkidle')
    
    // 运行对比度检查
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('button, input, [role="button"]')
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
    await page.goto('/chats')
    await page.waitForLoadState('networkidle')
    
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
