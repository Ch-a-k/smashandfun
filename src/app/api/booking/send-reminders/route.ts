import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  // Определяем диапазон дат (через 24-25 часов)
  const now = new Date();
  const from = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const to = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  const fromDate = from.toISOString().slice(0, 10);
  const toDate = to.toISOString().slice(0, 10);
  const fromTime = from.toISOString().slice(11, 16);
  const toTime = to.toISOString().slice(11, 16);

  // Ищем бронирования на нужную дату и время
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, user_email, name, package_id, date, time, change_token')
    .eq('status', 'paid')
    .gte('date', fromDate)
    .lte('date', toDate);
  if (error) {
    return NextResponse.json({ error: 'Błąd pobierania rezerwacji' }, { status: 500 });
  }

  // Для каждого бронирования отправляем письмо-напоминание
  for (const booking of bookings || []) {
    // Проверяем, что время попадает в нужный диапазон (±1 час)
    if (booking.date === fromDate && booking.time < fromTime) continue;
    if (booking.date === toDate && booking.time > toTime) continue;
    // Получаем название пакета
    const { data: pkg } = await supabase
      .from('packages')
      .select('name')
      .eq('id', booking.package_id)
      .single();
    const cancelLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://smashandfun.pl'}/booking/change?token=${booking.change_token}`;
    await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/sendBookingEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: booking.user_email,
        booking: {
          date: booking.date,
          time: booking.time,
          package: pkg?.name || '',
          name: booking.name || '',
          cancel_link: cancelLink
        },
        type: 'reminder'
      })
    });
  }

  return NextResponse.json({ ok: true, sent: (bookings || []).length });
} 