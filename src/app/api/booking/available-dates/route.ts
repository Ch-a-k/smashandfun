import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const WORK_START = '09:00';
const WORK_END = '21:00';

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

function getTimeSlots(start: string, end: string, step: number) {
  const slots: string[] = [];
  let current = start;
  while (current < end) {
    slots.push(current);
    current = addMinutes(current, step);
  }
  return slots;
}

export async function POST(req: Request) {
  const { packageId, startDate, endDate } = await req.json();

  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .select('allowed_rooms, duration')
    .eq('id', packageId)
    .single();

  if (pkgError || !pkg) {
    return NextResponse.json({ error: 'Пакет не знайдено' }, { status: 404 });
  }

  const allowedRooms: string[] = pkg.allowed_rooms;
  const duration = Number(pkg.duration) || 60;
  const step = duration + 15;

  const start = new Date(startDate);
  const end = new Date(endDate);

  const dateList: string[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dateList.push(d.toISOString().slice(0, 10));
  }

  const timeSlots = getTimeSlots(WORK_START, WORK_END, step);

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('room_id, date, time')
    .in('room_id', allowedRooms)
    .gte('date', start.toISOString().slice(0, 10))
    .lte('date', end.toISOString().slice(0, 10));

  if (bookingsError) {
    return NextResponse.json({ error: 'Помилка при отриманні бронювань' }, { status: 500 });
  }

  const bookedMap = new Map<string, Set<string>>(); // key = `${date}|${time}` => Set(roomId)

  for (const b of bookings || []) {
    const key = `${b.date}|${b.time}`;
    if (!bookedMap.has(key)) {
      bookedMap.set(key, new Set());
    }
    bookedMap.get(key)!.add(b.room_id);
  }

  const availableDates: string[] = [];

  for (const date of dateList) {
    let found = false;
    for (const time of timeSlots) {
      for (const roomId of allowedRooms) {
        const key = `${date}|${time}`;
        const busyRooms = bookedMap.get(key);
        if (!busyRooms || !busyRooms.has(roomId)) {
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (found) availableDates.push(date);
  }

  return NextResponse.json({ dates: availableDates });
}