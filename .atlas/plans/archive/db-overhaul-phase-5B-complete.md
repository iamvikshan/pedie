## Phase 5B Complete: Listing Components & Detail Pages

Updated all listing display components and detail pages for the new database schema. Renamed the listing route from `[listingId]` to `[sku]`, added `getListingBySku()` data function, and updated all field references across 14 source files and 11 test files. Deleted dead `youMayAlsoLike.tsx`. Added `getPrimaryCategoryForProduct()` helper for junction-based breadcrumbs.

**Details:**

- Route rename: `/listings/[listingId]` -> `/listings/[sku]` with `getListingBySku()` lookup
- All listing components updated: `listing.sku` (display), `listing.id` (identity), `product.brand.name`, `product.name`
- Effective pricing: `sale_price_kes ?? price_kes` replaces `final_price_kes` in all display components
- PriceDisplay: `originalPriceKes` prop now optional (`number | null`) with null guards
- Category breadcrumbs via `product_categories` junction table using new `getPrimaryCategoryForProduct()` helper
- Sitemap and JSON-LD structured data URLs use SKU-based routes
- ProductFamily type fix: all data producers in products.ts return `ProductWithBrand`
- Deleted dead commented-out `youMayAlsoLike.tsx`
- Removed incorrectly re-added `getPricingTier` from pricing.ts

**Deviations from plan:**

- Added `getPrimaryCategoryForProduct()` in categories.ts (avoids duplicating junction lookup across pages)
- Updated `structuredData.ts` JSON-LD offer URLs to use sku
- Updated additional test files (listings/products page tests, SEO tests) for consistency
- ProductFamily data producers fixed to return `ProductWithBrand` (type alignment)

**Files modified:**

- [src/components/listing/productDetailClient.tsx](/workspaces/pedie/src/components/listing/productDetailClient.tsx) -- effective pricing, sale display
- [src/components/listing/listingInfo.tsx](/workspaces/pedie/src/components/listing/listingInfo.tsx) -- sku display, brand.name, product.name, removed carrier
- [src/components/listing/addToCart.tsx](/workspaces/pedie/src/components/listing/addToCart.tsx) -- listing.id for cart identity
- [src/components/listing/similarListings.tsx](/workspaces/pedie/src/components/listing/similarListings.tsx) -- listing.id as key
- [src/components/listing/betterDealNudge.tsx](/workspaces/pedie/src/components/listing/betterDealNudge.tsx) -- sku in href
- [src/components/listing/referralCta.tsx](/workspaces/pedie/src/components/listing/referralCta.tsx) -- sku in message, brand.name, product.name
- [src/components/listing/priceDisplay.tsx](/workspaces/pedie/src/components/listing/priceDisplay.tsx) -- optional originalPriceKes
- [src/lib/data/listings.ts](/workspaces/pedie/src/lib/data/listings.ts) -- added getListingBySku()
- [src/lib/data/categories.ts](/workspaces/pedie/src/lib/data/categories.ts) -- added getPrimaryCategoryForProduct()
- [src/lib/data/products.ts](/workspaces/pedie/src/lib/data/products.ts) -- ProductWithBrand casts in all 4 family builders
- [src/app/(store)/listings/[sku]/page.tsx](/workspaces/pedie/src/app/(store)/listings/[sku]/page.tsx) -- new SKU route page
- [src/app/(store)/listings/[sku]/loading.tsx](/workspaces/pedie/src/app/(store)/listings/[sku]/loading.tsx) -- moved loading skeleton
- [src/app/(store)/products/[slug]/page.tsx](/workspaces/pedie/src/app/(store)/products/[slug]/page.tsx) -- brand.name, product.name, junction categories
- [src/app/sitemap.ts](/workspaces/pedie/src/app/sitemap.ts) -- sku-based URLs
- [src/lib/seo/structuredData.ts](/workspaces/pedie/src/lib/seo/structuredData.ts) -- sku in JSON-LD
- [src/helpers/pricing.ts](/workspaces/pedie/src/helpers/pricing.ts) -- confirmed getPricingTier removed
- [types/product.ts](/workspaces/pedie/types/product.ts) -- ProductWithBrand, ProductFamily type fix
- [src/components/listing/youMayAlsoLike.tsx] -- DELETED (dead code)

**Review Status:** Sentry APPROVED (3 iterations)

**Git Commit Message:**

```
feat: update listing components and detail pages for new schema

- Rename listing route from [listingId] to [sku] with getListingBySku()
- Update all listing components for new field names
- Add getPrimaryCategoryForProduct() for junction breadcrumbs
- Fix ProductFamily data producers to return ProductWithBrand
- Make PriceDisplay originalPriceKes optional (number | null)
- Update sitemap and structured data for SKU-based URLs
- Delete dead youMayAlsoLike.tsx
- 130 tests passing across 12 Phase 5B test files
```
