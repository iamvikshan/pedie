-- Schema refinements: enforce product_name NOT NULL, prevent orphaned orders,
-- and constrain sync_log status values.

-- 1. order_items.product_name: backfill NULLs, set default, add NOT NULL
UPDATE order_items SET product_name = 'UNKNOWN' WHERE product_name IS NULL;
ALTER TABLE order_items ALTER COLUMN product_name SET DEFAULT 'UNKNOWN';
ALTER TABLE order_items ALTER COLUMN product_name SET NOT NULL;

-- 2. orders.user_id: change FK from CASCADE to RESTRICT to preserve order history
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE RESTRICT;

-- 3. sync_log.status: constrain to valid state machine values (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE c.conname = 'chk_sync_log_status' AND t.relname = 'sync_log'
  ) THEN
    ALTER TABLE sync_log ADD CONSTRAINT chk_sync_log_status
      CHECK (status IN ('running', 'completed', 'failed', 'cancelled', 'success', 'partial', 'error'));
  END IF;
END
$$;
