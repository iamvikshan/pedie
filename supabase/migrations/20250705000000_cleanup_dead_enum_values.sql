-- Remove dead 'sale' value from listing_type enum
-- Remove dead 'preorder' value from listing_status enum
-- Neither value has any rows using it (verified 0 count)

-- Step 1: Drop partial indexes that reference old listing_type enum values
DROP INDEX IF EXISTS idx_listings_sale;
DROP INDEX IF EXISTS idx_listings_affiliate;

-- Step 2: Replace listing_type enum (remove 'sale')
ALTER TABLE listings ALTER COLUMN listing_type DROP DEFAULT;
CREATE TYPE listing_type_new AS ENUM ('standard', 'preorder', 'affiliate', 'referral');
ALTER TABLE listings
  ALTER COLUMN listing_type TYPE listing_type_new
  USING listing_type::text::listing_type_new;
DROP TYPE listing_type;
ALTER TYPE listing_type_new RENAME TO listing_type;
ALTER TABLE listings ALTER COLUMN listing_type SET DEFAULT 'standard'::listing_type;

-- Step 3: Recreate affiliate partial index (sale index intentionally removed - dead value)
CREATE INDEX idx_listings_affiliate ON listings USING btree (listing_type)
  WHERE (listing_type = 'affiliate'::listing_type);

-- Step 4: Replace listing_status enum (remove 'preorder')
ALTER TABLE listings ALTER COLUMN status DROP DEFAULT;
CREATE TYPE listing_status_new AS ENUM ('available', 'sold', 'reserved', 'onsale');
ALTER TABLE listings
  ALTER COLUMN status TYPE listing_status_new
  USING status::text::listing_status_new;
DROP TYPE listing_status;
ALTER TYPE listing_status_new RENAME TO listing_status;
ALTER TABLE listings ALTER COLUMN status SET DEFAULT 'available'::listing_status;
