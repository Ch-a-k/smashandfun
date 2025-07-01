import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const env = process.env.PAYU_ENV || 'sandbox';
    const body = await req.json();
    // Здесь можно добавить свою обработку уведомления:
    // Например, обновить статус заказа в базе данных
    // body.order.status === 'COMPLETED' и т.д.

    // Для отладки можно логировать:

    if (body.order && body.order.status === 'WAITING_FOR_CONFIRMATION' && body.order.extOrderId && body.order.orderId) {
      if (!process.env.PAYU_CLIENT_ID || !process.env.PAYU_CLIENT_SECRET) {
        return NextResponse.json({ error: 'PAYU_CLIENT_ID and PAYU_CLIENT_SECRET must be defined' }, { status: 400 });
      }

      if (!process.env.PAYU_SANDBOX_CLIENT_ID || !process.env.PAYU_SANDBOX_CLIENT_SECRET) {
        return NextResponse.json({ error: 'PAYU_SANDBOX_CLIENT_ID and PAYU_SANDBOX_CLIENT_SECRET must be defined' }, { status: 400 });
      }
      // Получаем access token
      const tokenUrl = env === 'sandbox'
        ? 'https://secure.snd.payu.com/pl/standard/user/oauth/authorize'
        : 'https://secure.payu.com/pl/standard/user/oauth/authorize';
      const clientId: string = env === 'sandbox' ? process.env.PAYU_SANDBOX_CLIENT_ID : process.env.PAYU_CLIENT_ID;
      const clientSecret: string = env === 'sandbox' ? process.env.PAYU_SANDBOX_CLIENT_SECRET : process.env.PAYU_CLIENT_SECRET;

      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);

      const tokenRes = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: params.toString(),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        console.error('PayU: Ошибка получения токена', tokenData);
        return NextResponse.json({ error: 'Ошибка получения токена PayU', details: tokenData }, { status: 500 });
      }
      const accessToken = tokenData.access_token;

      // const retriveUrl = env === 'sandbox'
      // ? `https://secure.snd.payu.com/api/v2_1/orders/${body.order.orderId}`
      // : `https://secure.payu.com/api/v2_1/orders/${body.order.orderId}`;

      // const retriveRes = await fetch(retriveUrl, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${accessToken}`,
      //     'Content-Type': 'application/json',
      //   },
      // });

      // console.log('retriveRes', await retriveRes.json());

      const confirmUrl = env === 'sandbox'
        ? `https://secure.snd.payu.com/api/v2_1/orders/${body.order.orderId}/captures`
        : `https://secure.payu.com/api/v2_1/orders/${body.order.orderId}/captures`;

      const confirmRes = await fetch(confirmUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('confirmRes', await confirmRes.json());

      return NextResponse.json({ confirmRes, orderId: body.order.orderId});
    }

    if (body.order && body.order.status === 'COMPLETED' && body.order.extOrderId) {
      const bookingId = body.order.extOrderId;
      // 1. Обновляем статус
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'paid' })
        .eq('id', bookingId)
        .select()
        .single();
      if (bookingError) {
        console.error('Ошибка обновления бронирования:', bookingError);
        return NextResponse.json({ error: 'Ошибка обновления бронирования', details: bookingError }, { status: 500 });
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
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://smashandfun-admin.vercel.app'; // 'https://smashandfun.pl';
      const changeLink = `${baseUrl}/booking/change?token=${booking.change_token}`;
      const cancelLink = `${baseUrl}/booking/cancel?token=${booking.change_token}`;
      // 4. Додаємо дані про оплату в нашу БД
      const { error: paymentsError } = await supabase
        .from('payments')
        .insert([
          {
            booking_id: bookingId,
            status: body.order.status,
            amount: body.order.totalAmount,
            transaction_id: body.order.orderId
          }
        ]);

      if (paymentsError) {
        console.error('Помилка інсерту в таблицю payments', paymentsError);
        return NextResponse.json({error: 'Помилка інсерту в таблицю payments', details: paymentsError}, {status: 500}); 
      }

      // 5. Отправляем письмо
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
    console.error('PayU Webhook Error:', e);
    return NextResponse.json({ error: 'Ошибка обработки уведомления PayU', details: e }, { status: 500 });
  }
} 