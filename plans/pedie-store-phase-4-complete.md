## Phase 4 Complete: Shopping Cart, Checkout & Payment Integration

Implemented the full shopping cart, multi-step checkout flow, M-Pesa Daraja STK Push integration, PayPal REST API v2 integration, order management CRUD, and order tracking page. All payments persist order status and payment references. Cart uses localStorage via Zustand with persist middleware.

**Files created/changed:**
- src/lib/payments/mpesa.ts
- src/lib/payments/paypal.ts
- src/lib/data/orders.ts
- src/lib/cart/store.ts (pre-existing)
- src/app/checkout/page.tsx
- src/app/checkout/confirmation/page.tsx
- src/app/orders/[id]/page.tsx
- src/app/api/payments/mpesa/stkpush/route.ts
- src/app/api/payments/mpesa/callback/route.ts
- src/app/api/payments/mpesa/status/route.ts
- src/app/api/payments/paypal/create/route.ts
- src/app/api/payments/paypal/capture/route.ts
- src/app/api/orders/route.ts
- src/app/api/orders/[id]/route.ts
- src/components/checkout/shipping-form.tsx
- src/components/checkout/payment-selector.tsx
- src/components/checkout/mpesa-payment.tsx
- src/components/checkout/paypal-payment.tsx
- src/components/checkout/checkout-steps.tsx
- src/components/orders/status-timeline.tsx
- src/components/orders/order-items.tsx
- src/components/ui/product-card.tsx (hooks order fix)
- tests/lib/payments/mpesa.test.ts
- tests/lib/payments/paypal.test.ts
- tests/components/checkout/shipping-form.test.tsx
- tests/lib/data/orders.test.ts
- tests/components/ui/product-card.test.tsx (rewritten)

**Functions created/changed:**
- formatPhoneForDaraja, getOAuthToken, generatePassword, getTimestamp, initiateSTKPush, parseCallback, querySTKStatus (mpesa.ts)
- getPayPalAccessToken, kesToUsd, createPayPalOrder, capturePayPalPayment, getApprovalUrl (paypal.ts)
- createOrder, getOrderById, updateOrderStatus, getOrdersByUser, getOrderByPaymentRef (orders.ts)
- ShippingForm, validateKenyanPhone, PaymentSelector, MpesaPayment, PaypalPayment, CheckoutSteps
- OrderStatusTimeline, OrderItemsList
- CheckoutPage, ConfirmationPage, OrderPage

**Tests created/changed:**
- 9 M-Pesa tests (phone formatting, password generation, timestamp, callback parsing)
- 7 PayPal tests (KES-USD conversion, approval URL extraction)
- 10 shipping form tests (Kenyan phone validation)
- 4 order structure tests (input structure, balance calculation, multi-items, payment methods)
- 6 product-card tests (rewritten to test pure logic without DOM)

**Review Status:** APPROVED (all critical review items addressed — payment persistence, PayPal popup safety, type safety, numeric field validation)

**Git Commit Message:**
```
feat: add checkout, M-Pesa & PayPal payments, order tracking

- Multi-step checkout (shipping → payment → pay) with Zustand cart
- M-Pesa Daraja STK Push with callback persistence and status polling
- PayPal REST API v2 with popup checkout and server-side capture
- Order CRUD with Supabase (create, get, update status, list by user)
- Order tracking page with status timeline and payment summary
- 36 new tests (187 total), lint clean, all passing
```
