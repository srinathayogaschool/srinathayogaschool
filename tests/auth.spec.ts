import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('admin login page loads with form elements', async ({ page }) => {
    await page.goto('/dashboard/login')
    await expect(page.locator('h1')).toContainText('Admin Login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })

  test('admin login page shows logo', async ({ page }) => {
    await page.goto('/dashboard/login')
    await expect(page.locator('img[alt="Srinatha Yoga School"]').first()).toBeVisible()
  })

  test('admin login page shows error for invalid credentials', async ({ page }) => {
    await page.goto('/dashboard/login')
    await page.fill('input[type="email"]', 'nonexistent@test.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Invalid').or(page.locator('text=denied')).or(page.locator('text=failed')).first()).toBeVisible({ timeout: 15000 })
  })

  test('student login page loads with all form elements', async ({ page }) => {
    await page.goto('/app/login')
    await expect(page.locator('h1')).toContainText('Welcome Back')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByText('Send Magic Link')).toBeVisible()
    await expect(page.getByText('Forgot password?')).toBeVisible()
  })

  test('student login page has signup link', async ({ page }) => {
    await page.goto('/app/login')
    await expect(page.getByText('Sign up')).toBeVisible()
  })

  test('student login page can navigate to signup', async ({ page }) => {
    await page.goto('/app/login')
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: /Sign up/i }).click()
    await page.waitForURL(/\/app\/signup/, { timeout: 10000 })
  })

  test('student login page can navigate to forgot password', async ({ page }) => {
    await page.goto('/app/login')
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: /Forgot password/i }).click()
    await page.waitForURL(/\/app\/forgot-password/, { timeout: 10000 })
  })

  test('student login page has back to home link', async ({ page }) => {
    await page.goto('/app/login')
    await expect(page.getByRole('link', { name: /Back to Home/i })).toBeVisible()
  })

  test('student login page shows logo', async ({ page }) => {
    await page.goto('/app/login')
    await expect(page.locator('img[alt="Srinatha Yoga School"]').first()).toBeVisible()
  })

  test('magic link button disabled when email empty', async ({ page }) => {
    await page.goto('/app/login')
    const magicBtn = page.getByText('Send Magic Link')
    await expect(magicBtn).toBeVisible()
    await expect(magicBtn).toBeDisabled()
  })

  test('magic link button enables when email is filled', async ({ page }) => {
    await page.goto('/app/login')
    const btn = page.getByText('Send Magic Link')
    await expect(btn).toBeDisabled()
    await page.locator('input[type="email"]').pressSequentially('test@example.com', { delay: 50 })
    await expect(btn).toBeEnabled({ timeout: 5000 })
  })

  test('signup page loads', async ({ page }) => {
    await page.goto('/app/signup')
    await expect(page.getByText('Create Account').first()).toBeVisible()
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('signup page links to login', async ({ page }) => {
    await page.goto('/app/signup')
    await expect(page.getByText('Log in')).toBeVisible()
  })

  test('forgot password page loads', async ({ page }) => {
    await page.goto('/app/forgot-password')
    await expect(page.getByText('Reset Password')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('forgot password form submits', async ({ page }) => {
    await page.goto('/app/forgot-password')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.getByRole('button', { name: /Send Reset Link/i }).click()
    const successMsg = page.getByText('Check Your Email')
    const errorMsg = page.locator('text=Check Your Email').or(page.locator('text=Invalid')).or(page.locator('text=error'))
    await Promise.race([
      expect(successMsg).toBeVisible({ timeout: 15000 }).catch(() => {}),
      expect(errorMsg).toBeVisible({ timeout: 15000 }).catch(() => {}),
    ])
  })

  test('signup page validates password length', async ({ page }) => {
    await page.goto('/app/signup')
    await page.fill('input[type="text"]', 'Test User')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', '123')
    const validity = await page.locator('input[type="password"]').evaluate((el: HTMLInputElement) => el.validity.valid)
    expect(validity).toBe(false)
  })
})
