import crypto from 'crypto';
import { Resend } from 'resend';
import { getSupabaseAdmin } from './supabaseAdmin';
import { createEmailTransport, getEmailConfig } from './email';

export type SegmentFilters = {
  createdSince?: 'week' | 'month' | 'all';
  inactiveSince?: 'any' | '2weeks' | 'month' | '3months' | '6months';
  minOrderValue?: number;
  minGuests?: number;
  paymentStatus?: 'full' | 'partial' | 'unpaid' | 'any';
  mode?: 'all' | 'single' | 'test' | 'filtered';
  singleEmail?: string;
  testEmail?: string;
};

export type Contact = {
  email: string;
  name: string | null;
  phone: string | null;
  first_booking_at: string | null;
  last_booking_at: string | null;
  bookings_count: number;
  total_order_value: number;
  guests_count: number;
  has_paid: boolean;
  has_deposit: boolean;
  has_pending: boolean;
  last_order: number | null;
  last_booking_id: string | null;
};

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    'https://smashandfun.pl'
  ).replace(/\/$/, '');
}

export function headerLogoUrl(): string {
  return `${appBaseUrl()}/images/logo.png`;
}

function trackingSecret(): string {
  return (
    process.env.EMAIL_TRACKING_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'fallback-secret-change-me'
  );
}

export function signToken(parts: string[]): string {
  return crypto
    .createHmac('sha256', trackingSecret())
    .update(parts.join('|'))
    .digest('hex')
    .slice(0, 32);
}

