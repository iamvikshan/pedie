## Plan: Security Hardening

Harden the Pedie e-commerce application against OWASP Top 10 vulnerabilities identified during a security audit. Covers privilege escalation prevention, server-side pricing trust, rate limiting, security headers (CSP/HSTS), input validation with Zod, audit logging, and cleanup of stale code.

**Phase Rationale:**
- Phase 1 (DB hardening) must land first: the privilege escalation is the most critical vulnerability and all other security measures are pointless if any user can become admin
- Phase 2 (server-side pricing) is the second critical fix: financial impact from client-trusted pricing
- Phase 3 (rate limiting + validation) addresses brute-force, enumeration, and input injection risks
- Phase 4 (headers + observability + cleanup) is defense-in-depth and operational hygiene

**Resolved Tooling:** pm: "bun" | format: "bun run f" | lint: "bun check" | typecheck: "bunx tsc --noEmit" | test: "bun test" | fileNaming: "camelCase"

**New Dependencies:** `zod` (input validation) | `@upstash/ratelimit` + `@upstash/redis` (rate limiting) | `sanitize-html` (HTML sanitization -- replaces custom escapeHtml)

---

### Phases

1. **[x] Phase 1: Database Hardening (CRITICAL)**
   - **Summary:** Implemented role immutability trigger, subscribed column, removed deprecated headers/dead code, replaced escapeHtml with sanitize-html, fixed 3 ESLint warnings. All tests passing (1256). Sentry APPROVED (iteration 3).
   - **Changes from plan:** Added sanitize-html adoption (user request). Fixed 3 pre-existing ESLint warnings (user request). Applied migration to live DB via Supabase MCP (user request).
   - [Phase 1 Details](/.agents/plans/security-hardening-phase-1-complete.md)
   - **Objective:** Prevent privilege escalation via profiles self-update; fix newsletter schema mismatch; remove deprecated/dead code.
   - **Files/Functions to create/modify:**
     - `supabase/migrations/20250801000000_security_hardening.sql` -- NEW: (a) Add BEFORE UPDATE trigger `enforce_role_immutability()` on profiles that raises exception when `NEW.role != OLD.role` unless `is_admin()` returns true. (b) Add `subscribed boolean NOT NULL DEFAULT true` column to `newsletter_subscribers`.
     - `src/proxy.ts` -- Remove deprecated `X-XSS-Protection` header (browsers no longer support it; false sense of security)
     - `src/config.ts` -- Remove dead `LISTING_ID_PREFIX` constant (confirmed unused). Retain `DEFAULT_COLLECTION_HREF` (confirmed in active use by `src/app/(store)/cart/client.tsx`).
     - `src/app/api/newsletter/route.ts` -- No code change needed for `subscribed` field (already passes `subscribed: true`). Verify route compiles after type regen. Fix verbose error in non-production (line 49: replace conditional `error.message` with opaque error).
   - **Post-migration steps:** Regenerate `types/database.ts` via `bunx supabase gen types typescript --project-id "$SUPABASE_PROJECT_REF" --schema public > types/database.ts`. Update `docs/database-architecture.md` with trigger and new column. Run `bun syncsheets`.
   - **Tests to Write/modify:**
     - `tests/lib/security/rls-role-protection.test.ts`:
       - "should reject role change when user is not admin"
       - "should allow role change when user is admin"
       - "should allow non-role field updates for regular users"
     - `tests/api/newsletter.test.ts`:
       - "should accept valid email subscription"
       - "should return opaque error message regardless of environment"
   - **Quality Gates:** `bun run f` -> `bun check` -> `bun test`
   - **Steps:**
     1. Write migration SQL with trigger function `enforce_role_immutability()`
     2. Add `subscribed` column to newsletter_subscribers
     3. Remove `X-XSS-Protection` from proxy.ts
     4. Remove `LISTING_ID_PREFIX` from config.ts
     5. Fix newsletter route error message
     6. Regenerate types, update docs, run syncsheets
     7. Write tests
     8. Run quality gates

