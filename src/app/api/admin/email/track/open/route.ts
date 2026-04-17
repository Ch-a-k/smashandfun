import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/emailCampaign';

export const runtime = 'nodejs';

const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(req: NextRequest) {
  const l = req.nextUrl.searchParams.get('l') || '';
  const t = req.nextUrl.searchParams.get('t') || '';
  if (!l || !verifyToken(['t', l], t)) {
    return new NextResponse(PIXEL, {
      status: 200,
      headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store' },
    });
  }
  const sb = getSupabaseAdmin();
  const { data: log } = await sb
    .from('email_logs')
    .select('id,campaign_id,opened_at,opens')
    .eq('id', l)
    .maybeSingle();
  if (log) {
    const row = log as { id: string; campaign_id: string; opened_at: string | null; opens: number };
    await sb
      .from('email_logs')
      .update({
        opened_at: row.opened_at || new Date().toISOString(),
        opens: (row.opens || 0) + 1,
      })
      .eq('id', row.id);
    await sb.from('email_events').insert({
      log_id: row.id,
      campaign_id: row.campaign_id,
      kind: 'open',
      user_agent: req.headers.get('user-agent') || null,
      ip: req.headers.get('x-forwarded-for') || null,
    });
    if (!row.opened_at) {
      await sb.rpc('increment', {}).then(() => {}, () => {});
      const { data: c } = await sb
        .from('email_campaigns')
        .select('opens_count')
        .eq('id', row.campaign_id)
        .maybeSingle();
      const current = (c as { opens_count?: number } | null)?.opens_count || 0;
      await sb
        .from('email_campaigns')
        .update({ opens_count: current + 1 })
        .eq('id', row.campaign_id);
    }
  }
  return new NextResponse(PIXEL, {
    status: 200,
    headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store' },
  });
}
