# Product Architecture Reference

How products, listings, and cards are structured and displayed across Pedie.

---

## Data Model

### Product (Family)

A **product** is a unique brand + model combination (e.g., "Samsung Galaxy S24"). It groups multiple listings that share the same device but differ in storage, color, condition, or price.

| Field          | Type       | Description                                |
| -------------- | ---------- | ------------------------------------------ |
| `id`           | `uuid`     | Primary key                                |
| `brand_id`     | `uuid`     | FK -> brands (normalized brand reference)  |
| `name`         | `text`     | Model name (Galaxy S24, iPhone 15)         |
| `slug`         | `text`     | URL-safe identifier (`samsung-galaxy-s24`) |
| `description`  | `text`     | Marketing description                      |
| `key_features` | `text[]`   | Bullet-point feature list                  |
| `images`       | `text[]`   | Product-level images                       |
| `specs`        | `jsonb`    | Technical specifications                   |
| `is_active`    | `boolean`  | Soft-delete flag                           |
| `fts`          | `tsvector` | Full-text search (brand + name + desc)     |

Products reference brands via `brand_id` FK (not a free-text string). Categories are assigned via the `product_categories` junction table -- there is no `category_id` on products.

### Brand

Normalized brand registry. All products FK here.

| Field         | Type      | Description                       |
| ------------- | --------- | --------------------------------- |
| `id`          | `uuid`    | Primary key                       |
| `name`        | `text`    | Display name ("Apple", "Samsung") |
| `slug`        | `text`    | URL-safe, unique                  |
| `logo_url`    | `text`    | Brand logo image URL              |
| `website_url` | `text`    | Official brand website            |
| `is_active`   | `boolean` | Show in storefront filters        |

### ProductCategories (Junction)

Many-to-many between products and categories.

| Field         | Type      | Description                            |
| ------------- | --------- | -------------------------------------- |
| `product_id`  | `uuid`    | FK -> products                         |
| `category_id` | `uuid`    | FK -> categories                       |
| `is_primary`  | `boolean` | Canonical category for breadcrumbs/nav |

Every product must have exactly one row with `is_primary = true`. The primary category is resolved at query time via `getPrimaryCategoryForProduct()`.

### Listing (Variant)

A **listing** is a specific purchasable item -- one variant of a product with a defined condition, storage, color, and price.

| Field             | Type              | Description                                                      |
| ----------------- | ----------------- | ---------------------------------------------------------------- |
| `id`              | `uuid`            | Primary key (internal)                                           |
| `sku`             | `text`            | Auto-generated unique ID (e.g., `SWP-APL-IP15P-EXC-001`)         |
| `product_id`      | `uuid`            | FK -> products                                                   |
| `condition`       | `condition_grade` | `new`, `premium`, `excellent`, `good`, `acceptable`, `for_parts` |
| `color`           | `text`            | e.g., "Phantom Black"                                            |
| `storage`         | `text`            | e.g., "128GB"                                                    |
| `ram`             | `text`            | e.g., "8GB"                                                      |
| `battery_health`  | `integer`         | Battery percentage (0-100)                                       |
| `warranty_months` | `integer`         | Warranty period in months                                        |
| `attributes`      | `jsonb`           | Category-specific fields (screen_size, gpu, etc.)                |
| `cost_kes`        | `numeric`         | What Pedie paid (internal, never shown)                          |
| `price_kes`       | `numeric`         | Retail price in KES                                              |
| `sale_price_kes`  | `numeric`         | Promotional price (if discounted)                                |
| `images`          | `text[]`          | Listing-specific photos                                          |
| `quantity`        | `integer`         | Stock count (usually 1 for refurbished)                          |
| `listing_type`    | `listing_type`    | `standard`, `preorder`, `affiliate`, `referral`                  |
| `status`          | `listing_status`  | `draft`, `active`, `reserved`, `sold`, `returned`, `archived`    |
| `is_featured`     | `boolean`         | Featured on homepage                                             |
| `admin_notes`     | `text`            | Internal notes (not user-facing)                                 |
| `notes`           | `text[]`          | User-facing notes ("Minor scratch on back")                      |
| `includes`        | `text[]`          | What comes with it ("Charger", "Original box")                   |
| `source`          | `text`            | Where acquired (swappa, reebelo, etc.)                           |
| `source_url`      | `text`            | Original listing URL                                             |
| `source_id`       | `text`            | ID on the source platform                                        |

