# Pedie Database Architecture

Database schema reference for [pedie.tech](https://pedie.tech) -- a refurbished electronics e-commerce store targeting Kenya.

**Database:** Supabase (PostgreSQL) with RLS + SSR client
**Sync:** Google Sheets (bidirectional) for catalog management
**Auth:** Supabase Auth (email+password, Google OAuth, username lookup)

---

## Glossary

| Term              | What It Is                                                                                     | Example                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Product**       | The CONCEPT of an item. A name, brand, description, images. You cannot buy a product directly. | "iPhone 15 Pro"                                           |
| **Listing**       | A SPECIFIC buyable unit of a product. Has its own SKU, price, condition, color.                | "This iPhone 15 Pro, 128GB, Black, Excellent, KES 85,000" |
| **Catalog**       | Informal term for all products + listings. NOT a database entity.                              | "Our entire catalog"                                      |
| **Inventory**     | "How many of each listing do I have?" For refurbished = always 1 (each item is unique).        | quantity = 1                                              |
| **ProductFamily** | Runtime aggregation: one product + all its listings. Used by the frontend to group variants.   | iPhone 15 Pro with 12 listings                            |
| **SKU**           | Stock Keeping Unit. Auto-generated unique identifier encoding source, brand, model, condition. | `SWP-APL-IP15P-EXC-001`                                   |

---

## Enums

```sql
-- Item condition grading
CREATE TYPE condition_grade AS ENUM (
  'new',          -- factory sealed
  'premium',      -- like-new, no visible wear
  'excellent',    -- minimal wear, fully functional
  'good',         -- light wear, fully functional
  'acceptable',   -- visible wear, fully functional
  'for_parts'     -- not fully functional, sold for parts/repair
);

-- Listing availability state (NOT promotion state)
CREATE TYPE listing_status AS ENUM (
  'draft',        -- being prepared, not visible to customers
  'active',       -- available for purchase
  'reserved',     -- held for a pending order
  'sold',         -- purchased
  'returned',     -- returned by customer
  'archived'      -- removed from store, kept for records
);

-- How this listing is sold / sourced
CREATE TYPE listing_type AS ENUM (
  'standard',     -- normal purchase flow, add to cart
  'preorder',     -- deposit-based, estimated delivery date
  'affiliate',    -- links out to external partner site, cannot add to cart
  'referral'      -- WhatsApp CTA, no direct purchase
);

-- Time-bound promotions
CREATE TYPE promotion_type AS ENUM (
  'flash_sale',   -- steep discount, urgency badge + timer. Requires discount.
  'deal',         -- great value / staff pick, featured in Deals page. No discount required.
  'clearance',    -- getting rid of stock. Usually discounted.
  'featured',     -- spotlight / homepage feature. No discount required.
  'seasonal'      -- holiday / event sale. Usually discounted.
);

-- Order lifecycle
CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'processing', 'shipped',
  'delivered', 'cancelled', 'refunded'
);

CREATE TYPE payment_method AS ENUM ('mpesa', 'paypal');
CREATE TYPE user_role AS ENUM ('customer', 'admin');
```

---

## Tables

### `brands`

Normalized brand registry. All products FK here -- no free-text brand names.

| Column        | Type        | Constraints                     | Description                       |
| ------------- | ----------- | ------------------------------- | --------------------------------- |
| `id`          | uuid        | PK, default `gen_random_uuid()` |                                   |
| `name`        | text        | NOT NULL                        | Display name ("Apple", "Samsung") |
| `slug`        | text        | NOT NULL, UNIQUE                | URL-safe ("apple", "samsung")     |
| `logo_url`    | text        | nullable                        | Brand logo image URL              |
| `website_url` | text        | nullable                        | Official brand website            |
| `is_active`   | boolean     | NOT NULL, default true          | Show in storefront filters        |
| `sort_order`  | integer     | NOT NULL, default 0             | Display ordering                  |
| `created_at`  | timestamptz | NOT NULL, default now()         |                                   |
| `updated_at`  | timestamptz | NOT NULL, default now()         | Auto-updated by trigger           |

**RLS:** Public SELECT, admin ALL.

---

### `categories`

Single-parent tree. Each category has exactly one parent (or null for root).

| Column        | Type        | Constraints                     | Description                               |
| ------------- | ----------- | ------------------------------- | ----------------------------------------- |
| `id`          | uuid        | PK, default `gen_random_uuid()` |                                           |
| `name`        | text        | NOT NULL                        | Display name ("Smartphones")              |
| `slug`        | text        | NOT NULL, UNIQUE                | URL-safe ("smartphones")                  |
| `description` | text        | nullable                        | Category description                      |
| `image_url`   | text        | nullable                        | Category image                            |
| `icon`        | text        | nullable                        | react-icons name (e.g., "TbDeviceMobile") |
| `parent_id`   | uuid        | nullable, FK -> categories.id   | null = root category                      |
| `is_active`   | boolean     | NOT NULL, default true          | Show in navigation                        |
| `sort_order`  | integer     | NOT NULL, default 0             | Display ordering within parent            |
| `created_at`  | timestamptz | default now()                   |                                           |
| `updated_at`  | timestamptz | default now()                   | Auto-updated by trigger                   |

**RLS:** Public SELECT, admin ALL.
**Index:** `idx_categories_parent` on `parent_id`.

**Descendant resolution** uses a recursive CTE function:

```sql
CREATE OR REPLACE FUNCTION get_category_descendants(root_id uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE AS $$
  WITH RECURSIVE cat_tree AS (
    SELECT id FROM categories WHERE id = root_id
    UNION ALL
    SELECT c.id FROM categories c JOIN cat_tree t ON c.parent_id = t.id
  )
  SELECT id FROM cat_tree;
$$;
```

**Example tree:**

```
Electronics (root, hidden from nav)
  +-- Smartphones
  +-- Computers
  +-- Laptops
  +-- Tablets
  +-- Accessories
  |     +-- Keyboards
  |     +-- Mice
  |     +-- Chargers
  |     +-- Cases & Covers
  |     +-- Screen Protectors
  |     +-- Cables & Adapters
  |     +-- Storage Devices
  +-- Audio
  |     +-- Headphones
  |     +-- Earbuds
  |     +-- Speakers
  +-- Gaming
        +-- Consoles
        +-- Controllers
```

Every category has exactly ONE parent. No ambiguity in navigation:

- `Shop > Electronics > Accessories > Keyboards` -- clear path
- `Shop > Electronics > Computers` -- shows only computers, never keyboards

Cross-category visibility (e.g. "computer accessories") is handled by `product_categories`, not the tree.

---

### `products`

A product is a unique item concept (brand + name). NOT a purchasable unit.

| Column         | Type        | Constraints                     | Description                                                |
| -------------- | ----------- | ------------------------------- | ---------------------------------------------------------- |
| `id`           | uuid        | PK, default `gen_random_uuid()` |                                                            |
| `brand_id`     | uuid        | NOT NULL, FK -> brands.id       | Normalized brand reference                                 |
| `name`         | text        | NOT NULL                        | Model name ("Galaxy S24 Ultra", "MacBook Air M3")          |
| `slug`         | text        | NOT NULL, UNIQUE                | URL-safe ("samsung-galaxy-s24-ultra")                      |
| `description`  | text        | nullable                        | Marketing description                                      |
| `key_features` | text[]      | default '{}'                    | Bullet-point features                                      |
| `images`       | text[]      | default '{}'                    | Product-level images                                       |
| `specs`        | jsonb       | default '{}'                    | Technical specifications                                   |
| `is_active`    | boolean     | NOT NULL, default true          | Soft-delete: hide from storefront                          |
| `fts`          | tsvector    | GENERATED/trigger               | Full-text search (brand name + product name + description) |
| `created_at`   | timestamptz | default now()                   |                                                            |
| `updated_at`   | timestamptz | default now()                   | Auto-updated by trigger                                    |

**Dropped from old schema:**

- `brand` (text) -> replaced by `brand_id` FK
- `model` -> renamed to `name`
- `category_id` -> removed; use `product_categories` only
- `original_price_kes` -> pricing belongs on listings

**RLS:** Public SELECT (where `is_active = true`), admin ALL.
**Indexes:** unique `(brand_id, name)`, GIN on `fts`, unique on `slug`.

**FTS note:** Since `fts` needs brand name from the `brands` table, it is maintained by a trigger (not `GENERATED ALWAYS AS`, which cannot reference other tables).

---

### `product_categories`

Many-to-many: which products are in which categories. Handles cross-category referencing.

| Column        | Type    | Constraints                            | Description                            |
| ------------- | ------- | -------------------------------------- | -------------------------------------- |
| `product_id`  | uuid    | FK -> products.id, ON DELETE CASCADE   |                                        |
| `category_id` | uuid    | FK -> categories.id, ON DELETE CASCADE |                                        |
| `is_primary`  | boolean | NOT NULL, default false                | Canonical category for breadcrumbs/nav |

**PK:** `(product_id, category_id)`

**Rules:**

- Every product MUST have exactly one row with `is_primary = true`
- Additional rows with `is_primary = false` are cross-references for filtering
- Example: A Keychron keyboard has `is_primary = true` for Keyboards, `is_primary = false` for Computers and Laptops

**RLS:** Public SELECT, admin ALL.

---

### `listings`

A specific buyable unit. Each listing has its own SKU, price, condition, and attributes.

| Column            | Type            | Constraints                     | Description                                                  |
| ----------------- | --------------- | ------------------------------- | ------------------------------------------------------------ |
| `id`              | uuid            | PK, default `gen_random_uuid()` | Internal ID                                                  |
| `sku`             | text            | NOT NULL, UNIQUE                | Auto-generated SKU (see SKU format below)                    |
| `product_id`      | uuid            | NOT NULL, FK -> products.id     | Parent product                                               |
| `condition`       | condition_grade | NOT NULL, default 'good'        | Item condition                                               |
| `color`           | text            | nullable                        | Device color                                                 |
| `storage`         | text            | nullable                        | Storage capacity ("128GB", "1TB")                            |
| `ram`             | text            | nullable                        | RAM ("8GB", "16GB")                                          |
| `battery_health`  | integer         | nullable, CHECK 0-100           | Battery percentage (phones/laptops)                          |
| `warranty_months` | integer         | nullable, CHECK >= 0            | Warranty period in months                                    |
| `attributes`      | jsonb           | default '{}'                    | Category-specific fields (screen_size, processor, gpu, etc.) |
| `cost_kes`        | numeric         | nullable                        | What Pedie paid for it (internal, never shown)               |
| `price_kes`       | numeric         | NOT NULL                        | Retail price in KES                                          |
| `sale_price_kes`  | numeric         | nullable                        | Promotional price (if discounted)                            |
| `images`          | text[]          | default '{}'                    | Listing-specific photos                                      |
| `quantity`        | integer         | NOT NULL, default 1             | Stock count (usually 1 for refurbished)                      |
| `listing_type`    | listing_type    | NOT NULL, default 'standard'    | How this item is sold                                        |
| `status`          | listing_status  | NOT NULL, default 'draft'       | Availability state                                           |
| `is_featured`     | boolean         | NOT NULL, default false         | Featured on homepage                                         |
| `admin_notes`     | text            | nullable                        | Internal notes (not user-facing)                             |
| `notes`           | text[]          | default '{}'                    | User-facing notes ("Minor scratch on back")                  |
| `includes`        | text[]          | default '{}'                    | What comes with it ("Charger", "Original box")               |
| `source`          | text            | nullable                        | Where acquired (swappa, reebelo, direct, etc.)               |
| `source_url`      | text            | nullable                        | Original listing URL                                         |
| `source_id`       | text            | nullable                        | ID on the source platform                                    |
| `created_at`      | timestamptz     | default now()                   |                                                              |
| `updated_at`      | timestamptz     | default now()                   | Auto-updated by trigger                                      |

**Dropped from old schema:**

- `listing_id` ("PD-A001") -> replaced by `sku`
- `carrier` -> dropped (not relevant for Kenyan market; use `attributes` if ever needed)
- `original_price_usd` -> use `attributes.source_price_usd` if needed
- `landed_cost_kes` -> renamed to `cost_kes`
- `final_price_kes` -> computed as `COALESCE(sale_price_kes, price_kes)`
- `sheets_row_id` -> moved to `sync_metadata` table

**Pricing model:**

| Field            | Meaning                               | User-facing?              |
| ---------------- | ------------------------------------- | ------------------------- |
| `cost_kes`       | What Pedie paid (landed cost)         | Never                     |
| `price_kes`      | Retail price                          | Yes (original price)      |
| `sale_price_kes` | Promotional price                     | Yes (sale price, if set)  |
| Effective price  | `COALESCE(sale_price_kes, price_kes)` | Computed in queries/views |

**RLS:** Public SELECT (where `status = 'active'`), admin ALL.
**Indexes:** `sku` (unique), `product_id`, `status`, `condition`, `(status, listing_type)` compound.

---

### SKU Format

```
{SRC}-{BRAND}-{MODEL}-{CONDITION}-{SEQ}
```

| Segment   | Source                             | Example                                  |
| --------- | ---------------------------------- | ---------------------------------------- |
| SRC       | Source code (3 chars)              | `SWP`, `REB`, `PED`                      |
| BRAND     | Brand slug abbreviation (3 chars)  | `APL`, `SAM`, `GOG`                      |
| MODEL     | Model slug abbreviation (variable) | `IP15P`, `GS24U`                         |
| CONDITION | Condition code (3 chars)           | `NEW`, `PRM`, `EXC`, `GOD`, `ACC`, `PRT` |
| SEQ       | Sequential number (3+ digits)      | `001`, `042`                             |

**Source codes:**

| Code  | Source                     |
| ----- | -------------------------- |
| `PED` | Direct acquisition (Pedie) |
| `SWP` | Swappa                     |
| `REB` | Reebelo                    |
| `BAM` | Back Market                |
| `BDL` | Badili                     |
| `JUM` | Jumia                      |
| `JIJ` | Jiji                       |
| `PHP` | PhonePlace                 |
| `AFF` | Generic affiliate          |
| `REF` | Referral                   |

**Condition codes:**

| Code  | Condition  |
| ----- | ---------- |
| `NEW` | new        |
| `PRM` | premium    |
| `EXC` | excellent  |
| `GOD` | good       |
| `ACC` | acceptable |
| `PRT` | for_parts  |

SKU is generated by a database function on INSERT. The app provides source, brand, model, and condition; the function generates the full SKU with the next sequential number.

Example: `SWP-APL-IP15P-EXC-001` = Swappa-sourced Apple iPhone 15 Pro in Excellent condition, first unit.

---

### `promotions`

Time-bound promotional events. An item can be a deal even without a discount.

| Column                | Type           | Constraints                     | Description                                     |
| --------------------- | -------------- | ------------------------------- | ----------------------------------------------- |
| `id`                  | uuid           | PK, default `gen_random_uuid()` |                                                 |
| `name`                | text           | NOT NULL                        | Display name ("Flash Sale Friday")              |
| `type`                | promotion_type | NOT NULL                        | flash_sale, deal, clearance, featured, seasonal |
| `listing_id`          | uuid           | nullable, FK -> listings.id     | Target specific listing                         |
| `product_id`          | uuid           | nullable, FK -> products.id     | Target all listings of a product                |
| `discount_pct`        | numeric        | nullable, CHECK 0-100           | Percentage discount                             |
| `discount_amount_kes` | numeric        | nullable, CHECK >= 0            | Fixed amount discount                           |
| `starts_at`           | timestamptz    | NOT NULL                        | Promotion start                                 |
| `ends_at`             | timestamptz    | NOT NULL                        | Promotion end                                   |
| `is_active`           | boolean        | NOT NULL, default true          | Manual kill switch                              |
| `sort_order`          | integer        | NOT NULL, default 0             | Display ordering                                |
| `created_at`          | timestamptz    | default now()                   |                                                 |
| `updated_at`          | timestamptz    | default now()                   | Auto-updated by trigger                         |

**Rules:**

- A promotion is "active" when `is_active = true AND now() BETWEEN starts_at AND ends_at`
- `discount_pct` and `discount_amount_kes` are mutually exclusive (CHECK constraint)
- If both are null, the promotion features the item without changing its price (deal, featured)
- If `listing_id` is set, `product_id` should be null (and vice versa)

**Promotion types and their behavior:**

| Type         | Badge                         | Timer?   | Requires discount? | Page             |
| ------------ | ----------------------------- | -------- | ------------------ | ---------------- |
| `flash_sale` | "Flash Sale" + flame icon     | Yes      | Yes                | Deals            |
| `deal`       | "Deal" or "Great Value"       | No       | No                 | Deals            |
| `clearance`  | "Clearance"                   | No       | Usually            | Deals            |
| `featured`   | "Staff Pick" or none          | No       | No                 | Homepage         |
| `seasonal`   | Custom (e.g., "Black Friday") | Optional | Usually            | Deals / Homepage |

**RLS:** Public SELECT (active promotions only), admin ALL.
**Indexes:** `(listing_id, is_active)`, `(product_id, is_active)`, `(starts_at, ends_at)`.

Manageable from both Google Sheets and admin UI.

---

### `profiles`

Extends `auth.users` with app-specific data. Linked by `profiles.id = auth.users.id`.

| Column          | Type        | Constraints                               | Description                   |
| --------------- | ----------- | ----------------------------------------- | ----------------------------- |
| `id`            | uuid        | PK, FK -> auth.users.id ON DELETE CASCADE |                               |
| `username`      | text        | UNIQUE, CHECK (see below)                 | Public username               |
| `full_name`     | text        | nullable                                  | Display name                  |
| `avatar_url`    | text        | nullable                                  | Profile picture URL           |
| `phone`         | text        | nullable                                  | Phone number                  |
| `address`       | jsonb       | nullable                                  | Shipping address (structured) |
| `role`          | user_role   | NOT NULL, default 'customer'              | customer or admin             |
| `is_active`     | boolean     | NOT NULL, default true                    | Account active/deactivated    |
| `last_login_at` | timestamptz | nullable                                  | Last login timestamp          |
| `created_at`    | timestamptz | default now()                             |                               |
| `updated_at`    | timestamptz | default now()                             | Auto-updated by trigger       |

**Username rules:**

- Latin alphanumerics + underscore only: `a-z`, `0-9`, `_`
- Length: 3-20 characters
- Must start with a letter
- No consecutive underscores, no leading/trailing underscores
- Stored and matched lowercase
- Regex: `^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$`

**Reserved usernames** (blocked at signup):

```
admin, administrator, mod, moderator, customer, support, help,
system, root, superuser, staff, pedie, null, undefined,
test, demo, api, auth, login, signup, register, account,
billing, checkout, cart, order, orders, settings, profile,
dashboard, console, manage, www, mail, email, info, contact,
official, verified, bot, service, notification, noreply, security
```

**Username-based login flow:**

1. Login form accepts "Username or email" in one field
2. If input contains `@` -> `signInWithPassword({ email })`
3. If not -> call RPC `resolve_username(username)` which returns the associated email
4. Then sign in with that email + the provided password

The RPC function is `SECURITY DEFINER` and does NOT expose the email to the client -- it performs the auth internally.

**RLS:** Users can view/update own profile. Admin can view/manage all profiles.

---

### `orders`

| Column               | Type           | Constraints                     | Description                       |
| -------------------- | -------------- | ------------------------------- | --------------------------------- |
| `id`                 | uuid           | PK, default `gen_random_uuid()` |                                   |
| `user_id`            | uuid           | NOT NULL, FK -> profiles.id     |                                   |
| `status`             | order_status   | NOT NULL, default 'pending'     |                                   |
| `payment_method`     | payment_method | nullable                        |                                   |
| `payment_ref`        | text           | nullable                        | Payment transaction reference     |
| `subtotal_kes`       | numeric        | NOT NULL                        | Sum of item prices                |
| `shipping_fee_kes`   | numeric        | default 0                       |                                   |
| `total_kes`          | numeric        | NOT NULL                        | subtotal + shipping               |
| `deposit_amount_kes` | numeric        | default 0                       | For preorders                     |
| `balance_due_kes`    | numeric        | default 0                       | Remaining after deposit           |
| `shipping_address`   | jsonb          | nullable                        | Snapshot of address at order time |
| `tracking_info`      | jsonb          | nullable                        | Shipping tracking data            |
| `notes`              | text           | nullable                        | Order notes                       |
| `created_at`         | timestamptz    | default now()                   |                                   |
| `updated_at`         | timestamptz    | default now()                   | Auto-updated by trigger           |

**RLS:** Users can view/create own orders. Admin can manage all orders.

---

### `order_items`

| Column            | Type        | Constraints                                 | Description                         |
| ----------------- | ----------- | ------------------------------------------- | ----------------------------------- |
| `id`              | uuid        | PK, default `gen_random_uuid()`             |                                     |
| `order_id`        | uuid        | NOT NULL, FK -> orders.id ON DELETE CASCADE |                                     |
| `listing_id`      | uuid        | nullable, FK -> listings.id                 | null if listing was deleted         |
| `product_name`    | text        | NOT NULL                                    | Snapshot: "Apple iPhone 15 Pro"     |
| `variant_summary` | text        | nullable                                    | Snapshot: "128GB, Black, Excellent" |
| `quantity`        | integer     | NOT NULL, default 1                         |                                     |
| `unit_price_kes`  | numeric     | NOT NULL                                    | Price at time of purchase           |
| `deposit_kes`     | numeric     | default 0                                   | Deposit for preorders               |
| `created_at`      | timestamptz | default now()                               |                                     |

**RLS:** Users can view/create own order items. Admin ALL.

---

### `reviews`

| Column              | Type        | Constraints                     | Description                         |
| ------------------- | ----------- | ------------------------------- | ----------------------------------- |
| `id`                | uuid        | PK, default `gen_random_uuid()` |                                     |
| `product_id`        | uuid        | NOT NULL, FK -> products.id     |                                     |
| `user_id`           | uuid        | NOT NULL, FK -> profiles.id     |                                     |
| `rating`            | integer     | NOT NULL, CHECK 1-5             |                                     |
| `title`             | text        | nullable                        | Review headline                     |
| `body`              | text        | nullable                        | Review text                         |
| `verified_purchase` | boolean     | default false                   | Auto-set if user bought the product |
| `created_at`        | timestamptz | default now()                   |                                     |
| `updated_at`        | timestamptz | default now()                   | Auto-updated by trigger             |

**RLS:** Public SELECT. Users can create/update/delete own reviews. Admin ALL.

---

### `wishlist`

| Column       | Type        | Constraints                     | Description |
| ------------ | ----------- | ------------------------------- | ----------- |
| `id`         | uuid        | PK, default `gen_random_uuid()` |             |
| `user_id`    | uuid        | NOT NULL, FK -> profiles.id     |             |
| `product_id` | uuid        | NOT NULL, FK -> products.id     |             |
| `created_at` | timestamptz | default now()                   |             |

**UNIQUE:** `(user_id, product_id)`
**RLS:** Users manage own wishlist. Admin can view all.

---

### `newsletter_subscribers`

| Column          | Type        | Constraints                     | Description |
| --------------- | ----------- | ------------------------------- | ----------- |
| `id`            | uuid        | PK, default `gen_random_uuid()` |             |
| `email`         | text        | NOT NULL, UNIQUE                |             |
| `subscribed_at` | timestamptz | default now()                   |             |

**RLS:** Public INSERT. Admin ALL.

---

### `price_comparisons`

Competitor pricing data from crawlers (paused, to be revived later).

| Column                 | Type        | Constraints                     | Description                    |
| ---------------------- | ----------- | ------------------------------- | ------------------------------ |
| `id`                   | uuid        | PK, default `gen_random_uuid()` |                                |
| `product_id`           | uuid        | NOT NULL, FK -> products.id     |                                |
| `competitor`           | text        | NOT NULL                        | Competitor name                |
| `competitor_price_kes` | numeric     | NOT NULL                        | Their price                    |
| `url`                  | text        | nullable                        | Product URL on competitor site |
| `crawled_at`           | timestamptz | default now()                   |                                |

**UNIQUE:** `(product_id, competitor, crawled_utc_date(crawled_at))`
**RLS:** Public SELECT. Admin ALL.

---

### `sync_metadata`

Tracks sync provenance for listings and products. Replaces `sheets_row_id` on listings.

| Column           | Type        | Constraints                                    | Description                      |
| ---------------- | ----------- | ---------------------------------------------- | -------------------------------- |
| `id`             | uuid        | PK, default `gen_random_uuid()`                |                                  |
| `listing_id`     | uuid        | nullable, FK -> listings.id ON DELETE SET NULL |                                  |
| `product_id`     | uuid        | nullable, FK -> products.id ON DELETE SET NULL |                                  |
| `source`         | text        | NOT NULL                                       | "google_sheets", "crawler", etc. |
| `source_id`      | text        | nullable                                       | Row ID or external identifier    |
| `sheet_row_id`   | text        | nullable                                       | Google Sheets row reference      |
| `last_synced_at` | timestamptz | default now()                                  |                                  |
| `raw_data`       | jsonb       | nullable                                       | Original row data for debugging  |
| `created_at`     | timestamptz | default now()                                  |                                  |

**RLS:** Admin SELECT only.

---

### `sync_log`

Audit trail for sync operations.

| Column         | Type        | Constraints                     | Description                         |
| -------------- | ----------- | ------------------------------- | ----------------------------------- |
| `id`           | uuid        | PK, default `gen_random_uuid()` |                                     |
| `triggered_by` | text        | NOT NULL, default 'system'      | Who triggered the sync              |
| `status`       | text        | NOT NULL, default 'running'     | running, completed, failed, partial |
| `rows_synced`  | integer     | default 0                       |                                     |
| `errors`       | jsonb       | default '[]'                    | Error details                       |
| `started_at`   | timestamptz | NOT NULL, default now()         |                                     |
| `completed_at` | timestamptz | nullable                        |                                     |

**RLS:** Admin SELECT. Service role INSERT (via bypassing RLS).

---

## Database Functions

### `is_admin()`

Returns true if the current user has `role = 'admin'` in profiles. Used by RLS policies.

### `get_category_descendants(root_id uuid)`

Recursive CTE returning all descendant category IDs of a root category. Used for category-filtered product queries.

### `generate_sku(source, brand_slug, model_slug, condition)`

Generates the next SKU in sequence for the given combination. Called by a trigger on listing INSERT.

### `resolve_username(input_username text)`

Securely resolves a username to perform authentication. `SECURITY DEFINER` -- does not expose email to the client.

### `update_updated_at()`

Trigger function that sets `updated_at = now()` on row update. Applied to all tables with `updated_at`.

### `handle_new_user()`

Trigger on `auth.users` INSERT that creates a corresponding `profiles` row.

### `update_product_fts()`

Trigger on products INSERT/UPDATE that rebuilds the `fts` tsvector including the brand name from the `brands` table.

---

## Google Sheets Sync

The sync pipeline uses Google Sheets as a lightweight admin interface for catalog management.

### Sheets (Pages)

| Sheet          | Syncs To                                       | Columns                                                                                                                                                                                                                                                                                                                    |
| -------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Brands**     | `brands`                                       | name, slug, logo_url, website_url, is_active, sort_order                                                                                                                                                                                                                                                                   |
| **Categories** | `categories`                                   | name, slug, description, image_url, icon, parent (slug), is_active, sort_order                                                                                                                                                                                                                                             |
| **Listings**   | `listings` + `products` + `product_categories` | brand, model, category (primary), categories (comma-separated for cross-refs), condition, color, storage, ram, battery_health, warranty_months, price_kes, sale_price_kes, cost_kes, source, source_url, source_id, listing_type, status, notes (semicolon-separated), includes (semicolon-separated), admin_notes, images |
| **Promotions** | `promotions`                                   | name, type, listing_sku OR product_slug, discount_pct, discount_amount_kes, starts_at, ends_at, is_active                                                                                                                                                                                                                  |

**Sync rules:**

- Brands and categories are upserted by slug (idempotent)
- Products are upserted by `(brand_id, name)` unique constraint
- Listings are upserted by SKU; new listings get auto-generated SKUs
- Promotions are upserted by `(name, listing_sku/product_slug)` combination
- The sync writes to `sync_metadata` for provenance tracking
- The sync writes to `sync_log` for audit trail

**User data (profiles, orders, reviews, wishlist) is NEVER synced via Sheets.** PII stays in the database and is managed exclusively through the admin UI.

---

## RLS Strategy

All RLS policies follow these patterns:

| Pattern          | Used By                                                            | Implementation                                      |
| ---------------- | ------------------------------------------------------------------ | --------------------------------------------------- |
| Public read      | categories, brands, products, listings, reviews, price_comparisons | `USING (true)` or `USING (is_active = true)`        |
| Owner read/write | profiles, orders, order_items, wishlist, reviews                   | `USING (auth.uid() = user_id)`                      |
| Admin all        | Every table                                                        | `USING (is_admin())` with `WITH CHECK (is_admin())` |
| Public insert    | newsletter_subscribers                                             | `WITH CHECK (true)`                                 |

**`is_admin()`** is the single source of truth for admin checks. All policies use it consistently (no inline `EXISTS (SELECT 1 FROM profiles ...)` variations).

---

## Indexes

### Existing (kept)

- `brands_slug_key` (unique)
- `categories_slug_key` (unique), `idx_categories_parent`
- `products_slug_key` (unique), `idx_products_brand_model` (unique), `idx_products_fts` (GIN)
- `listings_pkey`, `idx_listings_product`, `idx_listings_status`
- `orders_pkey`, `idx_orders_user`, `idx_orders_status`
- `idx_order_items_order`, `idx_order_items_listing`
- `idx_reviews_product`, `idx_reviews_user`
- `idx_wishlist_user`, `idx_wishlist_product`, `wishlist_user_id_product_id_key` (unique)
- `idx_price_comparisons_product`, `idx_price_comparisons_crawled`, `idx_price_comparisons_upsert` (unique)

### New

- `listings(sku)` -- unique, primary lookup
- `listings(condition)` -- frequent filter dimension
- `listings(status, listing_type)` -- compound for storefront queries
- `product_categories(category_id)` -- filter by category
- `promotions(listing_id, is_active)` -- active promotions for a listing
- `promotions(product_id, is_active)` -- active promotions for a product
- `promotions(starts_at, ends_at)` -- time-range scans
- `profiles(username)` -- unique, login lookup
- `sync_metadata(listing_id)` -- lookup by listing
- `sync_metadata(product_id)` -- lookup by product

### Removed

- `idx_listings_listing_id` -- replaced by SKU index
- `idx_listings_affiliate` -- partial index, replaced by compound `(status, listing_type)`

---

## Tables Dropped

| Table             | Reason                            |
| ----------------- | --------------------------------- |
| `products_backup` | Dead table, 0 rows, no RLS, no PK |

---

## Migration from Old Schema

Key renames and removals for the codebase:

| Old                                | New                                   | Notes                         |
| ---------------------------------- | ------------------------------------- | ----------------------------- |
| `products.brand` (text)            | `products.brand_id` (uuid FK)         | Normalized                    |
| `products.model`                   | `products.name`                       | More generic                  |
| `products.category_id`             | Removed                               | Use `product_categories` only |
| `products.original_price_kes`      | Removed                               | Pricing on listings only      |
| `listings.listing_id`              | `listings.sku`                        | Auto-generated                |
| `listings.final_price_kes`         | `COALESCE(sale_price_kes, price_kes)` | Computed                      |
| `listings.original_price_usd`      | Removed (or `attributes`)             |                               |
| `listings.landed_cost_kes`         | `listings.cost_kes`                   | Simplified name               |
| `listings.carrier`                 | Removed                               | Not relevant for KE market    |
| `listings.sheets_row_id`           | `sync_metadata.sheet_row_id`          | Separated concerns            |
| `listing_status = 'available'`     | `listing_status = 'active'`           | Clearer term                  |
| `listing_status = 'onsale'`        | Removed; use `promotions` table       | Separated concerns            |
| `order_items.product_name` default | Remove default 'UNKNOWN'              | Require explicit value        |
