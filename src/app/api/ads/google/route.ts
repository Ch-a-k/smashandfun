import { NextRequest, NextResponse } from 'next/server';
import {
  isConfigured, getAccessToken, buildHeaders,
  getSearchStreamUrl, notConfiguredResponse,
  getDefaultDateFrom, getDefaultDateTo,
} from '@/lib/googleAdsClient';

export async function GET(req: NextRequest) {
  if (!isConfigured()) {
    return notConfiguredResponse();
  }

  const { searchParams } = new URL(req.url);
  const dateFrom = searchParams.get('dateFrom') || getDefaultDateFrom();
  const dateTo = searchParams.get('dateTo') || getDefaultDateTo();

  try {
    const accessToken = await getAccessToken();

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

    const gaRes = await fetch(getSearchStreamUrl(), {
      method: 'POST',
      headers: buildHeaders(accessToken),
      body: JSON.stringify({ query }),
    });

    if (!gaRes.ok) {
      const errText = await gaRes.text();
      return NextResponse.json({ configured: true, error: `Google Ads API error: ${gaRes.status} ${errText}` }, { status: 500 });
    }

    const gaData = await gaRes.json();

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
