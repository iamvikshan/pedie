## Plan: Storefront Polish & Search UX

Post-redesign fixes and enhancements: responsive layout, mobile navigation UX, product card badges, newsletter redesign, brand logos, search autocomplete with filters, and data seeding for all 3 pricing tiers.

**Phase Count Rationale:**
- **5 phases** covers the scope safely — each phase is a shippable increment
- Phase 1 (responsive/CSS) unblocks visual QA for everything after it
- Phase 2 (product cards + data) is the core visual commerce change, self-contained with DB migration
- Phase 3 (mobile nav + newsletter + All Items panel) groups all navigation/chrome UX fixes
- Phase 4 (search) is a standalone feature addition (autocomplete + filters) with new 3rd-party package
- Phase 5 (footer accordion) is a small polish pass that can ship independently

**Phases (5)**

1. **✅ Phase 1: Responsive Layout Fixes & Sustainability Stats**
    - **Objective:** Fix the white-border responsive overflow issue across all sections, and make sustainability stats horizontal on mobile.
    - **Files/Functions to Modify/Create:**
        - `src/app/layout.tsx` — add `overflow-x-hidden` to `<body>` or a wrapper to prevent horizontal overflow
        - `src/components/home/popularCategories.tsx` — ensure container uses responsive padding (`px-4 md:px-6`), no fixed widths that overflow
        - `src/components/home/customerFavorites.tsx` — audit container width, ensure `container mx-auto px-4` is applied correctly; the horizontal scroller must not push content wider than viewport
        - `src/components/home/categoryShowcase.tsx` — audit for overflow-causing styles
        - `src/components/layout/header.tsx` — ensure full-width styling with `w-full` on both rows
        - `src/components/layout/footer.tsx` — ensure container doesn't overflow on narrow screens
        - `src/components/home/sustainabilitySection.tsx` — change stats grid from `grid-cols-1 md:grid-cols-3` to `grid-cols-3` (always horizontal), reduce card padding on mobile (`p-3 md:p-6`)
        - `src/app/globals.css` — possibly add `html { overflow-x: hidden }` as safety net
    - **Tests to Write:**
        - Update sustainability section test: verify source contains `grid-cols-3` (always horizontal)
        - Test that layout.tsx source contains `overflow` handling
    - **Steps:**
        1. Write failing tests for sustainability horizontal stats and layout overflow
        2. Investigate and fix the root cause of white borders — likely `container mx-auto` inconsistency or child elements with widths exceeding viewport
        3. Update sustainability section grid to always-horizontal `grid-cols-3`
        4. Verify all homepage sections use consistent container widths
        5. Run quality gate

