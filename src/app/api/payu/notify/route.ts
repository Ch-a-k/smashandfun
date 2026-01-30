import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function getBaseUrl(req: Request) {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;
  if (envBase) return envBase;
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  return host ? `${proto}://${host}` : 'https://smashandfun.pl';
}

export async function POST(req: Request) {
  try {
    const env = process.env.PAYU_ENV || 'sandbox';
    const body = await req.json();
    // Здесь можно добавить свою обработку уведомления:
    // Например, обновить статус заказа в базе данных
    // body.order.status === 'COMPLETED' и т.д.

    // Для отладки можно логировать:

    const rawExtOrderId: string | undefined = body.order?.extOrderId;
    const bookingIdFromExtOrderId = rawExtOrderId ? rawExtOrderId.split(':')[0] : undefined;
    const orderIdFromPayu: string | undefined = body.order?.orderId;

    console.log('PayU notify:', {
      status: body.order?.status,
      extOrderId: rawExtOrderId,
      orderId: orderIdFromPayu,
    });

    let resolvedBookingId = bookingIdFromExtOrderId;
    if (!resolvedBookingId && orderIdFromPayu) {
      const { data: bookingByPayu } = await supabaseAdmin
        .from('bookings')
        .select('id')
        .eq('payu_id', orderIdFromPayu)
        .single()
        .returns<{ id: string }>();
      if (bookingByPayu?.id) resolvedBookingId = bookingByPayu.id;
    }
    if (resolvedBookingId && orderIdFromPayu) {
      await supabaseAdmin
        .from('bookings')
        .update({ payu_id: orderIdFromPayu })
        .eq('id', resolvedBookingId);
    }

    if (resolvedBookingId) {
      console.log('PayU notify resolved booking:', resolvedBookingId);
    }

    if (body.order && body.order.status === 'WAITING_FOR_CONFIRMATION' && rawExtOrderId && orderIdFromPayu) {
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
      const clientId = env === 'sandbox' ? process.env.PAYU_SANDBOX_CLIENT_ID! : process.env.PAYU_CLIENT_ID!;
      const clientSecret = env === 'sandbox' ? process.env.PAYU_SANDBOX_CLIENT_SECRET! : process.env.PAYU_CLIENT_SECRET!;

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
      const tokenText = await tokenRes.text();
      let tokenData: { access_token?: string } | null = null;
      try {
        tokenData = tokenText ? JSON.parse(tokenText) : null;
      } catch {
        tokenData = null;
      }
      if (!tokenRes.ok || !tokenData?.access_token) {
        console.error('PayU: Błąd tokenu', tokenText);
        return NextResponse.json({ error: 'Błąd tokenu Payu', details: tokenText }, { status: 500 });
      }
      const accessToken = tokenData.access_token;

      const confirmUrl = env === 'sandbox'
        ? `https://secure.snd.payu.com/api/v2_1/orders/${orderIdFromPayu}/captures`
        : `https://secure.payu.com/api/v2_1/orders/${orderIdFromPayu}/captures`;

      const confirmRes = await fetch(confirmUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('confirmRes', await confirmRes.json());

      return NextResponse.json({ confirmRes, orderId: orderIdFromPayu });
    }

    if (body.order && body.order.status === 'COMPLETED' && resolvedBookingId) {
      const bookingId = resolvedBookingId;

      // 1. Отримуємо інфу про ордер
      const { data: booking, error: bookingError  } = await supabaseAdmin
        .from('bookings')
        .select()
        .eq('id', bookingId)
        .single();

      if (bookingError || !booking) {
        console.error('Booking not found:', bookingError);
        return NextResponse.json({ error: 'Nie znaleziono rezerwacji', details: bookingError }, { status: 404 });
      }

      const orderTotal = Number(booking.total_price);
      const newPaymentAmount = Number(body.order.totalAmount) / 100;

      // 2. Отримуємо інфу про оплати по даному ордеру
      const { data: getExistingPayments, error: getPaymentsError } = await supabaseAdmin
        .from('payments')
        .select('amount')
        .eq('booking_id', bookingId);

      if (getPaymentsError) {
        console.error('Błąd odbierający poprzednie płatności:', getPaymentsError);
        return NextResponse.json({ error: 'Błąd odbierający poprzednie płatności', details: getPaymentsError }, { status: 500 });
      }

      const previousTotal = getExistingPayments?.reduce((sum, p) => sum + Number(p.amount) / 100, 0) ?? 0;
      const newTotal = previousTotal + newPaymentAmount;

      let bookingStatus: 'paid' | 'deposit' = 'deposit';
      let paymentStatus: 'paid' | 'deposit' = 'deposit';

      if (newTotal >= orderTotal) {
        bookingStatus = 'paid';
      }

      if (newTotal >= orderTotal) {
        paymentStatus = 'paid';
      }

      // 3. Обновляем статус ордера
      const { error: updateBookingError } = await supabaseAdmin
        .from('bookings')
        .update({ status: bookingStatus })
        .eq('id', bookingId);

      if (updateBookingError) {
        console.error('Błąd aktualizacji rezerwacji:', updateBookingError);
        return NextResponse.json({ error: 'Błąd rezerwacji', details: updateBookingError }, { status: 500 });
      }

      // 4. Получаем название пакета
      let packageName = '';
      if (booking && booking.package_id) {
        const { data: pkg } = await supabaseAdmin
          .from('packages')
          .select('name')
          .eq('id', booking.package_id)
          .single()
          .returns<{ name: string }>();
        packageName = pkg?.name ?? '';
      }
      
      // 5. Додаємо дані про оплату в нашу БД (idempotent)
      const { data: existingPayment } = await supabaseAdmin
        .from('payments')
        .select('id')
        .eq('transaction_id', body.order.orderId)
        .single();
      if (existingPayment) {
        return new Response('', { status: 200 });
      }

      const { error: paymentsError } = await supabaseAdmin
        .from('payments')
        .insert([
          {
            booking_id: bookingId,
            status: paymentStatus,
            amount: body.order.totalAmount,
            transaction_id: body.order.orderId
          }
        ]);

      if (paymentsError) {
        console.error('Wstaw błąd w tabeli płatności', paymentsError);
        return NextResponse.json({error: 'Wstaw błąd w tabeli płatności', details: paymentsError}, {status: 500}); 
      }

      // 6. Формируем ссылки
      const baseUrl = getBaseUrl(req);
      const changeLink = `${baseUrl}/booking/change?token=${booking.change_token}`;
      const cancelLink = `${baseUrl}/booking/cancel?token=${booking.change_token}`;

      // 7. Отправляем письмо
      const emailRes = await fetch(baseUrl + '/api/sendBookingEmail', {
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
      if (!emailRes.ok) {
        const text = await emailRes.text().catch(() => '');
        console.error('Email send failed:', text || emailRes.status);
      }

      return new Response('', { status: 200 });
    }

    if (body.order && (body.order.status === 'CANCELED' || body.order.status === 'REJECTED') && resolvedBookingId) {
      await supabaseAdmin
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', resolvedBookingId);
      return new Response('', { status: 200 });
    }

    // PayU требует ответить 200 OK и вернуть пустой body
    return new Response('', { status: 200 });
  } catch (e) {
    console.error('PayU Webhook Error:', e);
    return NextResponse.json({ error: 'Błąd przetwarzania powiadomień Payu', details: e }, { status: 500 });
  }
} 