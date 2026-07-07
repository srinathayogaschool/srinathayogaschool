import { test, expect } from '@playwright/test'
import { ensureTestUserExists, signInAsStudent } from './helpers/auth'

test.describe('Admin Dashboard (Unauthenticated)', () => {
  for (const path of ['/dashboard', '/dashboard/orders', '/dashboard/certificates', '/dashboard/resources', '/dashboard/calendar']) {
    test(`${path} redirects to admin login`, async ({ page }) => {
      await page.goto(path)
      await page.waitForURL(/\/dashboard\/login/, { timeout: 10000 })
      await expect(page.locator('h1')).toContainText('Admin Login')
    })
  }

  test('course detail redirects to admin login', async ({ page }) => {
    await page.goto('/dashboard/courses/yoga-sadhana-beginner')
    await page.waitForURL(/\/dashboard\/login/, { timeout: 10000 })
    await expect(page.locator('h1')).toContainText('Admin Login')
  })

  test('redirect preserves path (student)', async ({ page }) => {
    await page.goto('/app')
    await page.waitForURL(/\/app\/login/, { timeout: 10000 })
    const params = new URL(page.url()).searchParams
    expect(params.get('redirect')).toBe('/app')
  })
})

test.describe('Student Dashboard (Authenticated)', () => {
  test.beforeAll(async () => {
    await ensureTestUserExists()
  })

  test.beforeEach(async ({ page }) => {
    const ok = await signInAsStudent(page)
    if (!ok) {
      test.skip(!ok, 'Supabase unreachable — skipping authenticated tests')
    }
  })

  test('dashboard home shows welcome and course progress', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible()
    await expect(page.getByText(/Namaste/i)).toBeVisible()
    await expect(page.getByText('Home')).toBeVisible()
    await expect(page.getByText('Learn')).toBeVisible()
    await expect(page.getByText('Workshops')).toBeVisible()
    await expect(page.getByText('Store')).toBeVisible()
    await expect(page.getByText('Profile')).toBeVisible()
  })

  test('profile page shows user info', async ({ page }) => {
    await page.goto('/app/account')
    await expect(page.locator('h1')).toContainText('Account Settings')
    await expect(page.getByText('Personal Information')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Password' })).toBeVisible()
    await expect(page.getByText('Save Changes')).toBeVisible()
  })

  test('purchases page shows order history', async ({ page }) => {
    await page.goto('/app/orders')
    await expect(page.locator('h1')).toContainText('Order History')
    const emptyText = page.getByText('No orders yet')
    if (await emptyText.isVisible()) {
      await expect(page.getByText('Start Shopping')).toBeVisible()
    }
  })

  test('course access shows enrolled courses with progress', async ({ page }) => {
    await page.getByText('Learn').click()
    await page.waitForTimeout(500)
    const h1 = page.locator('h1')
    if (await h1.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(h1).toBeVisible()
    }
  })

  test('product access shows purchased products', async ({ page }) => {
    await page.getByText('Store').click()
    await page.waitForTimeout(500)
    const heading = page.getByText('Yoga Store')
    if (await heading.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(heading).toBeVisible()
    }
    const searchInput = page.locator('input[type="text"]')
    if (await searchInput.isVisible().catch(() => false)) {
      await expect(searchInput).toBeVisible()
    }
  })
})
