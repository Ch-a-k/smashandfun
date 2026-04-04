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
    // Query GA4 — sessions from google source, grouped by campaign
    // advertiserAd* metrics appear after GA4↔Google Ads link propagates (24-48h)
    const data = await runReport({
      dateRanges: [{ startDate: dateFrom, endDate: dateTo }],
      dimensions: [
        { name: 'sessionCampaignName' },
        { name: 'sessionSource' },
        { name: 'sessionMedium' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'advertiserAdCost' },
        { name: 'advertiserAdClicks' },
        { name: 'advertiserAdImpressions' },
        { name: 'conversions' },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'sessionSource',
          stringFilter: { value: 'google', matchType: 'EXACT' },
        },
      },
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 500,
    });

    // Aggregate by campaign name (multiple mediums may exist for same campaign)
    const campaignMap = new Map<string, {
      name: string; cost: number; clicks: number; impressions: number;
      sessions: number; conversions: number; isPaid: boolean;
    }>();

    if (data.rows) {
      for (const row of data.rows) {
        const campaignName = row.dimensionValues[0]?.value || '(not set)';
        const medium = row.dimensionValues[2]?.value || '';

        // Skip unnamed campaigns
        if (campaignName === '(not set)' || campaignName === '(direct)' || campaignName === '(organic)') continue;

        const sessions = Number(row.metricValues[0]?.value || 0);
        const cost = Number(row.metricValues[1]?.value || 0);
        const adClicks = Number(row.metricValues[2]?.value || 0);
        const adImpressions = Number(row.metricValues[3]?.value || 0);
        const conversions = Number(row.metricValues[4]?.value || 0);

        const isPaid = medium === 'cpc' || medium === 'pmax' || medium === 'cpv' || medium === 'cpm';

        const key = campaignName.toLowerCase();
        const existing = campaignMap.get(key);
        if (existing) {
          existing.cost += cost;
          existing.clicks += adClicks > 0 ? adClicks : (isPaid ? sessions : 0);
          existing.impressions += adImpressions;
          existing.sessions += sessions;
          existing.conversions += conversions;
          if (isPaid) existing.isPaid = true;
        } else {
          campaignMap.set(key, {
            name: campaignName,
            cost,
            clicks: adClicks > 0 ? adClicks : (isPaid ? sessions : 0),
            impressions: adImpressions,
            sessions,
            conversions,
            isPaid,
          });
        }
      }
    }

    const campaigns = Array.from(campaignMap.values())
      .filter(c => c.isPaid || c.cost > 0)
      .map(c => ({
        id: c.name.toLowerCase().replace(/\s+/g, '_'),
        name: c.name,
        status: 'ENABLED',
        cost: c.cost,
        clicks: c.clicks,
        impressions: c.impressions,
        conversions: c.conversions,
        ctr: c.impressions > 0 ? c.clicks / c.impressions : 0,
        cpc: c.clicks > 0 ? c.cost / c.clicks : 0,
        cpm: c.impressions > 0 ? (c.cost / c.impressions) * 1000 : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks || b.cost - a.cost);

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
