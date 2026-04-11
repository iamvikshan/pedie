## Plan: Database Centralization & Overhaul

Overhaul the Pedie database schema from a phone-centric PoC to an industry-standard, category-agnostic e-commerce schema. Introduces SKU system, promotions table, brand normalization, flexible listing attributes, username-based auth, and Google Sheets sync expansion. All breaking changes -- no backward compatibility.

**Phase Rationale:**
- Phase 1 must land first: all subsequent code depends on the new schema
- Phase 2 (data layer) must follow immediately: the app won't compile without updated queries
- Phase 3 (sync pipeline) can run independently once the schema exists
- Phase 4 (auth + users) is decoupled from catalog concerns
- Phase 5 (frontend) depends on phases 1-3 being complete
- Phase 6 (types + tests + docs) is the final validation pass

**Resolved Tooling:** pm: "bun" | format: "bun run f" | lint: "bun check" | typecheck: "bunx tsc --noEmit" | test: "bun test" | fileNaming: "camelCase (files) | PascalCase (exports)" | iconLib: "react-icons/tb"

**Reference:** [docs/database-architecture.md](../docs/database-architecture.md)

---

### Phases

1. **[x] Phase 1: Schema Migration**
   - **Objective:** Replace the old schema with the new one via a single Supabase migration
   - **Summary:** Removed 13 old migration files, created single unified migration `20250800000000_schema.sql` with 7 enums, 16 tables, 10 functions, 12 triggers, 24 indexes, 37 RLS policies. Applied to live Supabase. Updated seed script and RLS tests. Regenerated TypeScript types.
   - **Changes from plan:** Added `promotions` CHECK constraints (target required, flash_sale needs discount). Added brand FTS cascade trigger. Added `sku` column DEFAULT for TS ergonomics. Policy names use `snake_case` naming convention instead of quoted descriptive names. `types/database.ts` regenerated in this phase (originally planned for Phase 6).
   - **Completion:** [Phase 1 details](.agents/plans/db-overhaul-phase-1-complete.md)

2. **[x] Phase 2: Data Access Layer Rewrite**
   - **Objective:** Rewrite `src/lib/data/*` queries for the new schema
   - **Summary:** Rewrote all data access layer queries, types, and helpers. 48 files modified. All public queries use `.eq('status', 'active')` (security fix from review). Brand filtering uses slugs consistently, with pre-resolved product IDs for count queries. Admin notes normalized to string[]. Deleted `deals.ts` -- promotion listing logic inlined in `listings.ts` as `getPromotionListings()` / `getHotPromotionListings()`. 1274 tests pass.
   - **Changes from plan:** Status filter initially used old `.not('status')` pattern -- fixed during review. Brand filter mismatch between available filters (names) and data queries (slugs) -- fixed. Brand count query: pre-resolve brand slugs to product IDs instead of unsupported nested relation filter on head/count queries (both listings.ts and search.ts). Admin notes scalar-to-array conversion added at API boundary. `getPricingTier()` returns `'sale'|'regular'|'premium'` -- will be removed in Phase 5 (cards handle display). `deals.ts` deleted and promotion logic moved to `listings.ts` (Phase 3 promotions data layer will extend this, not create a separate file). `bun check` gate skipped -- remaining errors are Phase 5 consumer files. Storefront consumer propagation deferred to Phase 5.
   - **Completion:** [Phase 2 details](.agents/plans/db-overhaul-phase-2-complete.md)

