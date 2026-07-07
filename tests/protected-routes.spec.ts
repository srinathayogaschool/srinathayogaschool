import { test, expect } from '@playwright/test'

test.describe('Protected Routes', () => {
  const adminPaths = [
    '/dashboard',
    '/dashboard/orders',
    '/dashboard/checkout',
    '/dashboard/resources',
    '/dashboard/certificates',
    '/dashboard/calendar',
  ]

  for (const path of adminPaths) {
    test(`${path} redirects unauthenticated users to admin login`, async ({ page }) => {
      await page.goto(path)
      await page.waitForURL(/\/dashboard\/login/, { timeout: 10000 })
      await expect(page.locator('h1')).toContainText('Admin Login')
    })
  }

  test('admin login page renders correctly', async ({ page }) => {
    await page.goto('/dashboard/login')
    await expect(page.locator('h1')).toContainText('Admin Login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })
})
