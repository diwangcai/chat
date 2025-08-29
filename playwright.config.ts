import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'cross-env NEXT_PUBLIC_E2E=1 FAKE_AI=1 npm run build && cross-env NEXT_PUBLIC_E2E=1 FAKE_AI=1 npm run start',
    url: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    reuseExistingServer: true,
    stdout: 'pipe',
    stderr: 'pipe'
  }
})


