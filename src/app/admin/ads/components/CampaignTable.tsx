"use client";

import React from "react";
import { CampaignData, formatMoney, formatPercent, thStyle, tdStyle } from "../types";

interface CampaignTableProps {
  campaignData: CampaignData[];
  loading: boolean;
  totalSpend: number;
  totalClicks: number;
  totalImpressions: number;
  totalRevenue: number;
  roi: number;
  roas: number;
  paidBookingsCount: number;
}

export default function CampaignTable({
  campaignData,
  loading,
  totalSpend,
  totalClicks,
  totalImpressions,
  totalRevenue,
  roi,
  roas,
  paidBookingsCount,
}: CampaignTableProps) {
  const totalCtr =
    totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const totalCpc =
    totalClicks > 0 ? totalSpend / totalClicks : 0;

  const tdRight: React.CSSProperties = { ...tdStyle, textAlign: "right" };
  const thRight: React.CSSProperties = { ...thStyle, textAlign: "right" };

  return (
    <div
      style={{
        background: "#23222a",
        borderRadius: 14,
        padding: 0,
        overflow: "hidden",
        marginBottom: 24,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #333",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "#f36e21" }}>
          Kampanie ({campaignData.length})
        </span>
        {loading && (
          <span style={{ fontSize: 12, color: "#888" }}>Ładowanie...</span>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Kampania</th>
              <th style={thRight}>Wydatki</th>
              <th style={thRight}>Kliknięcia</th>
              <th style={thRight}>Wyświetlenia</th>
              <th style={thRight}>CTR</th>
              <th style={thRight}>CPC</th>
              <th style={thRight}>Rezerwacje</th>
              <th style={thRight}>Przychód</th>
              <th style={thRight}>ROI</th>
              <th style={thRight}>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {campaignData.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  style={{
                    ...tdStyle,
                    textAlign: "center",
                    color: "#666",
                    padding: "32px 12px",
                  }}
                >
                  Brak danych za wybrany okres
                </td>
              </tr>
            ) : (
              campaignData.map((c, i) => {
                const campaignRoi =
                  c.cost > 0
                    ? (c.revenue - c.cost) / c.cost
                    : 0;
                const campaignRoas =
                  c.cost > 0 ? c.revenue / c.cost : 0;
                const roiColor =
                  campaignRoi > 0
                    ? "#34a853"
                    : campaignRoi < 0
                    ? "#ea4335"
                    : "#888";

                return (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid #2a2930",
                    }}
                  >
                    <td style={{ ...tdStyle, color: "#fff", fontWeight: 600 }}>
                      {c.name}
                    </td>
                    <td style={{ ...tdRight, color: "#ea4335" }}>
                      {formatMoney(c.cost)}
                    </td>
                    <td style={tdRight}>
                      {c.clicks.toLocaleString("pl-PL")}
                    </td>
                    <td style={tdRight}>
                      {c.impressions.toLocaleString("pl-PL")}
                    </td>
                    <td style={tdRight}>
                      {c.impressions > 0
                        ? formatPercent(c.ctr)
                        : "—"}
                    </td>
                    <td style={tdRight}>
                      {c.clicks > 0 ? formatMoney(c.cpc) : "—"}
                    </td>
                    <td style={tdRight}>{c.bookings}</td>
                    <td style={{ ...tdRight, color: "#34a853" }}>
                      {formatMoney(c.revenue)}
                    </td>
                    <td style={{ ...tdRight, color: roiColor, fontWeight: 700 }}>
                      {c.cost > 0 ? formatPercent(campaignRoi) : "—"}
                    </td>
                    <td style={{ ...tdRight, color: "#4285f4" }}>
                      {c.cost > 0 ? campaignRoas.toFixed(2) + "x" : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Totals row */}
          {campaignData.length > 0 && (
            <tfoot>
              <tr
                style={{
                  borderTop: "2px solid #f36e21",
                  fontWeight: 700,
                }}
              >
                <td style={{ ...tdStyle, fontWeight: 700, color: "#f36e21" }}>
                  RAZEM
                </td>
                <td style={{ ...tdRight, fontWeight: 700, color: "#ea4335" }}>
                  {formatMoney(totalSpend)}
                </td>
                <td style={{ ...tdRight, fontWeight: 700 }}>
                  {totalClicks.toLocaleString("pl-PL")}
                </td>
                <td style={{ ...tdRight, fontWeight: 700 }}>
                  {totalImpressions.toLocaleString("pl-PL")}
                </td>
                <td style={{ ...tdRight, fontWeight: 700 }}>
                  {totalImpressions > 0 ? formatPercent(totalCtr) : "—"}
                </td>
                <td style={{ ...tdRight, fontWeight: 700 }}>
                  {totalClicks > 0 ? formatMoney(totalCpc) : "—"}
                </td>
                <td style={{ ...tdRight, fontWeight: 700 }}>
                  {paidBookingsCount}
                </td>
                <td style={{ ...tdRight, fontWeight: 700, color: "#34a853" }}>
                  {formatMoney(totalRevenue)}
                </td>
                <td
                  style={{
                    ...tdRight,
                    fontWeight: 700,
                    color:
                      roi > 0 ? "#34a853" : roi < 0 ? "#ea4335" : "#888",
                  }}
                >
                  {totalSpend > 0 ? formatPercent(roi) : "—"}
                </td>
                <td style={{ ...tdRight, fontWeight: 700, color: "#4285f4" }}>
                  {totalSpend > 0 ? roas.toFixed(2) + "x" : "—"}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
