## Phase 2 Complete: Storefront Layout, Homepage & Navigation

Built the complete storefront UI: global layout shell (header with search/cart, footer with newsletter/social links), 8 homepage sections (hero carousel, popular categories, customer favorites, daily deals, trust badges, category showcase, sustainability, newsletter signup), 3 reusable UI components (button, condition badge, product card), and data layer functions for products/categories. Also applied coderabbit review fixes: Dockerfile cleanup, API error sanitization, sync pipeline hardening, newsletter API endpoint, and unique index migration.

**Files created/changed:**

- `.devcontainer/devcontainer.json` — updated
- `.env.example` — added new env vars
- `.gitignore` — updated
- `.husky/pre-commit` — updated
- `Dockerfile` — removed redundant prod-deps stage
- `bun.lock` — updated with semantic-release deps
- `docker-compose.yml` — updated
- `package.json` — removed f:check from check script, added semantic-release devDeps
- `plans/pedie-store-phase-1-complete.md` — path fix
- `plans/pedie-store-plan.md` — fixed test paths (src/tests → tests)
- `scripts/iamvikshan.sh` — updated
- `src/app/api/newsletter/route.ts` — NEW: newsletter subscription endpoint
- `src/app/api/sync/route.ts` — environment-conditioned error messages
- `src/app/globals.css` — Pedie brand theme (@theme block with green #4CAF50)
- `src/app/layout.tsx` — integrated header/footer layout
- `src/app/page.tsx` — full homepage with all sections
- `src/components/home/category-showcase.tsx` — NEW: horizontal product scroll
- `src/components/home/customer-favorites.tsx` — NEW: tabbed product carousel
- `src/components/home/daily-deals.tsx` — NEW: countdown timer + deal cards
- `src/components/home/hero-banner.tsx` — NEW: auto-rotating carousel
- `src/components/home/newsletter-signup.tsx` — NEW: email subscription with real API
- `src/components/home/popular-categories.tsx` — NEW: category icon grid (fixed slugs)
- `src/components/home/sustainability-section.tsx` — NEW: circular economy messaging
- `src/components/home/trust-badges.tsx` — NEW: trust badge strip
- `src/components/layout/footer-newsletter-form.tsx` — NEW: footer newsletter client component
- `src/components/layout/footer.tsx` — NEW: 4-column footer with real social links
- `src/components/layout/header.tsx` — NEW: header with logo, nav, search, cart
- `src/components/layout/mobile-nav.tsx` — NEW: mobile hamburger menu
- `src/components/layout/search-bar.tsx` — NEW: search with autocomplete
- `src/components/ui/button.tsx` — NEW: reusable button with variants
- `src/components/ui/condition-badge.tsx` — NEW: condition grade badge
- `src/components/ui/product-card.tsx` — NEW: product listing card
- `src/lib/data/categories.ts` — NEW: server functions for categories
- `src/lib/data/products.ts` — NEW: server functions for listings
- `src/lib/sheets/sync.ts` — upsert with onConflict, NaN price check, maybeSingle
- `supabase/migrations/20250701000000_add_unique_products_brand_model.sql` — NEW: unique index
- `tsconfig.json` — added path aliases (@components, @lib, @app-types)
- `types/*.ts` — renamed from .d.ts back to .ts (user preference)

**Functions created/changed:**

- `POST /api/newsletter` — validates email, upserts into newsletter_subscribers
- `POST /api/sync` — error messages now environment-conditioned
- `getFeaturedListings()`, `getLatestListings()`, `getListingsByCategory()`, `getDealListings()` — product data layer
- `getCategories()`, `getCategoryBySlug()` — category data layer
- `findOrCreateProduct()` — changed to upsert with onConflict: 'brand,model'
- `syncSheetToSupabase()` — NaN price validation, maybeSingle lookups
- `HeroBanner`, `PopularCategories`, `CustomerFavorites`, `DailyDeals`, `TrustBadges`, `CategoryShowcase`, `SustainabilitySection`, `NewsletterSignup` — homepage sections
- `Header`, `Footer`, `MobileNav`, `SearchBar`, `FooterNewsletterForm` — layout components
- `Button`, `ConditionBadge`, `ProductCard` — UI components

**Tests created/changed:**

- `tests/components/home/hero-banner.test.tsx`
- `tests/components/home/daily-deals.test.tsx`
- `tests/components/home/trust-badges.test.tsx`
- `tests/components/layout/header.test.tsx`
- `tests/components/layout/footer.test.tsx`
- `tests/components/ui/product-card.test.tsx`
- `tests/lib/data/products.test.ts`
- `tests/lib/data/categories.test.ts`

**Review Status:** APPROVED with fixes applied (all 11 coderabbit issues resolved)

**Verification:**

- 62 tests passing, 0 failures
- Build succeeds (all routes compiled)
- Lint passes (no errors)
- Formatting verified (all files unchanged after format)

**Git Commit Message:**

```
feat: add storefront layout, homepage sections, and UI components

- Add header with search/cart, footer with newsletter/social links
- Build 8 homepage sections: hero, categories, favorites, deals, trust badges, showcases, sustainability, newsletter
- Create reusable UI components: button, condition badge, product card
- Add server data layer for products and categories from Supabase
- Add /api/newsletter endpoint for email subscriptions
- Remove Dockerfile prod-deps stage, fix API error leak, harden sync pipeline
- Add unique index migration for products(brand, model)
```
