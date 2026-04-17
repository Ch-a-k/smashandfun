import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import {
  assertSuperadmin,
  buildPersonalization,
  type Contact,
} from '@/lib/emailCampaign';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const adminEmail = req.nextUrl.searchParams.get('adminEmail');
  if (!(await assertSuperadmin(adminEmail))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const email = req.nextUrl.searchParams.get('email');
  const sb = getSupabaseAdmin();
  let contact: Contact | null = null;

  if (email) {
    const { data } = await sb
      .from('email_contacts')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    contact = (data as unknown as Contact) ?? null;
  }
  if (!contact) {
    const { data } = await sb
      .from('email_contacts')
      .select('*')
      .order('last_booking_at', { ascending: false })
      .limit(1);
    contact = ((data || [])[0] as unknown as Contact) ?? null;
  }

  if (!contact) {
    return NextResponse.json({
      vars: buildPersonalization({
        email: 'klient@example.com',
        name: 'Jan Kowalski',
        phone: null,
        first_booking_at: null,
        last_booking_at: null,
        bookings_count: 2,
        total_order_value: 540,
        guests_count: 8,
        has_paid: true,
        has_deposit: false,
        has_pending: false,
        last_order: 240,
        last_booking_id: 'demo-id',
      }),
    });
  }
  return NextResponse.json({ vars: buildPersonalization(contact) });
}
