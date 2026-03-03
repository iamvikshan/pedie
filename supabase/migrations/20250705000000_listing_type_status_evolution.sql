-- Phase 1: Evolve listing_type and listing_status enums

-- Add new listing_type values
ALTER TYPE listing_type ADD VALUE IF NOT EXISTS 'preorder';
ALTER TYPE listing_type ADD VALUE IF NOT EXISTS 'referral';

-- Add onsale to listing_status
ALTER TYPE listing_status ADD VALUE IF NOT EXISTS 'onsale';

-- Drop the constraint first
ALTER TABLE listings DROP CONSTRAINT IF EXISTS chk_sold_status_consistency;

-- Drop deprecated boolean columns
ALTER TABLE listings DROP COLUMN IF EXISTS is_preorder;
ALTER TABLE listings DROP COLUMN IF EXISTS is_sold;

-- Migrate sale listings to standard + onsale
UPDATE listings SET listing_type = 'standard', status = 'onsale' WHERE listing_type = 'sale';
