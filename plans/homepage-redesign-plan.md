## Plan: Pedie Homepage Design Elevation

Modernize the Pedie homepage and global UI primitives — transitioning from a flat dark scaffold to an elevated, glass-morphism design with Framer Motion animations, icon state toggling (outline/filled), light + dark mode, multi-level header à la Reebelo, stock device imagery, and full responsive design across all screen sizes. The design is web-first but Flutter-reproducible (no CSS-only tricks that can't translate to `BackdropFilter`, `AnimationController`, etc.).

**Runtime:** Bun (native tests, scripts, package management)
**⚠️ IMPORTANT:** Always use `bun` for all commands — `bun test`, `bun run build`, `bun install`, `bun run lint`, `bun check`, etc. Do NOT use `npm`, `npx`, or `node` directly.
**✅ Quality Gate:** Every phase MUST pass `bun check` (`bun lint && tsc --noEmit`) before completion. Run `bun f && bun check && bun test` at the end of every phase.
**Resolved Tooling:** `{ pm: "bun", format: "bun f", lint: "bun lint", typecheck: "tsc --noEmit", test: "bun test", build: "bun run build", check: "bun check" }`

**Phase Count Rationale:**
- Phase 1 is foundational: deps, color tokens, light/dark system, branding, stock images, social config — everything else depends on it
- Phase 2 is the layout shell (multi-level header, footer, mobile nav, sliding "All Items" panel) — must exist before page-level sections
- Phase 3 is above-the-fold content (half-height JSON-driven hero carousel, trust badges, image-based popular categories) — the first impression
- Phase 4 handles product sections (modernized deals, customer favorites, category showcase) + sustainability — these all share the upgraded `ProductCard` primitive
- 4 phases is the minimum because each builds on the previous and each produces a reviewable, independently shippable increment

**Phases: 4**

---

### Key Decisions

| Decision | Resolution |
|---|---|
| Animation library | **Framer Motion** — better React DX, `whileInView` for scroll animations, `AnimatePresence` for panel/slide transitions |
| Color | **#22c55e** (Tailwind green-500) — full palette updated to match |
| Light/dark mode | **Yes** — `next-themes` + Tailwind v4 CSS variables, toggle in header |
| Newsletter on homepage | **Removed** — reserved for blog/contact pages. Component file kept for reuse. |
| Hero height | **~Half** current (`h-[220px] md:h-[280px]` from `h-[400px] md:h-[500px]`), JSON-config-driven slides, whole card slides |
| Header layout | **Multi-level** Reebelo-style: Row 1 (logo, search, icons), Row 2 (categories + "All Items" panel trigger) |
| Icon behavior | **Outline** default (`react-icons/tb`), **filled** on click/active state. Fallback to other react-icons sets if Tabler lacks a variant |
| Popular categories | **Circular images** (not emoji or icons) — Reebelo-style with real product photography |
| Daily deals | **Modernized** Reebelo-style card layout with prominent countdown and deal badges |
| "All Items" panel | **Rich content** — categories, featured collections, deals, brands, support links (Reebelo-style mega-menu) |
| Social URLs | Config-driven from `src/config.ts` — `@iamvikshan` across platforms, `@vikshan` on YouTube |
| Stock images | **Yes** — download royalty-free device photos for hero backgrounds and category circles |
| Responsiveness | **Full** — mobile-first responsive across all screen sizes (phones, tablets, desktop) |
| Categories | Keep current 6: Smartphones, Laptops, Tablets, Audio, Wearables, Accessories |

---

### 1. Phase 1: Design Foundation — Deps, Tokens, Light/Dark Mode, Branding & Assets

- **Objective:** Install `framer-motion`, `next-themes`; overhaul the full color palette around `#22c55e` with light and dark mode support; implement `next-themes` + Tailwind CSS v4 `@theme` + CSS `prefers-color-scheme`; rebrand from "Pedie Tech" → "Pedie" everywhere; add social URL config; update `Button` and `ConditionBadge` primitives with rounded corners and mode-aware styling; download stock device images to `public/images/`.

- **Files/Functions to Modify/Create:**
  - `package.json` — add `framer-motion`, `next-themes`; confirm `react-icons` Tabler subset
  - `src/app/globals.css` — full palette overhaul: light mode + dark mode CSS variables using Tailwind v4 `@theme` + `.dark` class strategy, glass tokens (`--glass-bg`, `--glass-border`, `--glass-blur`), updated green `#22c55e`, surface/card/text colors for both modes, smooth color transitions
  - `src/config.ts` — `SITE_NAME` → `'Pedie'`, updated `SITE_DESCRIPTION`, add `URLS` object with social links (`x: 'https://twitter.com/iamvikshan'`, `youtube: 'https://youtube.com/@vikshan'`, `instagram: 'https://instagram.com/iamvikshan'`, `facebook: 'https://facebook.com/iamvikshan'`, `github: 'https://github.com/iamvikshan'`)
  - `src/app/layout.tsx` — wrap with `ThemeProvider` from `next-themes` (attribute="class"), update all metadata to "Pedie", add `suppressHydrationWarning` on `<html>`
  - `src/lib/seo/structuredData.ts` — auto-picks up `SITE_NAME` change, add social `sameAs` URLs to org JSON-LD
  - `src/components/ui/button.tsx` — `rounded-xl`, add `outline` variant, mode-aware colors, subtle hover glow
  - `src/components/ui/conditionBadge.tsx` — `rounded-full` pill shape, mode-aware badge colors
  - **New:** `src/components/ui/themeToggle.tsx` — dark/light mode toggle using `next-themes` `useTheme()` + Tabler icons (`TbSun`/`TbMoonFilled`)
  - **New:** `public/images/` — stock device images (hero slides, category circles) from Unsplash/Pexels
  - **New:** `src/data/hero.json` — JSON config for hero carousel slides (title, subtitle, cta, link, image fields)
  - Update ALL branding references across all components/tests: "Pedie Tech" → "Pedie"

- **Tests to Write:**
  - `themeToggle exports and is a function`
  - `button renders with updated styling`
  - `button supports outline variant`
  - `conditionBadge uses pill shape`
  - `SITE_NAME is Pedie (not Pedie Tech)`
  - `URLS contains social media links`
  - `hero.json is valid with required fields`
  - Update existing header/footer branding tests

- **Steps:**
  1. Install `framer-motion`, `next-themes`; verify `react-icons/tb` import
  2. Download 8-10 royalty-free stock device images to `public/images/` (hero backgrounds, category circles for smartphones/laptops/tablets/audio/wearables/accessories)
  3. Create `src/data/hero.json` with 3 slides (title, subtitle, cta, link, image)
  4. Overhaul `globals.css` — dual-mode palette (light + dark), glass tokens, `#22c55e` green family, transition utilities
  5. Update `src/config.ts` (SITE_NAME, SITE_DESCRIPTION, URLS with social links)
  6. Update `src/app/layout.tsx` (metadata, ThemeProvider wrap, suppressHydrationWarning)
  7. Create `themeToggle.tsx` component with tests
  8. Update `Button` — `rounded-xl`, `outline` variant, mode-aware classes
  9. Update `ConditionBadge` — `rounded-full`, mode-aware
  10. Global find/replace "Pedie Tech" → "Pedie" in all components, SEO, tests
  11. Update structured data to include social `sameAs`
  12. Run `bun f && bun check && bun test` — all pass

---

### 2. Phase 2: Multi-Level Header, Footer & Navigation

- **Objective:** Redesign the header as a multi-level glass header inspired by Reebelo: **Row 1** (logo + search bar + user icons: cart, login/avatar, theme toggle) and **Row 2** (category nav links + "All Items" hamburger). Build a rich sliding "All Items" side panel with categories, collections, deals, brands, and support links. Modernize footer with Tabler social icons linked to config URLs and mode-aware styling. Rebuild mobile nav as a comprehensive sliding panel. All fully responsive. Icons use outline state by default, filled when active/clicked.

- **Files/Functions to Modify/Create:**
  - `src/components/layout/header.tsx` — complete rewrite: two-row glass header (`backdrop-blur-xl`, light/dark transparent backgrounds). Row 1: lowercase "pedie" wordmark, full-width search bar, cart icon (`TbShoppingCart`/`TbShoppingCartFilled`), user icon (`TbUser`/`TbUserFilled` or avatar), theme toggle. Row 2 (desktop): horizontal category links, right-aligned "All Items" hamburger. Mobile: compact single row with burger, logo, icons.
  - **New:** `src/components/layout/categoryNav.tsx` — Row 2 desktop category links (Smartphones, Laptops, Tablets, Accessories, Wearables, Audio) with hover underline animation, responsive hide on mobile
  - **New:** `src/components/layout/allItemsPanel.tsx` — full-height sliding panel from right (Framer Motion `AnimatePresence` slide-in/out). Rich content: all categories with images, featured collections section, daily deals link, popular brands grid, help/support links. Focus trap, escape-to-close, backdrop blur overlay.
  - `src/components/layout/searchBar.tsx` — glass input, Tabler search icon (`TbSearch`), always expanded on desktop, icon-only on mobile expanding on tap
  - `src/components/layout/mobileNav.tsx` — rewrite: comprehensive sliding panel from left with Framer Motion, glass blur background, Tabler icons, full category grid, account links, theme toggle
  - `src/components/layout/footer.tsx` — rebrand to "Pedie", Tabler social icons linked to `URLS.social.*` from config (`TbBrandX`, `TbBrandInstagram`, `TbBrandYoutube`, `TbBrandFacebook`, `TbBrandGithub`), mode-aware colors, refined M-PESA/PayPal badges, glass-styled newsletter form
  - `src/components/layout/footerNewsletterForm.tsx` — glass input styling, mode-aware
  - `src/components/auth/userMenu.tsx` — Tabler icons for dropdown items

- **Tests to Write:**
  - `header exports component`
  - `header renders pedie branding (lowercase)`
  - `categoryNav exports component`
  - `categoryNav defines 6 categories`
  - `allItemsPanel exports component`
  - `allItemsPanel includes categories and deals sections`
  - `footer renders Pedie branding`
  - `footer includes social links from config`
  - `mobileNav exports component`
  - `searchBar exports component`
  - Update existing header/footer tests

- **Steps:**
  1. Write tests for multi-level header and new components — run to see them fail
  2. Rewrite `header.tsx` — two-row glass header with Tabler icons (outline default, filled when active), fully responsive
  3. Create `categoryNav.tsx` — desktop category links row with hover animations
  4. Create `allItemsPanel.tsx` — rich sliding panel with Framer Motion, categories with images, deals, brands, support links, focus trap
  5. Rewrite `searchBar.tsx` — glass input, Tabler icon, responsive (expanded desktop, icon-toggle mobile)
  6. Rewrite `mobileNav.tsx` — Framer Motion panel, glass blur, comprehensive nav content
  7. Update `footer.tsx` — rebrand, Tabler social icons from `URLS.social`, mode-aware, responsive grid
  8. Update `footerNewsletterForm.tsx` — glass input, mode-aware
  9. Update `userMenu.tsx` — Tabler icons
  10. Responsive testing pass across breakpoints (320px, 375px, 768px, 1024px, 1440px)
  11. Run `bun f && bun check && bun test` — all pass

---

### 3. Phase 3: Hero Carousel, Trust Badges & Popular Categories

- **Objective:** Build a half-height hero carousel driven by `src/data/hero.json` where the entire card slides (not just content), with stock device backgrounds, Framer Motion slide transitions, and staggered text animations. Redesign trust badges as glass cards with Tabler icons and entrance animations. Replace popular categories emoji with Reebelo-style circular images. All fully responsive and mode-aware.

- **Files/Functions to Modify/Create:**
  - `src/components/home/heroBanner.tsx` — complete rewrite: half-height (`h-[220px] md:h-[280px]`), reads slides from `hero.json`, entire card slides via Framer Motion `AnimatePresence` + `motion.div` with horizontal slide animation (not just opacity), stock device background images per slide with gradient overlay, staggered text entrance (`motion.h2`, `motion.p`, `motion.a`), progress dots with active fill, pause/play, responsive text sizing, mode-aware overlay colors
  - `src/data/hero.json` — already created in Phase 1, but verify/update slide content and images
  - `src/components/home/trustBadges.tsx` — glass cards with Tabler icons (`TbShieldCheck`, `TbTruck`, `TbCircleCheck`, `TbRefresh`), Framer Motion `whileInView` stagger entrance, responsive grid (2-col mobile, 4-col desktop), mode-aware glass styling
  - `src/components/home/popularCategories.tsx` — complete rewrite: Reebelo-style circular image thumbnails instead of emoji, images from `public/images/categories/`, glass hover ring effect, Framer Motion stagger entrance, responsive grid (3-col mobile, 6-col desktop), mode-aware

- **Tests to Write:**
  - `heroBanner exports component`
  - `heroBanner reads from hero.json config`
  - `hero.json has valid slides with required fields (title, subtitle, cta, link, image)`
  - `trustBadges exports component and BADGE_TITLES with 4 items`
  - `trustBadges badge titles are non-empty strings`
  - `popularCategories exports component`
  - `popularCategories CATEGORY_IMAGES maps to image paths`
  - Update existing hero-banner and trust-badges tests

- **Steps:**
  1. Add category circle images to `public/images/categories/` (6 device photos cropped to circles)
  2. Write updated hero tests — run to see them fail
  3. Rewrite `heroBanner.tsx` — half-height, JSON-driven, whole-card slide transition, stock backgrounds, Framer Motion, responsive, mode-aware
  4. Run hero tests — confirm pass
  5. Write updated trust badge tests — run to fail
  6. Rewrite `trustBadges.tsx` — glass cards, Tabler icons, Framer Motion stagger, responsive, mode-aware
  7. Run trust badge tests — confirm pass
  8. Write popularCategories tests for circular images — run to fail
  9. Rewrite `popularCategories.tsx` — circular image thumbnails (not emoji), glass hover, Framer Motion, responsive, mode-aware
  10. Run `bun f && bun check && bun test` — all pass

---

### 4. Phase 4: Product Cards, Deals, Favorites, Showcase & Sustainability

- **Objective:** Elevate `ProductCard` to glass-morphism with Tabler icons and smooth hover animations. Modernize Daily Deals to Reebelo-style layout with prominent countdown, deal card badges, and urgency indicators. Refresh CustomerFavorites and CategoryShowcase with glass styling, Framer Motion scroll-triggered animations. Modernize Sustainability section with animated counters. **Remove** `NewsletterSignup` from homepage. All fully responsive and mode-aware.

- **Files/Functions to Modify/Create:**
  - `src/components/ui/productCard.tsx` — glass card, `rounded-2xl`, Tabler icons for wishlist (`TbHeart`/`TbHeartFilled`), battery (`TbBolt`), cart check (`TbCheck`/`TbShoppingCartPlus`), hover glow border, subtle image scale on hover, mode-aware, responsive sizing
  - `src/components/home/dailyDeals.tsx` — Reebelo-style modernization: larger deal cards with prominent discount percentage overlay, glass countdown timer (individual digit cards), urgency text ("X left!", "Selling fast"), Tabler flame icon (`TbFlame`/`TbFlameFilled`), horizontal scroll on mobile, grid on desktop, Framer Motion entrance, mode-aware
  - `src/components/home/customerFavorites.tsx` — glass pill tabs with Framer Motion `layoutId` active indicator, `whileInView` section entrance, responsive horizontal scroll, mode-aware
  - `src/components/home/categoryShowcase.tsx` — Framer Motion `whileInView` scroll entrance, "View All" with Tabler arrow (`TbArrowRight`), responsive, mode-aware
  - `src/components/home/sustainabilitySection.tsx` — Framer Motion animated number counters (scroll-triggered `useInView` + `animate`), Tabler icons (`TbRecycle`, `TbLeaf`, `TbShieldCheck`), glass stat cards, gradient orbs replacing SVG leaf pattern, responsive, mode-aware
  - `src/app/page.tsx` — **remove** `NewsletterSignup` import and rendering
  - `src/components/catalog/productGrid.tsx` — update for mode-aware empty state

- **Tests to Write:**
  - `productCard Tabler heart icon export check`
  - `productCard glass card styling constants`
  - `dailyDeals exports component`
  - `dailyDeals countdown timer logic`
  - `sustainabilitySection exports component`
  - `sustainabilitySection exports stat values`
  - `page.tsx does not import NewsletterSignup`
  - Update existing product-card and daily-deals tests

- **Steps:**
  1. Write ProductCard tests — run to fail
  2. Rewrite ProductCard — glass card, Tabler icons (outline/filled states), hover animations, mode-aware, responsive
  3. Run ProductCard tests — confirm pass
  4. Write DailyDeals tests — run to fail
  5. Rewrite DailyDeals — Reebelo-style deal cards, glass countdown digits, urgency indicators, Tabler flame, Framer Motion, responsive, mode-aware
  6. Run DailyDeals tests — confirm pass
  7. Update CustomerFavorites — glass pill tabs with `layoutId`, Framer Motion entrance, responsive
  8. Update CategoryShowcase — Framer Motion scroll entrance, Tabler arrow, responsive, mode-aware
  9. Write sustainability tests — run to fail
  10. Rewrite Sustainability — animated counters, Tabler icons, glass stat cards, gradient orbs, responsive, mode-aware
  11. Run sustainability tests — confirm pass
  12. Remove `NewsletterSignup` from `page.tsx` (keep component file for blog/contact reuse)
  13. Update `productGrid.tsx` for mode-aware empty state
  14. Full responsive check across breakpoints
  15. Run `bun f && bun check && bun test` — all pass

---

### Cross-Cutting: Error Handling & Resilience (woven into Phases 2–4)

Each phase should incorporate these resilience patterns as new components are built:

- **New:** `src/components/ui/errorBoundary.tsx` — reusable React error boundary wrapping major homepage sections (HeroBanner, CustomerFavorites, DailyDeals, CategoryShowcase, SustainabilitySection, ProductCard). Falls back to a graceful blank/retry card instead of crashing the page. Created in Phase 2, used in Phases 3–4.
- **Image `onError` fallbacks** — any `<Image>` or `<img>` gets an `onError` handler showing a placeholder (gradient, icon, or text). Applied in every phase where images are added.
- **`hero.json` parse error handling** — wrap JSON import/read in try/catch with fallback content (a single static slide). Applied in Phase 3.
- **Loading skeletons** — pulse placeholders for hero, categories, product cards. Applied per section as built.
- **Tests:** `errorBoundary exports and renders fallback on error`, `image fallback handler test`, `hero.json fallback on invalid data`.

---

### AI Logo Prompt

> **Prompt:** "A modern, minimal logo for 'pedie' — a premium refurbished electronics marketplace in Kenya. Design a clean geometric wordmark in all-lowercase with a distinctive stylized 'p' that can double as an app icon. Primary color: vibrant green (#22c55e) on a dark charcoal (#0f1117) background, and an inverted version on white (#fafafa). The aesthetic should feel premium and tech-forward — think Apple Store meets sustainable commerce. Flat/minimal design with subtle depth, no harsh gradients or 3D effects. The logomark 'p' should work at 16px favicon size and 200px header size equally well. Style: geometric, bold, sans-serif, modern SaaS aesthetic. Optional: incorporate a subtle leaf or circular-arrow motif into the 'p' letterform to hint at sustainability/refurbishment. Provide both dark-mode and light-mode variants."

---

### Open Questions (All Resolved)

| # | Question | Resolution |
|---|---|---|
| 1 | Hero slide content? | **JSON-config-driven** via `src/data/hero.json` — entire card slides, easily maintainable |
| 2 | Social media links? | **Config-driven** from `URLS.social` in `src/config.ts` — `@iamvikshan` everywhere, `@vikshan` on YouTube |
| 3 | "All Items" panel content? | **Rich content** — categories with images, featured collections, deals, brands, support (Reebelo-style) |
| 4 | Popular categories style? | **Circular images** (Reebelo-style) — stock product photos, not emoji or icons |
| 5 | Daily deals style? | **Reebelo-inspired** — prominent discount overlay, glass countdown digits, urgency indicators |
| 6 | Responsive target? | **Full responsive web app** — 320px through 1440px+, mobile-first |
