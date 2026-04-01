"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from '@/lib/supabaseClient';
import { withAdminAuth } from '../components/withAdminAuth';
import { FaChevronDown, FaChevronUp, FaSort, FaSortUp, FaSortDown, FaGoogle, FaTiktok, FaFacebook, FaGlobe, FaSearch, FaFileExport, FaChevronLeft, FaChevronRight, FaCheckCircle, FaClock, FaMoneyBillWave, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

// ─── Types ───────────────────────────────────────────────────
interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  created_at?: string;
}

interface BookingRow {
  id: string;
  user_email: string;
  total_price: number | string | null;
  date: string;
  time: string;
  status?: string;
  package_id?: string;
  promo_code?: string;
  created_at?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  referrer?: string | null;
  landing_page?: string | null;
}

interface PackageInfo {
  id: string;
  name: string;
}

interface UserStats extends User {
  bookingsCount: number;
  bookingsSum: number;
  paidSum: number;
  depositSum: number;
  bookings: BookingRow[];
  utmSources: string[];
  lastBookingDate: string | null;
  mainStatus: string; // most relevant status for this user
}

type SortKey = 'name' | 'email' | 'created_at' | 'bookingsCount' | 'bookingsSum' | 'lastBookingDate';
type SortDir = 'asc' | 'desc';

// ─── Helpers ─────────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function getStatusBadge(status?: string) {
  const base: React.CSSProperties = { display: 'inline-block', padding: '2px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 };
  switch (status) {
    case 'paid': return <span style={{ ...base, background: '#1b5e20', color: '#a5d6a7' }}>Oplacona</span>;
    case 'deposit': return <span style={{ ...base, background: '#e65100', color: '#ffcc80' }}>Zaliczka</span>;
    case 'pending': return <span style={{ ...base, background: '#f9a825', color: '#fff8e1' }}>Oczekuje</span>;
    case 'cancelled': return <span style={{ ...base, background: '#b71c1c', color: '#ef9a9a' }}>Anulowana</span>;
    default: return <span style={{ ...base, background: '#333', color: '#aaa' }}>{status || '-'}</span>;
  }
}

function getUtmIcon(source?: string | null) {
  if (!source) return <FaGlobe size={14} color="#888" />;
  const s = source.toLowerCase();
  if (s.includes('google')) return <FaGoogle size={14} color="#4285f4" />;
  if (s.includes('tiktok')) return <FaTiktok size={14} color="#ff0050" />;
  if (s.includes('facebook') || s.includes('fb') || s.includes('meta') || s.includes('instagram') || s.includes('ig')) return <FaFacebook size={14} color="#1877f2" />;
  return <FaGlobe size={14} color="#ff9f58" />;
}

function getUtmBadge(source?: string | null) {
  if (!source) return <span style={{ color: '#666', fontSize: 12 }}>direct</span>;
  const s = source.toLowerCase();
  let bg = '#333'; let color = '#aaa';
  if (s.includes('google')) { bg = '#1a3a5c'; color = '#8ab4f8'; }
  else if (s.includes('tiktok')) { bg = '#3d0a1e'; color = '#ff6090'; }
  else if (s.includes('facebook') || s.includes('fb') || s.includes('meta') || s.includes('instagram') || s.includes('ig')) { bg = '#0d2d5e'; color = '#7eb8ff'; }
  else { bg = '#3a2a0e'; color = '#ff9f58'; }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: bg, color, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
      {getUtmIcon(source)} {source}
    </span>
  );
}

function getUserMainStatus(bookings: BookingRow[]): string {
  if (bookings.some(b => b.status === 'paid')) return 'paid';
  if (bookings.some(b => b.status === 'deposit')) return 'deposit';
  if (bookings.some(b => b.status === 'pending')) return 'pending';
  if (bookings.some(b => b.status === 'cancelled')) return 'cancelled';
  return 'none';
}

