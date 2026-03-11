## Phase 3 Complete: Rate Limiting & Input Validation

Added Upstash-backed rate limiting to 7 abuse-prone API endpoints, replaced client-side signin with server-side flow to eliminate email enumeration, added Zod v4 schema validation to all 6 admin mutation endpoints, replaced 7 unsafe `as never` type casts with proper Supabase types, and sanitized email/error outputs.

**Details:**

- Rate limiter factory (`rateLimit.ts`) uses Upstash sliding window with graceful fallback (allows all requests if Redis unavailable, logs warning)
- 7 routes rate-limited: newsletter (10/min), resolve-username (5/min), signin (5/min), mpesa (3/min), paypal (5/min), orders (5/min), email (10/min)
- Server-side signin route accepts `{identifier, password}`, resolves username internally, returns only session tokens -- never exposes resolved email
- resolve-username endpoint now returns uniform `{status: 'received'}` for all valid-format lookups (anti-enumeration)
- 6 Zod schemas validate all admin mutations (products, listings, categories -- create and update)
- 7 `as never` casts replaced with proper Supabase type aliases (ProductInsert, ListingUpdate, etc.)
- Email to/subject sanitized with sanitize-html; PayPal error logging sanitized to errorType-only

**Deviations from plan:**

- Installed Zod v4 (4.3.6), imported from `zod/v4` instead of `zod`
- Added `listing_type` to listings create/update allowlists (was missing from original routes)
- Removed redundant manual validation from listings routes (Zod now handles all validation)
- 8 existing admin test files required schema re-exports in their @data/admin mocks to prevent cross-file contamination

**Files modified:**

- [rateLimit.ts](/src/lib/security/rateLimit.ts) -- NEW: rate limiter factory
- [signin/route.ts](/src/app/api/auth/signin/route.ts) -- NEW: server-side signin
- [resolve-username/route.ts](/src/app/api/auth/resolve-username/route.ts) -- anti-enumeration + rate limiting
- [signinForm.tsx](/src/components/auth/signinForm.tsx) -- calls /api/auth/signin
- [admin.ts](/src/lib/data/admin.ts) -- Zod schemas + proper type casts
- [newsletter/route.ts](/src/app/api/newsletter/route.ts) -- rate limiting
- [mpesa/stkpush/route.ts](/src/app/api/payments/mpesa/stkpush/route.ts) -- auth + rate limiting
- [paypal/create/route.ts](/src/app/api/payments/paypal/create/route.ts) -- rate limiting + sanitized error
- [orders/route.ts](/src/app/api/orders/route.ts) -- rate limiting
- [email/send/route.ts](/src/app/api/email/send/route.ts) -- rate limiting + sanitize to/subject
- [products/route.ts](/src/app/api/admin/products/route.ts) -- Zod validation
- [products/[id]/route.ts](/src/app/api/admin/products/[id]/route.ts) -- Zod validation
- [listings/route.ts](/src/app/api/admin/listings/route.ts) -- Zod validation + listing_type
- [listings/[id]/route.ts](/src/app/api/admin/listings/[id]/route.ts) -- Zod validation + listing_type
- [categories/route.ts](/src/app/api/admin/categories/route.ts) -- Zod validation
- [categories/[id]/route.ts](/src/app/api/admin/categories/[id]/route.ts) -- Zod validation
- 4 new test files + 8 existing test files updated

**Review Status:** Sentry APPROVED (R2). Minor suggestions noted (Upstash env validation for prod, admin route error log consistency).

**Git Commit Message:**

```
feat: rate limiting, Zod validation, and signin anti-enumeration

- Add Upstash-backed rate limiter with graceful fallback (rateLimit.ts)
- Rate limit 7 routes: newsletter, resolve-username, signin, mpesa, paypal, orders, email
- Server-side signin route eliminates email enumeration via resolve-username
- Zod v4 schemas for all 6 admin mutation endpoints (products, listings, categories)
- Replace 7 unsafe 'as never' casts with proper Supabase types in admin.ts
- Sanitize email to/subject with sanitize-html
- Sanitize PayPal error logging (errorType only)
- Anti-enumeration: resolve-username returns uniform {status:'received'} for all lookups
- 14 new tests, 8 existing test files updated with schema re-exports
```
