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

2. **[x] Phase 2: Data Access Layer Rewrite**
   - **Objective:** Rewrite `src/lib/data/*` queries for the new schema
   - **Summary:** Rewrote all data access layer queries, types, and helpers. 48 files modified. All public queries use `.eq('status', 'active')` (security fix from review). Brand filtering uses slugs consistently, with pre-resolved product IDs for count queries. Admin notes normalized to string[]. Deleted `deals.ts` -- promotion listing logic inlined in `listings.ts` as `getPromotionListings()` / `getHotPromotionListings()`. 1274 tests pass.
   - **Changes from plan:** Status filter initially used old `.not('status')` pattern -- fixed during review. Brand filter mismatch between available filters (names) and data queries (slugs) -- fixed. Brand count query: pre-resolve brand slugs to product IDs instead of unsupported nested relation filter on head/count queries (both listings.ts and search.ts). Admin notes scalar-to-array conversion added at API boundary. `getPricingTier()` returns `'sale'|'regular'|'premium'` -- will be removed in Phase 5 (cards handle display). `deals.ts` deleted and promotion logic moved to `listings.ts` (Phase 3 promotions data layer will extend this, not create a separate file). `bun check` gate skipped -- remaining errors are Phase 5 consumer files. Storefront consumer propagation deferred to Phase 5.
   - **Completion:** [Phase 2 details](.zeus/plans/db-overhaul-phase-2-complete.md)

3. **[ ] Phase 3: Sync Pipeline & Promotions Data Layer**
   - **Objective:** Expand Google Sheets sync for brands, categories, promotions. Update listing sync for new schema. Comment out crawlers. Extend promotion listings in `listings.ts` to query the `promotions` table for all types.
   - **Files/Functions:**
     - `src/lib/data/listings.ts` -- extend existing `fetchPromotionListings()` / `getPromotionListings()` / `getHotPromotionListings()` to query the `promotions` table, resolve targets (product/category/brand), compute effective pricing across all promotion types (flash_sale, clearance, seasonal, bundle). Currently uses simple `sale_price_kes IS NOT NULL` logic. NOTE: `deals.ts` already deleted in Phase 2.
     - `src/lib/sheets/sync.ts` -- updated for new schema, new sheet pages
     - `src/lib/sheets/parser.ts` -- updated SheetRow type for new fields
     - `scripts/sheets.ts` -- entry point updates
     - `scripts/seed.ts` -- updated for new schema
     - `scripts/crawlers/*.ts` -- comment out all crawler code
     - `src/lib/sync/conditionMapping.ts` -- add 'new' and 'for_parts' mappings
     - New sheets: Brands, Categories, Promotions (alongside existing Listings)
   - **Tests to Write:**
     - Promotions data layer: getActivePromotions returns only date-valid promotions
     - Promotions data layer: getPromotionListings resolves targets across all promotion types
     - Promotions data layer: effective price computation applies discount_pct correctly
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
   - **Objective:** Update all frontend components for the new schema. Remove `getPricingTier()` (cards handle display). Align card/component naming with glossary.
   - **Files/Functions:**
     - `src/helpers/pricing.ts` -- remove `getPricingTier()` and `PricingTier` type entirely (cards decide what to display based on `sale_price_kes` presence)
     - `src/components/catalog/*` -- filter sidebar (new column names, promotions)
     - `src/components/listing/*` -- SKU display, notes/includes sections, new pricing
     - `src/components/home/*` -- promotions section (was deals), featured section
     - `src/components/ui/productCard.tsx` -- promotion badges, inline sale/regular display logic
     - `src/components/ui/productFamilyCard.tsx` -- updated pricing, glossary-aligned naming
     - `src/lib/cart/store.ts` -- SKU references instead of listing_id
     - `src/lib/cart/validation.ts` -- updated validation
     - `src/components/admin/listingForm.tsx` -- new fields (includes, notes array, admin_notes, warranty, attributes)
     - `src/components/admin/productForm.tsx` -- brand_id select, product_categories
     - `src/components/admin/categoryForm.tsx` -- icon field
     - URL routes: `/listings/[sku]` replaces `/listings/[listingId]`
     - Card/component glossary: align productCard/productFamilyCard naming with Product/Listing/ProductFamily terminology
   - **Tests to Write:**
     - Product card renders promotion badges from promotions data
     - Card display logic: sale_price_kes presence drives sale badge + strikethrough
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