**Pricing model:** There is no `final_price_kes` column -- the effective price is computed inline. At the SQL/cart layer, `COALESCE(sale_price_kes, price_kes)` selects the best available price. At the UI card layer, a stricter `isSale` guard applies: `sale_price_kes` is only used when non-null AND less than `price_kes` (see Pricing Display below).

**SKU** is auto-generated by a database trigger on INSERT. Format: `{SRC}-{BRAND}-{MODEL}-{CONDITION}-{SEQ}` (e.g., `SWP-APL-IP15P-EXC-001`).

### Promotions

Table-driven promotional events. An item can be a deal even without a discount.

| Field                 | Type             | Description                                          |
| --------------------- | ---------------- | ---------------------------------------------------- |
| `id`                  | `uuid`           | Primary key                                          |
| `name`                | `text`           | Display name ("Flash Sale Friday")                   |
| `type`                | `promotion_type` | flash_sale, deal, clearance, featured, seasonal      |
| `listing_id`          | `uuid`           | Target specific listing (or null)                    |
| `product_id`          | `uuid`           | Target all listings of a product (or null)           |
| `discount_pct`        | `numeric`        | Percentage discount (mutually exclusive with amount) |
| `discount_amount_kes` | `numeric`        | Fixed amount discount                                |
| `starts_at`           | `timestamptz`    | Promotion start                                      |
| `ends_at`             | `timestamptz`    | Promotion end                                        |

Promotion discounts are applied via `applyPromotionDiscount()` and reflected in `sale_price_kes`.

### ProductFamily (Aggregation)

The `ProductFamily` type (defined in `types/product.ts`) is the runtime aggregation used by the UI:

```ts
interface ProductFamily {
  product: ProductWithBrand
  listings: Listing[]
  representative: Listing // "best" listing shown on cards
  variantCount: number
}
```

The **representative** listing is the cheapest available variant — displayed on cards and used for pricing display. Users can then explore all variants on the product detail page.

---

## Listing Types

| Type        | Behavior                                     | Cart   | Card Badge                     |
| ----------- | -------------------------------------------- | ------ | ------------------------------ |
| `standard`  | Normal purchase flow                         | ✅ Yes | _(none)_                       |
| `preorder`  | Deposit-based, shows estimated delivery date | ✅ Yes | "Pre-order"                    |
| `affiliate` | Links out to external partner site           | ❌ No  | "Partner" + `TbExternalLink`   |
| `referral`  | WhatsApp CTA, no direct purchase             | ❌ No  | "Referral" + `TbBrandWhatsapp` |

Cart validation (`src/lib/cart/validation.ts`) blocks `affiliate` and `referral` listings from being added to cart.

---

## Card Components

### ProductFamilyCard

| File      | `src/components/ui/productFamilyCard.tsx`               |
| --------- | ------------------------------------------------------- |
| Data type | `ProductFamily`                                         |
| Links to  | `/products/{product.slug}`                              |
| Shows     | Representative listing's price, condition, product name |
| Used by   | CustomerFavorites, CategoryShowcase, ProductFamilyGrid  |

### ProductCard

| File      | `src/components/ui/productCard.tsx`                              |
| --------- | ---------------------------------------------------------------- |
| Data type | `ListingWithProduct`                                             |
| Links to  | `/listings/{listing.sku}` (or external URL for affiliate)        |
| Shows     | Individual listing's price, condition, type badges, product name |
| Used by   | HotDeals, ProductGrid, SimilarListings, DealsPage                |

### Pricing Display (Inline)

Both cards compute pricing inline using `isSale` logic:

```ts
const isSale =
  listing.sale_price_kes != null && listing.sale_price_kes < listing.price_kes
const effectivePrice = isSale ? listing.sale_price_kes : listing.price_kes
```

| State      | Trigger                      | Visual                                       |
| ---------- | ---------------------------- | -------------------------------------------- |
| **Sale**   | `sale_price_kes < price_kes` | Discount % pill, strikethrough original, red |
| **Normal** | No sale price or not lower   | Single accent price, no discount display     |