export function verifyToken(parts: string[], token: string): boolean {
  const expected = signToken(parts);
  const a = Buffer.from(expected);
  const b = Buffer.from(token || '');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function b64url(s: string): string {
  return Buffer.from(s, 'utf8').toString('base64url');
}
export function fromB64url(s: string): string {
  return Buffer.from(s, 'base64url').toString('utf8');
}

export async function fetchContacts(filters: SegmentFilters): Promise<Contact[]> {
  const sb = getSupabaseAdmin();

  if (filters.mode === 'test') {
    const e = (filters.testEmail || '').trim().toLowerCase();
    if (!e) return [];
    return [syntheticContact(e)];
  }
  if (filters.mode === 'single') {
    const e = (filters.singleEmail || '').trim().toLowerCase();
    if (!e) return [];
    const { data } = await sb
      .from('email_contacts')
      .select('*')
      .eq('email', e)
      .maybeSingle();
    return data ? [data as unknown as Contact] : [syntheticContact(e)];
  }

  const inactiveDays: Record<NonNullable<SegmentFilters['inactiveSince']>, number> = {
    any: 0,
    '2weeks': 14,
    month: 30,
    '3months': 90,
    '6months': 180,
  };

  // Пагинация: Supabase PostgREST по умолчанию режет по 1000 строк
  const PAGE = 1000;
  const MAX_TOTAL = 50000;
  const all: Contact[] = [];
  for (let from = 0; from < MAX_TOTAL; from += PAGE) {
    let q = sb.from('email_contacts').select('*');

    if (filters.createdSince === 'week') {
      q = q.gte('first_booking_at', new Date(Date.now() - 7 * 864e5).toISOString());
    } else if (filters.createdSince === 'month') {
      q = q.gte('first_booking_at', new Date(Date.now() - 30 * 864e5).toISOString());
    }
    if (filters.inactiveSince && filters.inactiveSince !== 'any') {
      const days = inactiveDays[filters.inactiveSince];
      const cutoff = new Date(Date.now() - days * 864e5).toISOString();
      q = q.lt('last_booking_at', cutoff).not('last_booking_at', 'is', null);
    }
    if (typeof filters.minOrderValue === 'number' && filters.minOrderValue > 0) {
      q = q.gte('total_order_value', filters.minOrderValue);
    }
    if (typeof filters.minGuests === 'number' && filters.minGuests > 0) {
      q = q.gte('guests_count', filters.minGuests);
    }
    if (filters.paymentStatus === 'full') q = q.eq('has_paid', true);
    else if (filters.paymentStatus === 'partial') q = q.eq('has_deposit', true);
    else if (filters.paymentStatus === 'unpaid')
      q = q.eq('has_pending', true).eq('has_paid', false).eq('has_deposit', false);

    const { data, error } = await q
      .order('last_booking_at', { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    const rows = (data || []) as unknown as Contact[];
    all.push(...rows);
    if (rows.length < PAGE) break;
  }
  return all;
}

function syntheticContact(email: string): Contact {
  return {
    email,
    name: null,
    phone: null,
    first_booking_at: null,
    last_booking_at: null,
    bookings_count: 0,
    total_order_value: 0,
    guests_count: 0,
    has_paid: false,
    has_deposit: false,
    has_pending: false,
    last_order: null,
    last_booking_id: null,
  };
}

export async function excludeUnsubscribed(emails: string[]): Promise<Set<string>> {
  if (emails.length === 0) return new Set();
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from('email_unsubscribes')
    .select('email')
    .in('email', emails);
  return new Set(((data || []) as Array<{ email: string }>).map((r) => r.email));
}

// ---------- rendering ----------

function escapeHtml(v: unknown): string {
  return String(v ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function fmtPln(n: number | null | undefined): string {
  const v = typeof n === 'number' ? n : 0;
  return `${v.toLocaleString('pl-PL', { maximumFractionDigits: 2 })} zł`;
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pl-PL');
}

export function buildPersonalization(c: Contact) {
  const firstName = (c.name || '').split(' ')[0] || '';
  return {
    first_name: firstName,
    full_name: c.name || '',
    email: c.email,
    phone: c.phone || '',
    last_order: fmtPln(c.last_order),
    total_order_value: fmtPln(c.total_order_value),
    bookings_count: String(c.bookings_count),
    guests_count: String(c.guests_count),
    order_id: c.last_booking_id || '',
    first_booking_date: fmtDate(c.first_booking_at),
    last_booking_date: fmtDate(c.last_booking_at),
  };
}

export const PERSONALIZATION_FIELDS: { key: string; label: string }[] = [
  { key: 'first_name', label: 'Imię' },
  { key: 'full_name', label: 'Imię i nazwisko' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Telefon' },
  { key: 'last_order', label: 'Ostatnie zamówienie' },
  { key: 'total_order_value', label: 'Suma zamówień' },
  { key: 'bookings_count', label: 'Liczba rezerwacji' },
  { key: 'guests_count', label: 'Liczba gości' },
  { key: 'order_id', label: 'ID rezerwacji' },
  { key: 'first_booking_date', label: 'Data pierwszej rezerwacji' },
  { key: 'last_booking_date', label: 'Data ostatniej rezerwacji' },
];

export function renderVars(html: string, vars: Record<string, string>): string {
  return html.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, k) =>
    escapeHtml(vars[k as keyof typeof vars] ?? '')
  );
}

export function injectUtm(
  html: string,
  utm: { source?: string; medium?: string; campaign?: string }
): string {
  const params: string[] = [];
  if (utm.source) params.push(`utm_source=${encodeURIComponent(utm.source)}`);
  if (utm.medium) params.push(`utm_medium=${encodeURIComponent(utm.medium)}`);
  if (utm.campaign) params.push(`utm_campaign=${encodeURIComponent(utm.campaign)}`);
  if (params.length === 0) return html;
  const qs = params.join('&');
  return html.replace(/href=("|')(https?:\/\/[^"']+)\1/gi, (m, q, url) => {
    if (url.includes('/api/admin/email/track/')) return m;
    const sep = url.includes('?') ? '&' : '?';
    return `href=${q}${url}${sep}${qs}${q}`;
  });
}

export function injectOpenPixelOnly(html: string, logId: string): string {
  const base = appBaseUrl();
  const token = signToken(['t', logId]);
  const pixel = `<img src="${base}/api/admin/email/track/open?l=${logId}&t=${token}" width="1" height="1" style="display:block;width:1px;height:1px;opacity:0" alt="" />`;
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${pixel}</body>`);
  return html + pixel;
}

export function injectTracking(html: string, logId: string): string {
  const base = appBaseUrl();
  const token = signToken(['t', logId]);
  let out = html.replace(/href=("|')(https?:\/\/[^"']+)\1/gi, (_m, q, url) => {
    if (url.includes('/api/admin/email/track/')) return `href=${q}${url}${q}`;
    const wrapped = `${base}/api/admin/email/track/click?l=${logId}&t=${token}&u=${b64url(url)}`;
    return `href=${q}${wrapped}${q}`;
  });
  const pixel = `<img src="${base}/api/admin/email/track/open?l=${logId}&t=${token}" width="1" height="1" style="display:block;width:1px;height:1px;opacity:0" alt="" />`;
  if (/<\/body>/i.test(out)) out = out.replace(/<\/body>/i, `${pixel}</body>`);
  else out += pixel;
  return out;
}

export function unsubscribeUrl(email: string, campaignId: string): string {
  const base = appBaseUrl();
  const token = signToken(['u', email, campaignId]);
  return `${base}/api/admin/email/unsubscribe?e=${b64url(email)}&c=${campaignId}&t=${token}`;
}

export function injectUnsubscribe(html: string, email: string, campaignId: string): string {
  const url = unsubscribeUrl(email, campaignId);
  const footer = `<div style="font-family:Arial,sans-serif;font-size:12px;color:#888;text-align:center;padding:16px;border-top:1px solid #eee;margin-top:24px">
    Nie chcesz otrzymywać tych wiadomości? <a href="${url}" style="color:#888;text-decoration:underline">Wypisz się</a>.
  </div>`;
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${footer}</body>`);
  return html + footer;
}

export function htmlToPlain(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function resolveCampaignFrom(opts: { fromName?: string; fromEmail?: string }): string {
  const envFrom = process.env.EMAIL_FROM_CAMPAIGNS?.trim();
  if (opts.fromEmail) {
    return opts.fromName ? `${opts.fromName} <${opts.fromEmail}>` : opts.fromEmail;
  }
  if (envFrom) return envFrom;
  // Fallback на SMTP-конфиг (чтобы не падать в dev без RESEND)
  const cfg = getEmailConfig();
  return opts.fromName ? `${opts.fromName} <${cfg.from}>` : cfg.from;
}

export async function sendOne(opts: {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  unsubscribeUrl?: string;
}): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = resolveCampaignFrom(opts);
  const text = htmlToPlain(opts.html);
  const headers: Record<string, string> = {};
  if (opts.unsubscribeUrl) {
    const mailtoAddr = process.env.EMAIL_UNSUBSCRIBE_MAILTO || 'unsubscribe@smashandfun.pl';
    headers['List-Unsubscribe'] = `<${opts.unsubscribeUrl}>, <mailto:${mailtoAddr}?subject=unsubscribe>`;
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  }

  if (apiKey) {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      text,
      replyTo: opts.replyTo,
      headers,
    });
    if (error) {
      throw new Error(`Resend: ${error.message || JSON.stringify(error)}`);
    }
    return data?.id || '';
  }

  // Fallback: SMTP (для dev без RESEND_API_KEY)
  const transport = createEmailTransport();
  const info = await transport.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text,
    replyTo: opts.replyTo,
    headers,
  });
  return info.messageId || '';
}

// ---------- assertSuperadmin ----------

export async function assertSuperadmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from('admins')
    .select('role')
    .eq('email', email)
    .maybeSingle();
  return (data as { role?: string } | null)?.role === 'superadmin';
}
