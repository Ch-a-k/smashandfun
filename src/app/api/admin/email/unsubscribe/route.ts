import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { fromB64url, verifyToken } from '@/lib/emailCampaign';

export const runtime = 'nodejs';

function page(title: string, body: string) {
  return new NextResponse(
    `<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>${title}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:Arial,sans-serif;background:#18171c;color:#eee;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.card{background:#23222a;border:1px solid #333;border-radius:12px;padding:32px;max-width:420px;text-align:center}
h1{color:#f36e21;margin:0 0 12px 0}p{margin:0;line-height:1.5;color:#ccc}</style></head>
<body><div class="card"><h1>${title}</h1><p>${body}</p></div></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

export async function POST(req: NextRequest) {
  // RFC 8058 one-click unsubscribe
  const e = req.nextUrl.searchParams.get('e') || '';
  const c = req.nextUrl.searchParams.get('c') || '';
  const t = req.nextUrl.searchParams.get('t') || '';
  let email = '';
  try {
    email = fromB64url(e).toLowerCase();
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  if (!email || !verifyToken(['u', email, c], t)) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const sb = getSupabaseAdmin();
  await sb
    .from('email_unsubscribes')
    .upsert({ email, campaign_id: c || null }, { onConflict: 'email' });
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const e = req.nextUrl.searchParams.get('e') || '';
  const c = req.nextUrl.searchParams.get('c') || '';
  const t = req.nextUrl.searchParams.get('t') || '';
  let email = '';
  try {
    email = fromB64url(e).toLowerCase();
  } catch {
    return page('Błąd', 'Nieprawidłowy link.');
  }
  if (!email || !verifyToken(['u', email, c], t)) {
    return page('Błąd', 'Nieprawidłowy lub wygasły link.');
  }
  const sb = getSupabaseAdmin();
  await sb
    .from('email_unsubscribes')
    .upsert({ email, campaign_id: c || null }, { onConflict: 'email' });
  return page('Zostałeś wypisany', `Adres <b>${email}</b> został dodany do listy wypisanych.`);
}
