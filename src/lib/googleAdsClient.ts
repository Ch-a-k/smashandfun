import { NextResponse } from 'next/server';
import * as crypto from 'crypto';

// ─── GA4 Config ──────────────────────────────────────────────
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '';
const GA4_CLIENT_EMAIL = process.env.GA4_CLIENT_EMAIL || '';
const GA4_PRIVATE_KEY = (process.env.GA4_PRIVATE_KEY || '').replace(/\\n/g, '\n');

export function isConfigured(): boolean {
  return !!(GA4_PROPERTY_ID && GA4_CLIENT_EMAIL && GA4_PRIVATE_KEY);
}

// ─── JWT Auth for Service Account ────────────────────────────
function base64url(data: Buffer | string): string {
  const buf = typeof data === 'string' ? Buffer.from(data) : data;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(JSON.stringify({
    iss: GA4_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }));

  const signInput = `${header}.${claim}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signInput);
  const signature = base64url(sign.sign(GA4_PRIVATE_KEY));

  const jwt = `${signInput}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error('GA4 auth failed: ' + JSON.stringify(data));
  return data.access_token;
}

// ─── GA4 Data API ────────────────────────────────────────────
const GA4_API_BASE = 'https://analyticsdata.googleapis.com/v1beta';

export interface GA4ReportRequest {
  dateRanges: { startDate: string; endDate: string }[];
  dimensions: { name: string }[];
  metrics: { name: string }[];
  dimensionFilter?: unknown;
  limit?: number;
  orderBys?: unknown[];
}

export async function runReport(request: GA4ReportRequest): Promise<GA4ReportResponse> {
  const accessToken = await getAccessToken();

  const res = await fetch(`${GA4_API_BASE}/properties/${GA4_PROPERTY_ID}:runReport`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GA4 API error ${res.status}: ${errText}`);
  }

  return res.json();
}

export interface GA4ReportResponse {
  rows?: {
    dimensionValues: { value: string }[];
    metricValues: { value: string }[];
  }[];
  rowCount?: number;
}

// ─── Helpers ─────────────────────────────────────────────────
export function notConfiguredResponse(): NextResponse {
  return NextResponse.json({
    configured: false,
    error: 'GA4 API nie jest skonfigurowany. Dodaj zmienne środowiskowe: GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY',
  });
}

export function getDefaultDateFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

export function getDefaultDateTo(): string {
  return new Date().toISOString().slice(0, 10);
}
