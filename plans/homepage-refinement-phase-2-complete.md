## Phase 2 Complete: Product Cards Redesign, Condition Icons & `final_price_kes` Field

Added `final_price_kes` column to Supabase DB and propagated through types, sheets sync, and all test fixtures. Rewrote `productCard.tsx` as a server component with 3-tier pricing logic (sale/discounted/normal) and full-card Link wrapper — removed cart, wishlist, and auth hooks. Rewrote `conditionBadge.tsx` to icon-only with tooltip (TbCrown/TbDiamond/TbThumbUp/TbCircleCheck). Added `getPricingTier` helper function.

**Files created/changed:**
- supabase/migrations/20250706000000_add_final_price_kes.sql
- types/product.ts
- types/database.ts
- src/lib/sheets/parser.ts
- src/lib/sheets/sync.ts
- src/helpers/pricing.ts
- src/components/ui/conditionBadge.tsx
- src/components/ui/productCard.tsx
- scripts/seed.ts
- tests/components/ui/conditionBadge.test.tsx
- tests/components/ui/product-card.test.tsx
- tests/lib/sheets/sync.test.ts
- tests/packages/pricing.test.ts
- tests/components/catalog/product-grid.test.tsx
- tests/components/listing/similar-listings.test.tsx
- tests/lib/cart/store.test.ts
- tests/seo/metadata.test.ts
- tests/seo/structured-data.test.ts

**Functions created/changed:**
- `getPricingTier(finalPriceKes, priceKes, isOnSale)` — new 3-tier pricing classifier
- `PricingTier` type — 'sale' | 'discounted' | 'normal'
- `ConditionBadge` — rewritten to icon-only with tooltip + CONDITION_ICONS export
- `ProductCard` — major rewrite: server component, Link wrapper, 3-tier pricing, no client hooks
- `PRODUCT_CARD_ICONS` — reduced from 6 to 2 icons (TbBolt, TbPhoto)
- `SheetRow.final_price_kes` — new field in sheets parser
- `SHEET_HEADERS` — added final_price_kes column
- `toRow()` — includes final_price_kes in sheet export
- `listingData` — includes final_price_kes in sheet import

**Tests created/changed:**
- tests/components/ui/conditionBadge.test.tsx (6 new tests)
- tests/components/ui/product-card.test.tsx (17 tests — rewritten)
- tests/lib/sheets/sync.test.ts (4 new final_price_kes tests)
- tests/packages/pricing.test.ts (5 new getPricingTier tests)
- 5 fixture files updated with final_price_kes field

**Review Status:** APPROVED

**Git Commit Message:**
```
feat: add final_price_kes field and redesign product cards

- Add final_price_kes column to DB, types, sheets sync, and seed data
- Add getPricingTier helper with 3-tier pricing logic (sale/discounted/normal)
- Rewrite productCard as server component with Link wrapper and 3-tier pricing
- Rewrite conditionBadge to icon-only with tooltip (TbCrown/TbDiamond/TbThumbUp/TbCircleCheck)
- Remove cart, wishlist, and auth hooks from product card
- Add 32 new tests, update 5 fixture files (799 pass, 0 new failures)
```
