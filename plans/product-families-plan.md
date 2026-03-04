## Plan: Product Families & Listing Types

Restructure Pedie from individual-listing browsing to product-family browsing, add `preorder`/`referral` listing types, move `sale` into status, and fix CI. Each schema phase seeds data via Supabase MCP and syncs to Google Sheets.

**Phase Count Rationale:**
- Phase 1 is schema + CI — foundational, must be solid before any UI touches queries
- Phase 2 is data layer + product detail page — new queries and routes that Phase 3-4 depend on
- Phase 3 is card + homepage UI overhaul — depends on Phase 2 family queries
- Phase 4 is new business flows (preorder/referral) — tested against Phase 1 schema
- Phase 5 is loading/perf polish — safe final pass after all features exist

---

### 1. ✅ Phase 1: CI Fix + Schema Evolution + Seeding

**Objective:** Fix failing CI tests, evolve DB schema (new listing types, status changes), seed via Supabase MCP, sync to Sheets, update TS types.

**Changes from plan:** Migration file written locally but not yet applied to remote DB (Supabase MCP auth expired). Seeding deferred until migration is applied. Crawler network guards deferred (non-blocking — those tests already pass). All code changes, type updates, and test fixes completed. 918 tests pass, 0 fail.

**Schema migration (`20250705000000_listing_type_status_evolution.sql`):**
- Add `preorder`, `referral` to `listing_type` enum
- Add `onsale` to `listing_status` enum
- Migrate the 2 existing `sale`-type listings → `listing_type='standard', status='onsale'`
- Remove `sale` from `listing_type` enum; remove `preorder` from `listing_status` enum
- Drop `chk_sold_status_consistency` constraint, then drop `is_preorder` + `is_sold` columns
- Update any triggers/RLS policies that reference dropped columns

**Seeding via Supabase MCP (after migration):**
- Insert ~3-4 `preorder` listings (e.g., iPhone 16 Pro Max preorder variant, Galaxy S24 Ultra preorder)
- Insert ~2 `referral` listings (e.g., Samsung Galaxy S24 Ultra referral)
- Set ~2 existing listings to `status='onsale'` for testing
- Verify data integrity with SQL queries
- Sync updated schema/columns to Google Sheets

**CI Fixes:**
- `tests/lib/auth/admin.test.ts` — fix `mock.module` pattern for Bun CI reliability (explicit async mock reset)
- `tests/scripts/crawlers/*.test.ts` — add network-failure guards (skip/xfail on network error)

**Files/Functions to Modify/Create:**
- `supabase/migrations/20250705000000_listing_type_status_evolution.sql` — new migration
- `types/product.ts` — update `ListingType = 'standard' | 'preorder' | 'affiliate' | 'referral'`, `ListingStatus = 'available' | 'reserved' | 'sold' | 'onsale'`, remove `is_preorder` + `is_sold` from `Listing`
- `src/config.ts` — add `WHATSAPP_NUMBER = '+254715012665'`
- `src/helpers/pricing.ts` — update any `is_sold`/`is_preorder`/`sale` type references; card tier now uses `status === 'onsale'` for sale tier
- `tests/lib/auth/admin.test.ts` — fix mock for CI
- Crawler test files — network guards
- `scripts/sheets.ts` — add new columns to sync mapping

**Tests to Write:**
- `tests/types/product-types.test.ts` — compile-time checks for new enums
- `tests/helpers/pricing.test.ts` — update for `onsale` status instead of `sale` listing_type
- Existing isUserAdmin tests — verify they pass in CI
- Existing crawler tests — verify graceful skip on network failure

**Steps:**
1. Write failing tests for new `ListingType`/`ListingStatus` values and updated pricing logic
2. Write and apply the DB migration via Supabase MCP
3. Seed new listing data (preorder, referral, onsale) via Supabase MCP
4. Update `types/product.ts` with new enums and remove deprecated fields
5. Update `src/config.ts` with `WHATSAPP_NUMBER`
6. Update `src/helpers/pricing.ts` — sale tier triggers on `status === 'onsale'`
7. Fix `admin.test.ts` mock pattern and add crawler network guards
8. Sync updated schema to Google Sheets
9. Run `bun f && bun check && bun test` — all tests pass

