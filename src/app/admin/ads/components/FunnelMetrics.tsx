"use client";
import { formatMoney } from "../types";

interface FunnelMetricsProps {
  impressions: number;
  clicks: number;
  allBookings: number;
  paidBookings: number;
  revenue: number;
  isConfigured: boolean;
}

function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.min((numerator / denominator) * 100, 100);
}

function convLabel(numerator: number, denominator: number, fromLabel: string): string {
  if (denominator <= 0) return "—";
  return `${((numerator / denominator) * 100).toFixed(1)}% z ${fromLabel}`;
}

interface StepProps {
  label: string;
  value: number | string;
  barColor: string;
  barWidth: number;
  convRate?: string;
  noBar?: boolean;
  isEmpty?: boolean;
}

function FunnelStep({ label, value, barColor, barWidth, convRate, noBar, isEmpty }: StepProps) {
  const displayValue = typeof value === "number"
    ? value.toLocaleString("pl-PL")
    : value;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      {/* Label */}
      <div style={{ width: 120, fontSize: 13, color: "#aaa", flexShrink: 0 }}>
        {label}
      </div>

      {/* Bar */}
      {!noBar && (
        <div
          style={{
            flex: 1,
            background: "#18171c",
            borderRadius: 6,
            height: 28,
            overflow: "hidden",
          }}
        >
          {!isEmpty && barWidth > 0 && (
            <div
              style={{
                width: `${barWidth}%`,
                minWidth: typeof value === "number" && value > 0 ? 2 : 0,
                height: "100%",
                background: barColor,
                borderRadius: 6,
                transition: "width 0.4s ease",
              }}
            />
          )}
        </div>
      )}

      {/* Value + conversion rate */}
      <div
        style={{
          width: 180,
          textAlign: "right",
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 700, color: "#fff" }}>{isEmpty ? "—" : displayValue}</span>
        {convRate && !isEmpty && (
          <span style={{ display: "block", fontSize: 11, color: "#888", marginTop: 2 }}>
            {convRate}
          </span>
        )}
      </div>
    </div>
  );
}

export default function FunnelMetrics({
  impressions,
  clicks,
  allBookings,
  paidBookings,
  revenue,
  isConfigured,
}: FunnelMetricsProps) {
  return (
    <div
      style={{
        background: "#23222a",
        borderRadius: 14,
        padding: "24px 28px",
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#f36e21",
          marginBottom: 20,
        }}
      >
        Lejek konwersji
      </div>

      <FunnelStep
        label="Wyświetlenia"
        value={impressions}
        barColor="#4285f4"
        barWidth={100}
        isEmpty={!isConfigured}
      />

      <FunnelStep
        label="Kliknięcia"
        value={clicks}
        barColor="#fbbc05"
        barWidth={pct(clicks, impressions)}
        convRate={convLabel(clicks, impressions, "Wyświetleń")}
        isEmpty={!isConfigured}
      />

      <FunnelStep
        label="Rezerwacje"
        value={allBookings}
        barColor="#f36e21"
        barWidth={pct(allBookings, clicks)}
        convRate={convLabel(allBookings, clicks, "Kliknięć")}
      />

      <FunnelStep
        label="Opłacone"
        value={paidBookings}
        barColor="#34a853"
        barWidth={pct(paidBookings, allBookings)}
        convRate={convLabel(paidBookings, allBookings, "Rezerwacji")}
      />

      {/* Revenue — no bar, just value */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 120, fontSize: 13, color: "#aaa", flexShrink: 0 }}>Przychód</div>
        <div style={{ flex: 1 }} />
        <div style={{ width: 180, textAlign: "right", fontSize: 13, flexShrink: 0 }}>
          <span style={{ fontWeight: 700, color: "#34a853" }}>{formatMoney(revenue)}</span>
          {allBookings > 0 && (
            <span style={{ display: "block", fontSize: 11, color: "#888", marginTop: 2 }}>
              {paidBookings > 0 ? formatMoney(revenue / paidBookings) + " / rez." : ""}
            </span>
          )}
        </div>
      </div>

      {!isConfigured && (
        <div style={{ marginTop: 16, fontSize: 12, color: "#666", textAlign: "center" as const }}>
          Podłącz Google Ads API, aby zobaczyć pełny lejek
        </div>
      )}
    </div>
  );
}
