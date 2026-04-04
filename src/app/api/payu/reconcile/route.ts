import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { findPaymentIdByTransactionId } from '@/lib/payuPaymentIdempotency';

type PayuOrder = {
  orderId: string;
  extOrderId?: string;
  status: string;
  totalAmount: string;
};

function normalizeBookingTotal(rawTotal: number, payuAmountPln: number) {
  if (!Number.isFinite(rawTotal)) return 0;
  if (payuAmountPln > 0) {
    const asPln = rawTotal;
    const asPlnFromCents = rawTotal / 100;
    if (Math.abs(asPlnFromCents - payuAmountPln) <= 1 && asPln > payuAmountPln * 20) {
      return asPlnFromCents;
    }
  }
  return rawTotal;
}

function requireCronAuth(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const header = req.headers.get('x-cron-secret') || '';
  const bearer = req.headers.get('authorization') || '';
  const token = bearer.startsWith('Bearer ') ? bearer.slice(7) : '';
  return header === secret || token === secret;
}

async function isAdminRequest(req: Request) {
  const bearer = req.headers.get('authorization') || '';
  const token = bearer.startsWith('Bearer ') ? bearer.slice(7) : '';
  if (!token) return false;
  const { data: userData, error } = await supabaseAdmin.auth.getUser(token);
  const email = userData?.user?.email;
  if (error || !email) return false;
  const { data: admin } = await supabaseAdmin
    .from('admins')
    .select('email')
    .eq('email', email)
    .maybeSingle()
    .returns<{ email: string } | null>();
  return !!admin?.email;
}

async function isAuthorized(req: Request) {
  if (requireCronAuth(req)) return true;
  return isAdminRequest(req);
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
    if (!await isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const env = process.env.PAYU_ENV || 'sandbox';
    const daysBack = Number(process.env.RECONCILE_DAYS || '2');
    const limitRaw = process.env.RECONCILE_LIMIT;
    const limit = limitRaw ? Number(limitRaw) : undefined;
    const upcomingMinutes = Number(process.env.RECONCILE_UPCOMING_MINUTES || '10');
    const accessToken = await getAccessToken(env);

    const url = new URL(req.url);
    let body: { fromDate?: string; toDate?: string } | null = null;
    if (req.method === 'POST') {
      try {
        body = await req.json();
      } catch {
        body = null;
      }
    }
    const fromDate = body?.fromDate || url.searchParams.get('from') || undefined;
    const toDate = body?.toDate || url.searchParams.get('to') || undefined;

    let recentBookings: Array<{
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
    }> = [];

    if (fromDate || toDate) {
      let rangeQuery = supabaseAdmin
        .from('bookings')
        .select('id, status, total_price, payu_id, payment_id, package_id, user_email, name, date, time, change_token, created_at')
        .in('status', ['pending', 'deposit', 'paid']);
      if (fromDate) rangeQuery = rangeQuery.gte('date', fromDate);
      if (toDate) rangeQuery = rangeQuery.lte('date', toDate);
      if (limit && Number.isFinite(limit)) rangeQuery = rangeQuery.limit(limit);
      const { data: ranged } = await rangeQuery
        .order('date', { ascending: true })
        .returns<typeof recentBookings>();
      recentBookings = ranged || [];
    } else {
      const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
      let recentQuery = supabaseAdmin
        .from('bookings')
        .select('id, status, total_price, payu_id, payment_id, package_id, user_email, name, date, time, change_token, created_at')
        .in('status', ['pending', 'deposit', 'paid'])
        .gte('created_at', since)
        .or('payu_id.not.is.null,payment_id.not.is.null')
        .order('created_at', { ascending: false });
      if (limit && Number.isFinite(limit)) recentQuery = recentQuery.limit(limit);
      const { data: recent } = await recentQuery.returns<typeof recentBookings>();
      recentBookings = recent || [];
    }

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    let upcomingBookings: typeof recentBookings = [];
    if (!fromDate && !toDate) {
      let upcomingQuery = supabaseAdmin
        .from('bookings')
        .select('id, status, total_price, payu_id, payment_id, package_id, user_email, name, date, time, change_token, created_at')
        .in('status', ['pending', 'deposit', 'paid'])
        .in('date', [todayStr, tomorrowStr])
        .or('payu_id.not.is.null,payment_id.not.is.null');
      if (limit && Number.isFinite(limit)) upcomingQuery = upcomingQuery.limit(limit);
      const { data: upcoming } = await upcomingQuery.returns<typeof recentBookings>();
      upcomingBookings = upcoming || [];
    }

    const merged = new Map<string, {
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
    }>();

    for (const b of recentBookings || []) merged.set(b.id, b);
    for (const b of upcomingBookings || []) {
      const bookingDateTime = new Date(`${b.date}T${b.time}:00`);
      const windowEnd = new Date(Date.now() + upcomingMinutes * 60 * 1000);
      if (bookingDateTime <= windowEnd) {
        merged.set(b.id, b);
      }
    }

    const updated: string[] = [];
    const checked: string[] = [];

    for (const booking of merged.values()) {
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
      if (!order && (fromDate || toDate)) {
        order = await fetchOrderByExtOrderId(accessToken, env, booking.id);
      }
      if (!order) continue;

      checked.push(booking.id);

      if (order.orderId && booking.payu_id !== order.orderId) {
        await supabaseAdmin
          .from('bookings')
          .update({ payu_id: order.orderId })
          .eq('id', booking.id);
      }
      if (order.extOrderId && !booking.payment_id) {
        await supabaseAdmin
          .from('bookings')
          .update({ payment_id: order.extOrderId })
          .eq('id', booking.id);
      }

      if (order.status === 'COMPLETED') {
        const existingPaymentId = await findPaymentIdByTransactionId(order.orderId);

        const { data: existingPayments } = await supabaseAdmin
          .from('payments')
          .select('amount')
          .eq('booking_id', booking.id);

        const previousTotal = existingPayments?.reduce((sum, p) => sum + Number(p.amount) / 100, 0) ?? 0;
        const payuAmountPln = Number(order.totalAmount) / 100;
        const newPaymentAmount = existingPaymentId ? 0 : payuAmountPln;
        const newTotal = previousTotal + newPaymentAmount;
        const orderTotal = normalizeBookingTotal(Number(booking.total_price), payuAmountPln);
        const bookingStatus: 'paid' | 'deposit' = newTotal >= orderTotal ? 'paid' : 'deposit';
        const paymentStatus: 'paid' | 'deposit' = bookingStatus;

        if (booking.status !== bookingStatus) {
          await supabaseAdmin
            .from('bookings')
            .update({ status: bookingStatus })
            .eq('id', booking.id);
        }

        if (!existingPaymentId) {
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
      } else if (order.status === 'CANCELED' || order.status === 'REJECTED' || order.status === 'REFUNDED' || order.status === 'REFUND') {
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
