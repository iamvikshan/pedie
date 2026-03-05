## Plan: Storefront Overhaul — Bugs, Categories, Navigation, Header, Shop & Homepage

Comprehensive overhaul: carousel/brands bugs → category hierarchy with M2M → mega-menu navigation with breadcrumbs → header responsive redesign with unified sidebar → `/shop` page with category filtering → homepage redesign → placeholder pages (Repair, Trade In) → docs. All DB changes via Supabase MCP migrations.

**Resolved Tooling:** `{ pm: "bun", format: "bun run f", lint: "bun lint", typecheck: "tsc --noEmit", test: "bun test", build: "bun run build", check: "bun check" }`
**Agent Conventions:** See `AGENTS.md` for full tooling, quality gate workflow, and coding conventions.

**Phase Count Rationale:**

- Phase 1 (Bugs): Self-contained UI fixes with zero DB dependency — quick wins that unblock user testing
- Phase 2 (DB Migration): Must land before any nav/homepage work; creates the category hierarchy + junction table that all subsequent phases depend on
- Phase 3 (Navigation): Depends on Phase 2's category tree for mega-menu and breadcrumbs
- Phase 4 (Header + Responsive): Largest UI overhaul — breakpoints, layout restructuring, unified sidebar, placeholder pages. All tightly coupled to the header
- Phase 5 (Shop + Collections Fix): The `/shop` page + breadcrumb rework + fixing collections descendant bug are category-routing concerns that depend on Phase 4's nav being stable
- Phase 6 (Homepage): Depends on Phase 4's header/nav being settled (card sizing, Hot Deals, category showcases)
- Phase 7 (Docs): Captures everything from Phases 1-6 in documentation

**Phases: 7**

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

2. **✅ Phase 2: Category Hierarchy DB Migration + Many-to-Many**
   - **Changes from plan:** Added cycle protection (visited sets) to `getCategoryBreadcrumb` and `getCategoryAndDescendantIds` per review feedback. Fixed `ProductCategory.created_at` type to `string | null`. Made migration policies idempotent with `DROP POLICY IF EXISTS`. Added `CategoryWithChildren` type to `types/product.ts`. Test file at `tests/data/categories.test.ts`.
   - **Post-phase fixes:**
     - Created `AGENTS.md` with full tooling, quality gate workflow (`f:changed` → `check` → `test`), and coding conventions (source-analysis tests, MCP migrations, sync verification, breaking-changes-welcome policy)
     - Added `f:changed` script to `package.json` — formats only git-changed files instead of entire repo
     - Fixed `src/lib/sheets/sync.ts` `findOrCreateProduct` — replaced flat `upsert` (which created orphan categories) with hierarchy-aware select-first, insert-under-Electronics-root pattern
     - Added Gaming category + 3 subcategories (Consoles, Handhelds, Accessories) to `scripts/seed.ts`, migration SQL, and live DB
     - Added 10 new products (4 Gaming, 3 Audio, 2 Cameras) and 17 listings to seed data for homepage/menu testing
     - Sync verification: confirmed `findOrCreateProduct` logic compatible with hierarchy; all 1083 tests passing
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

