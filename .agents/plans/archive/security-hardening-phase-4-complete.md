## Phase 4 Complete: Security Headers & Audit Logging

HSTS and hybrid Content Security Policy added to middleware. sync_log table renamed to admin_log with audit columns. Fire-and-forget logAdminEvent utility created and integrated into all 7 admin mutation routes.

**Details:**

- Hybrid CSP: static routes get `script-src 'self'`, dynamic routes get `script-src 'self' 'nonce-{nonce}'`. Nonce forwarded via request headers for downstream consumption. Root layout remains static (no headers() call). JSON-LD scripts are CSP-exempt and carry no nonce.
- HSTS set to 2 years (`max-age=63072000; includeSubDomains; preload`) in both proxy.ts and vercel.json.
- Dev mode appends `'unsafe-eval'` to script-src for HMR/Fast Refresh.
- admin_log migration: `ALTER TABLE sync_log RENAME TO admin_log`, 5 audit columns added (actor_id, action, entity_type, entity_id, details), RLS policy renamed, service_role INSERT granted.
- logAdminEvent: fire-and-forget with `Promise.resolve()` wrapper (converts PromiseLike to Promise for proper `.catch()` handling). Outer try/catch guards client creation. Never throws.
- All 7 admin mutation routes instrumented: products (create/update/delete), listings (create/update/delete), categories (create/update/delete), orders (update with full details).
- Cookie options preserved during dynamic route response recreation (passes full ResponseCookie object, not just name/value).

**Deviations from plan:**

- Changed dynamic route CSP from `'strict-dynamic'` to `'self' 'nonce-{nonce}'`. `'strict-dynamic'` requires nonce propagation to all framework scripts including Next.js internals; `'self' 'nonce-{nonce}'` achieves equivalent protection while allowing same-origin framework scripts via `'self'`.
- Root layout does NOT call `headers()` -- this was removed to preserve static rendering. JSON-LD `<script type="application/ld+json">` is CSP-exempt per HTML spec and needs no nonce.
- For dynamic routes, the middleware recreates the response with nonce in request headers, copies Supabase cookies (with full options), and re-applies all security headers.

**Files modified:**

- [src/proxy.ts](src/proxy.ts) -- HSTS, hybrid CSP, nonce request forwarding, response recreation
- [src/app/layout.tsx](src/app/layout.tsx) -- Kept static (removed nothing new, confirmed no headers())
- [src/lib/data/audit.ts](src/lib/data/audit.ts) -- NEW: logAdminEvent fire-and-forget
- [supabase/migrations/20250802000000_admin_log.sql](supabase/migrations/20250802000000_admin_log.sql) -- NEW: rename + audit columns
- [src/lib/data/admin.ts](src/lib/data/admin.ts) -- sync_log -> admin_log (2 refs)
- [src/app/api/admin/products/route.ts](src/app/api/admin/products/route.ts) -- logAdminEvent on create
- [src/app/api/admin/products/[id]/route.ts](src/app/api/admin/products/%5Bid%5D/route.ts) -- logAdminEvent on update/delete
- [src/app/api/admin/listings/route.ts](src/app/api/admin/listings/route.ts) -- logAdminEvent on create
- [src/app/api/admin/listings/[id]/route.ts](src/app/api/admin/listings/%5Bid%5D/route.ts) -- logAdminEvent on update/delete
- [src/app/api/admin/categories/route.ts](src/app/api/admin/categories/route.ts) -- logAdminEvent on create
- [src/app/api/admin/categories/[id]/route.ts](src/app/api/admin/categories/%5Bid%5D/route.ts) -- logAdminEvent on update/delete
- [src/app/api/admin/orders/[id]/route.ts](src/app/api/admin/orders/%5Bid%5D/route.ts) -- logAdminEvent on update with details
- [vercel.json](vercel.json) -- HSTS header added
- [types/database.ts](types/database.ts) -- admin_log schema (renamed)
- [docs/database-architecture.md](docs/database-architecture.md) -- sync_log -> admin_log
- [docs/product-architecture.md](docs/product-architecture.md) -- Audit logging, CSP, M-Pesa docs
- [tests/app/proxy.test.ts](tests/app/proxy.test.ts) -- 4 new source-analysis tests
- [tests/lib/data/audit.test.ts](tests/lib/data/audit.test.ts) -- NEW: 3 audit tests

**Review Status:** Sentry APPROVED (R2). R1 found 4 major issues, all resolved. R2 found 2 non-blocking issues (cookie options, stale docs), both fixed.

**Git Commit Message:**

```
feat: security headers and admin audit logging

- Hybrid CSP: static routes 'self', dynamic routes 'self' + nonce
- HSTS max-age=63072000 in middleware and vercel.json
- Rename sync_log to admin_log with 5 audit columns
- Fire-and-forget logAdminEvent in all admin mutation routes
- Nonce forwarded via request headers for downstream access
```
