## Plan: Pedie Tech Custom E-Commerce Store

Build a full-featured, custom-coded e-commerce store for Pedie Tech (pedie.tech) — a refurbished electronics reseller in Kenya — modeled after Reebelo's UX. The stack uses **Next.js 16.1.6** (App Router) on **Bun**, **Supabase** for DB/auth, **Google Sheets** as inventory source with per-item listing IDs (à la Swappa), **M-Pesa Daraja API** + **PayPal** for payments, **GitHub Actions** for automated price crawling, and **Docker** for GCP VM deployment (following Amina's patterns). The **Flutter** mobile app is deferred to a follow-up project.

**Runtime:** Bun (native tests, scripts, package management)
**Hosting:** Vercel (Next.js frontend/SSR) + self-hosted GCP VM (containerized services, crawlers, sync workers)
**Repo:** Repurpose `pedie-tech/info` → rename to `iamvikshan/pedie`, develop in-place
**UI Design:** Google Stitch MCP (with stitch-skills installed) for screen generation

---

### 1. **Phase 1: Project Bootstrap, Database & Data Pipeline**

- **Objective:** Rename the repo, bootstrap the Next.js 16.1.6 project on Bun, design the Supabase schema with per-item listing IDs (each physical unit is a unique listing like Swappa, not batched by model), configure path aliases, set up Docker (mirroring Amina's patterns), and build the Google Sheets → Supabase inventory sync pipeline.

- **Files/Functions to Modify/Create:**
  - Rename repo `pedie-tech/info` → `iamvikshan/pedie` via GitHub API
  - `package.json` — Next.js 16.1.6, TypeScript, Tailwind CSS 4, shadcn/ui, Bun runtime (`"packageManager": "bun"`)
  - `bunfig.toml` — Bun configuration
  - `next.config.ts` — image domains (Supabase Storage), path aliases
  - `tsconfig.json` — path aliases: `@/*` → `src/*`, `@types/*` → `types/*`, `@lib/*` → `src/lib/*`, `@components/*` → `src/components/*`
  - `globals.css` — Tailwind CSS 4 uses CSS-first `@theme` blocks in `globals.css` for brand colors (green #4CAF50, dark, accent), fonts (replaces `tailwind.config.ts`)
  - `.env.local` / `.env.example` — Supabase URL, anon key, Google Sheets credentials, Daraja keys
  - `Dockerfile` — multi-stage Bun build (deps → build → runtime), matching Amina's pattern
  - `docker-compose.yml` — dev: build from local, volume mounts, port forwarding
  - `docker-compose.prod.yml` — prod: pre-built GHCR image, healthcheck, Watchtower auto-updates, Cloudflare Tunnel
  - `scripts/deploy.sh` — interactive VPS deployment script (matching Amina's `local.sh` pattern: prerequisites check, .env config, Docker Compose up, health polling)
  - `.github/workflows/docker.yml` — build & push Docker image to GHCR on push to main
  - `types/database.ts` — TypeScript types generated from Supabase schema
  - `types/product.ts` — Product, Listing, Variant, Condition types
  - `types/order.ts` — Order, OrderItem, PaymentStatus types
  - `types/user.ts` — Profile, Address types
  - `types/cart.ts` — CartItem, Cart types
  - `types/index.ts` — barrel export
  - `src/app/layout.tsx` — root layout with metadata, fonts, providers
  - `src/lib/supabase/client.ts` — browser Supabase client
  - `src/lib/supabase/server.ts` — server-side Supabase client
  - `src/lib/supabase/admin.ts` — service-role client for admin/sync operations
  - `supabase/migrations/001_initial_schema.sql` — full schema (per-item listings)
  - `src/lib/sheets/sync.ts` — Google Sheets API read + upsert to Supabase
  - `src/app/api/sync/route.ts` — API route to trigger sync (webhook-compatible)
  - `src/lib/constants.ts` — KES/USD rate (130), deposit tiers, warranty period, helpers

- **Database Schema (per-item listing model):**
  - `categories` (id, name, slug, image_url, parent_id, sort_order)
  - `products` (id, brand, model, slug, category_id, description, specs JSONB, key_features TEXT[], images TEXT[], original_price_kes, created_at, updated_at) — represents a **model** (e.g., "iPhone 12 Pro Max")
  - `listings` (id, listing_id TEXT UNIQUE — Swappa-style "PD-XXXXX", product_id FK, storage, color, carrier, condition ENUM(acceptable/good/excellent/premium), battery_health INT, price_kes, original_price_usd, landed_cost_kes, images TEXT[], is_preorder BOOLEAN, is_sold BOOLEAN, is_featured BOOLEAN, sheets_row_id, notes, created_at, updated_at) — represents a **specific physical unit** with unique ID, condition, price
  - `profiles` (id/user_id FK, full_name, phone, address JSONB, avatar_url, role ENUM(customer/admin) DEFAULT customer)
  - `orders` (id, user_id FK, status ENUM(pending/confirmed/processing/shipped/delivered/cancelled), subtotal_kes, shipping_fee_kes, total_kes, payment_method ENUM(mpesa/paypal), payment_ref, deposit_amount_kes, balance_due_kes, shipping_address JSONB, tracking_info JSONB, notes, created_at, updated_at)
  - `order_items` (id, order_id FK, listing_id FK, unit_price_kes, deposit_kes)
  - `reviews` (id, product_id FK, user_id FK, rating 1-5, title, body, verified_purchase, created_at)
  - `price_comparisons` (id, product_id FK, competitor TEXT, competitor_price_kes, url, crawled_at)
  - `wishlist` (id, user_id FK, product_id FK)
  - `newsletter_subscribers` (id, email, subscribed_at)
  - RLS policies for all tables

- **Google Sheets Column Design (per-item):**
  - `Listing ID` (auto-generated PD-XXXXX), `Brand`, `Model`, `Category`, `Storage`, `Color`, `Carrier`, `Condition` (Acceptable/Good/Excellent/Premium), `Battery Health %`, `Price KES`, `Source Price USD`, `Source` (Swappa/Reebelo/BackMarket), `Source Listing ID`, `Landed Cost KES`, `Status` (Available/Sold/Preorder/Reserved), `Images` (comma-separated URLs), `Notes`, `Date Added`

- **Tests to Write (Bun native `bun test`):**
  - `src/tests/lib/supabase/client.test.ts` — Supabase client initialization
  - `src/tests/lib/sheets/sync.test.ts` — Sheets parsing, per-item upsert, listing ID generation, error handling
  - `src/tests/api/sync.test.ts` — API route auth, trigger sync, response codes
  - `src/tests/lib/constants.test.ts` — `usdToKes()`, `calculateDeposit()`, `generateListingId()`

- **Steps:**
  1. Rename repo `pedie-tech/info` → `iamvikshan/pedie` via GitHub API. Update git remote.
  2. Initialize Next.js 16.1.6 project in the workspace (App Router, TypeScript, Tailwind CSS 4, ESLint, Bun).
  3. Configure `tsconfig.json` path aliases: `@/*`, `@types/*`, `@lib/*`, `@components/*`.
  4. Create `types/` directory at project root with all type definitions. Set up barrel exports.
  5. Install and configure shadcn/ui with Pedie brand theme.
  6. Create `Dockerfile` (multi-stage Bun build matching Amina's pattern: `FROM oven/bun:alpine AS deps` → `FROM oven/bun:alpine AS builder` → `FROM oven/bun:alpine AS runner`).
  7. Create `docker-compose.yml` (dev) and `docker-compose.prod.yml` (prod with GHCR image, healthcheck, Watchtower, Cloudflare Tunnel).
  8. Create `scripts/deploy.sh` (interactive VPS deployment matching Amina's `local.sh` pattern).
  9. Create `.github/workflows/docker.yml` (build + push to GHCR on main push).
  10. Create Supabase project (free tier), save credentials to `.env.local`.
  11. Write migration SQL for all tables with per-item listing model and RLS policies. Apply via Supabase CLI.
  12. Generate TypeScript database types from Supabase schema into `types/database.ts`.
  13. Write tests for Google Sheets sync — mock Sheets API, verify per-item upsert, listing ID format `PD-XXXXX`.
  14. Run tests — confirm red.
  15. Implement `src/lib/sheets/sync.ts` — reads rows from configured Sheet, maps to `listings` table (one row = one physical unit), upserts into Supabase. Auto-generates listing IDs for new items.
  16. Implement `src/app/api/sync/route.ts` — POST endpoint (API key protected) that triggers sync.
  17. Run tests — confirm green.
  18. Write and verify Supabase client helpers (browser + server + admin).
  19. Create `src/lib/constants.ts` with `usdToKes()`, `calculateDeposit()`, `generateListingId()`, config values.
  20. Confirm app builds (`bun run build`) and runs (`bun run dev`) with no errors.

---

### 2. **Phase 2: Storefront Layout, Homepage & Navigation**

- **Objective:** Build the global layout (header with search/cart/user, footer with links/newsletter/payment icons) and the full homepage matching Reebelo's design — hero carousel, popular categories, customer favorites tabs, daily deals with countdown, trust badges, category showcases, and sustainability section. Use Stitch MCP for initial screen designs.

- **Files/Functions to Modify/Create:**
  - `src/app/layout.tsx` — integrate Header + Footer
  - `src/components/layout/header.tsx` — logo, search bar, category nav, cart icon with badge, user menu
  - `src/components/layout/footer.tsx` — 4-column footer, M-Pesa/PayPal icons, social links, newsletter
  - `src/components/layout/mobile-nav.tsx` — hamburger menu for mobile
  - `src/components/layout/search-bar.tsx` — search with autocomplete dropdown
  - `src/app/page.tsx` — homepage composition
  - `src/components/home/hero-banner.tsx` — rotating carousel with CTA slides
  - `src/components/home/popular-categories.tsx` — icon grid (Smartphones, Laptops, Tablets, Accessories)
  - `src/components/home/customer-favorites.tsx` — tabbed product carousel by category
  - `src/components/home/daily-deals.tsx` — countdown timer + deal product cards
  - `src/components/home/trust-badges.tsx` — "3-Month Warranty | Free Delivery | Quality Tested | 7-Day Returns"
  - `src/components/home/category-showcase.tsx` — horizontal product scroll per category
  - `src/components/home/sustainability-section.tsx` — "Join the Circular Economy" messaging
  - `src/components/home/newsletter-signup.tsx` — email subscription form
  - `src/components/ui/product-card.tsx` — reusable card (image, name, prices, discount %, condition badge, listing ID)
  - `src/lib/data/products.ts` — server functions to fetch featured listings, deals, favorites
  - `src/lib/data/categories.ts` — server function to fetch categories

- **Tests to Write:**
  - `src/tests/components/layout/header.test.tsx` — renders logo, nav, search, cart, responsive
  - `src/tests/components/layout/footer.test.tsx` — renders sections, newsletter form
  - `src/tests/components/home/hero-banner.test.tsx` — carousel renders, auto-rotates
  - `src/tests/components/home/customer-favorites.test.tsx` — tab switching, product display
  - `src/tests/components/home/daily-deals.test.tsx` — countdown timer, deal cards
  - `src/tests/components/ui/product-card.test.tsx` — renders listing info, discount calc, links
  - `src/tests/lib/data/products.test.ts` — data fetch functions return correct shape

- **Steps:**
  1. Install Stitch Skills (`google-labs-code/stitch-skills`). Use Stitch MCP to generate screen designs for homepage, header, footer as design reference.
  2. Write tests for `product-card` — renders image, name, listing ID badge, original price strikethrough, sale price, discount %, condition badge, links to listing page.
  3. Run tests — red.
  4. Build `product-card` component with Tailwind (rounded corners, shadow, hover scale, discount overlay).
  5. Run tests — green.
  6. Write tests for `header` — logo, nav links, search bar, cart icon, responsive.
  7. Run tests — red.
  8. Build `header` and `mobile-nav`. Header: Pedie logo, category nav (Smartphones, Laptops, Tablets, Accessories), search with autocomplete, cart with count badge, user menu (Sign In / Profile).
  9. Run tests — green.
  10. Build `footer` — About Pedie, Policies, Help, Newsletter. M-Pesa + PayPal icons. Social links (TikTok, Instagram, X).
  11. Write tests for homepage sections.
  12. Run tests — red.
  13. Build all homepage sections: hero-banner (auto-rotating carousel), popular-categories (icon grid), customer-favorites (tabbed carousel), daily-deals (countdown + cards), trust-badges (badge strip), category-showcase (horizontal scroll), sustainability-section, newsletter-signup.
  14. Run tests — green.
  15. Compose homepage in `src/app/page.tsx`. Implement data fetching in `src/lib/data/`.
  16. Verify responsive rendering at desktop and mobile breakpoints.

---

### 3. **Phase 3: Catalog — Collections & Listing Detail Pages**

- **Objective:** Build collection/category listing pages with filtering (condition, color, storage, price range, brand), sorting, and pagination. Build individual listing detail pages with image gallery, specs, condition info, pricing, "Add to Cart", related listings, "pair it with" accessories, customer reviews, and preorder badge. Each listing is a unique physical unit with its own listing ID, price, and condition — not batched.

- **Files/Functions to Modify/Create:**
  - `src/app/collections/[slug]/page.tsx` — dynamic collection page (SSR)
  - `src/app/collections/[slug]/loading.tsx` — skeleton loader
  - `src/components/catalog/product-grid.tsx` — responsive grid of product-cards
  - `src/components/catalog/filter-sidebar.tsx` — brand, condition, storage, color, price range slider filters
  - `src/components/catalog/sort-dropdown.tsx` — Best Selling, Price Low→High, Price High→Low, Newest
  - `src/components/catalog/pagination.tsx` — page navigation
  - `src/components/catalog/collection-banner.tsx` — category header with image and listing count
  - `src/app/listings/[listingId]/page.tsx` — individual listing detail page (SSR, dynamic metadata)
  - `src/components/listing/image-gallery.tsx` — main image + thumbnails with zoom
  - `src/components/listing/listing-info.tsx` — listing ID, condition, storage, color, carrier, battery health
  - `src/components/listing/price-display.tsx` — current price, original price strikethrough, discount %
  - `src/components/listing/add-to-cart.tsx` — add to cart button
  - `src/components/listing/product-specs.tsx` — specs table with icons (display, chipset, camera, battery)
  - `src/components/listing/product-description.tsx` — rich text description + key features
  - `src/components/listing/pair-it-with.tsx` — accessory recommendations
  - `src/components/listing/similar-listings.tsx` — other listings of same product model
  - `src/components/listing/you-may-also-like.tsx` — related products carousel
  - `src/components/listing/customer-reviews.tsx` — star histogram, reviews, load more
  - `src/components/listing/preorder-badge.tsx` — "Preorder" with deposit info
  - `src/components/listing/shipping-info.tsx` — delivery estimate (Aquantuo 7-14 days), free shipping
  - `src/lib/data/listings.ts` — `getListingById()`, `getListingsByCategory()`, `getSimilarListings()`, `searchListings()`
  - `src/app/search/page.tsx` — search results page
  - `types/filters.ts` — filter/sort types

- **Tests to Write:**
  - `src/tests/app/collections/page.test.tsx` — renders collection with listings, applies filters, paginates
  - `src/tests/components/catalog/filter-sidebar.test.tsx` — filter interactions update URL params
  - `src/tests/app/listings/page.test.tsx` — renders listing detail, all info sections
  - `src/tests/components/listing/image-gallery.test.tsx` — thumbnail click changes main image
  - `src/tests/components/listing/customer-reviews.test.tsx` — renders reviews, histogram, load more
  - `src/tests/lib/data/listings.test.ts` — query functions with filters, sorting, pagination

- **Steps:**
  1. Write tests for `getListingsByCategory()` and `getListingById()` — verify shape, filters, sorting, pagination.
  2. Run tests — red.
  3. Implement data functions with Supabase queries. `getListingsByCategory()` supports condition, color, storage, carrier, brand, price range filters + sorting + cursor pagination. `getListingById()` joins `products` for specs/description, fetches reviews and similar listings.
  4. Run tests — green.
  5. Write tests for `filter-sidebar` — filter interactions update URL search params.
  6. Run tests — red.
  7. Build collection page: `collection-banner`, `filter-sidebar` (collapsible on mobile), `sort-dropdown`, `product-grid`, `pagination`. URL search params for SSR-compatible filter state.
  8. Run tests — green.
  9. Write tests for listing detail page — renders all sections, listing ID displayed, correct price.
  10. Run tests — red.
  11. Build listing detail page: image gallery (left) + listing info (right). Info: listing ID badge (PD-XXXXX), condition badge, storage/color/carrier, battery health %, price (original strikethrough + current + discount %), "Add to Cart" CTA, shipping info (Aquantuo 7-14 days), preorder badge (deposit: 5% < KES 70k, 10% ≥ KES 70k). Below fold: key specs icons, full specs table, description, "Pair it with", "Similar Listings" (same model, different condition/price), "You May Also Like", customer reviews.
  12. Run tests — green.
  13. Build search page with `searchListings()` using Supabase full-text search.
  14. Generate dynamic SEO metadata for all collection and listing pages.
  15. Verify all pages render, links work, filters apply correctly.

---

### 4. **Phase 4: Shopping Cart, Checkout & Payment Integration**

- **Objective:** Implement shopping cart (Zustand + localStorage), multi-step checkout, M-Pesa Daraja API (STK Push, sandbox first), PayPal, and the preorder deposit flow (5% phones < KES 70k, 10% laptops ≥ KES 70k). Each cart item is a specific listing (unique unit), not a generic product. Include order confirmation and tracking pages.

- **Files/Functions to Modify/Create:**
  - `src/lib/cart/store.ts` — Zustand cart store with localStorage persistence
  - `src/app/cart/page.tsx` — cart page
  - `src/components/cart/cart-item.tsx` — item row (image, name, listing ID, condition, price, remove)
  - `src/components/cart/cart-summary.tsx` — subtotal, shipping, total, deposit breakdown
  - `src/app/checkout/page.tsx` — multi-step checkout
  - `src/components/checkout/shipping-form.tsx` — name, phone (254...), address, city, notes
  - `src/components/checkout/payment-selector.tsx` — M-Pesa or PayPal
  - `src/components/checkout/mpesa-payment.tsx` — phone input, STK Push trigger, status polling
  - `src/components/checkout/paypal-payment.tsx` — PayPal button
  - `src/components/checkout/preorder-summary.tsx` — deposit vs. balance due
  - `src/components/checkout/order-confirmation.tsx` — success page
  - `src/lib/payments/mpesa.ts` — Daraja API client (OAuth, STK Push, callback, status query)
  - `src/lib/payments/paypal.ts` — PayPal SDK integration
  - `src/app/api/payments/mpesa/stkpush/route.ts` — initiate STK Push
  - `src/app/api/payments/mpesa/callback/route.ts` — Safaricom callback
  - `src/app/api/payments/mpesa/status/route.ts` — poll status
  - `src/app/api/payments/paypal/create/route.ts` — create PayPal order
  - `src/app/api/payments/paypal/capture/route.ts` — capture payment
  - `src/app/api/orders/route.ts` — create order
  - `src/app/api/orders/[id]/route.ts` — get/update order
  - `src/app/orders/[id]/page.tsx` — order detail / tracking
  - `src/lib/data/orders.ts` — order CRUD

- **Tests to Write:**
  - `src/tests/lib/cart/store.test.ts` — add, remove, totals, deposit calc, localStorage
  - `src/tests/components/cart/cart-summary.test.tsx` — subtotal, deposit vs. balance
  - `src/tests/components/checkout/shipping-form.test.tsx` — Kenyan phone validation, required fields
  - `src/tests/lib/payments/mpesa.test.ts` — OAuth, STK Push formatting, callback parsing, status
  - `src/tests/lib/payments/paypal.test.ts` — order create, capture
  - `src/tests/api/orders.test.ts` — order CRUD, status transitions
  - `src/tests/app/checkout/page.test.tsx` — multi-step flow, deposit logic

- **Steps:**
  1. Write tests for cart store — `addListing()`, `removeListing()`, `getTotal()`, `getDepositTotal()` (5% < KES 70k, 10% ≥ KES 70k), `clearCart()`, localStorage sync. Note: no quantity selector — each listing is a unique physical unit (qty always 1).
  2. Run tests — red.
  3. Implement Zustand cart store with localStorage middleware. Deposit calculation per Section 7.1 of business plan.
  4. Run tests — green.
  5. Write tests for M-Pesa Daraja — OAuth token, STK Push body (BusinessShortCode, Passkey, Phone, Amount), callback parsing, status query.
  6. Run tests — red.
  7. Implement Daraja client (sandbox first). Functions: `getOAuthToken()`, `initiateSTKPush()`, `parseCallback()`, `queryStatus()`. Implement API routes.
  8. Run tests — green.
  9. Write tests for PayPal — create order, capture.
  10. Run tests — red.
  11. Implement PayPal with `@paypal/paypal-js`. API routes for create/capture.
  12. Run tests — green.
  13. Build cart page — listing items (image, name, listing ID, condition, price, remove), subtotal, shipping (free), deposit breakdown for preorders, "Proceed to Checkout".
  14. Build checkout — Step 1: Shipping (Kenyan phone validation +254), Step 2: Payment (M-Pesa or PayPal), Step 3: Review + Pay. Show deposit now vs. balance on delivery for preorders.
  15. Build order confirmation and tracking pages.
  16. Implement order API routes with Supabase. Mark listing as sold when order confirmed.
  17. E2E: add listing → checkout → M-Pesa sandbox STK Push → order created → confirmation.

---

### 5. **Phase 5: Authentication, User Accounts & Email**

- **Objective:** Implement Supabase Auth with Google Sign-In (customers) and Gmail/GitHub (admin — just you), user profiles, order history, wishlist, and transactional email via Gmail API. Admin auth: single admin identified by your email, with `role: admin` in `profiles` table.

- **Files/Functions to Modify/Create:**
  - `src/lib/auth/config.ts` — Supabase Auth config (Google + GitHub OAuth)
  - `src/app/auth/signin/page.tsx` — sign in (email/password + Google)
  - `src/app/auth/signup/page.tsx` — sign up
  - `src/app/auth/callback/route.ts` — OAuth callback
  - `src/components/auth/signin-form.tsx` — email + password form
  - `src/components/auth/social-signin.tsx` — "Continue with Google" button
  - `src/components/auth/auth-provider.tsx` — React context for auth state
  - `src/app/account/page.tsx` — user dashboard
  - `src/app/account/profile/page.tsx` — edit profile
  - `src/app/account/orders/page.tsx` — order history
  - `src/app/account/orders/[id]/page.tsx` — order detail
  - `src/app/account/wishlist/page.tsx` — saved products
  - `src/components/account/profile-form.tsx` — editable profile
  - `src/components/account/order-list.tsx` — paginated orders
  - `src/components/account/wishlist-grid.tsx` — wishlist items
  - `src/lib/email/gmail.ts` — Gmail API client
  - `src/lib/email/templates.ts` — HTML email templates
  - `src/app/api/email/send/route.ts` — send email API
  - `src/middleware.ts` — auth-protect `/account/*`, `/checkout`, `/admin/*`

- **Tests to Write:**
  - `src/tests/components/auth/signin-form.test.tsx` — validation, submission
  - `src/tests/components/auth/social-signin.test.tsx` — Google button renders, triggers OAuth
  - `src/tests/app/account/profile.test.tsx` — loads user data, saves
  - `src/tests/app/account/orders.test.tsx` — order list, pagination
  - `src/tests/app/account/wishlist.test.tsx` — renders, remove
  - `src/tests/lib/email/gmail.test.ts` — sending, templates
  - `src/tests/middleware.test.ts` — redirects unauthenticated, admin role check

- **Steps:**
  1. Configure Supabase Auth: email/password + Google OAuth + GitHub OAuth. Set redirect URLs.
  2. Write tests for middleware — unauthenticated → redirect to `/auth/signin`, admin routes check `role === 'admin'`.
  3. Run tests — red.
  4. Implement `src/middleware.ts` with Supabase session + role checking.
  5. Run tests — green.
  6. Write tests for signin form and social signin.
  7. Run tests — red.
  8. Build signin page (email/password + "Continue with Google"), signup page, OAuth callback. For admin: also show "Continue with GitHub" on `/admin` login.
  9. Run tests — green.
  10. Write tests for profile, order history, wishlist pages.
  11. Run tests — red.
  12. Build account pages: dashboard, profile editor (name, phone, Kenyan address), order history, wishlist.
  13. Run tests — green.
  14. Write tests for Gmail API email sending and templates.
  15. Run tests — red.
  16. Implement Gmail API client. Templates: Welcome, Order Confirmation, Deposit Received, Shipping Update (Aquantuo tracking), Delivery Confirmation, Preorder Status.
  17. Run tests — green.
  18. Integrate email triggers into order flow.
  19. Add wishlist heart icon to product-card. Update header with logged-in user menu.
  20. Set your email as admin in `profiles.role` via Supabase dashboard or migration seed.

---

### 6. **Phase 6: Admin Dashboard & Price Crawler**

- **Objective:** Build a custom admin dashboard (gated to your account) for managing listings, orders, customers, and Sheets sync. Implement GitHub Actions crawlers for competitor prices (Badili, Phone Place, Jiji, Jumia) and source prices (Swappa, Reebelo, Back Market), storing in `price_comparisons`. Deploy crawlers to run on GCP VM via Docker.

- **Files/Functions to Modify/Create:**
  - `src/app/admin/layout.tsx` — admin layout with sidebar (role-gated to your account)
  - `src/app/admin/page.tsx` — dashboard (KPIs: orders, revenue, pending, low stock)
  - `src/app/admin/listings/page.tsx` — listings list with search, filter, bulk actions
  - `src/app/admin/listings/[id]/page.tsx` — listing editor
  - `src/app/admin/listings/new/page.tsx` — create listing
  - `src/app/admin/orders/page.tsx` — order list with status filters
  - `src/app/admin/orders/[id]/page.tsx` — order detail with status updater (triggers email)
  - `src/app/admin/customers/page.tsx` — customer list
  - `src/app/admin/sync/page.tsx` — Sheets sync status, manual trigger, log
  - `src/app/admin/prices/page.tsx` — price comparison dashboard
  - `src/components/admin/sidebar.tsx` — navigation
  - `src/components/admin/kpi-cards.tsx` — stat cards
  - `src/components/admin/listing-form.tsx` — create/edit listing form
  - `src/components/admin/order-status-updater.tsx` — status dropdown with email trigger
  - `src/components/admin/price-comparison-table.tsx` — Pedie vs. competitors matrix
  - `.github/workflows/price-crawler.yml` — cron: daily 3 AM UTC (6 AM EAT)
  - `scripts/crawlers/badili.ts` — Badili.co.ke prices
  - `scripts/crawlers/phoneplace.ts` — Phone Place Kenya prices
  - `scripts/crawlers/jiji.ts` — Jiji.co.ke listings
  - `scripts/crawlers/jumia.ts` — Jumia.co.ke prices
  - `scripts/crawlers/swappa.ts` — Swappa source prices
  - `scripts/crawlers/reebelo.ts` — Reebelo source prices
  - `scripts/crawlers/backmarket.ts` — Back Market source prices
  - `scripts/crawlers/utils.ts` — shared: fetch with retry, price parsing, rate limiting
  - `scripts/crawlers/index.ts` — orchestrator: runs all, upserts to Supabase
  - `src/lib/data/admin.ts` — admin data functions

- **Tests to Write:**
  - `src/tests/app/admin/dashboard.test.tsx` — KPI cards render
  - `src/tests/app/admin/listings.test.tsx` — list, create, edit
  - `src/tests/app/admin/orders.test.tsx` — list, status update
  - `src/tests/app/admin/prices.test.tsx` — comparison table renders
  - `src/tests/scripts/crawlers/utils.test.ts` — price parsing, retry, rate limiting
  - `src/tests/scripts/crawlers/badili.test.ts` — HTML parsing
  - `src/tests/scripts/crawlers/swappa.test.ts` — HTML parsing
  - `src/tests/scripts/crawlers/index.test.ts` — orchestrator, upserts
  - `src/tests/lib/data/admin.test.ts` — KPIs, CRUD

- **Steps:**
  1. Write tests for admin data functions.
  2. Run tests — red.
  3. Implement admin data functions. Add RLS allowing only `role = 'admin'` for admin queries.
  4. Run tests — green.
  5. Build admin layout with sidebar: Dashboard, Listings, Orders, Customers, Sheets Sync, Price Monitor. Gate with admin role check.
  6. Build dashboard with KPI cards + recent orders + low stock alerts.
  7. Build listing management: list (data table, search, filter by category/condition/status), create/edit form (all fields, image upload to Supabase Storage, listing ID auto-generation).
  8. Build order management: list (status badges, payment, date, customer), detail (status updater triggers email).
  9. Build Sheets sync page: last sync, status, manual "Sync Now", log.
  10. Write tests for crawler utilities.
  11. Run tests — red.
  12. Implement crawlers. Each: fetches listings for target models (iPhone 11, 12, 12 Pro Max, 13 Pro, MacBook Air M1), parses prices, returns `{competitor, product, price_kes, url, crawled_at}`. Use Playwright for JS-rendered (Jiji, Jumia), cheerio for static (Badili, Phone Place, Swappa).
  13. Implement orchestrator → upserts to `price_comparisons`.
  14. Run tests — green.
  15. Create `.github/workflows/price-crawler.yml` — daily cron, runs orchestrator, uses Supabase secrets.
  16. Build price comparison dashboard: table per product, Pedie vs. competitors + sources, margin calc, trend indicators, alerts when undercut.
  17. Verify full admin flow: login → dashboard → manage listings → update order → sync → price comparison.

---

### 7. **Phase 7: Deployment, SEO & Production Polish**

- **Objective:** Deploy to Vercel (Next.js SSR) + GCP VM (Docker containers for crawlers/sync workers). Configure pedie.tech domain with Cloudflare. Finalize SEO (sitemap, structured data, meta), performance tuning, PWA support, and Google Sheets webhook → site rebuild trigger. Flutter mobile app is deferred to a separate project.

- **Files/Functions to Modify/Create:**
  - `vercel.json` — Vercel config (region, env vars, rewrites)
  - `src/app/sitemap.ts` — dynamic sitemap from all products/listings/collections
  - `src/app/robots.ts` — robots.txt
  - `src/app/manifest.ts` — PWA manifest (Pedie branding)
  - `public/sw.js` — service worker for offline browsing
  - `next.config.ts` — production optimizations (image CDN, caching)
  - `.github/workflows/deploy.yml` — CI/CD: `bun test` → build → deploy Vercel + push Docker to GHCR
  - `.github/workflows/sheets-rebuild.yml` — Google Sheets webhook → trigger Vercel redeploy / ISR revalidation
  - Update `docker-compose.prod.yml` — finalize GCP VM services
  - Update `scripts/deploy.sh` — production-ready VPS deployment

- **Tests to Write:**
  - `src/tests/seo/sitemap.test.ts` — sitemap includes all products and collections
  - `src/tests/seo/metadata.test.ts` — pages have correct OpenGraph, Twitter, JSON-LD

- **Steps:**
  1. Deploy Next.js app to Vercel. Connect iamvikshan/pedie repo. Set environment variables.
  2. Configure Cloudflare DNS: `pedie.tech` → Vercel, GCP VM services via Cloudflare Tunnel.
  3. Deploy Docker containers to GCP VM using `scripts/deploy.sh` and `docker-compose.prod.yml`.
  4. Implement dynamic sitemap generation (`src/app/sitemap.ts`) — all products, listings, collections.
  5. Add structured data (JSON-LD): Product schema, AggregateRating, breadcrumbs.
  6. Optimize images: Next.js Image with Supabase CDN, blur placeholders, lazy loading.
  7. Implement PWA manifest and service worker for offline product browsing.
  8. Set up CI/CD workflow: push to main → `bun test` → Vercel deploy + GHCR Docker push.
  9. Create Sheets webhook → GitHub Actions workflow: Sheet update → trigger Vercel revalidation.
  10. Lighthouse audit: target 90+ on Performance, Accessibility, SEO, Best Practices.
  11. Security review: RLS policies, API route auth, CSRF, rate limiting.
  12. Production smoke test: browse → add to cart → checkout → M-Pesa sandbox → order confirmation.
  13. Go live. 🚀

---

**Open Questions (Resolved)**

| #   | Question                 | Resolution                                                                                      |
| --- | ------------------------ | ----------------------------------------------------------------------------------------------- |
| 1   | Hosting platform?        | **Vercel** (frontend/SSR) + **GCP VM** (Docker containers for crawlers/workers)                 |
| 2   | Google Sheets structure? | **Per-item** with listing IDs (PD-XXXXX), co-designed columns above                             |
| 3   | M-Pesa Daraja?           | Have account + till, **sandbox first** then integrate real                                      |
| 4   | Flutter mobile?          | **Deferred** — web store first                                                                  |
| 5   | Admin access?            | **Single admin** (your Gmail/GitHub), `role: admin` in profiles                                 |
| 6   | Runtime?                 | **Bun** — native tests, scripts, package management                                             |
| 7   | Repo?                    | **Rename** `pedie-tech/info` → `iamvikshan/pedie`, develop in-place                             |
| 8   | Types?                   | **Root `types/` directory** with path aliases (`@types/*`)                                      |
| 9   | Docker?                  | **Amina patterns** — multi-stage Dockerfile, docker-compose dev/prod, deploy script, Watchtower |
| 10  | Product model?           | **Per-item listings** with unique IDs (like Swappa), not batched by model                       |
