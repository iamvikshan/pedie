## Plan: Database Centralization & Overhaul

Overhaul the Pedie database schema from a phone-centric PoC to an industry-standard, category-agnostic e-commerce schema. Introduces SKU system, promotions table, brand normalization, flexible listing attributes, username-based auth, and Google Sheets sync expansion. All breaking changes -- no backward compatibility.

**Phase Rationale:**
- Phase 1 must land first: all subsequent code depends on the new schema
- Phase 2 (data layer) must follow immediately: the app won't compile without updated queries
- Phase 3 (sync pipeline) can run independently once the schema exists
- Phase 4 (auth + users) is decoupled from catalog concerns
- Phase 5 (frontend) depends on phases 1-3 being complete
- Phase 6 (types + tests + docs) is the final validation pass

**Resolved Tooling:** pm: "bun" | format: "bun run f" | lint: "bun check" | typecheck: "bunx tsc --noEmit" | test: "bun test" | fileNaming: "camelCase (files) | PascalCase (exports)" | iconLib: "react-icons/tb"

**Reference:** [docs/database-architecture.md](../docs/database-architecture.md)

---

### Phases

1. **[x] Phase 1: Schema Migration**
   - **Objective:** Replace the old schema with the new one via a single Supabase migration
   - **Summary:** Removed 13 old migration files, created single unified migration `20250800000000_schema.sql` with 7 enums, 16 tables, 10 functions, 12 triggers, 24 indexes, 37 RLS policies. Applied to live Supabase. Updated seed script and RLS tests. Regenerated TypeScript types.
   - **Changes from plan:** Added `promotions` CHECK constraints (target required, flash_sale needs discount). Added brand FTS cascade trigger. Added `sku` column DEFAULT for TS ergonomics. Policy names use `snake_case` naming convention instead of quoted descriptive names. `types/database.ts` regenerated in this phase (originally planned for Phase 6).
   - **Completion:** [Phase 1 details](.zeus/plans/db-overhaul-phase-1-complete.md)

2. **[ ] Phase 2: Data Access Layer Rewrite**
   - **Objective:** Rewrite `src/lib/data/*` queries for the new schema
   - **Files/Functions:**
     - `src/lib/data/products.ts` -- brand join, product_categories, is_active filter
     - `src/lib/data/listings.ts` -- SKU-based lookups, new pricing model, attributes
     - `src/lib/data/categories.ts` -- use `get_category_descendants()` RPC instead of BFS
     - `src/lib/data/deals.ts` -- query promotions table instead of status='onsale'
     - `src/lib/data/brands.ts` -- reference brands table via FK
     - `src/lib/data/search.ts` -- updated FTS with brand name inclusion
     - `src/lib/data/admin.ts` -- updated for new schema
     - `types/product.ts` -- updated types (Listing.sku, Product.brand_id, Product.name, etc.)
     - `types/filters.ts` -- updated filter types
     - `types/database.ts` -- regenerated from Supabase
   - **Tests to Write:**
     - Product queries return brand name from joined brands table
     - Category descendant queries use RPC, not BFS
     - Deals/promotions queries check active date range
     - Listing filters work with new column names
     - SKU-based listing lookup works
   - **Quality Gates:** `bun check` -> `bun test`

3. **[ ] Phase 3: Sync Pipeline & Sheets Expansion**
   - **Objective:** Expand Google Sheets sync for brands, categories, promotions. Update listing sync for new schema. Comment out crawlers.
   - **Files/Functions:**
     - `src/lib/sheets/sync.ts` -- updated for new schema, new sheet pages
     - `src/lib/sheets/parser.ts` -- updated SheetRow type for new fields
     - `scripts/sheets.ts` -- entry point updates
     - `scripts/seed.ts` -- updated for new schema
     - `scripts/crawlers/*.ts` -- comment out all crawler code
     - `src/lib/sync/conditionMapping.ts` -- add 'new' and 'for_parts' mappings
     - New sheets: Brands, Categories, Promotions (alongside existing Listings)
   - **Tests to Write:**
     - Parser handles new fields (includes, admin_notes, warranty_months)
     - Condition mapping covers new enum values
     - Sync upserts brands by slug correctly
     - Sync creates product_categories with is_primary
     - SKU auto-generation works during sync
   - **Quality Gates:** `bun check` -> `bun test` -> `bun syncsheets` (dry run)

