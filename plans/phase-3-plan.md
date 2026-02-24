## Plan: Catalog — Collections & Listing Detail Pages

Build collection/category pages with filtering, sorting, and pagination; individual listing detail pages with image gallery, specs, pricing, and related listings; and a search page. Also regenerate stale DB types, revert incorrect `premium` → `fair` rename, and add a condition mapping utility for multi-source crawlers.

**Condition Grading:**
Pedie uses Reebelo's condition grades: `acceptable`, `good`, `excellent`, `premium`. Crawlers from Swappa, Back Market, and Reebelo map their source-specific condition names to Pedie's grades (e.g., Swappa's "fair" → Pedie's "acceptable").

**Phases (6 phases)**

### 1. Phase 3.1: DB Types Alignment & Condition Mapping

- **Objective:** Revert incorrect `fair` back to `premium` in app types and components, regenerate `types/database.ts` to match real DB, create `types/filters.ts`, and add a condition mapping utility for multi-source crawlers.
- **Files/Functions to Modify/Create:**
  - `types/database.ts` — regenerate via Supabase MCP
  - `types/product.ts` — revert `fair` → `premium` in ConditionGrade
  - `types/filters.ts` — new: `ListingFilters`, `SortOption`, `PaginationParams`, `PaginatedResult<T>`
  - `src/components/ui/condition-badge.tsx` — revert `fair` case → `premium`
  - `src/app/globals.css` — rename `badge-fair` → `badge-premium`
  - `src/lib/sync/parser.ts` — add/update condition mapping function
- **Tests to Write:**
  - `tests/lib/sync/condition-mapping.test.ts` — maps Swappa/Back Market/Reebelo conditions to Pedie grades
- **Steps:**
  1. Revert `fair` → `premium` in `types/product.ts`, `condition-badge.tsx`, `globals.css`.
  2. Regenerate `types/database.ts` via Supabase MCP.
  3. Create `types/filters.ts` with filter/sort/pagination interfaces.
  4. Add condition mapping utility (mapConditionToPedie) and write tests.
  5. Run tests — green.

### 2. Phase 3.2: Data Layer — Listing Queries

- **Objective:** Build all data-fetching functions for collection and detail pages: filtered listing queries, single listing fetch, similar listings, available filters, search, and reviews.
- **Files/Functions to Modify/Create:**
  - `src/lib/data/listings.ts` — new: `getFilteredListings(slug, filters, sort, pagination)`, `getListingById(listingId)`, `getSimilarListings(productId, excludeListingId)`, `getAvailableFilters(categorySlug)`
  - `src/lib/data/search.ts` — new: `searchListings(query, filters, pagination)` using Supabase FTS
  - `src/lib/data/reviews.ts` — new: `getProductReviews(productId, pagination)`, `getReviewStats(productId)`
- **Tests to Write:**
  - `tests/lib/data/listings.test.ts` — filters, sort, pagination, single fetch, similar, empty results, errors
  - `tests/lib/data/search.test.ts` — search with query, filters, empty query, no results
  - `tests/lib/data/reviews.test.ts` — reviews pagination, stats histogram, empty reviews
- **Steps:**
  1. Write tests for all listing data functions.
  2. Run tests — red.
  3. Implement `src/lib/data/listings.ts` using existing Supabase query patterns.
  4. Write tests for search and review functions.
  5. Implement `src/lib/data/search.ts` and `src/lib/data/reviews.ts`.
  6. Run tests — green.

### 3. Phase 3.3: Collection Pages (Category Browsing)

- **Objective:** Build `/collections/[slug]` route with filter sidebar, sort dropdown, product grid, pagination, and collection banner. Filters use URL search params for SSR compatibility.
- **Files/Functions to Modify/Create:**
  - `src/app/collections/[slug]/page.tsx` — SSR page with dynamic metadata
  - `src/app/collections/[slug]/loading.tsx` — skeleton loader
  - `src/components/catalog/collection-banner.tsx` — category header with listing count
  - `src/components/catalog/product-grid.tsx` — responsive grid of ProductCards
  - `src/components/catalog/filter-sidebar.tsx` — collapsible filters with URL params
  - `src/components/catalog/sort-dropdown.tsx` — sort options
  - `src/components/catalog/pagination.tsx` — page navigation
  - `src/components/catalog/active-filters.tsx` — removable filter pills
