import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

function normalizeTime(t: string) {
  return (t || '').slice(0, 5); // HH:mm
}

export async function POST(req: Request) {
  const { token, newDate, newTime } = await req.json();
  if (!token || !newDate || !newTime) {
    return NextResponse.json({ error: 'Brak danych' }, { status: 400 });
  }

  // Находим бронирование по токену
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, user_email, name, package_id, room_id, change_token, status')
    .eq('change_token', token)
    .single();
  if (error || !booking) {
    return NextResponse.json({ error: 'Nieprawidłowy lub już wykorzystany link' }, { status: 404 });
  }

  if (booking.status === 'cancelled') {
    return NextResponse.json({ error: 'Rezerwacja została anulowana' }, { status: 409 });
  }

  // Получаем пакет (комнаты/длительность/уборка), чтобы валидировать перенос и выбрать свободную комнату
  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .select('name, allowed_rooms, room_priority, duration, cleanup_time')
    .eq('id', booking.package_id)
    .single()
    .returns<{
      name: string | null;
      allowed_rooms: string[];
      room_priority: string[] | null;
      duration: number;
      cleanup_time: number | null;
    }>();

  if (pkgError || !pkg) {
    return NextResponse.json({ error: 'Pakiet nie został znaleziony' }, { status: 404 });
  }

  const allowedRooms = (pkg.allowed_rooms || []).filter(Boolean);
  const priority = (pkg.room_priority && pkg.room_priority.length > 0 ? pkg.room_priority : allowedRooms).filter((id) =>
    allowedRooms.includes(id)
  );
  const currentRoomId = booking.room_id as string | null;
  const roomOrder = currentRoomId && priority.includes(currentRoomId)
    ? [currentRoomId, ...priority.filter((id) => id !== currentRoomId)]
    : priority;

  const durationMinutes = Number(pkg.duration) || 60;
  const cleanupMinutes = Number(pkg.cleanup_time) || 15;
  const slotStart = normalizeTime(String(newTime));
  const slotEnd = addMinutes(slotStart, durationMinutes + cleanupMinutes);

  // Берём брони на этот день и комнаты пакета (без cancelled), исключаем текущую бронь
  type DayBookingRow = {
    id: string;
    room_id: string;
    time: string;
    // Depending on PostgREST relationship config, this can be an object or an array
    package:
      | { duration: number; cleanup_time?: number | null }
      | Array<{ duration: number; cleanup_time?: number | null }>
      | null;
  };
  const { data: dayBookings, error: dayErr } = await supabase
    .from('bookings')
    .select(`
      id,
      room_id,
      time,
      status,
      package:package_id (duration, cleanup_time)
    `)
    .in('room_id', roomOrder)
    .eq('date', newDate)
    .neq('status', 'cancelled')
    .neq('id', booking.id)
    .returns<DayBookingRow[]>();

  if (dayErr) {
    console.error('change-date: day bookings error', dayErr);
    return NextResponse.json({ error: 'Błąd sprawdzania dostępności' }, { status: 500 });
  }

  // Подбираем первую свободную комнату
  let selectedRoomId: string | null = null;
  for (const roomId of roomOrder) {
    const roomBookings = (dayBookings || []).filter((b: any) => b.room_id === roomId);
    let overlap = false;
    for (const b of roomBookings) {
      const bStart = normalizeTime(String(b.time));
      const pkgInfo = Array.isArray(b.package) ? b.package[0] : b.package;
      const bDuration = pkgInfo?.duration ? Number(pkgInfo.duration) : durationMinutes;
      const bCleanup = pkgInfo?.cleanup_time ? Number(pkgInfo.cleanup_time) : cleanupMinutes;
      const bEnd = addMinutes(bStart, bDuration + bCleanup);
      if (!(slotEnd <= bStart || slotStart >= bEnd)) {
        overlap = true;
        break;
      }
    }
    if (!overlap) {
      selectedRoomId = roomId;
      break;
    }
  }

  if (!selectedRoomId) {
    return NextResponse.json({ error: 'Brak dostępnych pokoi na wybrany termin' }, { status: 409 });
  }

  // Обновляем дату/время/комнату, делаем ссылку одноразовой
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ date: newDate, time: newTime, room_id: selectedRoomId, change_token: null, updated_at: dayjs().toISOString() })
    .eq('id', booking.id);
  if (updateError) {
    return NextResponse.json({ error: 'Błąd zmiany rezerwacji' }, { status: 500 });
  }

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