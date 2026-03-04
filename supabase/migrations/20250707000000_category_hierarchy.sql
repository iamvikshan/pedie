-- Category hierarchy restructuring + many-to-many support
-- Adds description column, Electronics root, subcategories, and product_categories junction table

-- =============================================================================
-- 1. Add description column
-- =============================================================================
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;

-- =============================================================================
-- 2. Insert root "Electronics" category
-- =============================================================================
INSERT INTO categories (name, slug, description, parent_id, sort_order)
VALUES ('Electronics', 'electronics', 'All electronic devices and accessories', NULL, 0)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 3. Reparent existing categories + add Audio
-- =============================================================================
DO $$
DECLARE
  electronics_id UUID;
BEGIN
  SELECT id INTO electronics_id FROM categories WHERE slug = 'electronics';

  UPDATE categories SET parent_id = electronics_id
  WHERE slug IN ('smartphones', 'laptops', 'tablets', 'wearables', 'accessories')
    AND parent_id IS NULL;

  INSERT INTO categories (name, slug, description, parent_id, sort_order)
  VALUES ('Audio', 'audio', 'Audio equipment and accessories', electronics_id, 6)
  ON CONFLICT (slug) DO NOTHING;

  UPDATE categories SET parent_id = electronics_id
  WHERE slug = 'audio' AND parent_id IS NULL;
END $$;

-- =============================================================================
-- 4. Insert all subcategories
-- =============================================================================
DO $$
DECLARE
  wearables_id UUID;
  accessories_id UUID;
  audio_id UUID;
  electronics_id UUID;
BEGIN
  SELECT id INTO electronics_id FROM categories WHERE slug = 'electronics';
  SELECT id INTO wearables_id FROM categories WHERE slug = 'wearables';
  SELECT id INTO accessories_id FROM categories WHERE slug = 'accessories';
  SELECT id INTO audio_id FROM categories WHERE slug = 'audio';

  -- Phone Accessories (under Accessories)
  INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
    ('Phone Accessories', 'phone-accessories', 'Cases, chargers, cables, and more for smartphones', accessories_id, 1),
    ('Screen Protectors', 'screen-protectors', 'Tempered glass and film protectors', accessories_id, 2),
    ('Phone Cases', 'phone-cases', 'Protective cases and covers', accessories_id, 3),
    ('Chargers', 'chargers', 'Wired and wireless chargers', accessories_id, 4),
    ('Charging & Data Cables', 'charging-data-cables', 'USB-C, Lightning, and other cables', accessories_id, 5)
  ON CONFLICT (slug) DO NOTHING;

  -- Computer Accessories (under Accessories)
  INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
    ('Computer Accessories', 'computer-accessories', 'Keyboards, mice, and more for computers', accessories_id, 6),
    ('Keyboards', 'keyboards', 'Mechanical and membrane keyboards', accessories_id, 7),
    ('Mice', 'mice', 'Wired and wireless mice', accessories_id, 8),
    ('Laptop Accessories', 'laptop-accessories', 'Bags, stands, docks, and more', accessories_id, 9)
  ON CONFLICT (slug) DO NOTHING;

  -- Smartwatch & Tablet Accessories (under Accessories)
  INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
    ('Smartwatch Accessories', 'smartwatch-accessories', 'Bands, chargers, and protectors for smartwatches', accessories_id, 10),
    ('Tablet Accessories', 'tablet-accessories', 'Cases, keyboards, and styluses for tablets', accessories_id, 11)
  ON CONFLICT (slug) DO NOTHING;

  -- Wearables subcategories
  INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
    ('Smartwatches', 'smartwatches', 'Smart wristwatches from top brands', wearables_id, 1),
    ('Smart Rings', 'smart-rings', 'Smart rings for health and fitness tracking', wearables_id, 2)
  ON CONFLICT (slug) DO NOTHING;

  -- Audio subcategories
  INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
    ('Earphones', 'earphones', 'Wired earphones and in-ear monitors', audio_id, 1),
    ('Earbuds & In-Ear Headphones', 'earbuds', 'True wireless and in-ear headphones', audio_id, 2),
    ('Headphones', 'headphones', 'Over-ear and on-ear headphones', audio_id, 3),
    ('Portable Bluetooth Speakers', 'portable-bluetooth-speakers', 'Wireless portable speakers', audio_id, 4),
    ('Speakers', 'speakers', 'Home and desktop speakers', audio_id, 5),
    ('Earphone Accessories', 'earphone-accessories', 'Tips, cases, and adapters for earphones', audio_id, 6),
    ('Microphones', 'microphones', 'USB, condenser, and lavalier microphones', audio_id, 7)
  ON CONFLICT (slug) DO NOTHING;

  -- Other Electronics (direct under Electronics)
  INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
    ('Desktop Computers', 'desktop-computers', 'Desktop PCs and all-in-ones', electronics_id, 7),
    ('Portable Power Banks', 'portable-power-banks', 'Portable battery packs and power stations', electronics_id, 8),
    ('Cameras', 'cameras', 'Digital cameras and action cameras', electronics_id, 9),
    ('Gaming', 'gaming', 'Gaming consoles, handhelds, and gaming accessories', electronics_id, 10),
    ('Camera Accessories', 'camera-accessories', 'Lenses, tripods, and camera gear', electronics_id, 11),
    ('VR Headsets', 'vr-headsets', 'Virtual reality headsets', electronics_id, 12),
    ('VR Headset Accessories', 'vr-headset-accessories', 'Controllers, straps, and VR accessories', electronics_id, 13)
  ON CONFLICT (slug) DO NOTHING;

  -- Gaming subcategories
  PERFORM 1; -- force PL/pgSQL block continuation
END $$;

DO $$
DECLARE
  gaming_id UUID;
BEGIN
  SELECT id INTO gaming_id FROM categories WHERE slug = 'gaming';

  INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
    ('Gaming Consoles', 'gaming-consoles', 'Home gaming consoles from top brands', gaming_id, 1),
    ('Gaming Handhelds', 'gaming-handhelds', 'Portable gaming devices', gaming_id, 2),
    ('Gaming Accessories', 'gaming-accessories', 'Controllers, headsets, and gaming gear', gaming_id, 3)
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- =============================================================================
-- 5. product_categories junction table (many-to-many)
-- =============================================================================
CREATE TABLE IF NOT EXISTS product_categories (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (product_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_product_categories_product ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON product_categories(category_id);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view product categories" ON product_categories;
CREATE POLICY "Anyone can view product categories" ON product_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage product categories" ON product_categories;
CREATE POLICY "Admin can manage product categories" ON product_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
