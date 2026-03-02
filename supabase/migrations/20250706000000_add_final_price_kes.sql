-- Add final_price_kes column: the actual customer-facing price
-- Default to price_kes for existing rows (no discount by default)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS final_price_kes INTEGER;
UPDATE listings SET final_price_kes = price_kes WHERE final_price_kes IS NULL;
ALTER TABLE listings ALTER COLUMN final_price_kes SET NOT NULL;