3. **[x] Phase 3: Sync Pipeline & Promotions Data Layer**
   - **Objective:** Fix sync pipeline for new schema (many broken column references), extend promotions data layer to query `promotions` table, add Brands/Categories/Promotions sheet tabs, add `new`/`for_parts` condition mappings, comment out crawlers.
   - **Summary:** Rewrote sheets sync pipeline (parser.ts, sync.ts), promotions data layer (listings.ts), and condition mapping (conditionMapping.ts). Added 8 behavioral tests for `applyPromotionDiscount()`. Disabled all 9 crawler files + 9 crawler test files. 1231 tests pass. Review required 2 rounds: fixed syncToSheets tab export bypass on empty listings, findOrCreateProduct product_categories enforcement with partial unique index awareness, product-level promotion merge logic, and replaced shallow source-string tests with behavioral tests.
   - **Changes from plan:** Crawlers disabled with single-line comments (Prettier compatibility). findOrCreateProduct handles the `idx_product_categories_one_primary` partial unique index by checking if product already has a primary category before upserting. Source-string assertion tests in deals.test.ts fully replaced by behavioral tests rather than supplemented.
   - **Completion:** [Phase 3 details](.agents/plans/db-overhaul-phase-3-complete.md)
   - **Schema mismatches to fix in sync.ts:**
     - Product lookup: `.eq('brand', brand)` (string) -> resolve via `brands` table FK (`brand_id`)
     - Product category: `category_id` column -> `product_categories` junction table
     - Listing PK: `listing_id` (text) -> `id` (uuid) + `sku` (text, auto-generated)
     - Source ID: `source_listing_id` -> `source_id`
     - USD price: `original_price_usd` column on listings -> does not exist (drop)
     - Product retail price: `original_price_kes` on products -> does not exist (drop)
     - Default status: `'available'` -> `'active'`
     - Soft-delete status: `'unlisted'` -> `'archived'`
     - `final_price_kes` column -> does not exist (use `sale_price_kes`)
     - Missing fields to add: `ram`, `sale_price_kes`, `includes`, `admin_notes`, `warranty_months`
   - **Files/Functions:**
     - `src/lib/sheets/sync.ts` -- rewrite `findOrCreateProduct()` (brand FK, junction table), rewrite `syncFromSheets()` listing data (fix all column refs), rewrite `syncToSheets()` (new select + toRow + listingHeaders), add Brands/Categories/Promotions sheet export
     - `src/lib/sheets/parser.ts` -- update `SheetRow` type: remove `listing_id`/`final_price_kes`/`source_listing_id`, add `sale_price_kes`/`ram`/`includes`/`admin_notes`/`warranty_months`/`source_id`
     - `src/lib/data/listings.ts` -- extend `fetchPromotionListings()` to query `promotions` table (date-bounded, `is_active`), apply `discount_pct`/`discount_amount_kes`, merge with `sale_price_kes` listings
     - `src/lib/sync/conditionMapping.ts` -- add `new` and `for_parts` mappings
     - `scripts/crawlers/*.ts` -- comment out all crawler code
   - **Tests to Write:**
     - Promotions data layer: getActivePromotions returns only date-valid promotions
     - Promotions data layer: effective price computation applies discount_pct correctly
     - Parser handles new fields (includes, admin_notes, warranty_months, ram, sale_price_kes)
     - Condition mapping covers `new` and `for_parts` enum values
     - Sync findOrCreateProduct uses brand_id FK and product_categories junction
     - Sync listing data uses correct column names (source_id, status=active, no final_price_kes)
   - **Quality Gates:** `bun test`

3.5. **[x] Phase 3.5: Sync Engine Hardening**
   - **Objective:** Replace single `SHEETS_TAB_NAME` with per-table `SHEETS_TAB` config, add human-readable sheet headers, implement bidirectional multi-tab sync with loop prevention, update Apps Script template. Delete crawler dead code (conditionMapping, crawler tests, workflow).
   - **Files/Functions:**
     - `src/config.ts` -- replace `SHEETS_TAB_NAME = 'inv'` with `SHEETS_TAB = { listings, brands, categories, products, promotions }` using human-friendly names
     - `src/lib/sheets/parser.ts` -- update header mapping for human-readable names (e.g. "Price (KES)" -> `price_kes`, "Listing Type" -> `listing_type`)
     - `src/lib/sheets/sync.ts`:
       - Use `SHEETS_TAB.*` constants throughout (replace hardcoded 'brands', 'categories', 'promotions' range strings)
       - Add human-readable `listingHeaders` mapping (display name <-> field name)
       - Add `syncBrandsFromSheet()`, `syncCategoriesFromSheet()`, `syncProductsFromSheet()`, `syncPromotionsFromSheet()` import functions
       - Add loop-prevention: check `sync_metadata.last_synced_at` vs `updated_at`, accept `source` flag ('admin' | 'sheets' | 'system') to skip same-source re-sync
       - `syncFromSheets()` reads all tabs, not just listings
       - `syncToSheets()` uses `SHEETS_TAB` constants
     - `src/app/api/sync/route.ts` -- pass `source: 'sheets'` to sync functions
     - `src/app/api/sync/export/route.ts` -- pass `source: 'system'` to export
     - `src/app/api/admin/sync/route.ts` -- accept direction param ('pull' | 'push' | 'both'), pass `source: 'admin'`
     - Admin listing mutation APIs -- trigger `syncToSheets({ mode: 'additive' })` after create/update
     - `scripts/sheets.ts` -- use `SHEETS_TAB` constants
     - `scripts/sheetsToSupabase.gs` -- update to reference new tab names, pass source flag
     - Delete: `src/lib/sync/conditionMapping.ts`, `tests/lib/sync/`, `tests/scripts/crawlers/`, `.github/workflows/crawler.yml`, `crawl` script from package.json
   - **Tests to Write:**
     - SHEETS_TAB constant covers all synced tables
     - Human-readable header round-trip (export headers -> import parsing)
     - Loop prevention: sync skips rows where `updated_at <= last_synced_at`
     - Source flag filtering: 'sheets' source skips sheets->DB re-sync
     - Multi-tab import parses brands/categories/promotions tabs
     - Admin sync route accepts direction parameter
   - **Quality Gates:** `bun run f` -> `bun test`
   - **Changes from plan:** Loop prevention is architectural (import/export are separate endpoints) rather than timestamp-based filtering. Admin fire-and-forget sync uses additive mode (append-only); full update-by-SKU semantics deferred to Phase 5. See [db-overhaul-phase-3.5-complete.md](.agents/plans/db-overhaul-phase-3.5-complete.md).

