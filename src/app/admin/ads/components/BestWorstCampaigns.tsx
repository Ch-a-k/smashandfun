"use client";

import React from "react";
import { CampaignData, formatMoney, formatPercent } from "../types";

interface BestWorstCampaignsProps {
  bestCampaign: CampaignData | null;
  worstCampaign: CampaignData | null;
}

export default function BestWorstCampaigns({
  bestCampaign,
  worstCampaign,
}: BestWorstCampaignsProps) {
  if (!bestCampaign && !worstCampaign) return null;

  const isDifferent =
    bestCampaign && worstCampaign && bestCampaign.name !== worstCampaign.name;

  const cardBase: React.CSSProperties = {
    background: "#23222a",
    borderRadius: 14,
    padding: "20px 24px",
    flex: "1 1 300px",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        marginBottom: 24,
        flexWrap: "wrap",
      }}
    >
      {bestCampaign && (
        <div
          style={{
            ...cardBase,
            borderLeft: "4px solid #34a853",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#34a853",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Najlepsza kampania (ROI)
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 6,
            }}
          >
            {bestCampaign.name}
          </div>
          <div style={{ fontSize: 12, color: "#aaa" }}>
            Wydatki: {formatMoney(bestCampaign.cost)} → Przychód:{" "}
            {formatMoney(bestCampaign.revenue)} · ROI:{" "}
            {bestCampaign.cost > 0
              ? formatPercent((bestCampaign.revenue - bestCampaign.cost) / bestCampaign.cost)
              : "—"}
          </div>
        </div>
      )}

      {worstCampaign && isDifferent && (
        <div
          style={{
            ...cardBase,
            borderLeft: "4px solid #ea4335",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#ea4335",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Najgorsza kampania (ROI)
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 6,
            }}
          >
            {worstCampaign.name}
          </div>
          <div style={{ fontSize: 12, color: "#aaa" }}>
            Wydatki: {formatMoney(worstCampaign.cost)} → Przychód:{" "}
            {formatMoney(worstCampaign.revenue)} · ROI:{" "}
            {worstCampaign.cost > 0
              ? formatPercent((worstCampaign.revenue - worstCampaign.cost) / worstCampaign.cost)
              : "—"}
          </div>
        </div>
      )}
    </div>
  );
}
