-- ===========================================================================
-- Pedie Database Schema
-- Single migration: creates the entire schema from scratch.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE condition_grade AS ENUM (
  'new', 'premium', 'excellent', 'good', 'acceptable', 'for_parts'
);

CREATE TYPE listing_status AS ENUM (
  'draft', 'active', 'reserved', 'sold', 'returned', 'archived'
);

CREATE TYPE listing_type AS ENUM (
  'standard', 'preorder', 'affiliate', 'referral'
);

CREATE TYPE promotion_type AS ENUM (
  'flash_sale', 'deal', 'clearance', 'featured', 'seasonal'
);

CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'processing', 'shipped',
  'delivered', 'cancelled', 'refunded'
);

CREATE TYPE payment_method AS ENUM ('mpesa', 'paypal');

CREATE TYPE user_role AS ENUM ('customer', 'admin');

-- ---------------------------------------------------------------------------
-- Helper functions (no table dependencies)
-- ---------------------------------------------------------------------------

CREATE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE FUNCTION crawled_utc_date(ts timestamptz)
RETURNS date
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (ts AT TIME ZONE 'UTC')::date;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE brands (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  slug        text        NOT NULL UNIQUE,
  logo_url    text,
  website_url text,
  is_active   boolean     NOT NULL DEFAULT true,
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  slug        text        NOT NULL UNIQUE,
  description text,
  image_url   text,
  icon        text,
  parent_id   uuid        REFERENCES categories(id),
  is_active   boolean     NOT NULL DEFAULT true,
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE products (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id     uuid        NOT NULL REFERENCES brands(id),
  name         text        NOT NULL,
  slug         text        NOT NULL UNIQUE,
  description  text,
  key_features text[]      DEFAULT '{}',
  images       text[]      DEFAULT '{}',
  specs        jsonb       DEFAULT '{}',
  is_active    boolean     NOT NULL DEFAULT true,
  fts          tsvector,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  UNIQUE (brand_id, name)
);

CREATE TABLE product_categories (
  product_id  uuid    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id uuid    NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  is_primary  boolean NOT NULL DEFAULT false,
  PRIMARY KEY (product_id, category_id)
);

CREATE TABLE listings (
  id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  sku             text            NOT NULL DEFAULT '' UNIQUE,
  product_id      uuid            NOT NULL REFERENCES products(id),
  condition       condition_grade NOT NULL DEFAULT 'good',
  color           text,
  storage         text,
  ram             text,
  battery_health  integer         CHECK (battery_health >= 0 AND battery_health <= 100),
  warranty_months integer         CHECK (warranty_months >= 0),
  attributes      jsonb           DEFAULT '{}',
  cost_kes        numeric,
  price_kes       numeric         NOT NULL,
  sale_price_kes  numeric,
  images          text[]          DEFAULT '{}',
  quantity        integer         NOT NULL DEFAULT 1,
  listing_type    listing_type    NOT NULL DEFAULT 'standard',
  status          listing_status  NOT NULL DEFAULT 'draft',
  is_featured     boolean         NOT NULL DEFAULT false,
  admin_notes     text,
  notes           text[]          DEFAULT '{}',
  includes        text[]          DEFAULT '{}',
  source          text,
  source_url      text,
  source_id       text,
  created_at      timestamptz     DEFAULT now(),
  updated_at      timestamptz     DEFAULT now()
);

-- Helper table for SKU sequential numbering
CREATE TABLE sku_sequences (
  prefix text    PRIMARY KEY,
  seq    integer NOT NULL DEFAULT 0
);

CREATE TABLE promotions (
  id                  uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text           NOT NULL,
  type                promotion_type NOT NULL,
  listing_id          uuid           REFERENCES listings(id),
  product_id          uuid           REFERENCES products(id),
  discount_pct        numeric        CHECK (discount_pct >= 0 AND discount_pct <= 100),
  discount_amount_kes numeric        CHECK (discount_amount_kes >= 0),
  starts_at           timestamptz    NOT NULL,
  ends_at             timestamptz    NOT NULL,
  is_active           boolean        NOT NULL DEFAULT true,
  sort_order          integer        NOT NULL DEFAULT 0,
  created_at          timestamptz    DEFAULT now(),
  updated_at          timestamptz    DEFAULT now(),
  CHECK (NOT (discount_pct IS NOT NULL AND discount_amount_kes IS NOT NULL)),
  CHECK (NOT (listing_id IS NOT NULL AND product_id IS NOT NULL)),
  CHECK (listing_id IS NOT NULL OR product_id IS NOT NULL),
  CHECK (type <> 'flash_sale' OR discount_pct IS NOT NULL OR discount_amount_kes IS NOT NULL)
);

CREATE TABLE profiles (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      text        UNIQUE,
  full_name     text,
  avatar_url    text,
  phone         text,
  address       jsonb,
  role          user_role   NOT NULL DEFAULT 'customer',
  is_active     boolean     NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  CHECK (username ~ '^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$'),
  CHECK (char_length(username) BETWEEN 3 AND 20),
  CHECK (username NOT IN (
    'admin', 'administrator', 'mod', 'moderator', 'customer', 'support', 'help',
    'system', 'root', 'superuser', 'staff', 'pedie', 'null', 'undefined',
    'test', 'demo', 'api', 'auth', 'login', 'signup', 'register', 'account',
    'billing', 'checkout', 'cart', 'order', 'orders', 'settings', 'profile',
    'dashboard', 'console', 'manage', 'www', 'mail', 'email', 'info', 'contact',
    'official', 'verified', 'bot', 'service', 'notification', 'noreply', 'security'
  ))
);

CREATE TABLE orders (
  id                 uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid         NOT NULL REFERENCES profiles(id),
  status             order_status NOT NULL DEFAULT 'pending',
  payment_method     payment_method,
  payment_ref        text,
  subtotal_kes       numeric      NOT NULL,
  shipping_fee_kes   numeric      DEFAULT 0,
  total_kes          numeric      NOT NULL,
  deposit_amount_kes numeric      DEFAULT 0,
  balance_due_kes    numeric      DEFAULT 0,
  shipping_address   jsonb,
  tracking_info      jsonb,
  notes              text,
  created_at         timestamptz  DEFAULT now(),
  updated_at         timestamptz  DEFAULT now()
);

CREATE TABLE order_items (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  listing_id      uuid        REFERENCES listings(id),
  product_name    text        NOT NULL,
  variant_summary text,
  quantity        integer     NOT NULL DEFAULT 1,
  unit_price_kes  numeric     NOT NULL,
  deposit_kes     numeric     DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE reviews (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        uuid        NOT NULL REFERENCES products(id),
  user_id           uuid        NOT NULL REFERENCES profiles(id),
  rating            integer     NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title             text,
  body              text,
  verified_purchase boolean     DEFAULT false,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE TABLE wishlist (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES profiles(id),
  product_id uuid        NOT NULL REFERENCES products(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE TABLE newsletter_subscribers (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text        NOT NULL UNIQUE,
  subscribed_at timestamptz DEFAULT now()
);

CREATE TABLE price_comparisons (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id           uuid        NOT NULL REFERENCES products(id),
  competitor           text        NOT NULL,
  competitor_price_kes numeric     NOT NULL,
  url                  text,
  crawled_at           timestamptz DEFAULT now()
);

CREATE TABLE sync_metadata (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id     uuid        REFERENCES listings(id) ON DELETE SET NULL,
  product_id     uuid        REFERENCES products(id) ON DELETE SET NULL,
  source         text        NOT NULL,
  source_id      text,
  sheet_row_id   text,
  last_synced_at timestamptz DEFAULT now(),
  raw_data       jsonb,
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE sync_log (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by text        NOT NULL DEFAULT 'system',
  status       text        NOT NULL DEFAULT 'running',
  rows_synced  integer     DEFAULT 0,
  errors       jsonb       DEFAULT '[]',
  started_at   timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Functions (depend on tables)
-- ---------------------------------------------------------------------------

CREATE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$;

CREATE FUNCTION get_category_descendants(root_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
AS $$
  WITH RECURSIVE cat_tree AS (
    SELECT id FROM categories WHERE id = root_id
    UNION ALL
    SELECT c.id FROM categories c JOIN cat_tree t ON c.parent_id = t.id
  )
  SELECT id FROM cat_tree;
$$;

CREATE FUNCTION generate_sku(
  p_source     text,
  p_brand_slug text,
  p_model_slug text,
  p_condition  condition_grade
) RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_src    text;
  v_brand  text;
  v_model  text;
  v_cond   text;
  v_prefix text;
  v_seq    integer;
BEGIN
  -- Map source name to 3-char code
  v_src := CASE lower(p_source)
    WHEN 'swappa'      THEN 'SWP'
    WHEN 'reebelo'     THEN 'REB'
    WHEN 'backmarket'  THEN 'BAM'
    WHEN 'back market' THEN 'BAM'
    WHEN 'badili'      THEN 'BDL'
    WHEN 'jumia'       THEN 'JUM'
    WHEN 'jiji'        THEN 'JIJ'
    WHEN 'phoneplace'  THEN 'PHP'
    WHEN 'affiliate'   THEN 'AFF'
    WHEN 'referral'    THEN 'REF'
    ELSE 'PED'
  END;

  -- Brand: first 3 chars of slug, uppercased
  v_brand := upper(left(p_brand_slug, 3));

  -- Model: remove hyphens, first 5 chars, uppercased
  v_model := upper(left(replace(p_model_slug, '-', ''), 5));

  -- Map condition enum to 3-char code
  v_cond := CASE p_condition
    WHEN 'new'        THEN 'NEW'
    WHEN 'premium'    THEN 'PRM'
    WHEN 'excellent'  THEN 'EXC'
    WHEN 'good'       THEN 'GOD'
    WHEN 'acceptable' THEN 'ACC'
    WHEN 'for_parts'  THEN 'PRT'
  END;

  v_prefix := v_src || '-' || v_brand || '-' || v_model || '-' || v_cond;

  -- Atomic upsert to get next sequence number
  INSERT INTO sku_sequences (prefix, seq)
  VALUES (v_prefix, 1)
  ON CONFLICT (prefix) DO UPDATE SET seq = sku_sequences.seq + 1
  RETURNING seq INTO v_seq;

  RETURN v_prefix || '-' || lpad(v_seq::text, 3, '0');
END;
$$;

-- Trigger wrapper: looks up brand/product slugs and calls generate_sku
CREATE FUNCTION trg_generate_sku_fn()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_brand_slug   text;
  v_product_slug text;
  v_model_slug   text;
BEGIN
  IF NEW.sku IS NOT NULL AND NEW.sku <> '' THEN
    RETURN NEW;
  END IF;

  SELECT b.slug, p.slug
  INTO v_brand_slug, v_product_slug
  FROM products p
  JOIN brands b ON b.id = p.brand_id
  WHERE p.id = NEW.product_id;

  -- Strip brand prefix from product slug to get model-only slug
  -- e.g. "apple-iphone-15-pro" -> "iphone-15-pro"
  v_model_slug := regexp_replace(v_product_slug, '^' || v_brand_slug || '-', '');

  NEW.sku := generate_sku(
    coalesce(NEW.source, 'pedie'),
    v_brand_slug,
    v_model_slug,
    NEW.condition
  );

  RETURN NEW;
END;
$$;

CREATE FUNCTION resolve_username(input_username text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  found_email text;
BEGIN
  SELECT au.email INTO found_email
  FROM public.profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE p.username = lower(input_username)
    AND p.is_active = true;

  RETURN found_email;
END;
$$;

-- Restrict resolve_username to service_role only (prevents client-side email enumeration)
REVOKE EXECUTE ON FUNCTION resolve_username(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION resolve_username(text) TO service_role;

CREATE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    lower(NEW.raw_user_meta_data ->> 'username'),
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE FUNCTION update_product_fts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_brand_name text;
BEGIN
  SELECT name INTO v_brand_name FROM brands WHERE id = NEW.brand_id;

  NEW.fts := to_tsvector('english',
    coalesce(v_brand_name, '') || ' ' ||
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.description, '')
  );

  RETURN NEW;
END;
$$;

-- Cascade brand name changes to product FTS vectors
CREATE FUNCTION update_brand_fts_cascade()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products SET updated_at = now()
  WHERE brand_id = NEW.id;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_categories_parent ON categories (parent_id);

CREATE INDEX idx_products_fts ON products USING gin (fts);

CREATE INDEX idx_product_categories_category ON product_categories (category_id);

-- Enforce at most one primary category per product
CREATE UNIQUE INDEX idx_product_categories_one_primary
  ON product_categories (product_id) WHERE is_primary = true;

CREATE INDEX idx_listings_product ON listings (product_id);
CREATE INDEX idx_listings_status ON listings (status);
CREATE INDEX idx_listings_condition ON listings (condition);
CREATE INDEX idx_listings_status_type ON listings (status, listing_type);

CREATE INDEX idx_promotions_listing ON promotions (listing_id, is_active);
CREATE INDEX idx_promotions_product ON promotions (product_id, is_active);
CREATE INDEX idx_promotions_dates ON promotions (starts_at, ends_at);

CREATE INDEX idx_orders_user ON orders (user_id);
CREATE INDEX idx_orders_status ON orders (status);

CREATE INDEX idx_order_items_order ON order_items (order_id);
CREATE INDEX idx_order_items_listing ON order_items (listing_id);

CREATE INDEX idx_reviews_product ON reviews (product_id);
CREATE INDEX idx_reviews_user ON reviews (user_id);

CREATE INDEX idx_wishlist_user ON wishlist (user_id);
CREATE INDEX idx_wishlist_product ON wishlist (product_id);

CREATE INDEX idx_price_comparisons_product ON price_comparisons (product_id);
CREATE INDEX idx_price_comparisons_crawled ON price_comparisons (crawled_at);
CREATE UNIQUE INDEX idx_price_comparisons_upsert
  ON price_comparisons (product_id, competitor, crawled_utc_date(crawled_at));

CREATE INDEX idx_sync_metadata_listing ON sync_metadata (listing_id);
CREATE INDEX idx_sync_metadata_product ON sync_metadata (product_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

CREATE TRIGGER set_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_product_fts
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_fts();

CREATE TRIGGER trg_brand_fts_refresh
  AFTER UPDATE OF name ON brands
  FOR EACH ROW EXECUTE FUNCTION update_brand_fts_cascade();

CREATE TRIGGER trg_generate_sku
  BEFORE INSERT ON listings
  FOR EACH ROW EXECUTE FUNCTION trg_generate_sku_fn();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sku_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

-- brands
CREATE POLICY brands_public_read ON brands
  FOR SELECT USING (true);
CREATE POLICY brands_admin_all ON brands
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- categories
CREATE POLICY categories_public_read ON categories
  FOR SELECT USING (true);
CREATE POLICY categories_admin_all ON categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- products
CREATE POLICY products_public_read ON products
  FOR SELECT USING (is_active = true);
CREATE POLICY products_admin_all ON products
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- product_categories
CREATE POLICY product_categories_public_read ON product_categories
  FOR SELECT USING (true);
CREATE POLICY product_categories_admin_all ON product_categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- listings
CREATE POLICY listings_public_read ON listings
  FOR SELECT USING (status = 'active');
CREATE POLICY listings_admin_all ON listings
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- sku_sequences (internal helper)
CREATE POLICY sku_sequences_admin_all ON sku_sequences
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- promotions
CREATE POLICY promotions_public_read ON promotions
  FOR SELECT USING (is_active = true AND now() BETWEEN starts_at AND ends_at);
CREATE POLICY promotions_admin_all ON promotions
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- profiles
CREATE POLICY profiles_owner_read ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_owner_update ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_admin_all ON profiles
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- orders
CREATE POLICY orders_owner_read ON orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY orders_owner_insert ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY orders_admin_all ON orders
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- order_items
CREATE POLICY order_items_owner_read ON order_items
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  ));
CREATE POLICY order_items_owner_insert ON order_items
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  ));
CREATE POLICY order_items_admin_all ON order_items
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- reviews
CREATE POLICY reviews_public_read ON reviews
  FOR SELECT USING (true);
CREATE POLICY reviews_owner_insert ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY reviews_owner_update ON reviews
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY reviews_owner_delete ON reviews
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY reviews_admin_all ON reviews
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- wishlist
CREATE POLICY wishlist_owner_read ON wishlist
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY wishlist_owner_insert ON wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY wishlist_owner_delete ON wishlist
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY wishlist_admin_all ON wishlist
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- newsletter_subscribers
CREATE POLICY newsletter_public_insert ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);
CREATE POLICY newsletter_admin_all ON newsletter_subscribers
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- price_comparisons
CREATE POLICY price_comparisons_public_read ON price_comparisons
  FOR SELECT USING (true);
CREATE POLICY price_comparisons_admin_all ON price_comparisons
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- sync_metadata (admin read only; service role INSERT bypasses RLS)
CREATE POLICY sync_metadata_admin_read ON sync_metadata
  FOR SELECT USING (is_admin());

-- sync_log (admin read only; service role INSERT bypasses RLS)
CREATE POLICY sync_log_admin_read ON sync_log
  FOR SELECT USING (is_admin());