4. **[x] Phase 4: Auth & User Management**
   - **Objective:** Username login support, signup form update (remove full_name), admin user management page
   - **Files/Functions:**
     - `src/components/auth/signupForm.tsx` -- remove full_name, add username field
     - `src/components/auth/signinForm.tsx` -- "Username or email" field, resolve_username RPC
     - `src/lib/auth/*.ts` -- username resolution logic
     - `src/app/(admin)/admin/users/page.tsx` -- new admin users page
     - `src/components/admin/userManagement.tsx` -- DataTable with role assignment, user detail
     - DB: `resolve_username()` RPC function
   - **Tests to Write:**
     - Username validation regex rejects invalid inputs
     - Reserved username list blocks impersonation
     - Login form detects email vs username input
     - Admin users page renders user list
     - Role assignment updates profile
   - **Quality Gates:** `bun check` -> `bun test`

5. **[x] Phase 5A: Cart, Pricing & Core Type Consumers**
   - **Objective:** Fix the cart system, remove `getPricingTier`/`PricingTier` (keep other pricing helpers), and update core type consumers that listing/catalog components depend on.
   - **Summary:** Fixed cart identity (listing.id), effective pricing (sale_price_kes ?? price_kes) in getTotal/getDepositTotal, conditional deposit for preorder only, product_name in orders/email. Removed getPricingTier/PricingTier. 13 files changed, 25 tests passing in modified files.
   - **Changes from plan:** Removed 'onsale' status test (not valid enum). 20 consumer test failures remain (Phase 5C scope).
   - **[Phase 5A Details](.agents/plans/db-overhaul-phase-5A-complete.md)**
   - **Files/Functions to modify:**
     - `src/lib/cart/store.ts` -- replace `listing.listing_id` with `listing.id`; replace `item.final_price_kes` with `item.sale_price_kes ?? item.price_kes` for totals; update `getTotal()` to also use `sale_price_kes ?? price_kes` (currently uses bare `price_kes` which is now the base price, not effective price); use same effective price for `calculateDeposit()`
     - `src/components/cart/cartItem.tsx` -- update price display: `price_kes` as regular price, `sale_price_kes` as discounted; remove `original_price_kes`/`final_price_kes` refs; fix `product.brand` -> `product.brand.name`, `product.model` -> `product.name`; use `listing.sku` for display badge and `listing.id` for store key/remove call
     - `src/app/(store)/cart/client.tsx` -- fix `listing_id` -> `listing.id`
     - `src/app/(store)/checkout/page.tsx` -- ensure deposit calculation uses `sale_price_kes ?? price_kes`; update `unit_price_kes` to `listing.sale_price_kes ?? listing.price_kes` (currently records base price, not effective price); verify no remaining `listing.listing_id` refs (file already uses `.id`); add `product_name: listing.product.name` to `orderItems` map (required by `CreateOrderInput`)
     - `src/helpers/pricing.ts` -- remove ONLY `getPricingTier()` function and `PricingTier` type export; keep `calculateDeposit`, `formatKes`, `usdToKes`, `calculateDiscount`
     - `src/helpers/index.ts` -- verify barrel re-export still works after removal
     - `src/app/api/orders/route.ts` -- verify listing_id usage (valid FK); fix email items map: replace `name: item.listing_id` with `name: item.product_name` so confirmation emails show product names instead of UUIDs
     - `src/components/orders/orderItems.tsx` -- fix any listing_id display references
   - **Tests to update:**
     - `tests/lib/cart/store.test.ts` (26 errors) -- update mock data: remove `final_price_kes` from all `makeListing()` overrides, add `price_kes`/`sale_price_kes`/`sku`/`product_id`; update nested `product` shape: `brand` -> `{ id, name, slug, ... }` (Brand object), rename `model` -> `name`; update all `items[0].listing_id` assertions to `.id`; fix price assertions; replace `status: 'available'` with `'active'`, `status: 'onsale'` with `'active'`; add test case where `sale_price_kes < price_kes` to verify `getTotal()` uses effective price
     - `tests/packages/pricing.test.ts` -- remove only the `getPricingTier` describe block; keep tests for surviving functions
     - `tests/lib/data/orders.test.ts` (1 error) -- add missing `product_name` to mock `CreateOrderInput` items
     - `tests/components/ui/product-card.test.tsx` -- remove inline test case calling `getPricingTier` directly (1 test); remove `getPricingTier` from import line
     - `tests/components/ui/product-family-card.test.tsx` -- remove inline test cases calling `getPricingTier` directly (3 tests: 'sale tier', 'regular tier', 'premium tier'); remove `getPricingTier` from import line
   - **Quality Gates:** `bun run f` -> `bun check` (expected residual errors: `productCard.tsx` and `productFamilyCard.tsx` will have broken `getPricingTier` import until 5C; listing component errors until 5B) -> `bun test`

