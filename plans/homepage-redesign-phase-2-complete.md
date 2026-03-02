## Phase 2 Complete: Multi-Level Header, Footer & Navigation

Redesigned the global layout shell with a two-row glass-morphism header (Row 1: logo/search/icons, Row 2: category nav + "All Items" trigger), a right-sliding AllItemsPanel with rich content, Framer Motion MobileNav, Tabler icons throughout, mode-aware footer, and a reusable ErrorBoundary component. All review issues fixed: safe image fallback, sign-out error handling, group-hover underlines, mobile search accessibility, and token-consistent colors.

**Files created:**
- `src/components/ui/errorBoundary.tsx`
- `src/components/layout/categoryNav.tsx`
- `src/components/layout/allItemsPanel.tsx`

**Files rewritten:**
- `src/components/layout/header.tsx`
- `src/components/layout/searchBar.tsx`
- `src/components/layout/mobileNav.tsx`

**Files updated:**
- `src/components/layout/footer.tsx`
- `src/components/layout/footerNewsletterForm.tsx`
- `src/components/auth/userMenu.tsx`

**Functions created/changed:**
- `ErrorBoundary` — React class component with fallback prop and reset
- `CategoryNav` — Desktop Row 2 category links with active/hover underlines
- `CATEGORIES` — Exported constant array (6 items) for reuse
- `AllItemsPanel` — Right-sliding Framer Motion panel with categories/images, collections, brands, support links, focus trap
- `Header` — Two-row glass header (Row 1: logo + SearchBar + cart/user/theme, Row 2: CategoryNav + All Items button)
- `SearchBar` — Glass-styled input with TbSearch, responsive expand/collapse
- `MobileNav` — Framer Motion slide-from-left drawer with category grid, Tabler icons, ThemeToggle
- `Footer` — bg-pedie-surface (mode-aware), glass payment badges
- `FooterNewsletterForm` — Glass-styled input
- `UserMenu` — Tabler icons for dropdown items, glass dropdown, error-handled sign-out

**Tests created/changed:**
- `tests/components/layout/categoryNav.test.tsx` (3 tests: export, 6 categories, name+href)
- `tests/components/layout/allItemsPanel.test.tsx` (1 test: export)
- `tests/components/layout/mobileNav.test.tsx` (1 test: export)
- `tests/components/layout/searchBar.test.tsx` (1 test: export)
- `tests/components/ui/errorBoundary.test.tsx` (1 test: export)
- `tests/components/layout/header.test.tsx` (+1 test: categoryNav import)

**Review Status:** APPROVED (after fixes for image fallback, sign-out error handling, hover underlines, search accessibility, token colors)

**Git Commit Message:**
```
feat: multi-level glass header, nav panels & error boundary

- Two-row glass header: logo/search/icons (Row 1), categories/All Items (Row 2)
- AllItemsPanel: right-sliding Framer Motion panel with categories, collections, brands
- MobileNav: Framer Motion drawer with category grid, Tabler icons, ThemeToggle
- SearchBar: glass input with TbSearch, responsive expand/collapse
- CategoryNav: desktop category links with active/hover underlines
- Footer: mode-aware bg-pedie-surface, glass payment badges
- UserMenu: Tabler icons for dropdown items, glass dropdown
- ErrorBoundary: reusable React class component with fallback and reset
- 8 new tests (703 total, 0 fail)
```
