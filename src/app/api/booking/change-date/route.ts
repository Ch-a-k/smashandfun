import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { token, newDate, newTime } = await req.json();
  if (!token || !newDate || !newTime) {
    return NextResponse.json({ error: 'Brak danych' }, { status: 400 });
  }

  // Находим бронирование по токену
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, user_email, name, package_id, change_token')
    .eq('change_token', token)
    .single();
  if (error || !booking) {
    return NextResponse.json({ error: 'Nieprawidłowy lub już wykorzystany link' }, { status: 404 });
  }

  // Обновляем дату и время, удаляем токен
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ date: newDate, time: newTime, change_token: null })
    .eq('id', booking.id);
  if (updateError) {
    return NextResponse.json({ error: 'Błąd zmiany rezerwacji' }, { status: 500 });
  }

  // Получаем название пакета
  const { data: pkg } = await supabase
    .from('packages')
    .select('name')
    .eq('id', booking.package_id)
    .single();

  // Отправляем письмо с подтверждением изменения
  try {
    const cancelLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://smashandfun.pl'}/booking/cancel?token=${token}`;
    const emailRes = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/sendBookingEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: booking.user_email,
        booking: {
          date: newDate,
          time: newTime,
          package: pkg?.name || '',
          name: booking.name || '',
          cancel_link: cancelLink
        },
        type: 'changed'
      })
    });
    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error('Błąd wysyłania listu:', errText);
      return NextResponse.json({ error: 'Błąd wysyłki emaila' }, { status: 500 });
    }
  } catch (e) {
    console.error('Błąd podczas wysyłania listu:', e);
    return NextResponse.json({ error: 'Błąd wysyłki emaila' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
} 