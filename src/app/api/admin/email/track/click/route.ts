import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { fromB64url, verifyToken } from '@/lib/emailCampaign';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const l = req.nextUrl.searchParams.get('l') || '';
  const t = req.nextUrl.searchParams.get('t') || '';
  const u = req.nextUrl.searchParams.get('u') || '';
  let target = 'https://smashandfun.pl';
  try {
    if (u) target = fromB64url(u);
  } catch {}

  if (!l || !verifyToken(['t', l], t)) {
    return NextResponse.redirect(target);
  }
  const sb = getSupabaseAdmin();
  const { data: log } = await sb
    .from('email_logs')
    .select('id,campaign_id,first_click_at,clicks')
    .eq('id', l)
    .maybeSingle();
  if (log) {
    const row = log as {
      id: string;
      campaign_id: string;
      first_click_at: string | null;
      clicks: number;
    };
    await sb
      .from('email_logs')
      .update({
        first_click_at: row.first_click_at || new Date().toISOString(),
        clicks: (row.clicks || 0) + 1,
      })
      .eq('id', row.id);
    await sb.from('email_events').insert({
      log_id: row.id,
      campaign_id: row.campaign_id,
      kind: 'click',
      url: target,
      user_agent: req.headers.get('user-agent') || null,
      ip: req.headers.get('x-forwarded-for') || null,
    });
    if (!row.first_click_at) {
      const { data: c } = await sb
        .from('email_campaigns')
        .select('clicks_count')
        .eq('id', row.campaign_id)
        .maybeSingle();
      const current = (c as { clicks_count?: number } | null)?.clicks_count || 0;
      await sb
        .from('email_campaigns')
        .update({ clicks_count: current + 1 })
        .eq('id', row.campaign_id);
    }
  }
  return NextResponse.redirect(target);
}
