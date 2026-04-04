"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { withAdminAuth } from "../components/withAdminAuth";
import { FaGoogle, FaFacebook, FaTiktok } from "react-icons/fa";
import {
  BookingFull, PackageInfo, GoogleAdsResponse, CampaignData,
  Platform, ViewTab, formatMoney, formatPercent, isGoogleSource,
  inputStyle, cardStyle,
} from "./types";

import SummaryCards from "./components/SummaryCards";
import BestWorstCampaigns from "./components/BestWorstCampaigns";
import CampaignCharts from "./components/CampaignCharts";
import CampaignTable from "./components/CampaignTable";
import SetupGuide from "./components/SetupGuide";
import ViewTabs from "./components/ViewTabs";
import PeriodComparisonBar from "./components/PeriodComparisonBar";
import FunnelMetrics from "./components/FunnelMetrics";
import TimeSeriesChart from "./components/TimeSeriesChart";
import ClientsTab from "./components/ClientsTab";
import PackageAttributionTab from "./components/PackageAttributionTab";

const PLATFORM_TABS: { key: Platform; label: string; icon: React.ReactElement; color: string }[] = [
  { key: "google", label: "Google Ads", icon: <FaGoogle />, color: "#4285f4" },
  { key: "facebook", label: "Facebook Ads", icon: <FaFacebook />, color: "#1877f2" },
  { key: "tiktok", label: "TikTok Ads", icon: <FaTiktok />, color: "#ee1d52" },
];

