## Phase 1 Complete: DB Schema, Types, Images & Data Layer

Replaced `is_on_sale BOOLEAN` with `listing_type` enum (`standard`, `sale`, `affiliate`), added `ram TEXT` column, updated all types/helpers/data-fetchers/seed/sheets-sync, added product image URLs to seed data, and added an affiliate listing example.

**Files created/changed:**
- supabase/migrations/20250706000000_listing_type_and_ram.sql
- types/product.ts
- types/database.ts
- src/helpers/pricing.ts
- src/components/ui/productCard.tsx
- src/lib/data/deals.ts
- src/lib/sheets/parser.ts
- src/lib/sheets/sync.ts
- scripts/seed.ts
- DESIGN.md
- tests/packages/pricing.test.ts
- tests/components/ui/product-card.test.tsx
- tests/app/search/page.test.tsx
- tests/seo/metadata.test.ts
- tests/seo/structured-data.test.ts
- tests/lib/cart/store.test.ts
- tests/lib/data/deals.test.ts
- tests/lib/sheets/sync.test.ts
- tests/components/listing/similar-listings.test.tsx
- tests/components/catalog/product-grid.test.tsx

**Functions created/changed:**
- `getPricingTier()` — signature changed from `isOnSale: boolean` to `listingType: string`
- `parseSheetRow()` — returns `listing_type` field instead of `is_on_sale`
- `syncFromSheets()` — maps `listing_type` instead of `is_on_sale`
- `toRow()` — exports `listing_type` instead of `is_on_sale`

**Tests created/changed:**
- Added affiliate pricing tier tests (discounted + normal paths)
- Added affiliate sheets sync parsing test
- Updated all 10 test files: `is_on_sale` → `listing_type`, added `ram: null` to mocks
- Total: 907 tests passing, 1944 expect() calls

**Review Status:** APPROVED (after revision — added affiliate test coverage + Constants parity)

**Git Commit Message:**
```
feat: replace is_on_sale with listing_type enum and add ram column

- Add listing_type enum (standard, sale, affiliate) via migration
- Add ram TEXT column to listings table
- Update getPricingTier() to accept listingType string
- Update sheets sync/parser for listing_type column
- Add affiliate listing example and product images to seed
- Update all types, tests, and DESIGN.md
```
