## Phase 1 Complete: Bug Fixes (Carousel Direction + Brands Redesign)

Fixed carousel bidirectional animation and redesigned Popular Brands in AllItemsPanel to use theme-aware pill-style layout inspired by Badili.ke.

**Files created/changed:**

- src/components/home/heroBanner.tsx
- src/components/layout/allItemsPanel.tsx
- tests/components/home/hero-banner.test.tsx
- tests/components/layout/allItemsPanel.test.tsx

**Functions created/changed:**

- `slideVariants` — changed from static object to dynamic functions accepting `direction` parameter
- `HeroBanner` — added `direction` state, wired into chevron clicks, autoplay, and dot navigation
- `AllItemsPanel` — redesigned Popular Brands section with horizontal pill layout, theme-aware tokens

**Tests created/changed:**

- `hero-banner.test.tsx` — slideVariants direction logic tests (enter/exit x values for direction ±1), custom prop presence
- `allItemsPanel.test.tsx` — brands redesign tests (no dark:invert, theme-aware classes, flex-wrap layout, pill styling)

**Review Status:** APPROVED (after fixing test token mismatch)

**Git Commit Message:**

```
fix: carousel direction animation and brands redesign

- Fix carousel prev/next to animate in correct direction using framer-motion custom prop
- Add direction state wired to chevron clicks, autoplay, and dot navigation
- Redesign Popular Brands as theme-aware horizontal pills (no dark:invert)
- Use bg-pedie-surface containers for brand logos
- Add tests for direction logic and brands styling
```
