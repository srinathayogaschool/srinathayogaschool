# Srinatha Yoga School — Project Documentation

Last updated: June 12, 2026
Stack: Next.js 16.2.4 + Supabase + Turbopack + Tailwind CSS 4

---

## 1. Architecture

```
WEBSITE (public, no auth)
  / /about /teachers /courses /shop /contact /search
  /cart /privacy /terms /refund /checkout

WEBAPP (dashboard, login required)
  /dashboard (5-tab mobile layout)
  /dashboard/login /signup /forgot-password /reset-password
  /dashboard/checkout /orders /calendar /certificates /resources
  /dashboard/courses/[id]
  /dashboard/notifications /help /contact
  /dashboard/account
  /learn/[courseId]

ADMIN (hidden, admin role required)
  /dashboard/admin/login
  /dashboard/admin
  /dashboard/admin/products
  /dashboard/admin/workshops
  /dashboard/admin/announcements
  /dashboard/admin/teachers
  /dashboard/admin/users
  /dashboard/admin/orders

API
  POST /api/contact
  POST /api/payments/razorpay/create-order
  POST /api/payments/razorpay/verify
  POST /api/admin/check
```

---

## 2. Supabase Database (22 tables)

profiles, courses, lessons, products, workshops, categories,
orders, order_items, shipping_addresses, enrollments, lesson_progress,
workshop_registrations, saved_items, wishlist_items, notifications,
ttc_resources, ttc_enrollments, contact_messages,
**announcements**, **favorites**, **teachers**

RLS enabled on all tables. Admin role policies ready.

### Realtime enabled on:
profiles, products, workshops, announcements, favorites, orders,
order_items, enrollments, workshop_registrations, notifications, teachers, categories

---

## 3. Auth System

| Feature | Status |
|---------|--------|
| Email/password signup + login | ✅ |
| Password reset | ✅ |
| Magic Link (passwordless) | ✅ |
| Session persistence (SSR cookies) | ✅ — 30-day session lifetime |
| Auth middleware (proxy.ts) | ✅ — protects /dashboard and /checkout |
| Persistent sessions (30 days) | ✅ — cookie lifetime 30 days, auto-refresh |
| Sign-out redirect to home | ✅ |
| "Student Login" → "App Login" | ✅ Renamed everywhere |

---

## 4. Purchase Flow

1. Add to cart → Cart page → "Proceed to Checkout"
2. Proxy checks auth → redirects to login if needed
3. `/dashboard/checkout` — auto-fills profile + saved address
4. "Pay" button saves order, enrollments, registrations to Supabase
5. Redirects to `/dashboard/orders`

**Payment currently bypassed** — Razorpay code exists but inactive. Pay saves order directly as `completed`. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to activate.

---

## 5. Home Page Features (Phase 4)

- **Banner Carousel**: 3 banners (Mysore Yoga, Workshops, Store) — auto-slide 2s, swipe, arrows, dot indicators, infinite loop
- **Animated Counters**: Lives Transformed, Students Trained, Workshops Conducted, Years Experience — animate from 0 on viewport, once
- **Workshops Section**: Cards with View All → redirects to dashboard/workshops tab
- **Store Section**: Product grid with View All → redirects to /shop
- **Educators Slider**: All 8 teachers scrollable — mobile swipe, desktop arrows
- Instagram, WhatsApp, scroll-to-top preserved

---

## 6. Admin Dashboard (Phase 6)

- Hidden access via footer "Srinatha Yoga School" text (shows pointer on hover)
- Secure login with email/password + admin role check
- Dark-themed admin panel with modules:

### Products
- Create (title, slug, SKU, description, price, stock, featured, active)
- Edit, Delete, Publish/Unpublish toggle

### Workshops
- Create (title, date, duration, instructor, price, format, seats)
- Edit, Delete, Publish/Unpublish toggle

### Announcements
- Create (title, description, image, date)
- Edit, Delete, Publish/Unpublish toggle

### Teachers
- Create (name, role, specialization, image, bio)
- Edit, Delete

### Users
- List (name, email, phone, role, join date)

### Orders
- Full list with customer info, items, amounts
- Status management (pending → processing → completed → cancelled)
- Auto-generated order numbers (SYS-000001 format)

---

## 7. Favorites System (Phase 7)

- FavoritesProvider with Supabase `favorites` table
- Heart toggle on store products
- Favorites sync across website and app (same account)
- Real-time updates via Supabase channel

---

## 8. Settings Pages (Phase 8)

| Page | Status |
|------|--------|
| Account Settings | ✅ (profile, avatar, password, address) |
| Notifications | ✅ (list, mark read) |
| Help & Support | ✅ (guides, FAQs) |
| Contact Us | ✅ (form + WhatsApp chat button) |

### WhatsApp Integration
- Default number: 918722163256 (configurable)
- Pre-filled message: "Namaste, I would like to know more about Srinatha Yoga School."

---

## 9. Footer Updates (Phase 9)

- Website footer: "Built with ❤️ by Socialeo" → WhatsApp redirect
- App footer (Profile page): Same link below version

---

## 10. Realtime Synchronization

All database changes instantly reflect on:
- Website (public pages)
- App (dashboard screens)

Using `RealtimeSync` context with `postgres_changes` subscriptions.
Version counters trigger automatic re-fetches.

---

## 11. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GA_ID=              # Optional
RAZORPAY_KEY_ID=                # Required for real payments
RAZORPAY_KEY_SECRET=            # Required for real payments
RESEND_API_KEY=                 # For Supabase Custom SMTP
```

---

## 12. Build & Run

```bash
npm install
npm run dev          # Dev server with Turbopack, port 3000
npm run build        # Production build
npm start            # Production server
npx playwright test  # Run E2E tests (requires dev server on 3000)
```

---

## 13. Known Issues

| Issue | Status |
|-------|--------|
| `ignoreBuildErrors: true` previously needed for TS errors | ✅ Fixed — lucide-react.d.ts updated, useRef init, cookie config fixed |
| Razorpay keys missing from .env.local | ⚠️ Payments bypassed |
| proxy.ts named file works but is non-standard | ⚠️ Turbopack-specific |
| Static mock data in app-data.ts coexists with live Supabase queries | ⚠️ Some UI uses hardcoded data |
| Database seeding needed for new projects | ⚠️ `scripts/seed.mjs` must run manually |
| No server-side auth redirect (client-only) | ⚠️ proxy.ts partially works |

---

## 14. Recent Changes

| Date | Change |
|------|--------|
| Jun 12 | Phase 1: Added announcements, favorites, teachers tables + realtime |
| Jun 12 | Phase 2: 30-day sessions, proper sign-out redirect, renamed App Login |
| Jun 12 | Phase 3: RealtimeSync provider for instant data sync |
| Jun 12 | Phase 4: Banner carousel, animated counters, workshops/store sections, educators slider |
| Jun 12 | Phase 6: Full admin dashboard with CRUD for products, workshops, announcements, teachers, users, orders |
| Jun 12 | Phase 7: Favorites system with Supabase, integrated with store |
| Jun 12 | Phase 8: Notifications, Help, Contact Us pages + WhatsApp chat |
| Jun 12 | Phase 9: Built with ❤️ by Socialeo in footer + app profile |
| Jun 12 | Build fix: replaced non-existent `Pen`/`Edit` icons with `Pencil` (lucide-react.d.ts), fixed `useRef<ReturnType>` init (React 19), fixed `cookies.name` → `cookieOptions.name` (Supabase SSR API update) |