6. **[x] Phase 5B: Listing Components & Detail Pages**
   - **Objective:** Update all listing display components and the listing detail page for the new schema. Rename route from `[listingId]` to `[sku]`.
   - **Summary:** Renamed listing route to `[sku]`, added `getListingBySku()`, updated all listing components for new schema fields (sku, brand.name, product.name, effective pricing). Fixed ProductFamily data producers to return `ProductWithBrand`. Added `getPrimaryCategoryForProduct()` helper. PriceDisplay accepts optional `originalPriceKes`. Updated sitemap/JSON-LD for SKU URLs. Deleted dead `youMayAlsoLike.tsx`. 130 tests passing across 12 files.
   - **Changes from plan:** Added `getPrimaryCategoryForProduct()` in categories.ts. Updated structuredData.ts for SKU URLs. Fixed ProductFamily casts in products.ts. Deleted dead youMayAlsoLike.tsx instead of updating commented code.
   - **[Phase 5B Details](.agents/plans/db-overhaul-phase-5B-complete.md)**
   - **Files/Functions to modify:**
     - `src/components/listing/productDetailClient.tsx` -- replace `listing_id` with `listing.id`, `product.model` with `product.name`, `product.brand` (string) with `product.brand.name`, `product.category` with category from junction, `original_price_kes`/`final_price_kes` with `price_kes`/`sale_price_kes`
     - `src/components/listing/listingInfo.tsx` -- `price_kes`/`sale_price_kes` instead of `final_price_kes`/`original_price_kes`; `listing.listing_id` -> `listing.sku`; `product.brand` -> `product.brand.name`; `product.model` -> `product.name`; remove `listing.carrier` block (carrier removed from schema)
     - `src/components/listing/addToCart.tsx` -- `listing.listing_id` -> `listing.id` (UUID for cart store identification)
     - `src/components/listing/similarListings.tsx` -- update listing field references
     - `src/components/listing/betterDealNudge.tsx` -- `betterDeal.listing_id` -> `betterDeal.sku` in href URL (component has no source_id/source_listing_id)
     - `src/components/listing/referralCta.tsx` -- `listing.listing_id` -> `listing.sku` in WhatsApp message; `product.brand` -> `product.brand?.name`; `product.model` -> `product.name`; rename local `model` variable to `name`
     - `src/components/listing/priceDisplay.tsx` -- make `originalPriceKes` prop optional (`number | null`), guard `calculateDiscount` and `formatKes` calls for null
     - `src/components/listing/youMayAlsoLike.tsx` -- update listing field references
     - `src/lib/data/listings.ts` -- add `getListingBySku(sku: string)` function that queries `.eq('sku', sku)` instead of `.eq('id', ...)`. Keep existing `getListingById()` for admin UUID lookups.
     - `src/app/(store)/listings/[listingId]/` -- RENAME directory to `[sku]/` (move both `page.tsx` and `loading.tsx`); update `page.tsx`: look up listing via new `getListingBySku()`, fix all field refs (`model`->`product.name`, `category`->`product_categories`, `listing_id`->`id`, `final_price_kes`->`sale_price_kes`, `original_price_kes` removed, `category_id` type fix); update `getRelatedListings` call to pass only `listing.product_id` (remove category_id arg)
     - `src/app/(store)/products/[slug]/page.tsx` -- fix `product.brand`/`product.model` -> `product.brand.name`/`product.name`, `final_price_kes`->`sale_price_kes`, `category_id`->`product_categories`, `product.category` references; update `getRelatedListings` call to pass only `product.id` (remove category_id arg)
     - `src/app/sitemap.ts` -- update `.select('id, updated_at')` to `.select('sku, updated_at')`; update listing URLs from `l.id` to `l.sku`; update category derivation to use junction table
   - **Redirect strategy:** Accept the `/listings/[uuid]` -> `/listings/[sku]` URL break (AGENTS.md permits breaking changes, pre-launch product, URLs not indexed). Document the breaking change in Phase 6 docs.
   - **Tests to update:**
     - `tests/components/listing/variant-selector.test.tsx` (5 errors) -- update mock listing shape
     - `tests/components/listing/add-to-cart.test.tsx` (2 errors) -- update mock listing shape
     - `tests/components/listing/better-deal-nudge.test.tsx` -- source-analysis test: update assertion from `betterDeal.listing_id` to `betterDeal.sku`
     - `tests/components/listing/referral-cta.test.tsx` -- source-analysis test: update `listing.listing_id` assertion to `listing.sku`; update `product?.brand || ''` assertion to `product.brand?.name || ''`; update `product?.model || ''` assertion to `product?.name || ''`; rename test descriptions: remove `listing_id` from first test, replace `model` with `name` in `defensively defaults` test
   - **Quality Gates:** `bun run f` -> `bun check` (expect remaining errors only in 5C scope) -> `bun test`

