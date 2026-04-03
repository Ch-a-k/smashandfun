"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { withAdminAuth } from "../components/withAdminAuth";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  FaGoogle, FaFacebook, FaTiktok, FaArrowUp, FaArrowDown,
  FaExclamationTriangle, FaChartLine, FaMoneyBillWave,
} from "react-icons/fa";

// ─── Types ───────────────────────────────────────────────────
interface GoogleCampaign {
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
}

interface GoogleAdsResponse {
  configured: boolean;
  error?: string;
  campaigns?: GoogleCampaign[];
  totalCost?: number;
  totalClicks?: number;
  totalImpressions?: number;
  totalConversions?: number;
}

interface BookingRow {
  id: string;
  total_price: number | string | null;
  status?: string;
  utm_source?: string | null;
  utm_campaign?: string | null;
  date: string;
}

type Platform = "google" | "facebook" | "tiktok";

// ─── Styles ──────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: "#23222a", borderRadius: 14, padding: "20px 24px",
  flex: "1 1 160px", minWidth: 150,
};
const inputStyle: React.CSSProperties = {
  background: "#18171c", color: "#fff", border: "2px solid #333",
  borderRadius: 8, padding: "6px 12px", fontSize: 14, fontWeight: 600,
};
const thStyle: React.CSSProperties = {
  textAlign: "left", padding: "10px 12px", fontSize: 12, fontWeight: 700,
  color: "#888", borderBottom: "1px solid #333", whiteSpace: "nowrap",
};
const tdStyle: React.CSSProperties = { padding: "10px 12px", fontSize: 13 };

const PLATFORM_TABS: { key: Platform; label: string; icon: React.ReactElement; color: string }[] = [
  { key: "google", label: "Google Ads", icon: <FaGoogle />, color: "#4285f4" },
  { key: "facebook", label: "Facebook Ads", icon: <FaFacebook />, color: "#1877f2" },
  { key: "tiktok", label: "TikTok Ads", icon: <FaTiktok />, color: "#ee1d52" },
];

const COLORS = ["#f36e21", "#4285f4", "#34a853", "#ea4335", "#fbbc05", "#9c27b0", "#00bcd4", "#ff5722"];

function formatMoney(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " zł";
}

function formatPercent(n: number): string {
  return (n * 100).toFixed(1) + "%";
}