- **Tests to Write:**
  - `tests/components/catalog/filter-sidebar.test.tsx`
  - `tests/components/catalog/product-grid.test.tsx`
  - `tests/components/catalog/pagination.test.tsx`
  - `tests/app/collections/page.test.tsx`
- **Steps:**
  1. Write tests for catalog components.
  2. Run tests — red.
  3. Build all catalog components and collection page.
  4. Build loading.tsx skeleton.
  5. Run tests — green.

### 4. Phase 3.4: Listing Detail Page

- **Objective:** Build `/listings/[listingId]` route with image gallery, listing info, pricing, specs, description, add-to-cart stub, preorder badge, and shipping info.
- **Files/Functions to Modify/Create:**
  - `src/app/listings/[listingId]/page.tsx` — SSR page with dynamic metadata
  - `src/app/listings/[listingId]/loading.tsx` — skeleton loader
  - `src/components/listing/image-gallery.tsx` — main image + thumbnail strip
  - `src/components/listing/listing-info.tsx` — listing ID, condition, storage, color, carrier, battery health
  - `src/components/listing/price-display.tsx` — price, discount, deposit info
  - `src/components/listing/add-to-cart.tsx` — stub button (Phase 4)
  - `src/components/listing/product-specs.tsx` — specs table from JSONB
  - `src/components/listing/product-description.tsx` — description + key features
  - `src/components/listing/preorder-badge.tsx` — preorder indicator
  - `src/components/listing/shipping-info.tsx` — delivery estimate
- **Tests to Write:**
  - `tests/app/listings/page.test.tsx`
  - `tests/components/listing/image-gallery.test.tsx`
  - `tests/components/listing/price-display.test.tsx`
- **Steps:**
  1. Write tests for listing detail components and page.
  2. Run tests — red.
  3. Build all listing detail components.
  4. Build listing detail page with 2-column layout.
  5. Build loading.tsx skeleton.
  6. Run tests — green.

### 5. Phase 3.5: Related Listings & Reviews

- **Objective:** Add "Similar Listings", "You May Also Like", and customer reviews sections below the listing detail fold.
- **Files/Functions to Modify/Create:**
  - `src/components/listing/similar-listings.tsx`
  - `src/components/listing/you-may-also-like.tsx`
  - `src/components/listing/customer-reviews.tsx`
  - Update `src/app/listings/[listingId]/page.tsx` — add below-fold sections
- **Tests to Write:**
  - `tests/components/listing/similar-listings.test.tsx`
  - `tests/components/listing/customer-reviews.test.tsx`
- **Steps:**
  1. Write tests for related/review components.
  2. Run tests — red.
  3. Build components and integrate into listing page.
  4. Run tests — green.

### 6. Phase 3.6: Search Page & Final Integration

- **Objective:** Build search results page, wire up header search bar navigation, link popular categories to collections.
- **Files/Functions to Modify/Create:**
  - `src/app/search/page.tsx` — search results
  - `src/app/search/loading.tsx` — skeleton
  - Update `src/components/layout/search-bar.tsx` — navigate to `/search?q=`
  - Update `src/components/home/popular-categories.tsx` — link to `/collections/[slug]`
- **Tests to Write:**
  - `tests/app/search/page.test.tsx`
- **Steps:**
  1. Write tests for search page.
  2. Run tests — red.
  3. Build search page reusing catalog components.
  4. Update header search bar and popular categories links.
  5. Run tests — green.
  6. Verify all inter-page navigation.

**Open Questions**

1. Defer "pair it with" accessories to a later phase since product relationship data doesn't exist yet? (Recommend: yes)
2. Use offset-based pagination (simpler, good for 24 listings) or cursor-based? (Recommend: offset)
