"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { COLORS } from "../types";

interface CampaignChartsProps {
  barChartData: { name: string; Wydatki: number; Przychod: number }[];
  pieChartData: { name: string; value: number }[];
}

const tooltipStyle: React.CSSProperties = {
  background: "#fff",
  color: "#222",
  border: "1px solid #ddd",
  borderRadius: 8,
  fontSize: 12,
};

export default function CampaignCharts({
  barChartData,
  pieChartData,
}: CampaignChartsProps) {
  if (barChartData.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        marginBottom: 24,
        flexWrap: "wrap",
      }}
    >
      {/* Bar chart */}
      <div
        style={{
          background: "#23222a",
          borderRadius: 14,
          padding: "20px 24px",
          flex: "2 1 400px",
          minHeight: 300,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#ccc",
            marginBottom: 16,
          }}
        >
          Wydatki vs Przychód
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barChartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#888", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#888", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <RechartsTooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Bar dataKey="Wydatki" fill="#ea4335" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Przychod" fill="#34a853" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie chart */}
      {pieChartData.length > 0 && (
        <div
          style={{
            background: "#23222a",
            borderRadius: 14,
            padding: "20px 24px",
            flex: "1 1 280px",
            minHeight: 300,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#ccc",
              marginBottom: 16,
            }}
          >
            Podział wydatków
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieChartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={tooltipStyle}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#888" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
