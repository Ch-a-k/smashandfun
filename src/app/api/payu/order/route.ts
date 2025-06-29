import { NextResponse } from 'next/server';

interface Product {
  name: string;
  unitPrice: string;
  quantity: number;
}

export async function POST(req: Request) {
  const env = process.env.PAYU_ENV || 'sandbox';
  const posId = env === 'sandbox' ? process.env.PAYU_SANDBOX_POS_ID: process.env.PAYU_POS_ID;
  const notifyUrl = process.env.PAYU_NOTIFY_URL;
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
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    console.error('PayU: Некорректная сумма', amount);
    return NextResponse.json({ error: 'Некорректная сумма' }, { status: 400 });
  }
  if (!currency || typeof currency !== 'string') {
    console.error('PayU: Не указана валюта', currency);
    return NextResponse.json({ error: 'Не указана валюта' }, { status: 400 });
  }
  if (!description || typeof description !== 'string') {
    console.error('PayU: Не указано описание', description);
    return NextResponse.json({ error: 'Не указано описание' }, { status: 400 });
  }
  if (!email || typeof email !== 'string') {
    console.error('PayU: Не указан email', email);
    return NextResponse.json({ error: 'Не указан email' }, { status: 400 });
  }
  if (!Array.isArray(products) || products.length === 0) {
    console.error('PayU: Не передан массив товаров', products);
    return NextResponse.json({ error: 'Не передан массив товаров' }, { status: 400 });
  }
  for (const p of products) {
    if (!p.name || !p.unitPrice || isNaN(Number(p.unitPrice)) || Number(p.unitPrice) <= 0 || !p.quantity || p.quantity <= 0) {
      console.error('PayU: Некорректный товар', p);
      return NextResponse.json({ error: 'Некорректный товар', details: p }, { status: 400 });
    }
  }

  if (!process.env.PAYU_CLIENT_ID || !process.env.PAYU_CLIENT_SECRET ) {
    throw new Error('PAYU_CLIENT_ID and PAYU_CLIENT_SECRET must be defined');
  }

  if (!process.env.PAYU_SANDBOX_CLIENT_ID || !process.env.PAYU_SANDBOX_CLIENT_SECRET) {
    throw new Error('PAYU_SANDBOX_CLIENT_ID and PAYU_SANDBOX_CLIENT_SECRET must be defined');
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

  // Формируем заказ для PayU
  const orderUrl = env === 'sandbox'
    ? 'https://secure.snd.payu.com/api/v2_1/orders'
    : 'https://secure.payu.com/api/v2_1/orders';

  const orderPayload = {
    notifyUrl,
    continueUrl,
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
    ...(extOrderId ? { extOrderId } : {}),
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
  });
  if (!orderRes.ok) {
    console.error('PayU: Ошибка создания заказа', orderRes);
    return NextResponse.json({ error: 'Ошибка создания заказа PayU', details: orderRes }, { status: 500 });
  }
  const parsedUrl = new URL(orderRes.url);
  const orderId = parsedUrl.searchParams.get('orderId');
  // Возвращаем ссылку для оплаты
  return NextResponse.json({ redirectUri: orderRes.url, orderId });
} 