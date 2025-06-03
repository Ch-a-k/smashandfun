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

  // Получаем пакет
  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .select('allowed_rooms, duration')
    .eq('id', packageId)
    .single();

  if (pkgError || !pkg) {
    return NextResponse.json({ error: 'Пакет не найден' }, { status: 404 });
  }

  const allowedRooms: string[] = pkg.allowed_rooms;
  const duration = Number(pkg.duration) || 60;
  const step = duration + 15;

  const availableDates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (
    let date = new Date(start);
    date <= end;
    date.setDate(date.getDate() + 1)
  ) {
    const dateStr = date.toISOString().slice(0, 10);
    const slots = getTimeSlots(WORK_START, WORK_END, step);
    let found = false;
    for (const time of slots) {
      for (const roomId of allowedRooms) {
        const { data: bookings, error: bookingError } = await supabase
          .from('bookings')
          .select('id')
          .eq('room_id', roomId)
          .eq('date', dateStr)
          .eq('time', time);
        if (bookingError) continue;
        if (!bookings || bookings.length === 0) {
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (found) availableDates.push(dateStr);
  }

  return NextResponse.json({ dates: availableDates });
} 