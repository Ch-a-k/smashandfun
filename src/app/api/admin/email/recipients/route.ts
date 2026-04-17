import { NextRequest, NextResponse } from 'next/server';
import {
  assertSuperadmin,
  excludeUnsubscribed,
  fetchContacts,
  type SegmentFilters,
} from '@/lib/emailCampaign';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const adminEmail: string | undefined = body.adminEmail;
  if (!(await assertSuperadmin(adminEmail))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const filters: SegmentFilters = body.filters || {};
  const contacts = await fetchContacts(filters);
  const unsubs = await excludeUnsubscribed(contacts.map((c) => c.email));
  const eligible = contacts.filter((c) => !unsubs.has(c.email));
  return NextResponse.json({
    total: contacts.length,
    eligible: eligible.length,
    unsubscribed: contacts.length - eligible.length,
    preview: eligible.slice(0, 10).map((c) => ({
      email: c.email,
      name: c.name,
      total_order_value: c.total_order_value,
      guests_count: c.guests_count,
      bookings_count: c.bookings_count,
    })),
  });
}
