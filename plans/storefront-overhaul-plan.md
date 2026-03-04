## Plan: Storefront Overhaul — Bugs, Categories, Navigation & Homepage

Comprehensive overhaul addressing carousel/brands bugs, restructuring category hierarchy with many-to-many support, adding mega-menu navigation with breadcrumbs, redesigning homepage sections, and adding a repairs placeholder page. All DB changes via Supabase MCP migrations. Docs (DESIGN.md, product-architecture.md) updated as affected.

**Resolved Tooling:** `{ pm: "bun", format: "bun f", lint: "bun lint", typecheck: "tsc --noEmit", test: "bun test", build: "bun run build", check: "bun check" }`

**Phase Count Rationale:**
- Phase 1 (Bugs): Self-contained UI fixes with zero DB dependency — quick wins that unblock user testing
- Phase 2 (DB Migration): Must land before any nav/homepage work; creates the category hierarchy + junction table that all subsequent phases depend on
- Phase 3 (Navigation): Depends on Phase 2's category tree for mega-menu and breadcrumbs
- Phase 4 (Homepage): Depends on Phase 2 categories + Phase 3 navigation patterns
- Phase 5 (Repairs + Docs): Independent placeholder page; docs update captures all prior changes

**Phases: 5**

1. **✅ Phase 1: Bug Fixes (Carousel Direction + Brands Redesign)**
    - **Changes from plan:** Used `bg-pedie-surface` instead of nonexistent `bg-pedie-muted` for brand logo container background. Test file path is `tests/components/layout/allItemsPanel.test.tsx` (not `tests/components/allItemsPanel.test.ts`). Hero banner test at `tests/components/home/hero-banner.test.tsx`.
    - **Objective:** Fix carousel so prev/next animate in correct directions; redesign Popular Brands in AllItemsPanel to Badili.ke-inspired theme-aware pill style
    - **Files/Functions to Modify/Create:**
      - `src/components/home/heroBanner.tsx` — add `direction` state, make `slideVariants` dynamic, update `handleChevronClick` and autoplay to set direction
      - `src/components/layout/allItemsPanel.tsx` — redesign Popular Brands section: remove `dark:invert`, use `bg-pedie-card` pill containers with proper border, larger brand logos
      - `tests/components/home/hero-banner.test.tsx` — carousel direction logic tests
      - `tests/components/layout/allItemsPanel.test.tsx` — brands rendering tests
    - **Tests to Write:**
      - `heroBanner direction state changes on prev/next click`
      - `heroBanner autoplay sets direction to next`
      - `heroBanner slideVariants enter/exit x values match direction`
      - `allItemsPanel brands render with theme-aware styling (no dark:invert)`
    - **Steps:**
      1. Write failing tests for carousel direction logic and brands rendering
      2. Add `direction` state to HeroBanner; wire `handleChevronClick('prev')` to set direction=-1 and `handleChevronClick('next')` to direction=1; autoplay sets direction=1
      3. Make `slideVariants` a function of direction: prev → `enter: {x: -300}`, `exit: {x: 300}`; next → `enter: {x: 300}`, `exit: {x: -300}`
      4. Pass `custom={direction}` to AnimatePresence/motion.div for proper exit animation
      5. Redesign brands grid: rounded `bg-pedie-card border border-pedie-border` containers, remove `dark:invert`, use properly themed brand display with hover state
      6. Run tests, verify all pass; run `bun check`