---

### 2. ✅ Phase 2: Product Family Data Layer + Product Detail Page

**Objective:** Build product family queries with representative selection, create `/products/[slug]` route with Reebelo-style visual variant selectors, repurpose `/listings/[id]` as locked-variant mirror page.

**Changes from plan:**
- Data layer placed in `src/lib/data/families.ts` (not `products.ts` as originally planned) to avoid collision with existing data modules — will merge into `products.ts` in Phase 3
- Search integration deferred — `src/lib/data/search.ts` not modified in this phase (will revisit when search is updated in Phase 3/5)
- N+1 query in `getProductFamilies` fixed during review: now uses a single batch query + client-side grouping instead of per-product queries
- Color selector renders as circular color swatches (hex background) with label — not plain text pills
- Full accessibility: `role='radiogroup'`, `aria-pressed`, `aria-disabled`, `disabled` on all interactive variant buttons
- `CustomerReviews` removed from product page (called without required props) — JSDoc TODO added for future reviews system
- `SimilarListings` still hardcoded to `[]` — will implement as "other products in same category" in Phase 3
- Reserved listings now filtered from all family queries and pure functions (`selectRepresentative`, `getProductFamilyBySlug`, `getProductFamilies`, `findBetterDeal`) — 3 new tests added (20 total in families.test.ts)

**Post-Phase-2 schema cleanup (pre-Phase-3):**
- Enum-replace migration (`20250705000000_cleanup_dead_enum_values.sql`): removed dead `sale` from `listing_type`, dead `preorder` from `listing_status`. Dropped stale `idx_listings_sale` partial index, recreated `idx_listings_affiliate`.
- Added `refunded` to `order_status` enum (`20250706000000_add_order_status_refunded.sql`)
- Regenerated `types/database.ts` from live DB schema (single source of truth)
- `types/product.ts` now derives `ListingStatus`, `ListingType`, `ConditionGrade` from `Database['public']['Enums']` instead of hand-maintained string unions
- `scripts/seed.ts` updated: replaced dead `listing_type: 'sale'` with `status: 'onsale'` for on-sale seed listings

**Representative algorithm:**
1. Group listings by `product_id`
2. Filter out `status = 'sold'` and `status = 'reserved'`
3. Rank by `listing_type` priority: `standard`(1) > `preorder`(2) > `affiliate`(3) > `referral`(4)
4. The entire highest-priority type tier always wins regardless of price
5. Within the winning tier, pick the listing with lowest `final_price_kes`
6. That listing's pricing determines the card style (sale/discounted/normal)
7. Example: standard at KES 60k beats preorder at KES 55k — standard always wins

**Variant selectors (Reebelo-style visual buttons, NOT cascading dropdowns):**
- **Storage:** Pill buttons (`128GB`, `256GB`, `512GB`)
- **Color:** Radial/circular color swatches with name tooltip
- **Condition:** Pill buttons showing price per condition (`Acceptable KES 52,000`, `Good KES 68,000`, `Excellent KES 75,000`)
- **Carrier:** Pill buttons if applicable (`Unlocked`, etc.)
- All listing types shown in selectors, but `standard` variants listed first in each group
- **"Better deal" nudge:** When user selects a `standard` variant and an identical-spec variant of another type is cheaper, show a subtle banner: "A better deal is available for this configuration" with a link to `/listings/[id]` for that variant

