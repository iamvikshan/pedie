## Plan: Homepage Refinement Polish

Post-redesign polish pass addressing 8 refinement items: scroll-aware header, depth-layered glassmorphism, product card redesign with sale variants, icon-only condition badges, carousel navigation, Reebelo-style daily deals, customer favorites "View All" link, and footer depth/accordion.

**Phase Count Rationale:**
- 3 phases groups changes by DOM layer (chrome → cards → content sections) to minimize cross-file conflicts
- Phase 1 (header/nav) is foundational — scroll hook + CSS tokens used by later phases
- Phase 2 (cards/badges) is self-contained with major rewrites to two components
- Phase 3 (carousel/deals/footer) bundles remaining content-section changes that share layout concerns

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

2. **Phase 2: Product Cards Redesign & Condition Icons**
    - **Objective:** Rewrite `productCard.tsx` with two variants (normal and sale using `is_on_sale`), make the entire card a clickable Link, remove CTA/wishlist/listing-ID from the card, add glassmorphed discount pill for sale items. Rewrite `conditionBadge.tsx` to icon-only with tooltip (TbCrown/TbDiamond/TbThumbUp/TbCircleCheck).
    - **Files/Functions to Modify/Create:**
        - `src/components/ui/conditionBadge.tsx` — rewrite: icon-only with `title` tooltip, map condition grades to Tabler icons (premium→TbCrown, excellent→TbDiamond, good→TbThumbUp, acceptable→TbCircleCheck)
        - `src/components/ui/productCard.tsx` — major rewrite: entire card wrapped in `Link`, remove Add-to-Cart CTA, remove wishlist heart, remove listing ID display, add `is_on_sale` variant with glassmorphed discount percentage pill, show condition badge icon, battery health indicator, price display
        - `src/helpers/pricing.ts` — add `calculateDiscountPercentage(original, current)` helper if not already present
    - **Tests to Write:**
        - `tests/components/ui/conditionBadge.test.tsx` — rewrite: verify each grade renders correct icon, tooltip text matches grade
        - `tests/components/ui/product-card.test.tsx` — rewrite: verify Link wrapping, no CTA button, no wishlist icon, no listing ID, sale variant shows discount pill, normal variant has no pill
        - `tests/helpers/pricing.test.ts` — test discount percentage calculation
    - **Steps:**
        1. Write failing tests for new icon-only `conditionBadge` (4 grades × icon + tooltip)
        2. Rewrite `conditionBadge.tsx` to pass tests
        3. Write failing tests for discount percentage helper
        4. Implement/update `pricing.ts` helper
        5. Write failing tests for new `productCard` (Link wrapper, no CTA, sale/normal variants)
        6. Rewrite `productCard.tsx` with two variants, passing all tests
        7. Update any components that depend on the old ProductCard props API
        8. Run quality gate: `bun f && bun check && bun test`

3. **Phase 3: Carousel Navigation, Daily Deals Layout, Customer Favorites & Footer**
    - **Objective:** Add prev/next chevron buttons to hero carousel (desktop-only), redesign daily deals to Reebelo-style 12-col layout (3-col timer card + 9-col horizontal product swiper), add "View All" link to customer favorites section, and polish footer with depth border-top glow, darker background, mobile accordion, and glass payment badges. Add `prefers-reduced-motion` support for all animations.
    - **Files/Functions to Modify/Create:**
        - `src/components/home/heroBanner.tsx` — add TbChevronLeft/TbChevronRight nav buttons, visible only on md+ breakpoint, positioned absolute over carousel
        - `src/components/home/dailyDeals.tsx` — major rewrite: 12-col grid layout with timer card (pedie-dark bg + gold accent) in 3 cols, horizontal swipeable product grid in 9 cols
        - `src/components/home/customerFavorites.tsx` — add "View All" link pointing to `/collections` next to category tabs
        - `src/components/layout/footer.tsx` — add depth `border-top` glow effect, darken background, implement mobile accordion for link sections, glass-styled payment badges
        - `src/app/globals.css` — add `@media (prefers-reduced-motion: reduce)` rules, footer glow token, gold accent color
    - **Tests to Write:**
        - `tests/components/home/heroBanner.test.tsx` — verify chevron buttons rendered, click advances/reverses slide, hidden on mobile (responsive class check)
        - `tests/components/home/dailyDeals.test.tsx` — verify timer card renders, product swiper renders, grid layout classes, gold accent styling
        - `tests/components/home/customerFavorites.test.tsx` — verify "View All" link present with correct href
        - `tests/components/layout/footer.test.tsx` — verify glow border, accordion behavior on mobile, payment badges rendered
    - **Steps:**
        1. Write failing tests for hero carousel prev/next buttons (click behavior, desktop-only visibility)
        2. Update `heroBanner.tsx` with chevron navigation buttons
        3. Write failing tests for redesigned daily deals layout (timer card, swiper, grid)
        4. Rewrite `dailyDeals.tsx` with Reebelo-style 12-col layout
        5. Write failing test for "View All" link in customer favorites
        6. Update `customerFavorites.tsx` with "View All" link
        7. Write failing tests for footer polish (glow, accordion, payment badges)
        8. Rewrite `footer.tsx` with depth effects and mobile accordion
        9. Update `globals.css` with reduced-motion rules, footer glow, gold accent
        10. Run quality gate: `bun f && bun check && bun test`

**Open Questions**
1. Should the hero carousel chevrons auto-hide after a few seconds of inactivity, or always visible on desktop?
2. For the daily deals horizontal swiper, use CSS `overflow-x: auto` with snap points or a lightweight swiper component?
3. Should the footer mobile accordion default to all collapsed or first section expanded?
4. For the product card sale discount pill, use the `original_price_usd` vs `price_kes` comparison or a different field pair?
5. Should reduced-motion users see static images instead of carousels, or just disable the transition animations?
