## Phase 2 Complete: Server-Side Pricing Trust

Eliminated client-supplied pricing from the order and payment flow. All order totals are now derived server-side from DB listing prices. PayPal routes enforce auth, ownership, pending status, and amount verification before confirming orders.

**Details:**

- Simplified `CreateOrderInput.items` to `{ listing_id, quantity }[]` -- no price fields accepted
- `createOrder()` fetches listings from DB, derives unit_price_kes (sale_price ?? price), computes deposit via `calculateDeposit()`, sums subtotal/deposit/shipping server-side
- PayPal create route: requires auth via `getUser()`, validates ownership (user_id match), rejects zero/negative deposits, derives amount from `order.deposit_amount_kes`
- PayPal capture POST: fetches order, checks `status === 'pending'`, verifies captured amount within AMOUNT_TOLERANCE_USD ($0.50), only then confirms
- PayPal capture GET: same full verification chain with redirect error responses
- Checkout page and PaypalPayment component send only listing_id + quantity and orderId respectively

**Deviations from plan:**

- Added auth + ownership check to PayPal create route (not in original plan, added during Sentry review)
- Added zero/negative deposit rejection (added during Sentry review)
- Added pending status check before capture confirmation (added during Sentry review)
- GET capture handler given full verification chain (originally unverified)
- Generic "Order not available" error messages to prevent information leakage

**Files modified:**

- [orders.ts](/workspaces/pedie/src/lib/data/orders.ts) -- Simplified CreateOrderInput, server-side pricing in createOrder()
- [route.ts](/workspaces/pedie/src/app/api/orders/route.ts) -- Accept only listing_id+quantity, removed TODO
- [page.tsx](/workspaces/pedie/src/app/(store)/checkout/page.tsx) -- Removed price fields from API call
- [paypalPayment.tsx](/workspaces/pedie/src/components/checkout/paypalPayment.tsx) -- Removed amountKes prop
- [create/route.ts](/workspaces/pedie/src/app/api/payments/paypal/create/route.ts) -- Auth, ownership, DB-derived amount
- [capture/route.ts](/workspaces/pedie/src/app/api/payments/paypal/capture/route.ts) -- Amount verification, pending check
- [orders.test.ts](/workspaces/pedie/tests/lib/data/orders.test.ts) -- Updated for new CreateOrderInput
- [orders-auth.test.ts](/workspaces/pedie/tests/app/api/orders-auth.test.ts) -- Updated valid body
- [orders-route.test.ts](/workspaces/pedie/tests/app/api/orders-route.test.ts) -- NEW, 7 tests
- [paypal-create.test.ts](/workspaces/pedie/tests/app/api/paypal-create.test.ts) -- NEW, 8 tests
- [paypal-capture.test.ts](/workspaces/pedie/tests/app/api/paypal-capture.test.ts) -- NEW, 9 tests

**Review Status:** Sentry APPROVED (iteration 2). 1 minor: test weakness in non-COMPLETED capture test (acceptable).

**Git Commit Message:**

```
fix: server-side pricing trust for orders and PayPal

- Simplify CreateOrderInput to listing_id + quantity only
- Derive all pricing from DB listings in createOrder()
- Add auth + ownership + zero deposit checks to PayPal create
- Add amount verification with tolerance to PayPal capture
- Add pending status check before order confirmation
- 24 new tests across 3 test files
```