function AdsPage() {
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>("google");
  const [activeTab, setActiveTab] = useState<ViewTab>("overview");
  const [comparisonEnabled, setComparisonEnabled] = useState(false);

  // Date range — default last 30 days
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));

  // Data
  const [bookings, setBookings] = useState<BookingFull[]>([]);
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [googleData, setGoogleData] = useState<GoogleAdsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Period comparison
  const [prevBookings, setPrevBookings] = useState<BookingFull[]>([]);
  const [prevLoading, setPrevLoading] = useState(false);

  // Superadmin check
  useEffect(() => {
    const email = typeof window !== "undefined" ? localStorage.getItem("admin_email") : null;
    if (!email) return;
    supabase.from("admins").select("role").eq("email", email).single()
      .then(({ data }) => {
        const role = (data as { role?: string } | null)?.role ?? null;
        setCurrentRole(role);
        if (role && role !== "superadmin") router.replace("/admin/bookings");
      });
  }, [router]);

  // Fetch packages once
  useEffect(() => {
    supabase.from("packages").select("id, name, price").then(({ data }) => {
      setPackages((data as PackageInfo[]) || []);
    });
  }, []);

  // Fetch bookings from Supabase
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("id, name, phone, user_email, total_price, status, utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer, landing_page, package_id, date")
      .gte("date", dateFrom)
      .lte("date", dateTo);
    setBookings((data as BookingFull[]) || []);
    setLoading(false);
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // Fetch Google Ads data
  const fetchGoogleAds = useCallback(async () => {
    setGoogleLoading(true);
    try {
      const res = await fetch(`/api/ads/google?dateFrom=${dateFrom}&dateTo=${dateTo}`);
      const data: GoogleAdsResponse = await res.json();
      setGoogleData(data);
    } catch {
      setGoogleData({ configured: false, error: "Nie udało się pobrać danych" });
    }
    setGoogleLoading(false);
  }, [dateFrom, dateTo]);

  useEffect(() => {
    if (platform === "google") fetchGoogleAds();
  }, [platform, fetchGoogleAds]);

  // Fetch previous period bookings for comparison
  useEffect(() => {
    if (!comparisonEnabled) return;
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    const prevTo = new Date(from);
    prevTo.setDate(prevTo.getDate() - 1);
    const prevFrom = new Date(prevTo);
    prevFrom.setDate(prevFrom.getDate() - days);

    setPrevLoading(true);
    supabase
      .from("bookings")
      .select("id, total_price, status, utm_source, date")
      .gte("date", prevFrom.toISOString().slice(0, 10))
      .lte("date", prevTo.toISOString().slice(0, 10))
      .then(({ data }) => {
        setPrevBookings((data as BookingFull[]) || []);
        setPrevLoading(false);
      });
  }, [comparisonEnabled, dateFrom, dateTo]);

  // ─── Computed data ─────────────────────────────────────────
  const platformBookings = useMemo(() =>
    bookings.filter(b => {
      const s = (b.utm_source || "").toLowerCase();
      if (platform === "google") return isGoogleSource(b.utm_source);
      if (platform === "facebook") return s === "facebook" || s === "instagram" || s.includes("fbclid") || s === "fb" || s === "ig";
      if (platform === "tiktok") return s === "tiktok" || s.includes("ttclid");
      return false;
    }),
  [bookings, platform]);

  const paidBookings = useMemo(() =>
    platformBookings.filter(b => b.status === "paid" || b.status === "deposit"),
  [platformBookings]);

  const totalRevenue = useMemo(() =>
    paidBookings.reduce((s, b) => s + Number(b.total_price || 0), 0),
  [paidBookings]);

  const totalSpend = googleData?.configured ? (googleData.totalCost || 0) : 0;
  const totalClicks = googleData?.configured ? (googleData.totalClicks || 0) : 0;
  const totalImpressions = googleData?.configured ? (googleData.totalImpressions || 0) : 0;
  const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) : 0;
  const roas = totalSpend > 0 ? (totalRevenue / totalSpend) : 0;
  const cpa = paidBookings.length > 0 && totalSpend > 0 ? (totalSpend / paidBookings.length) : 0;
  const conversionRate = totalClicks > 0 ? (paidBookings.length / totalClicks) : 0;

  // Previous period metrics
  const prevPlatformBookings = useMemo(() =>
    prevBookings.filter(b => isGoogleSource(b.utm_source)),
  [prevBookings]);
  const prevPaid = useMemo(() =>
    prevPlatformBookings.filter(b => b.status === "paid" || b.status === "deposit"),
  [prevPlatformBookings]);
  const prevRevenue = useMemo(() =>
    prevPaid.reduce((s, b) => s + Number(b.total_price || 0), 0),
  [prevPaid]);

  // Campaign breakdown
  const campaignData = useMemo(() => {
    const map = new Map<string, CampaignData>();
    if (googleData?.campaigns) {
      for (const c of googleData.campaigns) {
        map.set(c.name.toLowerCase(), {
          name: c.name, cost: c.cost, clicks: c.clicks,
          impressions: c.impressions, bookings: 0, revenue: 0,
          ctr: c.ctr, cpc: c.cpc,
        });
      }
    }
    for (const b of paidBookings) {
      const cName = (b.utm_campaign || "").toLowerCase();
      if (!cName) continue;
      const existing = map.get(cName);
      if (existing) {
        existing.bookings += 1;
        existing.revenue += Number(b.total_price || 0);
      } else {
        map.set(cName, {
          name: b.utm_campaign || cName, cost: 0, clicks: 0,
          impressions: 0, bookings: 1, revenue: Number(b.total_price || 0),
          ctr: 0, cpc: 0,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.cost - a.cost || b.revenue - a.revenue);
  }, [googleData, paidBookings]);

  // Best/worst campaigns
  const bestCampaign = useMemo(() => {
    const withROI = campaignData.filter(c => c.cost > 0 && c.revenue > 0);
    if (withROI.length === 0) return null;
    return withROI.reduce((best, c) => {
      const cROI = (c.revenue - c.cost) / c.cost;
      const bROI = (best.revenue - best.cost) / best.cost;
      return cROI > bROI ? c : best;
    });
  }, [campaignData]);

  const worstCampaign = useMemo(() => {
    const withSpend = campaignData.filter(c => c.cost > 0);
    if (withSpend.length < 2) return null;
    return withSpend.reduce((worst, c) => {
      const cROI = c.revenue > 0 ? (c.revenue - c.cost) / c.cost : -1;
      const wROI = worst.revenue > 0 ? (worst.revenue - worst.cost) / worst.cost : -1;
      return cROI < wROI ? c : worst;
    });
  }, [campaignData]);

  // Chart data
  const barChartData = useMemo(() =>
    campaignData.slice(0, 10).map(c => ({
      name: c.name.length > 20 ? c.name.slice(0, 20) + "…" : c.name,
      Wydatki: Number(c.cost.toFixed(2)),
      Przychod: Number(c.revenue.toFixed(2)),
    })),
  [campaignData]);

  const pieChartData = useMemo(() =>
    campaignData.filter(c => c.cost > 0).slice(0, 8).map(c => ({
      name: c.name.length > 18 ? c.name.slice(0, 18) + "…" : c.name,
      value: Number(c.cost.toFixed(2)),
    })),
  [campaignData]);

  // All bookings that are NOT from Google (for package attribution comparison)
  const nonAdBookings = useMemo(() =>
    bookings.filter(b => !isGoogleSource(b.utm_source) && (b.status === "paid" || b.status === "deposit")),
  [bookings]);

  // ─── Render ────────────────────────────────────────────────
  if (currentRole !== "superadmin") {
    return <div style={{ color: "#fff", marginTop: 80, textAlign: "center" }}>Ładowanie...</div>;
  }

  const isConfigured = platform === "google" ? googleData?.configured : false;
  const apiError = platform === "google" ? googleData?.error : null;

  return (
    <div style={{ color: "#fff", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 100, color: "#f36e21", marginBottom: 4 }}>IF. ADS</h1>
          <p style={{ fontSize: 14, color: "#888" }}>Analityka reklam i ROI kampanii</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ fontSize: 12, color: "#aaa" }}>Od:</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...inputStyle, width: 140 }} />
          <label style={{ fontSize: 12, color: "#aaa" }}>Do:</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...inputStyle, width: 140 }} />
          <button
            onClick={() => setComparisonEnabled(!comparisonEnabled)}
            style={{
              background: comparisonEnabled ? "#f36e21" : "#333",
              color: "#fff", border: "none", borderRadius: 8,
              padding: "6px 14px", fontSize: 12, fontWeight: 600,
              cursor: "pointer", marginLeft: 4,
            }}
          >
            {comparisonEnabled ? "Porównanie ✓" : "Porównaj okresy"}
          </button>
        </div>
      </div>

      {/* Platform tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "#23222a", borderRadius: 12, padding: 4, width: "fit-content" }}>
        {PLATFORM_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setPlatform(tab.key)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 8, border: "none",
              background: platform === tab.key ? tab.color : "transparent",
              color: platform === tab.key ? "#fff" : "#888",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab.icon} {tab.label}
            {tab.key !== "google" && <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 2 }}>wkrótce</span>}
          </button>
        ))}
      </div>

      {/* Not configured warning / setup guide */}
      {platform === "google" && !isConfigured && !googleLoading && (
        <SetupGuide error={apiError && isConfigured ? apiError : undefined} />
      )}
      {apiError && isConfigured && (
        <div style={{ background: "#2a1515", border: "1px solid #ff4d4f", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#ff4d4f" }}>
          {apiError}
        </div>
      )}

      {platform !== "google" && (
        <div style={{ background: "#23222a", borderRadius: 14, padding: 40, textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>
            {platform === "facebook" ? <FaFacebook /> : <FaTiktok />}
          </div>
          <h3 style={{ color: "#888", fontSize: 18, fontWeight: 600 }}>
            {platform === "facebook" ? "Facebook Ads" : "TikTok Ads"} — wkrótce
          </h3>
          <p style={{ color: "#555", fontSize: 14, marginTop: 8 }}>
            Aby podłączyć, skontaktuj się z deweloperem.
          </p>
        </div>
      )}

      {platform === "google" && (
        <>
          {/* Inner view tabs */}
          <ViewTabs activeTab={activeTab} onChange={setActiveTab} />

          {/* ─── Overview Tab ─── */}
          {activeTab === "overview" && (
            <>
              {comparisonEnabled && (
                <PeriodComparisonBar
                  currentSpend={totalSpend}
                  currentRevenue={totalRevenue}
                  currentBookings={paidBookings.length}
                  currentRoi={roi}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  prevRevenue={prevRevenue}
                  prevBookings={prevPaid.length}
                  prevLoading={prevLoading}
                />
              )}

              <SummaryCards
                totalSpend={totalSpend}
                totalRevenue={totalRevenue}
                roi={roi}
                roas={roas}
                cpa={cpa}
                conversionRate={conversionRate}
                totalClicks={totalClicks}
                paidBookingsCount={paidBookings.length}
                isConfigured={!!isConfigured}
              />

              <BestWorstCampaigns bestCampaign={bestCampaign} worstCampaign={worstCampaign} />

              <CampaignCharts barChartData={barChartData} pieChartData={pieChartData} />

              <CampaignTable
                campaignData={campaignData}
                loading={loading || googleLoading}
                totalSpend={totalSpend}
                totalClicks={totalClicks}
                totalImpressions={totalImpressions}
                totalRevenue={totalRevenue}
                roi={roi}
                roas={roas}
                paidBookingsCount={paidBookings.length}
              />

              {/* Stats footer */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
                <div style={{ ...cardStyle }}>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: 700, marginBottom: 4 }}>ŚREDNI CPA</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{cpa > 0 ? formatMoney(cpa) : "—"}</div>
                  <div style={{ fontSize: 11, color: "#666" }}>koszt pozyskania 1 rezerwacji</div>
                </div>
                <div style={{ ...cardStyle }}>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: 700, marginBottom: 4 }}>ŚREDNI PRZYCHÓD / REZ.</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{paidBookings.length > 0 ? formatMoney(totalRevenue / paidBookings.length) : "—"}</div>
                  <div style={{ fontSize: 11, color: "#666" }}>średnia wartość rezerwacji</div>
                </div>
                <div style={{ ...cardStyle }}>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: 700, marginBottom: 4 }}>REZERWACJI Z REKLAM</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{platformBookings.length}</div>
                  <div style={{ fontSize: 11, color: "#666" }}>w tym opłaconych: {paidBookings.length}</div>
                </div>
              </div>
            </>
          )}

          {/* ─── Clients Tab ─── */}
          {activeTab === "clients" && (
            <ClientsTab bookings={bookings} packages={packages} loading={loading} />
          )}

          {/* ─── Packages Tab ─── */}
          {activeTab === "packages" && (
            <PackageAttributionTab
              adBookings={paidBookings}
              allBookings={[...paidBookings, ...nonAdBookings]}
              packages={packages}
            />
          )}

          {/* ─── Funnel Tab ─── */}
          {activeTab === "funnel" && (
            <FunnelMetrics
              impressions={totalImpressions}
              clicks={totalClicks}
              allBookings={platformBookings.length}
              paidBookings={paidBookings.length}
              revenue={totalRevenue}
              isConfigured={!!isConfigured}
            />
          )}

          {/* ─── Trend Tab ─── */}
          {activeTab === "trend" && (
            <TimeSeriesChart
              dateFrom={dateFrom}
              dateTo={dateTo}
              paidBookings={paidBookings}
            />
          )}
        </>
      )}
    </div>
  );
}

export default withAdminAuth(AdsPage);