Sale state is driven by the `sale_price_kes` field on listings, which can be set directly or via promotion discounts (`applyPromotionDiscount()`). There is no `onsale` status value.

**Card dimensions (Phase 6c):**

- Specs section (storage/RAM) removed from both card types for uniform height
- Images use `object-contain` to preserve aspect ratio (no cropping/stretching)
- Price section uses `min-h-[60px]` for consistent card height across pricing tiers
- All badges retained: Flash Sale, Partner, Referral, ConditionBadge

---

## Category Hierarchy

### Structure

Categories use a parent/child hierarchy with `parent_id` FK:

```
Electronics (root, hidden from nav)
  +-- Smartphones
  +-- Laptops
  +-- Tablets
  +-- Accessories
  +-- Wearables
  +-- Audio
  |     +-- Earphones
  |     +-- Headphones
  |     +-- Speakers
  +-- Gaming
```

"Electronics" is a root category that is **not** shown in navigation — its direct children are the top-level nav items. The `getTopLevelCategories()` function returns only direct children of Electronics.

### Descendant ID Resolution

`getCategoryAndDescendantIds(categoryId)` in `src/lib/data/categories.ts` performs a BFS traversal to collect a parent category and all its descendants. This is used by:

- `getProductFamiliesByCategory()` — fetch products in a category + all subcategories
- `getListings()` — filter listings by category tree (`.in()` operator, not `.eq()`)
- `getDealsListings()` — category-filtered deals

The `.in()` fix (replacing `.eq()`) resolved a bug where collection pages for parent categories (e.g., Audio) showed no products because they only checked the parent ID, not descendants.

### Category Tree Building

`getCategoryTree()` builds a `CategoryWithChildren[]` tree used by the mega-menu and sidebar. It groups categories by `parent_id` and recursively constructs the hierarchy.

---

## Skeleton Components

All skeletons live in `src/components/skeletons/`:

| Component                   | File                            | Mirrors             |
| --------------------------- | ------------------------------- | ------------------- |
| `Skeleton`                  | `skeleton.tsx`                  | Generic pulse block |
| `ProductFamilyCardSkeleton` | `productFamilyCardSkeleton.tsx` | `ProductFamilyCard` |
| `ProductCardSkeleton`       | `productCardSkeleton.tsx`       | `ProductCard`       |

Section-level skeletons (in `src/components/home/`):

| Component                   | Uses                           | Purpose                                 |
| --------------------------- | ------------------------------ | --------------------------------------- |
| `CustomerFavoritesSkeleton` | `ProductFamilyCardSkeleton` ×4 | Suspense fallback for favorites section |
| `HotDealsSkeleton`          | `ProductCardSkeleton` ×4       | Suspense fallback for deals section     |
| `CategoryShowcaseSkeleton`  | `ProductFamilyCardSkeleton` ×4 | Suspense fallback for category sections |

All skeletons follow the pattern:

- Card-level skeletons apply `animate-pulse` on their root container (single cohesive unit)
- Section-level skeletons (e.g., `HotDealsSkeleton`) do **not** apply `animate-pulse` on their wrapper — only on header placeholders — since the composed card skeletons already pulse
- `role='status'` + `aria-label='Loading'` on root element for accessibility
- `bg-pedie-card` + `border border-pedie-border` for theming

---

## Pages & What They Display

### Homepage (`/`)

File: `src/app/page.tsx`

| Section              | Component               | Card Used           | Data Source                      | Streaming                                    |
| -------------------- | ----------------------- | ------------------- | -------------------------------- | -------------------------------------------- |
| Hero Banner          | `HeroBanner`            | _(custom)_          | Static JSON                      | Immediate                                    |
| Trust Badges         | `TrustBadges`           | _(custom)_          | Static                           | Immediate                                    |
| Popular Categories   | `PopularCategories`     | _(custom)_          | Static                           | Immediate                                    |
| Customer Favorites   | `CustomerFavorites`     | `ProductFamilyCard` | `getProductFamilies(12)`         | `<Suspense>` via `CustomerFavoritesServer`   |
| Hot Deals            | `HotDeals`              | `ProductCard`       | `getHotDealsListings()`          | `<Suspense>` via `HotDealsServer`            |
| Category Showcase ×2 | `CategoryShowcase`      | `ProductFamilyCard` | `getProductFamiliesByCategory()` | `<Suspense>` (self-fetching async component) |
| Sustainability       | `SustainabilitySection` | _(custom)_          | Static                           | Immediate                                    |

