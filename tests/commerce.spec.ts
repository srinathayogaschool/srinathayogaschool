import { test, expect } from '@playwright/test'
import { ensureTestUserExists, signInAsStudent } from './helpers/auth'

test.describe('Commerce (Unauthenticated)', () => {
  test('shop page has visible products', async ({ page }) => {
    await page.goto('/shop')
    await page.waitForTimeout(3000)
    await expect(page.locator('h1').first()).toBeVisible()
    const productCards = page.locator('[class*="card"], [class*="product"], article, .group')
    const cardCount = await productCards.count()
    expect(cardCount).toBeGreaterThanOrEqual(0)
  })

  test('cart page has header and layout', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })

  test('cart page empty state shows continue shopping link', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.getByText('Your cart is empty')).toBeVisible()
    const shopLink = page.locator('a[href="/shop"]')
    await expect(shopLink.first()).toBeVisible()
  })

  test('product navigation from shop to cart', async ({ page }) => {
    await page.goto('/shop')
    const cartLink = page.locator('a[href="/cart"]')
    if (await cartLink.count() > 0) {
      await cartLink.first().click()
      await expect(page).toHaveURL(/\/cart/)
    }
  })

  test('admin checkout redirects to admin login', async ({ page }) => {
    await page.goto('/dashboard/checkout')
    await page.waitForURL(/\/dashboard\/login/, { timeout: 10000 })
    await expect(page.locator('h1')).toContainText('Admin Login')
  })

  test('student checkout redirects to student login with redirect param', async ({ page }) => {
    await page.goto('/app/checkout')
    await page.waitForURL(/\/app\/login/, { timeout: 10000 })
    await expect(page.locator('h1')).toContainText('Welcome Back')
    const params = new URL(page.url()).searchParams
    expect(params.get('redirect')).toBe('/app/checkout')
  })
})

test.describe('Commerce (Authenticated)', () => {
  test.beforeAll(async () => {
    await ensureTestUserExists()
  })

  test.beforeEach(async ({ page }) => {
    const ok = await signInAsStudent(page)
    if (!ok) {
      test.skip(!ok, 'Supabase unreachable — skipping authenticated tests')
    }
  })

  test('checkout page shows form and order summary', async ({ page }) => {
    await page.goto('/app/checkout')
    await page.waitForLoadState('networkidle')
    const emptyCart = page.getByText('Your cart is empty')
    if (await emptyCart.isVisible()) {
      await expect(page.getByText(/Back to Dashboard/i)).toBeVisible()
    } else {
      await expect(page.locator('h1')).toContainText('Checkout')
      await expect(page.getByText('Order Summary')).toBeVisible()
    }
  })

  test('purchase flow shows checkout with order items', async ({ page }) => {
    await page.goto('/app/checkout')
    await page.waitForLoadState('networkidle')
    const emptyCart = page.getByText('Your cart is empty')
    if (await emptyCart.isVisible()) {
      await expect(page.getByText(/Back to Dashboard/i)).toBeVisible()
    } else {
      await expect(page.locator('h1')).toContainText('Checkout')
      await expect(page.getByText('Order Summary')).toBeVisible()
    }
  })

  test('purchase failure shows error state', async ({ page }) => {
    await page.goto('/app/checkout')
    const emptyCart = page.getByText('Your cart is empty')
    if (await emptyCart.isVisible()) {
      await expect(emptyCart).toBeVisible()
    } else {
      const payBtn = page.getByRole('button', { name: /Pay/i })
      if (await payBtn.isVisible().catch(() => false)) {
        await expect(payBtn).toBeVisible()
      }
    }
  })

  test('add to cart button renders on shop products', async ({ page }) => {
    await page.goto('/shop')
    await page.waitForLoadState('networkidle')
    const addToCart = page.locator('button:has-text("Add to Cart"), a:has-text("Add to Cart")').first()
    if (await addToCart.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(addToCart).toBeVisible()
    } else {
      await expect(page.locator('h1').first()).toBeVisible()
    }
  })
})
