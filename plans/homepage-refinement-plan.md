## Plan: Homepage Refinement Polish

Post-redesign polish pass addressing 8+ refinement items: scroll-aware header, depth-layered glassmorphism, product card redesign with sale variants (using new `final_price_kes` field), icon-only condition badges, carousel navigation, Reebelo-style **Hot Deals** section with dedicated `/hot-deals` page, customer favorites "View All" link, and redesigned mobile-first footer with accordion.

**Resolved Decisions:**
1. Carousel chevrons: auto-hide after 3s inactivity on desktop
2. Hot Deals swiper: CSS `overflow-x: auto` with scroll-snap, auto-scroll every 5s
3. Footer mobile: 4-section layout (brand+newsletter, 2x2 links grid, socials+badges, copyright)
4. Sale pricing: new `final_price_kes` DB column — if `final_price_kes < price_kes`, show `price_kes` crossed out + `final_price_kes` as sale price + discount %. If `final_price_kes >= price_kes`, show `final_price_kes` only (no discount)
5. Reduced motion: disable transition animations only, keep static content visible
6. Rename "Daily Deals" → "Hot Deals" throughout, with new `/hot-deals` page showing all `is_on_sale` items

**Phase Count Rationale:**
- 3 phases groups changes by DOM layer (chrome → cards → content sections) to minimize cross-file conflicts
- Phase 1 (header/nav) is foundational — scroll hook + CSS tokens used by later phases
- Phase 2 (cards/badges) includes `final_price_kes` DB prep + card rewrites — self-contained with major type/component changes
- Phase 3 (carousel/deals/footer) bundles content sections + the new Hot Deals page + footer rewrite

**Phases (3)**

1. **Phase 1: Header & Navigation Polish**
    - **Objective:** Implement scroll-direction hide/show header, increase glassmorphism depth, add sunken search input, restructure mobile nav icons, and remove the "Create Account" link from the mobile drawer.
    - **Files/Functions to Modify/Create:**
        - `src/hooks/useScrollDirection.ts` (NEW) — custom hook returning `'up' | 'down'` with 10px threshold
        - `src/app/globals.css` — increase `.glass` blur from 16px to 24px, add `.glass-search` with inset shadow, add `.glass-depth` with stronger border/shadow
        - `src/components/layout/header.tsx` — integrate `useScrollDirection`, add `translate-y` transition, apply `.glass-depth` class, restructure mobile row: hamburger + logo left, search + cart + user right (remove ThemeToggle from mobile)
        - `src/components/layout/searchBar.tsx` — apply `.glass-search` class for sunken depth effect
        - `src/components/layout/mobileNav.tsx` — remove "Create Account" link from auth section, keep ThemeToggle at bottom of drawer
    - **Tests to Write:**
        - `tests/hooks/useScrollDirection.test.ts` — scroll up returns 'up', scroll down returns 'down', threshold behavior, initial state
        - `tests/components/layout/header.test.tsx` — new/updated tests for scroll-aware visibility, mobile icon order
        - `tests/components/layout/mobileNav.test.tsx` — verify "Create Account" link removed, ThemeToggle still present
        - `tests/components/layout/searchBar.test.tsx` — verify glass-search class applied
    - **Steps:**
        1. Write failing tests for `useScrollDirection` hook (up/down/threshold/initial)
        2. Implement `useScrollDirection` hook to pass tests
        3. Write failing tests for header scroll behavior and mobile icon restructure
        4. Update `globals.css` with new glass tokens (`.glass` blur increase, `.glass-search`, `.glass-depth`)
        5. Update `header.tsx` to integrate scroll hook and restructured mobile layout
        6. Write/update searchBar tests, apply `.glass-search` class
        7. Write mobileNav tests for removed "Create Account" link, update `mobileNav.tsx`
        8. Run quality gate: `bun f && bun check && bun test`

