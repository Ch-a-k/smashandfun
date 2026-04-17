import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { assertSuperadmin } from '@/lib/emailCampaign';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const adminEmail = req.nextUrl.searchParams.get('adminEmail');
  if (!(await assertSuperadmin(adminEmail))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await ctx.params;
  const sb = getSupabaseAdmin();
  const [{ data: campaign }, { data: logs }] = await Promise.all([
    sb.from('email_campaigns').select('*').eq('id', id).maybeSingle(),
    sb
      .from('email_logs')
      .select('id,to_email,variant,subject,status,error,sent_at,opened_at,first_click_at,opens,clicks')
      .eq('campaign_id', id)
      .order('created_at', { ascending: false })
      .limit(500),
  ]);
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ campaign, logs: logs || [] });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const adminEmail = req.nextUrl.searchParams.get('adminEmail');
  if (!(await assertSuperadmin(adminEmail))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await ctx.params;
  const sb = getSupabaseAdmin();
  const { data: camp } = await sb
    .from('email_campaigns')
    .select('status')
    .eq('id', id)
    .maybeSingle();
  const status = (camp as { status?: string } | null)?.status;
  if (status === 'sending') {
    return NextResponse.json({ error: 'Kampania w trakcie wysyłki.' }, { status: 400 });
  }
  const { error } = await sb.from('email_campaigns').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
