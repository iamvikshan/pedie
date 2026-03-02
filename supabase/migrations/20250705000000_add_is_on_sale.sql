-- Add is_on_sale flag to listings for flash sale / promotion support
-- Two-step: add with default (backfills existing rows), then enforce NOT NULL
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN DEFAULT false;
UPDATE listings SET is_on_sale = false WHERE is_on_sale IS NULL;
ALTER TABLE listings ALTER COLUMN is_on_sale SET NOT NULL;

-- Partial index for efficient filtering of on-sale items
CREATE INDEX IF NOT EXISTS idx_listings_is_on_sale ON listings(is_on_sale) WHERE is_on_sale = true;

COMMENT ON COLUMN listings.is_on_sale IS 'Flags listings currently participating in a flash sale or promotion';
