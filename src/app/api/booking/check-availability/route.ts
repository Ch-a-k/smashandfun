import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

function pad(num: number) {
  return num.toString().padStart(2, '0');
}

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  return pad(date.getHours()) + ':' + pad(date.getMinutes());
}

function getTimeSlots(start: string, end: string, interval: number, minStart: string) {
  // interval — шаг в минутах (например, 15)
  const slots: string[] = [];
  let current = start;
  while (current < end) {
    if (current >= minStart) slots.push(current);
    current = addMinutes(current, interval);
  }
  return slots;
}

export async function POST(req: Request) {
  const { packageId, date, token, time } = await req.json();
  let ignoreBookingId: string | null = null;
  if (token) {
    // Получаем bookingId по токену
    const { data: booking } = await supabase
      .from('bookings')
      .select('id')
      .eq('change_token', token)
      .single();
    if (booking) ignoreBookingId = booking.id;
  }

  // Получаем пакет и список допустимых комнат
  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .select('allowed_rooms, duration')
    .eq('id', packageId)
    .single();

  if (pkgError || !pkg) {
    return NextResponse.json({ error: 'Пакет не найден' }, { status: 404 });
  }

  const allowedRooms: string[] = pkg.allowed_rooms;
  const duration = Number(pkg.duration) || 60; // минуты
  const cleanup = 15; // уборка
  const interval = 15; // шаг слота (15 минут)

  // Время работы
  const WORK_START = '09:00';
  const WORK_END = '21:00';

  // Минимальное время старта: через 1 час от текущего времени (если дата сегодня)
  let minStart = WORK_START;
  if(time) {
    const [hours, minutes] = time.split(':').map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0); 

    date.setMinutes(date.getMinutes() + 60);

    const newHours = date.getHours().toString().padStart(2, '0');
    const newMinutes = date.getMinutes().toString().padStart(2, '0');
    minStart = `${newHours}:${newMinutes}`;

    if (minStart < WORK_START) minStart = WORK_START;
    if (minStart > WORK_END) minStart = WORK_END;
  }

  // Генерируем слоты каждые 15 минут
  const slots = getTimeSlots(WORK_START, WORK_END, interval, minStart);
  const availableTimes: string[] = [];

  // Получаем все бронирования на этот день
  const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('time, package_id, id, room_id')
        .in('room_id', allowedRooms)
        .eq('date', date);

  if (bookingError) {
    console.error('Error', bookingError);
    return NextResponse.json({ error: `Помилка отримання бронювання на ${date}`, details: bookingError }, { status: 500});
  };

  for (const time of slots) {
    // Для каждого слота проверяем, что в каждой комнате нет пересечений с другими бронированиями на весь период (услуга + уборка)
    let found = false;
    for (const roomId of allowedRooms) {
      console.log('roomId', roomId);
      // Проверяем, что ни одно бронирование не пересекается с выбранным слотом
      const slotStart = time;
      // slotEnd = slotStart + duration + cleanup
      const slotEnd = addMinutes(slotStart, duration + cleanup);
      let overlap = false;
      for (const b of bookings || []) {
        if (ignoreBookingId && b.id === ignoreBookingId) continue;
        const bStart = b.time;
        const bEnd = addMinutes(bStart, duration + cleanup);
        // Проверяем пересечение интервалов
        if (!(slotEnd <= bStart || slotStart >= bEnd)) {
          overlap = true;
          break;
        }
      }
      if (!overlap) {
        found = true;
        break;
      }
    }
    if (found) availableTimes.push(time);
  }

  return NextResponse.json({ times: availableTimes });
} 