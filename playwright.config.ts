import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'
config({ path: '.env.local' })

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  workers: 2,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
  ],
})