**`/listings/[id]` (repurposed, NOT deleted):**
- Mirror of `/products/[slug]` layout but pre-populated with the specific variant
- Variant selectors are visible but locked/disabled (user sees configuration but can't change it)
- Used specifically for "better deal" nudge links from the product detail page
- Also used by hot deals — individual deal cards link here instead of the full product page
- Acts as a focused, direct-link view of a single listing

**Files/Functions to Create/Modify:**
- `src/lib/data/products.ts` — `getProductBySlug(slug)`, `getProductFamilies()`, `selectRepresentative(listings)`, `LISTING_TYPE_PRIORITY` map
- `src/app/(store)/products/[slug]/page.tsx` — new product detail page (server component)
- `src/components/listing/variantSelector.tsx` — Reebelo-style visual button selectors (storage pills, color radials, condition pills with prices)
- `src/components/listing/betterDealNudge.tsx` — "Better deal available" subtle banner with link to `/listings/[id]`
- `src/app/(store)/listings/[listingId]/page.tsx` — repurpose as locked-variant mirror page
- `src/lib/data/listings.ts` — update queries for family context
- `src/lib/data/search.ts` — search returns product families, not individual listings

**Tests to Write:**
- `tests/lib/data/products.test.ts` — `selectRepresentative()`: standard always wins over lower-priced preorder/affiliate/referral; within same type, lowest `final_price_kes` wins; sold listings excluded
- `tests/components/listing/variantSelector.test.ts` — renders storage pills, color swatches, condition pills with prices; standard variants listed first
- `tests/components/listing/betterDealNudge.test.ts` — shows when cheaper non-standard variant exists for same spec; hidden when no better deal; links to correct `/listings/[id]`
- `tests/app/listings/listingDetail.test.ts` — locked variant page renders correctly, selectors are disabled

**Steps:**
1. Write failing tests for `selectRepresentative()` with priority logic
2. Implement `selectRepresentative()` and family queries in `src/lib/data/products.ts`
3. Write failing tests for variant selector component
4. Build visual variant selector component (storage pills, color radials, condition pills)
5. Build product detail page `/products/[slug]` with image gallery + variant selectors + CTA
6. Write tests for better deal nudge
7. Implement better deal nudge component
8. Repurpose `/listings/[id]` as locked-variant mirror page
9. Update search to return product families
10. Run `bun f && bun check && bun test` — all tests pass

---

### 3. ✅ Phase 3: Product Family Cards + Homepage Refresh

**Objective:** Replace individual listing cards with product family cards for non-hot-deals contexts. Hot deals + `/deals` keep individual listing cards unchanged. Merge `families.ts` into `products.ts`. Implement "other products in same category" for `SimilarListings`.

**Changes from plan:**
- `families.ts` merged into `products.ts` with all 5 exports preserved; families.ts deleted
- Added `getRelatedFamilies(categoryId, excludeProductId)` and `getProductFamiliesByCategory(categorySlug, limit)` to products.ts
- Created `ProductFamilyGrid` as a parallel component to `ProductGrid` (not a replacement)
- Search/collections pages (`search/page.tsx`, `collections/[slug]/page.tsx`) still use `ProductGrid` with individual listings — their filter/sort/pagination pipeline is deeply listing-based; family conversion deferred to a future search-refactor task
- `SimilarListings` component updated to accept `ProductFamily[]` instead of `ListingWithProduct[]`; heading changed to "Similar Products"
- Listing detail page updated to use `getRelatedFamilies` for SimilarListings (replacing `getSimilarListings`)
- Tests: 998 pass, 0 fail (up from 958 pre-Phase-3)

**Card display logic (based on representative listing):**
- **Sale card:** Representative has `status === 'onsale'` — red discount pill, crossed-out price, bold red final price, urgency styling
- **Discounted card:** Representative has `final_price_kes < price_kes` AND NOT `onsale` — inline strikethrough + small savings amount
- **Normal card:** `final_price_kes >= price_kes` — single price, no discount display
- Card shows representative's condition badge (lowest variant's condition from the highest-priority type tier)
- Price shows "From KES XX,XXX" when multiple variants exist at different prices
- Links to `/products/[slug]`

**Hot deals / `/deals` page:** UNCHANGED — keeps individual listing cards per variant. A single iPhone 16 Pro Max variant can be `onsale` without affecting the family card elsewhere.