3. **✅ Phase 3: Header Navigation — Mega-Menu, Deals Link, Breadcrumbs**
   - **Changes from plan:** Instead of converting `header.tsx` to a server component, created a new `headerWrapper.tsx` server component that fetches categories and passes to client `Header`. The `header.tsx` remains a client component accepting props. Added `gaming` to CATEGORY_IMAGES fallback in mobileNav. MegaMenu uses CSS animation (`animate-in`) instead of framer-motion. Tests went from 1083 → 1114 (+31 new tests).
   - **Objective:** Replace hardcoded category nav with DB-driven mega-menu (Reebelo-style full-width panel), add `/deals` with flame icon and `/repairs` link, create visible Breadcrumbs UI component for all dynamic store pages
   - **Files/Functions to Modify/Create:**
     - `src/components/layout/categoryNav.tsx` — remove hardcoded `CATEGORIES` export, refactor to accept categories as props from parent; add mega-menu hover trigger per category
     - `src/components/layout/megaMenu.tsx` — **new** full-width overlay panel showing subcategories in columns grouped by parent (Reebelo-style), uses `pedie-card`/`pedie-glass` tokens
     - `src/components/layout/header.tsx` — convert to server component wrapper that fetches `getTopLevelCategories()` + `getCategoryTree()`, passes data to client children; add `/deals` link (TbFlame, amber) and `/repairs` link (TbTool) to Row 2
     - `src/components/ui/breadcrumbs.tsx` — **new** reusable Breadcrumbs component (`Home / Electronics / Laptops`), accepts `segments: {name, href}[]`, last segment is plain text
     - `src/app/(store)/collections/[slug]/page.tsx` — integrate visual Breadcrumbs via `getCategoryBreadcrumb()`
     - `src/app/(store)/products/[slug]/page.tsx` — integrate visual Breadcrumbs
     - `src/app/(store)/listings/[listingId]/page.tsx` — integrate visual Breadcrumbs
     - `src/components/layout/allItemsPanel.tsx` — remove `CATEGORIES` import, accept categories as props from header
     - `src/components/layout/mobileNav.tsx` — remove hardcoded `MOBILE_CATEGORIES`, accept categories as props, add `/repairs` to quick links
     - `tests/components/ui/breadcrumbs.test.ts` — breadcrumb rendering tests
     - `tests/components/layout/megaMenu.test.ts` — mega-menu structure tests
     - `tests/components/layout/categoryNav.test.tsx` — update for DB-driven nav (no hardcoded CATEGORIES)
     - `tests/components/layout/header.test.tsx` — add Deals/Repairs link tests
     - `tests/components/layout/mobileNav.test.tsx` — update for props-based categories + Repairs
     - `tests/components/layout/allItemsPanel.test.tsx` — update for props-based categories
   - **Tests to Write:**
     - `Breadcrumbs renders path segments with correct links`
     - `Breadcrumbs last segment is not a link`
     - `Breadcrumbs uses ChevronRight separator`
     - `MegaMenu renders subcategory columns`
     - `MegaMenu uses correct pedie- design tokens`
     - `CategoryNav no longer exports hardcoded CATEGORIES`
     - `CategoryNav includes mega-menu trigger`
     - `Header includes Deals link with TbFlame icon`
     - `Header includes Repairs link with TbTool icon`
     - `MobileNav accepts categories prop`
     - `MobileNav renders Repairs in quick links`
     - `AllItemsPanel no longer imports CATEGORIES from categoryNav`
   - **Steps:**
     1. Write failing tests for new Breadcrumbs component, MegaMenu, updated CategoryNav, Header, MobileNav, and AllItemsPanel
     2. Create `src/components/ui/breadcrumbs.tsx` — server component accepting `segments: {name: string, href: string}[]`, renders `Home > Segment > ...` with ChevronRight separator, last segment as plain text
     3. Create `src/components/layout/megaMenu.tsx` — client component, full-width panel with subcategory columns per parent, uses pedie design tokens, appears on hover
     4. Refactor `categoryNav.tsx` — remove `CATEGORIES` export, accept categories as props, delegate interactivity (hover, active, mega-menu trigger) to client component
     5. Refactor `header.tsx` — add `headerWrapper.tsx` server wrapper (fetches categories from DB) passing data to client `Header` component; add Deals link (`/deals`, TbFlame, amber) and Repairs link (`/repairs`, TbTool) to Row 2; update `src/app/layout.tsx` to use `HeaderWrapper`
     6. Update `mobileNav.tsx` — remove hardcoded `MOBILE_CATEGORIES`, accept categories as props from parent layout, add `/repairs` to quick links
     7. Update `allItemsPanel.tsx` — remove `CATEGORIES` import from `categoryNav`, accept categories as props
     8. Integrate visual `Breadcrumbs` into collection, product, and listing pages using `getCategoryBreadcrumb()`
     9. Update all existing tests for changed components
     10. Run quality gates: `bun run f && bun check && bun test`

