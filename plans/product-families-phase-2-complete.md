## Phase 2 Complete: Product Family Data Layer + Product Detail Page

Built the product family data layer with representative selection algorithm, Reebelo-style variant selector with color swatches and accessibility, product detail page at `/products/[slug]`, better deal nudge component, and repurposed `/listings/[listingId]` as a locked-variant mirror page. Applied DB migrations (enum values + sale→onsale migration) and seeded 5 new listings (3 preorder, 2 referral).

**Files created/changed:**
- `src/lib/data/products.ts` — product family queries and representative selection
- `src/components/listing/variantSelector.tsx` — Reebelo-style variant selector with color swatches
- `src/components/listing/betterDealNudge.tsx` — "Better deal available" banner
- `src/components/listing/productDetailClient.tsx` — client wrapper managing variant selection state
- `src/app/(store)/products/[slug]/page.tsx` — product family detail page (server component)
- `src/app/(store)/listings/[listingId]/page.tsx` — repurposed as locked-variant mirror page
- `types/product.ts` — added `ProductFamily` interface
- `tests/lib/data/families.test.ts` — 17 tests for data layer
- `tests/components/listing/variant-selector.test.tsx` — 9 tests for variant selector
- `tests/components/listing/better-deal-nudge.test.tsx` — tests for nudge component
- `tests/app/products/page.test.tsx` — tests for product detail page
- `tests/app/listings/page.test.tsx` — added locked-variant mirror tests

**Functions created/changed:**
- `selectRepresentative(listings)` — filters sold, picks winning type tier, lowest price within tier
- `getProductFamilyBySlug(slug)` — fetches product + all non-sold listings, returns ProductFamily
- `getProductFamilies(limit?)` — batch query for all families (N+1 fixed)
- `findBetterDeal(currentListing, allListings)` — finds cheaper non-standard variant with same specs
- `findBestMatch(listings, current, dimension, value)` — variant selector matching algorithm
- `LISTING_TYPE_PRIORITY` — standard(1) > preorder(2) > affiliate(3) > referral(4)
- `COLOR_MAP` — 25+ color-to-hex mappings for visual swatches
- `getColorHex(colorName)` — case-insensitive color lookup with fallback
- `VariantSelector` — client component with storage pills, color swatches, condition pills, carrier pills
- `BetterDealNudge` — Framer Motion animated banner with savings display
- `ProductDetailClient` — state management wrapper for variant selection

**Tests created/changed:**
- `selectRepresentative` — standard beats cheaper preorder, lowest price within tier, sold excluded, null for empty, single listing returns it, multiple types picks best tier
- `findBetterDeal` — finds cheaper non-standard variant, null when no better deal, null for non-standard current, requires matching storage/color/condition
- `LISTING_TYPE_PRIORITY` — all four types have priorities, standard is highest
- `findBestMatch` — storage change, color change, fallback to cheapest
- Variant selector source analysis — client component, formatKes, condition icons, disabled/aria-disabled attributes, conditional sections
- Better deal nudge source analysis — Framer Motion, TbSparkles, savings display
- Product page source analysis — server component, generateMetadata, variant selector integration
- Locked-variant mirror — disabled selectors, "See all variants" link, BetterDealNudge integration

**Review Status:** APPROVED (after revision — color swatches, accessibility, N+1 query all fixed)

**Git Commit Message:**
```
feat: product family data layer and detail page

- Add product family queries with representative selection algorithm
- Build Reebelo-style variant selector with color swatches and accessibility
- Create /products/[slug] route with variant selection and better deal nudge
- Repurpose /listings/[id] as locked-variant mirror page
- Apply DB migrations: add preorder/referral/onsale enum values
- Seed 5 new listings (3 preorder, 2 referral)
- Fix N+1 query in getProductFamilies with batch fetch
- 958 tests pass, 0 fail
```
