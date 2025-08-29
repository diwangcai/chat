import { test, expect } from '@playwright/test'

test('发送-回显-刷新仍在', async ({ page }) => {
  // 直接到首页并注入登录态
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => {
    try { window.localStorage.setItem('chat:user', JSON.stringify({ id: 'e2e-user', name: 'E2E用户', isAdmin: false })) } catch {}
  })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.getByTestId('chat-root').waitFor({ state: 'visible', timeout: 15000 })
  await page.getByTestId('chat-input').waitFor({ state: 'visible', timeout: 15000 })
  await page.getByTestId('chat-input').click()
  await page.getByTestId('chat-input').type('hello from e2e')
  // 使用回车发送，避免按钮禁用状态的时序问题
  await page.getByTestId('chat-input').press('Enter')
  // 等待 /api/chat 响应并校验假模型命中
  const resp = await page.waitForResponse(r => r.url().includes('/api/chat') && r.ok(), { timeout: 15000 })
  const data = await resp.json()
  expect(String(data.content || '')).toContain('AI复读')
  await page.reload()
  // 刷新后校验本地存储的会话消息仍包含发送内容
  const persisted = await page.evaluate(() => {
    try { return window.localStorage.getItem('chat:messages:1') || '' } catch { return '' }
  })
  expect(persisted).toContain('hello from e2e')
})


