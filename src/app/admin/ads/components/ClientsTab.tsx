"use client";
import React, { useState, useMemo } from "react";
import { FaSortUp, FaSortDown, FaDownload } from "react-icons/fa";
import { BookingFull, PackageInfo, formatMoney, isGoogleSource } from "../types";

interface ClientsTabProps {
  bookings: BookingFull[];
  packages: PackageInfo[];
  loading: boolean;
}

type SortKey = "name" | "date" | "amount" | "status" | "campaign";
type SortDir = "asc" | "desc";

const STATUS_LABELS: Record<string, string> = {
  paid: "Opłacona",
  deposit: "Zaliczka",
  pending: "Oczekuje",
  cancelled: "Anulowana",
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  paid: { bg: "#1a3a1f", color: "#34a853" },
  deposit: { bg: "#3a3010", color: "#fbbc05" },
  pending: { bg: "#2a2a2a", color: "#aaa" },
  cancelled: { bg: "#3a1515", color: "#ea4335" },
};

const inputStyle: React.CSSProperties = {
  background: "#18171c",
  color: "#fff",
  border: "2px solid #333",
  borderRadius: 8,
  padding: "6px 12px",
  fontSize: 13,
};

const PAGE_SIZE = 25;

function triggerCsvDownload(rows: BookingFull[], packages: PackageInfo[]) {
  const headers = ["#", "Klient", "Email", "Telefon", "Data", "Pakiet", "Kwota", "Status", "Kampania", "utm_source", "utm_medium", "utm_term", "utm_content", "Referrer", "Strona wejścia"];
  const lines = [headers.join(";")];
  rows.forEach((b, i) => {
    const pkg = packages.find(p => p.id === b.package_id)?.name ?? "—";
    lines.push([
      i + 1,
      b.name ?? "",
      b.user_email ?? "",
      b.phone ?? "",
      b.date,
      pkg,
      Number(b.total_price ?? 0).toFixed(2),
      b.status ?? "",
      b.utm_campaign ?? "",
      b.utm_source ?? "",
      b.utm_medium ?? "",
      b.utm_term ?? "",
      b.utm_content ?? "",
      b.referrer ?? "",
      b.landing_page ?? "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(";"));
  });
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `klienci-google-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ClientsTab({ bookings, packages, loading }: ClientsTabProps) {
  const [search, setSearch] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter to Google-source bookings
  const googleBookings = useMemo(
    () => bookings.filter(b => isGoogleSource(b.utm_source)),
    [bookings]
  );

  // Unique campaigns for dropdown
  const campaigns = useMemo(() => {
    const set = new Set<string>();
    googleBookings.forEach(b => {
      if (b.utm_campaign) set.add(b.utm_campaign);
    });
    return Array.from(set).sort();
  }, [googleBookings]);

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = googleBookings.filter(b => {
      if (q) {
        const match =
          (b.name ?? "").toLowerCase().includes(q) ||
          (b.user_email ?? "").toLowerCase().includes(q) ||
          (b.phone ?? "").toLowerCase().includes(q) ||
          (b.utm_campaign ?? "").toLowerCase().includes(q);
        if (!match) return false;
      }
      if (campaignFilter && b.utm_campaign !== campaignFilter) return false;
      if (statusFilter && b.status !== statusFilter) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      let av: string | number = 0;
      let bv: string | number = 0;
      if (sortKey === "name") { av = a.name ?? ""; bv = b.name ?? ""; }
      else if (sortKey === "date") { av = a.date; bv = b.date; }
      else if (sortKey === "amount") { av = Number(a.total_price ?? 0); bv = Number(b.total_price ?? 0); }
      else if (sortKey === "status") { av = a.status ?? ""; bv = b.status ?? ""; }
      else if (sortKey === "campaign") { av = a.utm_campaign ?? ""; bv = b.utm_campaign ?? ""; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [googleBookings, search, campaignFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return null;
    return sortDir === "asc"
      ? <FaSortUp style={{ marginLeft: 4, verticalAlign: "middle" }} />
      : <FaSortDown style={{ marginLeft: 4, verticalAlign: "middle" }} />;
  }

  const thStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: 700,
    color: "#888",
    borderBottom: "1px solid #333",
    whiteSpace: "nowrap",
    cursor: "pointer",
    userSelect: "none",
  };

  const tdStyle: React.CSSProperties = { padding: "10px 12px", fontSize: 13 };

  return (
    <div style={{ background: "#23222a", borderRadius: 14, padding: "20px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#f36e21" }}>
          Klienci z Google ({filtered.length})
        </div>
        <button
          onClick={() => triggerCsvDownload(filtered, packages)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <FaDownload size={11} /> Eksportuj CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Szukaj (imię, email, telefon, kampania)"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          style={{ ...inputStyle, minWidth: 260 }}
        />
        <select
          value={campaignFilter}
          onChange={e => { setCampaignFilter(e.target.value); setPage(0); }}
          style={inputStyle}
        >
          <option value="">Wszystkie kampanie</option>
          {campaigns.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          style={inputStyle}
        >
          <option value="">Wszystkie statusy</option>
          <option value="paid">Opłacona</option>
          <option value="deposit">Zaliczka</option>
          <option value="pending">Oczekuje</option>
          <option value="cancelled">Anulowana</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, cursor: "default" }}>#</th>
              <th style={thStyle} onClick={() => handleSort("name")}>Klient <SortIcon col="name" /></th>
              <th style={{ ...thStyle, cursor: "default" }}>Telefon</th>
              <th style={thStyle} onClick={() => handleSort("date")}>Data <SortIcon col="date" /></th>
              <th style={{ ...thStyle, cursor: "default" }}>Pakiet</th>
              <th style={{ ...thStyle, textAlign: "right" as const }} onClick={() => handleSort("amount")}>Kwota <SortIcon col="amount" /></th>
              <th style={thStyle} onClick={() => handleSort("status")}>Status <SortIcon col="status" /></th>
              <th style={thStyle} onClick={() => handleSort("campaign")}>Kampania <SortIcon col="campaign" /></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: "center", color: "#555", padding: 24 }}>
                  Ładowanie...
                </td>
              </tr>
            )}
            {!loading && pageData.length === 0 && (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: "center", color: "#555", padding: 24 }}>
                  Brak klientów spełniających kryteria
                </td>
              </tr>
            )}
            {!loading && pageData.map((b, i) => {
              const pkg = packages.find(p => p.id === b.package_id)?.name ?? "—";
              const statusStyle = STATUS_COLORS[b.status ?? ""] ?? STATUS_COLORS.pending;
              const isExpanded = expandedId === b.id;
              const rowIndex = page * PAGE_SIZE + i + 1;

              return (
                <React.Fragment key={b.id}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : b.id)}
                    style={{
                      borderBottom: "1px solid #2a2a2f",
                      cursor: "pointer",
                      background: isExpanded ? "#1e1d24" : "transparent",
                    }}
                  >
                    <td style={{ ...tdStyle, color: "#555" }}>{rowIndex}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{b.name ?? "—"}</div>
                      {b.user_email && (
                        <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{b.user_email}</div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, color: "#aaa" }}>{b.phone ?? "—"}</td>
                    <td style={{ ...tdStyle, color: "#aaa" }}>{b.date}</td>
                    <td style={{ ...tdStyle, color: "#ccc" }}>{pkg}</td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>
                      {formatMoney(Number(b.total_price ?? 0))}
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          borderRadius: 12,
                          padding: "2px 10px",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {STATUS_LABELS[b.status ?? ""] ?? b.status ?? "—"}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: "#aaa", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {b.utm_campaign ?? "—"}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr style={{ borderBottom: "1px solid #2a2a2f" }}>
                      <td colSpan={8} style={{ padding: 0 }}>
                        <div
                          style={{
                            background: "#18171c",
                            padding: 16,
                            fontSize: 12,
                            color: "#aaa",
                            borderRadius: 8,
                            margin: "4px 12px 12px",
                          }}
                        >
                          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 8 }}>
                            <span><b style={{ color: "#888" }}>utm_source:</b> {b.utm_source ?? "—"}</span>
                            <span><b style={{ color: "#888" }}>utm_medium:</b> {b.utm_medium ?? "—"}</span>
                            <span><b style={{ color: "#888" }}>utm_campaign:</b> {b.utm_campaign ?? "—"}</span>
                            <span><b style={{ color: "#888" }}>utm_term:</b> {b.utm_term ?? "—"}</span>
                            <span><b style={{ color: "#888" }}>utm_content:</b> {b.utm_content ?? "—"}</span>
                          </div>
                          <div><b style={{ color: "#888" }}>Referrer:</b> {b.referrer ?? "—"}</div>
                          <div style={{ marginTop: 4 }}>
                            <b style={{ color: "#888" }}>Strona wejścia:</b> {b.landing_page ?? "—"}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          style={{
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "6px 16px",
            cursor: page === 0 ? "not-allowed" : "pointer",
            opacity: page === 0 ? 0.4 : 1,
          }}
        >
          Poprzednia
        </button>
        <span style={{ color: "#888", fontSize: 12 }}>
          Strona {page + 1} z {totalPages} ({filtered.length} klientów)
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          style={{
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "6px 16px",
            cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
            opacity: page >= totalPages - 1 ? 0.4 : 1,
          }}
        >
          Następna
        </button>
      </div>
    </div>
  );
}
