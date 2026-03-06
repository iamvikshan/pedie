## Plan Complete: DOM Testing with Happy-DOM + RTL

Transitioned from source-analysis-only tests (readFileSync + string matching) to proper DOM rendering tests using Bun's happy-dom support and React Testing Library. Converted 20 test files as a PoC baseline, establishing shared mock utilities and testing patterns for the codebase.

**Phases Completed:** 3 of 3
1. [x] Phase 1: Infrastructure Setup + Doc Updates
2. [x] Phase 2: Convert First 10 Test Files
3. [x] Phase 3: Convert Remaining 10 Test Files + Mock Bleeding Fix

**All Files Created/Modified:**
- bunfig.toml (preload configuration)
- tsconfig.json (type augmentation include)
- AGENTS.md (testing conventions update)
- plans/storefront-overhaul-plan.md (DOM testing notes)
- tests/setup.ts (updated: preload for happy-dom + jest-dom matchers)
- tests/utils.tsx (new: shared mocks + RTL re-exports)
- types/testing.d.ts (new: jest-dom type augmentation for bun:test)
- tests/components/catalog/product-grid.test.tsx
- tests/components/catalog/filter-sidebar.test.tsx
- tests/components/catalog/pagination.test.tsx
- tests/components/layout/sidebarPanel.test.tsx
- tests/components/layout/megaMenu.test.tsx
- tests/components/layout/header.test.tsx
- tests/components/layout/footer.test.tsx
- tests/components/layout/mobileNav.test.tsx
- tests/components/ui/conditionBadge.test.tsx
- tests/components/ui/breadcrumbs.test.tsx
- tests/components/ui/product-card.test.tsx
- tests/components/ui/product-family-card.test.tsx
- tests/components/ui/theme-toggle.test.tsx
- tests/components/listing/variant-selector.test.tsx
- tests/components/listing/add-to-cart.test.tsx
- tests/components/listing/image-gallery.test.tsx
- tests/components/listing/price-display.test.tsx
- tests/components/home/hot-deals.test.tsx
- tests/components/home/trust-banner.test.tsx
- tests/components/home/popular-categories.test.tsx
- tests/app/listings/page.test.tsx (mock fix)
- tests/app/search/page.test.tsx (mock fix)
- tests/app/checkout/checkout-auth.test.tsx (mock fix)

**Files Deleted:**
- tests/dom-smoke.test.tsx (removed after validation)

**Key Functions/Classes Added:**
- mockNextNavigation() — mock next/navigation hooks
- mockNextLink() — mock next/link component
- mockNextImage() — mock next/image component
- mockFramerMotion() — mock framer-motion with Proxy-based motion.* components
- mockNextModules() — convenience wrapper for all Next.js mocks

**Test Coverage:**
- Total tests: 1153
- All tests passing: Yes

**Key Learnings:**
- Bun's mock.module() is permanent per process — always mock leaf dependencies, never mock modules that have their own test files
- happy-dom must be registered via bunfig.toml preload (not per-file import) because RTL's `screen` evaluates `document.body` at module load time
- jest-dom doesn't export a `./bun` subpath — manual type augmentation via `types/testing.d.ts` is required

**Recommendations for Next Steps:**
- Convert additional test files beyond the 20-file PoC as components are modified
- Consider adding interaction tests (fireEvent/userEvent) for form components
- Add visual regression testing with browser tools for critical UI paths
