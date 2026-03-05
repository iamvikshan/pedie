## Post-Phase 5 Fixes Complete

Eight fixes addressing header polish, brands DB migration, category filter system, pill button styling, quick links layout, and static analysis issues.

**Files created:**
- src/lib/data/brands.ts

**Files changed:**
- src/components/layout/header.tsx
- src/components/layout/headerWrapper.tsx
- src/components/layout/sidebarPanel.tsx
- src/components/layout/mobileNav.tsx
- src/lib/data/listings.ts
- src/components/catalog/filterSidebar.tsx
- src/components/catalog/activeFilters.tsx
- src/app/(store)/shop/page.tsx
- src/app/(store)/collections/[slug]/page.tsx
- src/app/(store)/listings/[listingId]/page.tsx
- tests/components/layout/header.test.tsx
- tests/components/layout/sidebarPanel.test.ts
- tests/lib/data/listings.test.ts
- tests/components/catalog/filter-sidebar.test.tsx

**Functions created/changed:**
- `getBrands()` — new function in src/lib/data/brands.ts
- `Brand` interface — new type in src/lib/data/brands.ts
- `HeaderWrapper` — now fetches brands in parallel
- `Header` — accepts/passes brands prop
- `MobileNav` — accepts/passes brands prop
- `SidebarPanel` — brands from prop (not JSON), pill restyled, quick links grid, themed icons
- `getAvailableFilters()` — populates categories array with listing counts
- `getFilteredListings()` — handles filters.category sub-filter with descendant intersection
- `FilterSidebarInner` — new handleCategoryChange + category filter section
- `ActiveFilters` — carrier + category pill support

**Tests created/changed:**
- header.test.tsx: "Row 1 icons use h-6 w-6 size", "Row 2 uses h-12 for height"
- sidebarPanel.test.ts: updated brands prop, pill styling, 2x2 grid, icon themes
- listings.test.ts: "getAvailableFilters populates categories array", "getFilteredListings handles filters.category"
- filter-sidebar.test.tsx: "renders category filter", "source has category filter section"

**Review Status:** APPROVED (after revision — mobile brands propagation fixed, category filter empty-result semantics fixed)

**Git Commit Message:**
```
feat: post-phase 5 fixes — header, brands, filters, pills

- Bump header icons h-5→h-6 (Row 1) and h-4→h-5 (Row 2), Row 2 height h-10→h-12
- Create brands DB table + getBrands() server function, replace JSON import
- Propagate brands prop through HeaderWrapper → Header → MobileNav → SidebarPanel
- Restyle "All Products" pill: glassmorphed green tint, rounded-full, w-fit
- Quick links: 2x2 grid, Trade In blue-400, Repairs amber-400 icons
- Category filter system: populate categories in getAvailableFilters, handle filters.category in getFilteredListings with descendant intersection
- Add category filter UI to FilterSidebar + category/carrier pills in ActiveFilters
- Parse ?category= search param in /shop and /collections pages
- Fix DeepScan null guards: return notFound() in collections + listings pages
- Seed Audio (headphones, earbuds) and Gaming (consoles) products for testing
```
