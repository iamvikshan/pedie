## Plan: DOM Testing with Happy-DOM + RTL

Transition from source-analysis-only tests to proper DOM rendering tests using Bun's happy-dom support and React Testing Library. Happy-dom is loaded globally via `bunfig.toml` preload (zero-cost for logic tests). Converts 20 test files as a PoC baseline. Updates AGENTS.md and storefront-overhaul-plan.md.

**Resolved Tooling:** `{ pm: "bun", format: "bun run f", check: "bun check", test: "bun test" }`

**Phase Count Rationale:**
- Phase 1 is infrastructure — packages, opt-in helper, smoke test, doc updates. Nothing else works without it.
- Phase 2 converts 10 files: 3 renderToString (lowest risk) + 5 layout + 2 UI components — validates the infrastructure across diverse patterns.
- Phase 3 converts 10 more files: listing detail components, remaining UI, home sections — completes the 20-file PoC.
- 3 phases is the minimum: foundation → first batch → second batch.

**Phases (3)**

1. **[x] Phase 1: Infrastructure Setup + Doc Updates**
    - **Changes from plan:** happy-dom is registered via `bunfig.toml` preload (not per-file import) because RTL's `screen` captures `document.body` at module load time — ES import hoisting means per-file `import './setup'` runs after RTL loads. The preload approach is zero-cost for logic tests. jest-dom type augmentation placed in `types/testing.d.ts` (manually augments `bun:test` Matchers since `@testing-library/jest-dom` doesn't export `./bun` subpath).
    - **Objective:** Install packages, create DOM preload, shared test utils, smoke test, update AGENTS.md and storefront-overhaul-plan.md
    - **Files/Functions to Modify/Create:**
      - `package.json` — added `@happy-dom/global-registrator`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`
      - `tests/setup.ts` — **New**: preload — registers happy-dom globals, extends Bun expect with jest-dom matchers, RTL cleanup in afterEach
      - `bunfig.toml` — updated preload to include setup.ts before test files
      - `tests/utils.tsx` — **New**: shared mocks for next/link, next/image, next/navigation, framer-motion; re-exports RTL render, screen, within, waitFor
      - `tests/dom-smoke.test.tsx` — **New**: 8 smoke tests proving DOM env + RTL work
      - `types/testing.d.ts` — **New**: type augmentation for jest-dom matchers on Bun's expect
      - `AGENTS.md` — Updated testing conventions with 3 test approaches
      - `plans/storefront-overhaul-plan.md` — Added DOM testing notes for Phase 6c and Phase 7
    - **Tests to Write:**
      - `dom-smoke.test.tsx`: renders `<div>Hello</div>`, queries via `screen.getByText()`, asserts `toBeInTheDocument()`; renders a button, fires click, asserts handler called
    - **Steps:**
      1. Install packages via `bun add -D @happy-dom/global-registrator @testing-library/react @testing-library/dom @testing-library/jest-dom`
      2. Create `tests/setup.ts` — opt-in: test files that need DOM `import './setup'` at top
      3. Create `tests/utils.tsx` with reusable Next.js mock helpers and RTL re-exports
      4. Write `tests/dom-smoke.test.tsx`
      5. Run `bun test tests/dom-smoke.test.tsx` — confirm pass
      6. Run `bun test` — confirm no regressions in all existing tests
      7. Update AGENTS.md testing conventions
      8. Update storefront-overhaul-plan.md
      9. Run `bun check`

2. **[x] Phase 2: Convert First 10 Test Files**
    - **Changes from plan:** Phases 2 and 3 were executed together in a single pass. All 20 test files were converted successfully. Some files required additional mock.module() calls for deeper dependencies (e.g., header.test.tsx mocked sub-components like SearchBar, CategoryNav, MobileNav, SidebarPanel). The `.test.ts` → `.test.tsx` extension renames were applied as planned.
    - **Objective:** Convert 3 renderToString files + 5 layout component files + 2 UI component files to DOM rendering tests
    - **Files/Functions to Modify/Create (10 files):**
      - **Tier 1 — renderToString → RTL (3 files):**
        - `tests/components/catalog/product-grid.test.tsx` — replace `renderToString` → `render`, use `getByText`, `queryByText`
        - `tests/components/catalog/filter-sidebar.test.tsx` — replace `renderToString` → `render`, use `getAllByRole('checkbox')` for checked state
        - `tests/components/catalog/pagination.test.tsx` — replace `renderToString` → `render`, use `getByRole('button')` for disabled state
      - **Tier 2 — Layout source-analysis → DOM (5 files):**
        - `tests/components/layout/sidebarPanel.test.ts` → `.test.tsx` — render component, test dialog role, aria-modal, portal, variant rendering, links
        - `tests/components/layout/megaMenu.test.ts` → `.test.tsx` — render component, test subcategory links, null states, hover behavior
        - `tests/components/layout/header.test.tsx` — render header, test nav structure, responsive elements, link presence
        - `tests/components/layout/footer.test.tsx` — render footer, test link groups, newsletter section, social icons
        - `tests/components/layout/mobileNav.test.tsx` — render mobile nav, test delegation to SidebarPanel, breakpoint classes
      - **Tier 2.5 — UI components (2 files):**
        - `tests/components/ui/conditionBadge.test.tsx` — render badge variants, test text and styling
        - `tests/components/ui/breadcrumbs.test.ts` → `.test.tsx` — render breadcrumb paths, test link hrefs and separators
    - **Tests to Write:**
      - RTL rewrites of existing assertions using `render`, `screen`, `getByRole`, `getByText`, `queryByText`, `getAllByRole`, `toBeInTheDocument`, `toHaveAttribute`
    - **Steps:**
      1. Convert Tier 1 (3 renderToString files) — add `import '../setup'`, replace render and assertions
      2. Read source components for Tier 2 files to understand props/dependencies/mock needs
      3. Convert Tier 2 layout files (5 files) — mock framer-motion, next/* modules as needed
      4. Convert Tier 2.5 UI files (2 files)
      5. Run `bun test tests/components/` — confirm all pass
      6. Run `bun test` — full regression
      7. Run `bun check`

3. **[x] Phase 3: Convert Remaining 10 Test Files + Mock Bleeding Fix**
    - **Changes from plan:** Combined with Phase 2 execution. After converting all 20 files, discovered Bun's `mock.module()` is permanent per process — mocks from one test file bled into other test files causing 27 failures. Fixed by removing problematic mock.module() calls in 8 files: hot-deals (ProductCard mock), header (cart store and ThemeToggle mocks), sidebarPanel (ThemeToggle mock), mobileNav (ThemeToggle mock), listings page, search page, checkout-auth, add-to-cart (cart store mocks). Replaced component-level mocks with leaf-dependency mocks (e.g., mock `next-themes` instead of mocking ThemeToggle). Removed smoke tests (dom-smoke.test.tsx) after all 20 files validated.
    - **Objective:** Convert 4 listing detail + 3 UI + 3 home section test files to complete the 20-file PoC
    - **Files/Functions to Modify/Create (10 files):**
      - **Tier 3 — Listing detail components (4 files):**
        - `tests/components/listing/variant-selector.test.tsx` — render selector, test option rendering, selection state
        - `tests/components/listing/add-to-cart.test.tsx` — render button, test click handler, disabled states
        - `tests/components/listing/image-gallery.test.tsx` — render gallery, test image rendering, thumbnail selection
        - `tests/components/listing/price-display.test.tsx` — render price, test formatting, discount display
      - **Tier 4 — UI components (3 files):**
        - `tests/components/ui/product-card.test.tsx` — render card, test link, image, price, condition badge
        - `tests/components/ui/product-family-card.test.tsx` — render family card, test link, price range
        - `tests/components/ui/theme-toggle.test.tsx` — render toggle, test click cycles theme
      - **Tier 5 — Home sections (3 files):**
        - `tests/components/home/hot-deals.test.tsx` — render section, test grid layout, product cards
        - `tests/components/home/trust-banner.test.tsx` — render banner, test trust points
        - `tests/components/home/popular-categories.test.tsx` — render categories, test links and images
    - **Tests to Write:**
      - RTL rewrites of all existing source-analysis assertions for these files
    - **Steps:**
      1. Read source components for all 10 files to understand props/dependencies
      2. Convert Tier 3 listing files (4 files)
      3. Convert Tier 4 UI files (3 files)
      4. Convert Tier 5 home section files (3 files)
      5. Run `bun test tests/components/` — confirm all pass
      6. Run `bun test` — full regression
      7. Run `bun check`

**Open Questions (All Resolved)**
1. ~~Global vs opt-in happy-dom~~ → **Global via `bunfig.toml` preload** — zero-cost for logic tests; `import './setup'` was the original plan but RTL's `screen` captures `document.body` at module load time, so preload is required
2. ~~How many test files to convert~~ → **20 files** as PoC baseline
3. ~~Update docs~~ → **Yes**, AGENTS.md + storefront-overhaul-plan.md
4. ~~Shared Next.js mocks~~ → **Imported per-file** via `tests/utils.tsx` for explicitness

**Packages to Install:**
- `@happy-dom/global-registrator` — Bun-recommended DOM global registration
- `@testing-library/react` — React component rendering + semantic queries
- `@testing-library/dom` — peer dependency for RTL v16+
- `@testing-library/jest-dom` — custom matchers (`toBeInTheDocument`, `toHaveAttribute`, etc.)
