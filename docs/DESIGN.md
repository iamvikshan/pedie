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
bun f           # prettier --write .
bun check       # eslint + tsc --noEmit
bun test        # bun test (source-analysis pattern, NO jsdom)
```

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

### Product Card (3-Tier Pricing)

Cards use `getPricingTier(finalPriceKes, priceKes, status)` from `@helpers/pricing`:

| Tier           | Trigger                                    | Visual                                         |
| -------------- | ------------------------------------------ | ---------------------------------------------- |
| **Sale**       | `final < original` AND `status = 'onsale'` | Red discount pill, crossed-out price, bold red |
| **Discounted** | `final < original` AND `status ≠ 'onsale'` | Inline strikethrough + small % pill            |
| **Normal**     | `final >= original`                        | Single price, no discount display              |

### Condition Badge

Icon-only with tooltip, uses `ConditionGrade`:

- `premium` → `TbCrown` (purple)
- `excellent` → `TbDiamond` (green)
- `good` → `TbThumbUp` (blue)
- `acceptable` → `TbCircleCheck` (amber)

### Glassmorphism

Applied via `.glass` class or inline: `bg-pedie-glass backdrop-blur-[24px] border border-pedie-glass-border`

### Skeleton Loading States

All skeleton components live in `src/components/skeletons/`. Route-level loading files live alongside their `page.tsx`.

| Component                  | File                                           | Purpose                         |
| -------------------------- | ---------------------------------------------- | ------------------------------- |
| `Skeleton`                 | `skeletons/skeleton.tsx`                        | Generic reusable pulse block    |
| `ProductFamilyCardSkeleton`| `skeletons/productFamilyCardSkeleton.tsx`       | Matches `ProductFamilyCard`     |
| `ProductCardSkeleton`      | `skeletons/productCardSkeleton.tsx`             | Matches `ProductCard`           |

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
