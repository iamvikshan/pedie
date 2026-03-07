## Plan: Centralize Design System

TL;DR: Audit-driven centralization of the Pedie design system -- fix broken tokens, create missing shared UI primitives, eliminate duplicate components, adopt primitives across all files, and unify animations + accessibility. Admin and storefront share a fully unified aesthetic.

**Phase Rationale:**
- Phase 1 first: tokens are literally broken (admin renders incorrectly). Must fix foundation before building on it.
- Phase 2 next: shared primitives must exist before we can adopt them in Phases 3-4.
- Phase 3 removes duplicate files to reduce surface area before mass-adoption in Phase 4.
- Phase 4 is the largest phase -- mechanically replacing inline patterns with shared primitives across all components.
- Phase 5 is the polish pass for motion consistency and accessibility compliance.

**Resolved Tooling:** pm: "bun" | format: "bun run f" | lint: "bun lint" | typecheck: "bunx tsc --noEmit" | test: "bun test" | fileNaming: "camelCase (files/modules/components) | PascalCase (component exports)" | iconLib: "react-icons/tb"

**Decisions:**
- Admin and storefront share a fully unified design system (tokens, primitives, aesthetics).
- `pedie-primary` does not exist as a concept. All usages replaced with `pedie-green`.

---

### Phases

1. **[x] Phase 1: Fix Broken + Add Missing Tokens**
   - **Changes from plan:** Found 12 files with pedie-primary (vs 8 expected) and 11 with bare pedie-muted (vs 9 expected) -- all fixed. Tests strengthened after review to validate tokens in both @theme and .dark blocks separately.

2. **[x] Phase 2: Create Shared UI Primitives**
   - **Changes from plan:** Used `Omit<..., 'size'>` on Input/Select to resolve HTML size attribute conflict. Added DOM attribute passthrough to Badge/Alert/Spinner/EmptyState after review. 52 tests total (vs ~30 planned).

3. **[x] Phase 3: Eliminate Duplicates**
   - **Changes from plan:** Filter sidebar consolidation scoped to extracting shared sub-components (CheckboxFilterGroup, PriceRangeFilter) rather than full merge -- full adoption deferred to Phase 4. Google SVG test uses dynamically-built string to avoid false grep matches.

4. **[x] Phase 4: Adopt Primitives + Fix Deviations**
   - **Changes from plan:** Scope expanded to 45 files (vs 25 planned) -- storefront color fixes, wishlist page cleanup, and additional bg-pedie-dark eliminations were pulled in to satisfy comprehensive guard tests. EmptyState adoption was completed in Phase 3. OrderStatusUpdater message typing made explicit instead of string-includes. Glass guard made symmetric for megaMenu/userMenu. DataTable already used rounded-lg (no change needed).

5. **[ ] Phase 5: Centralize Animations + Accessibility**
   - **Objective:** Create shared motion presets, unify Framer Motion usage, and fix all identified accessibility gaps.
   - **Files/Functions:**
     - Create `src/lib/motion.ts` -- export `fadeInUp`, `staggerContainer`, `staggerItem`, `slideIn` variants with consistent y-offsets and durations
     - Refactor 4+ components using duplicated whileInView configs to use shared variants (trustBadges, sustainabilitySection, customerFavorites, categoryShowcaseWrapper)
     - Replace MegaMenu CSS animation with Framer Motion AnimatePresence
     - Fix SidebarPanel spring config to be consistent with other overlays
     - Add `aria-hidden` to all 13 inline check/close SVGs (remaining after Phase 4 tb icon replacements)
     - Add `role='dialog'`, `aria-modal`, focus trap to search/filterSidebar mobile drawer
     - Add `aria-expanded` to catalog/filterSidebar mobile toggle
     - Upgrade UserMenu to `role='menu'` with proper focus management
   - **Tests to Write:**
     - Unit test: motion.ts exports correct variant shapes
     - Source analysis test: verify no raw `whileInView: { opacity: 1, y: 0 }` configs (should use shared variants)
     - Source analysis test: verify all inline SVGs have `aria-hidden="true"`
   - **Quality Gates:** bun run f -> bun lint -> bunx tsc --noEmit -> bun test
   - **Steps:**
     1. Write failing tests for motion presets and a11y attributes
     2. Create src/lib/motion.ts with shared animation variants
     3. Refactor components to use shared motion variants
     4. Replace MegaMenu CSS animation with Framer Motion
     5. Fix all aria-hidden, role, aria-expanded, focus-trap gaps
     6. Run quality gates

---

### Open Questions
*(Resolved)*
1. Admin aesthetic -> Fully unified with storefront (same tokens, same primitives, same aesthetic).
2. `pedie-primary` -> Does not exist. Replace all usages with `pedie-green` directly.
