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
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'paid' })
        .eq('id', bookingId);
      if (error) {
        console.error('Ошибка обновления бронирования:', error);
        return NextResponse.json({ error: 'Ошибка обновления бронирования', details: error }, { status: 500 });
      }
    }

    // PayU требует ответить 200 OK и вернуть пустой body
    return new Response('', { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Ошибка обработки уведомления PayU', details: e }, { status: 500 });
  }
} 