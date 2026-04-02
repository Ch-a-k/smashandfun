import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST() {
  // Add segment column to users table if it doesn't exist
  const { error } = await supabaseAdmin.rpc('exec_sql', {
    sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS segment text DEFAULT NULL;`,
  });

  // If RPC doesn't exist, try raw query via REST
  if (error) {
    // Fallback: try direct column add via Supabase query
    const testRes = await supabaseAdmin.from('users').select('segment').limit(1);
    if (!testRes.error) {
      return NextResponse.json({ ok: true, message: 'Column already exists' });
    }
    return NextResponse.json({
      ok: false,
      error: 'Run this SQL in Supabase Dashboard → SQL Editor:\n\nALTER TABLE users ADD COLUMN IF NOT EXISTS segment text DEFAULT NULL;',
    }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
