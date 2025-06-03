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
  const { packageId, date } = await req.json();

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
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  if (date === todayStr) {
    now.setMinutes(now.getMinutes() + 60);
    minStart = pad(now.getHours()) + ':' + pad(now.getMinutes());
    if (minStart < WORK_START) minStart = WORK_START;
    if (minStart > WORK_END) minStart = WORK_END;
  }

  // Генерируем слоты каждые 15 минут
  const slots = getTimeSlots(WORK_START, WORK_END, interval, minStart);
  const availableTimes: string[] = [];

  for (const time of slots) {
    // Для каждого слота проверяем, что в каждой комнате нет пересечений с другими бронированиями на весь период (услуга + уборка)
    let found = false;
    for (const roomId of allowedRooms) {
      // Получаем все бронирования в этой комнате на этот день
      const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('time, package_id')
        .eq('room_id', roomId)
        .eq('date', date);
      if (bookingError) continue;
      // Проверяем, что ни одно бронирование не пересекается с выбранным слотом
      const slotStart = time;
      // slotEnd = slotStart + duration + cleanup
      const slotEnd = addMinutes(slotStart, duration + cleanup);
      let overlap = false;
      for (const b of bookings || []) {
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