2. **[x] Phase 2: Server-Side Pricing Trust (CRITICAL)**
   - **Objective:** Re-derive all order totals server-side from listing prices in the database. Clients send only listing IDs and quantities, never prices. Close the PayPal create route pricing leak.
   - **Files/Functions to create/modify:**
     - `src/lib/data/orders.ts` -- Modify `CreateOrderInput` interface: remove `subtotal`, `depositTotal`, `shippingFee`, `items[].unit_price_kes`, `items[].deposit_kes`, `items[].product_name`. New `items` shape: `{ listing_id: string; quantity: number }[]`. Modify `createOrder()` to: (a) fetch listing rows by listing_id from DB, (b) derive `product_name` from listing's product.name, (c) compute `unit_price_kes` as effective price (isSale logic), (d) compute `deposit_kes` via `calculateDeposit()`, (e) sum `subtotal_kes`, `deposit_total`, `shipping_fee`.
     - `src/app/api/orders/route.ts` -- Accept only `items[]{listing_id, quantity}`, `shippingAddress`, `paymentMethod`, `paymentRef`, `notes`. Remove TODO comment. Validate item structure with basic checks.
     - `src/app/(store)/checkout/page.tsx` -- Stop sending price fields to API; only send listing_id + quantity per item
     - `src/components/checkout/paypalPayment.tsx` -- Remove `amountKes` from `PaypalPaymentProps`, remove it from the `fetch` body JSON, pass only `orderId`. Update callers in `src/app/(store)/checkout/page.tsx` to stop computing or passing `amountKes`.
     - `src/app/api/payments/paypal/create/route.ts` -- Fix pricing leak: instead of accepting `amountKes` from client, accept only `orderId`. Look up order by `orderId` from DB, fetch order from DB, compute `amountKes = order.subtotal_kes + order.shipping_fee_kes` (number), pass to `createPayPalOrder({ amountKes, orderId })` -- the library handles USD conversion internally via `kesToUsd()`. Reject if order not found or not in `pending` status.
     - `src/app/api/payments/paypal/capture/route.ts` -- Restructure execution order so amount verification happens BEFORE order confirmation. The new flow must be: (1) Capture PayPal payment, (2) extract captured USD amount from `purchase_units[0].payments.captures[0].amount.value`, (3) fetch order from DB via `getOrderById(orderId)`, (4) compute expected USD via `kesToUsd(order.subtotal_kes + order.shipping_fee_kes)`, (5) convert both values with `parseFloat()` (both `kesToUsd()` and PayPal's `amount.value` return strings), compare with +/-$0.50 tolerance -- if mismatch, log security warning and return 400 WITHOUT calling `updateOrderStatus`, (6) only on pass: call `updateOrderStatus(orderId, 'confirmed', captureId)`, then fire-and-forget confirmation email.
   - **Tests to Write/modify:**
     - `tests/api/orders/route.test.ts`:
       - "should compute subtotal server-side from DB listing prices"
       - "should reject request with client-supplied pricing fields"
       - "should apply sale_price when listing is on sale"
       - "should compute deposit using calculateDeposit helper"
     - `tests/api/payments/paypal-create.test.ts`:
       - "should derive amount from order total, not client input"
       - "should reject if order not found"
     - `tests/api/payments/paypal-capture.test.ts`:
       - "should confirm order when captured amount matches"
       - "should reject order when captured amount mismatches"
   - **Quality Gates:** `bun run f` -> `bun check` -> `bun test`
   - **Steps:**
     1. Modify CreateOrderInput in src/lib/data/orders.ts
     2. Modify createOrder() to fetch listing prices from DB and compute totals
     3. Update orders API route to only accept listing_id + quantity
     4. Update checkout page to remove price fields from API call
     5. Fix PayPal create route: accept orderId only, derive amount from DB
     6. Add PayPal capture amount verification with tolerance
     7. Write tests
     8. Run quality gates
   - **Summary:** Simplified CreateOrderInput to {listing_id, quantity}[] only. createOrder() now fetches listings from DB, computes all pricing server-side. PayPal create route requires auth + ownership, derives amount from DB. Capture routes verify amount with +/-$0.50 tolerance and check pending status before confirming. 24 new tests across 3 test files.
   - **[Phase 2 Details](.agents/plans/security-hardening-phase-2-complete.md)**

3. **[x] Phase 3: Rate Limiting & Input Validation (HIGH)**
   - **Objective:** Add Upstash-backed rate limiting to abuse-prone endpoints. Add Zod schema validation for admin routes, replacing manual allowlisting and `as never` casts. Sanitize admin email fields. Fix resolve-username user enumeration vulnerability.
   - **Summary:** Installed zod v4, @upstash/ratelimit, @upstash/redis. Created rate limiter factory (rateLimit.ts) with Upstash sliding window + graceful fallback. Rate-limited 7 routes. Server-side signin route eliminates email enumeration. Zod schemas for all 6 admin mutations, 7 `as never` casts replaced with proper Supabase types. Email to/subject sanitized. PayPal error logging sanitized. 14 new tests, 8 existing test files updated.
   - **Changes from plan:** Zod v4 installed (imported from 'zod/v4'). Added listing_type to listings allowlists (was missing). Removed redundant manual validation from listings routes.
   - **[Phase 3 Details](.agents/plans/security-hardening-phase-3-complete.md)**

4. **[x] Phase 4: Security Headers & Audit Logging (MEDIUM)**
   - **Summary:** Hybrid CSP (static 'self', dynamic 'self' + nonce) and HSTS (2yr) in proxy.ts + vercel.json. sync_log renamed to admin_log with 5 audit columns. Fire-and-forget logAdminEvent integrated into all 7 admin mutation routes. Sentry R1 found 4 issues (nonce propagation, static rendering, PromiseLike .catch, order action) -- all resolved. R2 approved with 2 non-blocking fixes applied (cookie options, docs).
   - **Changes from plan:** Dynamic CSP uses `'self' 'nonce-{nonce}'` instead of `'strict-dynamic'` (simpler, no framework nonce propagation needed). Root layout does not call `headers()` (preserves static rendering). JSON-LD is CSP-exempt, no nonce needed.
   - **[Phase 4 Details](.agents/plans/security-hardening-phase-4-complete.md)**
   - **Objective:** Add CSP (enforcing) and HSTS headers. Repurpose existing `sync_log` table to `admin_log` with extended schema for admin audit logging.
   - **CSP Implementation Detail (Hybrid Approach):** Use a two-tier CSP strategy to preserve prerendering for static pages:
     - **Static pages** (product listings, categories, home, sitemap): Static CSP with `script-src 'self'` -- no nonce needed, fully compatible with ISR/SSG/PPR. Note: `<script type="application/ld+json">` blocks on storefront pages are data-only (not executable) and are exempt from CSP `script-src` restrictions per the HTML spec. If any browsers enforce CSP on them, workers must move JSON-LD to external `.json` files or promote those routes to nonce-based CSP.
     - **Dynamic pages** (checkout, admin, account, auth): Nonce-based CSP. Generate nonce in `proxy.ts` via `crypto.randomUUID()`, set as `x-csp-nonce` request header. `layout.tsx` reads nonce via `headers()` and passes to inline `<script>` tags.
     - **Route detection:** Middleware checks pathname against dynamic route prefixes (`/checkout`, `/admin`, `/account`, `/auth`, `/api`). Dynamic routes get nonce CSP; all others get static CSP.
     - **Static CSP:** `script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://opygpszamajcdujoslob.supabase.co; font-src 'self'; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
     - **Dynamic CSP:** `script-src 'nonce-{nonce}' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://opygpszamajcdujoslob.supabase.co; font-src 'self'; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
     - **Dev environment:** Add `'unsafe-eval'` to `script-src` when `NODE_ENV === 'development'` (required for React Fast Refresh / HMR).
     - **Trade-off note:** Nonce-based CSP forces per-request rendering (disables ISR, SSG, PPR) for the routes it applies to. The hybrid approach limits this cost to pages that already require server-side rendering (auth, checkout, admin). Static storefront pages remain fully prerenderable.
     - Workers must audit all inline `<script>` tags and `dangerouslySetInnerHTML` blocks in dynamic routes for nonce application before deploying.
   - **Files/Functions to create/modify:**
     - `src/proxy.ts` -- Generate nonce, add enforcing CSP header (`Content-Security-Policy`), add HSTS header (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`)
     - `src/app/layout.tsx` -- Read `x-csp-nonce` from `headers()`, pass nonce to inline scripts. Audit existing `<script>` and `dangerouslySetInnerHTML` for nonce application.
     - `vercel.json` -- Add HSTS header (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`)
     - `supabase/migrations/20250802000000_admin_log.sql` -- NEW: (a) Rename `sync_log` to `admin_log` via `ALTER TABLE sync_log RENAME TO admin_log`. (b) Add columns: `actor_id uuid REFERENCES profiles(id)`, `action text`, `entity_type text`, `entity_id text`, `details jsonb`. Existing sync-specific columns (`triggered_by`, `status`, `rows_synced`, `errors`, `started_at`, `completed_at`) remain for backward compatibility with sync operations. (c) Rename existing RLS policy: `ALTER POLICY sync_log_admin_read ON admin_log RENAME TO admin_log_admin_read`. (d) Grant service-role INSERT.
     - `src/lib/data/audit.ts` -- NEW: `logAdminEvent(actorId, action, entityType, entityId?, details?)` using admin client. Fire-and-forget (do not block the response on audit log insertion). Inserts into `admin_log` table.
     - `src/lib/data/admin.ts` -- Update existing sync log queries (lines 738, 762) to reference `admin_log` instead of `sync_log`.
     - `src/app/api/admin/products/route.ts` -- Add `logAdminEvent(user.id, 'create', 'product', product.id)` after successful POST
     - `src/app/api/admin/products/[id]/route.ts` -- Add admin log for PUT and DELETE
     - `src/app/api/admin/listings/route.ts` -- Add admin log for POST
     - `src/app/api/admin/listings/[id]/route.ts` -- Add admin log for PUT, DELETE
     - `src/app/api/admin/orders/[id]/route.ts` -- Add admin log for status changes
     - `src/app/api/admin/categories/route.ts` -- Add admin log for POST
     - `src/app/api/admin/categories/[id]/route.ts` -- Add admin log for PUT, DELETE
     - `docs/product-architecture.md` -- Document admin_log table, CSP nonce approach, M-Pesa accepted risk
     - `docs/database-architecture.md` -- Update sync_log -> admin_log rename and new columns
   - **Post-migration steps:** Regenerate `types/database.ts`. Update `docs/database-architecture.md`. Run `bun syncsheets`.
   - **Tests to Write/modify:**
     - `tests/lib/data/audit.test.ts`:
       - "should insert admin log entry with all fields"
       - "should not throw on insertion failure (fire-and-forget)"
       - "should work with sync-type entries (backward compat)"
     - `tests/app/proxy.test.ts`:
       - "should set enforcing CSP header with nonce"
       - "should set HSTS header"
       - "should not set deprecated X-XSS-Protection"
   - **Quality Gates:** `bun run f` -> `bun check` -> `bun test`
   - **Steps:**
     1. Create admin_log migration (rename sync_log, add audit columns, update RLS policy)
     2. Create admin logging utility (fire-and-forget)
     3. Update existing sync_log references in admin.ts to admin_log
     4. Add admin log calls to all admin state-changing routes
     5. Generate CSP nonce in proxy.ts, construct enforcing CSP header
     6. Audit all inline scripts and dangerouslySetInnerHTML blocks for nonce
     7. Add HSTS to vercel.json and proxy.ts
     8. Read nonce in layout.tsx, apply to inline scripts
     9. Regenerate types, update docs, run syncsheets
     10. Update product-architecture.md (admin_log, CSP, M-Pesa accepted risk)
     11. Write tests
     12. Run quality gates

---

### Resolved Open Questions

1. **Upstash Redis** -- RESOLVED: Available. `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are provisioned. Graceful fallback retained for resilience.

2. **CSP strictness** -- RESOLVED: Deploy as enforcing `Content-Security-Policy` with hybrid approach. Static storefront pages use hash-based CSP (`script-src 'self'`) preserving prerendering. Dynamic pages (checkout, admin, auth, account) use nonce-based CSP. Workers must audit inline scripts in dynamic routes. Framer Motion uses inline styles (`style-src: 'unsafe-inline'` handles this). Dev environment adds `'unsafe-eval'` for React Fast Refresh.

3. **M-Pesa signature validation** -- RESOLVED: Accepted risk. Safaricom's Daraja API does not provide HMAC signatures. Current IP allowlist + header secret is documented best practice. Document as accepted risk in product-architecture.md.

4. **Inline scripts inventory** -- RESOLVED: Workers audit during Phase 4 implementation. Check all `<script>` tags and `dangerouslySetInnerHTML` blocks in layout.tsx and child components.

### Recommendations

- **Zod over manual validation**: Replace all manual `typeof` checks and field allowlisting in admin routes with Zod schemas. Eliminates `as never` casts and provides type-safe validated output.
- **CSP enforcing from day one**: Deploy CSP as enforcing `Content-Security-Policy`. Workers must thoroughly audit inline scripts during Phase 4 to avoid breaking the app.
- **Upstash over custom rate limiting**: Do not build an in-memory rate limiter. Serverless functions get fresh processes on cold start; any in-memory `Map`-based store is per-invocation only and ineffective.
- **sanitize-html adopted**: The custom `escapeHtml()` in `src/lib/email/templates.ts` has been replaced with `sanitize-html` package for robust HTML sanitization. All email templates now use a private `sanitize()` function wrapping `sanitize-html` with `allowedTags: [], allowedAttributes: {}`.
