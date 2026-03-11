## Phase 6 Complete: Documentation & Build Validation

Updated all architecture documentation to reflect the full database overhaul (phases 1-5C). Verified database-architecture.md was already accurate. Build validation skipped due to pre-existing missing Supabase environment variables in the dev container.

**Details:**

- Rewrote product-architecture.md with complete schema documentation: brand_id FK, product.name field, junction-table categories (product_categories with is_primary), SKU system with trigger format, inline isSale pricing model (distinguishing SQL COALESCE from UI isSale guard), promotions table, listing statuses, and corrected ProductFamily type (ProductWithBrand, Listing[], Listing)
- Added inline pricing section to DESIGN.md with isSale code pattern and pricing state table
- Updated DESIGN.md route table to reference /listings/[sku] instead of [listingId]
- database-architecture.md verified accurate against schema -- no changes needed
- Atlas fixed two inaccuracies caught by Sentry: pricing model description (was `??`, corrected to dual-layer COALESCE/isSale) and ProductFamily interface types (was Product/ListingWithProduct, corrected to ProductWithBrand/Listing)

**Deviations from plan:**

- Build validation (`bun run build`) skipped -- pre-existing missing SUPABASE_URL and SERVICE_ROLE_KEY in dev container (sitemap prerender requires them). Verified failure also occurs on clean main branch. Not introduced by any overhaul phase.

**Files modified:**

- [product-architecture.md](/workspaces/pedie/docs/product-architecture.md) -- Major rewrite with all schema changes
- [DESIGN.md](/workspaces/pedie/docs/DESIGN.md) -- Added inline pricing section, updated route table

**Review Status:** Sentry APPROVED (2 iterations -- first flagged pricing desc and ProductFamily type, both fixed)

**Git Commit Message:**

```
docs: update architecture docs for database overhaul

- Rewrite product-architecture.md with full schema changes
- Add inline isSale pricing model documentation
- Update DESIGN.md with pricing section and [sku] routes
- Fix ProductFamily type to match actual types/product.ts
```
