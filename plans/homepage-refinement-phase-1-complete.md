## Phase 1 Complete: Header & Navigation Polish

Implemented scroll-direction hide/show header, increased glassmorphism depth (16→24px blur), added sunken search input, restructured mobile nav icons, removed "Create Account" from mobile drawer, and made sign-in icon visible on all breakpoints.

**Files created/changed:**
- src/hooks/useScrollDirection.ts (NEW)
- src/app/globals.css
- src/components/layout/header.tsx
- src/components/layout/searchBar.tsx
- src/components/layout/mobileNav.tsx

**Functions created/changed:**
- useScrollDirection() — custom hook returning 'up' | 'down' with SCROLL_THRESHOLD = 10
- Header() — integrated scroll hook, glass-depth class, translate-y transition, desktop-only ThemeToggle
- SearchBar() — glass-search class applied
- MobileNav() — "Create Account" link removed

**Tests created/changed:**
- tests/hooks/useScrollDirection.test.ts (NEW) — 9 tests
- tests/components/layout/header.test.tsx — 12 tests
- tests/components/layout/mobileNav.test.tsx — 11 tests
- tests/components/layout/searchBar.test.tsx — 9 tests
- tests/app/globals.test.ts (NEW) — 7 tests

**Review Status:** APPROVED with revision applied (mobile sign-in icon visibility fix)

**Git Commit Message:**
```
feat: scroll-aware header and navigation polish

- Add useScrollDirection hook with 10px threshold
- Increase glass blur from 16px to 24px across all utilities
- Add glass-search (sunken inset shadow) and glass-depth (header depth) CSS classes
- Header hides on scroll down, shows on scroll up with smooth transition
- Restructure mobile header: hamburger+logo left, search+cart+user right
- Move ThemeToggle to desktop-only, keep in mobile drawer
- Remove "Create Account" link from mobile nav drawer
- Make sign-in icon visible on all breakpoints (not just desktop)
- Add 48 new tests (776 total, 0 fail)
```
