## Phase 2 Complete: ProductCard Redesign, Affiliate Card & Favorites Fix

Redesigned ProductCard to show model-only name with storage+RAM subtitle, stacked sale pricing, and affiliate external link variant. Fixed Customer Favorites scroll/animation bug. Applied DB migration to Supabase, seeded database, uploaded 19 product images to storage, synced 29 listings to Google Sheets, and removed all `is_on_sale` remnants.

**Files created/changed:**
- src/components/ui/productCard.tsx (redesigned)
- src/components/listing/addToCart.tsx (affiliate support)
- src/components/home/customerFavorites.tsx (scroll/animation fix)
- src/lib/sheets/parser.ts (removed is_on_sale)
- next.config.ts (fixed Supabase hostname)
- scripts/seed.ts (fixed Supabase host + .svg images)
- scripts/upload-images.ts (new — image upload script)
- scripts/sync-to-sheets.ts (new — sheets sync script)
- tests/components/ui/product-card.test.tsx (updated)
- tests/components/home/customer-favorites.test.tsx (updated)
- tests/components/catalog/product-grid.test.tsx (model-only fix)
- tests/components/listing/add-to-cart.test.tsx (new)
- src/components/ui/batteryBadge.tsx (DELETED)
- tests/components/ui/battery-badge.test.tsx (DELETED)

**Functions created/changed:**
- ProductCard() — model-only name, storage+RAM subtitle, stacked sale pricing, affiliate Partner badge + external link
- AddToCart() — affiliate rendering as styled `<a>` with source_url
- CustomerFavorites() — useRef scroll reset, key={activeTab} animation restart, flex-shrink-0
- parseSheetRow() — removed is_on_sale field
- uploadImage() — new function in upload-images.ts
- buildSvg() — new function for product placeholder images

**Tests created/changed:**
- product-card.test.tsx — model-only name, storage+RAM subtitle, stacked pricing, affiliate badge/link, removed BatteryBadge tests
- add-to-cart.test.tsx — new: standard/sold out/affiliate/preorder rendering
- customer-favorites.test.tsx — new: useRef, scroll reset, key/animation restart, flex-shrink-0
- product-grid.test.tsx — updated for model-only name rendering

**Review Status:** APPROVED (after addressing extension mismatch and affiliate fallback normalization)

**Git Commit Message:**
```
feat: redesign ProductCard, add affiliate support, fix favorites scroll

- Redesign ProductCard: model-only name, storage+RAM subtitle, stacked sale pricing
- Add affiliate variant: Partner badge, external link to source_url
- Handle affiliate in AddToCart: render styled anchor instead of button
- Fix Customer Favorites: scroll reset on tab change, animation restart
- Delete BatteryBadge component (no longer used)
- Apply listing_type migration to Supabase, seed DB with 29 listings
- Upload 19 product images to Supabase storage bucket
- Sync all listings to Google Sheets with new columns
- Fix Supabase hostname in next.config.ts and seed data
- Remove stale is_on_sale from sheets parser
```
