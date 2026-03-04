## Phase 3 Complete: Product Family Cards + Homepage Refresh

Merged `families.ts` into `products.ts`, created `ProductFamilyCard` component with 3-tier pricing (sale/discounted/normal), and switched homepage, customer favorites, category showcases, similar listings, and product detail page to use product families instead of individual listings. Hot deals and `/deals` page remain unchanged with individual listing cards.

**Files created/changed:**
- `src/lib/data/products.ts` — merged all family logic + added `getRelatedFamilies`, `getProductFamiliesByCategory`
- `src/lib/data/families.ts` — DELETED (merged into products.ts)
- `src/components/ui/productFamilyCard.tsx` — NEW: 3-tier family card component
- `src/components/catalog/productFamilyGrid.tsx` — NEW: grid layout for family cards
- `src/components/listing/similarListings.tsx` — updated to accept `ProductFamily[]`
- `src/app/page.tsx` — switched to `getProductFamilies` for homepage data
- `src/components/home/customerFavorites.tsx` — accepts `families` prop, uses `ProductFamilyCard`
- `src/components/home/categoryShowcase.tsx` — uses `getProductFamiliesByCategory` + `ProductFamilyCard`
- `src/app/(store)/products/[slug]/page.tsx` — fetches related families for SimilarListings
- `src/app/(store)/listings/[listingId]/page.tsx` — updated imports + uses `getRelatedFamilies`
- `src/components/listing/productDetailClient.tsx` — updated import path
- `tests/lib/data/families.test.ts` — updated import path to `@lib/data/products`
- `tests/components/ui/product-family-card.test.tsx` — NEW: 19 tests
- `tests/lib/data/products-families.test.ts` — NEW: 11 tests
- `tests/components/home/customer-favorites.test.tsx` — updated for families prop
- `tests/components/home/category-showcase.test.tsx` — added source verification tests
- `tests/components/listing/similar-listings.test.tsx` — rewritten for `ProductFamily[]`
- `tests/app/listings/page.test.tsx` — updated mock imports

**Functions created/changed:**
- `getRelatedFamilies(categoryId, excludeProductId, limit?)` — fetches related product families in same category
- `getProductFamiliesByCategory(categorySlug, limit?)` — fetches families for a category by slug
- `ProductFamilyCard({ family })` — 3-tier card component (sale/discounted/normal)
- `ProductFamilyGrid({ families })` — grid layout for family cards

**Tests created/changed:**
- 19 tests in `product-family-card.test.tsx` (3 tiers, From prefix, variant count, linking)
- 11 tests in `products-families.test.ts` (module exports for new functions)
- Updated 4 existing test files (families, customer-favorites, category-showcase, similar-listings, listings page)

**Review Status:** APPROVED with known deferral (search/collections remain listing-based)

**Git Commit Message:**
```
feat: product family cards and homepage refresh

- Merge families.ts into products.ts, delete families.ts
- Create ProductFamilyCard with 3-tier pricing (sale/discounted/normal)
- Switch homepage, customer favorites, category showcases to family cards
- Wire SimilarListings with getRelatedFamilies on product detail page
- Add getProductFamiliesByCategory and getRelatedFamilies data functions
- Create ProductFamilyGrid component for catalog use
- 998 tests passing, 0 failures
```
