import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Используем серверный Supabase client (чтобы не было ошибок импорта)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  let data: any = {};
  try {
    data = JSON.parse(body);
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

  // Przelewy24 ждёт 'OK' в ответе
  return new Response('OK');
} 