"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import React from 'react';
import { withAdminAuth } from '../components/withAdminAuth';
import { FaTrash, FaMoneyBillWave } from 'react-icons/fa';
import dayjs from "dayjs";
import { pl }  from 'date-fns/locale/pl';

registerLocale('pl', pl);

// Интерфейсы для типизации
interface Booking {
  id: string;
  user_email: string;
  name?: string;
  package_id: string;
  room_id: string;
  date: string;
  time: string;
  time_end?: string;
  status?: string;
  comment?: string;
  phone?: string;
  total_price?: string;
  payment_id?: string;
  promo_code?: string;
  created_at?: string;
  updated_at?: string;
  extra_items?: object | null;
  change_token?: string;
  payments?: Payment[];
  // Manual-booking fields (B2B/B2C ad-hoc reservations)
  num_people?: number | null;
  source?: 'b2c' | 'b2b' | 'walkin' | 'manual' | null;
  duration_minutes?: number | null;
  deposit_amount?: number | null;
  admin_note?: string | null;
}

type BookingMode = 'package' | 'manual';
interface Room {
  id: string;
  name: string;
}
interface PackageMap {
  [id: string]: string;
}
interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  discount_amount?: number | null;
  valid_from?: string | null;
  valid_to?: string | null;
  usage_limit?: number | null;
  used_count?: number | null;
  time_from?: string | null;
  time_to?: string | null;
}
interface Payment {
  id: string;
  booking_id: string;
  status: 'paid' | 'deposit' | 'unpaid';
  amount: number;
  transaction_id?: string;
  created_at: string;
}

interface BookingWithPackage {
  id: string;
  room_id: string;
  date: string;
  time: string;
  duration_minutes?: number | null;
  package: { duration: number; cleanup_time?: number | null } | null;
};

function overlaps(aStart: dayjs.Dayjs, aEnd: dayjs.Dayjs, bStart: dayjs.Dayjs, bEnd: dayjs.Dayjs) {
  // End is exclusive: if one ends exactly when other starts -> no overlap.
  return aStart.isBefore(bEnd) && bStart.isBefore(aEnd);
}

// Генерация времени с шагом 15 минут с 09:00 до 21:00
function generateTimeSlots(start: string, end: string, stepMinutes: number) {
  const result: string[] = [];
  let [h, m] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  while (h < endH || (h === endH && m <= endM)) {
    result.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    m += stepMinutes;
    if (m >= 60) { h++; m -= 60; }
  }
  return result;
}

const GODZINY = generateTimeSlots("09:00", "21:00", 15);
// Wider slot list for manual bookings (B2B may run before/after working hours)
const MANUAL_TIME_SLOTS = generateTimeSlots("08:00", "23:45", 15);

// Функция для выбора цвета по статусу
function getStatusColor(status?: string) {
  switch (status) {
    case 'paid':
      return 'bg-green-200 border-green-400 text-green-900';
    case 'pending':
      return 'bg-yellow-100 border-yellow-400 text-yellow-900';
    case 'cancelled':
      return 'bg-red-200 border-red-400 text-red-900';
    case 'deposit':
      return 'bg-blue-200 border-blue-400 text-blue-900';
    default:
      return 'bg-gray-200 border-gray-400 text-gray-900';
  }
}

function normalizeBookingTotal(rawTotal: number, paymentsSum: number) {
  if (!Number.isFinite(rawTotal)) return 0;
  if (paymentsSum > 0) {
    const asPln = rawTotal;
    const asPlnFromCents = rawTotal / 100;
    if (Math.abs(asPlnFromCents - paymentsSum) <= 1 && asPln > paymentsSum * 20) {
      return asPlnFromCents;
    }
  }
  return rawTotal;
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'paid': return 'Opłacono';
    case 'deposit': return 'Zaliczka';
    case 'pending': return 'Oczekuje';
    case 'cancelled': return 'Anulowano';
    default: return status;
  }
}

