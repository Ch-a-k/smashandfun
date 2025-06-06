import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Используем серверный Supabase client (чтобы не было ошибок импорта)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  let data: Record<string, string> = {};
  try {
    data = JSON.parse(body) as Record<string, string>;
  } catch {
    // fallback: парсим вручную (form-urlencoded)
    body.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      data[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
  }

  // Получаем bookingId из sessionId
  const bookingId = data.sessionId?.split('-')[0];
  if (!bookingId) {
    return NextResponse.json({ error: 'Brak bookingId' }, { status: 400 });
  }

  // Обновляем статус бронирования
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'paid' })
    .eq('id', bookingId);

  if (error) {
    return NextResponse.json({ error: 'Błąd aktualizacji statusu' }, { status: 500 });
  }

  // Генерируем одноразовый токен для смены даты/времени
  const changeToken = crypto.randomBytes(24).toString('hex');
  await supabase
    .from('bookings')
    .update({ change_token: changeToken })
    .eq('id', bookingId);

  // Получаем данные бронирования и пакета для письма
  const { data: booking } = await supabase
    .from('bookings')
    .select('user_email, date, time, package_id, name, phone, extra_items, change_token')
    .eq('id', bookingId)
    .single();
  if (booking) {
    // --- Временно убираю отправку письма после оплаты для тестов ---
    // if (booking.user_email && pkg) {
    //   const cancelLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://smashandfun.pl'}/booking/change?token=${booking.change_token}`;
    //   await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/sendBookingEmail', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       to: booking.user_email,
    //       booking: {
    //         date: booking.date,
    //         time: booking.time,
    //         package: pkg.name || '',
    //         people: pkg.people_count || '',
    //         name: booking.name || '',
    //         cancel_link: cancelLink
    //       },
    //       type: 'new'
    //     })
    //   });
    // }
  }

  // Przelewy24 ждёт 'OK' в ответе
  return new Response('OK');
} 