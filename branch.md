# Auth Flow Fixes - Student Login Web App

## Summary of Changes

### Issue
Users were getting redirected back to the marketing homepage (`/`) instead of the student web app (`/app`) after magic link authentication.

### Root Causes Found & Fixed

#### 1. **Auth Callback Route - Cookie Loss During Redirect** (`app/auth/callback/route.ts`)
**Problem**: The callback created a NEW `NextResponse.redirect()` AFTER exchanging the auth code. The session cookies set by `supabase.auth.exchangeCodeForSession()` were attached to an internal response object, not the final redirect response. Cookies were lost during redirect.

**Fix**: 
- Create the redirect response FIRST
- Pass it to `createServerClient()` cookie handlers so cookies are set on the redirect response
- Return the SAME response object after successful code exchange

#### 2. **Cookie Name Mismatch** (Middleware & Auth Callback)
**Problem**: Browser client uses `sb-session` cookie name, but server clients (middleware, callback) weren't specifying this, causing session detection failures.

**Fix**: Added `cookieOptions: { name: 'sb-session' }` to both:
- `middleware.ts` 
- `app/auth/callback/route.ts`

#### 3. **Magic Link Redirect URL** (`lib/auth.ts`)
**Verified Working**: The `signInWithOtp` function correctly generates:
```
${getRedirectBase()}/auth/callback?next=${encodeURIComponent('/app')}
```
This properly redirects to `/app` after email verification.

### Files Modified

1. **`app/auth/callback/route.ts`** - Complete rewrite to fix cookie persistence
2. **`middleware.ts`** - Added `cookieOptions: { name: 'sb-session' }`
3. **`lib/auth.ts`** - Verified correct redirect logic (no changes needed)

### Auth Flow (Now Working)

```
1. User visits /app → middleware redirects to /app/login?redirect=/app
2. User clicks "Send Magic Link" → signInWithOtp(email, '/app')
3. Supabase sends email with link: https://domain/auth/callback?code=xxx&next=/app
4. User clicks link → GET /auth/callback?code=xxx&next=/app
5. Callback exchanges code for session → cookies set on redirect response
6. Redirect to /app → middleware detects session → allows access
7. Dashboard loads with user profile
```

### Test Results

- ✅ `/app` without session → redirects to `/app/login?redirect=%2Fapp`
- ✅ `/auth/callback?next=/app` without code → redirects to `/app/login?error=auth_callback_error`
- ✅ Cookie name `sb-session` consistent across client/server
- ✅ Middleware correctly protects `/app` and `/learn` routes
- ✅ Admin dashboard protected separately at `/dashboard`

### Deployment Notes

- Ensure `NEXT_PUBLIC_APP_URL` is set in production environment
- Supabase auth settings: 
  - Site URL: `https://www.srinathayogaschool.com`
  - Redirect URLs: `https://www.srinathayogaschool.com/auth/callback`
- Magic link emails will redirect to `/app` (student dashboard) not marketing homepage