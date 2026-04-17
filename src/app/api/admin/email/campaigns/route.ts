import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import {
  assertSuperadmin,
  buildPersonalization,
  excludeUnsubscribed,
  fetchContacts,
  type SegmentFilters,
} from '@/lib/emailCampaign';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const adminEmail = req.nextUrl.searchParams.get('adminEmail');
  if (!(await assertSuperadmin(adminEmail))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from('email_campaigns')
    .select(
      'id,name,subject,status,scheduled_at,recipients_count,sent_count,opens_count,clicks_count,created_at,started_at,finished_at'
    )
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ campaigns: data });
}

type CreatePayload = {
  adminEmail: string;
  name: string;
  subject: string;
  subject_b?: string;
  ab_split_b_pct?: number;
  html: string;
  template_key?: string;
  from_name?: string;
  from_email?: string;
  reply_to?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  primary_color?: string;
  cta_url?: string;
  track_clicks?: boolean;
  scheduled_at?: string | null;
  filters: SegmentFilters;
  dispatchNow?: boolean;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CreatePayload;
  if (!(await assertSuperadmin(body.adminEmail))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!body.name || !body.subject || !body.html) {
    return NextResponse.json({ error: 'Brakuje pól: nazwa, temat lub treść.' }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const isTest = body.filters?.mode === 'test';
  const contacts = await fetchContacts(body.filters);
  const unsubs = isTest ? new Set<string>() : await excludeUnsubscribed(contacts.map((c) => c.email));
  const eligible = contacts.filter((c) => !unsubs.has(c.email));

  if (eligible.length === 0) {
    return NextResponse.json({ error: 'Brak odbiorców.' }, { status: 400 });
  }

  const scheduledAt = body.scheduled_at ? new Date(body.scheduled_at).toISOString() : null;
  const status = scheduledAt && new Date(scheduledAt) > new Date() ? 'queued' : 'queued';

  const { data: campaign, error: cErr } = await sb
    .from('email_campaigns')
    .insert({
      name: body.name,
      subject: body.subject,
      subject_b: body.subject_b || null,
      ab_split_b_pct: Math.max(0, Math.min(100, Number(body.ab_split_b_pct || 0))),
      html: body.html,
      template_key: body.template_key || null,
      from_name: body.from_name || null,
      from_email: body.from_email || null,
      reply_to: body.reply_to || null,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || 'email',
      utm_campaign: body.utm_campaign || null,
      primary_color: body.primary_color || null,
      cta_url: body.cta_url || null,
      track_clicks: body.track_clicks !== false,
      scheduled_at: scheduledAt,
      status,
      segment: body.filters || {},
      recipients_count: eligible.length,
      created_by: body.adminEmail,
    })
    .select()
    .single();
  if (cErr || !campaign) {
    return NextResponse.json({ error: cErr?.message || 'Insert failed' }, { status: 400 });
  }

  const campaignId = (campaign as { id: string }).id;
  const splitB = Math.max(0, Math.min(100, Number(body.ab_split_b_pct || 0)));
  const hasAB = Boolean(body.subject_b) && splitB > 0;

  const logs = eligible.map((c) => {
    const variant: 'A' | 'B' = hasAB && Math.random() * 100 < splitB ? 'B' : 'A';
    const subject =
      variant === 'B' && body.subject_b ? body.subject_b : body.subject;
    return {
      campaign_id: campaignId,
      to_email: c.email,
      variant,
      subject,
      personalization: buildPersonalization(c),
    };
  });

  // insert w kawałkach po 500
  for (let i = 0; i < logs.length; i += 500) {
    const chunk = logs.slice(i, i + 500);
    const { error: lErr } = await sb.from('email_logs').insert(chunk);
    if (lErr) {
      return NextResponse.json({ error: lErr.message }, { status: 400 });
    }
  }

  // Если dispatchNow и расписания нет — запускаем внутренний диспатчер (одним «тиком»)
  if (body.dispatchNow && !scheduledAt) {
    const url = new URL('/api/admin/email/cron/dispatch', req.url);
    url.searchParams.set('campaignId', campaignId);
    url.searchParams.set('secret', process.env.EMAIL_CRON_SECRET || '');
    // Fire-and-forget — otrzymamy status w UI przez polling
    fetch(url.toString(), { method: 'GET' }).catch(() => {});
  }

  return NextResponse.json({ campaign });
}
