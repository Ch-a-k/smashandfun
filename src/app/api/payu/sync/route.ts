import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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

function getBaseUrl(req: Request) {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;
  if (envBase) return envBase;
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  return host ? `${proto}://${host}` : 'https://smashandfun.pl';
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

export async function POST(req: Request) {
  try {
    const env = process.env.PAYU_ENV || 'sandbox';
    const { bookingId, extOrderId } = await req.json();
    if (!bookingId && !extOrderId) {
      return NextResponse.json({ error: 'bookingId or extOrderId is required' }, { status: 400 });
    }

    const accessToken = await getAccessToken(env);
    const order = extOrderId
      ? await fetchOrderByExtOrderId(accessToken, env, extOrderId)
      : null;

    if (!order) {
      return NextResponse.json({ error: 'PayU order not found' }, { status: 404 });
    }
    const resolvedBookingId = bookingId || order.extOrderId?.split(':')[0];

    if (!resolvedBookingId) {
      return NextResponse.json({ error: 'Booking not resolved' }, { status: 404 });
    }

    if (order.orderId) {
      await supabaseAdmin
        .from('bookings')
        .update({ payu_id: order.orderId })
        .eq('id', resolvedBookingId);
    }

    if (order.status === 'COMPLETED') {
      const { data: booking, error: bookingError } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('id', resolvedBookingId)
        .single();

      if (bookingError || !booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      const { data: existingPayment } = await supabaseAdmin
        .from('payments')
        .select('id')
        .eq('transaction_id', order.orderId)
        .single();
      if (!existingPayment) {
        const { data: existingPayments } = await supabaseAdmin
          .from('payments')
          .select('amount')
          .eq('booking_id', resolvedBookingId);

        const previousTotal = existingPayments?.reduce((sum, p) => sum + Number(p.amount) / 100, 0) ?? 0;
        const payuAmountPln = Number(order.totalAmount) / 100;
        const newPaymentAmount = payuAmountPln;
        const newTotal = previousTotal + newPaymentAmount;
        const orderTotal = normalizeBookingTotal(Number(booking.total_price), payuAmountPln);
        const bookingStatus: 'paid' | 'deposit' = newTotal >= orderTotal ? 'paid' : 'deposit';
        const paymentStatus: 'paid' | 'deposit' = bookingStatus;

        await supabaseAdmin
          .from('bookings')
          .update({ status: bookingStatus })
          .eq('id', resolvedBookingId);

        await supabaseAdmin
          .from('payments')
          .insert([
            {
              booking_id: resolvedBookingId,
              status: paymentStatus,
              amount: order.totalAmount,
              transaction_id: order.orderId
            }
          ]);

        const baseUrl = getBaseUrl(req);
        const changeLink = `${baseUrl}/booking/change?token=${booking.change_token}`;
        const cancelLink = `${baseUrl}/booking/cancel?token=${booking.change_token}`;
        let packageName = '';
        if (booking.package_id) {
          const { data: pkg } = await supabaseAdmin
            .from('packages')
            .select('name')
            .eq('id', booking.package_id)
            .single()
            .returns<{ name: string }>();
          packageName = pkg?.name ?? '';
        }
        await fetch(baseUrl + '/api/sendBookingEmail', {
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
      }
    } else if (order.status === 'CANCELED' || order.status === 'REJECTED' || order.status === 'REFUNDED' || order.status === 'REFUND') {
      await supabaseAdmin
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', resolvedBookingId);
    }

    return NextResponse.json({ ok: true, status: order.status });
  } catch (err) {
    console.error('PayU sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
