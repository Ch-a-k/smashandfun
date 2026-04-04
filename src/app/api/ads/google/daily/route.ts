import { NextRequest, NextResponse } from 'next/server';
import {
  isConfigured, runReport, notConfiguredResponse,
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
    const data = await runReport({
      dateRanges: [{ startDate: dateFrom, endDate: dateTo }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'advertiserAdCost' },
        { name: 'advertiserAdClicks' },
        { name: 'advertiserAdImpressions' },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'sessionSource',
          stringFilter: { value: 'google', matchType: 'EXACT' },
        },
      },
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
      limit: 500,
    });

    const daily: { date: string; cost: number; clicks: number; impressions: number }[] = [];

    if (data.rows) {
      for (const row of data.rows) {
        const rawDate = row.dimensionValues[0]?.value || '';
        // GA4 returns date as YYYYMMDD, convert to YYYY-MM-DD
        const date = rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : rawDate;

        daily.push({
          date,
          cost: Number(row.metricValues[0]?.value || 0),
          clicks: Number(row.metricValues[1]?.value || 0),
          impressions: Number(row.metricValues[2]?.value || 0),
        });
      }
    }

    return NextResponse.json({ configured: true, daily });
  } catch (err) {
    return NextResponse.json({ configured: true, error: String(err) }, { status: 500 });
  }
}
