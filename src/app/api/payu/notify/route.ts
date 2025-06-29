import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Здесь можно добавить свою обработку уведомления:
    // Например, обновить статус заказа в базе данных
    // body.order.status === 'COMPLETED' и т.д.

    // Для отладки можно логировать:
    console.log('PayU notify:', JSON.stringify(body));

    if (body.order && body.order.status === 'COMPLETED' && body.order.extOrderId) {
      const bookingId = body.order.extOrderId;
      // 1. Обновляем статус
      const { data: booking, error } = await supabase
        .from('bookings')
        .update({ status: 'paid' })
        .eq('id', bookingId)
        .select()
        .single();
      if (error) {
        console.error('Ошибка обновления бронирования:', error);
        return NextResponse.json({ error: 'Ошибка обновления бронирования', details: error }, { status: 500 });
      }
      // 2. Получаем название пакета
      let packageName = '';
      if (booking && booking.package_id) {
        const { data: pkg } = await supabase
          .from('packages')
          .select('name')
          .eq('id', booking.package_id)
          .single();
        packageName = pkg?.name || '';
      }
      // 3. Формируем ссылки
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://smashandfun.pl';
      const changeLink = `${baseUrl}/booking/change?token=${booking.change_token}`;
      const cancelLink = `${baseUrl}/booking/cancel?token=${booking.change_token}`;
      // 4. Отправляем письмо
      await fetch(baseUrl + '/api/sendBookingEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: booking.user_email,
          booking: {
            date: booking.date,
            time: booking.time,
            package: packageName,
            name: booking.name,
            change_link: changeLink,
            cancel_link: cancelLink
          },
          type: 'new'
        })
      });
    }

    // PayU требует ответить 200 OK и вернуть пустой body
    return new Response('', { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Ошибка обработки уведомления PayU', details: e }, { status: 500 });
  }
} 