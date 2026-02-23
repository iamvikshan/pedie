## Phase 1 Complete: Project Bootstrap, Database & Data Pipeline

Bootstrapped the Pedie Tech e-commerce store with Next.js 16.1.6 on Bun, configured Supabase with the full per-item listing schema (10 tables, RLS, triggers, full-text search), built the Google Sheets → Supabase sync pipeline, set up Docker deployment (Amina patterns), and CI/CD via GitHub Actions.

**Files created/changed:**

- package.json (merged Next.js 16.1.6 deps, added scripts)
- tsconfig.json (path aliases: @/_, @types/_, @lib/_, @components/_)
- next.config.ts (Supabase images, standalone output)
- bunfig.toml (test preload config)
- eslint.config.mjs
- postcss.config.mjs
- .gitignore (Next.js, env, IDE entries)
- .prettierignore (.next/, out/, bun.lock)
- .env.example (all required env vars)
- .env.local (Supabase credentials)
- types/database.ts (full Supabase Database interface)
- types/product.ts (Product, Listing, ListingWithProduct, Category)
- types/order.ts (Order, OrderItem, OrderWithItems, ShippingAddress)
- types/user.ts (Profile, Address, UserRole)
- types/cart.ts (CartItem, Cart)
- types/index.ts (barrel export)
- src/lib/constants.ts (business constants + helpers)
- src/lib/supabase/client.ts (browser Supabase client)
- src/lib/supabase/server.ts (server Supabase client with cookies)
- src/lib/supabase/admin.ts (service-role admin client)
- src/lib/sheets/parser.ts (sheet row parser with numeric cleaning)
- src/lib/sheets/sync.ts (full sync service with crawler validation)
- src/app/api/sync/route.ts (API key-protected sync endpoint)
- src/app/layout.tsx (root layout with metadata, Inter font)
- src/app/page.tsx (placeholder homepage)
- src/app/globals.css (Tailwind CSS 4)
- Dockerfile (multi-stage Bun/Alpine: deps, prod-deps, builder, runner)
- docker-compose.yml (dev)
- docker-compose.prod.yml (prod: GHCR, Watchtower labels, Cloudflare Tunnel)
- scripts/deploy.sh (interactive VPS deployment)
- .github/workflows/docker.yml (lint → Docker build+push GHCR amd64+arm64)

**Functions created/changed:**

- usdToKes(), calculateDeposit(), generateListingId(), formatKes(), calculateDiscount()
- createBrowserClient() — Supabase browser client
- createServerSupabaseClient() — Supabase server client with cookie handling
- createAdminClient() — Supabase service-role client
- parseSheetRow() — maps Google Sheets row to listing fields with numeric cleaning
- cleanNumericString() — strips non-numeric chars for price parsing
- getGoogleSheetsClient() — authenticates with base64-decoded service account
- fetchSheetData() — reads all rows from configured sheet
- findOrCreateProduct() — ensures product exists by brand+model+category
- syncFromSheets() — main sync orchestrator with crawler field validation
- POST /api/sync — API key-protected sync trigger endpoint

**Tests created/changed:**

- src/**tests**/lib/constants.test.ts (16 tests: usdToKes, calculateDeposit, generateListingId, formatKes, calculateDiscount)
- src/**tests**/lib/sheets/sync.test.ts (22 tests: parseSheetRow, cleanNumericString, price cleaning, crawler field validation)
- src/**tests**/api/sync.test.ts (4 tests: auth validation, sync trigger)
- src/**tests**/lib/supabase/client.test.ts (4 tests: env vars, client creation)
- Total: 46 tests, 0 failures, 102 expect() calls

**Database (Supabase):**

- Project: pedie-store (region: eu-west-1, free tier)
- URL: https://tjspqeqqriuqkusuoxcy.supabase.co
- Tables: categories, products, listings, profiles, orders, order_items, reviews, price_comparisons, wishlist, newsletter_subscribers
- Enums: condition_grade, listing_status, order_status, payment_method, user_role
- RLS policies on all tables
- Triggers: auto-create profile on signup, auto-update timestamps
- Full-text search index on products (brand, model, description)

**Review Status:** APPROVED (after revision — fixed Docker multi-stage deps, Watchtower labels, env template, crawler field validation, price parsing)

**Git Commit Message:**

```
feat: bootstrap store with Next.js 16.1.6, Supabase, and Sheets sync

- Initialize Next.js 16.1.6 on Bun with TypeScript, Tailwind CSS 4, App Router
- Create Supabase schema with per-item listing model (PD-XXXXX IDs)
- Build Google Sheets → Supabase sync pipeline with crawler validation
- Set up Docker (multi-stage Bun), CI/CD (GHCR), and VPS deployment
- Add 46 tests covering constants, parsing, sync, and client setup
```
