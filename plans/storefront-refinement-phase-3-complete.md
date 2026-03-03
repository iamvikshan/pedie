## Phase 3 Complete: Affiliate Refinements, Hot Deals Redesign, Brands Dark Mode & Skeleton Loading

Refined affiliate card behavior (pricing shown like normal/discounted cards, Partner badge replaces ConditionBadge), added defensive AddToCart handling, fixed upload-images.ts header, added Hot Deals gradient glow, circular brand logos with dark mode support, and created reusable Skeleton component with homepage loading state.

**Files created:**
- `src/components/ui/skeleton.tsx`
- `src/app/loading.tsx`
- `tests/components/ui/skeleton.test.tsx`
- `tests/app/loading.test.tsx`

**Files changed:**
- `src/components/ui/productCard.tsx`
- `src/components/listing/addToCart.tsx`
- `scripts/upload-images.ts`
- `src/components/home/hotDeals.tsx`
- `src/components/layout/allItemsPanel.tsx`
- `tests/components/ui/product-card.test.tsx`
- `tests/components/listing/add-to-cart.test.tsx`
- `tests/components/home/hot-deals.test.tsx`
- `tests/components/layout/allItemsPanel.test.tsx`

**Functions created/changed:**
- `Skeleton` — new reusable skeleton loading component with animate-pulse and accessibility
- `HomeLoading` — new homepage loading skeleton layout
- `ProductCard` — removed affiliate "View on Partner Site" pricing branch; affiliate now shows pricing like any other tier; added `!isAffiliate` guard on ConditionBadge; added tooltip on Partner badge
- `AddToCart` — added defensive fallback for affiliate without source_url (disabled "Unavailable" button)
- `HotDeals` — added gradient border/glow wrapper on timer card; warm gradient section background
- `AllItemsPanel` — added rounded-full + overflow-hidden for circular brand logos; added dark:invert for dark mode

**Tests created/changed:**
- `skeleton.test.tsx` — 4 new tests (export, animate-pulse, accessibility, className)
- `loading.test.tsx` — 4 new tests (import, Skeleton usage, hero area, product grid)
- `product-card.test.tsx` — 3 new tests (tooltip, no "View on Partner Site", !isAffiliate guard)
- `add-to-cart.test.tsx` — 1 new test (affiliate without source_url → Unavailable)
- `hot-deals.test.tsx` — 2 new tests (gradient glow border, warm gradient background)
- `allItemsPanel.test.tsx` — 2 new tests (rounded-full + overflow-hidden, dark:invert)

**Review Status:** APPROVED (formatting issue resolved, all quality gates pass)

**Git Commit Message:**
```
feat: refine affiliate cards, add skeleton loading & visual polish

- Affiliate cards now show pricing like normal/discounted cards
- Partner badge with tooltip replaces ConditionBadge for affiliates
- Defensive AddToCart handling for affiliate without source_url
- Hot Deals timer card with gradient border and warm glow
- Popular Brands logos circular with dark mode invert support
- New reusable Skeleton component and homepage loading skeleton
- Fix upload-images.ts header comment to describe SVG generation
- 918 tests passing, 0 failures
```