### Product Detail (`/products/[slug]`)

File: `src/app/(store)/products/[slug]/page.tsx`
Loading: `src/app/(store)/products/[slug]/loading.tsx`

Displays a **ProductFamily** — all variants of a single product.

| Section            | Component             | Description                                            |
| ------------------ | --------------------- | ------------------------------------------------------ |
| Image Gallery      | `ImageGallery`        | Product-level images with thumbnails                   |
| Product Info       | `ProductDetailClient` | Variant selector + price + Add to Cart                 |
| ↳ Variant Selector | `VariantSelector`     | Storage pills, color swatches, condition buttons       |
| ↳ Add to Cart      | `AddToCart`           | Type-aware CTA (or `ReferralCta` for referral)         |
| ↳ Better Deal      | `BetterDealNudge`     | Cross-sell to cheaper variant if available             |
| Description        | `ProductDescription`  | Rich text + key features                               |
| Specs              | `ProductSpecs`        | Technical specifications table                         |
| Similar Listings   | `SimilarListings`     | `ProductCard` ×N — related listings from same category |

### Listing Detail (`/listings/[sku]`)

File: `src/app/(store)/listings/[sku]/page.tsx`
Loading: `src/app/(store)/listings/[sku]/loading.tsx`

Displays a **single listing** -- one specific variant.

| Section           | Component            | Description                                      |
| ----------------- | -------------------- | ------------------------------------------------ |
| Image Gallery     | `ImageGallery`       | Listing-specific images                          |
| Listing Info      | `ListingInfo`        | Brand name, product name, condition, storage/RAM |
| Price Display     | `PriceDisplay`       | Inline isSale pricing                            |
| Variant Selector  | `VariantSelector`    | Switch between sibling variants in family        |
| Better Deal Nudge | `BetterDealNudge`    | Cross-sell if cheaper variant exists             |
| Shipping Info     | `ShippingInfo`       | Delivery estimates                               |
| Add to Cart       | `AddToCart`          | Type-aware (blocks affiliate/referral)           |
| Description       | `ProductDescription` | From product-level data                          |
| Specs             | `ProductSpecs`       | From product-level data                          |
| Reviews           | `CustomerReviews`    | User reviews + rating stats                      |
| Similar Listings  | `SimilarListings`    | `ProductCard` ×N                                 |

### Collection Page (`/collections/[slug]`)

File: `src/app/(store)/collections/[slug]/page.tsx`
Loading: `src/app/(store)/collections/[slug]/loading.tsx`

Displays filtered listings for a category with sidebar filters, sort, and pagination.

| Section        | Component          | Card Used     | Description                             |
| -------------- | ------------------ | ------------- | --------------------------------------- |
| Banner         | `CollectionBanner` | _(custom)_    | Category image + count                  |
| Filter Sidebar | `FilterSidebar`    | _(custom)_    | Condition, brand, storage, color, price |
| Product Grid   | `ProductGrid`      | `ProductCard` | Paginated listing grid                  |
| Pagination     | `Pagination`       | _(custom)_    | Page navigation                         |

### Deals Page (`/deals`)

File: `src/app/(store)/deals/page.tsx`

Displays discounted and on-sale listings.

| Section    | Card Used     | Data Source                                |
| ---------- | ------------- | ------------------------------------------ |
| Deals Grid | `ProductCard` | `getDealsListings()` — sale-first priority |

### Search Page (`/search`)

File: `src/app/(store)/search/page.tsx`

Full-text search with filters and pagination.

| Section        | Component     | Card Used     |
| -------------- | ------------- | ------------- |
| Search Results | `ProductGrid` | `ProductCard` |

---

## Grid Components

| Component           | File                                           | Card Used           | Used By                      |
| ------------------- | ---------------------------------------------- | ------------------- | ---------------------------- |
| `ProductGrid`       | `src/components/catalog/productGrid.tsx`       | `ProductCard`       | Collection, Search           |
| `ProductFamilyGrid` | `src/components/catalog/productFamilyGrid.tsx` | `ProductFamilyCard` | _(available for future use)_ |

