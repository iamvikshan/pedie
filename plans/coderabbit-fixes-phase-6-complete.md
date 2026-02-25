## Phase 6 Complete: Data Layer & Test Hardening

Fixed EAT timezone calculation in admin.ts, sanitized listing search input, ensured started_at flows through sync logging, and updated test assertions to be more specific while handling React SSR comment nodes.

**Files created/changed:**
- src/lib/data/admin.ts
- tests/app/admin/prices.test.tsx
- tests/app/admin/sync.test.tsx
- tests/app/api/admin/products.test.ts
- tests/components/admin/data-table-shell.test.tsx
- tests/app/admin/layout.test.tsx

**Functions created/changed:**
- `getAdminDashboardStats()` — todayStart uses EAT (UTC+3) timezone
- `getAdminListings()` — sanitized search filter input
- `logSyncResult()` — accepts and passes started_at field

**Tests created/changed:**
- prices.test.tsx — more specific comparison count assertion with regex
- sync.test.tsx — more specific log count assertion
- products.test.ts — added DELETE 403 "returns 403 when not admin" test
- data-table-shell.test.tsx — pagination assertions updated for SSR compat
- layout.test.tsx — removed assertion for removed `<h1>Admin Dashboard</h1>`

**Status:** Complete

**Git Commit Message:**
```
fix: harden data layer and update test assertions

- Fix EAT timezone in todayStart calculation for dashboard stats
- Sanitize listing search input to prevent injection
- Add started_at field to sync log result tracking
- Add missing DELETE 403 test for products API
- Update test assertions to handle React SSR comment nodes
- Remove layout test assertion for removed heading
```
