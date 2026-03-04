## Phase 4 Complete: Referral WhatsApp CTA + Cart Validation

Added referral listing type support: WhatsApp CTA button component, referral badge on product cards, and status/type-aware cart validation guards. Tests grew from 998 to 1019.

**Files created/changed:**
- `src/components/listing/referralCta.tsx` — NEW
- `src/components/listing/addToCart.tsx`
- `src/components/ui/productCard.tsx`
- `src/lib/cart/store.ts`
- `tests/components/listing/referral-cta.test.tsx` — NEW
- `tests/components/listing/add-to-cart.test.tsx`
- `tests/components/ui/product-card.test.tsx`
- `tests/lib/cart/store.test.ts`

**Functions created/changed:**
- `ReferralCta` — WhatsApp deep link button with short "WhatsApp" CTA text
- `AddToCart` — Added referral branch rendering `ReferralCta`
- `ProductCard` — Added `isReferral` flag, "Referral" badge with `TbBrandWhatsapp` icon
- `addListing` (cart store) — Added status/type guards rejecting sold, reserved, referral, affiliate

**Tests created/changed:**
- `referral-cta.test.tsx` — 9 tests: WhatsApp URL, icon, config import, message encoding, short CTA text, accessibility
- `add-to-cart.test.tsx` — 2 tests added: referral renders ReferralCta, import check
- `product-card.test.tsx` — 3 tests added: referral badge, tooltip, condition badge hidden
- `store.test.ts` — 7 tests added: reject sold/reserved/referral/affiliate, allow standard/onsale/preorder

**Review Status:** APPROVED

**Git Commit Message:**
```
feat: add referral WhatsApp CTA and cart validation

- Create ReferralCta component with wa.me deep link and short "WhatsApp" button text
- Add referral case to AddToCart, rendering ReferralCta for referral listings
- Add "Referral" badge with TbBrandWhatsapp icon to ProductCard
- Guard cart store addListing against sold, reserved, referral, and affiliate listings
- Add 21 new tests (998 → 1019)
```