// ─── Main Component ──────────────────────────────────────────
function UsersPage() {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [packages, setPackages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasUtmColumns, setHasUtmColumns] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [utmFilter, setUtmFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Expanded rows
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // ─── Paginated fetch (Supabase caps at 1000 rows) ────────
  const PAGE_LIMIT = 1000;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function fetchAllRows<T>(buildQuery: (from: number, to: number) => any): Promise<{ data: T[]; error: string | null }> {
    const all: T[] = [];
    for (let offset = 0; ; offset += PAGE_LIMIT) {
      const { data, error } = await buildQuery(offset, offset + PAGE_LIMIT - 1);
      if (error) return { data: all, error: error.message };
      if (!data || (data as T[]).length === 0) break;
      all.push(...(data as T[]));
      if ((data as T[]).length < PAGE_LIMIT) break;
    }
    return { data: all, error: null };
  }

  // ─── Fetch Data ──────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    const BOOKINGS_FIELDS_WITH_UTM = 'id, user_email, total_price, date, time, status, package_id, promo_code, created_at, utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer, landing_page';
    const BOOKINGS_FIELDS_BASE = 'id, user_email, total_price, date, time, status, package_id, promo_code, created_at';

    // Detect if UTM columns exist
    let useUtm = true;
    const testRes = await supabase.from('bookings').select(BOOKINGS_FIELDS_WITH_UTM).limit(1);
    if (testRes.error) useUtm = false;
    setHasUtmColumns(useUtm);
    const bookingsFields = useUtm ? BOOKINGS_FIELDS_WITH_UTM : BOOKINGS_FIELDS_BASE;

    const [usersResult, bookingsResult, packagesRes] = await Promise.all([
      fetchAllRows<User>((from, to) =>
        supabase.from('users').select('*').order('created_at', { ascending: true }).range(from, to)
      ),
      fetchAllRows<BookingRow>((from, to) =>
        supabase.from('bookings').select(bookingsFields).order('created_at', { ascending: true }).range(from, to)
      ),
      supabase.from('packages').select('id, name').returns<PackageInfo[]>(),
    ]);

    if (usersResult.error) { setError("Blad ladowania uzytkownikow"); setLoading(false); return; }
    if (bookingsResult.error) { setError("Blad ladowania rezerwacji"); setLoading(false); return; }

    const pkgMap: Record<string, string> = {};
    (packagesRes.data || []).forEach(p => { pkgMap[p.id] = p.name; });
    setPackages(pkgMap);

    const bookingsByEmail: Record<string, BookingRow[]> = {};
    for (const b of bookingsResult.data) {
      if (!bookingsByEmail[b.user_email]) bookingsByEmail[b.user_email] = [];
      bookingsByEmail[b.user_email].push(b);
    }
    for (const email of Object.keys(bookingsByEmail)) {
      bookingsByEmail[email].sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
    }

    const stats: UserStats[] = usersResult.data.map((u) => {
      const userBookings = bookingsByEmail[u.email] || [];
      const utmSet = new Set<string>();
      let paidSum = 0; let depositSum = 0;
      for (const b of userBookings) {
        if (b.utm_source) utmSet.add(b.utm_source);
        const price = Number(b.total_price) || 0;
        if (b.status === 'paid') paidSum += price;
        if (b.status === 'deposit') depositSum += price;
      }
      const sortedDates = userBookings.map(b => b.date).filter(Boolean).sort();
      return {
        ...u,
        bookingsCount: userBookings.length,
        bookingsSum: userBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0),
        paidSum,
        depositSum,
        bookings: userBookings,
        utmSources: Array.from(utmSet),
        lastBookingDate: sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null,
        mainStatus: getUserMainStatus(userBookings),
      };
    });
    setUsers(stats);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── All unique UTM sources for filter ───────────────────
  const allUtmSources = useMemo(() => {
    const set = new Set<string>();
    for (const u of users) for (const s of u.utmSources) set.add(s);
    return Array.from(set).sort();
  }, [users]);

  // ─── Payment & Status Analytics ──────────────────────────
  const analytics = useMemo(() => {
    const bySource: Record<string, { count: number; revenue: number; paid: number; deposit: number; pending: number; cancelled: number }> = {};
    const byMedium: Record<string, { count: number; revenue: number }> = {};
    const byCampaign: Record<string, { count: number; revenue: number }> = {};
    let directCount = 0; let directRevenue = 0;
    let totalBookings = 0; let totalRevenue = 0;
    let paidCount = 0; let paidRevenue = 0;
    let depositCount = 0; let depositRevenue = 0;
    let pendingCount = 0; let pendingRevenue = 0;
    let cancelledCount = 0;

    for (const u of users) {
      for (const b of u.bookings) {
        const price = Number(b.total_price) || 0;
        totalBookings++; totalRevenue += price;

        if (b.status === 'paid') { paidCount++; paidRevenue += price; }
        else if (b.status === 'deposit') { depositCount++; depositRevenue += price; }
        else if (b.status === 'pending') { pendingCount++; pendingRevenue += price; }
        else if (b.status === 'cancelled') { cancelledCount++; }

        const src = b.utm_source || null;
        if (!src) { directCount++; directRevenue += price; }
        else {
          if (!bySource[src]) bySource[src] = { count: 0, revenue: 0, paid: 0, deposit: 0, pending: 0, cancelled: 0 };
          bySource[src].count++; bySource[src].revenue += price;
          if (b.status === 'paid') bySource[src].paid++;
          else if (b.status === 'deposit') bySource[src].deposit++;
          else if (b.status === 'pending') bySource[src].pending++;
          else if (b.status === 'cancelled') bySource[src].cancelled++;
        }
        const med = b.utm_medium || null;
        if (med) {
          if (!byMedium[med]) byMedium[med] = { count: 0, revenue: 0 };
          byMedium[med].count++; byMedium[med].revenue += price;
        }
        const camp = b.utm_campaign || null;
        if (camp) {
          if (!byCampaign[camp]) byCampaign[camp] = { count: 0, revenue: 0 };
          byCampaign[camp].count++; byCampaign[camp].revenue += price;
        }
      }
    }
    return { bySource, byMedium, byCampaign, directCount, directRevenue, totalBookings, totalRevenue, paidCount, paidRevenue, depositCount, depositRevenue, pendingCount, pendingRevenue, cancelledCount };
  }, [users]);

  // ─── Filtered + Sorted + Paginated ──────────────────────
  const filtered = useMemo(() => {
    let result = users;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone || '').includes(q)
      );
    }
    if (utmFilter === 'direct') result = result.filter(u => u.utmSources.length === 0);
    else if (utmFilter !== 'all') result = result.filter(u => u.utmSources.includes(utmFilter));
    if (statusFilter !== 'all') result = result.filter(u => u.bookings.some(b => b.status === statusFilter));
    if (dateFrom || dateTo) {
      result = result.filter(u => u.bookings.some(b => {
        if (dateFrom && b.date < dateFrom) return false;
        if (dateTo && b.date > dateTo) return false;
        return true;
      }));
    }
    return result;
  }, [users, search, utmFilter, statusFilter, dateFrom, dateTo]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let aVal: string | number = 0; let bVal: string | number = 0;
      switch (sortKey) {
        case 'name': aVal = (a.name || '').toLowerCase(); bVal = (b.name || '').toLowerCase(); break;
        case 'email': aVal = a.email.toLowerCase(); bVal = b.email.toLowerCase(); break;
        case 'created_at': aVal = a.created_at || ''; bVal = b.created_at || ''; break;
        case 'bookingsCount': aVal = a.bookingsCount; bVal = b.bookingsCount; break;
        case 'bookingsSum': aVal = a.bookingsSum; bVal = b.bookingsSum; break;
        case 'lastBookingDate': aVal = a.lastBookingDate || ''; bVal = b.lastBookingDate || ''; break;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [search, utmFilter, statusFilter, dateFrom, dateTo, pageSize]);

  // ─── Sort Handler ────────────────────────────────────────
  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }
  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <FaSort size={11} color="#666" style={{ marginLeft: 4 }} />;
    return sortDir === 'asc' ? <FaSortUp size={11} color="#f36e21" style={{ marginLeft: 4 }} /> : <FaSortDown size={11} color="#f36e21" style={{ marginLeft: 4 }} />;
  }

  function toggleExpand(id: string) {
    setExpandedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }

  // ─── CSV Export ──────────────────────────────────────────
  function exportCSV() {
    const BOM = '\uFEFF';
    let csv = BOM + 'Email;Imie;Telefon;Data rejestracji;Rezerwacje;Oplacone;Zaliczki;Suma (PLN);Zrodla UTM;Ostatnia rezerwacja\n';
    sorted.forEach(u => {
      const paid = u.bookings.filter(b => b.status === 'paid').length;
      const dep = u.bookings.filter(b => b.status === 'deposit').length;
      csv += `${u.email};${u.name || ''};${u.phone || ''};${u.created_at ? u.created_at.slice(0, 10) : ''};${u.bookingsCount};${paid};${dep};${u.bookingsSum.toFixed(2)};${u.utmSources.join(', ') || 'direct'};${u.lastBookingDate || ''}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `klienci_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  // ─── Styles ──────────────────────────────────────────────
  const cardStyle: React.CSSProperties = { background: '#23222a', borderRadius: 10, padding: '14px 16px', boxShadow: '0 1px 8px #0003', display: 'flex', flexDirection: 'column', gap: 4 };
  const labelStyle: React.CSSProperties = { fontSize: 12, color: '#ff9f58', fontWeight: 600, marginBottom: 2 };
  const valueStyle: React.CSSProperties = { fontSize: 24, color: '#f36e21', fontWeight: 900 };
  const inputStyle: React.CSSProperties = { background: '#18171c', color: '#fff', border: '2px solid #333', borderRadius: 8, padding: '7px 12px', fontSize: 14, fontWeight: 500, outline: 'none', transition: 'border-color 0.15s' };
  const thStyle: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 700, color: '#ff9f58', background: '#18171c' };

  // ─── Render ──────────────────────────────────────────────
  return (
    <div style={{ color: '#fff', maxWidth: 1400, margin: '0 auto', padding: '24px 0' }}>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 100, color: '#f36e21', margin: 0 }}>Klienci i Analityka</h1>
          <p style={{ fontSize: 14, color: '#888', margin: '4px 0 0' }}>Oplacone, zaliczki, zrodla ruchu (Google / TikTok / Facebook), UTM, rezerwacje</p>
        </div>
        <button onClick={exportCSV} style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FaFileExport size={14} /> Eksportuj CSV
        </button>
      </div>

      {/* UTM migration warning */}
      {!loading && !hasUtmColumns && (
        <div style={{ background: '#3a2a0e', border: '1px solid #f9a825', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
          <FaExclamationTriangle size={18} color="#f9a825" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <b style={{ color: '#f9a825' }}>UTM tracking nie jest aktywny!</b><br />
            Aby sledzic z jakiej reklamy przyszedl klient (Google / TikTok / Facebook), uruchom migracje SQL w panelu Supabase:<br />
            <code style={{ background: '#18171c', padding: '2px 8px', borderRadius: 4, fontSize: 12, color: '#ff9f58' }}>supabase_utm_migration.sql</code><br />
            Po uruchomieniu, nowe rezerwacje beda mialy dane UTM (utm_source, utm_medium, utm_campaign). Dane o oplatach i statusach dzialaja juz teraz.
          </div>
        </div>
      )}

      {/* ══════ Payment Analytics Cards ══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, marginBottom: 16 }}>
        <div style={cardStyle}>
          <span style={labelStyle}>Klienci</span>
          <span style={valueStyle}>{users.length}</span>
        </div>
        <div style={cardStyle}>
          <span style={labelStyle}>Rezerwacje</span>
          <span style={valueStyle}>{analytics.totalBookings}</span>
          <span style={{ fontSize: 11, color: '#aaa' }}>{analytics.totalRevenue.toFixed(0)} PLN</span>
        </div>
        <div style={{ ...cardStyle, borderLeft: '3px solid #4caf50' }}>
          <span style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 4 }}><FaCheckCircle size={12} color="#4caf50" /> Oplacone</span>
          <span style={{ ...valueStyle, color: '#4caf50' }}>{analytics.paidCount}</span>
          <span style={{ fontSize: 11, color: '#a5d6a7' }}>{analytics.paidRevenue.toFixed(0)} PLN</span>
        </div>
        <div style={{ ...cardStyle, borderLeft: '3px solid #ff9800' }}>
          <span style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 4 }}><FaMoneyBillWave size={12} color="#ff9800" /> Zaliczki</span>
          <span style={{ ...valueStyle, color: '#ff9800' }}>{analytics.depositCount}</span>
          <span style={{ fontSize: 11, color: '#ffcc80' }}>{analytics.depositRevenue.toFixed(0)} PLN</span>
        </div>
        <div style={{ ...cardStyle, borderLeft: '3px solid #f9a825' }}>
          <span style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 4 }}><FaClock size={12} color="#f9a825" /> Oczekujace</span>
          <span style={{ ...valueStyle, color: '#f9a825' }}>{analytics.pendingCount}</span>
          <span style={{ fontSize: 11, color: '#fff8e1' }}>{analytics.pendingRevenue.toFixed(0)} PLN</span>
        </div>
        <div style={{ ...cardStyle, borderLeft: '3px solid #ef5350' }}>
          <span style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 4 }}><FaTimesCircle size={12} color="#ef5350" /> Anulowane</span>
          <span style={{ ...valueStyle, color: '#ef5350' }}>{analytics.cancelledCount}</span>
        </div>
      </div>

      {/* ══════ Ad Platform Breakdown (3 columns) ══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, marginBottom: 16 }}>
        {/* By Source — with payment breakdown */}
        <div style={{ ...cardStyle, padding: '14px 16px' }}>
          <span style={{ ...labelStyle, fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaGoogle size={14} color="#4285f4" /> <FaTiktok size={14} color="#ff0050" /> <FaFacebook size={14} color="#1877f2" /> Zrodla ruchu
          </span>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ color: '#ff9f58' }}>
                <th style={{ textAlign: 'left', padding: '4px 6px' }}>Zrodlo</th>
                <th style={{ textAlign: 'right', padding: '4px 6px' }}>Rez.</th>
                <th style={{ textAlign: 'right', padding: '4px 6px' }}>PLN</th>
                <th style={{ textAlign: 'right', padding: '4px 6px' }}>Opl.</th>
                <th style={{ textAlign: 'right', padding: '4px 6px' }}>Zal.</th>
                <th style={{ textAlign: 'right', padding: '4px 6px' }}>%</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #2a2a2f' }}>
                <td style={{ padding: '4px 6px' }}>{getUtmBadge(null)}</td>
                <td style={{ padding: '4px 6px', textAlign: 'right' }}>{analytics.directCount}</td>
                <td style={{ padding: '4px 6px', textAlign: 'right' }}>{analytics.directRevenue.toFixed(0)}</td>
                <td style={{ padding: '4px 6px', textAlign: 'right', color: '#4caf50' }}>-</td>
                <td style={{ padding: '4px 6px', textAlign: 'right', color: '#ff9800' }}>-</td>
                <td style={{ padding: '4px 6px', textAlign: 'right', color: '#aaa' }}>{analytics.totalBookings ? ((analytics.directCount / analytics.totalBookings) * 100).toFixed(1) : 0}%</td>
              </tr>
              {Object.entries(analytics.bySource).sort((a, b) => b[1].revenue - a[1].revenue).map(([src, d]) => (
                <tr key={src} style={{ borderBottom: '1px solid #2a2a2f' }}>
                  <td style={{ padding: '4px 6px' }}>{getUtmBadge(src)}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right' }}>{d.count}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right' }}>{d.revenue.toFixed(0)}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', color: '#4caf50' }}>{d.paid}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', color: '#ff9800' }}>{d.deposit}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', color: '#aaa' }}>{analytics.totalBookings ? ((d.count / analytics.totalBookings) * 100).toFixed(1) : 0}%</td>
                </tr>
              ))}
              {Object.keys(analytics.bySource).length === 0 && !hasUtmColumns && (
                <tr><td colSpan={6} style={{ padding: '8px 6px', color: '#666', fontSize: 12 }}>Uruchom migracje UTM, aby widziec dane</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* By Medium */}
        <div style={{ ...cardStyle, padding: '14px 16px' }}>
          <span style={{ ...labelStyle, fontSize: 14, marginBottom: 8 }}>Medium (utm_medium)</span>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr style={{ color: '#ff9f58' }}><th style={{ textAlign: 'left', padding: '4px 6px' }}>Medium</th><th style={{ textAlign: 'right', padding: '4px 6px' }}>Rez.</th><th style={{ textAlign: 'right', padding: '4px 6px' }}>PLN</th></tr></thead>
            <tbody>
              {Object.entries(analytics.byMedium).sort((a, b) => b[1].revenue - a[1].revenue).map(([med, d]) => (
                <tr key={med} style={{ borderBottom: '1px solid #2a2a2f' }}><td style={{ padding: '4px 6px', color: '#ccc' }}>{med}</td><td style={{ padding: '4px 6px', textAlign: 'right' }}>{d.count}</td><td style={{ padding: '4px 6px', textAlign: 'right' }}>{d.revenue.toFixed(0)}</td></tr>
              ))}
              {Object.keys(analytics.byMedium).length === 0 && <tr><td colSpan={3} style={{ padding: '8px 6px', color: '#666' }}>{hasUtmColumns ? 'Brak danych' : 'Wymaga migracji UTM'}</td></tr>}
            </tbody>
          </table>
        </div>

        {/* By Campaign */}
        <div style={{ ...cardStyle, padding: '14px 16px' }}>
          <span style={{ ...labelStyle, fontSize: 14, marginBottom: 8 }}>Kampanie (utm_campaign)</span>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr style={{ color: '#ff9f58' }}><th style={{ textAlign: 'left', padding: '4px 6px' }}>Kampania</th><th style={{ textAlign: 'right', padding: '4px 6px' }}>Rez.</th><th style={{ textAlign: 'right', padding: '4px 6px' }}>PLN</th></tr></thead>
            <tbody>
              {Object.entries(analytics.byCampaign).sort((a, b) => b[1].revenue - a[1].revenue).map(([camp, d]) => (
                <tr key={camp} style={{ borderBottom: '1px solid #2a2a2f' }}><td style={{ padding: '4px 6px', color: '#ccc', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{camp}</td><td style={{ padding: '4px 6px', textAlign: 'right' }}>{d.count}</td><td style={{ padding: '4px 6px', textAlign: 'right' }}>{d.revenue.toFixed(0)}</td></tr>
              ))}
              {Object.keys(analytics.byCampaign).length === 0 && <tr><td colSpan={3} style={{ padding: '8px 6px', color: '#666' }}>{hasUtmColumns ? 'Brak danych' : 'Wymaga migracji UTM'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════ Filters ══════ */}
      <div style={{ background: '#23222a', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <FaSearch size={13} color="#666" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj (imie, email, telefon)..." style={{ ...inputStyle, paddingLeft: 32, width: '100%' }} onFocus={e => e.currentTarget.style.borderColor = '#f36e21'} onBlur={e => e.currentTarget.style.borderColor = '#333'} />
        </div>
        <select value={utmFilter} onChange={e => setUtmFilter(e.target.value)} style={{ ...inputStyle, minWidth: 150 }}>
          <option value="all">Wszystkie zrodla</option>
          <option value="direct">Direct (bez UTM)</option>
          {allUtmSources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inputStyle, minWidth: 130 }}>
          <option value="all">Wszystkie statusy</option>
          <option value="paid">Oplacone</option>
          <option value="deposit">Zaliczki</option>
          <option value="pending">Oczekujace</option>
          <option value="cancelled">Anulowane</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontSize: 12, color: '#aaa' }}>Od:</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...inputStyle, width: 140 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontSize: 12, color: '#aaa' }}>Do:</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...inputStyle, width: 140 }} />
        </div>
        {(search || utmFilter !== 'all' || statusFilter !== 'all' || dateFrom || dateTo) && (
          <button onClick={() => { setSearch(''); setUtmFilter('all'); setStatusFilter('all'); setDateFrom(''); setDateTo(''); }} style={{ background: 'transparent', color: '#f36e21', border: '1px solid #f36e21', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
            Wyczysc filtry
          </button>
        )}
      </div>

      {/* Results info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 13, color: '#aaa' }}>
        <span style={{ color: '#999' }}>Znaleziono: <b style={{ color: '#ccc' }}>{sorted.length}</b> klientow {sorted.length !== users.length && <>(z {users.length})</>}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Wierszy:</span>
          <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} style={{ ...inputStyle, padding: '4px 8px', fontSize: 13, minWidth: 60 }}>
            {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {error && <div style={{ color: '#ff4d4f', marginBottom: 12, padding: '8px 12px', background: '#2a1515', borderRadius: 8 }}>{error}</div>}

      {/* ══════ Main Table ══════ */}
      <div style={{ background: '#23222a', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 16px #0003' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ display: 'inline-block', width: 40, height: 40, border: '4px solid #333', borderTop: '4px solid #f36e21', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ marginTop: 12, color: '#aaa' }}>Ladowanie danych...</div>
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Brak klientow spelniajacych kryteria</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1050 }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 36 }}></th>
                  <th style={thStyle} onClick={() => handleSort('email')}>Email <SortIcon col="email" /></th>
                  <th style={thStyle} onClick={() => handleSort('name')}>Imie <SortIcon col="name" /></th>
                  <th style={{ ...thStyle }}>Telefon</th>
                  <th style={thStyle} onClick={() => handleSort('created_at')}>Rejestracja <SortIcon col="created_at" /></th>
                  <th style={thStyle} onClick={() => handleSort('bookingsCount')}>Rez. <SortIcon col="bookingsCount" /></th>
                  <th style={{ ...thStyle }}>Status</th>
                  <th style={thStyle} onClick={() => handleSort('bookingsSum')}>Suma <SortIcon col="bookingsSum" /></th>
                  <th style={{ ...thStyle }}>Zrodlo</th>
                  <th style={thStyle} onClick={() => handleSort('lastBookingDate')}>Ost. rez. <SortIcon col="lastBookingDate" /></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(u => (
                  <UserRow key={u.id} user={u} isExpanded={expandedIds.has(u.id)} onToggle={() => toggleExpand(u.id)} packages={packages} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
          <button onClick={() => setPage(1)} disabled={page === 1} style={paginationBtnStyle(page === 1)}>1</button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={paginationBtnStyle(page === 1)}><FaChevronLeft size={12} /></button>
          {getPageNumbers(page, totalPages).map((p, i) =>
            p === '...' ? <span key={`dot${i}`} style={{ color: '#666' }}>...</span> : (
              <button key={p} onClick={() => setPage(Number(p))} style={{ ...paginationBtnStyle(false), background: page === p ? '#f36e21' : '#23222a', color: page === p ? '#fff' : '#aaa', fontWeight: page === p ? 700 : 500 }}>{p}</button>
            )
          )}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={paginationBtnStyle(page === totalPages)}><FaChevronRight size={12} /></button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={paginationBtnStyle(page === totalPages)}>{totalPages}</button>
        </div>
      )}
    </div>
  );
}

