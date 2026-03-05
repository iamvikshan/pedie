# Product Architecture Reference

How products, listings, and cards are structured and displayed across Pedie.

---

## Data Model

### Product (Family)

A **product** is a unique brand + model combination (e.g., "Samsung Galaxy S24"). It groups multiple listings that share the same device but differ in storage, color, condition, or price.

| Field          | Type       | Description                                |
| -------------- | ---------- | ------------------------------------------ |
| `id`           | `uuid`     | Primary key                                |
| `brand`        | `string`   | Manufacturer (Samsung, Apple, etc.)        |
| `model`        | `string`   | Model name (Galaxy S24, iPhone 15)         |
| `slug`         | `string`   | URL-safe identifier (`samsung-galaxy-s24`) |
| `category_id`  | `uuid`     | FK → categories                            |
| `images`       | `string[]` | Product-level images                       |
| `description`  | `string`   | Marketing description                      |
| `key_features` | `string[]` | Bullet-point feature list                  |
| `specs`        | `jsonb`    | Technical specifications                   |

### Listing (Variant)

A **listing** is a specific purchasable item — one variant of a product with a defined condition, storage, color, and price.

| Field             | Type             | Description                                     |
| ----------------- | ---------------- | ----------------------------------------------- |
| `listing_id`      | `string`         | Human-readable ID (e.g., `PD-A001`)             |
| `product_id`      | `uuid`           | FK → products                                   |
| `listing_type`    | `enum`           | `standard`, `preorder`, `affiliate`, `referral` |
| `status`          | `enum`           | `available`, `sold`, `reserved`, `onsale`       |
| `condition`       | `ConditionGrade` | `premium`, `excellent`, `good`, `acceptable`    |
| `storage`         | `string`         | e.g., "128GB"                                   |
| `ram`             | `string`         | e.g., "8GB"                                     |
| `color`           | `string`         | e.g., "Phantom Black"                           |
| `price_kes`       | `number`         | Original price in KES                           |
| `final_price_kes` | `number`         | Selling price (after discount if any)           |
| `images`          | `string[]`       | Listing-specific images                         |

### ProductFamily (Aggregation)

The `ProductFamily` type (defined in `types/product.ts`) is the runtime aggregation used by the UI:

```ts
interface ProductFamily {
  product: Product
  listings: ListingWithProduct[]
  representative: ListingWithProduct // "best" listing shown on cards
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

| File      | `src/components/ui/productFamilyCard.tsx`              |
| --------- | ------------------------------------------------------ |
| Data type | `ProductFamily`                                        |
| Links to  | `/products/{product.slug}`                             |
| Shows     | Representative listing's price, condition, storage/RAM |
| Used by   | CustomerFavorites, CategoryShowcase, ProductFamilyGrid |

### ProductCard

| File      | `src/components/ui/productCard.tsx`                              |
| --------- | ---------------------------------------------------------------- |
| Data type | `ListingWithProduct`                                             |
| Links to  | `/listings/{listing.listing_id}` (or external URL for affiliate) |
| Shows     | Individual listing's price, condition, storage/RAM, type badges  |
| Used by   | HotDeals, ProductGrid, SimilarListings, DealsPage                |

### Pricing Display (3-Tier)

Both cards use `getPricingTier()` from `@helpers/pricing`:

| Tier           | Trigger                                    | Visual                                                               |
| -------------- | ------------------------------------------ | -------------------------------------------------------------------- |
| **Sale**       | `final < original` AND `status = 'onsale'` | `TbFlame` "Flash Sale" badge, red bold price, strikethrough original |
| **Discounted** | `final < original` AND `status ≠ 'onsale'` | Accent price + small discount % pill, strikethrough                  |
| **Normal**     | `final >= original`                        | Single accent price, no discount display                             |

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

### Listing Detail (`/listings/[listingId]`)

File: `src/app/(store)/listings/[listingId]/page.tsx`
Loading: `src/app/(store)/listings/[listingId]/loading.tsx`

Displays a **single listing** — one specific variant.

| Section           | Component            | Description                               |
| ----------------- | -------------------- | ----------------------------------------- |
| Image Gallery     | `ImageGallery`       | Listing-specific images                   |
| Listing Info      | `ListingInfo`        | Brand, model, condition, storage/RAM      |
| Price Display     | `PriceDisplay`       | 3-tier pricing                            |
| Variant Selector  | `VariantSelector`    | Switch between sibling variants in family |
| Better Deal Nudge | `BetterDealNudge`    | Cross-sell if cheaper variant exists      |
| Shipping Info     | `ShippingInfo`       | Delivery estimates                        |
| Add to Cart       | `AddToCart`          | Type-aware (blocks affiliate/referral)    |
| Description       | `ProductDescription` | From product-level data                   |
| Specs             | `ProductSpecs`       | From product-level data                   |
| Reviews           | `CustomerReviews`    | User reviews + rating stats               |
| Similar Listings  | `SimilarListings`    | `ProductCard` ×N                          |

### Collection Page (`/collections/[slug]`)

File: `src/app/(store)/collections/[slug]/page.tsx`
Loading: `src/app/(store)/collections/[slug]/loading.tsx`

Displays filtered listings for a category with sidebar filters, sort, and pagination.

| Section        | Component          | Card Used     | Description                                      |
| -------------- | ------------------ | ------------- | ------------------------------------------------ |
| Banner         | `CollectionBanner` | _(custom)_    | Category image + count                           |
| Filter Sidebar | `FilterSidebar`    | _(custom)_    | Condition, brand, storage, color, price, carrier |
| Product Grid   | `ProductGrid`      | `ProductCard` | Paginated listing grid                           |
| Pagination     | `Pagination`       | _(custom)_    | Page navigation                                  |

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
Product (brand + model)
  └── ProductFamily (aggregation with representative + variants)
       ├── → ProductFamilyCard (homepage favorites, category showcase)
       │     links to /products/[slug]
       └── listings[]
            ├── → ProductCard (deals, grids, similar listings)
            │     links to /listings/[listingId] or external URL
            └── → VariantSelector (on product/listing detail pages)
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