4. **[x] Phase 4: Header & Responsive Overhaul + Placeholder Pages**
   - **Changes from plan:** SearchBar `md:` → `lg:` breakpoints also updated for consistency (not originally listed). AllItemsPanel fully deleted (replaced by SidebarPanel). MobileNav refactored to thin wrapper (37 lines, down from 350). No `getRandomBrands()` helper needed — SidebarPanel imports brands.json directly (only 6 brands). Tests: 1114 → 1123 (+9 net: +29 new, -20 deleted with AllItemsPanel).
   - **Objective:** Restructure header layout, fix breakpoints to match Reebelo (desktop→mobile at `lg:` 1024px instead of `md:` 768px), rearrange nav Row 2 (All Items left → Deals → categories), redesign Row 1 top-header actions with icon+text stacked pattern, build unified `SidebarPanel` (shared mobile/desktop with conditional account+theme), expand mobile search bar, fix mega-menu hover inconsistency, create Trade In + Repair placeholder pages
   - **Files/Functions to Modify/Create:**
     - `src/components/layout/header.tsx` — Row 1: right-side actions become icon+text stacked (flex-col, text below icon, text hidden below `lg:`); order from right: theme (icon only), sign-in/account (icon + text), cart (icon + text), repair (icon + text), trade-in (icon + text). Row 2: All Items moves to left, then Deals link, then CategoryNav. Switch all `md:` responsive prefixes to `lg:`. Mobile: show expanded centered SearchBar (reuse existing component) instead of icon-only
     - `src/components/layout/categoryNav.tsx` — Remove animated underline `span` and `group`/`relative` classes; use `hover:text-pedie-green transition-colors` to match rest of Pedie. Reduce font from `text-sm` (14px) to `text-xs` (~12px, matches Reebelo's 12.8px). Add `px-3` horizontal padding
     - `src/components/layout/sidebarPanel.tsx` — **New** unified sidebar replacing both AllItemsPanel and MobileNav drawer. Contents: Hot Deals static banner card (image + "Shop Deals" CTA), inline quick links row (New Arrivals, Best Sellers, Trade In, Repairs — no Deals since banner covers it), Top Brands section (6 random from DB with images), category grid with "See All" button (links to `/shop`). Conditional bottom bar: mobile shows account icon+text (left) + theme toggle icon (right); desktop hides these
     - `src/components/layout/allItemsPanel.tsx` — Remove (replaced by SidebarPanel)
     - `src/components/layout/mobileNav.tsx` — Refactor to thin wrapper: hamburger button trigger only, delegates to SidebarPanel
     - `src/components/layout/megaMenu.tsx` — No functional changes needed; verify hover consistency
     - `src/components/layout/searchBar.tsx` — Ensure works when rendered expanded (not icon-only) on mobile header bar
     - `src/app/(store)/repairs/page.tsx` — New placeholder "Coming Soon" page
     - `src/app/(store)/trade-in/page.tsx` — New placeholder "Coming Soon" page
     - `src/lib/data/categories.ts` — Add `getRandomBrands(limit: number)` or similar for sidebar Top Brands
     - Tests: categoryNav, header, sidebarPanel, mobileNav, repairs page, trade-in page
   - **Tests to Write:**
     - `CategoryNav uses text-xs font size, no underline span`
     - `CategoryNav hover uses transition-colors only (no animated underline)`
     - `Header Row 1 has icon+text stacked actions (theme, sign-in, cart, repair, trade-in)`
     - `Header Row 1 text labels hidden below lg breakpoint`
     - `Header Row 2 order: All Items (left), Deals, then categories`
     - `Header uses lg: breakpoint for desktop/mobile toggle`
     - `SidebarPanel renders Hot Deals static banner with CTA`
     - `SidebarPanel renders inline quick links (Trade In, New Arrivals, Best Sellers, Repairs)`
     - `SidebarPanel renders Top Brands section`
     - `SidebarPanel renders category grid with See All button linking to /shop`
     - `SidebarPanel mobile variant shows account + theme at bottom`
     - `SidebarPanel desktop variant hides account + theme`
     - `Repairs page renders coming soon content`
     - `Trade In page renders coming soon content`
     - `Mobile header shows expanded centered search bar`
   - **Steps:**
     1. Write failing tests for all changes
     2. Fix categoryNav hover: remove underline `span`, remove `group`/`relative`, add `hover:text-pedie-green transition-colors`; change `text-sm` to `text-xs`; add `px-3` padding
     3. Restructure header Row 1 right-side actions: icon+text stacked (flex-col, items-center). Order from right: theme (icon only), sign-in/account, cart, repair, trade-in. Text hidden below `lg:`
     4. Restructure header Row 2: move All Items trigger to left, then Deals link, then CategoryNav
     5. Switch all `md:` breakpoints to `lg:` across header, categoryNav, mobileNav
     6. Build `SidebarPanel` component: unified sidebar with Hot Deals banner, inline quick links, Top Brands (DB-driven), category grid + "See All" link to `/shop`. Conditional mobile-only bottom bar
     7. Refactor mobileNav to thin hamburger trigger delegating to SidebarPanel
     8. Remove allItemsPanel (replaced by SidebarPanel)
     9. Mobile header: render expanded centered SearchBar (reuse existing component, not icon-only)
     10. Create `/repairs` and `/trade-in` Coming Soon placeholder pages
     11. Run quality gates: `bun run f && bun check && bun test`

5. **[ ] Phase 5: Shop Page + Collections Descendant Fix + Breadcrumb Rework**
   - **Objective:** Create `/shop` as the "browse all products" page with category filtering, fix the collections descendant-category bug (`/collections/electronics` shows no products because `getFilteredListings` uses `.eq()` instead of `.in()` with descendant IDs), and rework all breadcrumbs to root at `Shop` instead of `Home` (logo already navigates to `/`)
   - **Files/Functions to Modify/Create:**
     - `src/app/(store)/shop/page.tsx` — New page: all-products grid with category filter in sidebar. Reuses FilterSidebar + ProductGrid. Equivalent to Reebelo's `/collections/electronics/...` view
     - `types/filters.ts` — Add optional `category: string[]` to `ListingFilters`; add `categories` to `AvailableFilters`
     - `src/lib/data/listings.ts` — **Bug fix**: `getFilteredListings()` change `.eq('product.category_id', categoryId)` to `.in('product.category_id', categoryIds)` using `getCategoryAndDescendantIds()`. Same fix for `getAvailableFilters()`. Add cross-category query support for `/shop` (no category slug = all products)
     - `src/lib/data/categories.ts` — Add `getAllTopLevelCategoriesWithCounts()` for shop page filter sidebar
     - `src/components/catalog/filterSidebar.tsx` — Add expandable category tree filter section (shown when on `/shop`; hidden on `/collections/[slug]` since category is already selected)
     - `src/components/ui/breadcrumbs.tsx` — Update: root segment becomes `Shop` linking to `/shop` (instead of `Home` linking to `/`). No other code changes needed
     - `src/app/(store)/collections/[slug]/page.tsx` — Update breadcrumb trail to `Shop > {category trail}`
     - `src/app/(store)/products/[slug]/page.tsx` — Update breadcrumb to include `Shop` root
     - `src/app/(store)/listings/[listingId]/page.tsx` — Update breadcrumb to include `Shop` root
     - `src/components/layout/sidebarPanel.tsx` — Update "See All" categories button to link to `/shop`
     - Tests: listings data fix, shop page, breadcrumbs, filter sidebar
   - **Tests to Write:**
     - `getFilteredListings includes products from descendant categories`
     - `getAvailableFilters includes filters from descendant categories`
     - `Shop page renders all products with category filter in sidebar`
     - `Breadcrumbs root segment is Shop linking to /shop`
     - `ListingFilters type supports optional category array`
     - `FilterSidebar shows category tree on /shop`
     - `FilterSidebar hides category filter on /collections/[slug]`
   - **Steps:**
     1. Write failing tests for descendant fix, shop page, and breadcrumb changes
     2. Fix `getFilteredListings`: resolve category slug → ID → `getCategoryAndDescendantIds()` → `.in('product.category_id', categoryIds)` (was `.eq()`)
     3. Fix `getAvailableFilters`: same descendant resolution
     4. Add `category` field to `ListingFilters` and `AvailableFilters` types
     5. Add expandable category tree filter to FilterSidebar (conditional: only on `/shop`)
     6. Create `/shop` page with all-products view, category filter, sort, pagination
     7. Update breadcrumb root across all store pages: `Shop` → `/shop` instead of `Home` → `/`
     8. Update SidebarPanel "See All" → `/shop`
     9. Run quality gates

6. **[ ] Phase 6: Homepage Redesign — All Categories, Smaller Cards, Hot Deals**
   - **Objective:** Show all DB categories on homepage, reduce card sizes by ~15%, redesign Hot Deals to be cleaner/more aligned with pedie tokens
   - **Files/Functions to Modify/Create:**
     - `src/app/page.tsx` — Dynamically render CategoryShowcase for all top-level categories from DB
     - `src/components/ui/productCard.tsx` — Reduce sizing (min-w, max-w, padding, font sizes ~15%)
     - `src/components/ui/productFamilyCard.tsx` — Same sizing reduction
     - `src/components/home/hotDeals.tsx` — Redesign: compact inline timer, cleaner gradient, pedie tokens
     - `src/components/home/categoryShowcase.tsx` — Adjust card widths to match new sizing
     - `src/components/skeletons/productCardSkeleton.tsx` — Match new sizing
     - `src/components/skeletons/productFamilyCardSkeleton.tsx` — Match new sizing
     - Tests: card sizing, hot deals, homepage sections
   - **Tests to Write:**
     - `ProductCard renders with reduced dimensions`
     - `ProductFamilyCard renders with reduced dimensions`
     - `HotDeals timer renders inline with products`
     - `Homepage renders CategoryShowcase for each top-level category`
   - **Steps:**
     1. Write failing tests for new card sizes and homepage sections
     2. Reduce card sizes globally: scale min-w, max-w, padding, fonts ~15%
     3. Update skeleton components to match new dimensions
     4. Redesign HotDeals: compact timer, less amber glow, pedie tokens, keep countdown inline/smaller
     5. Refactor `page.tsx` to dynamically fetch top-level categories and render CategoryShowcase for each
     6. Run quality gates

7. **[ ] Phase 7: Docs Update**
   - **Objective:** Update DESIGN.md and product-architecture.md to capture all changes from Phases 1-6
   - **Files/Functions to Modify/Create:**
     - `docs/DESIGN.md` — Add: mega-menu pattern, breadcrumbs pattern, SidebarPanel pattern, header stacked-actions pattern, responsive breakpoint strategy (lg: 1024px), new page routes (/shop, /repairs, /trade-in)
     - `docs/product-architecture.md` — Update: category hierarchy docs, M2M junction table, new pages table, shop page with category filter, breadcrumb rework, collections descendant fix
     - `tests/docs/design.test.ts` — Docs completeness tests
   - **Tests to Write:**
     - `DESIGN.md documents mega-menu component pattern`
     - `DESIGN.md documents SidebarPanel pattern`
     - `product-architecture.md documents category hierarchy`
     - `product-architecture.md documents /shop page`
   - **Steps:**
     1. Write failing tests for docs completeness
     2. Update DESIGN.md with new component patterns, breakpoint strategy, routes
     3. Update product-architecture.md with category hierarchy, new pages, shop filter
     4. Run quality gates + `bun run build`

**Open Questions:** _(All resolved)_

1. ~~Shared subcategories~~ → Many-to-many junction table
2. ~~Electronics visibility~~ → Breadcrumb pathing only; subcategories remain top-level in nav
3. ~~Mega-menu style~~ → Full-width Reebelo-style panel
4. ~~Hot Deals timer~~ → Keep but make compact/inline
5. ~~Audio category~~ → New Audio parent with Earphones/Headphones/Speakers as children
6. ~~Collections electronics empty~~ → Bug: `.eq()` → `.in()` with descendant IDs
7. ~~Sidebar merge~~ → Unified `SidebarPanel` (shared mobile/desktop)
8. ~~Store page URL~~ → `/shop`
9. ~~CategoryNav hover~~ → Remove underline, use `hover:text-pedie-green transition-colors`
10. ~~Top Brands~~ → 6 random from DB with images
11. ~~Hot Deals sidebar~~ → Static banner + "Shop Deals" CTA
12. ~~Breadcrumb root~~ → `Shop > ...` (no Home; logo navigates to `/`)