2. **⬜ Phase 2: Category Hierarchy DB Migration + Many-to-Many**
    - **Objective:** Restructure categories with Electronics root, add all subcategories, create `product_categories` junction table for many-to-many, seed data via MCP, update types and data-fetching
    - **Files/Functions to Modify/Create:**
      - New migration: `supabase/migrations/20250707000000_category_hierarchy.sql` — add `description` column, insert Electronics root, reparent existing categories, add all subcategories, create `product_categories` junction table with RLS
      - `types/product.ts` — update `Category` type with `description`, add `ProductCategory` junction type
      - `types/database.ts` — regenerate or manually add junction table types
      - `src/lib/data/categories.ts` — add `getCategoryTree()`, `getCategoryWithChildren()`, `getCategoryBreadcrumb()` functions
      - `src/lib/data/products.ts` — update queries to UNION primary `category_id` + junction table matches
      - `scripts/seed.ts` — update category seeds to match new hierarchy
      - `tests/data/categories.test.ts` — hierarchy fetch tests
    - **Tests to Write:**
      - `getCategoryTree returns nested hierarchy`
      - `getCategoryWithChildren returns parent with children array`
      - `getCategoryBreadcrumb returns path from root to leaf`
      - `product query includes junction-table category matches`
    - **Steps:**
      1. Write migration SQL and execute via Supabase MCP:
         - Add `description TEXT` to categories
         - Insert "Electronics" root category (parent_id = NULL)
         - Update existing categories to set parent_id = Electronics.id
         - Add "Audio" category under Electronics (new)
         - Add all subcategories: Phone Accessories, Computer Accessories, Earphones, Earbuds, Headphones, Portable Bluetooth Speakers, Speakers, Desktop Computers, Smart Rings, Portable Power Banks, Microphones, Cameras, Laptop Accessories, VR Headsets, Camera Accessories, VR Headset Accessories, Smartwatch Accessories, Tablet Accessories, Screen Protectors, Phone Cases, Chargers, Charging/Data Cables, Keyboards, Mice under appropriate parents
         - Create `product_categories` junction table (product_id UUID FK, category_id UUID FK, primary key composite, RLS)
      2. Write failing tests for new data-fetching functions
      3. Update `types/product.ts` with `description` field on Category and new junction type
      4. Implement `getCategoryTree()`, `getCategoryWithChildren()`, `getCategoryBreadcrumb()` in categories.ts
      5. Update product queries to support many-to-many lookup
      6. Update seed script to reflect new hierarchy
      7. Run tests, `bun check`

3. **⬜ Phase 3: Header Navigation — Mega-Menu, Deals Link, Breadcrumbs**
    - **Objective:** Replace hardcoded category nav with DB-driven mega-menu (Reebelo-style), add `/deals` with flame icon and Repairs link, create visible Breadcrumbs UI component for all dynamic pages
    - **Files/Functions to Modify/Create:**
      - `src/components/layout/categoryNav.tsx` — refactor from static to fetching from DB; show top-level categories; on hover show mega-menu panel with subcategories
      - `src/components/layout/header.tsx` — add `/deals` link with TbFlame icon, add Repairs link
      - `src/components/layout/megaMenu.tsx` — new full-width overlay panel showing subcategories in columns (like Reebelo)
      - `src/components/ui/breadcrumbs.tsx` — new reusable Breadcrumbs component (`Home / Electronics / Laptops`)
      - `src/app/(store)/collections/[slug]/page.tsx` — integrate Breadcrumbs
      - `src/app/(store)/products/[slug]/page.tsx` — integrate Breadcrumbs
      - `src/app/(store)/listings/[listingId]/page.tsx` — integrate Breadcrumbs
      - `src/components/layout/allItemsPanel.tsx` — update categories section for hierarchy
      - `src/components/layout/mobileNav.tsx` — update for new categories + deals + repairs
      - `tests/components/breadcrumbs.test.ts` — breadcrumb rendering tests
      - `tests/components/categoryNav.test.ts` — nav tests
    - **Tests to Write:**
      - `Breadcrumbs renders path segments with correct links`
      - `Breadcrumbs last segment is not a link`
      - `CategoryNav renders top-level categories from DB`
      - `megaMenu shows subcategories on hover`
      - `header includes deals link with flame icon`
    - **Steps:**
      1. Write failing tests for Breadcrumbs component and nav
      2. Create `Breadcrumbs` component: accepts `segments: {name, href}[]`, renders `Home / Segment / ...` with links, last segment plain text
      3. Create `MegaMenu` component: full-width panel below header, columns per category with subcategory links
      4. Refactor `CategoryNav` to fetch categories from DB via `getCategoryTree()`, render top-level with hover-triggered mega-menu
      5. Add `/deals` link with `TbFlame` icon and `/repairs` link to bottom header row
      6. Integrate `Breadcrumbs` into collection, product, and listing pages
      7. Update AllItemsPanel and MobileNav for new hierarchy
      8. Run tests, `bun check`