---

## Data Flow Summary

```
Product (brand_id -> brands.name + product.name)
  +-- ProductFamily (aggregation with representative + variants)
       +-- -> ProductFamilyCard (homepage favorites, category showcase)
       |     links to /products/[slug]
       +-- listings[]
            +-- -> ProductCard (deals, grids, similar listings)
            |     links to /listings/[sku] or external URL
            +-- -> VariantSelector (on product/listing detail pages)
                  client-side state, no network calls
```

### Where Each Card Type Appears

| Card                | Homepage | Product Detail | Listing Detail | Collection | Deals | Search |
| ------------------- | -------- | -------------- | -------------- | ---------- | ----- | ------ |
| `ProductFamilyCard` | ✅       | —              | —              | —          | —     | —      |
| `ProductCard`       | ✅       | ✅ (similar)   | ✅ (similar)   | ✅         | ✅    | ✅     |

---

## Server / Client Boundary

| Component                 | Rendering | Why                                    |
| ------------------------- | --------- | -------------------------------------- |
| `ProductFamilyCard`       | Server    | No interactivity, just links           |
| `ProductCard`             | Server    | No interactivity, just links           |
| `MegaMenu`                | Client    | Hover state, mouse leave detection     |
| `SidebarPanel`            | Client    | Open/close state, portal, scroll lock  |
| `FooterAccordion`         | Client    | Toggle state, viewport-aware ARIA      |
| `CustomerFavorites`       | Client    | Tab switching, scroll state            |
| `HotDeals`                | Client    | Countdown timer, auto-scroll, hover    |
| `CategoryShowcase`        | Server    | Async data fetching, no client state   |
| `ProductDetailClient`     | Client    | Variant selection state, cart actions  |
| `VariantSelector`         | Client    | Interactive dimension pickers          |
| `AddToCart`               | Client    | Zustand cart store                     |
| `CustomerFavoritesServer` | Server    | Async data fetching → passes to client |
| `HotDealsServer`          | Server    | Async data fetching → passes to client |

---

## Loading Strategy

| Page / Section         | Strategy                                      |
| ---------------------- | --------------------------------------------- |
| Homepage static        | Immediate render (no data dependency)         |
| Homepage data sections | `<Suspense>` streaming with section skeletons |
| Product detail         | Route-level `loading.tsx` skeleton            |
| Listing detail         | Route-level `loading.tsx` skeleton            |
| Collection page        | Route-level `loading.tsx` skeleton            |
| Search page            | Route-level `loading.tsx` skeleton            |

---

## Admin Audit Logging

All admin mutations (create, update, delete on products, listings, categories, and order status changes) are recorded in the `admin_log` table. The `logAdminEvent()` utility (`src/lib/data/audit.ts`) uses a fire-and-forget pattern -- it inserts asynchronously via `.then()`, catches errors with `console.error`, and never throws. This ensures audit failures never block the admin action that triggered them.

The same table stores sync history (formerly `sync_log`), preserving backward compatibility for the sync dashboard.

---

## CSP Strategy

Hybrid Content Security Policy approach:

- **Static routes** (storefront, product pages, collections): `script-src 'self'`. No nonce required, preserving ISR/static caching.
- **Dynamic routes** (`/checkout`, `/admin`, `/account`, `/auth`, `/api`): Nonce-based CSP with `script-src 'self' 'nonce-{nonce}'`. A `crypto.randomUUID()` nonce is generated per request in the middleware (`src/proxy.ts`) and forwarded via the `x-csp-nonce` request header. Sub-layouts can read this header via `headers()` if they need nonce access for inline scripts.
- **Development**: `'unsafe-eval'` is appended to `script-src` to support hot module replacement.

HSTS is set to 2 years with `includeSubDomains` and `preload` both in the middleware and in `vercel.json` global headers.

---

## M-Pesa Accepted Risk

Safaricom Daraja API does not provide HMAC signatures for callback verification. The current security model uses IP allowlist combined with a header secret. This is the documented best practice from Safaricom and is an accepted risk for M-Pesa integration in Kenya.
