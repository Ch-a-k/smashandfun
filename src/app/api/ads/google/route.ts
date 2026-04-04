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
    // Query GA4 for Google Ads campaign data
    // advertiserAdCost, advertiserAdClicks, advertiserAdImpressions come from linked Google Ads
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
      orderBys: [{ metric: { metricName: 'advertiserAdCost' }, desc: true }],
      limit: 500,
    });

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

    if (data.rows) {
      for (const row of data.rows) {
        const campaignName = row.dimensionValues[0]?.value || '(not set)';
        const medium = row.dimensionValues[2]?.value || '';

        // Skip organic/non-ad traffic
        if (medium !== 'cpc' && medium !== 'pmax' && medium !== 'cpv' && medium !== 'cpm') continue;
        // Skip (not set) campaigns
        if (campaignName === '(not set)' || campaignName === '(direct)') continue;

        const cost = Number(row.metricValues[1]?.value || 0);
        const clicks = Number(row.metricValues[2]?.value || 0);
        const impressions = Number(row.metricValues[3]?.value || 0);
        const conversions = Number(row.metricValues[4]?.value || 0);

        campaigns.push({
          id: campaignName.toLowerCase().replace(/\s+/g, '_'),
          name: campaignName,
          status: 'ENABLED',
          cost,
          clicks,
          impressions,
          conversions,
          ctr: impressions > 0 ? clicks / impressions : 0,
          cpc: clicks > 0 ? cost / clicks : 0,
          cpm: impressions > 0 ? (cost / impressions) * 1000 : 0,
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
