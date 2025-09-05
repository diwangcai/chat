import { test, expect } from '@playwright/test';

test('basic page loading', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
  expect(page.url()).toContain('localhost');
});

test('login page loads', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/.+/);
  expect(page.url()).toContain('localhost');
});

test('chat page loads', async ({ page }) => {
  await page.goto('/chats');
  await expect(page).toHaveTitle(/.+/);
  expect(page.url()).toContain('localhost');
});

test('encryption test page loads', async ({ page }) => {
  await page.goto('/encryption-test');
  await expect(page).toHaveTitle(/.+/);
  expect(page.url()).toContain('localhost');
});

test('API health check', async ({ page }) => {
  const response = await page.request.get('/api/health');
  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data.status).toBe('ok');
});