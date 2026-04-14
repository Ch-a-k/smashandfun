"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabaseClient';
import { withAdminAuth } from '../components/withAdminAuth';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { pl } from 'date-fns/locale/pl';
registerLocale('pl', pl);
import { FaChevronDown, FaChevronUp, FaSort, FaSortUp, FaSortDown, FaGoogle, FaTiktok, FaFacebook, FaGlobe, FaSearch, FaFileExport, FaChevronLeft, FaChevronRight, FaCheckCircle, FaClock, FaMoneyBillWave, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

// ─── Types ───────────────────────────────────────────────────
interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  created_at?: string;
  segment?: string | null;
  manual_source?: string | null;
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

interface PaymentRow {
  id: string;
  booking_id: string;
  status: string;
  amount: number | string;
  created_at?: string;
}

interface B2BRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  people: number;
  date_from: string;
  date_to: string | null;
  extra_items: { id: string; count: number }[];
  message: string | null;
  status: string;
  estimated_revenue: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page: string | null;
  created_at: string;
}

interface VoucherRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  package: string;
  message: string | null;
  status: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page: string | null;
  created_at: string;
}

interface ExtraItemInfo {
  id: string;
  name: string;
  price: number;
}

interface UserStats extends User {
  bookingsCount: number;
  bookingsSum: number;
  paidSum: number;
  depositSum: number;
  bookings: BookingRow[];
  userPayments: PaymentRow[];
  utmSources: string[];
  displaySource: string | null;
  lastBookingDate: string | null;
  lastActivityDate: string;
  mainStatus: string;
  segment: 'b2b' | 'b2c';
  isLastBookingVoucher: boolean;
  b2bRequests: B2BRequest[];
  voucherRequests: VoucherRequest[];
}

type SortKey = 'name' | 'email' | 'created_at' | 'bookingsCount' | 'bookingsSum' | 'lastBookingDate' | 'lastActivityDate' | 'dateSum';
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
  else if (s.includes('chatgpt') || s.includes('openai')) { bg = '#143d2e'; color = '#7ae3b5'; }
  else if (s.includes('perplexity')) { bg = '#221a3d'; color = '#c4b5fd'; }
  else if (s.includes('claude')) { bg = '#3d2814'; color = '#fbbf77'; }
  else if (s.includes('copilot') || s.includes('gemini')) { bg = '#1a2d3d'; color = '#90caf9'; }
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

function getUserSegment(bookings: BookingRow[], manualSegment?: string | null): 'b2b' | 'b2c' {
  // Manual override takes priority
  if (manualSegment === 'b2b') return 'b2b';
  // Auto-detect from UTM
  for (const b of bookings) {
    const fields = [b.utm_source, b.utm_medium, b.utm_campaign].map(f => (f || '').toLowerCase());
    if (fields.some(f => f.includes('b2b'))) return 'b2b';
  }
  return 'b2c';
}

function getSegmentBadge(segment: 'b2b' | 'b2c', isVoucher?: boolean) {
  const base: React.CSSProperties = { display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 };
  const label = segment === 'b2b' ? 'B2B' : 'B2C';
  const bg = segment === 'b2b' ? '#e65100' : '#1565c0';
  const color = segment === 'b2b' ? '#fff' : '#fff';
  if (isVoucher) {
    return <span style={{ ...base, background: bg, color }}>{label} <span style={{ opacity: 0.7, fontWeight: 500 }}>V</span></span>;
  }
  return <span style={{ ...base, background: bg, color }}>{label}</span>;
}

