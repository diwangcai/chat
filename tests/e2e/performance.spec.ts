import { test, expect } from '@playwright/test'

test.describe('性能测试', () => {
  test('健康检查API响应时间', async ({ page }) => {
    const startTime = Date.now()
    const response = await page.request.get('/api/health')
    const endTime = Date.now()
    
    expect(response.status()).toBe(200)
    expect(endTime - startTime).toBeLessThan(1000) // 响应时间应小于1秒
  })

  test('性能监控API', async ({ page }) => {
    const response = await page.request.get('/api/performance')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe('ok')
    expect(data.data.memory).toBeDefined()
    expect(data.data.cpu).toBeDefined()
    expect(data.responseTime).toBeLessThan(500) // 监控API响应时间应小于500ms
  })

  test('页面加载性能', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    const endTime = Date.now()
    
    // 页面加载时间应小于3秒
    expect(endTime - startTime).toBeLessThan(3000)
    
    // 验证关键元素快速显示
    await expect(page.locator('h1')).toBeVisible({ timeout: 2000 })
  })

  test('聊天页面性能', async ({ page }) => {
    // 先登录
    await page.goto('/')
    await page.fill('input[placeholder="请输入用户名"]', 'testuser')
    await page.fill('input[placeholder="请输入密码"]', 'password123')
    await page.click('button:has-text("登录")')
    
    const startTime = Date.now()
    await expect(page).toHaveURL('/chats')
    const endTime = Date.now()
    
    // 聊天页面加载时间应小于2秒
    expect(endTime - startTime).toBeLessThan(2000)
    
    // 验证关键组件快速显示
    await expect(page.locator('[data-testid="conversation-list"]')).toBeVisible({ timeout: 1500 })
  })

  test('API缓存控制', async ({ page }) => {
    const response = await page.request.get('/api/health')
    const cacheControl = response.headers()['cache-control']
    
    // API响应不应被缓存
    expect(cacheControl).toContain('no-cache')
  })

  test('静态资源缓存', async ({ page }) => {
    // 测试静态资源是否有正确的缓存头
    const response = await page.request.get('/_next/static/css/app/globals.css')
    if (response.status() === 200) {
      const cacheControl = response.headers()['cache-control']
      expect(cacheControl).toContain('max-age=31536000')
    }
  })

  test('Service Worker缓存', async ({ page }) => {
    const response = await page.request.get('/sw.js')
    expect(response.status()).toBe(200)
    
    const cacheControl = response.headers()['cache-control']
    expect(cacheControl).toContain('no-cache')
  })
})