2. **✅ Phase 2: Product Card Redesign & Battery Badge + Data Seeding**
    - **Objective:** Redesign product cards to match the 3-tier specification with glassmorphed badges on the image, battery health badge with color-coded lightning, and discount pill. Seed database with sample data covering all 3 tiers. Create `src/data/brands.json` for brand logo data.
    - **Changes from plan:** Also fixed 4 bugs alongside: mobileNav sign-out error handling, deals.ts NaN guard, sheets sync.ts NaN guard, migration DEFAULT race. Brand logo SVG assets deferred to Phase 3 (All Items panel). TbBolt import removed from productCard.tsx since battery rendering is delegated to BatteryBadge component.
    - **Files/Functions to Modify/Create:**
        - `src/components/ui/productCard.tsx` — Major rewrite for all 3 tiers:
            - **Normal card:** top-left glassmorphed condition badge, top-right battery health badge (color-coded `TbBolt` icon + percentage on glassmorphed pill), product name, single price
            - **Discounted card:** same top badges, product name, crossed-out original price, final price, then a small squircle/pill to the right of price showing `-%` with tinted glass
            - **Sale card:** top-right gets condition badge on tinted glassmorphed circle (alternating with battery health badge), top-left gets flame icon + "Flash Sale" on glassmorphed tinted pill (NOT flame + percentage), product name, crossed-out price, sale price, `-%` pill
        - `src/components/ui/conditionBadge.tsx` — update to support glassmorphed circular variant for sale cards
        - `src/components/ui/batteryBadge.tsx` (NEW) — color-coded battery health badge: green ≥80%, amber 50-79%, red <50%, with `TbBolt` icon + `%` text on glassmorphed pill
        - `src/data/brands.json` (NEW) — brand logo data: `[{ "name": "Apple", "slug": "apple", "logo": "/images/brands/apple.svg" }, ...]` for Apple, Samsung, Google, OnePlus, Sony, Xiaomi
        - `scripts/seed.ts` — update seed script to include listings with varying `is_on_sale`, `final_price_kes` values covering all 3 pricing tiers
    - **Tests to Write:**
        - `tests/components/ui/product-card.test.tsx` — source contains `TbBolt` (battery badge), `Flash Sale` (sale variant), glassmorphed badge classes (`backdrop-blur`), discount pill
        - `tests/components/ui/battery-badge.test.tsx` (NEW) — module export, color coding logic, TbBolt icon
        - `tests/data/brands.test.ts` (NEW) — brands.json has ≥6 brands, each with name/slug/logo
        - Update condition badge test for circular variant
    - **Steps:**
        1. Write failing tests for battery badge component and updated product card
        2. Create `BatteryBadge` component with color-coded lightning
        3. Rewrite `ProductCard` for all 3 tiers with glassmorphed badges on image
        4. Update `ConditionBadge` to support circular glassmorphed variant
        5. Create `src/data/brands.json` with 6 popular brands
        6. Update seed script to create listings across all 3 pricing tiers
        7. Run seed to populate dev DB
        8. Run quality gate

3. **✅ Phase 3: Mobile Nav UX, Newsletter Redesign & All Items Panel**
    - **Objective:** Fix mobile nav issues: expand search bar by default in drawer, redesign category cards to match desktop "All Items" style, add useful quick links. Extract newsletter form to standalone eye-catching component. Fix All Items panel: replace emoji with Tabler icon for Hot Deals, show brand logos from `brands.json` with logo image + text.
    - **Changes from plan:** Added image failure fallback pattern (data-fallback) for category cards in both mobileNav and allItemsPanel, ensuring graceful degradation when CDN/images fail.
    - **Files/Functions to Modify/Create:**
        - `src/components/layout/mobileNav.tsx` — replace icon-only category grid with card-style categories (image + gradient overlay + text, matching `allItemsPanel.tsx` style), add expanded SearchBar by default (pass `defaultExpanded` prop), add quick links section (Deals, New Arrivals, Best Sellers)
        - `src/components/layout/searchBar.tsx` — add `defaultExpanded?: boolean` prop so mobile drawer can render it expanded by default without conflict
        - `src/components/layout/allItemsPanel.tsx` — replace `🔥 Daily Deals` with `TbFlame` icon + "Hot Deals" text, update Popular Brands section to show brand logos from `brands.json` (image + text overlay)
        - `src/components/layout/newsletterSignup.tsx` (NEW) — extracted, redesigned newsletter card: distinct background color (`bg-pedie-green/10` or `bg-gradient-to-r from-pedie-green/20 to-pedie-green/5`), clear input field with visible border, prominent "Subscribe" button, heading + subtitle, used in footer and potentially elsewhere
        - `src/components/layout/footer.tsx` — replace `FooterNewsletterForm` import with new `NewsletterSignup`
    - **Tests to Write:**
        - `tests/components/layout/mobile-nav.test.tsx` — source contains `defaultExpanded`, card-style categories (image references), quick links
        - `tests/components/layout/search-bar.test.tsx` — source contains `defaultExpanded` prop
        - `tests/components/layout/all-items-panel.test.tsx` — source contains `TbFlame` (not emoji), `brands.json` import or brand logos
        - `tests/components/layout/newsletter-signup.test.tsx` (NEW) — module export, source contains email input, subscribe button, distinct background
    - **Steps:**
        1. Write failing tests for updated mobile nav, search bar, all items panel, newsletter
        2. Add `defaultExpanded` prop to `SearchBar`
        3. Create `NewsletterSignup` component with eye-catching design
        4. Rewrite mobile nav categories to use card style with images
        5. Update All Items panel: Tabler icon for deals, brand logos
        6. Replace footer newsletter with new component
        7. Run quality gate