7. **[x] Phase 5C: Catalog, Admin, Account & Dead Code Sweep**
   - **Objective:** Update catalog/filter components, admin forms/APIs, account pages for stale refs. Delete crawler dead code. Achieve zero `bun check` errors.
   - **Summary:** Replaced `getPricingTier` with inline `isSale` in UI cards. Made product_categories sync non-destructive (upsert). Removed carrier from filters. Updated admin forms/columns/APIs for new schema. Added PUT validation parity. Zero `bun check` errors, 1249 tests passing.
   - **Changes from plan:** Admin product_categories sync required non-destructive upsert pattern. Added PUT validation parity as security improvement.
   - **[Phase 5C Details](.agents/plans/db-overhaul-phase-5C-complete.md)**
   - **Files/Functions to modify:**
     - **Catalog components:**
       - `src/components/catalog/filterSidebar.tsx` -- remove `carrier` filter, update category filter for junction table data
       - `src/components/catalog/activeFilters.tsx` -- align with new filter shape (no carrier)
       - `src/components/catalog/productGrid.tsx` -- update listing field mapping
       - `src/components/home/customerFavorites.tsx` -- fix `product.brand`/`product.model` -> `product.brand.name`/`product.name`, fix price fields
       - `src/components/layout/searchBar.tsx` -- fix category references if any
     - **UI components (resolves 5A residual):**
       - `src/components/ui/productCard.tsx` -- inline `isSale = (listing.sale_price_kes != null && listing.sale_price_kes < listing.price_kes)`; remove `getPricingTier`/`PricingTier` import; promotion badges, `sale_price_kes` display logic
       - `src/components/ui/productFamilyCard.tsx` -- inline `isSale` logic; remove `getPricingTier`/`PricingTier` import; updated pricing fields
     - **Storefront pages:**
       - `src/app/(store)/shop/page.tsx` -- remove `carrier` from filters
       - `src/app/(store)/collections/[slug]/page.tsx` -- remove `carrier` from filters
     - **Admin APIs:**
       - `src/app/api/admin/listings/[id]/route.ts` -- remove `source_listing_id`, `original_price_usd` references
       - `src/app/api/admin/products/[id]/route.ts` -- remove `original_price_kes` references
       - `src/app/api/admin/products/route.ts` -- remove `original_price_kes` references
     - **Admin components:**
       - `src/components/admin/productForm.tsx` -- `brand_id` select instead of brand string, remove `original_price_kes`, add `product_categories` junction
       - `src/components/admin/listingForm.tsx` -- verify new fields present (includes, notes, admin_notes, warranty, attributes)
       - `src/components/admin/categoryForm.tsx` -- icon field
       - `src/app/(admin)/admin/listings/[id]/client.tsx` -- fix `Product` type usage (brand/model shape)
       - `src/app/(admin)/admin/listings/new/client.tsx` -- fix `Product` type usage
       - `src/app/(admin)/admin/products/columns.tsx` -- update local `ProductRow` interface: `brand`/`model` -> `name`/`brand: { name }`
       - `src/app/(admin)/admin/reviews/columns.tsx` -- update local `ReviewRow` interface: `product: { brand: { name: string }; name: string } | null`; update cell renderer: `product.brand` -> `product.brand?.name`, `product.model` -> `product.name`
       - `src/app/(admin)/admin/prices/page.tsx` -- update `ComparisonRow.product` interface
       - `src/app/(admin)/admin/orders/[id]/page.tsx` -- replace `listing_id` display with `listing.sku`, fix `product.brand`/`product.model`
     - **Account pages:**
       - `src/app/(account)/account/wishlist/page.tsx` -- remove `original_price_kes`, update `product.brand`/`product.model` to `product.brand.name`/`product.name`
     - **Dead code deletion:**
       - Verify `scripts/crawlers/` does not exist (already removed in earlier phases). If somehow present, delete it.
       - Note: `.github/workflows/crawler.yml` and `tests/scripts/crawlers/` were already removed in earlier phases -- skip if absent
   - **Tests to update:**
     - `tests/components/catalog/filter-sidebar.test.tsx` (1 error) -- remove carrier filter mock
     - `tests/components/layout/megaMenu.test.tsx` (3 errors) -- update category/product shape mocks
     - `tests/components/layout/mobileNav.test.tsx` (1 error) -- update mock shape
     - `tests/components/layout/sidebarPanel.test.tsx` (2 errors) -- update mock shape
     - `tests/lib/auth/helpers.test.ts` (1 error) -- fix type mismatch
     - `tests/lib/data/wishlist.test.ts` (1 error) -- update mock listing shape
     - `tests/lib/data/listings.test.ts` (2 errors) -- BEHAVIORAL REWRITE required: test asserting `listing.listing_id` by field name must become `listing.sku` with `getListingBySku` function; not just a mock-shape swap
     - `tests/app/products/page.test.tsx` -- source-analysis: update `product.brand`/`product.model` assertions
     - `tests/app/listings/page.test.tsx` -- update mock data: remove `listing_id`, `source_listing_id`, `original_price_kes`; update dynamic import path from `[listingId]/page` to `[sku]/page`; update `readFileSync` path string; change `Promise.resolve({ listingId })` to `{ sku }`; update content assertions for SKU format
     - `tests/lib/data/search.test.ts` -- update mock data: remove `listing_id`, `source_listing_id`, `original_price_kes`
     - `tests/lib/data/admin.test.ts` -- update mock listing IDs from string to UUID format
     - `tests/app/admin/orders.test.tsx` -- update mock data: remove `listing_id`
   - **Quality Gates:** `bun run f` -> `bun check` (ZERO errors required) -> `bun test`

