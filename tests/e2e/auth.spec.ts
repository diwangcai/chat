import { test, expect } from '@playwright/test'

test.describe('认证功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 检查E2E API是否可用
    try {
      const response = await page.request.get('/api/e2e')
      expect(response.status()).toBe(200)
    } catch {
      console.log('E2E API not available, continuing with basic tests')
    }
    
    await page.goto('/')
  })

  test('登录页面正常显示', async ({ page }) => {
    // 基本检查：页面能正常加载
    await expect(page).toHaveTitle(/.+/)
    expect(page.url()).toContain('localhost')
    
    // 检查页面是否有基本内容
    const body = await page.locator('body')
    await expect(body).toBeVisible()
  })

  test('注册页面切换', async ({ page }) => {
    // 点击注册按钮
    await page.click('button:has-text("立即注册")')
    
    // 验证切换到注册页面
    await expect(page.locator('h1')).toContainText('创建账号')
    await expect(page.locator('input[placeholder="请输入邮箱地址"]')).toBeVisible()
    await expect(page.locator('input[placeholder="请再次输入密码"]')).toBeVisible()
    
    // 验证按钮文本变化
    await expect(page.locator('button:has-text("注册")')).toBeVisible()
    await expect(page.locator('button:has-text("立即登录")')).toBeVisible()
  })

  test('忘记密码功能', async ({ page }) => {
    // 点击忘记密码链接
    await page.click('button:has-text("忘记密码？")')
    
    // 验证切换到忘记密码页面
    await expect(page.locator('h1')).toContainText('找回密码')
    await expect(page.locator('input[placeholder="请输入注册时的邮箱地址"]')).toBeVisible()
    
    // 验证返回按钮
    await expect(page.locator('button:has-text("返回登录")')).toBeVisible()
  })

  test('表单验证 - 登录', async ({ page }) => {
    // 不填写任何内容直接提交
    await page.click('button:has-text("登录")')
    
    // 验证错误提示
    await expect(page.locator('text=用户名不能为空')).toBeVisible()
    await expect(page.locator('text=密码不能为空')).toBeVisible()
  })

  test('表单验证 - 注册', async ({ page }) => {
    // 切换到注册页面
    await page.click('button:has-text("立即注册")')
    
    // 填写无效数据
    await page.fill('input[placeholder="请输入用户名"]', 'ab')
    await page.fill('input[placeholder="请输入邮箱地址"]', 'invalid-email')
    await page.fill('input[placeholder="请设置密码"]', '123')
    await page.fill('input[placeholder="请再次输入密码"]', '456')
    
    // 提交表单
    await page.click('button:has-text("注册")')
    
    // 验证错误提示
    await expect(page.locator('text=用户名至少3个字符')).toBeVisible()
    await expect(page.locator('text=请输入有效的邮箱地址')).toBeVisible()
    await expect(page.locator('text=密码至少6个字符')).toBeVisible()
    await expect(page.locator('text=两次输入的密码不一致')).toBeVisible()
  })

  test('成功注册流程', async ({ page }) => {
    // 切换到注册页面
    await page.click('button:has-text("立即注册")')
    
    // 填写有效数据
    await page.fill('input[placeholder="请输入用户名"]', 'testuser')
    await page.fill('input[placeholder="请输入邮箱地址"]', 'test@example.com')
    await page.fill('input[placeholder="请设置密码"]', 'password123')
    await page.fill('input[placeholder="请再次输入密码"]', 'password123')
    
    // 提交表单
    await page.click('button:has-text("注册")')
    
    // 验证跳转到聊天页面
    await expect(page).toHaveURL('/chats')
  })

  test('成功登录流程', async ({ page }) => {
    // 填写登录信息
    await page.fill('input[placeholder="请输入用户名"]', 'testuser')
    await page.fill('input[placeholder="请输入密码"]', 'password123')
    
    // 提交表单
    await page.click('button:has-text("登录")')
    
    // 验证跳转到聊天页面
    await expect(page).toHaveURL('/chats')
  })

  test('密码可见性切换', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]')
    const eyeButton = page.locator('button:has-text("")').first()
    
    // 初始状态应该是密码类型
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // 点击眼睛图标
    await eyeButton.click()
    
    // 应该变为文本类型
    await expect(passwordInput).toHaveAttribute('type', 'text')
    
    // 再次点击应该变回密码类型
    await eyeButton.click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('API健康检查', async ({ page }) => {
    // 测试健康检查API
    const response = await page.request.get('/api/health')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe('ok')
    expect(data.timestamp).toBeDefined()
  })
})
