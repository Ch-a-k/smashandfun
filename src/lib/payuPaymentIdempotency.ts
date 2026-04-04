import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * PayU orderId must not use `.single()` for idempotency: if duplicates already exist,
 * `.single()` errors and returns null → code inserts again on every reconcile cron tick.
 */
export async function findPaymentIdByTransactionId(
  transactionId: string | null | undefined
): Promise<string | null> {
  if (!transactionId) return null;
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('id')
    .eq('transaction_id', transactionId)
    .limit(1)
    .maybeSingle()
    .returns<{ id: string } | null>();
  if (error) return null;
  return data?.id ?? null;
}
