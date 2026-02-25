## Phase 6.5 Complete: Database Migration, Seed, New Crawlers & CodeRabbit Fixes

Applied base schema migration, created seed script with 20 products and 28 listings, added 3 new crawlers (Reebelo, Jiji, Jumia), and fixed 60+ CodeRabbit issues across security, UI, tests, and miscellaneous categories. All 586 tests pass.

**Files created:**
- supabase/migrations/20250600000000_base_schema.sql
- scripts/seed.ts
- scripts/crawlers/reebelo.ts
- scripts/crawlers/jiji.ts
- scripts/crawlers/jumia.ts
- tests/scripts/crawlers/reebelo.test.ts
- tests/scripts/crawlers/jiji.test.ts
- tests/scripts/crawlers/jumia.test.ts

**Files changed:**
- package.json (added `seed` and `crawl` scripts)
- scripts/crawlers/types.ts (added CompetitorName union type)
- scripts/crawlers/index.ts (registered 3 new crawlers)
- scripts/crawlers/utils.ts (added onConflict to upsert)
- scripts/crawlers/badili.ts (empty href guard)
- scripts/crawlers/phoneplace.ts (sale price via `<ins>` element)
- scripts/crawlers/swappa.ts (fixed search URL to `/search?q=`)
- src/app/api/admin/categories/route.ts (error leaking, mass assignment, slug strip)
- src/app/api/admin/categories/[id]/route.ts (error leaking, mass assignment)
- src/app/api/admin/customers/route.ts (input validation clamp)
- src/app/api/admin/customers/[id]/route.ts (error leaking)
- src/app/api/admin/listings/route.ts (error leaking, mass assignment, input validation)
- src/app/api/admin/listings/[id]/route.ts (error leaking, mass assignment)
- src/app/api/admin/orders/route.ts (input validation clamp)
- src/app/api/admin/orders/[id]/route.ts (error leaking)
- src/app/api/admin/products/route.ts (error leaking, mass assignment, slug strip, input validation)
- src/app/api/admin/reviews/route.ts (error leaking, rating validation, input validation)
- src/app/api/admin/sync/route.ts (split error handling)
- src/lib/data/admin.ts (filter injection sanitization, CSV escaping)
- src/app/admin/categories/client.tsx (router.refresh, safe JSON parse)
- src/app/admin/orders/columns.tsx (Link, date locale)
- src/app/admin/customers/[id]/page.tsx (Link)
- src/app/admin/listings/new/client.tsx (safe JSON parse, remove redundant router.refresh)
- src/app/admin/listings/columns.tsx (date locale)
- src/app/admin/products/new/client.tsx (safe JSON parse, remove redundant router.refresh)
- src/app/admin/reviews/columns.tsx (clamp rating, date locale)
- src/components/admin/data-table.tsx (keyboard sort accessibility)
- src/components/admin/sidebar.tsx (aria-current)
- src/components/admin/order-status-updater.tsx (router.refresh)
- src/components/admin/customer-role-switcher.tsx (router.refresh, safe JSON parse)
- src/components/admin/sync-status.tsx (safe JSON parse)
- src/components/admin/listing-form.tsx (price validation)
- src/components/admin/category-form.tsx (slug strip)
- src/components/admin/kpi-cards.tsx (null guard)
- src/components/admin/revenue-chart.tsx (date formatting)
- .github/workflows/price-crawler.yml (permissions, timeout)
- tests/scripts/crawlers/backmarket.test.ts (remove guard, dynamic KES rate)
- tests/scripts/crawlers/badili.test.ts (remove guard)
- tests/scripts/crawlers/swappa.test.ts (remove guard)
- tests/scripts/crawlers/phoneplace.test.ts (remove guard, sale price test)
- tests/scripts/crawlers/utils.test.ts (restore fetch, CompetitorName type)
- plans/pedie-store-plan.md (deferred items appendix)

**Functions created:**
- parseReebeloPage() — Reebelo HTML parser (USD → KES)
- crawlReebelo() — Reebelo crawler orchestrator
- parseJijiPage() — Jiji HTML parser (KES)
- crawlJiji() — Jiji crawler orchestrator
- parseJumiaPage() — Jumia HTML parser (KES)
- crawlJumia() — Jumia crawler orchestrator
- seed() — Database seed function (categories, products, listings)
- escapeCsvField() — CSV field escaping helper

**Functions changed:**
- generateSlug() — Added leading/trailing hyphen stripping
- upsertPriceComparisons() — Added onConflict parameter
- parseBadiliPage() — Added empty href guard
- parsePhonePlacePage() — Added sale price (`<ins>`) preference
- crawlSwappa() — Fixed search URL format

**Tests created:**
- Reebelo crawler tests (4 tests)
- Jiji crawler tests (4 tests)
- Jumia crawler tests (4 tests)
- PhonePlace sale price test (1 test)

**Tests changed:**
- Removed conditional guards in backmarket/badili/swappa/phoneplace tests
- Added dynamic KES_USD_RATE in backmarket test
- Added afterAll fetch restoration in utils test

**Review Status:** APPROVED

**Git Commit Message:**
```
feat: add base schema migration, seed, 3 new crawlers & CodeRabbit fixes

- Create base schema migration with all tables, enums, RLS, indexes, triggers
- Add seed script with 20 products, 28 listings across 5 categories
- Add Reebelo, Jiji, Jumia crawlers with tests (586 total tests passing)
- Fix error message leaking in all admin API routes
- Add mass assignment prevention with field whitelisting
- Add input validation (limit clamping, rating validation, NaN guards)
- Sanitize search inputs against PostgREST filter injection
- Fix UI issues: Link components, router.refresh, safe JSON parsing
- Add accessibility: keyboard sort, aria-current, price validation
- Improve test reliability: remove vacuous guards, restore fetch
- Add CSV escaping, date locale formatting, KPI null guards
- Update plan with deferred items appendix
```
