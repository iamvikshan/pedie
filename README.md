# Pedie Tech — Refurbished Electronics Store

> **Custom e-commerce store for [pedie.tech](https://pedie.tech) — a refurbished electronics reseller in Kenya, built with Next.js 16, Bun, Supabase, and M-Pesa.**

---

## Tech Stack

| Layer         | Technology                             |
| ------------- | -------------------------------------- |
| **Framework** | Next.js 16.1.6 (App Router, React 19)  |
| **Runtime**   | Bun 1.3+                               |
| **Database**  | Supabase (PostgreSQL + Auth + Storage) |
| **Styling**   | Tailwind CSS 4 + shadcn/ui             |
| **Payments**  | M-Pesa (Daraja STK Push) + PayPal      |
| **Email**     | Gmail API (transactional)              |
| **Admin**     | @tanstack/react-table + recharts       |
| **Hosting**   | Vercel (primary) / Docker on VPS       |
| **CI/CD**     | GitHub Actions + semantic-release      |
| **Inventory** | Google Sheets → Apps Script → Supabase |

## Features

- **Per-item listings** — each physical unit gets a unique listing ID (PD-XXXXX), individual condition grade, battery health %, and price
- **M-Pesa STK Push** — one-tap mobile money payments with real-time callback processing
- **PayPal** — international payments with popup checkout
- **Preorder deposits** — 5% (phones < KES 70k), 10% (laptops ≥ KES 70k)
- **Admin dashboard** — KPIs, revenue charts, full CRUD for listings/products/orders/customers
- **Price crawlers** — 7 competitor sites crawled daily via GitHub Actions (Badili, PhonePlace, Swappa, BackMarket, Reebelo, Jiji, Jumia)
- **SEO** — dynamic sitemap, robots.txt, JSON-LD structured data, OpenGraph/Twitter cards
- **Auth** — Email/Password + Google OAuth via Supabase Auth
- **Security** — magic bytes file validation, M-Pesa IP allowlisting, XSS-safe JSON-LD, security headers

## Project Structure

```
src/
 app/                    # Next.js App Router pages & API routes
   ├── admin/              # Admin dashboard (10 management pages)
   ├── account/            # User account (orders, wishlist, settings)
   ├── api/                # API routes (payments, sync, revalidate, admin)
   ├── auth/               # Sign in/up pages
   ├── cart/               # Shopping cart
   ├── checkout/           # Multi-step checkout
   ├── collections/[slug]/ # Category browsing with filters
   ├── listings/[id]/      # Individual listing detail
   └── privacy/            # Privacy policy
 components/             # React components
   ├── admin/              # Admin UI (DataTable, forms, charts)
   ├── catalog/            # Filters, grid, pagination
   ├── home/               # Homepage sections
   ├── layout/             # Header, footer, mobile nav
   ├── listing/            # Listing detail components
   └── ui/                 # Reusable primitives (button, badge, card)
 lib/                    # Business logic
   ├── auth/               # Auth helpers (getUser, requireAuth, isAdmin)
   ├── cart/               # Zustand cart store
   ├── data/               # Supabase data layer (products, orders, admin)
   ├── email/              # Gmail API client + templates
   ├── payments/           # M-Pesa Daraja + PayPal clients
   ├── security/           # Magic bytes validation
   ├── seo/                # JSON-LD structured data helpers
   └── supabase/           # Client, server, admin Supabase clients
 proxy.ts                # Next.js 16 proxy (session refresh + security headers)
types/                      # TypeScript types (database, product, order, user, cart, filters)
scripts/
 crawlers/               # Price crawlers (7 sites)
 google-apps-script/     # Sheets inventory sync
 seed.ts                 # Database seed (20 products, 28 listings)
 deploy.sh               # VPS deployment script
tests/                      # 662 tests across 84 files
docs/ops/                   # Deployment guides (Next.js, Odoo, WooCommerce)
```

## Quick Start

```bash
# Clone & install
git clone https://github.com/iamvikshan/pedie.git
cd pedie
bun install
cp .env.example .env        # fill in Supabase + API credentials

# Development
bun dev                     # start dev server (Turbopack)

# Quality checks
bun check                   # lint + typecheck
bun test                    # run test suite
bun f                       # format with Prettier
```

## Scripts

| Command     | Description                     |
| ----------- | ------------------------------- |
| `bun dev`   | Start dev server with Turbopack |
| `bun build` | Production build                |
| `bun start` | Start production server         |
| `bun check` | ESLint + TypeScript type check  |
| `bun test`  | Run 662 tests                   |
| `bun f`     | Format all files (Prettier)     |
| `bun seed`  | Seed database with sample data  |
| `bun crawl` | Run price crawlers manually     |

> **Always use `bun`** — never `npm`, `npx`, or `node`.

## Deployment

See [docs/ops/nextjs-setup.md](docs/ops/nextjs-setup.md) for the comprehensive 14-step production setup guide covering Supabase, Google OAuth, Gmail API, M-Pesa Daraja, PayPal, Google Sheets Apps Script sync, Vercel deployment, Docker/VPS, Cloudflare, and security hardening.

### Quick Deploy (Vercel)

1. Import `iamvikshan/pedie` on [vercel.com](https://vercel.com)
2. Set all env vars from `.env.example`
3. Deploy — region: `cpt1` (Capetown)

### Quick Deploy (Docker)

```bash
cp .env.example .env        # fill in production values
bash scripts/deploy.sh
```

## CI/CD

- **`docker.yml`** — lint + test → semantic-release → Docker build + GHCR push (on push to main)
- **`crawler.yml`** — daily price crawling at 3 AM UTC

## Documentation

| Guide                                                            | Description                                  |
| ---------------------------------------------------------------- | -------------------------------------------- |
| [docs/ops/nextjs-setup.md](docs/ops/nextjs-setup.md)             | Next.js 16 production deployment (803 lines) |
| [docs/ops/odoo-setup.md](docs/ops/odoo-setup.md)                 | Odoo 19 on AWS Lightsail                     |
| [docs/ops/woocommerce-setup.md](docs/ops/woocommerce-setup.md)   | WooCommerce on AWS Lightsail                 |
| [docs/business/business-plan.md](docs/business/business-plan.md) | Business plan & strategy                     |
| [plans/pedie-store-plan.md](plans/pedie-store-plan.md)           | Development plan (all phases complete)       |

## License

Private — © Pedie Tech
