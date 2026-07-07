import type { Page } from '@playwright/test'

export const TEST_CREDENTIALS = {
  email: 'playwright-test@srinathayoga.com',
  password: 'PlaywrightTest2026!',
}

const FAKE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQifQ.example'

const FAKE_USER = {
  id: 'test-user-id',
  aud: 'authenticated',
  role: 'authenticated',
  email: TEST_CREDENTIALS.email,
  email_confirmed_at: new Date().toISOString(),
  user_metadata: { name: 'Playwright Test' },
}

const FAKE_SESSION = {
  access_token: FAKE_TOKEN,
  refresh_token: 'fake-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: FAKE_USER,
}

function getSupabaseOrigin(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return url ? new URL(url).origin : ''
}

function getProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return ''
  return new URL(url).hostname.split('.')[0]
}

function installInterceptors(page: Page) {
  const origin = getSupabaseOrigin()
  if (!origin) return

  page.route(origin + '/auth/v1/token*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...FAKE_SESSION }),
    })
  })

  page.route(origin + '/auth/v1/user*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { user: FAKE_USER }, error: null }),
    })
  })

  page.route(origin + '/auth/v1/logout*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    })
  })

  page.route(origin + '/rest/v1/profiles*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{
        id: 'test-user-id',
        email: TEST_CREDENTIALS.email,
        name: 'Playwright Test',
        phone: null,
        address: null,
        password_set: true,
        created_at: new Date().toISOString(),
      }]),
    })
  })

  page.route(origin + '/rest/v1/shipping_addresses*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  page.route(origin + '/rest/v1/cart*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  page.route(origin + '/rest/v1/orders*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })
}

export async function ensureTestUserExists() {}

export async function signInAsStudent(page: Page): Promise<boolean> {
  try {
    installInterceptors(page)

    const projectRef = getProjectRef()
    await page.addInitScript(({ projectRef, FAKE_SESSION }) => {
      const key = `sb-${projectRef}-auth-token`
      localStorage.setItem(key, JSON.stringify(FAKE_SESSION))
    }, { projectRef, FAKE_SESSION })

    // Set the session cookie the middleware checks
    await page.context().addCookies([{
      name: 'sb-session-auth-token',
      value: FAKE_TOKEN,
      domain: 'localhost',
      path: '/',
    }])

    await page.goto('/app', { timeout: 10000 })
    return true
  } catch {
    return false
  }
}
