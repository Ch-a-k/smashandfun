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
        segments.date,
        metrics.cost_micros,
        metrics.clicks,
        metrics.impressions
      FROM campaign
      WHERE segments.date BETWEEN '${dateFrom}' AND '${dateTo}'
        AND campaign.status != 'REMOVED'
      ORDER BY segments.date ASC
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
      segments?: { date?: string };
      metrics?: { costMicros?: string; clicks?: string; impressions?: string };
    }

    // Aggregate per date (multiple campaigns per day → sum)
    const dateMap = new Map<string, { cost: number; clicks: number; impressions: number }>();

    const batches = Array.isArray(gaData) ? gaData : [gaData];
    for (const batch of batches) {
      const results: GaResult[] = batch.results || [];
      for (const row of results) {
        const date = row.segments?.date || '';
        if (!date) continue;
        const existing = dateMap.get(date) || { cost: 0, clicks: 0, impressions: 0 };
        existing.cost += Number(row.metrics?.costMicros || 0) / 1_000_000;
        existing.clicks += Number(row.metrics?.clicks || 0);
        existing.impressions += Number(row.metrics?.impressions || 0);
        dateMap.set(date, existing);
      }
    }

    const daily = Array.from(dateMap.entries())
      .map(([date, d]) => ({ date, cost: d.cost, clicks: d.clicks, impressions: d.impressions }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ configured: true, daily });
  } catch (err) {
    return NextResponse.json({ configured: true, error: String(err) }, { status: 500 });
  }
}
