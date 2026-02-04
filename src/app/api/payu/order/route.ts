import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

interface Product {
  name: string;
  unitPrice: string;
  quantity: number;
}

function getBaseUrl(req: Request) {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;
  if (envBase) return envBase;
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  return host ? `${proto}://${host}` : 'https://smashandfun.pl';
}

function buildContinueUrl(baseUrl: string | undefined, params: Record<string, string | undefined>) {
  if (!baseUrl) return undefined;
  try {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export async function POST(req: Request) {
  const env = process.env.PAYU_ENV || 'sandbox';
  const posId = env === 'sandbox' ? process.env.PAYU_SANDBOX_POS_ID: process.env.PAYU_POS_ID;
  const defaultNotifyUrl = 'https://smashandfun.vercel.app/payu/notifications';
  const envNotifyUrl = process.env.PAYU_NOTIFY_URL;
  const notifyUrl = envNotifyUrl?.startsWith('https://smashandfun.vercel.app/')
    ? envNotifyUrl
    : defaultNotifyUrl;
  const continueUrl = process.env.PAYU_CONTINUE_URL;

  // Получаем параметры заказа из тела запроса
  const body = await req.json();
  const { amount, currency, description, email, products, extOrderId } = body as {
    amount: string;
    currency: string;
    description: string;
    email: string;
    products: Product[];
    extOrderId?: string;
  };

  // Логируем входящие данные для отладки
  console.log('PayU ORDER BODY:', JSON.stringify(body, null, 2));

  // Простая валидация
  if (!amount || isNaN(Number(amount))) {
    console.error('PayU: Niepoprawna kwota', amount);
    return NextResponse.json({ error: 'Niepoprawna kwota' }, { status: 400 });
  }
  if (!currency || typeof currency !== 'string') {
    console.error('PayU: Waluta nie jest wskazana', currency);
    return NextResponse.json({ error: 'Waluta nie jest wskazana' }, { status: 400 });
  }
  if (!description || typeof description !== 'string') {
    console.error('PayU: Opis nie jest określony', description);
    return NextResponse.json({ error: 'Opis nie jest określony' }, { status: 400 });
  }
  if (!email || typeof email !== 'string') {
    console.error('PayU: E -mail nie jest wskazany', email);
    return NextResponse.json({ error: 'E -mail nie jest wskazany' }, { status: 400 });
  }
  if (!Array.isArray(products) || products.length === 0) {
    console.error('PayU: Wachlarz towarów nie jest przenoszony', products);
    return NextResponse.json({ error: 'Wachlarz towarów nie jest przenoszony' }, { status: 400 });
  }
  if (Number(amount) <= 0) {
    console.log('PayU: Płatne nakaz', amount, extOrderId);
    if(extOrderId) {
      const { data: booking, error: bookingError  } = await supabaseAdmin
        .from('bookings')
        .select()
        .eq('id', extOrderId)
        .single();

      if (bookingError || !booking) {
        console.error('Booking not found:', bookingError);
        return NextResponse.json({ redirectUri: continueUrl });
      }

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
    }
     
    return NextResponse.json({ redirectUri: continueUrl });
  }
  for (const p of products) {
    if (!p.name || !p.unitPrice || isNaN(Number(p.unitPrice)) || Number(p.unitPrice) <= 0 || !p.quantity || p.quantity <= 0) {
      console.error('PayU: Nieprawidłowe towary', p);
      return NextResponse.json({ error: 'Nieprawidłowe towary', details: p }, { status: 400 });
    }
  }

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
    return NextResponse.json({ error: 'Błąd tokenu PayU', details: tokenText }, { status: 500 });
  }
  const accessToken = tokenData.access_token;

  // Формируем заказ для PayU
  const orderUrl = env === 'sandbox'
    ? 'https://secure.snd.payu.com/api/v2_1/orders'
    : 'https://secure.payu.com/api/v2_1/orders';

  const payuExtOrderId = extOrderId ? `${extOrderId}:${crypto.randomUUID()}` : undefined;
  let packageId: string | undefined;
  if (extOrderId && payuExtOrderId) {
    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .update({ payment_id: payuExtOrderId })
      .eq('id', extOrderId)
      .select('package_id')
      .single<{ package_id: string }>();
    packageId = booking?.package_id;
  }
  
  // Calculate the actual payment value in PLN for tracking
  const valueInPLN = (Number(amount) / 100).toFixed(2);
  
  const continueUrlWithParams = buildContinueUrl(continueUrl, {
    bookingId: extOrderId,
    extOrderId: payuExtOrderId,
    packageId: packageId,
    value: valueInPLN,
  });

  const orderPayload = {
    notifyUrl,
    continueUrl: continueUrlWithParams || continueUrl,
    customerIp: req.headers.get('x-forwarded-for') || '127.0.0.1',
    merchantPosId: posId,
    description,
    currencyCode: currency,
    totalAmount: amount,
    buyer: {
      email,
    },
    products: products.map((p: Product) => ({
      name: p.name,
      unitPrice: p.unitPrice,
      quantity: p.quantity,
    })),
    ...(payuExtOrderId ? { extOrderId: payuExtOrderId } : {}),
    validityTime: 900, // 15 min
  };

  // Логируем payload для PayU
  console.log('PayU ORDER PAYLOAD:', JSON.stringify(orderPayload, null, 2));

  // Отправляем заказ в PayU
  const orderRes = await fetch(orderUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderPayload),
    redirect: 'manual',
  });
  const orderText = await orderRes.text();
  let orderData: { orderId?: string; redirectUri?: string } | null = null;
  try {
    orderData = orderText ? JSON.parse(orderText) : null;
  } catch {
    orderData = null;
  }

  const redirectFromHeader = orderRes.headers.get('location') || undefined;
  const redirectUri = orderData?.redirectUri || redirectFromHeader;
  const orderId = orderData?.orderId;

  const isOk = orderRes.ok || orderRes.status === 302;
  if (!isOk || !redirectUri) {
    console.error('PayU: Błąd tworzenia zamówienia', {
      status: orderRes.status,
      headers: Object.fromEntries(orderRes.headers.entries()),
      body: orderText,
    });
    return NextResponse.json({ error: 'Błąd utworzenia zamówienia payu', details: orderText }, { status: 500 });
  }

  if (extOrderId && orderId) {
    const { error: updateBookingError } = await supabaseAdmin
      .from('bookings')
      .update({ payu_id: orderId })
      .eq('id', extOrderId);

    if (updateBookingError) {
      console.error('Błąd aktualizacji rezerwacji:', updateBookingError);
    }
  }
  // Возвращаем ссылку для оплаты
  return NextResponse.json({ redirectUri, orderId });
} 