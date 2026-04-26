import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import crypto from 'crypto';

import dayjs from 'dayjs';

export type BookingWithPackage = {
  id: string;
  room_id: string;
  date: string;
  time: string;
  duration_minutes?: number | null;
  package: { duration: number; cleanup_time?: number | null } | null;
};

function normalizePrice(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const asString = String(value ?? '').replace(',', '.');
  const parsed = Number(asString);
  return Number.isFinite(parsed) ? parsed : 0;
}

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
    utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer, landing_page,
    } = await req.json();

  // 1. Получаем пакет и список допустимых комнат
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

  const durationMinutes = Number(pkg.duration) || 60;
  const cleanupMinutes = Number(pkg.cleanup_time) || 15;

  // 2. Считаем сумму: базовая цена + доп. предметы
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
    totalPrice += (extraItems as ExtraSel[]).reduce((sum, sel) => {
      const item = filteredItems.find(i => i.id === sel.id);
      return item ? sum + normalizePrice(item.price) * (sel.count || 1) : sum;
    }, 0);
  }

  // 3. Применяем промокод (валидация + расчёт скидки, но count обновляем ПОСЛЕ успешной брони)
  let promoToUpdate: { code: string; currentCount: number } | null = null;
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
      return NextResponse.json({ error: promoError.message }, { status: 500 });
    }
    if (promo) {
      if (promo.discount_amount) {
        totalPrice = Math.max(0, totalPrice - Number(promo.discount_amount));
      } else if (promo.discount_percent) {
        totalPrice = totalPrice * (1 - Number(promo.discount_percent) / 100);
      }
      promoToUpdate = { code: promoCode, currentCount: promo.used_count || 0 };
    }
  }

  // 4. Генерируем change_token
  const changeToken = crypto.randomBytes(24).toString('hex');
  const status = totalPrice == 0 ? 'paid' : 'pending';

  // 5. Атомарный выбор комнаты + создание брони (через RPC с advisory lock)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let booking: any = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('book_room', {
    p_room_order: sortedRooms,
    p_date: date,
    p_time: time,
    p_duration_minutes: durationMinutes,
    p_cleanup_minutes: cleanupMinutes,
    p_user_email: email,
    p_package_id: packageId,
    p_extra_items: extraItems || [],
    p_total_price: totalPrice,
    p_status: status,
    p_promo_code: promoCode || null,
    p_name: name || null,
    p_phone: phone || null,
    p_change_token: changeToken,
    p_utm_source: utm_source || null,
    p_utm_medium: utm_medium || null,
    p_utm_campaign: utm_campaign || null,
    p_utm_term: utm_term || null,
    p_utm_content: utm_content || null,
    p_referrer: referrer || null,
    p_landing_page: landing_page || null,
  });

  // Если функция ещё не создана — fallback на старую логику (без защиты от race condition)
  const rpcNotFound = rpcError && (
    rpcError.message?.includes('book_room') ||
    rpcError.code === '42883' ||
    rpcError.message?.includes('Could not find the function')
  );

  if (rpcNotFound) {
    // --- FALLBACK: старая логика SELECT + loop + INSERT ---
    const { data: getBookings, error: getBookingError } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        room_id,
        date,
        time,
        status,
        duration_minutes,
        package:package_id (duration, cleanup_time)
      `)
      .in('room_id', sortedRooms)
      .eq('date', date)
      .neq('status', 'cancelled')
      .returns<BookingWithPackage[]>();

    if (getBookingError) {
      return NextResponse.json({ error: getBookingError.message }, { status: 500 });
    }

    const targetStart = dayjs(`${date} ${time}`);
    const targetEnd = targetStart.add(durationMinutes + cleanupMinutes, 'm');
    let selectedRoomId: string | null = null;

    for (const roomId of sortedRooms) {
      const bookingsForRoom = getBookings.filter((b: BookingWithPackage) => b.room_id === roomId);
      const conflict = bookingsForRoom.some((b: BookingWithPackage) => {
        const bStart = dayjs(`${b.date} ${b.time}`);
        let bSpan: number;
        if (b.duration_minutes && b.duration_minutes > 0) {
          bSpan = Number(b.duration_minutes);
        } else if (b.package?.duration) {
          bSpan = Number(b.package.duration) + Number(b.package.cleanup_time ?? 15);
        } else {
          bSpan = durationMinutes + cleanupMinutes;
        }
        const bEnd = bStart.add(bSpan, 'm');
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

    const { data: insertedBooking, error: bookingError } = await supabaseAdmin
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
          status,
          promo_code: promoCode || null,
          name: name || null,
          phone: phone || null,
          change_token: changeToken,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
          utm_term: utm_term || null,
          utm_content: utm_content || null,
          referrer: referrer || null,
          landing_page: landing_page || null,
        }
      ])
      .select()
      .single();

    if (bookingError) {
      return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }
    booking = insertedBooking;
  } else if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 500 });
  } else if ((rpcResult as Record<string, unknown>)?.error === 'NO_AVAILABLE_ROOM') {
    return NextResponse.json({ error: 'Brak dostępnych pokoi na wybrany czas' }, { status: 409 });
  } else {
    booking = rpcResult;
  }

  // 6. Обновляем счётчик промокода (только после успешной брони)
  if (promoToUpdate) {
    const { error: updateError } = await supabaseAdmin
      .from('promo_codes')
      .update({ used_count: promoToUpdate.currentCount + 1 })
      .eq('code', promoToUpdate.code);

    if (updateError) {
      console.error('Failed to update promo code count:', updateError);
    }
  }

  // 7. Upsert пользователя в таблицу users
  await supabaseAdmin.from('users').upsert({ email, name, phone }, { onConflict: 'email' });

  return NextResponse.json({ booking });
}
