## Phase 5A Complete: Cart, Pricing & Core Type Consumers

Fixed the cart system, pricing helpers, checkout, order API, and order display for the new database schema. Removed `getPricingTier`/`PricingTier` from helpers while keeping all other pricing functions. All cart and checkout flows now use effective pricing (`sale_price_kes ?? price_kes`) instead of the removed `final_price_kes`.

**Details:**

- Cart store (`store.ts`): identity switched from `listing_id` to `id` for all operations (add, remove, has, key). `getTotal()` and `getDepositTotal()` both use `sale_price_kes ?? price_kes` as effective price.
- Cart item (`cartItem.tsx`): displays `product.brand.name` and `product.name` instead of old string `.brand`/`.model`. Shows `listing.sku` as a badge, uses `listing.id` for store key/remove.
- Checkout (`checkout/page.tsx`): `unit_price_kes` uses effective price. `deposit_kes` is conditional on `listing_type === 'preorder'` (zero for standard listings). Added `product_name: listing.product.name` to order items.
- Orders API (`route.ts`): email confirmation items use `product_name` instead of UUID listing_id.
- Pricing helpers: `getPricingTier()` and `PricingTier` type removed. `calculateDeposit`, `formatKes`, `usdToKes`, `calculateDiscount` preserved.
- Order items display: shows product name as primary label.

**Deviations from plan:**

- `addListing allows onsale listing` test removed -- `'onsale'` is not a valid enum value in the new schema. Covered by `'active'` status test.
- 20 test failures remain in consumer components (`productCard.tsx`, `productFamilyCard.tsx` and their downstream) that still import the removed `getPricingTier` -- these are resolved in Phase 5C.

**Known exception:** Server-side price validation in `src/app/api/orders/route.ts` is a pre-existing security issue (not introduced by Phase 5A). Documented with `// TODO(security)` comment. Should be addressed in a dedicated security task.

**Files modified:**

- [src/lib/cart/store.ts](/workspaces/pedie/src/lib/cart/store.ts) -- effective price, listing.id identity
- [src/components/cart/cartItem.tsx](/workspaces/pedie/src/components/cart/cartItem.tsx) -- brand/name display, sku badge
- [src/app/(store)/cart/client.tsx](/workspaces/pedie/src/app/(store)/cart/client.tsx) -- listing_id -> id
- [src/app/(store)/checkout/page.tsx](/workspaces/pedie/src/app/(store)/checkout/page.tsx) -- effective price, conditional deposit, product_name
- [src/app/api/orders/route.ts](/workspaces/pedie/src/app/api/orders/route.ts) -- email uses product_name
- [src/helpers/pricing.ts](/workspaces/pedie/src/helpers/pricing.ts) -- removed getPricingTier/PricingTier
- [src/components/orders/orderItems.tsx](/workspaces/pedie/src/components/orders/orderItems.tsx) -- product name display
- [tests/lib/cart/store.test.ts](/workspaces/pedie/tests/lib/cart/store.test.ts) -- full mock overhaul, deposit regression test
- [tests/packages/pricing.test.ts](/workspaces/pedie/tests/packages/pricing.test.ts) -- removed getPricingTier tests
- [tests/lib/data/orders.test.ts](/workspaces/pedie/tests/lib/data/orders.test.ts) -- product_name in mock
- [tests/components/ui/product-card.test.tsx](/workspaces/pedie/tests/components/ui/product-card.test.tsx) -- removed getPricingTier test
- [tests/components/ui/product-family-card.test.tsx](/workspaces/pedie/tests/components/ui/product-family-card.test.tsx) -- removed getPricingTier tests
- [tests/app/api/orders-auth.test.ts](/workspaces/pedie/tests/app/api/orders-auth.test.ts) -- product_name in fixture

**Review Status:** APPROVED with exception (pre-existing server-side price trust issue documented, not introduced by Phase 5A)

**Git Commit Message:**

```
feat: align cart, checkout, and pricing with new database schema

- Replace listing_id with listing.id for cart identity and operations
- Use effective price (sale_price_kes ?? price_kes) in getTotal/getDepositTotal
- Conditional deposit_kes: only calculated for preorder listings
- Add product_name to order items for email confirmations
- Remove getPricingTier/PricingTier from pricing helpers
- Update cart item display: brand.name, product.name, sku badge
- Add deposit regression test for standard vs preorder items
```