4. **✅ Phase 4: Search Autocomplete & Filter Sidebar**
    - **Objective:** Add real-time search suggestions as user types (debounced), and a filter sidebar/panel on the search results page for condition, price range, brand, storage.
    - **Changes from plan:** Added `buildSearchUrl` helper in search page to preserve active filters across pagination. Price inputs use local state with onBlur (not onChange) to avoid per-keystroke navigation. Non-OK HTTP responses now properly clear suggestion state. Also seeded Supabase DB + Google Sheets and downloaded brand SVG logos as pre-phase tasks.
    - **Files/Functions to Modify/Create:**
        - Install `use-debounce` package (`bun add use-debounce`) for debounced search input
        - `src/lib/data/search.ts` — add `getSearchSuggestions(query: string, limit?: number)` function that returns product names/brands matching the query (lightweight FTS, top 8 results)
        - `src/app/api/search/suggestions/route.ts` (NEW) — API endpoint for search suggestions (GET, query param `q`)
        - `src/components/layout/searchBar.tsx` — add autocomplete dropdown: fetch suggestions on input change (debounced 300ms), show dropdown with product names, clicking suggestion navigates to search results, keyboard navigation (up/down/enter/escape)
        - `src/components/search/filterSidebar.tsx` (NEW) — filter panel with:
            - Condition checkboxes (premium, excellent, good, acceptable)
            - Price range slider or min/max inputs
            - Brand checkboxes (from available brands)
            - Storage checkboxes (from available options)
            - "Apply" button + "Clear all" link
        - `src/lib/data/search.ts` — add `getAvailableFilters(query: string)` to return filter facets for a given search query
        - `src/app/(store)/search/page.tsx` — integrate `FilterSidebar` as a collapsible panel on search results page, pass filters via URL search params
    - **Tests to Write:**
        - `tests/lib/data/search.test.ts` — test `getSearchSuggestions` and `getAvailableFilters` exports
        - `tests/api/search-suggestions.test.ts` (NEW) — API route exports GET handler
        - `tests/components/layout/search-bar.test.tsx` — source contains suggestion dropdown, debounce, keyboard nav
        - `tests/components/search/filter-sidebar.test.tsx` (NEW) — module export, filter categories, apply/clear buttons
    - **Steps:**
        1. Install `use-debounce` package
        2. Write failing tests for search suggestions, filter sidebar, and updated search bar
        3. Create `getSearchSuggestions` and `getAvailableFilters` in search.ts
        4. Create API route for suggestions
        5. Update `SearchBar` with autocomplete dropdown
        6. Create `FilterSidebar` component
        7. Integrate filters into search results page
        8. Run quality gate

5. **Phase 5: Footer Accordion & Final Polish**
    - **Objective:** Make footer link groups collapsible on mobile (expanded on desktop), final responsive QA pass.
    - **Files/Functions to Modify/Create:**
        - `src/components/layout/footer.tsx` — make link groups collapsible on mobile: each group title is a button that toggles visibility, collapsed by default on mobile, always expanded on desktop (`md:` breakpoint). Use simple state or details/summary HTML for no-JS fallback.
        - `src/components/layout/footer.tsx` — update "Daily Deals" → "Deals" in Shop links if not already done
    - **Tests to Write:**
        - `tests/components/layout/footer.test.tsx` — source contains accordion/collapsible logic (e.g., `details` or toggle state), responsive behavior
    - **Steps:**
        1. Write failing test for footer accordion behavior
        2. Implement collapsible footer link groups with HTML `<details>`/`<summary>` for accessibility and no-JS support, styled with Tailwind
        3. Final responsive audit across all sections
        4. Run quality gate

**Resolved Decisions**
1. Brand logos: SVG files in `/public/images/brands/`, sourced online, referenced from `brands.json`
2. Search suggestions: text + product info with basic stats from product data (brand, model, condition, price)
3. Filter sidebar: left sidebar on `lg:`, collapsible top panel on mobile
4. Seed script: add `--dry-run` flag for CI safety
5. Newsletter: contained card within footer with distinct visual treatment (gradient/border)
