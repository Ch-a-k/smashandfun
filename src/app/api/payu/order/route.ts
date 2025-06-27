import { NextResponse } from 'next/server';

interface Product {
  name: string;
  unitPrice: string;
  quantity: number;
}

export async function POST(req: Request) {
  const env = process.env.PAYU_ENV || 'sandbox';
  const posId = process.env.PAYU_POS_ID;
  const notifyUrl = process.env.PAYU_NOTIFY_URL;
  const continueUrl = process.env.PAYU_CONTINUE_URL;

  // Получаем параметры заказа из тела запроса
  const body = await req.json();
  const { amount, currency, description, email, products } = body as {
    amount: string;
    currency: string;
    description: string;
    email: string;
    products: Product[];
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

  // Получаем access token
  const tokenUrl = env === 'sandbox'
    ? 'https://secure.snd.payu.com/pl/standard/user/oauth/authorize'
    : 'https://secure.payu.com/pl/standard/user/oauth/authorize';
  const clientId = process.env.PAYU_CLIENT_ID;
  const clientSecret = process.env.PAYU_CLIENT_SECRET;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const tokenRes = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
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
  const text = await orderRes.text();
  let orderData;
  try {
    orderData = JSON.parse(text);
  } catch (e) {
    console.error('PayU: Ответ не JSON, а текст:', text);
    return NextResponse.json({ error: 'PayU вернул не JSON', details: text }, { status: 500 });
  }
  if (!orderRes.ok) {
    console.error('PayU: Ошибка создания заказа', orderData);
    return NextResponse.json({ error: 'Ошибка создания заказа PayU', details: orderData }, { status: 500 });
  }
  // Возвращаем ссылку для оплаты
  return NextResponse.json({ redirectUri: orderData.redirectUri, orderId: orderData.orderId });
} 