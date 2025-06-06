import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: 'Brak tokenu' }, { status: 400 });
  }
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, package_id, date, time, status')
    .eq('change_token', token)
    .single();
  if (error || !booking) {
    return NextResponse.json({ error: 'Nie znaleziono rezerwacji' }, { status: 404 });
  }
  return NextResponse.json({ booking });
} 