import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { BookingWithPackage } from '../create/route';
import dayjs from 'dayjs';

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
  while (current <= end) {
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

  const fiveMinutesAgo = dayjs().subtract(2, 'minute').toISOString();
  const { data: bookingToDelete, error: bookingToDeleteError } = await supabase
    .from('bookings')
    .select('id')
    .eq('status', 'pending')
    .lt('created_at', fiveMinutesAgo);



  if (bookingToDeleteError || !bookingToDelete) {
    console.error('bookingToDeleteError', bookingToDeleteError);
  }

  if (bookingToDelete?.length) {
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .in('id', bookingToDelete.map(b => b.id));

    if (deleteError) {
      console.error('Помилка при видаленні бронювань:', deleteError);
    } else {
      console.log(`Видалено ${bookingToDelete.length} прострочених бронювань`);
    }
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
  const interval = 30; // шаг слота 30 минут

  // Время работы
  let WORK_START = '14:00';
  const WORK_END = '20:30';

  // Определяем день недели (0 - воскресенье, 6 - суббота)
  const dayOfWeek = new Date(date).getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    WORK_START = '12:00';
  }

  // Минимальное время старта: через 1 час от текущего времени (если дата сегодня)
  let minStart = WORK_START;

  if (time) {
    const [hours, minutes] = time.split(':').map(Number);

    const now = dayjs();
    const workEndToday = dayjs(now.format('YYYY-MM-DD') + ' ' + WORK_END);

    const inputTime = now.hour(hours).minute(minutes).second(0).millisecond(0);
    const updatedTime = inputTime.add(60, 'minute');

    let newTimeStr = updatedTime.format('HH:mm');

    if (newTimeStr < WORK_START) newTimeStr = WORK_START;

    if (now.isBefore(workEndToday) && updatedTime.isAfter(workEndToday)) {
      newTimeStr = WORK_END;
    }
    
    minStart = newTimeStr;
  }
  // Генерируем слоты каждые 15 минут
  const slots = getTimeSlots(WORK_START, WORK_END, interval, minStart);
  const availableTimes: string[] = [];

  // Получаем все бронирования на этот день
  const { data: bookings, error: bookingError } = await supabase
    .from('bookings')
    .select(`
      time,
      package_id,
      id,
      room_id,
      package:package_id (duration)
    `)
    .in('room_id', allowedRooms)
    .eq('date', date)
    .returns<BookingWithPackage[]>();

  if (bookingError) {
    console.error('Error', bookingError);
    return NextResponse.json({ error: `Błąd odbierający rezerwację ${date}`, details: bookingError }, { status: 500});
  };

  for (const time of slots) {
     // Для каждого слота проверяем, что в каждой комнате нет пересечений с другими бронированиями на весь период (услуга + уборка)
    const slotStart = time;
    const slotEnd = addMinutes(slotStart, duration + cleanup);
    let found = false;
    for (const roomId of allowedRooms) {
      // Проверяем, что ни одно бронирование не пересекается с выбранным слотом
      const roomBookings = bookings.filter(b => b.room_id === roomId);
      let overlap = false;
      for (const b of roomBookings) {
        if (ignoreBookingId && b.id === ignoreBookingId) continue;
        const bStart = b.time;
        const bDuration = b.package && b.package.duration ? Number(b.package.duration) : duration;
        const bEnd = addMinutes(bStart, bDuration + cleanup);
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