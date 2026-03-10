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
   - **Completion:** [Phase 1 details](.zeus/plans/db-overhaul-phase-1-complete.md)

2. **[x] Phase 2: Data Access Layer Rewrite**
   - **Objective:** Rewrite `src/lib/data/*` queries for the new schema
   - **Summary:** Rewrote all data access layer queries, types, and helpers. 48 files modified. All public queries use `.eq('status', 'active')` (security fix from review). Brand filtering uses slugs consistently, with pre-resolved product IDs for count queries. Admin notes normalized to string[]. Deleted `deals.ts` -- promotion listing logic inlined in `listings.ts` as `getPromotionListings()` / `getHotPromotionListings()`. 1274 tests pass.
   - **Changes from plan:** Status filter initially used old `.not('status')` pattern -- fixed during review. Brand filter mismatch between available filters (names) and data queries (slugs) -- fixed. Brand count query: pre-resolve brand slugs to product IDs instead of unsupported nested relation filter on head/count queries (both listings.ts and search.ts). Admin notes scalar-to-array conversion added at API boundary. `getPricingTier()` returns `'sale'|'regular'|'premium'` -- will be removed in Phase 5 (cards handle display). `deals.ts` deleted and promotion logic moved to `listings.ts` (Phase 3 promotions data layer will extend this, not create a separate file). `bun check` gate skipped -- remaining errors are Phase 5 consumer files. Storefront consumer propagation deferred to Phase 5.
   - **Completion:** [Phase 2 details](.zeus/plans/db-overhaul-phase-2-complete.md)

3. **[x] Phase 3: Sync Pipeline & Promotions Data Layer**
   - **Objective:** Fix sync pipeline for new schema (many broken column references), extend promotions data layer to query `promotions` table, add Brands/Categories/Promotions sheet tabs, add `new`/`for_parts` condition mappings, comment out crawlers.
   - **Summary:** Rewrote sheets sync pipeline (parser.ts, sync.ts), promotions data layer (listings.ts), and condition mapping (conditionMapping.ts). Added 8 behavioral tests for `applyPromotionDiscount()`. Disabled all 9 crawler files + 9 crawler test files. 1231 tests pass. Review required 2 rounds: fixed syncToSheets tab export bypass on empty listings, findOrCreateProduct product_categories enforcement with partial unique index awareness, product-level promotion merge logic, and replaced shallow source-string tests with behavioral tests.
   - **Changes from plan:** Crawlers disabled with single-line comments (Prettier compatibility). findOrCreateProduct handles the `idx_product_categories_one_primary` partial unique index by checking if product already has a primary category before upserting. Source-string assertion tests in deals.test.ts fully replaced by behavioral tests rather than supplemented.
   - **Completion:** [Phase 3 details](.zeus/plans/db-overhaul-phase-3-complete.md)
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
     - `src/lib/sheets/sync.ts` -- rewrite `findOrCreateProduct()` (brand FK, junction table), rewrite `syncFromSheets()` listing data (fix all column refs), rewrite `syncToSheets()` (new select + toRow + SHEET_HEADERS), add Brands/Categories/Promotions sheet export
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
       - Add human-readable `SHEET_HEADERS` mapping (display name <-> field name)
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
   - **Changes from plan:** Loop prevention is architectural (import/export are separate endpoints) rather than timestamp-based filtering. Admin fire-and-forget sync uses additive mode (append-only); full update-by-SKU semantics deferred to Phase 5. See [db-overhaul-phase-3.5-complete.md](.zeus/plans/db-overhaul-phase-3.5-complete.md).

4. **[ ] Phase 4: Auth & User Management**
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

5. **[ ] Phase 5: Frontend Adaptation & Dead Code Cleanup**
   - **Objective:** Update all frontend components for the new schema. Remove `getPricingTier()` (cards handle display). Align card/component naming with glossary. Sweep for and remove all dead code, stale imports, and old schema references left over from earlier phases.
   - **Files/Functions:**
     - **Dead code / stale reference cleanup:**
       - Grep for old column names, removed enum values, deleted module imports (e.g. `@data/deals`, old status values, old field names)
       - Remove any unused exports, orphaned helper functions, or stale type references
       - Resolve all `bun check` type errors accumulated from Phases 2-4
     - `src/helpers/pricing.ts` -- remove `getPricingTier()` and `PricingTier` type entirely (cards decide what to display based on `sale_price_kes` presence)
     - `src/components/catalog/*` -- filter sidebar (new column names, promotions)
     - `src/components/listing/*` -- SKU display, notes/includes sections, new pricing
     - `src/components/home/*` -- promotions section (was deals), featured section
     - `src/components/ui/productCard.tsx` -- promotion badges, inline sale/regular display logic
     - `src/components/ui/productFamilyCard.tsx` -- updated pricing, glossary-aligned naming
     - `src/lib/cart/store.ts` -- SKU references instead of listing_id
     - `src/lib/cart/validation.ts` -- updated validation
     - `src/components/admin/listingForm.tsx` -- new fields (includes, notes array, admin_notes, warranty, attributes)
     - `src/components/admin/productForm.tsx` -- brand_id select, product_categories
     - `src/components/admin/categoryForm.tsx` -- icon field
     - Storefront consumer propagation: shop page, filterSidebar, searchBar, productDetailClient
     - URL routes: `/listings/[sku]` replaces `/listings/[listingId]`
     - Card/component glossary: align productCard/productFamilyCard naming with Product/Listing/ProductFamily terminology
     - **Admin sync UI:** expand sync dashboard with direction buttons ("Pull from Sheets" / "Push to Sheets"), show per-tab sync status, last sync timestamps
   - **Tests to Write:**
     - Product card renders promotion badges from promotions data
     - Card display logic: sale_price_kes presence drives sale badge + strikethrough
     - Listing detail shows notes/includes when present
     - Cart validation uses SKU
     - Admin forms include new fields
     - Admin sync dashboard renders direction buttons and per-tab status
   - **Quality Gates:** `bun run f` -> `bun check` -> `bun test`

6. **[ ] Phase 6: Types, Tests & Documentation**
   - **Objective:** Regenerate database types, comprehensive test pass, update documentation
   - **Files/Functions:**
     - `types/database.ts` -- regenerated from Supabase
     - `types/product.ts` -- final alignment with new schema
     - `types/order.ts` -- variant_summary, quantity
     - `docs/DESIGN.md` -- update color/component docs if any tokens changed
     - `docs/product-architecture.md` -- update data model section, listing types, card behavior
     - `docs/database-architecture.md` -- verify accuracy after implementation
     - Test files across `tests/` -- fix any remaining failures
   - **Tests to Write:**
     - Full regression: `bun test` passes all tests
     - Source analysis: SKU format validation
     - Type compatibility: no TypeScript errors
   - **Quality Gates:** `bun check` -> `bun test` -> `bun run build`

---

### Open Questions
(none -- all resolved during planning)

### Recommendations
- Add a `promotions` sheet to Google Sheets to manage deals alongside admin UI
- Consider adding `created_by` (uuid FK to profiles) on promotions for audit trail
- Future: Admin dashboard charts for promotion performance (conversion rate, revenue impact)
- Future: Bulk SKU import/export for inventory management
- Future: Product variant matrix (auto-generate listing combinations from product specs)
