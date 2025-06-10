import { NextResponse } from "next/server";
import {
  P24,
  Currency,
  Country,
  Language,
  Encoding,
} from "@ingameltd/node-przelewy24";

const merchantId = parseInt(process.env.PRZELEWY24_MERCHANT_ID || '0', 10);
const posId = parseInt(process.env.PRZELEWY24_POS_ID || '0', 10);
const crcKey = process.env.PRZELEWY24_CRC || '';
const apiKey = process.env.PRZELEWY24_API_KEY || '';
const isSandbox = process.env.PRZELEWY24_SANDBOX === "true";

// Логируем для отладки (не выводим секреты в ответ клиенту)
console.log('[P24] merchantId:', merchantId);
console.log('[P24] posId:', posId);
console.log('[P24] crcKey:', crcKey ? '***' : 'MISSING');
console.log('[P24] apiKey:', apiKey ? '***' : 'MISSING');
console.log('[P24] isSandbox:', isSandbox);

const p24 = new P24(merchantId, posId, apiKey, crcKey, { sandbox: isSandbox });

export async function POST(req: Request) {
  try {
    const { bookingId, amount, email } = await req.json();
    // Проверяем наличие всех ключей
    if (!merchantId) {
      return NextResponse.json({ error: 'Przelewy24: отсутствует PRZELEWY24_MERCHANT_ID' }, { status: 500 });
    }
    if (!posId) {
      return NextResponse.json({ error: 'Przelewy24: отсутствует PRZELEWY24_POS_ID' }, { status: 500 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: 'Przelewy24: отсутствует PRZELEWY24_API_KEY' }, { status: 500 });
    }
    if (!crcKey) {
      return NextResponse.json({ error: 'Przelewy24: отсутствует PRZELEWY24_CRC' }, { status: 500 });
    }
    const sessionId = `${bookingId}-${Date.now()}`;
    const order = {
      sessionId,
      amount: Math.round(Number(amount) * 100), // PLN -> grosze
      currency: Currency.PLN,
      description: "Rezerwacja Smash&Fun",
      email,
      country: Country.Poland,
      language: Language.PL,
      channel: 1,
      urlReturn: process.env.PRZELEWY24_URL_RETURN || '',
      urlStatus: process.env.PRZELEWY24_URL_STATUS || '',
      timeLimit: 20,
      encoding: Encoding.UTF8,
    };
    const transactionResult = await p24.createTransaction(order);
    return NextResponse.json({ paymentUrl: transactionResult.link });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[P24] Ошибка:', error);
    return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
} 