function getStatusDotColor(status: string): string {
  switch (status) {
    case 'paid': return 'bg-green-500';
    case 'deposit': return 'bg-blue-500';
    case 'pending': return 'bg-yellow-500';
    case 'cancelled': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

function formatPaymentDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

// Варианты статусов оплаты
const STATUS_OPTIONS = [
  { value: 'paid', label: 'paid' },
  { value: 'pending', label: 'pending' },
  { value: 'cancelled', label: 'cancelled' },
  { value: 'deposit', label: 'deposit' },
];

// 1. Определяю тип Package

type Package = {
  id: string;
  name: string;
  allowed_rooms: string[];
  room_priority: string[];
  duration: number; // в минутах
  cleanup_time?: number; // в минутах
  // Добавьте другие поля, если они используются
};

// Возвращает текущую дату/время в зоне Europe/Warsaw
function getPolandDate(): Date {
  const now = new Date();
  const polandString = now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' });
  return new Date(polandString);
}

// Преобразует строку 'YYYY-MM-DD' в Date в зоне Europe/Warsaw
function parsePolandDate(str: string): Date {
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Возвращает YYYY-MM-DD для даты в зоне Europe/Warsaw
function formatDatePoland(date: Date): string {
  const poland = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }));
  const year = poland.getFullYear();
  const month = (poland.getMonth() + 1).toString().padStart(2, '0');
  const day = poland.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function EmailInfoTooltip() {
  const [show, setShow] = useState(false);
  return (
    <span style={{position:'relative', display:'inline-block', marginLeft:6}}>
      <span
        style={{
          cursor:'pointer',
          color:'#f36e21',
          fontWeight:700,
          fontSize:13,
          verticalAlign:'top',
        }}
        onMouseEnter={()=>setShow(true)}
        onMouseLeave={()=>setShow(false)}
      >ℹ️</span>
      {show && (
        <span style={{
          position:'absolute',
          left:'50%',
          top:'120%',
          transform:'translateX(-50%)',
          background:'#333',
          color:'#fff',
          border:'1px solid #f36e21',
          borderRadius:8,
          padding:'10px 16px',
          fontSize:14,
          whiteSpace:'pre-line',
          zIndex:100,
          minWidth:200,
          maxWidth:260,
          boxShadow:'0 4px 24px #000a',
          textAlign:'center'
        }}>
          Wyślij ponownie e-mail z potwierdzeniem rezerwacji do klienta. E-mail zostanie wysłany na podany adres. Wszystkie pola formularza muszą zostać wypełnione.
        </span>
      )}
    </span>
  );
}

function BookingsPage() {
  const [date, setDate] = useState<Date>(getPolandDate());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [packages, setPackages] = useState<PackageMap>({});
  const [packageDurations, setPackageDurations] = useState<{[id: string]: number}>({});
  const [packageCleanupTimes, setPackageCleanupTimes] = useState<{[id: string]: number}>({});
  const [loading, setLoading] = useState(true);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [editForm, setEditForm] = useState<Booking | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extraItemMap, setExtraItemMap] = useState<{ [id: string]: string }>({});
  const [newExtraItem, setNewExtraItem] = useState<{id: string, count: number}>({id: '', count: 1});
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [packagePrices, setPackagePrices] = useState<{[id: string]: number}>({});
  const [extraItemPrices, setExtraItemPrices] = useState<{[id: string]: number}>({});
  const emptyBooking: Booking = {
    id: '',
    user_email: '',
    name: '',
    package_id: '',
    room_id: '',
    date: '',
    time: '',
    status: 'pending',
    phone: '',
    total_price: '',
    payment_id: '',
    promo_code: '',
    created_at: '',
    updated_at: '',
    extra_items: [],
    num_people: null,
    source: null,
    duration_minutes: null,
    deposit_amount: null,
    admin_note: null,
  };
  const [isNew, setIsNew] = useState(false);
  const [mode, setMode] = useState<BookingMode>('package');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [datesCache, setDatesCache] = useState<{[packageId: string]: string[]}>({});
  const [timesCache, setTimesCache] = useState<{[key: string]: string[]}>({});
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [promoError, setPromoError] = useState(false);
  const [isHoliday, setHoliday] = useState(false);
  const [reconcileRange, setReconcileRange] = useState<[Date | null, Date | null]>([null, null]);
  const reconcileFrom = reconcileRange[0];
  const reconcileTo = reconcileRange[1];
  const [reconcileLoading, setReconcileLoading] = useState(false);
  const [reconcileStatus, setReconcileStatus] = useState<string | null>(null);

  // Effective duration / cleanup for a booking — manual bookings store
  // their full span in duration_minutes (no separate cleanup); package
  // bookings derive from packages table.
  function getBookingSpan(b: { duration_minutes?: number | null; package_id?: string | null }) {
    if (b.duration_minutes && b.duration_minutes > 0) {
      return { duration: Number(b.duration_minutes), cleanup: 0 };
    }
    const pkgId = b.package_id || '';
    return {
      duration: Number(packageDurations[pkgId]) || 60,
      cleanup: Number(packageCleanupTimes[pkgId]) || 15,
    };
  }

  function getBookingLabel(b: Booking): string {
    if (b.package_id && packages[b.package_id]) return packages[b.package_id];
    const sourceLabels: Record<string, string> = {
      b2c: 'B2C',
      b2b: 'B2B',
      walkin: 'Walk-in',
      manual: 'Ręczna',
    };
    if (b.source && sourceLabels[b.source]) {
      const peopleSuffix = b.num_people ? ` · ${b.num_people} os.` : '';
      return `${sourceLabels[b.source]}${peopleSuffix}`;
    }
    return 'Ręczna';
  }

  // Загружаем даты с резервациями и extra items
  useEffect(() => {
    async function fetchBookedDates() {
      const allDates: string[] = [];
      let offset = 0;
      const PAGE_SIZE = 1000;
      while (true) {
        const { data } = await supabase
          .from('bookings')
          .select('date')
          .range(offset, offset + PAGE_SIZE - 1)
          .returns<{ date: string }[]>();
        if (!data || data.length === 0) break;
        allDates.push(...data.map(b => b.date));
        if (data.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
      }
      const uniqueDates = Array.from(new Set(allDates));
      setBookedDates(uniqueDates.map(d => new Date(d)));
      // Загружаем extra items
      const { data: extraItems } = await supabase
        .from('extra_items')
        .select('id, name')
        .returns<{ id: string; name: string }[]>();
      if (extraItems) {
        setExtraItemMap(Object.fromEntries(extraItems.map((ei) => [ei.id, ei.name])));
      }
    }
    fetchBookedDates();
  }, []);

  useEffect(() => {
    async function fetchData() {
    setLoading(true);
      // Получаем комнаты
      const { data: roomsData } = await supabase.from('rooms').select('id, name');
      setRooms((roomsData as Room[]) || []);
      // Получаем пакеты
      const { data: packagesData } = await supabase.from('packages').select('id, name, duration, cleanup_time, price');
      setPackages(Object.fromEntries(((packagesData as {id: string, name: string, duration: number, cleanup_time?: number, price?: number}[])||[]).map((p) => [p.id, p.name])));
      setPackageDurations(Object.fromEntries(((packagesData as {id: string, duration: number}[])||[]).map((p) => [p.id, p.duration || 60])));
      setPackageCleanupTimes(Object.fromEntries(((packagesData as {id: string, cleanup_time?: number}[])||[]).map((p) => [p.id, p.cleanup_time ?? 15])));
      setPackagePrices(Object.fromEntries(((packagesData as {id: string, price?: number}[])||[]).map((p) => [p.id, Number(p.price) || 0])));
      // Получаем бронирования на выбранную дату
      const dateStr = formatDatePoland(date);
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          payments (
            id,
            status,
            amount,
            transaction_id,
            created_at
          )
        `)
        .eq('date', dateStr)
        .returns<Booking[]>();
      setBookings(bookingsData || []);
      setLoading(false);
    }
    fetchData();
  }, [date]);

  function getBooking(roomId: string, hour: string, date: string) {
    // hour теперь полный формат, например 09:15
    return bookings.filter(b => b.room_id === roomId && b.time.slice(0,5) === hour && b.date === date);
  }

  function openModal(booking: Booking) {
    setEditForm({
      ...booking,
      change_token: booking.change_token || '',
    });
    // Auto-detect mode: bookings with `source` or no package_id are manual
    const detectedMode: BookingMode =
      booking.source || booking.duration_minutes || !booking.package_id ? 'manual' : 'package';
    setMode(detectedMode);
    setModalOpen(true);
    setError(null);
    if (detectedMode === 'package' && booking.package_id) {
      fetchPackageDetails(booking.package_id);
      setLoadingDates(true);
      setLoadingTimes(true);
      Promise.all([
        fetchAvailableDatesCached(booking.package_id),
        booking.date ? fetchAvailableTimesCached(booking.package_id, booking.date) : setAvailableTimes([])
      ]).finally(() => {
        setLoadingDates(false);
        setLoadingTimes(false);
      });
    }
  }
  function closeModal() {
    setModalOpen(false);
    setEditForm(null);
    setError(null);
    setIsNew(false);
    setMode('package');
  }

  function openNewModal() {
    setEditForm({ ...emptyBooking, date: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })() });
    setIsNew(true);
    setMode('package');
    setModalOpen(true);
    setError(null);
    if (emptyBooking.package_id) {
      fetchPackageDetails(emptyBooking.package_id);
      setLoadingDates(true);
      setLoadingTimes(true);
      Promise.all([
        fetchAvailableDatesCached(emptyBooking.package_id),
        emptyBooking.date ? fetchAvailableTimesCached(emptyBooking.package_id, emptyBooking.date) : setAvailableTimes([])
      ]).finally(() => {
        setLoadingDates(false);
        setLoadingTimes(false);
      });
    }
  }

  // Close modal on ESC
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  // Получение пакета с allowed_rooms и room_priority
  async function fetchPackageDetails(packageId: string) {
    const { data } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single()
      .returns<Package>();
    setSelectedPackage(data ?? null);
  }

  // Получение доступных дат
  async function fetchAvailableDatesCached(packageId: string) {
    if (datesCache[packageId]) {
      setAvailableDates(datesCache[packageId]);
      return;
    }
    setLoadingDates(true);
    const today = new Date();
    const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const end = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());
    const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    const res = await fetch('/api/booking/available-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId, startDate, endDate })
    });
    const data = await res.json();
    setAvailableDates(data.dates || []);
    setDatesCache(prev => ({ ...prev, [packageId]: data.dates || [] }));
    setLoadingDates(false);
  }

  // Получение доступных времен
  async function fetchAvailableTimesCached(packageId: string, date: string): Promise<string[]> {
    const key = packageId + '_' + date;
    if (timesCache[key]) {
      setAvailableTimes(timesCache[key]);
      return timesCache[key];
    }
    setLoadingTimes(true);
    const res = await fetch('/api/booking/check-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId, date })
    });
    const data = await res.json();
    setAvailableTimes(data.times || []);
    setTimesCache(prev => ({ ...prev, [key]: data.times || [] }));
    setLoadingTimes(false);
    return data.times || [];
  }

  // Обработка выбора пакета
  function handlePackageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    handleChange(e);
    const packageId = e.target.value;
    if (packageId) {
      fetchPackageDetails(packageId);
      setLoadingDates(true);
      setLoadingTimes(true);
      Promise.all([
        fetchAvailableDatesCached(packageId),
        setAvailableTimes([])
      ]).finally(() => {
        setLoadingDates(false);
        setLoadingTimes(false);
      });
      setEditForm(prev => prev ? { ...prev, package_id: packageId, date: '', time: '' } : prev);
    } else {
      setSelectedPackage(null);
      setAvailableDates([]);
      setAvailableTimes([]);
    }
  }

  // Обработка выбора даты
  function handleDateChange(date: Date | null) {
    if (!editForm || !selectedPackage) return;
    setEditForm(prev => prev ? { ...prev, date: date ? formatDatePoland(date) : '', time: '' } : prev);
    if (date && editForm.package_id) {
      setLoadingTimes(true);
      fetchAvailableTimesCached(editForm.package_id, formatDatePoland(date)).finally(() => setLoadingTimes(false));
    } else {
      setAvailableTimes([]);
    }
  }

  // Обработка выбора времени
  function handleTimeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setEditForm(prev => prev ? { ...prev, time: e.target.value } : prev);
  }

  async function refreshBookingsForDate(dateStr: string) {
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select(`
        *,
        payments (
          id,
          status,
          amount,
          transaction_id,
          created_at
        )
      `)
      .eq('date', dateStr)
      .returns<Booking[]>();
    setBookings(bookingsData || []);
    setDatesCache({});
    setTimesCache({});
  }

  async function handleSaveManual() {
    if (!editForm) return false;
    if (!editForm.source) {
      setError('Wybierz źródło rezerwacji (B2B, B2C lub Walk-in)');
      return false;
    }
    if (!editForm.room_id) {
      setError('Wybierz pokój');
      return false;
    }
    if (!editForm.date || !editForm.time) {
      setError('Wybierz datę i godzinę');
      return false;
    }
    const duration = Number(editForm.duration_minutes) || 0;
    if (!duration || duration < 15) {
      setError('Podaj czas trwania — minimum 15 minut');
      return false;
    }
    if (duration > 720) {
      setError('Czas trwania nie może przekraczać 720 minut (12 godzin)');
      return false;
    }

    if (isNew) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const res = await fetch('/api/admin/booking/create-manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.user_email,
          phone: editForm.phone,
          room_id: editForm.room_id,
          date: editForm.date,
          time: editForm.time,
          duration_minutes: duration,
          num_people: editForm.num_people,
          source: editForm.source,
          total_price: editForm.total_price,
          deposit_amount: editForm.deposit_amount,
          status: editForm.status,
          admin_note: editForm.admin_note,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Błąd zapisu rezerwacji ręcznej');
        return false;
      }
      return true;
    }

    // Edit existing manual booking — local conflict check + direct supabase update
    const targetStart = dayjs(`${editForm.date} ${editForm.time}`);
    const targetEnd = targetStart.add(duration, 'm');
    const { data: dayBookings, error: fetchErr } = await supabase
      .from('bookings')
      .select(`
        id,
        room_id,
        date,
        time,
        duration_minutes,
        package:package_id (duration, cleanup_time)
      `)
      .eq('room_id', editForm.room_id)
      .eq('date', editForm.date)
      .neq('status', 'cancelled')
      .neq('id', editForm.id)
      .returns<BookingWithPackage[] & { duration_minutes?: number | null }[]>();
    if (fetchErr) {
      setError('Błąd sprawdzania dostępności');
      return false;
    }
    const conflict = (dayBookings || []).some((b) => {
      const bRow = b as unknown as BookingWithPackage & { duration_minutes?: number | null };
      const bStart = dayjs(`${bRow.date} ${bRow.time}`);
      let span: number;
      if (bRow.duration_minutes && bRow.duration_minutes > 0) {
        span = Number(bRow.duration_minutes);
      } else if (bRow.package?.duration) {
        span = Number(bRow.package.duration) + Number(bRow.package.cleanup_time ?? 15);
      } else {
        span = 60;
      }
      const bEnd = bStart.add(span, 'm');
      return overlaps(targetStart, targetEnd, bStart, bEnd);
    });
    if (conflict) {
      setError('Pokój zajęty w wybranym oknie czasowym');
      return false;
    }

    const totalPrice = Number(editForm.total_price) || 0;
    const depositValue = Number(editForm.deposit_amount) || 0;
    const submittedStatus = editForm.status || 'pending';

    // Intended paid amount drives both DB status and payment row creation.
    // If admin set status=paid but didn't fill deposit, treat full price as paid.
    let intendedPaid = depositValue;
    if (submittedStatus === 'paid' && intendedPaid < totalPrice) {
      intendedPaid = totalPrice;
    }
    let effectiveStatus: string = submittedStatus;
    if (intendedPaid > 0 && totalPrice > 0) {
      effectiveStatus = intendedPaid >= totalPrice ? 'paid' : 'deposit';
    } else if (submittedStatus === 'paid' && totalPrice === 0) {
      effectiveStatus = 'paid';
    }

    const updatePayload = {
      user_email: editForm.user_email,
      name: editForm.name,
      phone: editForm.phone,
      room_id: editForm.room_id,
      date: editForm.date,
      time: editForm.time,
      duration_minutes: duration,
      num_people: editForm.num_people ?? null,
      source: editForm.source || null,
      total_price: totalPrice,
      deposit_amount: depositValue > 0 ? depositValue : null,
      status: effectiveStatus,
      admin_note: editForm.admin_note || null,
    };
    const { error: updateErr } = await supabase
      .from('bookings')
      .update(updatePayload)
      .eq('id', editForm.id);
    if (updateErr) {
      setError('Błąd zapisu: ' + updateErr.message);
      return false;
    }

    // Sync payment rows so the calendar's auto-derived status matches.
    if (intendedPaid > 0) {
      const { data: existingPayments } = await supabase
        .from('payments')
        .select('amount, status')
        .eq('booking_id', editForm.id)
        .returns<{ amount: number; status: string }[]>();
      const validPayments = (existingPayments || []).filter(
        (p) => p.status === 'paid' || p.status === 'deposit',
      );
      const paymentsSum = validPayments.reduce(
        (sum, p) => sum + Number(p.amount) / 100,
        0,
      );
      const shortfall = intendedPaid - paymentsSum;
      if (shortfall > 0.01) {
        const paymentStatus = intendedPaid >= totalPrice && totalPrice > 0 ? 'paid' : 'deposit';
        await supabase.from('payments').insert([
          {
            booking_id: editForm.id,
            status: paymentStatus,
            amount: Math.round(shortfall * 100),
            transaction_id: `manual-edit-${editForm.id.slice(0, 8)}-${Date.now()}`,
          },
        ]);
      }
    }

    return true;
  }

  // --- При сохранении вычисляем room_id автоматически ---
  async function handleSave() {
    if (!editForm) return;
    setSaving(true);
    setError(null);

    // Manual booking branch
    if (mode === 'manual') {
      const ok = await handleSaveManual();
      if (ok) {
        const dateStr = editForm.date;
        closeModal();
        setIsNew(false);
        await refreshBookingsForDate(dateStr);
      }
      setSaving(false);
      return;
    }

    let roomId = editForm.room_id || '';

    // При изменении/создании брони пересчитываем room_id и проверяем конфликты,
    // иначе бронь может "пропасть" из проверки доступности и будет двойная запись.
    if (selectedPackage && editForm.package_id && editForm.date && editForm.time) {
      const allowedRooms: string[] = selectedPackage.allowed_rooms || [];
      const basePriority: string[] =
        selectedPackage.room_priority && selectedPackage.room_priority.length > 0
          ? selectedPackage.room_priority
          : allowedRooms;
      const roomPriority: string[] = basePriority.filter((id) => allowedRooms.includes(id));
      const orderedRooms =
        !isNew && editForm.room_id && roomPriority.includes(editForm.room_id)
          ? [editForm.room_id, ...roomPriority.filter((id) => id !== editForm.room_id)]
          : roomPriority;

      // Подтягиваем duration/cleanup_time пакета (на случай, если данные в selectedPackage устарели)
      const { data: pkg, error: pkgErr } = await supabase
        .from('packages')
        .select('duration, cleanup_time')
        .eq('id', selectedPackage.id)
        .single()
        .returns<{ duration: number; cleanup_time: number | null }>();

      if (pkgErr || !pkg) {
        setError('Nie udało się pobrać danych pakietu');
        setSaving(false);
        return;
      }

      const durationMinutes = Number(pkg.duration) || 60;
      const cleanupMinutes = Number(pkg.cleanup_time) || 15;

      const targetStart = dayjs(`${editForm.date} ${editForm.time}`);
      const targetEnd = targetStart.add(durationMinutes + cleanupMinutes, 'm');

      let bookingQuery = supabase
        .from('bookings')
        .select(`
          id,
          room_id,
          date,
          time,
          status,
          duration_minutes,
          package:package_id (duration, cleanup_time)
        `)
        .in('room_id', orderedRooms)
        .eq('date', editForm.date)
        .neq('status', 'cancelled');

      // При редактировании исключаем текущую бронь из проверок
      if (!isNew && editForm.id) {
        bookingQuery = bookingQuery.neq('id', editForm.id);
      }

      const { data: getBookings, error: getBookingError } = await bookingQuery.returns<BookingWithPackage[]>();
      if (getBookingError) {
        setError('Błąd sprawdzania dostępności (rezerwacje)');
        setSaving(false);
        return;
      }

      let selectedRoomId = '';
      for (const roomIdT of orderedRooms) {
        const bookingsForRoom = (getBookings || []).filter((b) => b.room_id === roomIdT);
        const conflict = bookingsForRoom.some((b: BookingWithPackage) => {
          const bStart = dayjs(`${b.date} ${b.time}`);
          let bSpan: number;
          if (b.duration_minutes && b.duration_minutes > 0) {
            bSpan = Number(b.duration_minutes);
          } else if (b.package?.duration) {
            bSpan = Number(b.package.duration) + Number(b.package.cleanup_time ?? 15);
          } else {
            bSpan = durationMinutes + cleanupMinutes;
          }
          const bEnd = bStart.add(bSpan, 'm');
          return overlaps(targetStart, targetEnd, bStart, bEnd);
        });

        if (!conflict) {
          selectedRoomId = roomIdT;
          break;
        }
      }

      if (!selectedRoomId) {
        setError('Brak dostępnych pokoi na wybraną datę i godzinę');
        setSaving(false);
        return;
      }

      roomId = selectedRoomId;
    }

    if (isNew) {
      const { user_email, name, package_id, date, time, status, phone, total_price, payment_id, promo_code, extra_items, comment } = editForm;
      const { error } = await supabase.from('bookings').insert([{ user_email, name, package_id, room_id: roomId, date, time, status, phone, total_price: Number(total_price), payment_id, promo_code, extra_items, comment }]);
      if (error) {
        setError('Błąd zapisu: ' + error.message);
      } else {
        closeModal();
        setIsNew(false);
        const dateStr = (editForm.date || (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })());
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`
            *,
            payments (
              id,
              status,
              amount,
              transaction_id,
              created_at
            )
          `)
          .eq('date', dateStr)
          .returns<Booking[]>();
        setBookings(bookingsData || []);
        setDatesCache({});
        setTimesCache({});
      }
    } else {
      const { id, payments: _payments, ...fields } = editForm;
      const { error } = await supabase.from('bookings').update({ ...fields, room_id: roomId }).eq('id', id);
      if (error) {
        setError('Błąd zapisu: ' + error.message);
      } else {
        closeModal();
        const dateStr = editForm.date;
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`
            *,
            payments (
              id,
              status,
              amount,
              transaction_id,
              created_at
            )
          `)
          .eq('date', dateStr)
          .returns<Booking[]>();
        setBookings(bookingsData || []);
        setDatesCache({});
        setTimesCache({});
      }
    }
    setSaving(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setEditForm(prev => prev ? { ...prev, [name]: value } : prev);
  }

  // Обработка изменения/добавления/удаления extra items
  function handleExtraItemChange(idx: number, field: 'id' | 'count', value: string) {
    if (!editForm) return;
    const items: {id: string, count?: number}[] = Array.isArray(editForm.extra_items) ? [...editForm.extra_items] : [];
    if (field === 'count') items[idx][field] = Number(value);
    else items[idx][field] = value;
    setEditForm(prev => prev ? { ...prev, extra_items: items } : prev);
  }
  function handleExtraItemAdd() {
    if (!editForm || !newExtraItem.id) return;
    const items: {id: string, count?: number}[] = Array.isArray(editForm.extra_items) ? [...editForm.extra_items] : [];
    items.push({ id: newExtraItem.id, count: newExtraItem.count });
    setEditForm(prev => prev ? { ...prev, extra_items: items } : prev);
    setNewExtraItem({ id: '', count: 1 });
  }
  function handleExtraItemRemove(idx: number) {
    if (!editForm) return;
    const items: {id: string, count?: number}[] = Array.isArray(editForm.extra_items) ? [...editForm.extra_items] : [];
    items.splice(idx, 1);
    setEditForm(prev => prev ? { ...prev, extra_items: items } : prev);
  }

  // Загружаем promo_codes, цены пакетов и extra_items
  useEffect(() => {
    async function fetchAll() {
      // promo_codes
      const { data: promoData } = await supabase
        .from('promo_codes')
        .select('*')
        .returns<PromoCode[]>();
      if (promoData) setPromoCodes(promoData);
      // extra item prices
      const { data: extraData } = await supabase
        .from('extra_items')
        .select('id, price')
        .returns<{ id: string; price: number }[]>();
      if (extraData) setExtraItemPrices(Object.fromEntries(extraData.map((ei) => [ei.id, Number(ei.price)])));
    }
    fetchAll();
  }, []);

  // --- Автоматический пересчет цены (только в режиме пакета) ---
  useEffect(() => {
    async function recalc() {
      if (!editForm) return;
      if (mode !== 'package') return;
      let total = 0;
      // Цена пакета
      if (editForm.package_id && packagePrices[editForm.package_id]) {
        total += packagePrices[editForm.package_id];
      }
      // Цена дополнительных предметов
      if (Array.isArray(editForm.extra_items)) {
        for (const ei of editForm.extra_items) {
          if (ei.id && extraItemPrices[ei.id]) {
            total += extraItemPrices[ei.id] * (ei.count || 1);
          }
        }
      }
      // Применяем промокод через API, если выбран
      if (editForm.promo_code) {
        const promo = promoCodes.find(p => p.code === editForm.promo_code);
        if (promo) {
          // Проверяем через API (как на клиенте)
          const res = await fetch('/api/booking/check-promo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: promo.code, total, time: editForm.time, date: editForm.date  })
        });
        const data = await res.json();
          if (data.valid) {
            total = data.newTotal;
            setPromoError(false);
          } else {
            setEditForm(prev => prev ? { ...prev, promo_code: '' } : prev);
            setPromoError(data.message)
          }
        }
      }
      setEditForm(prev => prev ? { ...prev, total_price: total.toFixed(2) } : prev);
    }
    recalc();
  // eslint-disable-next-line
  }, [editForm?.package_id, editForm?.extra_items, editForm?.promo_code, mode]);

  useEffect(() => {
    async function fetch() {
      // .single() returns 406 when no rows -> use maybeSingle() to avoid console noise
      const { data: holidaysData } = await supabase
        .from('holidays')
        .select('date')
        .eq('date', dayjs(date).format('YYYY-MM-DD'))
        .maybeSingle();
      setHoliday(!!holidaysData?.date);
    }
    fetch();
  }, [date]);

  async function updateHoliday(isHoliday: boolean) {
    if (isHoliday) {
        await supabase.from('holidays').insert([{ date: dayjs(date).format('YYYY-MM-DD') }]);
      } else {
        await supabase.from('holidays').delete().eq('date', dayjs(date).format('YYYY-MM-DD'));
    }
    setHoliday(isHoliday);
  }

  async function handleSendEmail() {
    if (!editForm) return;
    setEmailStatus(null);
    setEmailSending(true);
    try {
      const packageName = packages[editForm.package_id] || '';
      const cancelLink = editForm.change_token
        ? `${process.env.NEXT_PUBLIC_BASE_URL || 'https://smashandfun.pl'}/booking/change?token=${editForm.change_token}`
        : undefined;
      const payload = {
        to: editForm.user_email,
        booking: {
          date: editForm.date,
          time: editForm.time,
          package: packageName,
          name: editForm.name || '',
          phone: editForm.phone || '',
          extra_items: editForm.extra_items || [],
          cancel_link: cancelLink,
        },
        type: 'new',
      };
      const res = await fetch('/api/sendBookingEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEmailStatus('E-mail został wysłany!');
      } else {
        setEmailStatus('Błąd wysyłki e-maila');
      }
    } catch {
      setEmailStatus('Błąd wysyłki e-maila');
    }
    setEmailSending(false);
  }

  async function handleDelete() {
    if (!editForm) return;
    if (!window.confirm('Czy na pewno chcesz usunąć tę rezerwację?')) return;
    setSaving(true);
    setError(null);
    const { id } = editForm;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) {
      setError('Błąd usuwania: ' + error.message);
    } else {
      closeModal();
      const dateStr = editForm.date;
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          payments (
            id,
            status,
            amount,
            transaction_id,
            created_at
          )
        `)
        .eq('date', dateStr)
        .returns<Booking[]>();
      setBookings(bookingsData || []);
      setDatesCache({});
      setTimesCache({});
    }
    setSaving(false);
  }

  async function handleDeletePayments() {
    if (!editForm) return;
    if (!window.confirm('Czy na pewno chcesz usunąć wszystkie płatności tej rezerwacji?')) return;
    setSaving(true);
    setError(null);
    const { id } = editForm;
    const { error } = await supabase.from('payments').delete().eq('booking_id', id);
    if (error) {
      setError('Błąd usuwania: ' + error.message);
    } else {
      closeModal();
      const dateStr = editForm.date;
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          payments (
            id,
            status,
            amount,
            transaction_id,
            created_at
          )
        `)
        .eq('date', dateStr)
        .returns<Booking[]>();
      setBookings(bookingsData || []);
    }
    setSaving(false);
  }

  async function handleManualReconcile() {
    setReconcileStatus(null);
    setReconcileLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const payload = {
        fromDate: reconcileFrom ? formatDatePoland(reconcileFrom) : undefined,
        toDate: reconcileTo ? formatDatePoland(reconcileTo) : undefined,
      };
      const res = await fetch('/api/payu/reconcile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReconcileStatus(data?.error || 'Błąd sprawdzania płatności');
      } else {
        const checked = Array.isArray(data?.checked) ? data.checked.length : 0;
        const updated = Array.isArray(data?.updated) ? data.updated.length : 0;
        setReconcileStatus(`Sprawdzono: ${checked}, zaktualizowano: ${updated}`);
      }
    } catch {
      setReconcileStatus('Błąd sprawdzania płatności');
    } finally {
      setReconcileLoading(false);
    }
  }

  return (
    <div className="p-4" style={{ background: '#f7f7fa', minHeight: '100vh' }}>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold text-gray-100">Kalendarz rezerwacji</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gray-700">Sprawdź płatności:</span>
          <div className="relative z-30">
          <DatePicker
            selectsRange
            startDate={reconcileFrom}
            endDate={reconcileTo}
            onChange={(update: [Date | null, Date | null]) => setReconcileRange(update)}
            dateFormat="dd.MM.yyyy"
            className="border rounded px-2 py-1 bg-white text-gray-900 w-[210px]"
            locale="pl"
            placeholderText="Wybierz daty..."
            isClearable
          />
          </div>
          <button
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold disabled:opacity-50"
            onClick={handleManualReconcile}
            type="button"
            disabled={reconcileLoading}
          >
            {reconcileLoading ? 'Sprawdzanie...' : 'Sprawdź płatności'}
          </button>
          <button
            className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700 font-semibold"
            onClick={openNewModal}
            type="button"
          >
            Dodaj rezerwację
          </button>
        </div>
      </div>
      {reconcileStatus && (
        <div className="mb-3 text-sm text-gray-700">{reconcileStatus}</div>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-4 relative z-20">
        <span className="text-gray-700 relative">Data
          {loading && (
            <span className="absolute -right-5 top-1/2 -translate-y-1/2 animate-spin inline-block w-4 h-4 border-2 border-t-transparent border-gray-500 rounded-full ml-2"></span>
          )}
        :</span>
        <div className="relative">
        <DatePicker
          selected={date}
          onChange={d => d && setDate(d)}
          dateFormat="yyyy-MM-dd"
          className="border rounded px-2 py-1 bg-white text-gray-900"
          locale="pl"
          highlightDates={bookedDates}
        />
        </div>

        <label style={{display:'flex',alignItems:'center',gap:4}}>
          <input
            type="checkbox"
            checked={isHoliday}
            onChange={() => updateHoliday(!isHoliday)} /> <span className="text-gray-700 relative">Dzień wolny</span>
        </label>

      </div>

      {isHoliday && (
        <div className="mb-4 px-4 py-2 rounded-lg border-2 border-yellow-400 bg-yellow-50 text-yellow-800 font-semibold flex items-center gap-2">
          <span className="text-lg">⚠️</span> Ten dzień jest oznaczony jako dzień wolny — ceny świąteczne
        </div>
      )}

      {/* Day summary bar */}
      {!loading && bookings.length > 0 && (() => {
        const counts: Record<string, number> = { paid: 0, deposit: 0, pending: 0, cancelled: 0 };
        for (const bk of bookings) {
          const paymentsSum = bk.payments?.reduce((s, p) => s + Number(p.amount) / 100, 0) ?? 0;
          const rawPrice = Number(bk.total_price);
          const price = normalizeBookingTotal(rawPrice, paymentsSum);
          const diff = price - paymentsSum;
          let st = bk.status || 'pending';
          if (st !== 'cancelled') {
            if (price === 0 && st === 'paid') st = 'paid';
            else if (diff <= 0 && price > 0) st = 'paid';
            else if (paymentsSum > 0) st = 'deposit';
            else st = 'pending';
          }
          counts[st] = (counts[st] || 0) + 1;
        }
        return (
          <div className="mb-4 px-4 py-2 rounded-lg bg-white border border-gray-300 flex flex-wrap items-center gap-4 text-sm text-gray-700">
            <span className="font-bold">Rezerwacje: {bookings.length}</span>
            {counts.paid > 0 && <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" /> Opłacone: {counts.paid}</span>}
            {counts.deposit > 0 && <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" /> Zaliczka: {counts.deposit}</span>}
            {counts.pending > 0 && <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500" /> Oczekujące: {counts.pending}</span>}
            {counts.cancelled > 0 && <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" /> Anulowane: {counts.cancelled}</span>}
          </div>
        );
      })()}

      {/* Mobile/Tablet: grouped by room */}
      <div className="block md:hidden">
        {loading ? (
          <div className="text-gray-700 py-4 text-center">Ładowanie...</div>
        ) : bookings.length === 0 ? (
          <div className="text-gray-500 py-4 text-center">Brak rezerwacji na ten dzień</div>
        ) : (
          <div className="space-y-5">
            {rooms.map((room) => {
              const roomBookings = bookings
                .filter(b => b.room_id === room.id)
                .sort((a, b) => a.time.localeCompare(b.time));
              if (roomBookings.length === 0) return null;
              return (
                <div key={room.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{room.name}</h3>
                    <span className="inline-block bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {roomBookings.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {roomBookings.map((bk) => {
                      const paymentsSum = bk.payments?.reduce((sum, p) => sum + Number(p.amount) / 100, 0) ?? 0;
                      const rawPrice = Number(bk.total_price);
                      const price = normalizeBookingTotal(rawPrice, paymentsSum);
                      const diff = price - paymentsSum;
                      let status = bk.status || 'pending';
                      if (status !== 'cancelled') {
                        if (price === 0 && status === 'paid') {
                          status = 'paid';
                        } else if (diff <= 0 && price > 0) {
                          status = 'paid';
                        } else if (paymentsSum > 0) {
                          status = 'deposit';
                        } else {
                          status = 'pending';
                        }
                      }
                      return (
                        <div
                          key={bk.id}
                          className={`p-3 rounded-lg border-2 shadow-sm cursor-pointer ${getStatusColor(status)}`}
                          onClick={() => openModal(bk)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="font-bold text-sm">{bk.name || bk.user_email}</div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white bg-opacity-50">{getBookingSpan(bk).duration} min</span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white bg-opacity-50">{getStatusLabel(status)}</span>
                            </div>
                          </div>
                          <div className="text-xs mt-1">{bk.time.slice(0,5)} · {getBookingLabel(bk)}</div>
                          <div className="text-xs mt-0.5">{price} zł · Zapł: {paymentsSum} zł · Saldo: {diff} zł</div>
                          {(() => {
                            const lastPayment = bk.payments?.filter(p => p.status === 'paid' || p.status === 'deposit').sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
                            if (!lastPayment) return null;
                            return <div className="text-[10px] mt-0.5 opacity-75">Ostatnia płatność: {formatPaymentDate(lastPayment.created_at)}</div>;
                          })()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop: calendar table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border border-gray-400 bg-gray-50">
            <thead>
            <tr>
              <th className="border border-gray-400 px-2 py-1 bg-gray-200 w-20 text-gray-700 relative sticky left-0 z-10">
                Godzina
                {bookings.length > 0 && (
                  <span className="ml-1 inline-block bg-gray-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 align-middle">
                    {bookings.length}
                  </span>
                )}
                {loading && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin inline-block w-4 h-4 border-2 border-t-transparent border-gray-500 rounded-full ml-2"></span>
                )}
                </th>
              {rooms.map((room) => {
                const count = bookings.filter(b => b.room_id === room.id).length;
                return (
                  <th key={room.id} className="border border-gray-400 px-2 py-1 bg-gray-200 text-center text-sm font-bold text-gray-900 uppercase tracking-wide" >
                    {room.name}
                    {count > 0 && (
                      <span className="ml-2 inline-block bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-0.5 align-middle">
                        {count}
                      </span>
                    )}
                </th>
                );
              })}
              </tr>
            </thead>
            <tbody>
            {GODZINY.map((hour, rowIdx) => (
              <tr key={hour}>
                <td className="border border-gray-300 px-2 py-1 text-center font-semibold text-gray-700 bg-gray-100 sticky left-0 z-10">{hour}</td>
                {rooms.map((room) => {
                  // Проверяем, есть ли бронирование, начинающееся в этот слот
                  const bks = getBooking(room.id, hour, formatDatePoland(date));
                  // Проверяем, не перекрывает ли этот слот уже занятая ячейка
                  let isCovered = false;
                  let isCleanup = false;
                  let cleanupMinutesForCell = 15;
                  // Найдём, есть ли бронирование, которое закончилось ровно перед этим слотом
                  for (let prev = 0; prev < rowIdx; prev++) {
                    const prevHour = GODZINY[prev];
                    const prevBks = getBooking(room.id, prevHour, formatDatePoland(date));
                    if (prevBks.length > 0) {
                      const span = getBookingSpan(prevBks[0]);
                      const duration = span.duration;
                      const cleanup = span.cleanup;
                      const slots = Math.floor(duration / 15);
                      const prevStartIdx = GODZINY.indexOf(prevBks[0].time.slice(0,5));
                      // Проверяем, перекрывает ли бронирование текущий слот
                      if (prevStartIdx >= 0 && rowIdx > prevStartIdx && rowIdx < prevStartIdx + slots) {
                        isCovered = true;
                        break;
                      }
                      // Cleanup рисуем только для пакетных броней (для ручных cleanup = 0)
                      if (cleanup > 0 && prevStartIdx >= 0 && rowIdx >= prevStartIdx + slots && rowIdx < prevStartIdx + slots + Math.ceil(cleanup / 15)) {
                        isCleanup = true;
                        cleanupMinutesForCell = cleanup;
                        break;
                      }
                    }
                  }
                  if (isCovered) return <td key={room.id} className="hidden" />;
                  if (isCleanup) {
                    return (
                      <td key={room.id} className="border border-gray-300 px-1 py-1 align-top min-w-[160px] bg-gray-200 text-gray-500 text-center italic text-xs">
                          Czyszczenie ({cleanupMinutesForCell} min)
                      </td>
                    );
                  }
                  if (bks.length === 0) return <td key={room.id} className="border border-gray-300 px-1 py-1 align-top min-w-[160px] bg-white" />;
                  // Если есть бронирование, определяем slots
                  const duration = getBookingSpan(bks[0]).duration;
                  const slots = Math.floor(duration / 15);

                  const paymentsSum = bks?.[0]?.payments?.reduce((sum, p) => sum + Number(p.amount) / 100, 0) ?? 0;
                  const rawPrice = Number(bks?.[0]?.total_price);
                  const price = normalizeBookingTotal(rawPrice, paymentsSum);
                  const diff = price - paymentsSum;
                  let status = bks[0].status || 'pending';
                  if (status !== 'cancelled') {
                    if (price === 0 && status === 'paid') {
                      status = 'paid';
                    } else if (diff <= 0 && price > 0) {
                      status = 'paid';
                    } else if (paymentsSum > 0) {
                      status = 'deposit';
                    } else {
                      status = 'pending';
                    }
                  }
                  return (
                    <td
                      key={room.id}
                      rowSpan={isNaN(slots) ? 1 : slots}
                      className={`mb-2 p-2 rounded border shadow-sm cursor-pointer align-top min-w-[170px] ${getStatusColor(status)}`}
                      onClick={() => openModal(bks[0])}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-sm leading-tight">{bks[0].name || bks[0].user_email}</div>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white bg-opacity-50 whitespace-nowrap ml-1">{duration} min</span>
                      </div>
                      <div className="text-[11px] opacity-80">{rooms.find(r => r.id === bks[0].room_id)?.name || '—'}</div>
                      <div className="text-xs">{getBookingLabel(bks[0])}</div>
                      <div className="text-xs mt-0.5">{price} zł · Zapł: {paymentsSum} zł</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`inline-block w-2 h-2 rounded-full ${getStatusDotColor(status)}`} />
                        <span className="text-[10px] font-medium">
                          {getStatusLabel(status)}
                          {(() => {
                            const lastPay = bks[0].payments?.filter(p => p.status === 'paid' || p.status === 'deposit').sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
                            return lastPay ? ` ${formatPaymentDate(lastPay.created_at)}` : '';
                          })()}
                        </span>
                      </div>
                  </td>
                  );
                })}
                </tr>
              ))}
            </tbody>
          </table>
      </div>
      {modalOpen && editForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-0 sm:p-4"
          onClick={closeModal}
        >
          <div
            className="bg-gray-100 rounded-none sm:rounded-lg shadow-lg p-4 sm:p-6 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl relative overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl">×</button>
            <h2 className="text-xl font-bold mb-3 text-gray-900">
              {isNew ? 'Dodaj rezerwację' : 'Edytuj rezerwację'}
            </h2>

            {/* Mode toggle */}
            <div className="mb-4 inline-flex rounded-lg border border-gray-300 bg-white p-1">
              <button
                type="button"
                onClick={() => setMode('package')}
                className={`px-3 py-1 text-xs sm:text-sm rounded-md font-semibold transition ${
                  mode === 'package'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Standard (z pakietu)
              </button>
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`px-3 py-1 text-xs sm:text-sm rounded-md font-semibold transition ${
                  mode === 'manual'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Ręczna (B2B / B2C / Walk-in)
              </button>
            </div>

            <form className="space-y-2" onSubmit={e => {e.preventDefault(); handleSave();}}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-800">Użytkownik (email)</label>
                  <input className="w-full border rounded px-2 py-1 bg-white text-gray-900" value={editForm.user_email || ''} name="user_email" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs text-gray-800">Imię</label>
                  <input className="w-full border rounded px-2 py-1 bg-white text-gray-900" value={editForm.name || ''} name="name" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs text-gray-800">Telefon</label>
                  <input className="w-full border rounded px-2 py-1 bg-white text-gray-900" value={editForm.phone || ''} name="phone" onChange={handleChange} />
                </div>
                {mode === 'package' && (
                <>
                <div>
                  <label className="block text-xs text-gray-800">Pakiet</label>
                  <select
                    className="w-full border rounded px-2 py-1 bg-white text-gray-900"
                    name="package_id"
                    value={editForm.package_id || ''}
                    onChange={handlePackageChange}
                  >
                    <option value="">Wybierz pakiet...</option>
                    {Object.entries(packages).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                    </select>
                  </div>
                <div>
                  <label className="block text-xs text-gray-800">Data</label>
                  {(loadingDates || (editForm.package_id && availableDates.length === 0)) ? (
                    <div className="flex justify-center items-center h-10">
                      <span className="animate-spin inline-block w-6 h-6 border-4 border-t-transparent border-gray-500 rounded-full"></span>
                    </div>
                  ) : (
                    <DatePicker
                      selected={editForm.date ? parsePolandDate(editForm.date) : null}
                      onChange={handleDateChange}
                      dateFormat="yyyy-MM-dd"
                      className="border rounded px-2 py-1 bg-white text-gray-900 w-full"
                      locale="pl"
                      includeDates={availableDates.map(d => parsePolandDate(d))}
                      placeholderText="Wybierz datę"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-800">Godzina</label>
                  {(loadingTimes || (editForm.package_id && editForm.date && availableTimes.length === 0)) ? (
                    <div className="flex justify-center items-center h-10">
                      <span className="animate-spin inline-block w-6 h-6 border-4 border-t-transparent border-gray-500 rounded-full"></span>
                    </div>
                  ) : (
                    <select
                      className="w-full border rounded px-2 py-1 bg-white text-gray-900"
                      name="time"
                      value={editForm.time || ''}
                      onChange={handleTimeChange}
                      disabled={!editForm.date}
                    >
                      <option value="">Wybierz godzinę ✅</option>
                      {availableTimes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-800">Kod promocyjny</label>
                  <select
                    className="w-full border rounded px-2 py-1 bg-white text-gray-900"
                    name="promo_code"
                    value={editForm.promo_code || ''}
                    onChange={handleChange}
                  >
                    <option value="">Brak</option>
                    {promoCodes.map(pc => (
                      <option key={pc.id} value={pc.code}>{pc.code}</option>
                    ))}
                  </select>
                  {promoError && <div className="text-red-600 text-sm mt-2">{promoError}</div>}
                </div>
                <div>
                  <label className="block text-xs text-gray-800">Cena</label>
                  <input className="w-full border rounded px-2 py-1 bg-white text-gray-900" value={editForm.total_price || ''} name="total_price" readOnly />
              </div>
                </>
                )}

                {mode === 'manual' && (
                <>
                <div>
                  <label className="block text-xs text-gray-800">Źródło</label>
                  <select
                    className="w-full border rounded px-2 py-1 bg-white text-gray-900"
                    name="source"
                    value={editForm.source || ''}
                    onChange={handleChange}
                  >
                    <option value="">Wybierz...</option>
                    <option value="b2c">Klient indywidualny (B2C)</option>
                    <option value="b2b">Firma (B2B)</option>
                    <option value="walkin">Klient z ulicy (bez wcześniejszej rezerwacji)</option>
                    <option value="manual">Inne</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-800">Pokój</label>
                  <select
                    className="w-full border rounded px-2 py-1 bg-white text-gray-900"
                    name="room_id"
                    value={editForm.room_id || ''}
                    onChange={handleChange}
                  >
                    <option value="">Wybierz pokój...</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-800">Data</label>
                  <DatePicker
                    selected={editForm.date ? parsePolandDate(editForm.date) : null}
                    onChange={(d: Date | null) => setEditForm(prev => prev ? { ...prev, date: d ? formatDatePoland(d) : '' } : prev)}
                    dateFormat="yyyy-MM-dd"
                    className="border rounded px-2 py-1 bg-white text-gray-900 w-full"
                    locale="pl"
                    placeholderText="Wybierz datę"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-800">Godzina rozpoczęcia</label>
                  <select
                    className="w-full border rounded px-2 py-1 bg-white text-gray-900"
                    name="time"
                    value={(editForm.time || '').slice(0, 5)}
                    onChange={handleChange}
                  >
                    <option value="">Wybierz godzinę...</option>
                    {MANUAL_TIME_SLOTS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-800">Czas trwania (minuty)</label>
                  <input
                    type="number"
                    step={15}
                    className="w-full border rounded px-2 py-1 bg-white text-gray-900"
                    name="duration_minutes"
                    value={editForm.duration_minutes ?? ''}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, duration_minutes: e.target.value === '' ? null : Number(e.target.value) } : prev)}
                    placeholder="np. 90, 120, 180"
                  />
                  <div className="text-[10px] text-gray-500 mt-0.5">Minimum 15 min, maksimum 720 min (12 godzin).</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-800">Liczba osób</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    className="w-full border rounded px-2 py-1 bg-white text-gray-900"
                    name="num_people"
                    value={editForm.num_people ?? ''}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, num_people: e.target.value === '' ? null : Number(e.target.value) } : prev)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-800">Cena całkowita (zł)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full border rounded px-2 py-1 bg-white text-gray-900"
                    name="total_price"
                    value={editForm.total_price || ''}
                    onChange={handleChange}
                    placeholder="np. 800"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-800">Już wpłacone (zł)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full border rounded px-2 py-1 bg-white text-gray-900"
                    name="deposit_amount"
                    value={editForm.deposit_amount ?? ''}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, deposit_amount: e.target.value === '' ? null : Number(e.target.value) } : prev)}
                    placeholder="0"
                  />
                  <div className="text-[10px] text-gray-500 mt-0.5">Kwota, którą klient już zapłacił (zaliczka lub pełna kwota). Zostaw 0 jeśli jeszcze nic nie wpłacił.</div>
                </div>
                </>
                )}

                <div>
                  <label className="block text-xs text-gray-800">Status</label>
                  <select
                    className={`w-full border rounded px-2 py-1 bg-white text-gray-900 ${getStatusColor(editForm.status)}`}
                    name="status"
                    value={editForm.status || ''}
                    onChange={handleChange}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {mode === 'manual' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-800">Notatka admina (wewnętrzna)</label>
                  <textarea
                    className="w-full border rounded px-2 py-1 bg-white text-gray-900"
                    name="admin_note"
                    rows={2}
                    value={editForm.admin_note || ''}
                    onChange={handleChange}
                    placeholder="np. wieczór panieński Ola, faktura na firmę X"
                  />
                </div>
                )}

                {mode === 'package' && (
                <>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-800">Komentarz</label>
                  <textarea
                    className="w-full border rounded px-2 py-1 bg-white text-gray-900"
                    name="comment"
                    value={editForm.comment || ''}
                    onChange={handleChange}
                    ></textarea>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-800">Extra items</label>
                  <div className="w-full border rounded px-2 py-1 bg-white min-h-[38px] text-gray-900">
                    {/* Список выбранных */}
                    {Array.isArray(editForm.extra_items) && editForm.extra_items.length > 0 ? (
                      <ul className="mb-2">
                        {editForm.extra_items.map((ei: {id: string, count?: number}, idx: number) => (
                          <li key={ei.id + '-' + idx} className="flex items-center gap-2 mb-1">
                            <select
                              className="border rounded px-1 py-0.5 text-xs"
                              value={ei.id}
                              onChange={e => handleExtraItemChange(idx, 'id', e.target.value)}
                            >
                              <option value="">Wybierz...</option>
                              {Object.entries(extraItemMap).map(([id, name]) => (
                                <option key={id} value={id}>{name}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              min={1}
                              className="border rounded px-1 py-0.5 w-14 text-xs"
                              value={ei.count || 1}
                              onChange={e => handleExtraItemChange(idx, 'count', e.target.value)}
                            />
                            <span className="text-xs">{extraItemMap[ei.id] || ei.id}</span>
                            <button type="button" className="text-red-500 text-xs ml-1" onClick={() => handleExtraItemRemove(idx)}>Usuń</button>
                          </li>
                        ))}
                      </ul>
                    ) : <span className="text-gray-400">Brak</span>}
                    {/* Добавление нового */}
                    <div className="flex items-center gap-2 mt-2">
                      <select
                        className="border rounded px-1 py-0.5 text-xs"
                        value={newExtraItem.id}
                        onChange={e => setNewExtraItem(prev => ({ ...prev, id: e.target.value }))}
                      >
                        <option value="">Dodaj...</option>
                        {Object.entries(extraItemMap).map(([id, name]) => (
                          <option key={id} value={id}>{name}</option>
                        ))}
                </select>
                      <input
                        type="number"
                        min={1}
                        className="border rounded px-1 py-0.5 w-14 text-xs"
                        value={newExtraItem.count}
                        onChange={e => setNewExtraItem(prev => ({ ...prev, count: Number(e.target.value) }))}
                      />
                      <button type="button" className="px-2 py-1 rounded bg-blue-500 text-white text-xs" onClick={handleExtraItemAdd}>Dodaj</button>
                        </div>
                  </div>
                </div>
                </>
                )}
              {/* Payments info */}
              {!isNew && Array.isArray(editForm.payments) && editForm.payments.length > 0 && (
                <div className="sm:col-span-2 mt-2">
                  <label className="block text-xs text-gray-800 mb-1">Płatności</label>
                  <div className="border rounded bg-white overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600">
                          <th className="px-2 py-1 text-left">Kwota</th>
                          <th className="px-2 py-1 text-left">Status</th>
                          <th className="px-2 py-1 text-left">Transaction ID</th>
                          <th className="px-2 py-1 text-left">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editForm.payments.map((p: Payment) => (
                          <tr key={p.id} className="border-t">
                            <td className="px-2 py-1 font-semibold">{(Number(p.amount) / 100).toFixed(2)} zł</td>
                            <td className="px-2 py-1">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                                p.status === 'paid' ? 'bg-green-100 text-green-800' :
                                p.status === 'deposit' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>{p.status}</span>
                            </td>
                            <td className="px-2 py-1 text-gray-500 font-mono">{p.transaction_id || '—'}</td>
                            <td className="px-2 py-1 text-gray-500">{p.created_at ? new Date(p.created_at).toLocaleString('pl-PL') : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              </div>
              {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
              {emailStatus && <div className="text-blue-700 text-sm mt-2">{emailStatus}</div>}
              <div className="flex flex-wrap gap-2 mt-4 justify-end">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Zamknij</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{saving ? 'Zapisywanie...' : 'Zapisz'}</button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5 text-sm"
                  title="Usuń rezerwację"
                >
                  <FaTrash size={14} />
                  <span className="hidden sm:inline">Usuń rezerwację</span>
                </button>
                {!isNew && (
                  <button
                    type="button"
                    onClick={handleDeletePayments}
                    disabled={saving}
                    className="px-3 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 flex items-center gap-1.5 text-sm"
                    title="Usuń wszystkie płatności tej rezerwacji"
                  >
                    <FaMoneyBillWave size={14} />
                    <span className="hidden sm:inline">Usuń płatności</span>
                  </button>
                )}
                <div style={{display:'flex', alignItems:'center', gap:4}}>
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={emailSending || !editForm.user_email || !editForm.date || !editForm.time || !editForm.package_id}
                    className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                    style={{minWidth:140}}
                  >
                    {emailSending ? 'Wysyłanie...' : 'Wyślij e-mail'}
                  </button>
                  <EmailInfoTooltip />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {loading && <div className="mt-4 text-gray-700">Ładowanie...</div>}
    </div>
  );
}

export default withAdminAuth(BookingsPage);