## Phase 6 Complete: Admin Dashboard & Price Crawlers

Implemented a full admin dashboard with KPI cards (revenue, orders, customers, products, listings), revenue chart, reusable DataTable with URL-based pagination/search, and CRUD management for listings, products, categories, orders, customers, reviews, and newsletter subscribers. Added price crawlers for 4 competitor sites (Badili, PhonePlace, Swappa, BackMarket) running as a daily GitHub Actions cron job writing directly to Supabase, with a price comparison dashboard featuring margin indicators. Order status changes trigger transactional emails (shipping, delivery, cancellation). All 573 tests pass, `bun check` clean.

**Files created/changed:**

### Admin Data Layer & Infrastructure (6.1)
- `supabase/migrations/20250702000000_sync_log.sql` — sync_log table with RLS policies
- `src/lib/data/admin.ts` — 23 admin CRUD functions (stats, revenue, orders, listings, products, categories, customers, reviews, newsletter, sync log, price comparisons, product min prices)
- `src/app/admin/layout.tsx` — Server layout with requireAuth() + isUserAdmin() gate
- `src/components/admin/sidebar.tsx` — Client sidebar with 10 nav items, mobile hamburger
- `types/database.ts` — Updated with sync_log table types

### Dashboard KPIs (6.2)
- `src/app/admin/page.tsx` — Dashboard composing KPI cards, revenue chart, recent orders
- `src/components/admin/kpi-cards.tsx` — 5 KPI stat cards with formatKes
- `src/components/admin/revenue-chart.tsx` — recharts AreaChart (30-day revenue)
- `src/components/admin/recent-orders.tsx` — Recent orders table with status badges

### Reusable DataTable (6.3)
- `src/components/admin/data-table.tsx` — Generic DataTable<TData, TValue> using @tanstack/react-table
- `src/components/admin/data-table-shell.tsx` — Client wrapper with URL-based pagination/search
- `src/components/admin/data-table-pagination.tsx` — Previous/Next + page display + rows per page
- `src/components/admin/data-table-toolbar.tsx` — Debounced search + filter dropdowns + bulk actions
- `src/components/admin/data-table-column-header.tsx` — Sortable column headers with direction arrows

### Listing Management (6.4)
- `src/app/api/admin/listings/route.ts` — GET (paginated, filtered) + POST (auto-generate listing_id)
- `src/app/api/admin/listings/[id]/route.ts` — PUT + DELETE
- `src/app/api/admin/upload/route.ts` — POST multipart image upload with MIME type allowlist, 5MB size limit, filename sanitization
- `src/app/admin/listings/page.tsx`, `new/page.tsx`, `[id]/page.tsx` — Listing pages with client wrappers
- `src/app/admin/listings/columns.tsx` — 8 column definitions
- `src/components/admin/listing-form.tsx` — Listing form with validation

### Product & Category Management (6.5)
- `src/app/api/admin/products/route.ts` — GET + POST (auto-generate slug)
- `src/app/api/admin/products/[id]/route.ts` — PUT + DELETE
- `src/app/api/admin/categories/route.ts` — GET + POST (auto-generate slug)
- `src/app/api/admin/categories/[id]/route.ts` — PUT + DELETE
- `src/app/admin/products/page.tsx`, `new/page.tsx`, `[id]/page.tsx` — Product pages with client wrappers
- `src/app/admin/categories/page.tsx` + `client.tsx` — Category management
- `src/components/admin/product-form.tsx`, `category-form.tsx` — Forms with validation
- Column definition files for products and categories

### Order Management (6.6)
- `src/app/api/admin/orders/route.ts` — GET list orders
- `src/app/api/admin/orders/[id]/route.ts` — GET detail, PUT status/tracking with status validation (6 allowed values) and tracking_info object validation, triggers transactional emails
- `src/app/admin/orders/page.tsx`, `[id]/page.tsx` — Order pages
- `src/components/admin/order-status-updater.tsx` — Status change dropdown
- `src/components/admin/tracking-form.tsx` — Tracking info form
- `src/lib/email/templates.ts` — Added shippingUpdateEmail, deliveryConfirmationEmail, orderCancelledEmail
- `src/lib/email/send.ts` — Added sendShippingUpdate, sendDeliveryConfirmation, sendOrderCancelled

### Customer, Review & Newsletter Management (6.7)
- `src/app/api/admin/customers/route.ts`, `[id]/route.ts` — List + role management
- `src/app/api/admin/reviews/route.ts` — List + DELETE
- `src/app/api/admin/newsletter/route.ts` — List + CSV export
- `src/app/admin/customers/page.tsx`, `reviews/page.tsx`, `newsletter/page.tsx` — Management pages
- `src/components/admin/customer-role-switcher.tsx` — Role toggle
- `src/components/admin/newsletter-export-button.tsx` — CSV download

### Sync Dashboard (6.8)
- `src/app/api/admin/sync/route.ts` — GET history, POST trigger sync
- `src/app/admin/sync/page.tsx` — Sync dashboard page
- `src/components/admin/sync-status.tsx` — Current sync status card
- `src/components/admin/sync-log.tsx` — Sync history log

