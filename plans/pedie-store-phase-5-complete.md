## Phase 5 Complete: Authentication, User Accounts & Email

Implemented full authentication system with Email/Password + Google OAuth via Supabase Auth, user account pages (dashboard, orders, wishlist, settings), secure API routes with ownership checks, centralized wishlist with optimistic UI, and transactional email via Gmail API. All 336 tests pass, `bun check` clean.

**Files created/changed:**

- `src/middleware.ts` — Supabase session refresh middleware
- `src/app/auth/callback/route.ts` — OAuth callback with profile auto-creation, welcome email, open-redirect protection
- `src/app/auth/signin/page.tsx` — Sign in page
- `src/app/auth/signup/page.tsx` — Sign up page
- `src/components/auth/signin-form.tsx` — Email/password + Google sign-in form
- `src/components/auth/signup-form.tsx` — Registration form with validation
- `src/components/auth/user-menu.tsx` — Dropdown menu with avatar, links, sign out
- `src/components/auth/auth-provider.tsx` — React context for auth state
- `src/app/account/layout.tsx` — Server layout with `requireAuth()`, responsive sidebar
- `src/app/account/page.tsx` — Dashboard with stats, admin link
- `src/app/account/orders/page.tsx` — Orders list with status badges
- `src/app/account/orders/[id]/page.tsx` — Order detail with ownership check
- `src/app/account/settings/page.tsx` — Settings page
- `src/app/account/wishlist/page.tsx` — Wishlist page with optimistic remove + revert
- `src/components/account/profile-form.tsx` — Profile edit form with accessibility
- `src/lib/auth/helpers.ts` — `getUser()`, `getProfile()`, `isAdmin()`, `requireAuth()`
- `src/lib/auth/admin.ts` — `isUserAdmin(userId)` with error logging
- `src/lib/data/wishlist.ts` — CRUD helpers with error handling
- `src/app/api/wishlist/route.ts` — GET/POST/DELETE with auth, 404 on not-found
- `src/lib/wishlist/use-wishlist.ts` — Hook consuming WishlistContext
- `src/components/wishlist/wishlist-provider.tsx` — Centralized wishlist state
- `src/components/ui/product-card.tsx` — Heart icon button (filled red when wishlisted)
- `src/lib/email/gmail.ts` — Gmail API client with sender email guard
- `src/lib/email/templates.ts` — HTML templates with `escapeHtml()` utility
- `src/lib/email/send.ts` — Fire-and-forget email helpers
- `src/app/api/email/send/route.ts` — Admin-only POST route with malformed JSON handling
- `src/app/api/orders/route.ts` — POST requires auth, ignores body.userId
- `src/app/api/orders/[id]/route.ts` — GET requires auth + ownership/admin check
- `src/app/api/payments/mpesa/callback/route.ts` — Receipt fallback fixed to 'N/A'
- `src/app/api/payments/paypal/capture/route.ts` — Receipt fallback with `?? 'N/A'`
- `src/app/checkout/page.tsx` — Auth gate with redirect to `?next=/checkout`
- `src/app/orders/[id]/page.tsx` — `requireAuth()` + ownership check
- `src/components/layout/header.tsx` — Auth-aware with `UserMenu`
- `src/components/layout/mobile-nav.tsx` — Auth-aware links
- `src/app/layout.tsx` — Wrapped with `<AuthProvider>` and `<WishlistProvider>`
- `src/app/cart/client.tsx` — Fixed missing import

**Functions created/changed:**

- `getUser()`, `getProfile()`, `isAdmin()`, `requireAuth()` — Auth helpers
- `isUserAdmin(userId)` — Admin role check
- `getWishlistByUser()`, `addToWishlist()`, `removeFromWishlist()`, `isInWishlist()`, `getWishlistProductIds()` — Wishlist CRUD
- `sendEmail()`, `isEmailConfigured()` — Gmail API client
- `escapeHtml()`, `welcomeEmailTemplate()`, `orderConfirmationTemplate()`, `paymentConfirmationTemplate()` — Email templates
- `sendWelcomeEmail()`, `sendOrderConfirmation()`, `sendPaymentConfirmation()` — Fire-and-forget senders
- `useWishlist()` — Wishlist hook
- `WishlistProvider` — Context provider

**Tests created/changed:**

- `tests/components/auth/signin-form.test.tsx`
- `tests/components/auth/signup-form.test.tsx`
- `tests/components/auth/user-menu.test.tsx`
- `tests/components/auth/auth-provider.test.tsx`
- `tests/app/account/account-pages.test.tsx`
- `tests/components/account/profile-form.test.tsx`
- `tests/app/api/orders-auth.test.ts`
- `tests/app/api/wishlist.test.ts`
- `tests/lib/data/wishlist.test.ts`
- `tests/lib/wishlist/use-wishlist.test.tsx`
- `tests/components/wishlist/wishlist-provider.test.tsx`
- `tests/components/ui/product-card-wishlist.test.tsx`
- `tests/lib/email/gmail.test.ts`
- `tests/lib/email/templates.test.ts`
- `tests/lib/email/send.test.ts`
- `tests/app/api/email-send.test.ts`
- `tests/app/api/email-triggers.test.ts`

**Review Status:** APPROVED (3 review rounds, all findings fixed)

**Quality Gate:** `bun f` clean, `bun check` passes, 336 tests pass / 0 fail

**Deferred Items:**
- Server-side cart sync / abandoned cart tracking — deferred to Phase 6+
- M-Pesa callback IP allowlisting — deferred to Phase 7 (production)
- `src/proxy.ts` (Next.js 16 proxy) — not needed; middleware + `requireAuth()` used instead

**Git Commit Message:**
```
feat: add auth, user accounts, wishlist & email

- Implement Email/Password + Google OAuth via Supabase Auth
- Add sign in/up pages, auth provider, user menu, session middleware
- Build account dashboard, orders, wishlist, settings pages
- Secure API routes with auth checks and ownership validation
- Add centralized wishlist with optimistic UI and heart icon
- Integrate Gmail API for welcome, order, and payment emails
- Add 336 passing tests across all auth and account features
```
