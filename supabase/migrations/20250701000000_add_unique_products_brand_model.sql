-- Ensure brand and model are NOT NULL to make the unique index effective
ALTER TABLE products ALTER COLUMN brand SET NOT NULL;
ALTER TABLE products ALTER COLUMN model SET NOT NULL;

-- Remove duplicate (brand, model) pairs keeping the row with the smallest id
DELETE FROM products p
USING products p2
WHERE p.brand = p2.brand
  AND p.model = p2.model
  AND p.id > p2.id;

-- Add unique constraint on (brand, model) to prevent duplicate products
-- and enable upsert conflict handling in the sync pipeline
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_brand_model
  ON products (brand, model);