4. **[ ] Phase 4: Auth & User Management**
   - **Objective:** Username login support, signup form update (remove full_name), admin user management page
   - **Files/Functions:**
     - `src/components/auth/signupForm.tsx` -- remove full_name, add username field
     - `src/components/auth/signinForm.tsx` -- "Username or email" field, resolve_username RPC
     - `src/lib/auth/*.ts` -- username resolution logic
     - `src/app/(admin)/admin/users/page.tsx` -- new admin users page
     - `src/components/admin/userManagement.tsx` -- DataTable with role assignment, user detail
     - DB: `resolve_username()` RPC function
   - **Tests to Write:**
     - Username validation regex rejects invalid inputs
     - Reserved username list blocks impersonation
     - Login form detects email vs username input
     - Admin users page renders user list
     - Role assignment updates profile
   - **Quality Gates:** `bun check` -> `bun test`

5. **[ ] Phase 5: Frontend Adaptation**
   - **Objective:** Update all frontend components for the new schema
   - **Files/Functions:**
     - `src/components/catalog/*` -- filter sidebar (new column names, promotions)
     - `src/components/listing/*` -- SKU display, notes/includes sections, new pricing
     - `src/components/home/*` -- deals section queries promotions, featured section
     - `src/components/ui/productCard.tsx` -- promotion badges, new pricing tier logic
     - `src/components/ui/productFamilyCard.tsx` -- updated pricing
     - `src/helpers/pricing.ts` -- refactor getPricingTier() for promotions
     - `src/lib/cart/store.ts` -- SKU references instead of listing_id
     - `src/lib/cart/validation.ts` -- updated validation
     - `src/components/admin/listingForm.tsx` -- new fields (includes, notes array, admin_notes, warranty, attributes)
     - `src/components/admin/productForm.tsx` -- brand_id select, product_categories
     - `src/components/admin/categoryForm.tsx` -- icon field
     - URL routes: `/listings/[sku]` replaces `/listings/[listingId]`
   - **Tests to Write:**
     - Pricing tier logic with promotions
     - Product card renders promotion badges
     - Listing detail shows notes/includes when present
     - Cart validation uses SKU
     - Admin forms include new fields
   - **Quality Gates:** `bun run f` -> `bun check` -> `bun test`

6. **[ ] Phase 6: Types, Tests & Documentation**
   - **Objective:** Regenerate database types, comprehensive test pass, update documentation
   - **Files/Functions:**
     - `types/database.ts` -- regenerated from Supabase
     - `types/product.ts` -- final alignment with new schema
     - `types/order.ts` -- variant_summary, quantity
     - `docs/DESIGN.md` -- update color/component docs if any tokens changed
     - `docs/product-architecture.md` -- update data model section, listing types, card behavior
     - `docs/database-architecture.md` -- verify accuracy after implementation
     - Test files across `tests/` -- fix any remaining failures
   - **Tests to Write:**
     - Full regression: `bun test` passes all tests
     - Source analysis: SKU format validation
     - Type compatibility: no TypeScript errors
   - **Quality Gates:** `bun check` -> `bun test` -> `bun run build`

---

### Open Questions
(none -- all resolved during planning)

### Recommendations
- Add a `promotions` sheet to Google Sheets to manage deals alongside admin UI
- Consider adding `created_by` (uuid FK to profiles) on promotions for audit trail
- Future: Admin dashboard charts for promotion performance (conversion rate, revenue impact)
- Future: Bulk SKU import/export for inventory management
- Future: Product variant matrix (auto-generate listing combinations from product specs)
