import { createClient } from '@supabase/supabase-js';

let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  return { url, anonKey };
}

export function getSupabase() {
  if (_supabase) return _supabase;

  const { url, anonKey } = getSupabaseEnv();

  if (!url) {
    throw new Error('supabaseUrl is required (set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL).');
  }
  if (!anonKey) {
    throw new Error(
      'supabase anon key is required (set NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY).'
    );
  }

  _supabase = createClient(url, anonKey);
  return _supabase;
}

// Backwards-compatible export, but без инициализации на этапе импорта (важно для next build).
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getSupabase() as any)[prop];
  },
});