"use client";
import { useState, useEffect, useCallback } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BookingFull, DailyBreakdown } from "../types";

interface TimeSeriesChartProps {
  dateFrom: string;
  dateTo: string;
  paidBookings: BookingFull[];
}

interface ChartEntry {
  date: string;
  dateLabel: string;
  spend: number;
  revenue: number;
}

function generateDateRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const current = new Date(from + "T00:00:00");
  const end = new Date(to + "T00:00:00");
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function toDateLabel(date: string): string {
  return date.slice(8, 10) + "." + date.slice(5, 7);
}

const tooltipStyle = {
  contentStyle: {
    background: "#23222a",
    border: "1px solid #444",
    borderRadius: 8,
    fontSize: 12,
    color: "#fff",
  },
  labelStyle: { color: "#aaa" },
};

export default function TimeSeriesChart({
  dateFrom,
  dateTo,
  paidBookings,
}: TimeSeriesChartProps) {
  const [dailyData, setDailyData] = useState<DailyBreakdown[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDaily = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/ads/google/daily?dateFrom=${dateFrom}&dateTo=${dateTo}`
      );
      if (res.ok) {
        const json = await res.json();
        setDailyData(json.daily || []);
      } else {
        setDailyData([]);
      }
    } catch {
      setDailyData([]);
    }
    setLoading(false);
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchDaily();
  }, [fetchDaily]);

  // Build revenue map from paidBookings grouped by date
  const revenueByDate = paidBookings.reduce<Record<string, number>>((acc, b) => {
    const d = b.date?.slice(0, 10) ?? "";
    if (!d) return acc;
    acc[d] = (acc[d] ?? 0) + Number(b.total_price ?? 0);
    return acc;
  }, {});

  // Build spend map from fetched daily data
  const spendByDate = dailyData.reduce<Record<string, number>>((acc, d) => {
    acc[d.date] = (acc[d.date] ?? 0) + d.cost;
    return acc;
  }, {});

  const allDates = generateDateRange(dateFrom, dateTo);

  const chartData: ChartEntry[] = allDates.map(date => ({
    date,
    dateLabel: toDateLabel(date),
    spend: spendByDate[date] ?? 0,
    revenue: revenueByDate[date] ?? 0,
  }));

  const hasAnyData = chartData.some(d => d.revenue > 0 || d.spend > 0);

  return (
    <div
      style={{
        background: "#23222a",
        borderRadius: 14,
        padding: "24px 28px",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700, color: "#f36e21", marginBottom: 20 }}>
        Trend: wydatki vs przychód
      </div>

      {loading ? (
        <div
          style={{
            height: 350,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#888",
            fontSize: 14,
          }}
        >
          Ładowanie...
        </div>
      ) : !hasAnyData ? (
        <div
          style={{
            height: 350,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#555",
            fontSize: 14,
          }}
        >
          Brak danych za wybrany okres
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <XAxis
              dataKey="dateLabel"
              tick={{ fill: "#888", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "#888", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v} zł`}
            />
            <Tooltip
              contentStyle={tooltipStyle.contentStyle}
              labelStyle={tooltipStyle.labelStyle}
              formatter={(value: number) => `${value.toFixed(2)} zł`}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "#aaa", paddingTop: 8 }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Przychód"
              fill="#34a85340"
              stroke="#34a853"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="spend"
              name="Wydatki"
              stroke="#ea4335"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
