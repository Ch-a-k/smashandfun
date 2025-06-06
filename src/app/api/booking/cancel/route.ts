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

  // Находим бронирование по токену
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, user_email, name, package_id, date, time, change_token')
    .eq('change_token', token)
    .single();
  if (error || !booking) {
    return NextResponse.json({ error: 'Nieprawidłowy lub już wykorzystany link' }, { status: 404 });
  }

  // Ставим статус cancelled и удаляем токен
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', change_token: null })
    .eq('id', booking.id);
  if (updateError) {
    return NextResponse.json({ error: 'Błąd anulowania rezerwacji' }, { status: 500 });
  }

  // (Необязательно) отправляем письмо-подтверждение отмены
  // await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/sendBookingEmail', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     to: booking.user_email,
  //     booking: {
  //       date: booking.date,
  //       time: booking.time,
  //       package: pkg?.name || '',
  //       name: booking.name || ''
  //     },
  //     type: 'cancelled'
  //   })
  // });

  return NextResponse.json({ ok: true });
} 