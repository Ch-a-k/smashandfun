import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import {
  headerLogoUrl,
  injectOpenPixelOnly,
  injectTracking,
  injectUnsubscribe,
  injectUtm,
  renderVars,
  sendOne,
  unsubscribeUrl,
} from '@/lib/emailCampaign';

export const runtime = 'nodejs';
export const maxDuration = 60;

const BATCH = 40;
const DAILY_LIMIT = Number(process.env.EMAIL_DAILY_LIMIT || '100');

// Начало текущих суток в UTC (Resend сбрасывает квоту в 00:00 UTC)
function startOfTodayUtcIso(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

async function getRemainingDailyQuota(
  sb: ReturnType<typeof getSupabaseAdmin>
): Promise<number> {
  const since = startOfTodayUtcIso();
  const { count } = await sb
    .from('email_logs')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'sent')
    .gte('sent_at', since);
  const sentToday = count || 0;
  return Math.max(0, DAILY_LIMIT - sentToday);
}

type Campaign = {
  id: string;
  subject: string;
  html: string;
  from_name: string | null;
  from_email: string | null;
  reply_to: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  primary_color: string | null;
  cta_url: string | null;
  track_clicks: boolean | null;
  scheduled_at: string | null;
  status: string;
  sent_count: number;
  recipients_count: number;
};

type Brand = { logo_url: string | null; primary_color: string | null };

type LogRow = {
  id: string;
  to_email: string;
  subject: string;
  personalization: Record<string, string>;
};

async function isAuthorized(req: NextRequest) {
  const secret = process.env.EMAIL_CRON_SECRET || process.env.CRON_SECRET;
  if (!secret) return true; // dev mode
  const q = req.nextUrl.searchParams.get('secret');
  const h = req.headers.get('x-cron-secret') || req.headers.get('authorization') || '';
  return q === secret || h === secret || h === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const sb = getSupabaseAdmin();
  const only = req.nextUrl.searchParams.get('campaignId');

  const { data: brand } = await sb.from('email_brand').select('*').eq('id', 1).maybeSingle();
  const brandRow: Brand = (brand as Brand | null) || { logo_url: '', primary_color: '#f36e21' };

  let q = sb
    .from('email_campaigns')
    .select('*')
    .in('status', ['queued', 'sending'])
    .order('created_at', { ascending: true })
    .limit(5);
  if (only) q = q.eq('id', only).limit(1);
  const { data: campaigns } = await q;

  const now = new Date();
  const results: Array<{
    id: string;
    sent: number;
    failed: number;
    done: boolean;
    quotaExhausted?: boolean;
  }> = [];

  let remainingQuota = await getRemainingDailyQuota(sb);

  for (const raw of (campaigns || []) as unknown as Campaign[]) {
    if (raw.scheduled_at && new Date(raw.scheduled_at) > now) continue;
    if (remainingQuota <= 0) {
      // Дневной лимит исчерпан — оставляем кампанию 'sending', докатим завтра
      results.push({ id: raw.id, sent: 0, failed: 0, done: false, quotaExhausted: true });
      continue;
    }
    if (raw.status === 'queued') {
      await sb
        .from('email_campaigns')
        .update({ status: 'sending', started_at: now.toISOString() })
        .eq('id', raw.id);
    }

    const takeLimit = Math.min(BATCH, remainingQuota);
    const { data: pending } = await sb
      .from('email_logs')
      .select('id,to_email,subject,personalization')
      .eq('campaign_id', raw.id)
      .eq('status', 'pending')
      .limit(takeLimit);

    let sent = 0;
    let failed = 0;
    for (const log of ((pending || []) as unknown as LogRow[])) {
      try {
        let html = raw.html;
        html = renderVars(html, {
          ...log.personalization,
          subject: log.subject,
          logo_url: headerLogoUrl(),
          primary_color: raw.primary_color || brandRow.primary_color || '#f36e21',
          cta_url: raw.cta_url || 'https://smashandfun.pl',
        });
        html = injectUtm(html, {
          source: raw.utm_source || undefined,
          medium: raw.utm_medium || undefined,
          campaign: raw.utm_campaign || undefined,
        });
        html = injectUnsubscribe(html, log.to_email, raw.id);
        if (raw.track_clicks !== false) {
          html = injectTracking(html, log.id);
        } else {
          html = injectOpenPixelOnly(html, log.id);
        }

        const subject = renderVars(log.subject, log.personalization);

        const messageId = await sendOne({
          to: log.to_email,
          subject,
          html,
          fromName: raw.from_name || undefined,
          fromEmail: raw.from_email || undefined,
          replyTo: raw.reply_to || undefined,
          unsubscribeUrl: unsubscribeUrl(log.to_email, raw.id),
        });
        await sb
          .from('email_logs')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            message_id: messageId,
          })
          .eq('id', log.id);
        sent++;
        remainingQuota--;
        if (remainingQuota <= 0) break;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'send error';
        await sb
          .from('email_logs')
          .update({ status: 'failed', error: msg.slice(0, 500) })
          .eq('id', log.id);
        failed++;
      }
    }

    const { count: remaining } = await sb
      .from('email_logs')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', raw.id)
      .eq('status', 'pending');

    const { data: totals } = await sb
      .from('email_logs')
      .select('status', { count: 'exact' })
      .eq('campaign_id', raw.id)
      .eq('status', 'sent');
    const totalSent = totals?.length ?? raw.sent_count + sent;

    const done = !remaining || remaining === 0;
    await sb
      .from('email_campaigns')
      .update({
        sent_count: totalSent,
        status: done ? 'sent' : 'sending',
        finished_at: done ? new Date().toISOString() : null,
      })
      .eq('id', raw.id);

    results.push({ id: raw.id, sent, failed, done });
  }

  return NextResponse.json({ ok: true, results });
}