4. **⬜ Phase 4: Homepage Redesign — All Categories, Smaller Cards, Hot Deals**
    - **Objective:** Show all DB categories on homepage, reduce card sizes by ~15%, redesign Hot Deals to be cleaner/more Reebelo-like
    - **Files/Functions to Modify/Create:**
      - `src/app/page.tsx` — dynamically render CategoryShowcase for all top-level categories from DB
      - `src/components/ui/productCard.tsx` — reduce sizing (min-w, max-w, padding, font sizes)
      - `src/components/ui/productFamilyCard.tsx` — same sizing reduction
      - `src/components/home/hotDeals.tsx` — redesign: compact inline timer, cleaner gradient, more aligned with pedie tokens
      - `src/components/home/categoryShowcase.tsx` — adjust card widths
      - `src/components/skeletons/productCardSkeleton.tsx` — match new sizing
      - `src/components/skeletons/productFamilyCardSkeleton.tsx` — match new sizing
      - `tests/components/productCard.test.ts` — sizing tests
      - `tests/components/hotDeals.test.ts` — redesign tests
    - **Tests to Write:**
      - `ProductCard renders with reduced dimensions`
      - `ProductFamilyCard renders with reduced dimensions`
      - `HotDeals timer renders inline with products`
      - `Homepage renders CategoryShowcase for each top-level category`
    - **Steps:**
      1. Write failing tests for new card sizes and homepage sections
      2. Reduce card sizes globally: `min-w-[280px]` → `min-w-[238px]`, `max-w-[300px]` → `max-w-[255px]`, scale padding/font proportionally
      3. Update skeleton components to match new dimensions
      4. Redesign HotDeals: compact timer section, less amber glow, use pedie design tokens, keep countdown but make it inline/smaller
      5. Refactor `page.tsx` to dynamically fetch top-level categories and render a `CategoryShowcase` for each
      6. Run tests, `bun check`

5. **⬜ Phase 5: Repairs Placeholder + Docs Update**
    - **Objective:** Create placeholder repairs page, update DESIGN.md and product-architecture.md to reflect all changes
    - **Files/Functions to Modify/Create:**
      - `src/app/(store)/repairs/page.tsx` — new placeholder page with "Coming Soon" hero
      - `src/app/(store)/repairs/loading.tsx` — loading skeleton
      - `docs/DESIGN.md` — update component patterns, add mega-menu, breadcrumbs, new color tokens if any
      - `docs/product-architecture.md` — update category hierarchy docs, many-to-many, new pages table
      - `tests/app/repairs.test.ts` — page rendering test
    - **Tests to Write:**
      - `Repairs page renders coming soon content`
      - `Repairs loading skeleton renders`
    - **Steps:**
      1. Write failing test for repairs page
      2. Create `/repairs` route with attractive "Coming Soon" placeholder: hero section, brief description, optional email signup for notifications
      3. Create loading skeleton
      4. Update DESIGN.md: add mega-menu component pattern, breadcrumbs pattern, updated category structure
      5. Update product-architecture.md: document category hierarchy, many-to-many junction table, new pages, updated homepage sections
      6. Run tests, `bun check`, `bun run build`

**Open Questions:** _(All resolved)_
1. ~~Shared subcategories~~ → Many-to-many junction table
2. ~~Electronics visibility~~ → Breadcrumb pathing only; subcategories remain top-level in nav
3. ~~Mega-menu style~~ → Full-width Reebelo-style panel
4. ~~Hot Deals timer~~ → Keep but make compact/inline
5. ~~Audio category~~ → New Audio parent with Earphones/Headphones/Speakers as children
