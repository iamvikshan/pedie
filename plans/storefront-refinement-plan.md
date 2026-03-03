## Plan: Storefront Refinement & Affiliate Support

Replace `is_on_sale` boolean with a `listing_type` enum (`standard`, `sale`, `affiliate`), add `ram` column, source product images, redesign ProductCard with affiliate variant, fix Customer Favorites filter bug, redesign Hot Deals with gradient glow, fix Popular Brands dark mode, and add skeleton loading to the homepage.

**Phase Count Rationale:**
- Phase 1 (DB + Types + Images) must land first since every subsequent phase depends on `listing_type` enum and `ram` column existing
- Phase 2 (Card + Affiliate + Favorites) groups tightly coupled UI changes that all touch ProductCard and listing display logic
- Phase 3 (Hot Deals + Brands + Skeletons) groups independent visual improvements that don't depend on each other but all depend on Phase 1's schema

**Phases (3 phases)**

1. **✅ Phase 1: DB Schema, Types, Images & Data Layer**
    - **Objective:** Replace `is_on_sale BOOLEAN` with `listing_type` enum, add `ram TEXT` column, update all types/helpers/data-fetchers/seed/sheets-sync, source and seed product images, reseed DB
    - **Files/Functions to Modify/Create:**
      - `supabase/migrations/20250706000000_listing_type_and_ram.sql` — new migration: create `listing_type` enum (`standard`, `sale`, `affiliate`), add `listing_type` column (default `standard`), migrate `is_on_sale = true → sale`, drop `is_on_sale` + its index, add `ram TEXT`, create partial indexes on `listing_type`
      - `types/product.ts` — remove `is_on_sale: boolean` from `Listing`, add `listing_type: ListingType` and `ram: string | null`, add `ListingType` type
      - `types/database.ts` — update `listings` Row/Insert/Update to replace `is_on_sale` with `listing_type`, add `ram`
      - `src/helpers/pricing.ts` — update `getPricingTier()` signature: `isOnSale: boolean` → `listingType: ListingType`, update sale check to `listingType === 'sale'`
      - `src/components/ui/productCard.tsx` — update `getPricingTier()` call to pass `listing.listing_type`
      - `src/lib/data/deals.ts` — update `fetchDiscountedListings()` to use `listing.listing_type === 'sale'`
      - `src/lib/sheets/sync.ts` — replace `is_on_sale` column with `listing_type` in header map, parse/write logic
      - `src/lib/sheets/parser.ts` — replace `is_on_sale` field with `listing_type`
      - `scripts/seed.ts` — replace `is_on_sale` with `listing_type`, add `ram` to listings, add product image URLs
      - `DESIGN.md` — update pricing tier table to reference `listing_type`
      - All test files referencing `is_on_sale` — update to use `listing_type`
    - **Tests to Write:**
      - `getPricingTier` tests updated for `listing_type` enum values (`sale`, `affiliate`, `standard`)
      - Sheets sync tests for `listing_type` parsing/writing
      - ProductCard test updated for `listing_type`
      - Deals test updated for `listing_type`
      - Cart store / SEO / listing mock fixtures updated
    - **Steps:**
      1. Write migration SQL: create enum, add columns, migrate data, drop old column
      2. Update `types/product.ts` and `types/database.ts` with new schema
      3. Update `src/helpers/pricing.ts` — change `getPricingTier` signature and logic
      4. Update all tests referencing `is_on_sale` to use `listing_type` — run tests (expect failures from source files not yet updated)
      5. Update source files: `productCard.tsx`, `deals.ts`, `sheets/sync.ts`, `sheets/parser.ts`, `seed.ts`, `DESIGN.md`
      6. Source product images (free stock/press), add URLs to seed data
      7. Add `ram` values to seed listings
      8. Run full test suite — all green
      9. Run quality gates: format → lint → typecheck → build