**Non-hot-deals behavior:** If the representative listing happens to be `onsale`, the family card shows sale styling. If it's discounted, shows discounted styling. Otherwise, normal. The card reflects the representative, not the family aggregate.

**Files/Functions to Create/Modify:**
- `src/lib/data/products.ts` — merge in family queries from `families.ts` (`getProductFamilyBySlug`, `getProductFamilies`, `selectRepresentative`, `findBetterDeal`, `LISTING_TYPE_PRIORITY`); add `getRelatedProducts(categoryId, excludeProductId)` for SimilarListings
- `src/lib/data/families.ts` — DELETE after merge into `products.ts`
- `src/components/ui/productFamilyCard.tsx` — new family card component (3-tier styling based on representative)
- `src/components/home/customerFavorites.tsx` — switch from individual listing cards to product family cards
- `src/components/catalog/productGrid.tsx` — use family cards for collections/search results
- `src/components/home/hotDeals.tsx` — UNCHANGED, keeps individual `ProductCard`
- `src/app/(store)/deals/page.tsx` — UNCHANGED, keeps individual listing cards
- `src/app/page.tsx` — update data fetching to use family queries for featured/favorites sections
- `src/app/(store)/products/[slug]/page.tsx` — wire up `SimilarListings` with `getRelatedProducts()` instead of hardcoded `[]`
- `src/components/home/categoryShowcase.tsx` — use family cards

**Tests to Write:**
- `tests/components/ui/productFamilyCard.test.ts` — renders sale/discounted/normal tier correctly based on representative; shows "From KES XX,XXX"; links to `/products/[slug]`; shows representative's condition badge
- `tests/components/home/hotDeals.test.ts` — still uses individual listing cards (not family cards)
- `tests/components/catalog/productGrid.test.ts` — renders family cards
- `tests/app/homepage.test.ts` — homepage favorites section uses family cards

**Steps:**
1. Merge `families.ts` queries/functions into `products.ts`, update all imports, delete `families.ts`
2. Write failing tests for product family card (3 tiers)
3. Implement `ProductFamilyCard` component with sale/discounted/normal styling
4. Write tests for homepage integration
5. Update homepage data fetching to use product family queries
6. Update customer favorites, category showcase to use family cards
7. Implement `getRelatedProducts()` and wire up `SimilarListings` on product detail page
8. Verify hot deals and `/deals` page remain unchanged
9. Run `bun f && bun check && bun test` — all tests pass

---

### 4. ⬜ Phase 4: Preorder & Referral Listing Types + On-Sale Flow

**Objective:** Implement preorder deposit checkout flow, referral WhatsApp CTA, and status-aware cart logic.

**Preorder flow:**
- Deposit = `DEPOSIT_RATE * final_price_kes` (5% if `final_price_kes` < KES 70k, 10% if ≥ KES 70k)
- Example: product with `final_price_kes=50000` → deposit = 5% × 50000 = KES 2,500
- Note: A product with `final_price_kes=50000` and `price_kes=70000` IS discounted — the family card shows discounted styling for this representative
- Deposit shown on product detail page only — cards show full `final_price_kes`
- "Preorder Now — KES X,XXX deposit" CTA → adds deposit amount to cart
- Shipping estimate badge: "7-14 days delivery"

**Referral flow:**
- WhatsApp CTA: "Ask about this on WhatsApp" → opens `wa.me/254715012665?text=Hi, I'm interested in [Product Name] ([listing_id])`
- No add-to-cart for referral listings
- Referral badge on card and detail page

**On-sale (status-aware):**
- Any listing type can have `status='onsale'` — sale styling uses `price_kes` as original, `final_price_kes` as sale price
- Cart validates status on add: reject `sold`/`reserved` listings, allow `available`/`onsale`/`preorder` (with deposit logic)

**Files/Functions to Create/Modify:**
- `src/components/listing/addToCart.tsx` — update CTA: standard (Add to Cart), preorder (Preorder Now + deposit), affiliate (external link), referral (WhatsApp CTA)
- `src/components/listing/preorderDeposit.tsx` — deposit calculator display on detail page
- `src/components/listing/referralCta.tsx` — WhatsApp deep link button using `TbBrandWhatsapp` icon
- `src/lib/cart/actions.ts` — status-aware add-to-cart validation
- `src/helpers/pricing.ts` — `calculateDeposit(finalPriceKes)` function

