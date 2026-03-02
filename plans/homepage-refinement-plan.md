## Plan: Homepage Refinement Polish

Post-redesign polish pass addressing 8+ refinement items: scroll-aware header, depth-layered glassmorphism, product card redesign with sale variants (using new `final_price_kes` field), icon-only condition badges, carousel navigation, Reebelo-style **Hot Deals** section with dedicated `/deals` page, customer favorites "View All" link, and redesigned mobile-first footer with accordion.

**Resolved Decisions:**
1. Carousel chevrons: auto-hide after 3s inactivity on desktop
2. Hot Deals swiper: CSS `overflow-x: auto` with scroll-snap, auto-scroll every 5s
3. Footer mobile: 4-section layout (brand+newsletter, 2x2 links grid, socials+badges, copyright)
4. Sale pricing: 3-tier system using `final_price_kes` + `is_on_sale` + `price_kes`:
   - **Tier 1 (sale):** `final_price_kes < price_kes` AND `is_on_sale = true` → sale card, discount pill, Hot Deals priority, featured in `/deals`
   - **Tier 2 (discounted):** `final_price_kes < price_kes` AND `is_on_sale = false` → normal card with inline discount, included in `/deals` after sale items, fills Hot Deals if <20 sale items
   - **Tier 3 (normal):** `final_price_kes >= price_kes` → final price only, no discount display
5. Reduced motion: disable transition animations only, keep static content visible
6. Rename "Daily Deals" → "Hot Deals" throughout, with new `/deals` page
7. `/deals` page: shows all `sale` + `discounted` items, prioritizing `sale` first, then sorted by highest-to-lowest discount
8. Hot Deals homepage card: prioritize `sale` items, backfill with `discounted` to reach 20 products, sorted by highest discount within each tier

**Phase Count Rationale:**
- 3 phases groups changes by DOM layer (chrome → cards → content sections) to minimize cross-file conflicts
- Phase 1 (header/nav) is foundational — scroll hook + CSS tokens used by later phases
- Phase 2 (cards/badges) includes `final_price_kes` DB prep + card rewrites — self-contained with major type/component changes
- Phase 3 (carousel/deals/footer) bundles content sections + the new Hot Deals page + footer rewrite

**Phases (3)**

1. **Phase 1: Header & Navigation Polish** ✅ COMPLETE
    - Implemented scroll-direction hide/show header, increased glassmorphism depth, added sunken search input, restructured mobile nav icons, removed "Create Account" from mobile drawer. Fixed mobile nav z-index via `createPortal`.
    - 776 → 800 tests passing.

2. **Phase 2: Product Cards Redesign, Condition Icons & `final_price_kes` Field** ✅ COMPLETE
    - Added `final_price_kes` column to Supabase DB, types, sheets sync. Rewrote `productCard.tsx` with 3-tier pricing (sale/discounted/normal) as server component. Rewrote `conditionBadge.tsx` to icon-only with tooltip. Added `getPricingTier` helper. Fixed SearchPage test (missing `final_price_kes` in mock).
    - 800 tests passing, 0 failures.

3. **Phase 3: Carousel Nav, Hot Deals Page, Customer Favorites & Footer Redesign**
    - **Objective:** Add auto-hiding prev/next chevron buttons to hero carousel (desktop-only). Rename "Daily Deals" → "Hot Deals" throughout, redesign to Reebelo-style 12-col layout (3-col timer card + 9-col horizontal snap-swiper with auto-scroll every 5s), add "View All" button linking to new `/deals` page. Create `/deals` page showing all **sale** and **discounted** listings (prioritize sale items first, then sort by highest-to-lowest discount). Hot Deals homepage card: prioritize sale items, backfill with discounted to reach 20 products. Add "View All" link to customer favorites. Redesign footer: mobile 4-section layout (brand+newsletter, 2x2 links, socials+badges, copyright), depth glow, glass payment badges. Add `prefers-reduced-motion` support.
    - **Files/Functions to Modify/Create:**
        - `src/components/home/heroBanner.tsx` — add TbChevronLeft/TbChevronRight nav buttons, visible on md+, auto-hide after 3s inactivity
        - `src/components/home/dailyDeals.tsx` → rename to `src/components/home/hotDeals.tsx` — major rewrite: 12-col grid (3-col timer card pedie-dark+gold, 9-col snap-swiper auto-scrolling every 5s), "View All" button → `/deals`. Prioritize `sale` items (up to 20), backfill with `discounted` items sorted by highest discount.
        - `src/app/(store)/deals/page.tsx` (NEW) — Deals page listing all `sale` + `discounted` items: sale items first (sorted by highest discount), then discounted items (sorted by highest discount)
        - `src/lib/data/deals.ts` (NEW) — data fetching helpers: `getDealsListings(limit?)` returns sale-first + discounted listings sorted by discount %, `getHotDealsListings()` returns up to 20 (sale priority, backfill discounted)
        - `src/components/home/customerFavorites.tsx` — add "View All" link pointing to `/collections` next to category tabs
        - `src/components/layout/footer.tsx` — complete rewrite for mobile-first layout:
            - Section 1: brand logo + description paragraph
            - Section 2: newsletter form (visually part of section 1)
            - Section 3: links in 2×2 grid — About & Shop expanded (max 5 links each), Help & Policies collapsed by default
            - Section 4.1: socials + glass payment badges
            - Section 4.2: copyright centered
        - `src/app/globals.css` — `@media (prefers-reduced-motion: reduce)` rules, footer glow token, gold accent color for hot deals timer
        - Update imports/references: `page.tsx` (homepage), any component importing `dailyDeals` → `hotDeals`
    - **Tests to Write:**
        - `tests/components/home/heroBanner.test.tsx` — chevron buttons rendered, click advances/reverses, auto-hide behavior, hidden on mobile
        - `tests/components/home/hotDeals.test.tsx` (renamed) — timer card, snap-swiper, auto-scroll interval, "View All" link with href `/deals`, gold accent, prioritizes sale items, backfills with discounted
        - `tests/lib/data/deals.test.ts` (NEW) — `getDealsListings` returns sale-first sorted by discount; `getHotDealsListings` caps at 20, sale priority
        - `tests/app/(store)/deals/page.test.tsx` (NEW) — page renders grid of sale + discounted listings, sale items appear first
        - `tests/components/home/customerFavorites.test.tsx` — "View All" link present with href `/collections`
        - `tests/components/layout/footer.test.tsx` — glow border, 4-section layout, About/Shop expanded, Help/Policies collapsed, payment badges, socials, copyright centered
    - **Steps:**
        1. Write failing tests for hero carousel prev/next buttons (click, auto-hide, desktop-only)
        2. Update `heroBanner.tsx` with auto-hiding chevron navigation buttons
        3. Rename `dailyDeals.tsx` → `hotDeals.tsx`, update all imports
        4. Create `src/lib/data/deals.ts` with data fetching helpers for deals sorting/prioritization
        5. Write failing tests for redesigned Hot Deals layout (timer card, snap-swiper, auto-scroll, "View All", sale priority)
        6. Rewrite `hotDeals.tsx` with Reebelo-style 12-col layout + "View All" button + sale-first sorting
        7. Create `/deals` page with sale-first + discounted grid, write tests for it
        8. Write failing test for "View All" link in customer favorites
        9. Update `customerFavorites.tsx` with "View All" link
        10. Write failing tests for footer redesign (4-section mobile layout, accordion, glow, badges)
        11. Rewrite `footer.tsx` with mobile-first 4-section layout
        12. Update `globals.css` with reduced-motion rules, footer glow, gold accent
        13. Run quality gate: `bun f && bun check && bun test`
