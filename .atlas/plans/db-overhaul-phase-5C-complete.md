## Phase 5C Complete: Catalog, Admin, Account & Dead Code Sweep

Updated all remaining storefront, admin, and account components for the new database schema. Removed broken `getPricingTier` imports from UI cards. Achieved zero `bun check` errors and full test suite passing (1249 tests).

**Details:**

- UI cards: Replaced `getPricingTier` with inline `isSale` logic, derived `effectivePrice` from sale state
- Catalog: Removed `carrier` from filters, updated product grid keys to `listing.id`
- Admin APIs: Made product_categories sync non-destructive (upsert instead of delete-all), added PUT validation parity
- Admin forms/columns: Updated for `brand_id`, `product.name`, `brand.name`, `sku`
- Account: Wishlist updated with defensive brand access
- Storefront: Shop and collections pages cleaned of carrier references
- Tests: 16 test files updated with new schema mock shapes

**Deviations from plan:**

- Admin product_categories sync required non-destructive upsert pattern (not just field name removal)
- Added PUT validation parity for admin listings API as security improvement
- customerFavorites.tsx needed only type-level fix, not behavioral rewrite

**Files modified:**

- [src/components/ui/productCard.tsx](/workspaces/pedie/src/components/ui/productCard.tsx) -- inline isSale, effectivePrice, sku/brand.name
- [src/components/ui/productFamilyCard.tsx](/workspaces/pedie/src/components/ui/productFamilyCard.tsx) -- same
- [src/components/catalog/filterSidebar.tsx](/workspaces/pedie/src/components/catalog/filterSidebar.tsx) -- removed carrier
- [src/components/catalog/activeFilters.tsx](/workspaces/pedie/src/components/catalog/activeFilters.tsx) -- removed carrier
- [src/components/catalog/productGrid.tsx](/workspaces/pedie/src/components/catalog/productGrid.tsx) -- listing.id key
- [src/components/layout/searchBar.tsx](/workspaces/pedie/src/components/layout/searchBar.tsx) -- updated refs
- [src/components/admin/productForm.tsx](/workspaces/pedie/src/components/admin/productForm.tsx) -- brand_id, name
- [src/components/admin/listingForm.tsx](/workspaces/pedie/src/components/admin/listingForm.tsx) -- new fields
- [src/app/api/admin/products/[id]/route.ts](/workspaces/pedie/src/app/api/admin/products/%5Bid%5D/route.ts) -- non-destructive sync
- [src/app/api/admin/listings/[id]/route.ts](/workspaces/pedie/src/app/api/admin/listings/%5Bid%5D/route.ts) -- PUT validation
- [src/app/(account)/account/wishlist/page.tsx](/workspaces/pedie/src/app/(account)/account/wishlist/page.tsx) -- defensive brand
- [src/app/(admin)/admin/products/columns.tsx](/workspaces/pedie/src/app/(admin)/admin/products/columns.tsx) -- brand.name, name
- [src/app/(admin)/admin/reviews/columns.tsx](/workspaces/pedie/src/app/(admin)/admin/reviews/columns.tsx) -- brand.name, name
- [src/app/(admin)/admin/prices/page.tsx](/workspaces/pedie/src/app/(admin)/admin/prices/page.tsx) -- updated types
- [src/app/(admin)/admin/orders/[id]/page.tsx](/workspaces/pedie/src/app/(admin)/admin/orders/%5Bid%5D/page.tsx) -- sku, brand.name
- [src/app/(store)/shop/page.tsx](/workspaces/pedie/src/app/(store)/shop/page.tsx) -- removed carrier
- [src/app/(store)/collections/[slug]/page.tsx](/workspaces/pedie/src/app/(store)/collections/%5Bslug%5D/page.tsx) -- removed carrier
- 16 test files updated

**Review Status:** Sentry APPROVED (2 iterations)

**Git Commit Message:**

```
feat: update catalog, admin, account components for new schema

- Replace getPricingTier with inline isSale in product cards
- Derive effectivePrice from sale state, not nullish coalescing
- Make product_categories sync non-destructive (upsert)
- Remove carrier from storefront filters
- Update admin forms/columns for brand_id, product.name
- Add PUT validation parity for admin listings API
- Zero bun check errors, 1249 tests passing
```
