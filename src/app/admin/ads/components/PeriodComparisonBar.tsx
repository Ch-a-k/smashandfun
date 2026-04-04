"use client";
import { formatMoney, formatPercent } from "../types";

interface PeriodComparisonBarProps {
  currentSpend: number;
  currentRevenue: number;
  currentBookings: number;
  currentRoi: number;
  dateFrom: string;
  dateTo: string;
  prevRevenue: number;
  prevBookings: number;
  prevLoading: boolean;
}

function DeltaBadge({
  label,
  currentFormatted,
  current,
  prev,
  loading,
}: {
  label: string;
  currentFormatted: string;
  current: number;
  prev: number;
  loading: boolean;
}) {
  let deltaEl: React.ReactNode;

  if (loading) {
    deltaEl = (
      <span style={{ fontSize: 11, color: "#888" }}>Ładowanie...</span>
    );
  } else if (prev <= 0) {
    deltaEl = (
      <span style={{ fontSize: 11, color: "#888" }}>nowy</span>
    );
  } else {
    const deltaVal = ((current - prev) / prev) * 100;
    const positive = deltaVal > 0;
    const color = deltaVal > 0 ? "#34a853" : deltaVal < 0 ? "#ea4335" : "#888";
    const arrow = deltaVal > 0 ? "↑" : deltaVal < 0 ? "↓" : "";
    deltaEl = (
      <span style={{ fontSize: 11, color, fontWeight: 700 }}>
        {arrow} {Math.abs(deltaVal).toFixed(1)}%
      </span>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "4px 10px",
        background: "#18171c",
        borderRadius: 8,
      }}
    >
      <span style={{ fontSize: 10, color: "#666", fontWeight: 700, textTransform: "uppercase" as const }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{currentFormatted}</span>
      {deltaEl}
    </div>
  );
}

export default function PeriodComparisonBar({
  currentSpend,
  currentRevenue,
  currentBookings,
  currentRoi,
  prevRevenue,
  prevBookings,
  prevLoading,
}: PeriodComparisonBarProps) {
  return (
    <div
      style={{
        background: "#23222a",
        borderRadius: 12,
        padding: "12px 20px",
        marginBottom: 16,
        display: "flex",
        gap: 20,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>
        vs. poprzedni okres
      </span>

      <DeltaBadge
        label="Przychód"
        currentFormatted={formatMoney(currentRevenue)}
        current={currentRevenue}
        prev={prevRevenue}
        loading={prevLoading}
      />

      <DeltaBadge
        label="Rezerwacje"
        currentFormatted={String(currentBookings)}
        current={currentBookings}
        prev={prevBookings}
        loading={prevLoading}
      />

      {currentSpend > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: "4px 10px",
            background: "#18171c",
            borderRadius: 8,
          }}
        >
          <span style={{ fontSize: 10, color: "#666", fontWeight: 700, textTransform: "uppercase" as const }}>
            ROI
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: currentRoi >= 0 ? "#34a853" : "#ea4335" }}>
            {formatPercent(currentRoi)}
          </span>
        </div>
      )}
    </div>
  );
}