// ─── Main Page ──────────────────────────────────────────────
function AdsPage() {
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>("google");

  // Date range — default last 30 days
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));

  // Data
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [googleData, setGoogleData] = useState<GoogleAdsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  // Fetch bookings from Supabase
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("id, total_price, status, utm_source, utm_campaign, date")
      .gte("date", dateFrom)
      .lte("date", dateTo);
    setBookings((data as BookingRow[]) || []);
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

  // ─── Computed data ─────────────────────────────────────────
  const platformBookings = useMemo(() => {
    const src = platform;
    return bookings.filter(b => {
      const s = (b.utm_source || "").toLowerCase();
      if (src === "google") return s === "google" || s.includes("gclid");
      if (src === "facebook") return s === "facebook" || s === "instagram" || s.includes("fbclid") || s === "fb" || s === "ig";
      if (src === "tiktok") return s === "tiktok" || s.includes("ttclid");
      return false;
    });
  }, [bookings, platform]);

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

  // Campaign breakdown — merge Google Ads + Supabase
  const campaignData = useMemo(() => {
    const map = new Map<string, {
      name: string; cost: number; clicks: number; impressions: number;
      bookings: number; revenue: number; ctr: number; cpc: number;
    }>();

    // Add Google Ads campaigns
    if (googleData?.campaigns) {
      for (const c of googleData.campaigns) {
        map.set(c.name.toLowerCase(), {
          name: c.name, cost: c.cost, clicks: c.clicks,
          impressions: c.impressions, bookings: 0, revenue: 0,
          ctr: c.ctr, cpc: c.cpc,
        });
      }
    }

    // Match bookings by utm_campaign
    for (const b of paidBookings) {
      const cName = (b.utm_campaign || "").toLowerCase();
      if (!cName) continue;
      const existing = map.get(cName);
      if (existing) {
        existing.bookings += 1;
        existing.revenue += Number(b.total_price || 0);
      } else {
        // Campaign from bookings not in Google Ads
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
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontSize: 12, color: "#aaa" }}>Od:</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...inputStyle, width: 140 }} />
          <label style={{ fontSize: 12, color: "#aaa" }}>Do:</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...inputStyle, width: 140 }} />
        </div>
      </div>

      {/* Platform tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#23222a", borderRadius: 12, padding: 4, width: "fit-content" }}>
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

      {/* API not configured warning */}
      {platform === "google" && !isConfigured && !googleLoading && (
        <div style={{ background: "#3a2a0e", border: "1px solid #f9a825", borderRadius: 10, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <FaExclamationTriangle size={20} color="#f9a825" style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: 13 }}>
            <b style={{ color: "#f9a825" }}>Google Ads API nie jest podłączony</b><br />
            Dane o wydatkach, kliknięciach i wyświetleniach będą dostępne po dodaniu zmiennych środowiskowych.<br />
            <b>Dane o przychodach z rezerwacji (Supabase) działają już teraz.</b><br /><br />
            <span style={{ color: "#aaa" }}>Potrzebujesz: GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_CUSTOMER_ID</span>
          </div>
        </div>
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
          {/* Summary cards */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            <SummaryCard label="Wydatki (Google Ads)" value={isConfigured ? formatMoney(totalSpend) : "—"} sub={isConfigured ? undefined : "Podłącz API"} color="#ea4335" icon={<FaMoneyBillWave />} />
            <SummaryCard label="Przychód (rezerwacje)" value={formatMoney(totalRevenue)} sub={`${paidBookings.length} rezerwacji`} color="#34a853" icon={<FaChartLine />} />
            <SummaryCard label="ROI" value={isConfigured && totalSpend > 0 ? formatPercent(roi) : "—"} sub={roi > 0 ? "zysk" : roi < 0 ? "strata" : undefined} color={roi >= 0 ? "#34a853" : "#ea4335"} icon={roi >= 0 ? <FaArrowUp /> : <FaArrowDown />} />
            <SummaryCard label="ROAS" value={isConfigured && totalSpend > 0 ? roas.toFixed(2) + "x" : "—"} color="#4285f4" />
            <SummaryCard label="CPA" value={isConfigured && cpa > 0 ? formatMoney(cpa) : "—"} sub="koszt za rezerwację" color="#fbbc05" />
            <SummaryCard label="Konwersja" value={isConfigured && totalClicks > 0 ? formatPercent(conversionRate) : "—"} sub={isConfigured ? `${totalClicks} kliknięć` : undefined} color="#9c27b0" />
          </div>

          {/* Best/Worst campaigns */}
          {(bestCampaign || worstCampaign) && (
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              {bestCampaign && (
                <div style={{ ...cardStyle, borderLeft: "4px solid #34a853", flex: "1 1 300px" }}>
                  <div style={{ fontSize: 11, color: "#34a853", fontWeight: 700, marginBottom: 4 }}>🏆 NAJLEPSZA KAMPANIA (ROI)</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{bestCampaign.name}</div>
                  <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>
                    Wydatki: {formatMoney(bestCampaign.cost)} → Przychód: {formatMoney(bestCampaign.revenue)} · ROI: {formatPercent((bestCampaign.revenue - bestCampaign.cost) / bestCampaign.cost)}
                  </div>
                </div>
              )}
              {worstCampaign && worstCampaign.name !== bestCampaign?.name && (
                <div style={{ ...cardStyle, borderLeft: "4px solid #ea4335", flex: "1 1 300px" }}>
                  <div style={{ fontSize: 11, color: "#ea4335", fontWeight: 700, marginBottom: 4 }}>⚠️ NAJGORSZA KAMPANIA (ROI)</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{worstCampaign.name}</div>
                  <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>
                    Wydatki: {formatMoney(worstCampaign.cost)} → Przychód: {formatMoney(worstCampaign.revenue)} · ROI: {worstCampaign.revenue > 0 ? formatPercent((worstCampaign.revenue - worstCampaign.cost) / worstCampaign.cost) : "brak przychodów"}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Charts */}
          {campaignData.length > 0 && (
            <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              {/* Bar chart */}
              <div style={{ ...cardStyle, flex: "2 1 400px", minHeight: 300 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f36e21", marginBottom: 12 }}>Wydatki vs Przychód</div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barChartData} layout="vertical">
                    <XAxis type="number" tick={{ fill: "#888", fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={140} tick={{ fill: "#aaa", fontSize: 10 }} />
                    <RechartsTooltip contentStyle={{ background: "#23222a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="Wydatki" fill="#ea4335" barSize={12} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Przychod" fill="#34a853" barSize={12} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie chart */}
              {pieChartData.length > 0 && (
                <div style={{ ...cardStyle, flex: "1 1 280px", minHeight: 300 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f36e21", marginBottom: 12 }}>Podział wydatków</div>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name }) => name}>
                        {pieChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Legend wrapperStyle={{ fontSize: 10, color: "#aaa" }} />
                      <RechartsTooltip contentStyle={{ background: "#23222a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Campaign table */}
          <div style={{ ...cardStyle, padding: 0, overflow: "hidden", marginBottom: 24 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#f36e21" }}>Kampanie ({campaignData.length})</span>
              {(loading || googleLoading) && <span style={{ fontSize: 12, color: "#888" }}>Ładowanie...</span>}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Kampania</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Wydatki</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Kliknięcia</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Wyświetlenia</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>CTR</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>CPC</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Rezerwacje</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Przychód</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>ROI</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignData.length === 0 && (
                    <tr><td colSpan={10} style={{ ...tdStyle, textAlign: "center", color: "#555", padding: 24 }}>Brak danych za wybrany okres</td></tr>
                  )}
                  {campaignData.map((c, i) => {
                    const cRoi = c.cost > 0 ? (c.revenue - c.cost) / c.cost : 0;
                    const cRoas = c.cost > 0 ? c.revenue / c.cost : 0;
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #2a2a2f" }}>
                        <td style={{ ...tdStyle, fontWeight: 600, maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</td>
                        <td style={{ ...tdStyle, textAlign: "right", color: c.cost > 0 ? "#ea4335" : "#555" }}>{c.cost > 0 ? formatMoney(c.cost) : "—"}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{c.clicks || "—"}</td>
                        <td style={{ ...tdStyle, textAlign: "right", color: "#aaa" }}>{c.impressions || "—"}</td>
                        <td style={{ ...tdStyle, textAlign: "right", color: "#aaa" }}>{c.ctr > 0 ? formatPercent(c.ctr) : "—"}</td>
                        <td style={{ ...tdStyle, textAlign: "right", color: "#aaa" }}>{c.cpc > 0 ? formatMoney(c.cpc) : "—"}</td>
                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: c.bookings > 0 ? "#4caf50" : "#555" }}>{c.bookings || "—"}</td>
                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: c.revenue > 0 ? "#4caf50" : "#555" }}>{c.revenue > 0 ? formatMoney(c.revenue) : "—"}</td>
                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: cRoi > 0 ? "#34a853" : cRoi < 0 ? "#ea4335" : "#555" }}>
                          {c.cost > 0 ? formatPercent(cRoi) : "—"}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: cRoas >= 1 ? "#34a853" : cRoas > 0 ? "#ea4335" : "#555" }}>
                          {c.cost > 0 ? cRoas.toFixed(2) + "x" : "—"}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Totals row */}
                  {campaignData.length > 0 && (
                    <tr style={{ borderTop: "2px solid #f36e21", fontWeight: 700 }}>
                      <td style={{ ...tdStyle, color: "#f36e21" }}>RAZEM</td>
                      <td style={{ ...tdStyle, textAlign: "right", color: "#ea4335" }}>{totalSpend > 0 ? formatMoney(totalSpend) : "—"}</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>{totalClicks || "—"}</td>
                      <td style={{ ...tdStyle, textAlign: "right", color: "#aaa" }}>{totalImpressions || "—"}</td>
                      <td style={{ ...tdStyle, textAlign: "right", color: "#aaa" }}>{totalClicks > 0 && totalImpressions > 0 ? formatPercent(totalClicks / totalImpressions) : "—"}</td>
                      <td style={{ ...tdStyle, textAlign: "right", color: "#aaa" }}>{totalClicks > 0 && totalSpend > 0 ? formatMoney(totalSpend / totalClicks) : "—"}</td>
                      <td style={{ ...tdStyle, textAlign: "right", color: "#4caf50" }}>{paidBookings.length}</td>
                      <td style={{ ...tdStyle, textAlign: "right", color: "#4caf50" }}>{formatMoney(totalRevenue)}</td>
                      <td style={{ ...tdStyle, textAlign: "right", color: roi >= 0 ? "#34a853" : "#ea4335" }}>{totalSpend > 0 ? formatPercent(roi) : "—"}</td>
                      <td style={{ ...tdStyle, textAlign: "right", color: roas >= 1 ? "#34a853" : "#ea4335" }}>{totalSpend > 0 ? roas.toFixed(2) + "x" : "—"}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats footer */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
            <div style={{ ...cardStyle, flex: "1 1 200px" }}>
              <div style={{ fontSize: 11, color: "#888", fontWeight: 700, marginBottom: 4 }}>ŚREDNI CPA</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{cpa > 0 ? formatMoney(cpa) : "—"}</div>
              <div style={{ fontSize: 11, color: "#666" }}>koszt pozyskania 1 rezerwacji</div>
            </div>
            <div style={{ ...cardStyle, flex: "1 1 200px" }}>
              <div style={{ fontSize: 11, color: "#888", fontWeight: 700, marginBottom: 4 }}>ŚREDNI PRZYCHÓD / REZ.</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{paidBookings.length > 0 ? formatMoney(totalRevenue / paidBookings.length) : "—"}</div>
              <div style={{ fontSize: 11, color: "#666" }}>średnia wartość rezerwacji</div>
            </div>
            <div style={{ ...cardStyle, flex: "1 1 200px" }}>
              <div style={{ fontSize: 11, color: "#888", fontWeight: 700, marginBottom: 4 }}>REZERWACJI Z REKLAM</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{platformBookings.length}</div>
              <div style={{ fontSize: 11, color: "#666" }}>w tym opłaconych: {paidBookings.length}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Summary Card component ──────────────────────────────────
function SummaryCard({ label, value, sub, color, icon }: {
  label: string; value: string; sub?: string; color?: string; icon?: React.ReactElement;
}) {
  return (
    <div style={{ ...cardStyle }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: "#888", fontWeight: 700, textTransform: "uppercase" }}>{label}</span>
        {icon && <span style={{ color: color || "#888", fontSize: 16 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || "#fff" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default withAdminAuth(AdsPage);
