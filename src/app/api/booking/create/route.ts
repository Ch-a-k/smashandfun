import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { email, packageId, date, time, extraItems, promoCode, name, phone } = await req.json();

  // Получаем пакет и список допустимых комнат
  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .select('*')
    .eq('id', packageId)
    .single();

  if (pkgError || !pkg) {
    return NextResponse.json({ error: 'Пакет не найден' }, { status: 404 });
  }

  // Получаем название пакета
  const packageName = (pkg.name || '').toLowerCase();
  let roomOrder: string[] = [];
  if (packageName.includes('extreme') || packageName.includes('ekstremalny') || packageName.includes('trudny')) {
    // Extreme (или если вдруг по-польски)
    roomOrder = [
      'e1c128dd-8b88-47fb-bcfe-ada02a5ba079', // Pokój 4
      '9ed4926f-2bb9-45c6-ac7c-1c5af8afa6cb'  // Pokój 3
    ];
  } else {
    // Easy, Medium, Hard
    roomOrder = [
      '6cdbbe09-73ae-471e-a3da-13bfa83a52c1', // Pokój 1
      '5757f6b4-c95b-4050-88de-ac00a2bb1269', // Pokój 2
      '9ed4926f-2bb9-45c6-ac7c-1c5af8afa6cb', // Pokój 3
      'e1c128dd-8b88-47fb-bcfe-ada02a5ba079'  // Pokój 4
    ];
  }
  // Оставляем только те комнаты, которые разрешены для этого пакета
  const allowedRooms: string[] = (pkg.allowed_rooms || []).filter((id: string) => roomOrder.includes(id));
  // Сортируем по приоритету
  const sortedRooms = roomOrder.filter(id => allowedRooms.includes(id));
  let selectedRoomId: string | null = null;

  // Перебираем комнаты по приоритету
  for (const roomId of sortedRooms) {
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', roomId)
      .eq('date', date)
      .eq('time', time);
    if (bookingError) {
      return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }
    if (!bookings || bookings.length === 0) {
      selectedRoomId = roomId;
      break;
    }
  }

  if (!selectedRoomId) {
    return NextResponse.json({ error: 'Нет доступных комнат на выбранное время' }, { status: 409 });
  }

  // Считаем сумму: базовая цена + доп. предметы
  let totalPrice = Number(pkg.price);
  if (Array.isArray(extraItems) && extraItems.length > 0) {
    type ExtraSel = { id: string; count?: number };
    type ExtraItem = { id: string; price: number };
    const extraItemIds = (extraItems as ExtraSel[]).map(item => item.id);
    const { data: items, error: itemsError } = await supabase
      .from('extra_items')
      .select('id, price');
    const filteredItems: ExtraItem[] = (items || []).filter((i: ExtraItem) => extraItemIds.includes(i.id));
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
      .single();
    if (!promoError && promo) {
      if (promo.discount_amount) {
        totalPrice = Math.max(0, totalPrice - Number(promo.discount_amount));
      } else if (promo.discount_percent) {
        totalPrice = totalPrice * (1 - promo.discount_percent / 100);
      }
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
        status: 'pending',
        promo_code: promoCode || null,
        name: name || null,
        phone: phone || null,
        change_token: changeToken
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