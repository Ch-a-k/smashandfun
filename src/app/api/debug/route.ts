import { NextResponse } from 'next/server';

// Funkcja do bezpiecznego sprawdzania tokena
const maskToken = (token?: string) => {
  if (!token) return null;
  if (token.length < 8) return '[zbyt-krótki]';
  return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
};

export async function GET() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    // Sprawdzamy Telegram API
    let apiResponse = null;
    let apiError = null;
    
    if (botToken && chatId) {
      try {
        const telegramUrl = `https://api.telegram.org/bot${botToken}/getMe`;
        const response = await fetch(telegramUrl);
        apiResponse = await response.json();
      } catch (err) {
        apiError = err instanceof Error ? err.message : String(err);
      }
    }
    
    // Используем NextResponse явно, чтобы линтер не ругался
    const jsonResponse = NextResponse.json({
      environment: process.env.NODE_ENV,
      has_bot_token: !!botToken,
      masked_token: maskToken(botToken),
      token_length: botToken?.length,
      has_chat_id: !!chatId,
      masked_chat_id: chatId ? `${chatId.substring(0, 2)}...` : null, 
      vercel_environment: process.env.VERCEL_ENV,
      telegram_api_test: apiResponse,
      api_error: apiError,
      timestamp: new Date().toISOString()
    });
    
    return jsonResponse;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Nieznany błąd' },
      { status: 500 }
    );
  }
} 