import { test, expect } from '@playwright/test'

test.describe('聊天功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    await page.goto('/')
    await page.fill('input[placeholder="请输入用户名"]', 'testuser')
    await page.fill('input[placeholder="请输入密码"]', 'password123')
    await page.click('button:has-text("登录")')
    
    // 等待跳转到聊天页面
    await expect(page).toHaveURL('/chats')
  })

  test('聊天页面正常显示', async ({ page }) => {
    // 验证页面标题
    await expect(page.locator('h1:has-text("聊天")')).toBeVisible()
    
    // 验证底部导航
    await expect(page.locator('button:has-text("聊天")')).toBeVisible()
    await expect(page.locator('button:has-text("联系人")')).toBeVisible()
    await expect(page.locator('button:has-text("探索")')).toBeVisible()
  })

  test('会话列表显示', async ({ page }) => {
    // 验证会话列表存在
    await expect(page.locator('[data-testid="conversation-list"]')).toBeVisible()
    
    // 验证至少有一个会话
    await expect(page.locator('[data-testid="conversation-item"]')).toHaveCount(1)
  })

  test('进入聊天对话', async ({ page }) => {
    // 点击第一个会话
    await page.click('[data-testid="conversation-item"]:first-child')
    
    // 验证进入聊天界面
    await expect(page.locator('[data-testid="chat-header"]')).toBeVisible()
    await expect(page.locator('[data-testid="message-list"]')).toBeVisible()
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible()
  })

  test('发送文本消息', async ({ page }) => {
    // 进入聊天对话
    await page.click('[data-testid="conversation-item"]:first-child')
    
    // 输入消息
    const messageInput = page.locator('[data-testid="message-input"]')
    await messageInput.fill('Hello, this is a test message!')
    
    // 发送消息
    await page.click('[data-testid="send-button"]')
    
    // 验证消息出现在列表中
    await expect(page.locator('text=Hello, this is a test message!')).toBeVisible()
  })

  test('消息状态显示', async ({ page }) => {
    // 进入聊天对话
    await page.click('[data-testid="conversation-item"]:first-child')
    
    // 发送消息
    await page.locator('[data-testid="message-input"]').fill('Test message')
    await page.click('[data-testid="send-button"]')
    
    // 验证消息状态（两个蓝色对号）
    await expect(page.locator('[data-testid="message-status"] svg')).toBeVisible()
  })

  test('加密状态显示', async ({ page }) => {
    // 进入聊天对话
    await page.click('[data-testid="conversation-item"]:first-child')
    
    // 验证加密状态区域存在
    await expect(page.locator('[data-testid="encryption-status"]')).toBeVisible()
  })

  test('底部导航切换', async ({ page }) => {
    // 切换到联系人页面
    await page.click('button:has-text("联系人")')
    await expect(page.locator('h1:has-text("联系人")')).toBeVisible()
    
    // 切换到探索页面
    await page.click('button:has-text("探索")')
    await expect(page.locator('h1:has-text("探索")')).toBeVisible()
    
    // 切换回聊天页面
    await page.click('button:has-text("聊天")')
    await expect(page.locator('h1:has-text("聊天")')).toBeVisible()
  })

  test('移动端响应式测试', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 })
    
    // 验证移动端布局
    await expect(page.locator('h1:has-text("聊天")')).toBeVisible()
    
    // 进入聊天对话
    await page.click('[data-testid="conversation-item"]:first-child')
    
    // 验证移动端聊天界面
    await expect(page.locator('[data-testid="chat-header"]')).toBeVisible()
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible()
  })

  test('键盘快捷键', async ({ page }) => {
    // 进入聊天对话
    await page.click('[data-testid="conversation-item"]:first-child')
    
    // 输入消息
    const messageInput = page.locator('[data-testid="message-input"]')
    await messageInput.fill('Test message with Enter key')
    
    // 按Enter键发送
    await messageInput.press('Enter')
    
    // 验证消息发送成功
    await expect(page.locator('text=Test message with Enter key')).toBeVisible()
  })

  test('消息输入框焦点', async ({ page }) => {
    // 进入聊天对话
    await page.click('[data-testid="conversation-item"]:first-child')
    
    // 验证输入框获得焦点
    const messageInput = page.locator('[data-testid="message-input"]')
    await expect(messageInput).toBeFocused()
  })
})
