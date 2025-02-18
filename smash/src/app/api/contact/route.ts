import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(req: Request) {
  console.log('Environment variables check:', {
    hasBotToken: typeof TELEGRAM_BOT_TOKEN === 'string' && TELEGRAM_BOT_TOKEN.length > 0,
    hasChatId: typeof TELEGRAM_CHAT_ID === 'string' && TELEGRAM_CHAT_ID.length > 0,
    botTokenLength: TELEGRAM_BOT_TOKEN?.length,
    chatIdLength: TELEGRAM_CHAT_ID?.length
  });

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Missing environment variables:', {
      hasBotToken: !!TELEGRAM_BOT_TOKEN,
      hasChatId: !!TELEGRAM_CHAT_ID
    });
    return NextResponse.json(
      { error: 'Configuration error: Missing environment variables' },
      { status: 500 }
    );
  }

  try {
    const data = await req.json();
    const { firstName, lastName, phone, email, message } = data;

    console.log('Sending message to Telegram:', {
      firstName,
      lastName,
      phone,
      email,
      messageLength: message?.length
    });

    const text = `
📨 Nowa wiadomość:

👤 Imię: ${firstName}
👥 Nazwisko: ${lastName}
📱 Telefon: ${phone}
📧 Email: ${email}
💬 Wiadomość:
${message}
    `;

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    console.log('Telegram API URL:', telegramUrl);

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    });

    const responseData = await response.json();
    console.log('Telegram API response:', responseData);

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    );
  }
}
