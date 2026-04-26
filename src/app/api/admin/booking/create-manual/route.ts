import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import crypto from 'crypto';
import dayjs from 'dayjs';

type ConflictBooking = {
  id: string;
  room_id: string;
  date: string;
  time: string;
  duration_minutes: number | null;
  package: { duration: number | null; cleanup_time: number | null } | null;
};

const ALLOWED_SOURCES = ['b2c', 'b2b', 'walkin', 'manual'] as const;
const ALLOWED_STATUSES = ['paid', 'deposit', 'pending', 'cancelled'] as const;

type Source = (typeof ALLOWED_SOURCES)[number];
type Status = (typeof ALLOWED_STATUSES)[number];

async function isAdminRequest(req: Request) {
  const bearer = req.headers.get('authorization') || '';
  const token = bearer.startsWith('Bearer ') ? bearer.slice(7) : '';
  if (!token) return false;
  const { data: userData, error } = await supabaseAdmin.auth.getUser(token);
  const email = userData?.user?.email;
  if (error || !email) return false;
  const { data: admin } = await supabaseAdmin
    .from('admins')
    .select('email')
    .eq('email', email)
    .maybeSingle()
    .returns<{ email: string } | null>();
  return !!admin?.email;
}

function overlaps(
  aStart: dayjs.Dayjs,
  aEnd: dayjs.Dayjs,
  bStart: dayjs.Dayjs,
  bEnd: dayjs.Dayjs,
) {
  return aStart.isBefore(bEnd) && bStart.isBefore(aEnd);
}

function num(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function POST(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const {
    name,
    email,
    phone,
    room_id,
    date,
    time,
    duration_minutes,
    num_people,
    source,
    total_price,
    deposit_amount,
    status,
    admin_note,
    package_id,
  } = body || {};

  if (!room_id || typeof room_id !== 'string') {
    return NextResponse.json({ error: 'room_id required' }, { status: 400 });
  }
  if (!date || typeof date !== 'string') {
    return NextResponse.json({ error: 'date required' }, { status: 400 });
  }
  if (!time || typeof time !== 'string') {
    return NextResponse.json({ error: 'time required' }, { status: 400 });
  }
  const duration = Math.round(num(duration_minutes));
  if (!duration || duration < 15 || duration > 720) {
    return NextResponse.json(
      { error: 'duration_minutes must be between 15 and 720' },
      { status: 400 },
    );
  }
  const sourceValue: Source | null =
    typeof source === 'string' && (ALLOWED_SOURCES as readonly string[]).includes(source)
      ? (source as Source)
      : null;
  const statusValue: Status =
    typeof status === 'string' && (ALLOWED_STATUSES as readonly string[]).includes(status)
      ? (status as Status)
      : 'pending';

  // Conflict check: any non-cancelled booking on this room/date overlapping our window
  const targetStart = dayjs(`${date} ${time}`);
  const targetEnd = targetStart.add(duration, 'm');

  const { data: dayBookings, error: fetchErr } = await supabaseAdmin
    .from('bookings')
    .select(
      `
        id,
        room_id,
        date,
        time,
        duration_minutes,
        package:package_id (duration, cleanup_time)
      `,
    )
    .eq('room_id', room_id)
    .eq('date', date)
    .neq('status', 'cancelled')
    .returns<ConflictBooking[]>();

  if (fetchErr) {
    return NextResponse.json(
      { error: 'conflict-check failed', details: fetchErr.message },
      { status: 500 },
    );
  }

  const conflict = (dayBookings || []).some((b) => {
    const bStart = dayjs(`${b.date} ${b.time}`);
    let span: number;
    if (b.duration_minutes && b.duration_minutes > 0) {
      span = Number(b.duration_minutes);
    } else if (b.package?.duration) {
      span = Number(b.package.duration) + Number(b.package.cleanup_time ?? 15);
    } else {
      span = 60;
    }
    const bEnd = bStart.add(span, 'm');
    return overlaps(targetStart, targetEnd, bStart, bEnd);
  });

  if (conflict) {
    return NextResponse.json(
      { error: 'Pokój jest zajęty w wybranym oknie czasowym' },
      { status: 409 },
    );
  }

  // Insert
  const totalPriceValue = num(total_price);
  const depositValue = deposit_amount === '' || deposit_amount == null ? null : num(deposit_amount);
  const peopleValue =
    num_people === '' || num_people == null ? null : Math.max(1, Math.round(num(num_people)));

  const insertPayload = {
    user_email: typeof email === 'string' ? email : null,
    name: typeof name === 'string' ? name : null,
    phone: typeof phone === 'string' ? phone : null,
    package_id: typeof package_id === 'string' && package_id ? package_id : null,
    room_id,
    date,
    time,
    duration_minutes: duration,
    num_people: peopleValue,
    source: sourceValue,
    total_price: totalPriceValue,
    deposit_amount: depositValue,
    status: statusValue,
    admin_note: typeof admin_note === 'string' ? admin_note : null,
    change_token: crypto.randomBytes(16).toString('hex'),
  };

  const { data: inserted, error: insertErr } = await supabaseAdmin
    .from('bookings')
    .insert([insertPayload])
    .select('id')
    .single()
    .returns<{ id: string }>();

  if (insertErr) {
    return NextResponse.json(
      { error: 'insert failed', details: insertErr.message },
      { status: 500 },
    );
  }

  // Optional: record deposit/paid as a payment row so analytics see it
  if (
    inserted?.id &&
    (statusValue === 'deposit' || statusValue === 'paid') &&
    (depositValue || totalPriceValue) > 0
  ) {
    const paymentAmount =
      statusValue === 'paid' ? totalPriceValue : depositValue ?? totalPriceValue;
    await supabaseAdmin.from('payments').insert([
      {
        booking_id: inserted.id,
        status: statusValue === 'paid' ? 'paid' : 'deposit',
        amount: Math.round(paymentAmount * 100), // payments stored in cents
        transaction_id: `manual-${inserted.id.slice(0, 8)}`,
      },
    ]);
  }

  return NextResponse.json({ ok: true, id: inserted?.id });
}
