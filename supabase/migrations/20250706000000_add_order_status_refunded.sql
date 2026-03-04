-- Add 'refunded' to the order_status enum for richer order lifecycle tracking
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'refunded';
