"use client";

import React from "react";
import { FaMoneyBillWave, FaChartLine, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { formatMoney, formatPercent } from "../types";

interface SummaryCardsProps {
  totalSpend: number;
  totalRevenue: number;
  roi: number;
  roas: number;
  cpa: number;
  conversionRate: number;
  totalClicks: number;
  paidBookingsCount: number;
  isConfigured: boolean;
}

function SummaryCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  icon?: React.ReactElement;
}) {
  return (
    <div
      style={{
        background: "#23222a",
        borderRadius: 14,
        padding: "20px 24px",
        flex: "1 1 160px",
        minWidth: 150,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "#888",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        {icon && (
          <span style={{ color: color || "#888", fontSize: 16 }}>{icon}</span>
        )}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || "#fff" }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

export default function SummaryCards({
  totalSpend,
  totalRevenue,
  roi,
  roas,
  cpa,
  conversionRate,
  totalClicks,
  paidBookingsCount,
  isConfigured,
}: SummaryCardsProps) {
  const roiColor =
    roi > 0 ? "#34a853" : roi < 0 ? "#ea4335" : "#888";
  const roiSub =
    roi > 0 ? "zysk" : roi < 0 ? "strata" : undefined;
  const roiIcon =
    roi >= 0 ? <FaArrowUp /> : <FaArrowDown />;

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 24,
      }}
    >
      <SummaryCard
        label="Wydatki (Google Ads)"
        value={isConfigured ? formatMoney(totalSpend) : "—"}
        sub={!isConfigured ? "Podłącz API" : undefined}
        color="#ea4335"
        icon={<FaMoneyBillWave />}
      />
      <SummaryCard
        label="Przychód (rezerwacje)"
        value={formatMoney(totalRevenue)}
        sub={`${paidBookingsCount} rezerwacji`}
        color="#34a853"
        icon={<FaChartLine />}
      />
      <SummaryCard
        label="ROI"
        value={isConfigured ? formatPercent(roi) : "—"}
        sub={roiSub}
        color={isConfigured ? roiColor : "#888"}
        icon={roiIcon}
      />
      <SummaryCard
        label="ROAS"
        value={isConfigured ? roas.toFixed(2) + "x" : "—"}
        color="#4285f4"
      />
      <SummaryCard
        label="CPA"
        value={isConfigured ? formatMoney(cpa) : "—"}
        sub="koszt za rezerwację"
        color="#fbbc05"
      />
      <SummaryCard
        label="Konwersja"
        value={isConfigured ? formatPercent(conversionRate) : "—"}
        sub={isConfigured ? `${totalClicks} kliknięć` : undefined}
        color="#9c27b0"
      />
    </div>
  );
}
