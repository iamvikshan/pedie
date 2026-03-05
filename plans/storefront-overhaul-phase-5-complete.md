## Phase 5 Complete: Shop Page + Collections Descendant Fix + Breadcrumb Rework

Fixed the descendant-category bug where parent categories showed no products because `.eq('product.category_id', categoryId)` didn't include children. Both `getFilteredListings()` and `getAvailableFilters()` now use `getCategoryAndDescendantIds()` + `.in()`. Created `/shop` as an all-products browse page with full filter/sort/pagination support. Reworked breadcrumbs root segment from `Home → /` to `Shop → /shop` across all store pages and structured data.

**Files created/changed:**
- src/app/(store)/shop/page.tsx (NEW)
- src/lib/data/listings.ts
- types/filters.ts
- src/components/ui/breadcrumbs.tsx
- src/app/(store)/collections/[slug]/page.tsx
- src/app/(store)/listings/[listingId]/page.tsx
- src/components/catalog/filterSidebar.tsx
- src/components/catalog/activeFilters.tsx
- src/components/catalog/sortDropdown.tsx
- src/components/catalog/pagination.tsx
- src/components/layout/sidebarPanel.tsx
- src/lib/data/search.ts
- tests/app/store/shop-page.test.ts (NEW)
- tests/app/store/collections-page.test.ts (NEW)
- tests/components/ui/breadcrumbs.test.ts
- tests/lib/data/listings.test.ts
- tests/components/catalog/filter-sidebar.test.tsx
- tests/components/layout/sidebarPanel.test.ts
- tests/app/search/page.test.tsx

**Functions created/changed:**
- getFilteredListings(categorySlug: string | null, ...) — signature changed, descendant fix applied
- getAvailableFilters(categorySlug: string | null) — signature changed, descendant fix applied
- FilterSidebarInner — basePath routing for /shop vs /collections
- ActiveFiltersInner — basePath routing
- SortDropdownInner — basePath routing
- PaginationInner — basePath routing
- ShopPage (new) — all-products server component

**Tests created/changed:**
- tests/app/store/shop-page.test.ts — 10 new tests
- tests/app/store/collections-page.test.ts — 3 new tests
- tests/lib/data/listings.test.ts — 7 new tests (null slug, descendant IDs)
- tests/components/ui/breadcrumbs.test.ts — updated Home→Shop
- tests/components/catalog/filter-sidebar.test.tsx — empty slug routing test
- tests/components/layout/sidebarPanel.test.ts — "See All Products" text
- tests/app/search/page.test.tsx — categories mock field

**Review Status:** APPROVED

**Git Commit Message:**
```
feat: add /shop page, fix collections descendant bug, rework breadcrumbs

- Fix getFilteredListings/getAvailableFilters to use descendant category IDs
- Create /shop page for browsing all products with filters and pagination
- Change breadcrumb root from Home to Shop across all store pages
- Update catalog components (FilterSidebar, ActiveFilters, SortDropdown,
  Pagination) to support both /shop and /collections routes
- Update JSON-LD structured data references from Home to Shop
- Add 21 new tests (1123 → 1144 total, 0 failures)
```
