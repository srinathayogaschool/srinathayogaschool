# Srinatha Yoga School

Next.js 16 + Supabase website and student App for an online yoga school.

## Tech Stack

- **Framework**: Next.js 16 (Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Supabase (Postgres, Auth, Storage, Realtime)
- **Email**: Resend (via Supabase Custom SMTP)
- **Analytics**: GA4 + Vercel Analytics
- **Icons**: Lucide React
- **Fonts**: Playfair Display (serif), Inter (sans)

## Project Structure

```
app/
├── (public pages)          # Home, about, courses, teachers, shop, contact, etc.
├── app/                    # Student app (auth, dashboard, courses, shop, orders)
├── dashboard/              # Admin dashboard
│   ├── admin/             # Admin management pages
│   └── login/             # Admin login
├── auth/callback/         # Supabase auth callback
├── api/                   # API routes (contact, payments)
├── layout.tsx             # Root layout (GA4, providers)
├── page.tsx               # Home page
└── globals.css            # Global styles

components/
├── app/                   # Student app components
│   ├── screens/          # Home, Learn, Store, Profile, Workshops screens
│   └── ...               # Cards, sections, UI states
├── cart/                  # Cart context
├── auth-provider.tsx      # Auth state management
├── favorites-provider.tsx # Favorites state
├── providers.tsx          # Root providers
├── realtime-sync.tsx      # Realtime version bumping
├── header.tsx, footer.tsx
└── ui/ ui/                      # Reusable UI components

lib/
├── auth.ts                # Auth functions (signup, login, magic link, reset)
├── supabase.ts            # Browser Supabase client
├── supabase-server.ts     # Server Supabase client
├── supabase-queries.ts    # All DB queries + caching
├── supabase-types.ts      # Generated DB types
├── app-data.ts            # App type definitions + static data
├── utils.ts               # Helpers (cn, formatPrice, etc.)
├── payments.ts            # Razorpay integration
├── permissions.ts         # Role-based permissions
└── storage.ts             # Supabase Storage helpers

scripts/
└── seed.mjs              # Database seeding script

supabase/
└── schema.sql            # Complete DB schema (RLS, triggers, functions)

tests/
├── auth.spec.ts           # Auth flow tests
├── protected-routes.spec.ts
├── cart.spec.ts
├── commerce.spec.ts
├── dashboard.spec.ts
├── navigation.spec.ts
├── public-pages.spec.ts
└── helpers/auth.ts        # Test auth helpers

playwright.config.ts       # Playwright E2E config
middleware.ts              # Auth protection middleware
```

## Routes (35+ pages)

### Public Website
`/` `/about` `/courses` `/teachers` `/shop` `/contact` `/search` `/cart` `/checkout` `/privacy` `/terms` `/refund`

### Student App (protected)
`/app` `/app/login` `/app/signup` `/app/forgot-password` `/app/reset-password` `/app/checkout` `/app/orders` `/app/calendar` `/app/certificates` `/app/resources` `/app/courses/[courseId]` `/app/account` `/app/help` `/app/contact` `/app/notifications`

### Admin Dashboard (admin role required)
`/dashboard` `/dashboard/login`
`/dashboard/admin/orders` `/dashboard/admin/products` `/dashboard/admin/courses` `/dashboard/admin/workshops`
`/dashboard/admin/users` `/dashboard/admin/analytics` `/dashboard/admin/leads`
`/dashboard/admin/media` `/dashboard/admin/banners` `/dashboard/admin/announcements`
`/dashboard/admin/audit-logs` `/dashboard/admin/export` `/dashboard/admin/teachers`

### API Routes
`/api/contact` `/api/payments/razorpay/create-order` `/api/payments/razorpay/verify`

## Key Features

- **Authentication**: Email/password + Magic Link (OTP) via Supabase Auth
- **Cart**: React Context + localStorage persistence
- **Checkout**: Auto-filled profile/address from Supabase, Razorpay integration
- **Course Player**: Video lessons with progress tracking
- **Purchase Flow**: Orders → Enrollments (courses) / Registrations (workshops)
- **Admin Dashboard**: Full CRUD for products, courses, workshops, users, orders, analytics, exports, banners, announcements, teachers, media, audit logs
- **Realtime**: Live updates via Supabase Realtime + version bumping
- **SEO**: sitemap.xml, robots.txt, JSON-LD, metadata
- **Analytics**: GA4 (conditional on `NEXT_PUBLIC_GA_ID`), Vercel Analytics

## Environment Variables (`.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) | ✅ |
| `NEXT_PUBLIC_GA_ID` | GA4 Measurement ID (e.g., G-XXXXXXXXXX) | Optional |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID | Optional |
| `NEXT_PUBLIC_APP_URL` | App base URL (production) | ✅ |
| `RESEND_API_KEY` | Resend API key for Supabase SMTP | ✅ |
| `VERCEL_TOKEN` | Vercel deploy token | Optional |
| `VERCEL_API_TOKEN` | Vercel API token | Optional |
| `GITHUB_TOKEN` | GitHub PAT | Optional |
| `SUPABASE_ACCESS_TOKEN` | Supabase PAT | Optional |
| `STREAM_ID` | Stream/Livepeer ID | Optional |
| `STREAM_URL` | Stream URL | Optional |

## Database

26 tables with RLS enabled:
- **Auth**: profiles (extends auth.users with role, phone, address, password_set)
- **Content**: categories, courses, lessons, products, workshops, teachers
- **Commerce**: orders, order_items, shipping_addresses
- **Learning**: enrollments, lesson_progress, workshop_registrations, ttc_enrollments, ttc_resources
- **Engagement**: saved_items, wishlist_items, favorites, notifications, announcements, leads, waitlist
- **Admin**: inventory_log, media, banners, audit_logs, contact_messages

## Supabase SMTP Setup (Resend)

1. Verify domain in [Resend Domains](https://resend.com/domains) (e.g., `srinathayogaschool.com`)
2. In Supabase Dashboard → Auth → Settings → SMTP Settings:
   - **Host**: `smtp.resend.com`
   - **Port**: `587`
   - **Username**: `resend`
   - **Password**: `RESEND_API_KEY` (from `.env.local`)
   - **Sender**: `noreply@yourdomain.com` (verified domain)
   - **Min interval**: `60` seconds

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev        # http://localhost:3000

# Build for production
npm run build

# Start production server
npm start

# Seed database
node scripts/seed.mjs

# Run E2E tests
npx playwright test
```

## Testing

- **Playwright E2E**: `tests/` folder with 7 test suites
- **Run all**: `npx playwright test`
- **Run headed**: `npx playwright test --headed`
- **Report**: `npx playwright show-report`

## Deployment

- **Vercel**: Auto-deploys on push to main
- **Env vars**: Add all `.env.local` vars in Vercel Project Settings
- **Custom domain**: `www.srinathayogaschool.com` configured in Vercel

## Build Output

- 35+ routes, ~10s build time with Turbopack
- TypeScript strict mode enabled
- Next.js 16 App Router with Turbopack

---

**Last Updated**: July 2026  
**Project**: Srinatha Yoga School