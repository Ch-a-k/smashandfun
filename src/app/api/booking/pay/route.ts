import { NextResponse } from 'next/server';

// Здесь должны быть реальные ключи Przelewy24 из process.env
const PRZELEWY24_MERCHANT_ID = process.env.PRZELEWY24_MERCHANT_ID;
const PRZELEWY24_POS_ID = process.env.PRZELEWY24_POS_ID || process.env.PRZELEWY24_MERCHANT_ID;
const PRZELEWY24_API_KEY = process.env.PRZELEWY24_API_KEY;
const PRZELEWY24_CRC = process.env.PRZELEWY24_CRC;
const IS_SANDBOX = process.env.PRZELEWY24_SANDBOX === 'true';

export async function POST(req: Request) {
  const { bookingId, amount, email } = await req.json();

  // Проверка обязательных данных
  if (!PRZELEWY24_MERCHANT_ID || !PRZELEWY24_API_KEY || !PRZELEWY24_CRC) {
    return NextResponse.json({ error: 'Brak konfiguracji Przelewy24' }, { status: 500 });
  }

  // Формируем данные для транзакции
  const sessionId = bookingId + '-' + Date.now();
  const amountInt = Math.round(Number(amount) * 100); // PLN -> grosze
  const data = {
    merchantId: PRZELEWY24_MERCHANT_ID,
    posId: PRZELEWY24_POS_ID,
    sessionId,
    amount: amountInt,
    currency: 'PLN',
    description: 'Rezerwacja Smash&Fun',
    email,
    country: 'PL',
    language: 'pl',
    urlReturn: process.env.PRZELEWY24_URL_RETURN || 'https://smashandfun.pl/booking/thank-you',
    urlStatus: process.env.PRZELEWY24_URL_STATUS || 'https://smashandfun.pl/api/booking/p24-status',
    encoding: 'UTF-8',
  };

  // URL для sandbox/prod
  const apiUrl = IS_SANDBOX
    ? 'https://sandbox.przelewy24.pl/api/v1/transaction/register'
    : 'https://secure.przelewy24.pl/api/v1/transaction/register';
  const redirectBase = IS_SANDBOX
    ? 'https://sandbox.przelewy24.pl/trnRequest/'
    : 'https://secure.przelewy24.pl/trnRequest/';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${PRZELEWY24_POS_ID}:${PRZELEWY24_API_KEY}`).toString('base64'),
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result && result.data && result.data.token) {
      return NextResponse.json({ redirectUrl: redirectBase + result.data.token });
    } else {
      // Логируем ответ для отладки
      // eslint-disable-next-line no-console
      console.error('Przelewy24 error:', result);
      return NextResponse.json({ error: 'Błąd rejestracji płatności Przelewy24', details: result }, { status: 500 });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Przelewy24 connection error:', err);
    return NextResponse.json({ error: 'Błąd połączenia z Przelewy24' }, { status: 500 });
  }
} 