8. **[x] Phase 6: Documentation & Build Validation**
   - **Summary:** Updated product-architecture.md with full schema changes (brand_id FK, product.name, junction categories, SKU system, inline pricing with isSale logic, promotions, ProductFamily type). Updated DESIGN.md with inline pricing section and [sku] routes. database-architecture.md verified accurate (no changes needed). Build skipped due to pre-existing missing Supabase env vars in dev container.
   - **Changes from plan:** Build validation skipped (pre-existing env limitation, not introduced by overhaul). Fixed pricing model description to distinguish SQL/cart COALESCE from UI isSale guard. Fixed ProductFamily type to match actual types/product.ts (ProductWithBrand, Listing[], Listing).
   - **[Phase 6 Details](.agents/plans/db-overhaul-phase-6-complete.md)**

---

### Open Questions

1. Admin sync UI expansion (direction buttons, per-tab status display) -- deferred to a separate enhancement task. Current sync endpoints work; UI polish is not a schema blocker.

### Recommendations
- Add a `promotions` sheet to Google Sheets to manage deals alongside admin UI
- Consider adding `created_by` (uuid FK to profiles) on promotions for audit trail
- Future: Admin dashboard charts for promotion performance (conversion rate, revenue impact)
- Future: Bulk SKU import/export for inventory management
- Future: Product variant matrix (auto-generate listing combinations from product specs)