// ─── Pagination helpers ────────────────────────────────────
function paginationBtnStyle(disabled: boolean): React.CSSProperties {
  return { background: '#23222a', color: disabled ? '#444' : '#aaa', border: '1px solid #333', borderRadius: 6, padding: '6px 10px', fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer', minWidth: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' };
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | string)[] = [];
  if (current <= 4) { for (let i = 1; i <= 5; i++) pages.push(i); pages.push('...'); }
  else if (current >= total - 3) { pages.push('...'); for (let i = total - 4; i <= total; i++) pages.push(i); }
  else { pages.push('...'); for (let i = current - 1; i <= current + 1; i++) pages.push(i); pages.push('...'); }
  return pages;
}

// ─── User Row ──────────────────────────────────────────────
function UserRow({ user, isExpanded, onToggle, packages }: { user: UserStats; isExpanded: boolean; onToggle: () => void; packages: Record<string, string> }) {
  const tdStyle: React.CSSProperties = { padding: '10px 12px', fontSize: 13 };
  const paidCount = user.bookings.filter(b => b.status === 'paid').length;
  const depositCount = user.bookings.filter(b => b.status === 'deposit').length;
  const pendingCount = user.bookings.filter(b => b.status === 'pending').length;

  return (
    <>
      <tr
        style={{ borderBottom: isExpanded ? 'none' : '1px solid #2a2a2f', cursor: 'pointer', transition: 'background 0.1s' }}
        onClick={onToggle}
        onMouseEnter={e => (e.currentTarget.style.background = '#2a2a35')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <td style={{ ...tdStyle, width: 36, textAlign: 'center', color: '#f36e21' }}>
          {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </td>
        <td style={{ ...tdStyle, fontWeight: 700, color: '#f36e21', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</td>
        <td style={tdStyle}>{user.name || <span style={{ color: '#555' }}>-</span>}</td>
        <td style={tdStyle}>{user.phone || <span style={{ color: '#555' }}>-</span>}</td>
        <td style={{ ...tdStyle, color: '#aaa', fontSize: 12 }}>{user.created_at ? user.created_at.slice(0, 10) : '-'}</td>
        <td style={{ ...tdStyle, fontWeight: 700 }}>{user.bookingsCount}</td>
        <td style={tdStyle}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {paidCount > 0 && <span style={{ background: '#1b5e20', color: '#a5d6a7', padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{paidCount} opl.</span>}
            {depositCount > 0 && <span style={{ background: '#e65100', color: '#ffcc80', padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{depositCount} zal.</span>}
            {pendingCount > 0 && <span style={{ background: '#f9a825', color: '#fff8e1', padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{pendingCount} ocz.</span>}
            {paidCount === 0 && depositCount === 0 && pendingCount === 0 && <span style={{ color: '#555', fontSize: 11 }}>-</span>}
          </div>
        </td>
        <td style={{ ...tdStyle, fontWeight: 700, color: '#4caf50' }}>{user.bookingsSum.toFixed(0)} zl</td>
        <td style={tdStyle}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {user.utmSources.length === 0 ? <span style={{ color: '#555', fontSize: 11 }}>direct</span> : user.utmSources.map(s => <span key={s}>{getUtmBadge(s)}</span>)}
          </div>
        </td>
        <td style={{ ...tdStyle, color: '#aaa', fontSize: 12 }}>{user.lastBookingDate || '-'}</td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={10} style={{ padding: 0, background: '#1e1e26' }}>
            <div style={{ padding: '12px 20px 16px 52px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ff9f58', marginBottom: 8 }}>Rezerwacje klienta ({user.bookings.length})</div>
              {user.bookings.length === 0 ? <div style={{ color: '#555', fontSize: 13 }}>Brak rezerwacji</div> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ color: '#888', borderBottom: '1px solid #333' }}>
                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>Data</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>Czas</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>Pakiet</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>Status</th>
                        <th style={{ textAlign: 'right', padding: '6px 8px' }}>Kwota</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>Promo</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>Zrodlo</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>Medium</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>Kampania</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>Utworzono</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.bookings.map(b => (
                        <tr key={b.id} style={{ borderBottom: '1px solid #2a2a2f' }}>
                          <td style={{ padding: '6px 8px', fontWeight: 600 }}>{b.date}</td>
                          <td style={{ padding: '6px 8px' }}>{b.time?.slice(0, 5)}</td>
                          <td style={{ padding: '6px 8px', color: '#ccc' }}>{b.package_id ? (packages[b.package_id] || b.package_id.slice(0, 8)) : '-'}</td>
                          <td style={{ padding: '6px 8px' }}>{getStatusBadge(b.status)}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>{Number(b.total_price || 0).toFixed(2)}</td>
                          <td style={{ padding: '6px 8px', color: b.promo_code ? '#4caf50' : '#555' }}>{b.promo_code || '-'}</td>
                          <td style={{ padding: '6px 8px' }}>{b.utm_source ? getUtmBadge(b.utm_source) : <span style={{ color: '#555' }}>-</span>}</td>
                          <td style={{ padding: '6px 8px', color: '#aaa' }}>{b.utm_medium || '-'}</td>
                          <td style={{ padding: '6px 8px', color: '#aaa', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.utm_campaign || '-'}</td>
                          <td style={{ padding: '6px 8px', color: '#666', fontSize: 11 }}>{b.created_at ? b.created_at.slice(0, 16).replace('T', ' ') : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default withAdminAuth(UsersPage);
