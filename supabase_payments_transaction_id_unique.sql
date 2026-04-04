-- One row per PayU orderId (transaction_id). Run in Supabase SQL Editor after fixing duplicate logic in app.
-- 1) Remove duplicates (keeps oldest row per transaction_id)
DELETE FROM payments a
USING payments b
WHERE a.transaction_id IS NOT NULL
  AND a.transaction_id = b.transaction_id
  AND a.id > b.id;

-- 2) Prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_transaction_id_unique
  ON payments (transaction_id)
  WHERE transaction_id IS NOT NULL;