2. **✅ Phase 2: ProductCard Redesign, Affiliate Card & Favorites Fix**
    - **Objective:** Redesign ProductCard (model-only name, storage+RAM, stacked pricing, no BatteryBadge), add affiliate variant (Partner badge + external link CTA), fix Customer Favorites filter scroll/animation bug. Also: apply migration to Supabase, seed database, upload product images to storage, sync to Google Sheets.
    - **Changes from plan:** Extended scope to include DB operations (migration application, seeding, image uploads, Google Sheets sync), fixed Supabase hostname from `tjspqeqqriuqkusuoxcy` to `opygpszamajcdujoslob`, removed stale `is_on_sale` from sheets parser, normalized affiliate fallback to require both `listing_type === 'affiliate' AND source_url`.
    - **Files/Functions to Modify/Create:**
      - `src/components/ui/productCard.tsx` — model-only truncated name, storage+RAM subtitle (no color), stacked sale pricing (price above strikethrough), remove BatteryBadge import, add subtle "Partner" badge + external link for affiliate listings
      - `src/components/ui/batteryBadge.tsx` — DELETE file (no longer used)
      - `src/components/listing/addToCart.tsx` — handle `listing_type === 'affiliate'`: render `<a href={source_url} target="_blank">` instead of Add to Cart button
      - `src/components/home/customerFavorites.tsx` — add `useRef` for scroller, reset `scrollLeft` on tab change, add `key={activeTab}` on motion container, add `flex-shrink-0` on card wrappers
      - Test files for ProductCard, AddToCart, CustomerFavorites
    - **Tests to Write:**
      - ProductCard: model-only name rendering, storage+RAM subtitle, stacked sale pricing, affiliate badge + external link
      - AddToCart: affiliate listing renders external link, standard listing renders button, sold out state
      - CustomerFavorites: scroll reset on tab change, animation restart
    - **Steps:**
      1. Write/update tests for new ProductCard behavior (model-only name, storage+RAM, stacked pricing, no BatteryBadge)
      2. Write tests for affiliate card variant (Partner badge, external link)
      3. Run tests — expect failures
      4. Implement ProductCard redesign: model-only name with `truncate`, storage + RAM subtitle, stacked pricing for sale tier
      5. Remove BatteryBadge file and all imports
      6. Add affiliate variant to ProductCard: subtle "Partner" badge, wrap card in `<a>` to `source_url` for affiliate type
      7. Update AddToCart component: render external link for affiliate listings
      8. Fix CustomerFavorites: scroll reset + animation restart + flex-shrink-0
      9. Run full test suite — all green
      10. Run quality gates: format → lint → typecheck → build

3. **⬜ Phase 3: Hot Deals Redesign, Popular Brands Dark Mode & Skeleton Loading**
    - **Objective:** Redesign Hot Deals section with gradient/glow treatment using `listing_type = 'sale'`, fix Popular Brands logos (circular + dark mode), create reusable Skeleton component and homepage loading state with Suspense boundaries
    - **Files/Functions to Modify/Create:**
      - `src/components/home/hotDeals.tsx` — animated gradient border/glow backdrop, query filter `listing_type = 'sale'`
      - `src/components/layout/allItemsPanel.tsx` — `rounded-full` for circular logos, `dark:invert` for dark mode
      - `src/components/ui/skeleton.tsx` — new reusable Skeleton component (`animate-pulse` + configurable shape/size)
      - `src/app/loading.tsx` — new homepage loading skeleton using Skeleton component
      - `src/app/page.tsx` — wrap data-dependent sections in `<Suspense>` boundaries with skeleton fallbacks
      - Test files for Hot Deals, AllItemsPanel, Skeleton, homepage loading
    - **Tests to Write:**
      - Hot Deals: source contains `listing_type` check, gradient classes present
      - AllItemsPanel: `rounded-full` class, `dark:invert` class
      - Skeleton component: renders with correct classes, supports className prop
      - Homepage loading: renders skeleton placeholders
    - **Steps:**
      1. Write tests for Hot Deals `listing_type` usage and gradient classes
      2. Write tests for brand logos (circular + dark mode)
      3. Write tests for Skeleton component and homepage loading
      4. Run tests — expect failures
      5. Create `src/components/ui/skeleton.tsx` reusable component
      6. Create `src/app/loading.tsx` with homepage skeleton layout
      7. Update `src/app/page.tsx` with Suspense boundaries
      8. Redesign Hot Deals: gradient/glow treatment, update query
      9. Fix Popular Brands: `rounded-full` + `dark:invert`
      10. Run full test suite — all green
      11. Run quality gates: format → lint → typecheck → build

**Open Questions (all resolved)**
1. Product images — free stock / press images + placeholders ✅
2. Categories table — keep normalized ✅
3. Hot Deals glow — animated gradient border ✅
4. Brand logos dark mode — CSS `dark:invert` ✅
5. Affiliate support — `listing_type` enum replaces `is_on_sale` ✅
