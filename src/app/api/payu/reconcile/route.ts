import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type PayuOrder = {
  orderId: string;
  extOrderId?: string;
  status: string;
  totalAmount: string;
};

function requireCronAuth(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const header = req.headers.get('x-cron-secret') || '';
  const bearer = req.headers.get('authorization') || '';
  const token = bearer.startsWith('Bearer ') ? bearer.slice(7) : '';
  return header === secret || token === secret;
}

async function getAccessToken(env: string) {
  if (!process.env.PAYU_CLIENT_ID || !process.env.PAYU_CLIENT_SECRET) {
    throw new Error('PAYU_CLIENT_ID and PAYU_CLIENT_SECRET must be defined');
  }
  if (!process.env.PAYU_SANDBOX_CLIENT_ID || !process.env.PAYU_SANDBOX_CLIENT_SECRET) {
    throw new Error('PAYU_SANDBOX_CLIENT_ID and PAYU_SANDBOX_CLIENT_SECRET must be defined');
  }
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
  const tokenData = tokenText ? JSON.parse(tokenText) : null;
  if (!tokenRes.ok || !tokenData?.access_token) {
    throw new Error('PayU token error');
  }
  return tokenData.access_token as string;
}

async function fetchOrder(accessToken: string, env: string, orderId: string) {
  const orderUrl = env === 'sandbox'
    ? `https://secure.snd.payu.com/api/v2_1/orders/${orderId}`
    : `https://secure.payu.com/api/v2_1/orders/${orderId}`;

  const orderRes = await fetch(orderUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  const orderText = await orderRes.text();
  const orderData = orderText ? JSON.parse(orderText) : null;
  if (!orderRes.ok || !orderData?.orders?.length) {
    return null;
  }
  return orderData.orders[0] as PayuOrder;
}

async function fetchOrderByExtOrderId(accessToken: string, env: string, extOrderId: string) {
  const orderUrl = env === 'sandbox'
    ? `https://secure.snd.payu.com/api/v2_1/orders?extOrderId=${encodeURIComponent(extOrderId)}`
    : `https://secure.payu.com/api/v2_1/orders?extOrderId=${encodeURIComponent(extOrderId)}`;

  const orderRes = await fetch(orderUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  const orderText = await orderRes.text();
  const orderData = orderText ? JSON.parse(orderText) : null;
  if (!orderRes.ok || !orderData?.orders?.length) {
    return null;
  }
  return orderData.orders[0] as PayuOrder;
}

async function handleReconcile(req: Request) {
  try {
    if (!requireCronAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const env = process.env.PAYU_ENV || 'sandbox';
    const daysBack = Number(process.env.RECONCILE_DAYS || '2');
    const limit = Number(process.env.RECONCILE_LIMIT || '50');
    const accessToken = await getAccessToken(env);

    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('id, status, total_price, payu_id, payment_id, package_id, user_email, name, date, time, change_token, created_at')
      .in('status', ['pending', 'deposit', 'paid'])
      .gte('created_at', since)
      .or('payu_id.not.is.null,payment_id.not.is.null')
      .order('created_at', { ascending: false })
      .limit(limit)
      .returns<Array<{
        id: string;
        status: string;
        total_price: number | string;
        payu_id: string | null;
        payment_id: string | null;
        package_id: string | null;
        user_email: string;
        name: string | null;
        date: string;
        time: string;
        change_token: string | null;
        created_at: string;
      }>>();

    const updated: string[] = [];
    const checked: string[] = [];

    for (const booking of bookings || []) {
      let order: PayuOrder | null = null;
      if (booking.payu_id) {
        order = await fetchOrder(accessToken, env, booking.payu_id);
      }
      if (!order && booking.payment_id) {
        if (booking.payment_id.includes(':')) {
          order = await fetchOrderByExtOrderId(accessToken, env, booking.payment_id);
        } else {
          order = await fetchOrder(accessToken, env, booking.payment_id);
          if (!order) {
            order = await fetchOrderByExtOrderId(accessToken, env, booking.payment_id);
          }
        }
      }
      if (!order) continue;

      checked.push(booking.id);

      if (order.orderId && booking.payu_id !== order.orderId) {
        await supabaseAdmin
          .from('bookings')
          .update({ payu_id: order.orderId })
          .eq('id', booking.id);
      }

      if (order.status === 'COMPLETED') {
        const { data: existingPayment } = await supabaseAdmin
          .from('payments')
          .select('id')
          .eq('transaction_id', order.orderId)
          .single();

        const { data: existingPayments } = await supabaseAdmin
          .from('payments')
          .select('amount')
          .eq('booking_id', booking.id);

        const previousTotal = existingPayments?.reduce((sum, p) => sum + Number(p.amount) / 100, 0) ?? 0;
        const newPaymentAmount = existingPayment ? 0 : Number(order.totalAmount) / 100;
        const newTotal = previousTotal + newPaymentAmount;
        const orderTotal = Number(booking.total_price);
        const bookingStatus: 'paid' | 'deposit' = newTotal >= orderTotal ? 'paid' : 'deposit';
        const paymentStatus: 'paid' | 'deposit' = bookingStatus;

        if (booking.status !== bookingStatus) {
          await supabaseAdmin
            .from('bookings')
            .update({ status: bookingStatus })
            .eq('id', booking.id);
        }

        if (!existingPayment) {
          await supabaseAdmin
            .from('payments')
            .insert([
              {
                booking_id: booking.id,
                status: paymentStatus,
                amount: order.totalAmount,
                transaction_id: order.orderId
              }
            ]);
          updated.push(booking.id);
        }
      } else if (order.status === 'CANCELED' || order.status === 'REJECTED') {
        await supabaseAdmin
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', booking.id);
        updated.push(booking.id);
      }
    }

    return NextResponse.json({ ok: true, checked, updated });
  } catch (err) {
    console.error('PayU reconcile error:', err);
    return NextResponse.json({ error: 'Reconcile failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return handleReconcile(req);
}

export async function GET(req: Request) {
  return handleReconcile(req);
}
