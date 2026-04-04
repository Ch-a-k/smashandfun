"use client";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { BookingFull, PackageInfo, formatMoney, isGoogleSource, COLORS } from "../types";

interface PackageAttributionTabProps {
  adBookings: BookingFull[];
  allBookings: BookingFull[];
  packages: PackageInfo[];
}

interface PackageStat {
  packageId: string;
  packageName: string;
  adCount: number;
  adRevenue: number;
  organicCount: number;
  organicRevenue: number;
  adShare: number;
}

function isPaidOrDeposit(b: BookingFull) {
  return b.status === "paid" || b.status === "deposit";
}

export default function PackageAttributionTab({
  adBookings,
  allBookings,
  packages,
}: PackageAttributionTabProps) {
  const stats = useMemo<PackageStat[]>(() => {
    const paidAd = adBookings.filter(isPaidOrDeposit);
    const paidAll = allBookings.filter(isPaidOrDeposit);

    const map = new Map<string, PackageStat>();

    // Initialize from packages list
    packages.forEach(pkg => {
      map.set(pkg.id, {
        packageId: pkg.id,
        packageName: pkg.name,
        adCount: 0,
        adRevenue: 0,
        organicCount: 0,
        organicRevenue: 0,
        adShare: 0,
      });
    });

    // Count ad bookings
    paidAd.forEach(b => {
      const id = b.package_id ?? "__unknown__";
      if (!map.has(id)) {
        map.set(id, {
          packageId: id,
          packageName: packages.find(p => p.id === id)?.name ?? "Nieznany",
          adCount: 0,
          adRevenue: 0,
          organicCount: 0,
          organicRevenue: 0,
          adShare: 0,
        });
      }
      const s = map.get(id)!;
      s.adCount += 1;
      s.adRevenue += Number(b.total_price ?? 0);
    });

    // Count organic bookings (not from Google)
    paidAll.filter(b => !isGoogleSource(b.utm_source)).forEach(b => {
      const id = b.package_id ?? "__unknown__";
      if (!map.has(id)) {
        map.set(id, {
          packageId: id,
          packageName: packages.find(p => p.id === id)?.name ?? "Nieznany",
          adCount: 0,
          adRevenue: 0,
          organicCount: 0,
          organicRevenue: 0,
          adShare: 0,
        });
      }
      const s = map.get(id)!;
      s.organicCount += 1;
      s.organicRevenue += Number(b.total_price ?? 0);
    });

    // Compute adShare and filter out packages with zero total
    return Array.from(map.values())
      .filter(s => s.adCount + s.organicCount > 0)
      .map(s => ({
        ...s,
        adShare: s.adCount + s.organicCount > 0
          ? s.adCount / (s.adCount + s.organicCount)
          : 0,
      }))
      .sort((a, b) => b.adRevenue - a.adRevenue);
  }, [adBookings, allBookings, packages]);

  const top3 = stats.slice(0, 3);

  const chartData = stats.map(s => ({
    name: s.packageName.length > 20 ? s.packageName.slice(0, 20) + "…" : s.packageName,
    "Reklamy": Number(s.adRevenue.toFixed(2)),
    "Organiczne": Number(s.organicRevenue.toFixed(2)),
  }));

  const thStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: 700,
    color: "#888",
    borderBottom: "1px solid #333",
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = { padding: "10px 12px", fontSize: 13 };

  return (
    <div style={{ background: "#23222a", borderRadius: 14, padding: "24px 28px" }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#f36e21", marginBottom: 20 }}>
        Atrybuycja pakietów
      </div>

      {/* Top 3 highlight cards */}
      {top3.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {top3.map((s, i) => (
            <div
              key={s.packageId}
              style={{
                flex: "1 1 200px",
                background: "#18171c",
                borderRadius: 12,
                padding: "16px 18px",
                borderTop: `3px solid ${COLORS[i % COLORS.length]}`,
              }}
            >
              <div style={{ fontSize: 12, color: "#888", fontWeight: 700, marginBottom: 6 }}>
                #{i + 1}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                {s.packageName}
              </div>
              <div style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>
                {s.adCount} {s.adCount === 1 ? "rezerwacja" : s.adCount < 5 ? "rezerwacje" : "rezerwacji"}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#34a853", marginBottom: 8 }}>
                {formatMoney(s.adRevenue)}
              </div>
              {/* adShare bar */}
              <div style={{ background: "#333", borderRadius: 4, height: 6, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(s.adShare * 100).toFixed(1)}%`,
                    height: "100%",
                    background: COLORS[i % COLORS.length],
                    borderRadius: 4,
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                {(s.adShare * 100).toFixed(1)}% z reklam
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comparison table */}
      {stats.length > 0 ? (
        <div style={{ overflowX: "auto", marginBottom: 28 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr>
                <th style={thStyle}>Pakiet</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Rez. (reklamy)</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Przychód (reklamy)</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Rez. (organiczne)</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Przychód (organiczne)</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Udział reklam %</th>
              </tr>
            </thead>
            <tbody>
              {stats.map(s => (
                <tr key={s.packageId} style={{ borderBottom: "1px solid #2a2a2f" }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{s.packageName}</td>
                  <td style={{ ...tdStyle, textAlign: "right", color: "#f36e21", fontWeight: 700 }}>
                    {s.adCount}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: s.adRevenue > 0 ? "#34a853" : "#555" }}>
                    {s.adRevenue > 0 ? formatMoney(s.adRevenue) : "—"}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right", color: "#aaa" }}>
                    {s.organicCount}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right", color: "#aaa" }}>
                    {s.organicRevenue > 0 ? formatMoney(s.organicRevenue) : "—"}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                      <span style={{ fontSize: 12, color: "#fff", minWidth: 40 }}>
                        {(s.adShare * 100).toFixed(1)}%
                      </span>
                      <div
                        style={{
                          width: 80,
                          background: "#333",
                          borderRadius: 2,
                          height: 4,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${(s.adShare * 100).toFixed(1)}%`,
                            height: "100%",
                            background: "#f36e21",
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ color: "#555", fontSize: 14, textAlign: "center", padding: 24 }}>
          Brak danych do wyświetlenia
        </div>
      )}

      {/* Bar chart */}
      {chartData.length > 0 && (
        <>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#aaa", marginBottom: 12 }}>
            Przychód: reklamy vs organiczne
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#888", fontSize: 11 }}
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
                contentStyle={{
                  background: "#23222a",
                  border: "1px solid #444",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#fff",
                }}
                formatter={(v: number) => `${v.toFixed(2)} zł`}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: "#aaa" }} />
              <Bar dataKey="Reklamy" fill="#f36e21" radius={[4, 4, 0, 0]} barSize={24}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill="#f36e21" />
                ))}
              </Bar>
              <Bar dataKey="Organiczne" fill="#4285f4" radius={[4, 4, 0, 0]} barSize={24}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill="#4285f4" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
