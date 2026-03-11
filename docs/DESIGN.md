# Pedie Design System

Design language reference for [pedie.tech](https://pedie.tech) — a refurbished electronics e-commerce store targeting Kenya.

---

## Stack

| Layer     | Technology                             |
| --------- | -------------------------------------- |
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Runtime   | Bun ≥ 1.3                              |
| Language  | TypeScript 5.9                         |
| Styling   | Tailwind CSS 4.2 (`@theme` tokens)     |
| Animation | Framer Motion 12.34                    |
| Icons     | `react-icons/tb` (Tabler Icons)        |
| Theme     | `next-themes` (class strategy, system) |
| State     | Zustand (cart), React state elsewhere  |
| Auth / DB | Supabase (SSR client + RLS)            |
| Data      | Google Sheets ↔ Supabase bidirectional |
| Font      | Inter (via `next/font/google`)         |

## Quality Gate

```bash
bun run f       # prettier on git-changed files only
bun check       # eslint + tsc --noEmit (runs BOTH)
bun test        # bun test (happy-dom + @testing-library/react)
```

## Testing Setup

| Layer    | Technology                       | Purpose                                           |
| -------- | -------------------------------- | ------------------------------------------------- |
| Runner   | `bun test`                       | Built-in test runner                              |
| DOM      | `happy-dom`                      | Lightweight browser globals (window, document)    |
| Query    | `@testing-library/react`         | `render()`, `screen`, `getByRole`, etc.           |
| Matchers | `@testing-library/jest-dom`      | `toBeInTheDocument`, `toHaveAttribute`, etc.      |
| Preload  | `bunfig.toml` → `tests/setup.ts` | Registers happy-dom globals before all test files |

**Testing patterns:**

- **DOM tests** (preferred for UI): Render components with `render()`, query with `screen.getByRole/getByText`, assert with jest-dom matchers. Shared mocks in `tests/utils.tsx`.
- **Source-analysis** (for config, CSS, imports): Read source with `readFileSync` and assert on string patterns.
- **Logic/Mock** (for data fetching, utilities): `mock.module()` with no DOM needed.

---

## Color Palette

All colors are CSS custom properties defined in `src/app/globals.css` via `@theme`.

### Brand

| Token               | Light     | Dark | Usage                |
| ------------------- | --------- | ---- | -------------------- |
| `pedie-green`       | `#22c55e` | same | Primary accent / CTA |
| `pedie-green-light` | `#4ade80` | same | Hover highlights     |
| `pedie-green-dark`  | `#16a34a` | same | Hover state on CTAs  |
| `pedie-dark`        | `#0f1117` | same | Static dark surfaces |

### Semantic — Theme-Aware

| Token              | Light     | Dark      | Usage                     |
| ------------------ | --------- | --------- | ------------------------- |
| `pedie-bg`         | `#fafafa` | `#0f1117` | Page background           |
| `pedie-surface`    | `#ffffff` | `#161922` | Elevated surface (footer) |
| `pedie-card`       | `#ffffff` | `#1a1d27` | Card backgrounds          |
| `pedie-card-hover` | `#f5f5f5` | `#242836` | Card hover state          |
| `pedie-border`     | `#e5e7eb` | `#2a2e3a` | Borders / dividers        |
| `pedie-text`       | `#111827` | `#e8e8ed` | Primary text              |
| `pedie-text-muted` | `#6b7280` | `#9ca3af` | Secondary text            |
| `pedie-accent`     | `#22c55e` | same      | Accent (= green)          |

### Badge / Status Colors

| Token                    | Value     | Usage                 |
| ------------------------ | --------- | --------------------- |
| `pedie-badge-premium`    | `#a855f7` | Premium condition     |
| `pedie-badge-excellent`  | `#22c55e` | Excellent condition   |
| `pedie-badge-good`       | `#3b82f6` | Good condition        |
| `pedie-badge-acceptable` | `#f59e0b` | Acceptable condition  |
| `pedie-discount`         | `#ef4444` | Sale / discount price |

### Glass Tokens

| Token                | Light                    | Dark                     |
| -------------------- | ------------------------ | ------------------------ |
| `pedie-glass`        | `rgba(255,255,255,0.7)`  | `rgba(15,17,23,0.7)`     |
| `pedie-glass-border` | `rgba(255,255,255,0.2)`  | `rgba(255,255,255,0.08)` |
| `pedie-glass-hover`  | `rgba(255,255,255,0.85)` | `rgba(15,17,23,0.85)`    |

---

## CSS Utility Classes

Defined in `src/app/globals.css`:

| Class              | Purpose                                  |
| ------------------ | ---------------------------------------- |
| `.glass`           | Glassmorphism card — blur(24px) + border |
| `.glass-search`    | Sunken search input with inset shadow    |
| `.glass-depth`     | Header glass with drop shadow            |
| `.glass-footer`    | Footer glow with subtle green top shadow |
| `.hide-scrollbar`  | Hide scrollbar cross-browser             |
| `.hot-deals-timer` | Gold accent color for timer text         |

---

## Typography

- **Font:** Inter (`--font-sans: var(--font-inter)`)
- **Headings:** `font-bold`, sizes from `text-xl` to `text-4xl`
- **Body:** `text-sm` to `text-base`, `text-pedie-text`
- **Muted:** `text-pedie-text-muted`
- **Mono:** `font-mono` for timer countdowns, prices

---

## Component Patterns

> Full product/listing/card architecture: [`docs/product-architecture.md`](product-architecture.md)

### Product Card (Inline Pricing)

Cards compute pricing inline -- no `getPricingTier()` helper:

```ts
const isSale =
  listing.sale_price_kes != null && listing.sale_price_kes < listing.price_kes
const effectivePrice = isSale ? listing.sale_price_kes : listing.price_kes
```

| State      | Trigger                      | Visual                                       |
| ---------- | ---------------------------- | -------------------------------------------- |
| **Sale**   | `sale_price_kes < price_kes` | Discount % pill, strikethrough original, red |
| **Normal** | No sale price or not lower   | Single accent price, no discount display     |

Sale pricing is driven by `sale_price_kes` on listings, which can be set directly or via the `promotions` table. There is no `onsale` listing status.

**Card design (Phase 6c):**

- No specs section (storage/RAM removed from cards for uniform height)
- Images use `object-contain` (preserves aspect ratio, no cropping)
- Image aspect ratio: `aspect-[3/4]` (portrait)
- Price section: `min-h-[60px]` for consistent card height across tiers
- Badges retained: Flash Sale (`TbFlame`), Partner (`TbExternalLink`), Referral (`TbBrandWhatsapp`), ConditionBadge
- Card radius: `rounded-lg` (8px)

### Condition Badge

Icon-only with tooltip, uses `ConditionGrade`:

- `premium` → `TbCrown` (purple)
- `excellent` → `TbDiamond` (green)
- `good` → `TbThumbUp` (blue)
- `acceptable` → `TbCircleCheck` (amber)

### Mega-Menu

File: `src/components/layout/megaMenu.tsx` (client component)

Full-width Reebelo-style dropdown panel that appears on category hover in the header. Uses glassmorphism (`bg-pedie-glass backdrop-blur-xl`) with a `grid-cols-2 md:grid-cols-4` subcategory layout inside `pedie-container`.

- Receives `CategoryWithChildren[]` and `activeCategory` slug
- Displays direct children of the hovered parent category
- Closes on mouse leave or outside click
- Constrained inside `pedie-container` for consistent page width

### Breadcrumbs

File: `src/components/ui/breadcrumbs.tsx` (server component)

Rooted at `Shop` instead of `Home` — the logo handles home navigation. Uses `TbChevronRight` separators.

```
Shop > Category > Product Name
```

- Root segment always links to `/shop`
- Last segment is plain text (current page)
- Wrapped in `<nav aria-label='Breadcrumb'>` for accessibility

### SidebarPanel

File: `src/components/layout/sidebarPanel.tsx` (client component)

Unified mobile/desktop sidebar used for navigation. Features:

- Category list with images from `CATEGORY_IMAGES` map
- Quick links section (New Arrivals, Best Sellers, Deals, Repairs, Trade-In)
- User account links (profile, orders, wishlist)
- Theme toggle integrated
- Framer Motion `AnimatePresence` for slide-in/out
- Portal-rendered (`createPortal`) to avoid z-index issues
- Scroll-locked when open

### FooterAccordion

File: `src/components/layout/footerAccordion.tsx` (client component)

Button-based accordion replacing `<details>/<summary>` for footer link groups. Uses `useSyncExternalStore` to sync with viewport media query — desktop always expanded, mobile collapsed by default.

- `aria-expanded` reflects true state per viewport
- `aria-hidden` + `inert` on collapsed panels (prevents keyboard focus on hidden links)
- CSS `max-height` transition for smooth animation
- Chevron rotation indicator on mobile, hidden on desktop

### Header Stacked Actions

File: `src/components/layout/header.tsx` (client component)

Sticky glass header with `glass-depth` class. Action icons stacked horizontally:

- `ThemeToggle` (sun/moon)
- `UserMenu` (profile dropdown)
- `CartButton` (drawer trigger with item count badge)

### Popular Categories

File: `src/components/home/popularCategories.tsx` (server component)

Circular category thumbnails in a responsive grid (`grid-cols-4 md:grid-cols-5 lg:grid-cols-7`). Fixed circle dimensions (`h-20 w-20 md:h-24 md:w-24`, `rounded-full`). Shows all top-level categories from DB with images from `CATEGORY_IMAGES` map.

### Glassmorphism

Applied via `.glass` class or inline: `bg-pedie-glass backdrop-blur-[24px] border border-pedie-glass-border`

### Skeleton Loading States

All skeleton components live in `src/components/skeletons/`. Route-level loading files live alongside their `page.tsx`.

| Component                   | File                                      | Purpose                      |
| --------------------------- | ----------------------------------------- | ---------------------------- |
| `Skeleton`                  | `skeletons/skeleton.tsx`                  | Generic reusable pulse block |
| `ProductFamilyCardSkeleton` | `skeletons/productFamilyCardSkeleton.tsx` | Matches `ProductFamilyCard`  |
| `ProductCardSkeleton`       | `skeletons/productCardSkeleton.tsx`       | Matches `ProductCard`        |

**Rules:**

- Card-level skeletons apply `animate-pulse` on their root container (single cohesive unit, all children pulse in sync)
- Section-level skeletons (in `src/components/home/`) do **not** apply `animate-pulse` on their wrapper `<section>` — only on standalone header placeholders — since composed card skeletons already pulse independently
- `role='status'` + `aria-label='Loading'` on root element for accessibility
- `bg-pedie-card` + `border border-pedie-border` for themed appearance

See [`docs/product-architecture.md`](product-architecture.md) for full page → component → card mapping.

---

## Data Patterns

### Static Data (JSON)

- `src/data/hero.json` — Hero carousel slides
- `src/data/brands.json` — Brand logos and metadata (planned)

### Business Config

- `src/config.ts` — Non-secret values: `URLS`, `FOOTER_LINKS`, `URGENCY_TEXT`, exchange rates, shipping days

### Dynamic Data (Supabase)

- `src/lib/data/products.ts` — Featured, latest, category listings
- `src/lib/data/deals.ts` — Hot deals, deals page listings (sale-first priority)
- `src/lib/data/search.ts` — Full-text search with filters + pagination
- `src/lib/data/categories.ts` — Category fetching

### Path Aliases

| Alias           | Maps to            |
| --------------- | ------------------ |
| `@/*`           | `src/*`            |
| `@app-types/*`  | `types/*`          |
| `@lib/*`        | `src/lib/*`        |
| `@data/*`       | `src/lib/data/*`   |
| `@components/*` | `src/components/*` |
| `@utils/*`      | `src/utils/*`      |
| `@config`       | `src/config`       |
| `@helpers`      | `src/helpers`      |

---

## File Naming Conventions

- **Files/vars:** camelCase (`productCard.tsx`, `hotDeals.tsx`)
- **Constants:** UPPER_SNAKE_CASE (`FOOTER_LINKS`, `URGENCY_TEXT`)
- **Components:** PascalCase exports (`ProductCard`, `HotDeals`)
- **Data files:** camelCase JSON (`hero.json`, `brands.json`)

---

## Responsive Breakpoints

Tailwind defaults, mobile-first:

- `sm:` → 640px
- `md:` → 768px (tablet)
- `lg:` → 1024px (desktop)
- `xl:` → 1280px (large desktop)

### Container Strategy

The `.pedie-container` utility class (defined in `globals.css`) provides Reebelo-style responsive containment:

| Breakpoint     | Behavior                      |
| -------------- | ----------------------------- |
| Mobile         | 20px horizontal padding       |
| `sm:` (640px)  | 32px horizontal padding       |
| `lg:` (1024px) | `max-width: 1024px`, centered |
| `xl:` (1280px) | `max-width: 1280px`, centered |

Applied globally to all page sections. Exception: Hero banner remains full-bleed.

### Page Routes

| Route                 | File                                          | Purpose                                      |
| --------------------- | --------------------------------------------- | -------------------------------------------- |
| `/`                   | `src/app/page.tsx`                            | Homepage                                     |
| `/shop`               | `src/app/(store)/shop/page.tsx`               | Browse all — category filter + listings grid |
| `/repairs`            | `src/app/(store)/repairs/page.tsx`            | Repair services page                         |
| `/trade-in`           | `src/app/(store)/trade-in/page.tsx`           | Trade-in program page                        |
| `/deals`              | `src/app/(store)/deals/page.tsx`              | Discounted listings                          |
| `/search`             | `src/app/(store)/search/page.tsx`             | Full-text search                             |
| `/products/[slug]`    | `src/app/(store)/products/[slug]/page.tsx`    | Product family detail                        |
| `/listings/[sku]`     | `src/app/(store)/listings/[sku]/page.tsx`     | Single listing detail                        |
| `/collections/[slug]` | `src/app/(store)/collections/[slug]/page.tsx` | Category collection                          |

---

## Animation Principles

1. Use Framer Motion for enter/exit transitions and layout animations
2. Respect `prefers-reduced-motion` — CSS rule disables all transitions/animations
3. Auto-play carousels pause on hover/focus
4. Stagger children: 0.1s delay between items

---

## Accessibility

- All interactive elements must have `aria-label` or visible text
- Icon-only buttons use `aria-hidden` on icon + `sr-only` text
- Tab trapping in modals/drawers
- Focus management: return focus to trigger on close
- Semantic HTML: `nav`, `main`, `section`, `footer`
- Hidden elements: use `tabIndex={-1}` and `aria-hidden` when visually hidden
- Footer accordion: `inert` + `aria-hidden` on collapsed panels (prevents keyboard focus on hidden links)
- Breadcrumbs: `<nav aria-label='Breadcrumb'>` with semantic `<ol>/<li>`
- SidebarPanel: scroll lock + focus trap when open, portal-rendered
