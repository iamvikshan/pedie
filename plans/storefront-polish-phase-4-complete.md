## Phase 4 Complete: Search Autocomplete & Filter Sidebar

Added real-time search autocomplete with debounced suggestions (300ms) and keyboard navigation, plus a filter sidebar on the search results page with condition, brand, storage, and price range filters. Also seeded Supabase DB and Google Sheets with pricing data, and downloaded brand SVG logos.

**Files created/changed:**
- src/app/api/search/suggestions/route.ts (NEW)
- src/components/search/filterSidebar.tsx (NEW)
- src/lib/data/search.ts
- src/components/layout/searchBar.tsx
- src/app/(store)/search/page.tsx
- tests/api/search-suggestions.test.ts (NEW)
- tests/components/search/filter-sidebar.test.tsx (NEW)
- tests/lib/data/search.test.ts
- tests/components/layout/searchBar.test.tsx
- tests/app/search/page.test.tsx
- public/images/brands/apple.svg (NEW)
- public/images/brands/samsung.svg (NEW)
- public/images/brands/google.svg (NEW)
- public/images/brands/oneplus.svg (NEW)
- public/images/brands/sony.svg (NEW)
- public/images/brands/xiaomi.svg (NEW)
- public/images/brands/lenovo.svg (NEW)

**Functions created/changed:**
- `getSearchSuggestions(query, limit)` — FTS-based product suggestion lookup
- `getAvailableFilters(query)` — Aggregates filter facets from matching listings
- `SearchSuggestion` interface — Typed suggestion shape
- `GET /api/search/suggestions` — API endpoint for autocomplete
- `FilterSidebar` — Client component with condition/brand/storage/price filters, mobile drawer + desktop sidebar
- `SearchBar` (rewritten) — Debounced autocomplete with keyboard nav
- `buildSearchUrl` — Helper preserving active filters in pagination links

**Tests created/changed:**
- tests/api/search-suggestions.test.ts — 4 tests for suggestions API
- tests/components/search/filter-sidebar.test.tsx — 11 tests for FilterSidebar
- tests/lib/data/search.test.ts — 3 new tests for getSearchSuggestions/getAvailableFilters exports
- tests/components/layout/searchBar.test.tsx — 6 new tests for autocomplete features
- tests/app/search/page.test.tsx — 3 new tests for FilterSidebar + buildSearchUrl

**Review Status:** APPROVED (after fixing 3 review findings: pagination filter preservation, price input debouncing, non-OK response cleanup)

**Git Commit Message:**
```
feat: add search autocomplete and filter sidebar

- Add debounced autocomplete dropdown to SearchBar with keyboard nav
- Create FilterSidebar with condition/brand/storage/price filters
- Add getSearchSuggestions and getAvailableFilters to search data layer
- Create /api/search/suggestions API route for autocomplete
- Integrate filters into search results page with Suspense
- Pagination now preserves active filter params via buildSearchUrl
- Seed Supabase DB and Google Sheets with pricing tier data
- Download brand SVG logos to public/images/brands/
```
