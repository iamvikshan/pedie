-- Add final_price_kes column: the actual customer-facing price
-- Use DEFAULT 0 to avoid NULL race during concurrent inserts
ALTER TABLE listings ADD COLUMN IF NOT EXISTS final_price_kes INTEGER DEFAULT 0;
-- Backfill existing rows with their price_kes value
UPDATE listings SET final_price_kes = price_kes WHERE final_price_kes = 0;
-- Now enforce NOT NULL and drop the temporary default
ALTER TABLE listings ALTER COLUMN final_price_kes SET NOT NULL;
ALTER TABLE listings ALTER COLUMN final_price_kes DROP DEFAULT;
