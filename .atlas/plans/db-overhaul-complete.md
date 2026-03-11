## Plan Complete: Database Centralization & Overhaul

Overhauled the Pedie database schema from a phone-centric PoC to an industry-standard, category-agnostic e-commerce schema. Introduced SKU system, promotions table, brand normalization via FK, junction-table categories, inline isSale pricing model, username-based auth, and Google Sheets sync expansion. All breaking changes applied across 8 phases.

**Phases Completed:** 8 of 8

1. [x] Phase 1: Unified Schema Migration
2. [x] Phase 2: Data Access Layer Rewrite
3. [x] Phase 3: Sync Pipeline & Promotions
4. [x] Phase 3.5: Sync Engine Hardening
5. [x] Phase 4: Auth & User Management
6. [x] Phase 5A: Cart, Pricing & Core Types
7. [x] Phase 5B: Listing Components & Detail Pages
8. [x] Phase 5C: Catalog, Admin, Account & Sweep
9. [x] Phase 6: Documentation & Build Validation

**Key Files Added/Modified:**

- [supabase/migrations/20250800000000_schema.sql](/workspaces/pedie/supabase/migrations/20250800000000_schema.sql) -- Unified schema with SKU triggers, promotions, brand FK, junction categories
- [src/lib/data/listings.ts](/workspaces/pedie/src/lib/data/listings.ts) -- getListingBySku, updated queries
- [src/lib/data/products.ts](/workspaces/pedie/src/lib/data/products.ts) -- ProductWithBrand returns, junction categories
- [types/product.ts](/workspaces/pedie/types/product.ts) -- ProductWithBrand, updated ProductFamily (Listing[], not ListingWithProduct[])
- [src/helpers/pricing.ts](/workspaces/pedie/src/helpers/pricing.ts) -- Removed getPricingTier, kept usdToKes/calculateDeposit/formatKes/calculateDiscount
- [src/components/ui/productCard.tsx](/workspaces/pedie/src/components/ui/productCard.tsx) -- Inline isSale pricing
- [src/app/(store)/listings/[sku]/page.tsx](/workspaces/pedie/src/app/(store)/listings/[sku]/page.tsx) -- SKU-based routes
- [docs/product-architecture.md](/workspaces/pedie/docs/product-architecture.md) -- Full rewrite with all schema changes

**Test Coverage:**

- Total tests: 1249 | Passing: Yes (0 failures across 128 files)

_(Master plan and phase files archived to `archive/`.)_