2. **Phase 2: Product Cards Redesign, Condition Icons & `final_price_kes` Field**
    - **Objective:** Add `final_price_kes` column to Supabase DB, types, and Google Sheets sync. Rewrite `productCard.tsx` with two variants (normal and sale), using `final_price_kes` vs `price_kes` comparison for discount logic. Make entire card a clickable Link, remove CTA/wishlist/listing-ID. Rewrite `conditionBadge.tsx` to icon-only with tooltip.
    - **Pricing Logic:** `final_price_kes` is the actual customer-facing price. `price_kes` is the original landed cost. If `final_price_kes < price_kes` AND `is_on_sale` is true → show `price_kes` crossed out, `final_price_kes` as sale price, discount pill. If `final_price_kes >= price_kes` OR `is_on_sale` is false → show `final_price_kes` only, no discount.
    - **Files/Functions to Modify/Create:**
        - `supabase/migrations/20250706000000_add_final_price_kes.sql` (NEW) — add `final_price_kes` INTEGER column, default to `price_kes`, set NOT NULL
        - `types/product.ts` — add `final_price_kes: number` to Listing type
        - `types/database.ts` — add `final_price_kes` to Row/Insert/Update
        - `src/lib/sheets/parser.ts` — add `final_price_kes?: string` to SheetRow, parse in `parseSheetRow`
        - `src/lib/sheets/sync.ts` — add `final_price_kes` to SHEET_HEADERS, listingData in syncFromSheets, toRow in syncToSheets
        - `src/components/ui/conditionBadge.tsx` — rewrite: icon-only with `title` tooltip, map condition grades to Tabler icons (premium→TbCrown, excellent→TbDiamond, good→TbThumbUp, acceptable→TbCircleCheck)
        - `src/components/ui/productCard.tsx` — major rewrite: entire card wrapped in `Link`, remove Add-to-Cart CTA, remove wishlist heart, remove listing ID display, sale variant shows glassmorphed discount pill with crossed-out `price_kes` + `final_price_kes`, condition badge icon, battery health
        - `src/helpers/pricing.ts` — `calculateDiscount` already exists, verify it works for `price_kes` vs `final_price_kes`
    - **Tests to Write:**
        - `tests/components/ui/conditionBadge.test.tsx` — rewrite: verify each grade renders correct icon, tooltip text matches grade
        - `tests/components/ui/product-card.test.tsx` — rewrite: verify Link wrapping, no CTA button, no wishlist icon, no listing ID, sale variant shows discount pill + crossed-out original, normal variant shows `final_price_kes` only
        - `tests/helpers/pricing.test.ts` — verify `calculateDiscount` works for price_kes vs final_price_kes comparison
        - `tests/lib/sheets/sync.test.ts` — add tests for `final_price_kes` parsing
        - Update all test fixtures with `final_price_kes` field
    - **Steps:**
        1. Create Supabase migration for `final_price_kes` (add column, backfill from `price_kes`, set NOT NULL)
        2. Apply migration to live DB, update types (product.ts, database.ts)
        3. Update sheets parser and sync with `final_price_kes` field
        4. Add `final_price_kes` to Google Sheets column and populate existing rows
        5. Update all test fixtures with `final_price_kes` field
        6. Write failing tests for new icon-only `conditionBadge` (4 grades × icon + tooltip)
        7. Rewrite `conditionBadge.tsx` to pass tests
        8. Write failing tests for new `productCard` (Link wrapper, no CTA, sale/normal variants with pricing logic)
        9. Rewrite `productCard.tsx` with two variants, passing all tests
        10. Update any components that depend on the old ProductCard props API
        11. Run quality gate: `bun f && bun check && bun test`

3. **Phase 3: Carousel Nav, Hot Deals Page, Customer Favorites & Footer Redesign**
    - **Objective:** Add auto-hiding prev/next chevron buttons to hero carousel (desktop-only). Rename "Daily Deals" → "Hot Deals" throughout, redesign to Reebelo-style 12-col layout (3-col timer card + 9-col horizontal snap-swiper with auto-scroll every 5s), add "View All" button linking to new `/hot-deals` page. Create `/hot-deals` page showing all `is_on_sale` listings. Add "View All" link to customer favorites. Redesign footer: mobile 4-section layout (brand+newsletter, 2x2 links, socials+badges, copyright), depth glow, glass payment badges. Add `prefers-reduced-motion` support.
    - **Files/Functions to Modify/Create:**
        - `src/components/home/heroBanner.tsx` — add TbChevronLeft/TbChevronRight nav buttons, visible on md+, auto-hide after 3s inactivity
        - `src/components/home/dailyDeals.tsx` → rename to `src/components/home/hotDeals.tsx` — major rewrite: 12-col grid (3-col timer card pedie-dark+gold, 9-col snap-swiper auto-scrolling every 5s), "View All" button → `/hot-deals`
        - `src/app/(store)/hot-deals/page.tsx` (NEW) — Hot Deals page listing all `is_on_sale` products in a grid
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
        - `tests/components/home/hotDeals.test.tsx` (renamed) — timer card, snap-swiper, auto-scroll interval, "View All" link with href `/hot-deals`, gold accent
        - `tests/app/(store)/hot-deals/page.test.tsx` (NEW) — page renders grid of on-sale listings
        - `tests/components/home/customerFavorites.test.tsx` — "View All" link present with href `/collections`
        - `tests/components/layout/footer.test.tsx` — glow border, 4-section layout, About/Shop expanded, Help/Policies collapsed, payment badges, socials, copyright centered
    - **Steps:**
        1. Write failing tests for hero carousel prev/next buttons (click, auto-hide, desktop-only)
        2. Update `heroBanner.tsx` with auto-hiding chevron navigation buttons
        3. Rename `dailyDeals.tsx` → `hotDeals.tsx`, update all imports
        4. Write failing tests for redesigned Hot Deals layout (timer card, snap-swiper, auto-scroll, "View All")
        5. Rewrite `hotDeals.tsx` with Reebelo-style 12-col layout + "View All" button
        6. Create `/hot-deals` page, write tests for it
        7. Write failing test for "View All" link in customer favorites
        8. Update `customerFavorites.tsx` with "View All" link
        9. Write failing tests for footer redesign (4-section mobile layout, accordion, glow, badges)
        10. Rewrite `footer.tsx` with mobile-first 4-section layout
        11. Update `globals.css` with reduced-motion rules, footer glow, gold accent
        12. Run quality gate: `bun f && bun check && bun test`
