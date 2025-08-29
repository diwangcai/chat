import { test, expect } from '@playwright/test'

test.describe('好友功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('添加好友功能', async ({ page }) => {
    // 打开侧边栏
    await page.click('[aria-label="菜单"]')
    
    // 切换到好友标签
    await page.click('text=好友')
    
    // 点击添加好友按钮
    await page.click('[aria-label="添加好友"]')
    
    // 输入好友ID
    await page.fill('input[placeholder="输入用户ID"]', 'test-user-123')
    
    // 点击添加按钮
    await page.click('text=添加')
    
    // 验证好友已添加
    await expect(page.locator('text=用户test-user-123')).toBeVisible()
  })

  test('删除好友功能', async ({ page }) => {
    // 先添加一个好友
    await page.click('[aria-label="菜单"]')
    await page.click('text=好友')
    await page.click('[aria-label="添加好友"]')
    await page.fill('input[placeholder="输入用户ID"]', 'test-user-456')
    await page.click('text=添加')
    
    // 删除好友
    await page.click('[aria-label="删除好友"]')
    
    // 验证好友已删除
    await expect(page.locator('text=用户test-user-456')).not.toBeVisible()
  })

  test('搜索好友功能', async ({ page }) => {
    // 添加多个好友
    await page.click('[aria-label="菜单"]')
    await page.click('text=好友')
    
    // 添加第一个好友
    await page.click('[aria-label="添加好友"]')
    await page.fill('input[placeholder="输入用户ID"]', 'user-1')
    await page.click('text=添加')
    
    // 添加第二个好友
    await page.click('[aria-label="添加好友"]')
    await page.fill('input[placeholder="输入用户ID"]', 'user-2')
    await page.click('text=添加')
    
    // 搜索好友
    await page.fill('input[placeholder="搜索好友..."]', 'user-1')
    
    // 验证只显示匹配的好友
    await expect(page.locator('text=用户user-1')).toBeVisible()
    await expect(page.locator('text=用户user-2')).not.toBeVisible()
  })

  test('选择好友开始对话', async ({ page }) => {
    // 添加好友
    await page.click('[aria-label="菜单"]')
    await page.click('text=好友')
    await page.click('[aria-label="添加好友"]')
    await page.fill('input[placeholder="输入用户ID"]', 'friend-123')
    await page.click('text=添加')
    
    // 点击好友开始对话
    await page.click('text=用户friend-123')
    
    // 验证侧边栏关闭
    await expect(page.locator('.sidebar')).not.toBeVisible()
    
    // 验证对话已创建
    await expect(page.locator('text=用户friend-123')).toBeVisible()
  })

  test('弹层交互规范', async ({ page }) => {
    // 打开添加好友弹层
    await page.click('[aria-label="菜单"]')
    await page.click('text=好友')
    await page.click('[aria-label="添加好友"]')
    
    // 验证弹层显示
    await expect(page.locator('text=添加好友')).toBeVisible()
    
    // 点击外部关闭
    await page.click('.modal-overlay')
    await expect(page.locator('text=添加好友')).not.toBeVisible()
    
    // 再次打开
    await page.click('[aria-label="添加好友"]')
    
    // Escape 键关闭
    await page.keyboard.press('Escape')
    await expect(page.locator('text=添加好友')).not.toBeVisible()
  })

  test('移动端适配', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 })
    
    // 打开侧边栏
    await page.click('[aria-label="菜单"]')
    
    // 验证侧边栏正确显示
    await expect(page.locator('.sidebar')).toBeVisible()
    
    // 切换到好友标签
    await page.click('text=好友')
    
    // 验证好友列表正确显示
    await expect(page.locator('text=好友列表')).toBeVisible()
  })
})