**Tests to Write:**
- `tests/helpers/pricing.test.ts` — `calculateDeposit`: 5% for < 70k, 10% for ≥ 70k; edge cases at boundary
- `tests/components/listing/addToCart.test.ts` — correct CTA per listing type
- `tests/components/listing/preorderDeposit.test.ts` — deposit amount display, formatted in KES
- `tests/components/listing/referralCta.test.ts` — WhatsApp URL generation with product name + listing_id
- `tests/lib/cart/actions.test.ts` — reject sold/reserved, allow available/onsale/preorder

**Steps:**
1. Write failing tests for `calculateDeposit()` and updated pricing logic
2. Implement deposit calculation in `src/helpers/pricing.ts`
3. Write failing tests for each CTA variant (standard, preorder, affiliate, referral)
4. Implement CTA updates in `addToCart.tsx`
5. Build preorder deposit display component
6. Build referral WhatsApp CTA component
7. Update cart actions with status-aware validation
8. Run `bun f && bun check && bun test` — all tests pass

---

### 5. ⬜ Phase 5: Performance & Loading UX

**Objective:** Skeleton states, streaming, and perceived performance for product family pages and variant selectors.

**Changes:**
- Product detail page skeleton with variant selector button placeholders
- Product family card skeleton component (matching card dimensions)
- Homepage streaming with `<Suspense>` boundaries per section
- Collection page pagination with skeleton fallback
- Optimistic UI for variant selection (instant visual feedback while data loads)
- Variant selector shimmer states during price recalculation

**Files/Functions to Create/Modify:**
- `src/app/(store)/products/[slug]/loading.tsx` — product detail skeleton
- `src/components/ui/productFamilyCardSkeleton.tsx` — family card skeleton
- `src/components/listing/variantSelectorSkeleton.tsx` — selector button placeholders
- Update `src/app/page.tsx` — add `<Suspense>` boundaries
- Update `src/app/(store)/collections/*/loading.tsx` — collection skeleton

**Tests to Write:**
- `tests/components/ui/productFamilyCardSkeleton.test.ts` — renders with `role='status'`, `aria-label='Loading'`
- `tests/components/listing/variantSelectorSkeleton.test.ts` — renders placeholder buttons
- `tests/app/products/productDetailLoading.test.ts` — skeleton page renders

**Steps:**
1. Write failing tests for skeleton components (accessibility attributes)
2. Implement product family card skeleton
3. Implement variant selector skeleton
4. Implement product detail page loading skeleton
5. Add `<Suspense>` boundaries to homepage and collection pages
6. Run `bun f && bun check && bun test` — all tests pass

---

### Design Consistency (from DESIGN.md)

All phases must follow:
- **Icons:** `react-icons/tb` (Tabler Icons) exclusively — `TbCrown`, `TbDiamond`, `TbThumbUp`, `TbCircleCheck`, `TbBrandWhatsapp`, etc.
- **Colors:** Use `pedie-*` CSS custom properties from `globals.css`
- **Cards:** `bg-pedie-card` with `hover:bg-pedie-card-hover`, `border-pedie-border`
- **Glass:** `.glass` class for elevated surfaces
- **Badge colors:** `pedie-badge-premium` (purple), `pedie-badge-excellent` (green), `pedie-badge-good` (blue), `pedie-badge-acceptable` (amber)
- **Discount:** `pedie-discount` (#ef4444) for sale/discount pricing
- **Animation:** Framer Motion, respect `prefers-reduced-motion`
- **Accessibility:** `aria-label`, `sr-only`, semantic HTML
- **Path aliases:** `@lib/*`, `@components/*`, `@config`, `@helpers`, `@app-types/*`
- **Quality gate:** `bun f` → `bun check` → `bun test`
