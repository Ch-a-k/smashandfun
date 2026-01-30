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

  // Отправляем письмо-подтверждение отмены
  try {
    let packageName = '';
    if (booking.package_id) {
      const { data: pkg } = await supabase
        .from('packages')
        .select('name')
        .eq('id', booking.package_id)
        .single()
        .returns<{ name: string }>();
      packageName = pkg?.name ?? '';
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://smashandfun.pl';
    const emailRes = await fetch(baseUrl + '/api/sendBookingEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: booking.user_email,
        booking: {
          date: booking.date,
          time: booking.time,
          package: packageName,
          name: booking.name || ''
        },
        type: 'cancelled'
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