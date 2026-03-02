## Phase 3 Complete: Hero Carousel, Trust Badges & Popular Categories

Rebuilt the three above-the-fold homepage sections: a half-height JSON-driven hero carousel with Framer Motion horizontal slide transitions and background images, glass trust badges with Tabler icons and whileInView stagger animations, and Reebelo-style circular image categories replacing emoji icons. All review issues resolved (hooks-before-return, dead animation delay, simplified CategoryImage).

**Files rewritten:**
- `src/components/home/heroBanner.tsx`
- `src/components/home/trustBadges.tsx`
- `src/components/home/popularCategories.tsx`

**Functions created/changed:**
- `HeroBanner` — JSON-driven (`hero.json`), Framer Motion `AnimatePresence` horizontal slide (x: 300→0→-300), `next/image` backgrounds with `onError` fallback, staggered text entrance, Tabler pause/play icons, defensive empty-slides guard
- `SLIDES` — re-exported from `hero.json` (3 items with title/subtitle/cta/link/image)
- `TrustBadges` — glass cards (`bg-pedie-glass`), Tabler icons (TbShieldCheck/TbTruck/TbCircleCheck/TbRefresh), Framer Motion `whileInView` stagger
- `BADGE_TITLES` — unchanged (4 items)
- `PopularCategories` — async server component, circular `next/image` thumbnails, `CATEGORY_IMAGES` export, glass hover ring
- `CategoryImage` — clean helper component for server-safe image rendering

**Tests created/changed:**
- `tests/components/home/popular-categories.test.tsx` (3 tests: export, CATEGORY_IMAGES object, image path format)
- `tests/components/home/hero-banner.test.tsx` (+1 test: image path on each slide)

**Review Status:** APPROVED (after fixes for hooks-before-return, dead animationDelay, CategoryImage cleanup)

**Git Commit Message:**
```
feat: hero carousel, glass trust badges & circular categories

- HeroBanner: JSON-driven half-height carousel with Framer Motion horizontal slides
- Background images with gradient overlay and onError fallback
- Staggered text entrance animations, Tabler pause/play icons
- TrustBadges: glass cards with Tabler icons, whileInView stagger entrance
- PopularCategories: Reebelo-style circular image thumbnails replacing emoji
- CATEGORY_IMAGES export for test verification
- Defensive empty-slides guard in HeroBanner
- 4 new tests (707 total, 0 fail)
```
