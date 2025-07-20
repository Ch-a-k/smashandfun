import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import dayjs from 'dayjs';

function timeToMinutes(timeStr:any) {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  return hours * 60 + minutes;
}

export async function POST(req: Request) {
  const { code, total, time, date } = await req.json();
  if (!code) {
    return NextResponse.json({ valid: false, message: 'Промокод не указан' }, { status: 400 });
  }
  const { data: promo, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code)
    .single();
  if (error || !promo) {
    return NextResponse.json({ valid: false, message: 'Промокод не найден' }, { status: 404 });
  }
  // Проверка срока действия
  const dayOfWeek = dayjs(date).get('day');
  const isWeekend = (dayOfWeek === 6) || (dayOfWeek  === 0);
  if(isWeekend) {
    return NextResponse.json({ valid: false, message: 'Промокод неактивен в выходные' }, { status: 400 });
  }
  
  if (date && (promo.valid_from && date < promo.valid_from) || (promo.valid_to && date > promo.valid_to)) {
    return NextResponse.json({ valid: false, message: 'Промокод неактивен' }, { status: 400 });
  }
  // Проверка лимита
  if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
    return NextResponse.json({ valid: false, message: 'Промокод уже использован максимальное число раз' }, { status: 400 });
  }
  // --- Проверка времени действия промокода ---
  if (promo.time_from && promo.time_to && time) {
    // time, time_from, time_to — строки вида '14:00'
    if (timeToMinutes(time) < timeToMinutes(promo.time_from) || timeToMinutes(time) > timeToMinutes(promo.time_to)) {
      return NextResponse.json({ valid: false, message: 'Промокод действует только в определённые часы' }, { status: 400 });
    }
  }
  // Считаем скидку
  let discountAmount = 0;
  let discountPercent = 0;
  let newTotal = total;
  if (promo.discount_amount) {
    discountAmount = Number(promo.discount_amount);
    newTotal = Math.max(0, Number(total) - discountAmount);
  } else if (promo.discount_percent) {
    discountPercent = Number(promo.discount_percent);
    discountAmount = Math.round(Number(total) * discountPercent / 100);
    newTotal = Math.max(0, Number(total) - discountAmount);
  }
  return NextResponse.json({
    valid: true,
    discountAmount,
    discountPercent,
    newTotal,
    message: 'Промокод применён'
  });
} 