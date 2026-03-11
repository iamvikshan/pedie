## Phase 3 Complete: Sync Pipeline & Promotions Data Layer

Rewrote the Google Sheets sync pipeline and promotions data layer to align with the new database schema. Fixed 10+ column/table mismatches in sync.ts, added multi-tab export (Brands, Categories, Promotions), extended promotions logic to query the promotions table with date-bounded discounts, and disabled all crawlers pending future redesign.

**Details:**
- SheetRow interface rewritten: removed listing_id, source_listing_id, final_price_kes, original_price_kes, price_usd; added sale_price_kes, ram, includes, admin_notes, source_id
- findOrCreateProduct() resolves brands via slug FK, creates products with brand_id, enforces product_categories junction (respects partial unique index for one-primary-per-product)
- syncFromSheets() uses source_id for dedup, 'active' default status, 'archived' for soft-delete, includes new columns
- syncToSheets() exports listings via SKU dedup, 18-column listingHeaders, plus Brands/Categories/Promotions tabs (tabs always exported even when no listing rows)
- applyPromotionDiscount() applies discount_pct or discount_amount_kes, preserves existing sale_price if better
- getActivePromotions() queries promotions table with date bounds and is_active
- fetchPromotionListings() merges sale_price listings with promotions table data (listing-targeted + product-targeted), allows product promos to improve existing listings
- conditionMapping.ts adds PEDIE_GRADES array with 'new' and 'for_parts'
- All 9 crawler files + 9 crawler test files disabled with comments
- 8 behavioral tests for applyPromotionDiscount covering all edge cases

**Deviations from plan:**
- Crawlers disabled with single-line comments instead of block comments (Prettier compatibility)
- findOrCreateProduct checks existing primary category before upserting (partial unique index awareness)
- Source-string tests in deals.test.ts fully replaced with behavioral tests, not supplemented
- Review required 2 rounds: first round identified 4 MAJORs (syncToSheets early return, junction for existing products, product promo merge, shallow tests)

**Files created/changed:**
- src/lib/sheets/parser.ts
- src/lib/sheets/sync.ts
- src/lib/data/listings.ts
- src/lib/sync/conditionMapping.ts
- scripts/crawlers/backmarket.ts
- scripts/crawlers/badili.ts
- scripts/crawlers/index.ts
- scripts/crawlers/jiji.ts
- scripts/crawlers/jumia.ts
- scripts/crawlers/phoneplace.ts
- scripts/crawlers/reebelo.ts
- scripts/crawlers/swappa.ts
- scripts/crawlers/utils.ts
- tests/lib/data/deals.test.ts
- tests/lib/sheets/parser.test.ts
- tests/lib/sheets/sync.test.ts
- tests/lib/sync/condition-mapping.test.ts
- tests/scripts/crawlers/backmarket.test.ts
- tests/scripts/crawlers/badili.test.ts
- tests/scripts/crawlers/index.test.ts
- tests/scripts/crawlers/jiji.test.ts
- tests/scripts/crawlers/jumia.test.ts
- tests/scripts/crawlers/phoneplace.test.ts
- tests/scripts/crawlers/reebelo.test.ts
- tests/scripts/crawlers/swappa.test.ts
- tests/scripts/crawlers/utils.test.ts

**Functions created/changed:**
- toSlug() -- src/lib/sheets/sync.ts
- findOrCreateProduct() -- src/lib/sheets/sync.ts (rewritten)
- syncFromSheets() -- src/lib/sheets/sync.ts (rewritten)
- syncToSheets() -- src/lib/sheets/sync.ts (rewritten)
- syncBrandsToSheet() -- src/lib/sheets/sync.ts (new)
- syncCategoriesToSheet() -- src/lib/sheets/sync.ts (new)
- syncPromotionsToSheet() -- src/lib/sheets/sync.ts (new)
- applyPromotionDiscount() -- src/lib/data/listings.ts (new)
- getActivePromotions() -- src/lib/data/listings.ts (new)
- fetchPromotionListings() -- src/lib/data/listings.ts (rewritten)
- parseSheetRow() -- src/lib/sheets/parser.ts (rewritten)

**Tests created/changed:**
- 8 behavioral tests for applyPromotionDiscount (percentage, amount, no discount, zero, 100%, amount exceeding price, existing better, promotion improves existing)
- Parser tests updated for new SheetRow fields
- Sync tests updated for new column names/patterns
- Condition mapping tests for 'new' and 'for_parts'
- All crawler tests disabled

**Review Status:** APPROVED (after 2 review rounds -- all 4 MAJORs resolved)

**Git Commit Message:**
```
feat: rewrite sync pipeline and promotions for new schema

- Rewrite sheets sync to use brand FK, product_categories junction, source_id dedup
- Add multi-tab export: Brands, Categories, Promotions sheets
- Add applyPromotionDiscount with discount_pct/discount_amount_kes support
- Rewrite fetchPromotionListings to merge promotions table data
- Add PEDIE_GRADES condition mapping for new/for_parts
- Disable all crawlers pending redesign
- Replace source-string tests with behavioral tests for promotions
```
