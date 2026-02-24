-- Safety: back up rows with NULL brand or model before deleting
CREATE TABLE IF NOT EXISTS products_backup AS
  SELECT * FROM products WHERE false;

INSERT INTO products_backup
  SELECT * FROM products WHERE brand IS NULL OR model IS NULL;

DO $$
DECLARE null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count FROM products WHERE brand IS NULL OR model IS NULL;
  RAISE NOTICE 'Backing up and removing % row(s) with NULL brand/model', null_count;
END $$;

DELETE FROM products WHERE brand IS NULL OR model IS NULL;

-- Handle existing NULLs safely (already deleted, but belt-and-suspenders)
UPDATE products SET brand = 'Unknown' WHERE brand IS NULL;
UPDATE products SET model = 'Unknown' WHERE model IS NULL;

-- Ensure brand and model are NOT NULL to make the unique index effective
-- Use a short lock_timeout to avoid blocking reads/writes for too long
SET lock_timeout = '5s';
ALTER TABLE products
  ALTER COLUMN brand SET NOT NULL,
  ALTER COLUMN model SET NOT NULL;
RESET lock_timeout;

-- Back up duplicate rows before removing (DISTINCT ON avoids duplicate backup entries
-- when a (brand, model) group has 3+ rows)
INSERT INTO products_backup
  SELECT DISTINCT ON (p.id) p.*
  FROM products p
  WHERE EXISTS (
    SELECT 1 FROM products p2
    WHERE p2.brand = p.brand AND p2.model = p.model AND p2.id < p.id
  );

DO $$
DECLARE dup_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO dup_count FROM products p
    WHERE EXISTS (
      SELECT 1 FROM products p2
      WHERE p2.brand = p.brand AND p2.model = p.model AND p2.id < p.id
    );
  RAISE NOTICE 'Backing up and removing % duplicate (brand, model) row(s)', dup_count;
END $$;

-- Remove duplicate (brand, model) pairs keeping the row with the smallest id
DELETE FROM products p
USING products p2
WHERE p.brand = p2.brand
  AND p.model = p2.model
  AND p.id > p2.id;

-- Add unique constraint on (brand, model) to prevent duplicate products
-- and enable upsert conflict handling in the sync pipeline.
-- Note: For zero-downtime on large tables, split this into a separate migration
-- using CREATE UNIQUE INDEX CONCURRENTLY (which cannot run inside a transaction).
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_brand_model
  ON products (brand, model);
