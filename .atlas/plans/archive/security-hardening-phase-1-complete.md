## Phase 1 Complete: Database + Header Hardening

Hardened the database layer with role immutability enforcement, removed deprecated browser headers, cleaned up dead config, replaced custom HTML sanitization with `sanitize-html`, and fixed all pre-existing ESLint warnings.

**Details:**

- Created `enforce_role_immutability()` trigger on `profiles` table with three-way gate: service_role bypass, admin check, else block
- Added `subscribed` boolean column to `newsletter_subscribers` (default true)
- Removed `X-XSS-Protection` header from proxy (browser-deprecated, CSP in Phase 4)
- Removed unused `LISTING_ID_PREFIX` constant from config
- Made newsletter error responses opaque to prevent information leakage
- Replaced custom `escapeHtml()` with `sanitize-html` package (private `sanitize()` wrapper, `allowedTags: [], allowedAttributes: {}`)
- Fixed 3 ESLint warnings: React Compiler `'use no memo'` directive for TanStack Table, removed unused `fetchListingsIndex`, suppressed false-positive `HEADER_MAP` unused import
- Applied migration to live Supabase instance via MCP
- Updated `types/database.ts` with `subscribed` field
- Updated `docs/database-architecture.md` and `docs/nextjs-setup.md`

**Files modified:**

- [20250801000000_security_hardening.sql](/supabase/migrations/20250801000000_security_hardening.sql) -- migration: trigger + column
- [proxy.ts](/src/proxy.ts) -- removed X-XSS-Protection
- [config.ts](/src/config.ts) -- removed LISTING_ID_PREFIX
- [route.ts](/src/app/api/newsletter/route.ts) -- opaque error messages
- [templates.ts](/src/lib/email/templates.ts) -- sanitize-html adoption
- [dataTable.tsx](/src/components/admin/dataTable.tsx) -- React Compiler directive
- [database.ts](/types/database.ts) -- added subscribed field
- [database-architecture.md](/docs/database-architecture.md) -- trigger + column docs
- [nextjs-setup.md](/docs/nextjs-setup.md) -- removed X-XSS-Protection reference
- [package.json](/package.json) -- added sanitize-html + @types/sanitize-html
- [sync.test.ts](/tests/lib/sheets/sync.test.ts) -- removed unused var, suppressed false positive
- [proxy.test.ts](/tests/app/proxy.test.ts) -- X-XSS-Protection absence test
- [config.test.ts](/tests/config.test.ts) -- LISTING_ID_PREFIX removal test
- [templates.test.ts](/tests/lib/email/templates.test.ts) -- updated sanitization assertions
- [email-triggers.test.ts](/tests/app/api/email-triggers.test.ts) -- updated sanitization assertions
- [newsletter.test.ts](/tests/api/newsletter.test.ts) -- new newsletter API tests
- [rls-role-protection.test.ts](/tests/lib/security/rls-role-protection.test.ts) -- migration source analysis

**Review Status:** Sentry APPROVED (iteration 3)

**Git Commit Message:**

```
fix: Phase 1 security hardening + sanitize-html adoption

- Add enforce_role_immutability() trigger with service_role bypass
- Add subscribed column to newsletter_subscribers
- Remove X-XSS-Protection header (browser-deprecated)
- Remove unused LISTING_ID_PREFIX constant
- Replace custom escapeHtml() with sanitize-html package
- Fix 3 ESLint warnings (dataTable, sync.test)
- Opaque newsletter error messages
- Archive db-overhaul plan files
```
