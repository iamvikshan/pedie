-- Create listing_type enum
CREATE TYPE listing_type AS ENUM ('standard', 'sale', 'affiliate');

-- Add listing_type column with default 'standard'
ALTER TABLE listings ADD COLUMN listing_type listing_type NOT NULL DEFAULT 'standard';

-- Migrate is_on_sale data: true -> 'sale', false stays 'standard'  
UPDATE listings SET listing_type = 'sale' WHERE is_on_sale = true;

-- Drop old is_on_sale column and its index
DROP INDEX IF EXISTS idx_listings_is_on_sale;
ALTER TABLE listings DROP COLUMN is_on_sale;

-- Add ram column
ALTER TABLE listings ADD COLUMN ram TEXT;

-- Create partial indexes for efficient filtering
CREATE INDEX idx_listings_sale ON listings(listing_type) WHERE listing_type = 'sale';
CREATE INDEX idx_listings_affiliate ON listings(listing_type) WHERE listing_type = 'affiliate';

COMMENT ON COLUMN listings.listing_type IS 'Listing type: standard (normal), sale (flash sale/promo), affiliate (partner link)';
COMMENT ON COLUMN listings.ram IS 'RAM specification (e.g. 8GB, 16GB)';
