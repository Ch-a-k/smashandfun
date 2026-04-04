// ─── Types ───────────────────────────────────────────────────

export interface GoogleCampaign {
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

export interface GoogleAdsResponse {
  configured: boolean;
  error?: string;
  campaigns?: GoogleCampaign[];
  totalCost?: number;
  totalClicks?: number;
  totalImpressions?: number;
  totalConversions?: number;
}

export interface BookingFull {
  id: string;
  total_price: number | string | null;
  status?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  referrer?: string | null;
  landing_page?: string | null;
  date: string;
  created_at?: string | null;
  name?: string | null;
  phone?: string | null;
  user_email?: string | null;
  package_id?: string | null;
}

export interface PackageInfo {
  id: string;
  name: string;
  price: number;
}

export interface CampaignData {
  name: string;
  cost: number;
  clicks: number;
  impressions: number;
  bookings: number;
  revenue: number;
  ctr: number;
  cpc: number;
}

export interface DailyBreakdown {
  date: string;
  cost: number;
  clicks: number;
  impressions: number;
}

export type Platform = "google" | "facebook" | "tiktok";
export type ViewTab = "overview" | "clients" | "packages" | "funnel" | "trend";

// ─── Styles ──────────────────────────────────────────────────

export const cardStyle: React.CSSProperties = {
  background: "#23222a", borderRadius: 14, padding: "20px 24px",
  flex: "1 1 160px", minWidth: 150,
};

export const inputStyle: React.CSSProperties = {
  background: "#18171c", color: "#fff", border: "2px solid #333",
  borderRadius: 8, padding: "6px 12px", fontSize: 14, fontWeight: 600,
};

export const thStyle: React.CSSProperties = {
  textAlign: "left", padding: "10px 12px", fontSize: 12, fontWeight: 700,
  color: "#888", borderBottom: "1px solid #333", whiteSpace: "nowrap",
};

export const tdStyle: React.CSSProperties = { padding: "10px 12px", fontSize: 13 };

export const COLORS = ["#f36e21", "#4285f4", "#34a853", "#ea4335", "#fbbc05", "#9c27b0", "#00bcd4", "#ff5722"];

// ─── Helpers ─────────────────────────────────────────────────

export function formatMoney(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " zł";
}

export function formatPercent(n: number): string {
  return (n * 100).toFixed(1) + "%";
}

export function isGoogleSource(s: string | null | undefined): boolean {
  const src = (s || "").toLowerCase();
  return src === "google" || src.includes("gclid");
}