// ─── Main Component ──────────────────────────────────────────
function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserStats[]>([]);
  const [packages, setPackages] = useState<Record<string, string>>({});
  const [paymentsByBooking, setPaymentsByBooking] = useState<Record<string, PaymentRow>>({});
  const [extraItemMap, setExtraItemMap] = useState<Record<string, ExtraItemInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasUtmColumns, setHasUtmColumns] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [utmFilter, setUtmFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [dateMode, setDateMode] = useState<string>("all");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>('lastActivityDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Expanded rows
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Edit mode (segment + source)
  const [segmentEditMode, setSegmentEditMode] = useState(false);
  const [segmentEdits, setSegmentEdits] = useState<Record<string, string>>({});
  const [sourceEdits, setSourceEdits] = useState<Record<string, string>>({});
  const [segmentSaving, setSegmentSaving] = useState(false);

  function setSegmentEdit(userId: string, value: string) {
    setSegmentEdits(prev => ({ ...prev, [userId]: value }));
  }
  function setSourceEdit(userId: string, value: string) {
    setSourceEdits(prev => ({ ...prev, [userId]: value }));
  }
  const editCount = new Set([...Object.keys(segmentEdits), ...Object.keys(sourceEdits)]).size;

  useEffect(() => {
    async function checkRole() {
      const email = typeof window !== "undefined" ? localStorage.getItem("admin_email") : null;
      if (!email) {
        router.replace("/admin/login");
        return;
      }
      const { data } = await supabase
        .from("admins")
        .select("role")
        .eq("email", email)
        .single();
      const r = (data as { role?: string } | null)?.role;
      if (!r || r !== "superadmin") {
        router.replace("/admin/bookings");
      }
    }
    checkRole();
  }, [router]);

  async function saveSegmentEdits() {
    const allIds = new Set([...Object.keys(segmentEdits), ...Object.keys(sourceEdits)]);
    if (allIds.size === 0) { setSegmentEditMode(false); return; }
    setSegmentSaving(true);
    setError("");
    let failed = 0;
    for (const userId of allIds) {
      const update: Record<string, string | null> = {};
      if (userId in segmentEdits) update.segment = segmentEdits[userId] === 'none' ? null : segmentEdits[userId];
      if (userId in sourceEdits) update.manual_source = sourceEdits[userId] || null;
      const { error } = await supabase.from('users').update(update).eq('id', userId);
      if (error) {
        if (error.message?.includes('segment') || error.message?.includes('manual_source')) {
          setError('Brakuje kolumn. Uruchom w Supabase SQL Editor:\n\nALTER TABLE users ADD COLUMN IF NOT EXISTS segment text DEFAULT NULL;\nALTER TABLE users ADD COLUMN IF NOT EXISTS manual_source text DEFAULT NULL;');
          setSegmentSaving(false);
          return;
        }
        failed++;
      }
    }
    setSegmentSaving(false);
    if (failed > 0) setError(`Nie udalo sie zapisac ${failed} zmian`);
    setSegmentEdits({});
    setSourceEdits({});
    setSegmentEditMode(false);
    fetchData();
  }

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

    const [usersResult, bookingsResult, packagesRes, paymentsResult, b2bResult, extraItemsRes, voucherResult] = await Promise.all([
      fetchAllRows<User>((from, to) =>
        supabase.from('users').select('*').order('created_at', { ascending: true }).range(from, to)
      ),
      fetchAllRows<BookingRow>((from, to) =>
        supabase.from('bookings').select(bookingsFields).order('created_at', { ascending: true }).range(from, to)
      ),
      supabase.from('packages').select('id, name').returns<PackageInfo[]>(),
      fetchAllRows<PaymentRow>((from, to) =>
        supabase.from('payments').select('id, booking_id, status, amount, created_at').order('created_at', { ascending: true }).range(from, to)
      ),
      supabase.from('b2b_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('extra_items').select('id, name, price'),
      supabase.from('voucher_requests').select('*').order('created_at', { ascending: false }),
    ]);

    if (usersResult.error) { setError("Blad ladowania uzytkownikow"); setLoading(false); return; }
    if (bookingsResult.error) { setError("Blad ladowania rezerwacji"); setLoading(false); return; }

    const pkgMap: Record<string, string> = {};
    (packagesRes.data || []).forEach(p => { pkgMap[p.id] = p.name; });
    setPackages(pkgMap);

    // Build extra items lookup
    const eiMap: Record<string, ExtraItemInfo> = {};
    for (const i of (extraItemsRes.data ?? []) as { id: string; name: string; price: number }[]) {
      eiMap[i.id] = { id: i.id, name: i.name, price: Number(i.price) };
    }
    setExtraItemMap(eiMap);

    // Group B2B requests by email
    const b2bByEmail: Record<string, B2BRequest[]> = {};
    for (const r of (b2bResult.data ?? []) as unknown as B2BRequest[]) {
      const email = r.email?.toLowerCase();
      if (!email) continue;
      if (!b2bByEmail[email]) b2bByEmail[email] = [];
      b2bByEmail[email].push(r);
    }

    // Group voucher requests by email
    const voucherByEmail: Record<string, VoucherRequest[]> = {};
    for (const r of (voucherResult.data ?? []) as unknown as VoucherRequest[]) {
      const email = r.email?.toLowerCase();
      if (!email) continue;
      if (!voucherByEmail[email]) voucherByEmail[email] = [];
      voucherByEmail[email].push(r);
    }

    // Map payments by booking_id (latest payment per booking)
    const pmtMap: Record<string, PaymentRow> = {};
    for (const p of paymentsResult.data) {
      if (p.booking_id) pmtMap[p.booking_id] = p;
    }
    setPaymentsByBooking(pmtMap);

    const bookingsByEmail: Record<string, BookingRow[]> = {};
    const bookingIdToEmail: Record<string, string> = {};
    for (const b of bookingsResult.data) {
      if (!bookingsByEmail[b.user_email]) bookingsByEmail[b.user_email] = [];
      bookingsByEmail[b.user_email].push(b);
      bookingIdToEmail[b.id] = b.user_email;
    }

    // Group ALL payments by user email
    const paymentsByEmail: Record<string, PaymentRow[]> = {};
    for (const p of paymentsResult.data) {
      const email = bookingIdToEmail[p.booking_id];
      if (!email) continue;
      if (!paymentsByEmail[email]) paymentsByEmail[email] = [];
      paymentsByEmail[email].push(p);
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
      // Latest booking created_at (when the booking/payment was actually made)
      const bookingCreatedDates = userBookings.map(b => b.created_at || '').filter(Boolean).sort();
      const latestBookingCreated = bookingCreatedDates.length > 0 ? bookingCreatedDates[bookingCreatedDates.length - 1] : '';
      // Include B2B requests in activity date
      const userB2bReqs = b2bByEmail[u.email.toLowerCase()] || [];
      const latestB2b = userB2bReqs.length > 0 ? userB2bReqs[0].created_at : '';
      // Include voucher requests in activity date
      const userVoucherReqs = voucherByEmail[u.email.toLowerCase()] || [];
      const latestVoucher = userVoucherReqs.length > 0 ? userVoucherReqs[0].created_at : '';
      let lastActivityDate = u.created_at || '';
      if (latestBookingCreated > lastActivityDate) lastActivityDate = latestBookingCreated;
      if (latestB2b > lastActivityDate) lastActivityDate = latestB2b;
      if (latestVoucher > lastActivityDate) lastActivityDate = latestVoucher;
      // Check if the most recent booking (by created_at) was free (voucher)
      const sortedByCreated = [...userBookings].sort((a, b) => ((b.created_at || '') > (a.created_at || '') ? 1 : -1));
      const lastBooking = sortedByCreated[0];
      const isLastBookingVoucher = lastBooking ? (Number(lastBooking.total_price) || 0) === 0 : false;
      return {
        ...u,
        bookingsCount: userBookings.length,
        bookingsSum: userBookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + (Number(b.total_price) || 0), 0),
        paidSum,
        depositSum,
        bookings: userBookings,
        userPayments: paymentsByEmail[u.email] || [],
        utmSources: Array.from(utmSet),
        displaySource: u.manual_source || (utmSet.size > 0 ? Array.from(utmSet)[0] : null),
        lastBookingDate: sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null,
        lastActivityDate,
        isLastBookingVoucher,
        mainStatus: getUserMainStatus(userBookings),
        segment: b2bByEmail[u.email.toLowerCase()]?.length ? 'b2b' as const : getUserSegment(userBookings, u.segment),
        b2bRequests: b2bByEmail[u.email.toLowerCase()] || [],
        voucherRequests: voucherByEmail[u.email.toLowerCase()] || [],
      };
    });

    // Add B2B-only leads (people who submitted B2B form but have no user record)
    const existingEmails = new Set(usersResult.data.map(u => u.email.toLowerCase()));
    for (const [email, reqs] of Object.entries(b2bByEmail)) {
      if (existingEmails.has(email)) continue;
      const firstReq = reqs[0];
      stats.push({
        id: `b2b-${firstReq.id}`,
        email: firstReq.email,
        name: firstReq.name,
        phone: firstReq.phone,
        created_at: firstReq.created_at,
        segment: 'b2b' as const,
        manual_source: null,
        bookingsCount: 0,
        bookingsSum: 0,
        paidSum: 0,
        depositSum: 0,
        bookings: [],
        userPayments: [],
        utmSources: [],
        displaySource: 'b2b',
        lastBookingDate: null,
        lastActivityDate: firstReq.created_at,
        isLastBookingVoucher: false,
        mainStatus: 'b2b_lead',
        b2bRequests: reqs,
        voucherRequests: voucherByEmail[email] || [],
      });
    }

    // Add voucher-only leads (submitted voucher form but no user record and no B2B)
    const coveredEmails = new Set([...Array.from(existingEmails), ...Object.keys(b2bByEmail)]);
    for (const [email, reqs] of Object.entries(voucherByEmail)) {
      if (coveredEmails.has(email)) continue;
      const firstReq = reqs[0];
      stats.push({
        id: `voucher-${firstReq.id}`,
        email: firstReq.email,
        name: firstReq.name,
        phone: firstReq.phone,
        created_at: firstReq.created_at,
        segment: 'b2c' as const,
        manual_source: null,
        bookingsCount: 0,
        bookingsSum: 0,
        paidSum: 0,
        depositSum: 0,
        bookings: [],
        userPayments: [],
        utmSources: [],
        displaySource: firstReq.utm_source || null,
        lastBookingDate: null,
        lastActivityDate: firstReq.created_at,
        isLastBookingVoucher: false,
        mainStatus: 'voucher_lead',
        b2bRequests: [],
        voucherRequests: reqs,
      });
    }

    setUsers(stats);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Delete User ────────────────────────────────────────
  async function handleDeleteUser(userId: string, email: string) {
    setError("");
    // Delete bookings first, then user
    const { error: bookErr } = await supabase.from('bookings').delete().eq('user_email', email);
    if (bookErr) { setError('Błąd usuwania rezerwacji: ' + bookErr.message); return; }
    const { error: userErr } = await supabase.from('users').delete().eq('id', userId);
    if (userErr) { setError('Błąd usuwania klienta: ' + userErr.message); return; }
    fetchData();
  }

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
        const isCancelled = b.status === 'cancelled';
        const revenuePrice = isCancelled ? 0 : price;
        totalBookings++; totalRevenue += revenuePrice;

        if (b.status === 'paid') { paidCount++; paidRevenue += price; }
        else if (b.status === 'deposit') { depositCount++; depositRevenue += price; }
        else if (b.status === 'pending') { pendingCount++; pendingRevenue += price; }
        else if (isCancelled) { cancelledCount++; }

        const src = b.utm_source || null;
        if (!src) { directCount++; directRevenue += revenuePrice; }
        else {
          if (!bySource[src]) bySource[src] = { count: 0, revenue: 0, paid: 0, deposit: 0, pending: 0, cancelled: 0 };
          bySource[src].count++; bySource[src].revenue += revenuePrice;
          if (b.status === 'paid') bySource[src].paid++;
          else if (b.status === 'deposit') bySource[src].deposit++;
          else if (b.status === 'pending') bySource[src].pending++;
          else if (b.status === 'cancelled') bySource[src].cancelled++;
        }
        const med = b.utm_medium || null;
        if (med) {
          if (!byMedium[med]) byMedium[med] = { count: 0, revenue: 0 };
          byMedium[med].count++; byMedium[med].revenue += revenuePrice;
        }
        const camp = b.utm_campaign || null;
        if (camp) {
          if (!byCampaign[camp]) byCampaign[camp] = { count: 0, revenue: 0 };
          byCampaign[camp].count++; byCampaign[camp].revenue += revenuePrice;
        }
      }
    }
    return { bySource, byMedium, byCampaign, directCount, directRevenue, totalBookings, totalRevenue, paidCount, paidRevenue, depositCount, depositRevenue, pendingCount, pendingRevenue, cancelledCount };
  }, [users]);

  // ─── Date-filtered paid sum per user (last payment if no filter) ─
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const dateSumFrom = dateFrom || '';
  const dateSumTo = dateTo || '';
  const hasDateFilter = !!(dateFrom || dateTo);

  function getUserDateSum(u: UserStats): number {
    if (hasDateFilter) {
      return u.userPayments
        .filter(p => {
          const pDate = (p.created_at || '').slice(0, 10);
          if (dateSumFrom && pDate < dateSumFrom) return false;
          if (dateSumTo && pDate > dateSumTo) return false;
          return true;
        })
        .reduce((sum, p) => sum + Number(p.amount) / 100, 0);
    }
    // No date filter — show last payment amount
    if (u.userPayments.length === 0) return 0;
    const sorted = [...u.userPayments].sort((a, b) => ((b.created_at || '') > (a.created_at || '') ? 1 : -1));
    return Number(sorted[0].amount) / 100;
  }

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
    if (segmentFilter !== 'all') result = result.filter(u => u.segment === segmentFilter);
    if (dateFrom || dateTo) {
      result = result.filter(u => {
        if (dateMode === 'all') {
          const hasBooking = u.bookings.some(b => {
            if (dateFrom && b.date < dateFrom) return false;
            if (dateTo && b.date > dateTo) return false;
            return true;
          });
          const hasB2b = u.b2bRequests.some(r => {
            if (dateFrom && r.date_from < dateFrom) return false;
            if (dateTo && r.date_from > dateTo) return false;
            return true;
          });
          const hasPaid = u.userPayments.some(p => {
            const d = (p.created_at || '').slice(0, 10);
            if (dateFrom && d < dateFrom) return false;
            if (dateTo && d > dateTo) return false;
            return true;
          });
          const hasB2bCreated = u.b2bRequests.some(r => {
            const d = (r.created_at || '').slice(0, 10);
            if (dateFrom && d < dateFrom) return false;
            if (dateTo && d > dateTo) return false;
            return true;
          });
          const hasVoucherCreated = u.voucherRequests.some(r => {
            const d = (r.created_at || '').slice(0, 10);
            if (dateFrom && d < dateFrom) return false;
            if (dateTo && d > dateTo) return false;
            return true;
          });
          return hasBooking || hasB2b || hasPaid || hasB2bCreated || hasVoucherCreated;
        } else if (dateMode === 'booking') {
          // Booking date OR B2B requested date range
          const hasBooking = u.bookings.some(b => {
            if (dateFrom && b.date < dateFrom) return false;
            if (dateTo && b.date > dateTo) return false;
            return true;
          });
          const hasB2b = u.b2bRequests.some(r => {
            if (dateFrom && r.date_from < dateFrom) return false;
            if (dateTo && r.date_from > dateTo) return false;
            return true;
          });
          return hasBooking || hasB2b;
        } else if (dateMode === 'paid') {
          return u.userPayments.some(p => {
            const d = (p.created_at || '').slice(0, 10);
            if (dateFrom && d < dateFrom) return false;
            if (dateTo && d > dateTo) return false;
            return true;
          });
        } else if (dateMode === 'b2b_created') {
          // b2b_created — when B2B form was submitted
          return u.b2bRequests.some(r => {
            const d = (r.created_at || '').slice(0, 10);
            if (dateFrom && d < dateFrom) return false;
            if (dateTo && d > dateTo) return false;
            return true;
          });
        } else {
          // voucher_created — when voucher form was submitted
          return u.voucherRequests.some(r => {
            const d = (r.created_at || '').slice(0, 10);
            if (dateFrom && d < dateFrom) return false;
            if (dateTo && d > dateTo) return false;
            return true;
          });
        }
      });
    }
    return result;
  }, [users, search, utmFilter, statusFilter, segmentFilter, dateFrom, dateTo, dateMode]);

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
        case 'lastActivityDate': aVal = a.lastActivityDate; bVal = b.lastActivityDate; break;
        case 'dateSum': aVal = getUserDateSum(a); bVal = getUserDateSum(b); break;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sortKey, sortDir, dateSumFrom, dateSumTo]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [search, utmFilter, statusFilter, segmentFilter, dateFrom, dateTo, pageSize]);

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
    let csv = BOM + 'Email;Imie;Telefon;Segment;Data rejestracji;Rezerwacje;Oplacone;Zaliczki;Suma (PLN);Zrodla UTM;Ostatnia aktywnosc\n';
    sorted.forEach(u => {
      const paid = u.bookings.filter(b => b.status === 'paid').length;
      const dep = u.bookings.filter(b => b.status === 'deposit').length;
      const seg = u.segment === 'b2b' ? 'B2B' : u.segment === 'b2c' ? 'B2C' : '';
      csv += `${u.email};${u.name || ''};${u.phone || ''};${seg};${u.created_at ? u.created_at.slice(0, 10) : ''};${u.bookingsCount};${paid};${dep};${u.bookingsSum.toFixed(2)};${u.utmSources.join(', ') || 'direct'};${u.lastActivityDate ? u.lastActivityDate.slice(0, 10) : ''}\n`;
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
        .admin-dp .react-datepicker-wrapper { width: 100%; }
        .admin-dp-input { background: #18171c; color: #fff; border: 2px solid #333; border-radius: 8px; padding: 7px 12px; font-size: 14px; font-weight: 500; outline: none; width: 100%; transition: border-color 0.15s; }
        .admin-dp-input:focus { border-color: #f36e21; }
        .admin-dp .react-datepicker { background: #18171c; border-color: #f36e21; color: #fff; font-family: inherit; }
        .admin-dp .react-datepicker__header { background: #23222a; border-color: #3a3840; }
        .admin-dp .react-datepicker__current-month,
        .admin-dp .react-datepicker__day-name { color: #ff9f58; }
        .admin-dp .react-datepicker__day { color: #fff; }
        .admin-dp .react-datepicker__day:hover { background: #f36e21aa; color: #fff; }
        .admin-dp .react-datepicker__day--selected,
        .admin-dp .react-datepicker__day--in-selecting-range,
        .admin-dp .react-datepicker__day--in-range { background: #f36e21 !important; color: #fff !important; }
        .admin-dp .react-datepicker__day--keyboard-selected { background: rgba(243,110,33,0.4); }
        .admin-dp .react-datepicker__day--disabled { color: #555 !important; }
        .admin-dp .react-datepicker__navigation-icon::before { border-color: #ff9f58; }
        .admin-dp .react-datepicker__close-icon::after { background-color: #f36e21; }
        .admin-dp .react-datepicker__triangle { display: none; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 100, color: '#f36e21', margin: 0 }}>Klienci i Analityka</h1>
          <p style={{ fontSize: 14, color: '#888', margin: '4px 0 0' }}>Oplacone, zaliczki, zrodla ruchu (Google / TikTok / Facebook), UTM, rezerwacje</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!segmentEditMode ? (
            <button onClick={() => setSegmentEditMode(true)} style={{ background: '#5c6bc0', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Edytuj dane
            </button>
          ) : (
            <>
              <button onClick={saveSegmentEdits} disabled={segmentSaving || editCount === 0} style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 14, cursor: segmentSaving ? 'not-allowed' : 'pointer' }}>
                {segmentSaving ? 'Zapisywanie...' : `Zapisz (${editCount})`}
              </button>
              <button onClick={() => { setSegmentEditMode(false); setSegmentEdits({}); setSourceEdits({}); }} style={{ background: '#23222a', color: '#fff', border: '2px solid #5c6bc0', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Anuluj
              </button>
            </>
          )}
          <button onClick={exportCSV} style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaFileExport size={14} /> Eksportuj CSV
          </button>
        </div>
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
        <div style={{ ...cardStyle, borderLeft: '3px solid #e65100' }}>
          <span style={{ ...labelStyle, color: '#ff9800' }}>B2B</span>
          <span style={{ ...valueStyle, color: '#e65100' }}>{users.filter(u => u.segment === 'b2b').length}</span>
        </div>
        <div style={{ ...cardStyle, borderLeft: '3px solid #1565c0' }}>
          <span style={{ ...labelStyle, color: '#64b5f6' }}>B2C</span>
          <span style={{ ...valueStyle, color: '#1565c0' }}>{users.filter(u => u.segment === 'b2c').length}</span>
        </div>
        <div style={{ ...cardStyle, borderLeft: '3px solid #4caf50' }}>
          <span style={{ ...labelStyle, color: '#a5d6a7' }}>Suma (filtered)</span>
          <span style={{ ...valueStyle, color: '#4caf50' }}>{filtered.reduce((s, u) => s + u.bookingsSum, 0).toFixed(0)}</span>
          <span style={{ fontSize: 11, color: '#a5d6a7' }}>PLN</span>
        </div>
        <div style={{ ...cardStyle, borderLeft: '3px solid #ff9800' }}>
          <span style={{ ...labelStyle, color: '#ffcc80' }}>{hasDateFilter ? 'Opl. okres' : 'Ost. opl.'}</span>
          <span style={{ ...valueStyle, color: '#ff9800' }}>{filtered.reduce((s, u) => s + getUserDateSum(u), 0).toFixed(0)}</span>
          <span style={{ fontSize: 11, color: '#ffcc80' }}>PLN</span>
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
        <select value={segmentFilter} onChange={e => setSegmentFilter(e.target.value)} style={{ ...inputStyle, minWidth: 110 }}>
          <option value="all">B2B / B2C</option>
          <option value="b2b">B2B</option>
          <option value="b2c">B2C</option>
        </select>
        <select value={dateMode} onChange={e => setDateMode(e.target.value)} style={{ ...inputStyle, minWidth: 150 }}>
          <option value="all">Wszystkie daty</option>
          <option value="booking">Rezerwacja / B2B na</option>
          <option value="paid">Oplacono w</option>
          <option value="b2b_created">Zapytanie B2B w</option>
          <option value="voucher_created">Zapytanie voucher w</option>
        </select>
        <div className="admin-dp" style={{ minWidth: 200 }}>
          <DatePicker
            selectsRange
            startDate={dateRange[0]}
            endDate={dateRange[1]}
            onChange={(update: [Date | null, Date | null]) => {
              setDateRange(update);
              setDateFrom(update[0] ? update[0].toISOString().slice(0, 10) : '');
              setDateTo(update[1] ? update[1].toISOString().slice(0, 10) : '');
            }}
            isClearable
            placeholderText="Wybierz daty..."
            dateFormat="dd.MM.yyyy"
            locale="pl"
            className="admin-dp-input"
          />
        </div>
        {(search || utmFilter !== 'all' || statusFilter !== 'all' || segmentFilter !== 'all' || dateFrom || dateTo) && (
          <button onClick={() => { setSearch(''); setUtmFilter('all'); setStatusFilter('all'); setSegmentFilter('all'); setDateFrom(''); setDateTo(''); setDateRange([null, null]); setDateMode('all'); }} style={{ background: 'transparent', color: '#f36e21', border: '1px solid #f36e21', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
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
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100 }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 36 }}></th>
                  <th style={thStyle} onClick={() => handleSort('email')}>Email <SortIcon col="email" /></th>
                  <th style={thStyle} onClick={() => handleSort('name')}>Imie <SortIcon col="name" /></th>
                  <th style={{ ...thStyle }}>Telefon</th>
                  <th style={{ ...thStyle }}>Segment</th>
                  <th style={thStyle} onClick={() => handleSort('created_at')}>Rejestracja <SortIcon col="created_at" /></th>
                  <th style={thStyle} onClick={() => handleSort('bookingsCount')}>Rez. <SortIcon col="bookingsCount" /></th>
                  <th style={{ ...thStyle }}>Status</th>
                  <th style={thStyle} onClick={() => handleSort('bookingsSum')}>Suma <SortIcon col="bookingsSum" /></th>
                  <th style={thStyle} onClick={() => handleSort('dateSum')}>{hasDateFilter ? 'Opl. okres' : 'Ost. opl.'} <SortIcon col="dateSum" /></th>
                  <th style={{ ...thStyle }}>Zrodlo</th>
                  <th style={thStyle} onClick={() => handleSort('lastActivityDate')}>Aktywnosc <SortIcon col="lastActivityDate" /></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(u => (
                  <UserRow key={u.id} user={u} isExpanded={expandedIds.has(u.id)} onToggle={() => toggleExpand(u.id)} packages={packages} paymentsByBooking={paymentsByBooking} extraItemMap={extraItemMap} segmentEditMode={segmentEditMode} segmentEditValue={segmentEdits[u.id]} onSegmentChange={(val) => setSegmentEdit(u.id, val)} sourceEditValue={sourceEdits[u.id]} onSourceChange={(val) => setSourceEdit(u.id, val)} onDelete={handleDeleteUser} dateSumFrom={dateSumFrom} dateSumTo={dateSumTo} setUsers={setUsers} />
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

// ─── Source Edit Cell (dropdown + custom input) ─────────────
const SOURCE_PRESETS = ['google', 'facebook', 'tiktok', 'direct'];

function SourceEditCell({ currentValue, onChange }: { currentValue: string; onChange: (val: string) => void }) {
  const isPreset = SOURCE_PRESETS.includes(currentValue.toLowerCase());
  const [customMode, setCustomMode] = useState(!isPreset && currentValue !== '');

  const selectStyle: React.CSSProperties = { background: '#18171c', color: '#fff', border: '2px solid #5c6bc0', borderRadius: 6, padding: '2px 6px', fontSize: 12, fontWeight: 700, cursor: 'pointer', width: 110 };

  if (customMode) {
    return (
      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
        <input
          type="text"
          value={currentValue}
          onChange={e => onChange(e.target.value)}
          onClick={e => e.stopPropagation()}
          autoFocus
          placeholder="wpisz..."
          style={{ ...selectStyle, width: 80 }}
        />
        <button onClick={e => { e.stopPropagation(); setCustomMode(false); onChange(''); }} style={{ background: 'none', border: 'none', color: '#5c6bc0', cursor: 'pointer', fontSize: 14, padding: '0 2px' }} title="Wybierz z listy">✕</button>
      </div>
    );
  }

  return (
    <select
      value={isPreset ? currentValue.toLowerCase() : '__custom'}
      onChange={e => {
        e.stopPropagation();
        if (e.target.value === '__custom') {
          setCustomMode(true);
          onChange(currentValue);
        } else {
          onChange(e.target.value);
        }
      }}
      onClick={e => e.stopPropagation()}
      style={selectStyle}
    >
      <option value="">—</option>
      <option value="google">Google</option>
      <option value="facebook">Facebook</option>
      <option value="tiktok">TikTok</option>
      <option value="direct">Direct</option>
      <option value="__custom">Inne...</option>
    </select>
  );
}

// ─── User Row ──────────────────────────────────────────────
const B2B_SERVICE_LABELS: Record<string, string> = {
  team_building: 'Team Building',
  corporate_events: 'Imprezy Firmowe',
  integration: 'Integracja Zespołu',
};

const B2B_STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  new: { label: 'Nowe', bg: '#1565c0', color: '#90caf9' },
  in_progress: { label: 'W toku', bg: '#e65100', color: '#ffcc80' },
  completed: { label: 'Zakończone', bg: '#1b5e20', color: '#a5d6a7' },
  rejected: { label: 'Odrzucone', bg: '#b71c1c', color: '#ef9a9a' },
};

const VOUCHER_PACKAGE_LABELS: Record<string, string> = {
  easy: 'BUŁKA Z MASŁEM',
  medium: 'ŁATWY',
  hard: 'ŚREDNI',
  extreme: 'TRUDNY',
};

const VOUCHER_STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  new: { label: 'Nowe', bg: '#1565c0', color: '#90caf9' },
  in_progress: { label: 'W toku', bg: '#e65100', color: '#ffcc80' },
  completed: { label: 'Zakończone', bg: '#1b5e20', color: '#a5d6a7' },
  rejected: { label: 'Odrzucone', bg: '#b71c1c', color: '#ef9a9a' },
};

function UserRow({ user, isExpanded, onToggle, packages, paymentsByBooking, extraItemMap, segmentEditMode, segmentEditValue, onSegmentChange, sourceEditValue, onSourceChange, onDelete, dateSumFrom, dateSumTo, setUsers }: { user: UserStats; isExpanded: boolean; onToggle: () => void; packages: Record<string, string>; paymentsByBooking: Record<string, PaymentRow>; extraItemMap: Record<string, ExtraItemInfo>; segmentEditMode: boolean; segmentEditValue?: string; onSegmentChange: (val: string) => void; sourceEditValue?: string; onSourceChange: (val: string) => void; onDelete: (userId: string, email: string) => Promise<void>; dateSumFrom: string; dateSumTo: string; setUsers: React.Dispatch<React.SetStateAction<UserStats[]>> }) {
  const tdStyle: React.CSSProperties = { padding: '10px 12px', fontSize: 13 };
  const paidCount = user.bookings.filter(b => b.status === 'paid').length;
  const depositCount = user.bookings.filter(b => b.status === 'deposit').length;
  const pendingCount = user.bookings.filter(b => b.status === 'pending').length;
  const cancelledCount = user.bookings.filter(b => b.status === 'cancelled').length;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
        <td style={{ ...tdStyle, fontWeight: 700, color: '#f36e21', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span>
            {segmentEditMode && (
              <button
                onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
                title="Usuń klienta"
                style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
              >
                Usuń
              </button>
            )}
          </div>
        </td>
        <td style={tdStyle}>{user.name || <span style={{ color: '#555' }}>-</span>}</td>
        <td style={tdStyle}>{user.phone || <span style={{ color: '#555' }}>-</span>}</td>
        <td style={tdStyle}>
          {segmentEditMode ? (
            <select
              value={segmentEditValue ?? user.segment}
              onChange={e => { e.stopPropagation(); onSegmentChange(e.target.value); }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#18171c', color: '#fff', border: '2px solid #5c6bc0', borderRadius: 6, padding: '2px 6px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              <option value="b2c">B2C</option>
              <option value="b2b">B2B</option>
            </select>
          ) : getSegmentBadge(user.segment, user.isLastBookingVoucher)}
        </td>
        <td style={{ ...tdStyle, color: '#aaa', fontSize: 12 }}>{user.created_at ? user.created_at.slice(0, 10) : '-'}</td>
        <td style={{ ...tdStyle, fontWeight: 700 }}>{user.bookingsCount}</td>
        <td style={tdStyle}>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
            {paidCount > 0 && <span style={{ background: '#1b5e20', color: '#a5d6a7', padding: '1px 5px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{paidCount}o</span>}
            {depositCount > 0 && <span style={{ background: '#e65100', color: '#ffcc80', padding: '1px 5px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{depositCount}z</span>}
            {pendingCount > 0 && <span style={{ background: '#f9a825', color: '#fff8e1', padding: '1px 5px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{pendingCount}p</span>}
            {cancelledCount > 0 && <span style={{ background: '#b71c1c', color: '#ef9a9a', padding: '1px 5px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{cancelledCount}a</span>}
            {user.b2bRequests.length > 0 && <span style={{ background: '#6a1b9a', color: '#ce93d8', padding: '1px 5px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>B2B</span>}
            {user.voucherRequests.length > 0 && <span style={{ background: '#0d47a1', color: '#90caf9', padding: '1px 5px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{user.voucherRequests.length}V</span>}
            {paidCount === 0 && depositCount === 0 && pendingCount === 0 && cancelledCount === 0 && user.b2bRequests.length === 0 && user.voucherRequests.length === 0 && (
              <span style={{ color: '#555', fontSize: 11 }}>-</span>
            )}
          </div>
        </td>
        <td style={{ ...tdStyle, fontWeight: 700, color: '#4caf50' }}>{user.bookingsSum.toFixed(0)} zl</td>
        <td style={{ ...tdStyle, fontWeight: 700, color: '#ff9f58' }}>{(() => {
          const ds = user.userPayments
            .filter(p => { const d = (p.created_at || '').slice(0, 10); return d >= dateSumFrom && d <= dateSumTo; })
            .reduce((sum, p) => sum + Number(p.amount) / 100, 0);
          return ds > 0 ? `${ds.toFixed(0)} zl` : <span style={{ color: '#555' }}>0</span>;
        })()}</td>
        <td style={tdStyle}>
          {segmentEditMode ? (
            <SourceEditCell currentValue={sourceEditValue ?? user.displaySource ?? ''} onChange={onSourceChange} />
          ) : (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {user.displaySource && user.displaySource.toLowerCase() !== 'direct' ? <span>{getUtmBadge(user.displaySource)}</span> : (user.utmSources.length === 0 || user.displaySource?.toLowerCase() === 'direct' ? <span style={{ color: '#555', fontSize: 11 }}>direct</span> : user.utmSources.map(s => <span key={s}>{getUtmBadge(s)}</span>))}
            </div>
          )}
        </td>
        <td style={{ ...tdStyle, color: '#aaa', fontSize: 12 }}>{user.lastActivityDate ? user.lastActivityDate.slice(0, 10) : '-'}</td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={12} style={{ padding: 0, background: '#1e1e26' }}>
            <div style={{ padding: '12px 20px 16px 52px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ff9f58', marginBottom: 8 }}>Rezerwacje klienta: <span style={{ color: '#f36e21', wordBreak: 'break-all' }}>{user.email}</span> ({user.bookings.length})</div>
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
                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>Opłacono</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.bookings.map(b => {
                        const utmParts: string[] = [];
                        if (b.utm_source) utmParts.push(`utm_source=${b.utm_source}`);
                        if (b.utm_medium) utmParts.push(`utm_medium=${b.utm_medium}`);
                        if (b.utm_campaign) utmParts.push(`utm_campaign=${b.utm_campaign}`);
                        if (b.utm_term) utmParts.push(`utm_term=${b.utm_term}`);
                        if (b.utm_content) utmParts.push(`utm_content=${b.utm_content}`);
                        const landingUrl = b.landing_page
                          ? `${b.landing_page}${utmParts.length > 0 ? '?' + utmParts.join('&') : ''}`
                          : utmParts.length > 0 ? `/?${utmParts.join('&')}` : null;
                        return (
                        <React.Fragment key={b.id}>
                        <tr style={{ borderBottom: landingUrl ? 'none' : '1px solid #2a2a2f' }}>
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
                          <td style={{ padding: '6px 8px', fontSize: 11 }}>{(() => {
                            const pmt = paymentsByBooking[b.id];
                            if (!pmt) return <span style={{ color: '#555' }}>-</span>;
                            return <span style={{ color: pmt.status === 'paid' ? '#4caf50' : '#ff9800' }}>{pmt.created_at ? pmt.created_at.slice(0, 16).replace('T', ' ') : '-'}</span>;
                          })()}</td>
                        </tr>
                        {landingUrl && (
                          <tr style={{ borderBottom: '1px solid #2a2a2f' }}>
                            <td colSpan={11} style={{ padding: '2px 8px 6px', fontSize: 11 }}>
                              <span
                                style={{ color: '#777', marginRight: 6, cursor: 'help', borderBottom: '1px dotted #555' }}
                                title="To nie jest dokładny link z reklamy ani kliknięcia. To zapisana przy rezerwacji ścieżka (landing) z bazy + parametry UTM z bazy — złożone do podglądu. Rzeczywisty URL z kampanii mógł zawierać np. gclid i inne parametry, których tu nie widać."
                              >
                                Podgląd atrybucji:
                              </span>
                              <code style={{ color: '#7986cb', background: '#1a1a2e', padding: '1px 6px', borderRadius: 4, fontSize: 10, wordBreak: 'break-all' }}>{landingUrl}</code>
                              {b.referrer && (
                                <div style={{ marginTop: 4, color: '#666', fontSize: 10 }}>
                                  <span style={{ color: '#555' }}>Referrer: </span>
                                  <span style={{ wordBreak: 'break-all' }}>{b.referrer}</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                        </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── B2B Requests ── */}
              {user.b2bRequests.length > 0 && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ff9f58', marginTop: 16, marginBottom: 8 }}>
                    Zapytania B2B: <span style={{ color: '#e65100' }}>{user.b2bRequests.length}</span>
                  </div>
                  {user.b2bRequests.map(req => {
                    const st = B2B_STATUS_LABELS[req.status] || { label: req.status, bg: '#333', color: '#aaa' };
                    const extrasText = (req.extra_items || [])
                      .filter(ei => ei.count > 0)
                      .map(ei => `${extraItemMap[ei.id]?.name ?? ei.id} ×${ei.count}`)
                      .join(', ');
                    return (
                      <div key={req.id} style={{ background: '#23222a', borderRadius: 8, padding: '10px 14px', marginBottom: 8, border: '1px solid #2a2a2f' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: '#aaa' }}>{req.created_at ? req.created_at.slice(0, 16).replace('T', ' ') : '-'}</span>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <select
                              value={req.status}
                              onClick={e => e.stopPropagation()}
                              onChange={async e => {
                                e.stopPropagation();
                                const newStatus = e.target.value;
                                const { error } = await supabase.from('b2b_requests').update({ status: newStatus }).eq('id', req.id);
                                if (!error) {
                                  req.status = newStatus;
                                  setUsers(prev => [...prev]);
                                }
                              }}
                              style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, border: 'none', cursor: 'pointer', outline: 'none' }}
                            >
                              {Object.entries(B2B_STATUS_LABELS).map(([val, s]) => (
                                <option key={val} value={val} style={{ background: '#23222a', color: '#fff' }}>{s.label}</option>
                              ))}
                            </select>
                            <button
                              onClick={async e => {
                                e.stopPropagation();
                                if (!window.confirm(`Usunąć zapytanie B2B od ${req.name}?`)) return;
                                const { error } = await supabase.from('b2b_requests').delete().eq('id', req.id);
                                if (!error) {
                                  setUsers(prev => prev.map(u => ({
                                    ...u,
                                    b2bRequests: u.b2bRequests.filter(r => r.id !== req.id),
                                  })));
                                }
                              }}
                              style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: '#4a1111', color: '#ff4d4f', border: 'none', cursor: 'pointer' }}
                            >Usuń</button>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '4px 16px', fontSize: 12 }}>
                          <div><span style={{ color: '#888' }}>Imię:</span> <span style={{ color: '#ccc' }}>{req.name}</span></div>
                          <div><span style={{ color: '#888' }}>Telefon:</span> <span style={{ color: '#ccc' }}>{req.phone}</span></div>
                          <div><span style={{ color: '#888' }}>Usługa:</span> <span style={{ color: '#ccc' }}>{B2B_SERVICE_LABELS[req.service] ?? req.service}</span></div>
                          <div><span style={{ color: '#888' }}>Osoby:</span> <span style={{ color: '#ccc' }}>{req.people}</span></div>
                          <div><span style={{ color: '#888' }}>Termin:</span> <span style={{ color: '#ccc' }}>{req.date_from}{req.date_to ? ` — ${req.date_to}` : ''}</span></div>
                          <div><span style={{ color: '#888' }}>Przychód:</span> <span style={{ color: '#4caf50', fontWeight: 700 }}>{req.estimated_revenue} PLN</span></div>
                          {extrasText && <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#888' }}>Dodatki:</span> <span style={{ color: '#ccc' }}>{extrasText}</span></div>}
                          {req.message && <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#888' }}>Wiadomość:</span> <span style={{ color: '#ccc' }}>{req.message}</span></div>}
                          <div><span style={{ color: '#888' }}>Źródło:</span> {req.utm_source ? getUtmBadge(req.utm_source) : <span style={{ color: '#555' }}>-</span>}</div>
                          <div><span style={{ color: '#888' }}>Medium:</span> <span style={{ color: '#aaa' }}>{req.utm_medium || '-'}</span></div>
                          <div><span style={{ color: '#888' }}>Kampania:</span> <span style={{ color: '#aaa', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', verticalAlign: 'bottom' }}>{req.utm_campaign || '-'}</span></div>
                          <div><span style={{ color: '#888' }}>Utworzono:</span> <span style={{ color: '#666', fontSize: 11 }}>{req.created_at ? req.created_at.slice(0, 16).replace('T', ' ') : '-'}</span></div>
                          {(() => {
                            const utmParts: string[] = [];
                            if (req.utm_source) utmParts.push(`utm_source=${req.utm_source}`);
                            if (req.utm_medium) utmParts.push(`utm_medium=${req.utm_medium}`);
                            if (req.utm_campaign) utmParts.push(`utm_campaign=${req.utm_campaign}`);
                            if (req.utm_term) utmParts.push(`utm_term=${req.utm_term}`);
                            if (req.utm_content) utmParts.push(`utm_content=${req.utm_content}`);
                            const landingUrl = req.landing_page
                              ? `${req.landing_page}${utmParts.length > 0 ? '?' + utmParts.join('&') : ''}`
                              : utmParts.length > 0 ? `/?${utmParts.join('&')}` : null;
                            if (!landingUrl && !req.referrer) return null;
                            return (
                              <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
                                {landingUrl && (
                                  <div>
                                    <span style={{ color: '#777', marginRight: 6, borderBottom: '1px dotted #555', cursor: 'help', fontSize: 11 }} title="Podgląd atrybucji: landing + UTM z bazy">Podgląd atrybucji:</span>
                                    <code style={{ color: '#7986cb', background: '#1a1a2e', padding: '1px 6px', borderRadius: 4, fontSize: 10, wordBreak: 'break-all' }}>{landingUrl}</code>
                                  </div>
                                )}
                                {req.referrer && (
                                  <div style={{ marginTop: 2, fontSize: 10, color: '#666' }}>
                                    <span style={{ color: '#555' }}>Referrer: </span>
                                    <span style={{ wordBreak: 'break-all' }}>{req.referrer}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* ── Voucher Requests ── */}
              {user.voucherRequests.length > 0 && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ff9f58', marginTop: 16, marginBottom: 8 }}>
                    Zamówienia vouchera: <span style={{ color: '#1565c0' }}>{user.voucherRequests.length}</span>
                  </div>
                  {user.voucherRequests.map(req => {
                    const st = VOUCHER_STATUS_LABELS[req.status] || { label: req.status, bg: '#333', color: '#aaa' };
                    return (
                      <div key={req.id} style={{ background: '#23222a', borderRadius: 8, padding: '10px 14px', marginBottom: 8, border: '1px solid #2a2a2f' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: '#aaa' }}>{req.created_at ? req.created_at.slice(0, 16).replace('T', ' ') : '-'}</span>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <select
                              value={req.status}
                              onClick={e => e.stopPropagation()}
                              onChange={async e => {
                                e.stopPropagation();
                                const newStatus = e.target.value;
                                const { error } = await supabase.from('voucher_requests').update({ status: newStatus }).eq('id', req.id);
                                if (!error) {
                                  req.status = newStatus;
                                  setUsers(prev => [...prev]);
                                }
                              }}
                              style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, border: 'none', cursor: 'pointer', outline: 'none' }}
                            >
                              {Object.entries(VOUCHER_STATUS_LABELS).map(([val, s]) => (
                                <option key={val} value={val} style={{ background: '#23222a', color: '#fff' }}>{s.label}</option>
                              ))}
                            </select>
                            <button
                              onClick={async e => {
                                e.stopPropagation();
                                if (!window.confirm(`Usunąć zamówienie vouchera od ${req.name}?`)) return;
                                const { error } = await supabase.from('voucher_requests').delete().eq('id', req.id);
                                if (!error) {
                                  setUsers(prev => prev.map(u => ({
                                    ...u,
                                    voucherRequests: u.voucherRequests.filter(r => r.id !== req.id),
                                  })));
                                }
                              }}
                              style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: '#4a1111', color: '#ff4d4f', border: 'none', cursor: 'pointer' }}
                            >Usuń</button>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '4px 16px', fontSize: 12 }}>
                          <div><span style={{ color: '#888' }}>Imię:</span> <span style={{ color: '#ccc' }}>{req.name}</span></div>
                          <div><span style={{ color: '#888' }}>Telefon:</span> <span style={{ color: '#ccc' }}>{req.phone}</span></div>
                          <div><span style={{ color: '#888' }}>Pakiet:</span> <span style={{ color: '#ccc' }}>{VOUCHER_PACKAGE_LABELS[req.package] ?? req.package}</span></div>
                          {req.message && <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#888' }}>Wiadomość:</span> <span style={{ color: '#ccc' }}>{req.message}</span></div>}
                          <div><span style={{ color: '#888' }}>Źródło:</span> {req.utm_source ? getUtmBadge(req.utm_source) : <span style={{ color: '#555' }}>-</span>}</div>
                          <div><span style={{ color: '#888' }}>Medium:</span> <span style={{ color: '#aaa' }}>{req.utm_medium || '-'}</span></div>
                          <div><span style={{ color: '#888' }}>Kampania:</span> <span style={{ color: '#aaa', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', verticalAlign: 'bottom' }}>{req.utm_campaign || '-'}</span></div>
                          <div><span style={{ color: '#888' }}>Utworzono:</span> <span style={{ color: '#666', fontSize: 11 }}>{req.created_at ? req.created_at.slice(0, 16).replace('T', ' ') : '-'}</span></div>
                          {(() => {
                            const utmParts: string[] = [];
                            if (req.utm_source) utmParts.push(`utm_source=${req.utm_source}`);
                            if (req.utm_medium) utmParts.push(`utm_medium=${req.utm_medium}`);
                            if (req.utm_campaign) utmParts.push(`utm_campaign=${req.utm_campaign}`);
                            if (req.utm_term) utmParts.push(`utm_term=${req.utm_term}`);
                            if (req.utm_content) utmParts.push(`utm_content=${req.utm_content}`);
                            const landingUrl = req.landing_page
                              ? `${req.landing_page}${utmParts.length > 0 ? '?' + utmParts.join('&') : ''}`
                              : utmParts.length > 0 ? `/?${utmParts.join('&')}` : null;
                            if (!landingUrl && !req.referrer) return null;
                            return (
                              <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
                                {landingUrl && (
                                  <div>
                                    <span style={{ color: '#777', marginRight: 6, borderBottom: '1px dotted #555', cursor: 'help', fontSize: 11 }} title="Podgląd atrybucji: landing + UTM z bazy">Podgląd atrybucji:</span>
                                    <code style={{ color: '#7986cb', background: '#1a1a2e', padding: '1px 6px', borderRadius: 4, fontSize: 10, wordBreak: 'break-all' }}>{landingUrl}</code>
                                  </div>
                                )}
                                {req.referrer && (
                                  <div style={{ marginTop: 2, fontSize: 10, color: '#666' }}>
                                    <span style={{ color: '#555' }}>Referrer: </span>
                                    <span style={{ wordBreak: 'break-all' }}>{req.referrer}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </td>
        </tr>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setConfirmDelete(false)}
        >
          <div
            style={{ background: '#23222a', border: '2px solid #ff4d4f', borderRadius: 14, padding: '28px 32px', maxWidth: 400, width: '90%', boxShadow: '0 8px 40px #000a', textAlign: 'center' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: '#ff4d4f', marginBottom: 12 }}>Usunąć klienta?</div>
            <div style={{ color: '#ccc', fontSize: 14, marginBottom: 6 }}>{user.email}</div>
            <div style={{ color: '#aaa', fontSize: 13, marginBottom: 20 }}>
              Zostaną usunięte wszystkie rezerwacje tego klienta ({user.bookingsCount}).
              <br />Ta operacja jest nieodwracalna.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={async () => { setDeleting(true); await onDelete(user.id, user.email); setDeleting(false); setConfirmDelete(false); }}
                disabled={deleting}
                style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 15, fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer' }}
              >
                {deleting ? 'Usuwanie...' : 'Tak, usuń'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ background: '#18171c', color: '#fff', border: '2px solid #555', borderRadius: 8, padding: '10px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default withAdminAuth(UsersPage);