### Price Crawlers (6.9)
- `scripts/crawlers/types.ts` — CrawlerProduct and PriceResult interfaces
- `scripts/crawlers/utils.ts` — fetchWithRetry (with response.ok check and retry on 429/5xx), parseKesPrice, parseUsdPrice, rateLimiter, createCrawlerClient, getProductCatalog, upsertPriceComparisons
- `scripts/crawlers/badili.ts`, `phoneplace.ts`, `swappa.ts`, `backmarket.ts` — Individual site crawlers
- `scripts/crawlers/index.ts` — Orchestrator with runCrawlers + main()
- `.github/workflows/price-crawler.yml` — Daily cron at 3 AM UTC using oven-sh/setup-bun@v2

### Price Comparison Dashboard (6.10)
- `src/app/admin/prices/page.tsx` — Server component with actual Pedie min prices populated
- `src/components/admin/price-comparison-table.tsx` — Product-grouped comparison table
- `src/components/admin/margin-indicator.tsx` — Color-coded margin badge

**Functions created/changed:**
- `getDashboardStats()`, `getRevenueData()`, `getRecentOrders()` — Dashboard data
- `getAdminOrders()`, `getAdminOrderDetail()`, `updateOrder()` — Order management
- `getAdminListings()`, `createListing()`, `updateListing()`, `deleteListing()` — Listing CRUD
- `getAdminProducts()`, `createProduct()`, `updateProduct()`, `deleteProduct()` — Product CRUD
- `getAdminCategories()`, `createCategory()`, `updateCategory()`, `deleteCategory()` — Category CRUD
- `getAdminCustomers()`, `updateCustomerRole()` — Customer management
- `getAdminReviews()`, `deleteReview()` — Review moderation
- `getNewsletterSubscribers()` — Newsletter export
- `getSyncLog()` — Sync history
- `getPriceComparisons()`, `getProductMinPrices()` — Price comparison data
- `sendShippingUpdate()`, `sendDeliveryConfirmation()`, `sendOrderCancelled()` — Email senders
- `shippingUpdateEmail()`, `deliveryConfirmationEmail()`, `orderCancelledEmail()` — Email templates
- `fetchWithRetry()`, `parseKesPrice()`, `parseUsdPrice()`, `rateLimiter()` — Crawler utilities
- `crawlBadili()`, `crawlPhonePlace()`, `crawlSwappa()`, `crawlBackMarket()` — Site crawlers
- `runCrawlers()` — Crawler orchestrator
- `DataTableShell` — Client wrapper for URL-based pagination/search

**Tests created/changed:**
- `tests/components/admin/dashboard.test.tsx` — KPI cards, revenue chart, recent orders
- `tests/components/admin/data-table.test.tsx` — DataTable rendering, sorting, selection
- `tests/components/admin/data-table-shell.test.tsx` — URL-based pagination/search
- `tests/components/admin/sidebar.test.tsx` — Navigation, mobile toggle
- `tests/app/api/admin/listings.test.ts` — CRUD + auth checks
- `tests/app/api/admin/products.test.ts` — CRUD + slug generation
- `tests/app/api/admin/categories.test.ts` — CRUD with correct GET signatures
- `tests/app/api/admin/orders.test.ts` — CRUD + status validation + email trigger assertions
- `tests/app/api/admin/upload.test.ts` — MIME type validation, size limit, filename sanitization
- `tests/app/api/admin/customers.test.ts` — List + role update
- `tests/app/api/admin/reviews.test.ts` — List + delete
- `tests/app/api/admin/newsletter.test.ts` — List + CSV export
- `tests/app/api/admin/sync.test.ts` — History + trigger
- `tests/app/admin/prices.test.tsx` — Price dashboard with actual min prices
- `tests/components/admin/listing-form.test.tsx` — Form validation
- `tests/components/admin/product-form.test.tsx` — Form validation
- `tests/components/admin/category-form.test.tsx` — Form validation
- `tests/components/admin/order-management.test.tsx` — Status updater, tracking form
- `tests/components/admin/customer-review-newsletter.test.tsx` — Role switcher, export
- `tests/components/admin/sync-dashboard.test.tsx` — Status, log display
- `tests/components/admin/price-dashboard.test.tsx` — Comparison table, margin indicators
- `tests/scripts/crawlers/crawlers.test.ts` — Individual crawler parsing
- `tests/scripts/crawlers/utils.test.ts` — Retry logic with response.ok, price parsing, rate limiter

**Review Status:** APPROVED (all 5 MAJOR + 3 MINOR findings resolved)

**Git Commit Message:**
```
feat: add admin dashboard and price crawlers

- Admin dashboard with KPI cards, revenue chart, and recent orders
- Reusable DataTable with URL-based pagination, search, and sorting
- Full CRUD for listings, products, categories, orders, customers
- Review moderation and newsletter subscriber CSV export
- Order status emails (shipping, delivery, cancellation)
- Image upload with MIME type validation and 5MB size limit
- Price crawlers for Badili, PhonePlace, Swappa, BackMarket
- GitHub Actions daily cron for automated price crawling
- Price comparison dashboard with margin indicators
- Sync dashboard with manual trigger and history log
- 573 tests passing, bun check clean
```
