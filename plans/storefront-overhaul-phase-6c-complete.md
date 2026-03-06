## Phase 6c Complete: Fixes (Cards, Categories, Footer & Cleanup)

Reverted Popular Categories from squares to circles, redesigned product cards (removed specs, enforced image dimensions with `object-contain`, standardized price section height), overhauled footer from broken `<details>/<summary>` to an accessible CSS accordion with `useSyncExternalStore` for viewport-aware state, and fixed glass-footer light-mode visibility.

**Files created/changed:**
- src/components/home/popularCategories.tsx
- src/components/home/popularCategoriesSkeleton.tsx
- src/components/ui/productCard.tsx
- src/components/ui/productFamilyCard.tsx
- src/components/skeletons/productCardSkeleton.tsx
- src/components/skeletons/productFamilyCardSkeleton.tsx
- src/components/layout/footer.tsx
- src/components/layout/footerAccordion.tsx (NEW)
- src/app/globals.css
- tests/components/home/popular-categories.test.tsx
- tests/components/ui/product-card.test.tsx
- tests/components/ui/product-family-card.test.tsx
- tests/components/ui/product-card-skeleton.test.tsx
- tests/components/ui/product-family-card-skeleton.test.tsx
- tests/components/layout/footer.test.tsx
- tests/components/layout/footer-accordion.test.tsx (NEW)
- tests/components/listing/add-to-cart.test.tsx
- plans/storefront-overhaul-plan.md
- plans/dom-testing-plan.md

**Functions created/changed:**
- FooterAccordion (new client component — button-based accordion with useSyncExternalStore)
- PopularCategories (reverted to rounded-full circles with fixed dimensions)
- ProductCard (removed specs, object-contain, min-h-[60px] price section)
- ProductFamilyCard (same changes as ProductCard)
- ProductCardSkeleton (removed specs placeholder)
- ProductFamilyCardSkeleton (removed specs placeholder)
- Footer (replaced details/summary with FooterAccordion component)

**Tests created/changed:**
- popular-categories.test.tsx: updated rounded-full assertions, fixed-size and image-size tests
- product-card.test.tsx: removed specs tests, added object-contain/min-h/no-specs assertions
- product-family-card.test.tsx: same pattern as product-card
- product-card-skeleton.test.tsx: specs placeholder absent assertion
- product-family-card-skeleton.test.tsx: specs placeholder absent assertion
- footer.test.tsx: button-based accordion assertions, no details/summary, matchMedia mock
- footer-accordion.test.tsx (NEW): export, source-analysis, DOM render, data-open/aria-expanded toggle
- add-to-cart.test.tsx: added referral CTA DOM test

**CodeRabbit fixes included:**
- plan.md line 356: split concatenated items 15 and 16
- dom-testing-plan.md: fixed "before setup.ts" → "before test files"
- dom-testing-plan.md: corrected "opt-in per file" → "loaded globally via bunfig.toml preload"
- add-to-cart.test.tsx: added referral CTA DOM test

**Review Status:** APPROVED (accessibility issues addressed — inert/aria-hidden on collapsed panels, useSyncExternalStore for viewport-aware ARIA state)

**Git Commit Message:**
```
fix: redesign cards, revert circle categories, overhaul footer

- Remove specs section from product cards, use object-contain images
- Standardize card price section height with min-h-[60px]
- Revert popular categories from squares to circles with fixed dimensions
- Replace footer details/summary with accessible button accordion
- Add FooterAccordion client component with useSyncExternalStore
- Fix glass-footer border token for light-mode visibility
- Add referral CTA DOM test and fix dom-testing-plan docs
```
