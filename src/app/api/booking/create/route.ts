import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import crypto from 'crypto';

import dayjs from 'dayjs';

export type BookingWithPackage = {
  id: string;
  room_id: string;
  date: string;
  time: string;
  package: { duration: number; cleanup_time?: number | null };
};

function getRoomPriority(args: {
  packageName: string;
  allowedRooms: string[];
  roomPriority?: string[] | null;
}) {
  const { packageName, allowedRooms, roomPriority } = args;
  const fromDb = (roomPriority || []).filter(Boolean);
  if (fromDb.length > 0) {
    // Ensure it's a subset of allowed rooms, preserve order
    return fromDb.filter((id) => allowedRooms.includes(id));
  }

  // Backwards-compatible fallback: infer priority by package name
  let roomOrder: string[] = [];
  if (packageName.includes('extreme') || packageName.includes('ekstremalny') || packageName.includes('trudny')) {
    roomOrder = [
      'e1c128dd-8b88-47fb-bcfe-ada02a5ba079', // Pokój 4
      '9ed4926f-2bb9-45c6-ac7c-1c5af8afa6cb'  // Pokój 3
    ];
  } else {
    roomOrder = [
      '6cdbbe09-73ae-471e-a3da-13bfa83a52c1', // Pokój 1
      '5757f6b4-c95b-4050-88de-ac00a2bb1269', // Pokój 2
      '9ed4926f-2bb9-45c6-ac7c-1c5af8afa6cb', // Pokój 3
      'e1c128dd-8b88-47fb-bcfe-ada02a5ba079'  // Pokój 4
    ];
  }

  const filtered = allowedRooms.filter((id: string) => roomOrder.includes(id));
  const sorted = roomOrder.filter((id) => filtered.includes(id));
  return sorted.length > 0 ? sorted : allowedRooms;
}

function overlaps(aStart: dayjs.Dayjs, aEnd: dayjs.Dayjs, bStart: dayjs.Dayjs, bEnd: dayjs.Dayjs) {
  // End is exclusive: if one ends exactly when other starts -> no overlap.
  return aStart.isBefore(bEnd) && bStart.isBefore(aEnd);
}


export async function POST(req: Request) {
  const { email, packageId, date, time, extraItems, promoCode, name, phone,
    } = await req.json();

  // Получаем пакет и список допустимых комнат
  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .select('name, allowed_rooms, room_priority, duration, cleanup_time, price')
    .eq('id', packageId)
    .single()
    .returns<{
      name: string | null;
      allowed_rooms: string[] | null;
      room_priority: string[] | null;
      duration: number;
      cleanup_time: number | null;
      price: number | string | null;
    }>();

  if (pkgError || !pkg) {
    return NextResponse.json({ error: 'Pakiet nie został znaleziony' }, { status: 404 });
  }

  const packageName = (pkg.name ?? '').toLowerCase();
  const allowedRooms: string[] = (pkg.allowed_rooms ?? []).filter(Boolean);
  const sortedRooms = getRoomPriority({ packageName, allowedRooms, roomPriority: pkg.room_priority });
  let selectedRoomId: string | null = null;

  const { data: getBookings, error: getBookingError } = await supabase
    .from('bookings')
    .select(`
      id,
      room_id,
      date,
      time,
      status,
      package:package_id (duration, cleanup_time)
    `)
    .in('room_id', sortedRooms)
    .eq('date', date)
    .neq('status', 'cancelled')
    .returns<BookingWithPackage[]>();

  if (getBookingError) {
    return NextResponse.json({ error: getBookingError.message }, { status: 500 });
  }
  const durationMinutes = Number(pkg.duration) || 60;
  const cleanupMinutes = Number(pkg.cleanup_time) || 15;
  const targetStart = dayjs(`${date} ${time}`);
  const targetEnd = targetStart.add(durationMinutes + cleanupMinutes, 'm');

  for (const roomId of sortedRooms) {
    const bookingsForRoom = getBookings.filter((b: BookingWithPackage) => b.room_id === roomId);

    const conflict = bookingsForRoom.some((b: BookingWithPackage) => {
      const bStart = dayjs(`${b.date} ${b.time}`);
      const bDuration = b.package?.duration ? Number(b.package.duration) : durationMinutes;
      const bCleanup = b.package?.cleanup_time ? Number(b.package.cleanup_time) : cleanupMinutes;
      const bEnd = bStart.add(bDuration + bCleanup, 'm');
      return overlaps(targetStart, targetEnd, bStart, bEnd);
    });

    if (!conflict) {
      selectedRoomId = roomId;
      break;
    }
  }

  if (!selectedRoomId) {
    return NextResponse.json({ error: 'Brak dostępnych pokoi na wybrany czas' }, { status: 409 });
  }

  // Считаем сумму: базовая цена + доп. предметы
  let totalPrice = Number(pkg.price) || 0;
  if (Array.isArray(extraItems) && extraItems.length > 0) {
    type ExtraSel = { id: string; count?: number };
    const extraItemIds = (extraItems as ExtraSel[]).map(item => item.id);
    const { data: items, error: itemsError } = await supabase
      .from('extra_items')
      .select('id, price')
      .returns<Array<{ id: string; price: number }>>();
    const filteredItems = (items || []).filter((i) => extraItemIds.includes(i.id));
    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }
    // Суммируем с учётом количества каждого предмета
    totalPrice += (extraItems as ExtraSel[]).reduce((sum, sel) => {
      const item = filteredItems.find(i => i.id === sel.id);
      return item ? sum + Number(item.price) * (sel.count || 1) : sum;
    }, 0);
  }

  // Применяем промокод (если есть)
  if (promoCode) {
    const { data: promo, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode)
      .single()
      .returns<{
        discount_amount: number | null;
        discount_percent: number | null;
        used_count: number | null;
      }>();

    if (promoError) {
      console.error(promoError);
      return NextResponse.json({ error: promoError.message }, { status: 500 });;
    }
    if (!promoError && promo) {
      if (promo.discount_amount) {
        totalPrice = Math.max(0, totalPrice - Number(promo.discount_amount));
      } else if (promo.discount_percent) {
        totalPrice = totalPrice * (1 - Number(promo.discount_percent) / 100);
      }
    }

    const currentCount = promo.used_count || 0;
    // 2. Оновити з інкрементом +1
    const { error: updateError } = await supabase
      .from('promo_codes')
      .update({ used_count: currentCount + 1 })
      .eq('code', promoCode);
  
    if(updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  // Генерируем change_token
  const changeToken = crypto.randomBytes(24).toString('hex');

  // Создаём бронирование
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert([
      {
        user_email: email,
        package_id: packageId,
        room_id: selectedRoomId,
        date,
        time,
        extra_items: extraItems || [],
        total_price: totalPrice,
        status: totalPrice == 0 ? 'paid' : 'pending',
        promo_code: promoCode || null,
        name: name || null,
        phone: phone || null,
        change_token: changeToken,
      }
    ])
    .select()
    .single();

  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  // Upsert пользователя в таблицу users (с именем и телефоном, если есть)
  await supabase.from('users').upsert({ email, name, phone }, { onConflict: 'email' });

  return NextResponse.json({ booking });
} 