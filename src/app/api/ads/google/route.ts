import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET || '';
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN || '';
const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/-/g, '');

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to get access token: ' + JSON.stringify(data));
  return data.access_token;
}

export async function GET(req: NextRequest) {
  // Check if API is configured
  if (!DEVELOPER_TOKEN || !REFRESH_TOKEN || !CLIENT_ID || !CLIENT_SECRET || !CUSTOMER_ID) {
    return NextResponse.json({
      configured: false,
      error: 'Google Ads API nie jest skonfigurowany. Dodaj zmienne środowiskowe: GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_CUSTOMER_ID',
    });
  }

  const { searchParams } = new URL(req.url);
  const dateFrom = searchParams.get('dateFrom') || getDefaultDateFrom();
  const dateTo = searchParams.get('dateTo') || getDefaultDateTo();

  try {
    const accessToken = await getAccessToken();

    // GAQL query for campaign metrics
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.cost_micros,
        metrics.clicks,
        metrics.impressions,
        metrics.conversions,
        metrics.ctr,
        metrics.average_cpc,
        metrics.average_cpm
      FROM campaign
      WHERE segments.date BETWEEN '${dateFrom}' AND '${dateTo}'
        AND campaign.status != 'REMOVED'
      ORDER BY metrics.cost_micros DESC
    `;

    const gaRes = await fetch(
      `https://googleads.googleapis.com/v18/customers/${CUSTOMER_ID}/googleAds:searchStream`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': DEVELOPER_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      }
    );

    if (!gaRes.ok) {
      const errText = await gaRes.text();
      return NextResponse.json({ configured: true, error: `Google Ads API error: ${gaRes.status} ${errText}` }, { status: 500 });
    }

    const gaData = await gaRes.json();

    // Parse response — searchStream returns array of result batches
    interface GaResult {
      campaign?: { id?: string; name?: string; status?: string };
      metrics?: {
        costMicros?: string;
        clicks?: string;
        impressions?: string;
        conversions?: number;
        ctr?: number;
        averageCpc?: string;
        averageCpm?: string;
      };
    }

    const campaigns: {
      id: string;
      name: string;
      status: string;
      cost: number;
      clicks: number;
      impressions: number;
      conversions: number;
      ctr: number;
      cpc: number;
      cpm: number;
    }[] = [];

    const batches = Array.isArray(gaData) ? gaData : [gaData];
    for (const batch of batches) {
      const results: GaResult[] = batch.results || [];
      for (const row of results) {
        const c = row.campaign || {};
        const m = row.metrics || {};
        campaigns.push({
          id: c.id || '',
          name: c.name || '',
          status: c.status || '',
          cost: Number(m.costMicros || 0) / 1_000_000,
          clicks: Number(m.clicks || 0),
          impressions: Number(m.impressions || 0),
          conversions: m.conversions || 0,
          ctr: m.ctr || 0,
          cpc: Number(m.averageCpc || 0) / 1_000_000,
          cpm: Number(m.averageCpm || 0) / 1_000_000,
        });
      }
    }

    return NextResponse.json({
      configured: true,
      campaigns,
      totalCost: campaigns.reduce((s, c) => s + c.cost, 0),
      totalClicks: campaigns.reduce((s, c) => s + c.clicks, 0),
      totalImpressions: campaigns.reduce((s, c) => s + c.impressions, 0),
      totalConversions: campaigns.reduce((s, c) => s + c.conversions, 0),
      dateFrom,
      dateTo,
    });
  } catch (err) {
    return NextResponse.json({ configured: true, error: String(err) }, { status: 500 });
  }
}

function getDefaultDateFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function getDefaultDateTo(): string {
  return new Date().toISOString().slice(0, 10);
}
