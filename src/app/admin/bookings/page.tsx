"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import React from 'react';
import { withAdminAuth } from '../components/withAdminAuth';
import { FaTrash } from 'react-icons/fa';
import dayjs from "dayjs";
import { pl } from 'date-fns/locale/pl';

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
}
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
  package: { duration: number };
};

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
  // Получить строку локального времени в Польше
  const polandString = now.toLocaleString('en-US');
  return new Date(polandString);
}

// Преобразует строку 'YYYY-MM-DD' в Date в зоне Europe/Warsaw
function parsePolandDate(str: string): Date {
  const [year, month, day] = str.split('-').map(Number);
  // Создаём дату в польской зоне (локальное время)
  const polandString = new Date(year, month - 1, day).toLocaleString('en-US');
  return new Date(polandString);
}

// Возвращает YYYY-MM-DD для даты в зоне Europe/Warsaw
function formatDatePoland(date: Date): string {
  // Получаем локальное время в Польше
  const poland = new Date(date.toLocaleString('en-US'));
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
  };
  const [isNew, setIsNew] = useState(false);
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

  // Загружаем даты с резервациями и extra items
  useEffect(() => {
    async function fetchBookedDates() {
      const { data } = await supabase.from('bookings').select('date');
      if (data) {
        const uniqueDates = Array.from(new Set(data.map((b: {date: string}) => b.date)));
        setBookedDates(uniqueDates.map(d => new Date(d)));
      }
      // Загружаем extra items
    const { data: extraItems } = await supabase.from('extra_items').select('id, name');
      if (extraItems) {
        setExtraItemMap(Object.fromEntries(extraItems.map((ei: {id: string, name: string}) => [ei.id, ei.name])));
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
      const { data: packagesData } = await supabase.from('packages').select('id, name, duration, cleanup_time');
      setPackages(Object.fromEntries(((packagesData as {id: string, name: string, duration: number, cleanup_time?: number}[])||[]).map((p) => [p.id, p.name])));
      setPackageDurations(Object.fromEntries(((packagesData as {id: string, duration: number}[])||[]).map((p) => [p.id, p.duration || 60])));
      setPackageCleanupTimes(Object.fromEntries(((packagesData as {id: string, cleanup_time?: number}[])||[]).map((p) => [p.id, p.cleanup_time ?? 15])));
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
        .eq('date', dateStr);
      setBookings((bookingsData as Booking[]) || []);
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
    setModalOpen(true);
    setError(null);
    if (booking.package_id) {
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
  }

  function openNewModal() {
    setEditForm({ ...emptyBooking, date: new Date().toISOString().slice(0,10) });
    setIsNew(true);
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

  // Получение пакета с allowed_rooms и room_priority
  async function fetchPackageDetails(packageId: string) {
    const { data } = await supabase.from('packages').select('*').eq('id', packageId).single();
    setSelectedPackage(data);
  }

  // Получение доступных дат
  async function fetchAvailableDatesCached(packageId: string) {
    if (datesCache[packageId]) {
      setAvailableDates(datesCache[packageId]);
      return;
    }
    setLoadingDates(true);
    const today = new Date();
    const startDate = today.toISOString().slice(0,10);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate()).toISOString().slice(0,10);
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

  // --- При сохранении вычисляем room_id автоматически ---
  async function handleSave() {
    if (!editForm) return;
    setSaving(true);
    setError(null);
    let roomId = '';
    if (isNew && selectedPackage) {
      // Получаем room_priority и allowed_rooms
      const allowedRooms: string[] = selectedPackage.allowed_rooms || [];
      const roomPriority: string[] = selectedPackage.room_priority && selectedPackage.room_priority.length > 0 ? selectedPackage.room_priority : allowedRooms;
      // Перебираем комнаты по приоритету и ищем свободную
      const { data: pkg } = await supabase
          .from('packages')
          .select('*')
          .eq('id', selectedPackage.id)
          .single();

      const bufferMinutes = 15;
      
      const targetTime = dayjs(`${editForm.date} ${editForm.time}`);
      const targetEndTime = dayjs(`${editForm.date} ${editForm.time}`).add(pkg.duration  + bufferMinutes, 'm');

      const { data: getBookings, error: getBookingError } = await supabase
        .from('bookings')
        .select(`
          id,
          room_id,
          date,
          time,
          package:package_id (duration)
        `)
        .in('room_id', roomPriority)
        .eq('date', editForm.date)
        .returns<BookingWithPackage[]>();

      if (getBookingError) {
        return;
      }

      for (const roomIdT of roomPriority) {
        const bookingsForRoom = getBookings.filter(b => b.room_id === roomIdT);
    
        const conflict = bookingsForRoom.some((b: BookingWithPackage) => {
          const startTime = dayjs(`${b.date} ${b.time}`);
          const duration = b.package?.duration || 0;
          const endTime = startTime.add(duration + bufferMinutes, 'm');

          return targetTime.isSame(startTime) || (targetEndTime.isAfter(startTime) && targetEndTime.isBefore(endTime)) || 
                (targetTime.isAfter(startTime) && targetTime.isBefore(endTime));
        });
    
        if (!conflict) {
          roomId = roomIdT;
          break;
        }
      }
      if (!roomId) {
        setError('Brak dostępnych pokoi na wybraną datę i godzinę');
        setSaving(false);
      return;
      }
    }
    if (isNew) {
      const { user_email, name, package_id, date, time, status, phone, total_price, payment_id, promo_code, extra_items, comment } = editForm;
      const { error } = await supabase.from('bookings').insert([{ user_email, name, package_id, room_id: roomId, date, time, status, phone, total_price: Number(total_price), payment_id, promo_code, extra_items, comment }]);
      if (error) {
        setError('Błąd zapisu: ' + error.message);
      } else {
        closeModal();
        setIsNew(false);
        const dateStr = (editForm.date || new Date().toISOString().slice(0,10));
        const { data: bookingsData } = await supabase.from('bookings').select('*').eq('date', dateStr);
        setBookings((bookingsData as Booking[]) || []);
      }
    } else {
      const { id, payments, ...fields } = editForm;
      console.log('payments', payments);
      const { error } = await supabase.from('bookings').update(fields).eq('id', id);
      if (error) {
        setError('Błąd zapisu: ' + error.message);
      } else {
        closeModal();
        const dateStr = editForm.date;
        const { data: bookingsData } = await supabase.from('bookings').select('*').eq('date', dateStr);
        setBookings((bookingsData as Booking[]) || []);
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
      const { data: promoData } = await supabase.from('promo_codes').select('*');
      if (promoData) setPromoCodes(promoData);
      // package prices
      const { data: pkgData } = await supabase.from('packages').select('id, price');
      if (pkgData) setPackagePrices(Object.fromEntries((pkgData as {id: string, price: number}[]).map((p) => [p.id, Number(p.price)])));
      // extra item prices
      const { data: extraData } = await supabase.from('extra_items').select('id, price');
      if (extraData) setExtraItemPrices(Object.fromEntries((extraData as {id: string, price: number}[]).map((ei) => [ei.id, Number(ei.price)])));
    }
    fetchAll();
  }, []);

  // --- Автоматический пересчет цены ---
  useEffect(() => {
    async function recalc() {
      if (!editForm) return;
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
  }, [editForm?.package_id, editForm?.extra_items, editForm?.promo_code]);

  useEffect(() => {
    async function fetch() {
      const { data: holidaysData } = await supabase.from('holidays').select('date').eq('date', dayjs(date).format('YYYY-MM-DD')).single();

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
      // Odśwież listę rezerwacji na wybrany dzień
      const dateStr = editForm.date;
      const { data: bookingsData } = await supabase.from('bookings').select('*').eq('date', dateStr);
      setBookings((bookingsData as Booking[]) || []);
    }
    setSaving(false);
  }

  async function handleDeleteBooking() {
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
      // Odśwież listę rezerwacji na wybrany dzień
      const dateStr = editForm.date;
      const { data: bookingsData } = await supabase.from('bookings').select('*').eq('date', dateStr);
      setBookings((bookingsData as Booking[]) || []);
    }
    setSaving(false);
  }

  return (
    <div className="p-4" style={{ background: '#f7f7fa', minHeight: '100vh' }}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-100">Kalendarz rezerwacji</h1>
        <button
          className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700 font-semibold"
          onClick={openNewModal}
          type="button"
        >
          Dodaj rezerwację
        </button>
      </div>
      <div className="mb-4 flex items-center gap-4">
        <span className="text-gray-700 relative">Data
          {loading && (
            <span className="absolute -right-5 top-1/2 -translate-y-1/2 animate-spin inline-block w-4 h-4 border-2 border-t-transparent border-gray-500 rounded-full ml-2"></span>
          )}
        :</span>
        <DatePicker
          selected={date}
          onChange={d => d && setDate(d)}
          dateFormat="yyyy-MM-dd"
          className="border rounded px-2 py-1 bg-white text-gray-900"
          locale="pl"
          highlightDates={bookedDates}
        />

        <label style={{display:'flex',alignItems:'center',gap:4}}>
          <input 
            type="checkbox" 
            checked={isHoliday} 
            onChange={() => updateHoliday(!isHoliday)} /> <span className="text-gray-700 relative">Holiday</span>
        </label>
          
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-400 bg-gray-50">
            <thead>
            <tr>
              <th className="border border-gray-400 px-2 py-1 bg-gray-200 w-20 text-gray-700 relative">
                Godzina
                {loading && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin inline-block w-4 h-4 border-2 border-t-transparent border-gray-500 rounded-full ml-2"></span>
                )}
                </th>
              {rooms.map((room) => {
                const count = bookings.filter(b => b.room_id === room.id).length;
                return (
                  <th key={room.id} className="border border-gray-400 px-2 py-1 bg-gray-200 text-center text-gray-700" >
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
                <td className="border border-gray-300 px-2 py-1 text-center font-semibold text-gray-700 bg-gray-100">{hour}</td>
                {rooms.map((room) => {
                  // Проверяем, есть ли бронирование, начинающееся в этот слот
                  const bks = getBooking(room.id, hour, date.toISOString().slice(0, 10));
                  // Проверяем, не перекрывает ли этот слот уже занятая ячейка
                  let isCovered = false;
                  let isCleanup = false;
                  // Найдём, есть ли бронирование, которое закончилось ровно перед этим слотом
                  for (let prev = 0; prev < rowIdx; prev++) {
                    const prevHour = GODZINY[prev];
                    const prevBks = getBooking(room.id, prevHour, date.toISOString().slice(0, 10));
                    if (prevBks.length > 0) {
                      const pkgId = prevBks[0].package_id;
                      const duration = Number(packageDurations[pkgId]) || 60;
                      const cleanup = Number(packageCleanupTimes[pkgId]) || 15;
                      const slots = Math.floor(duration / 15);
                      const prevStartIdx = GODZINY.indexOf(prevBks[0].time.slice(0,5));
                      // Проверяем, перекрывает ли бронирование текущий слот
                      if (prevStartIdx >= 0 && rowIdx > prevStartIdx && rowIdx < prevStartIdx + slots) {
                        isCovered = true;
                        break;
                      }
                      // Проверяем, нужно ли добавить уборку (может быть несколько слотов)
                      if (prevStartIdx >= 0 && rowIdx >= prevStartIdx + slots && rowIdx < prevStartIdx + slots + Math.ceil(cleanup / 15)) {
                        isCleanup = true;
                        break;
                      }
                    }
                  }
                  if (isCovered) return <td key={room.id} className="hidden" />;
                  if (isCleanup) {
                    return (
                      <td key={room.id} className="border border-gray-300 px-1 py-1 align-top min-w-[160px] bg-gray-300 text-gray-600 text-center font-semibold">
                          Czas na czyszczenie
                      </td>
                    );
                  }
                  if (bks.length === 0) return <td key={room.id} className="border border-gray-300 px-1 py-1 align-top min-w-[160px] bg-white" />;
                  // Если есть бронирование, определяем slots
                  const pkgId = bks[0].package_id;
                  const duration = Number(packageDurations[pkgId]) || 60;
                  const slots = Math.floor(duration / 15);

                  const paymentsSum = bks?.[0]?.payments?.reduce((sum, p) => sum + Number(p.amount) / 100, 0) ?? 0;
                  const price = Number(bks?.[0]?.total_price) || 0; 
                  const diff = price-paymentsSum;
                  const status = bks[0].status === 'paid' && diff > 0 ? 'deposit' : bks[0].status;
                  return (
                    <td
                      key={room.id}
                      rowSpan={isNaN(slots) ? 1 : slots}
                      className={`mb-2 p-2 rounded border shadow-sm cursor-pointer align-top min-w-[160px] ${getStatusColor(status)}`}
                      onClick={() => openModal(bks[0])}
                    >
                      <div className="font-bold">{bks[0].name || bks[0].user_email}</div>
                      <div className="text-xs">{bks[0].time.slice(0,5)}{bks[0].time_end ? ` - ${bks[0].time_end.slice(0,5)}` : ''}</div>
                      <div className="text-xs">Pakiet: {packages[bks[0].package_id] || bks[0].package_id}</div>
                      <div className="text-xs">Kwota: {price}</div>
                      <div className="text-xs">Zapłacono: {paymentsSum}</div>
                      <div className="text-xs">Saldo: {diff}</div>
                  </td>
                  );
                })}
                </tr>
              ))}
            </tbody>
          </table>
      </div>
      {modalOpen && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-gray-100 rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl">×</button>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Edytuj rezerwację</h2>
            <form className="space-y-2" onSubmit={e => {e.preventDefault(); handleSave();}}>
              <div className="grid grid-cols-2 gap-2">
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
                <div className="col-span-2">
                  <label className="block text-xs text-gray-800">Comment</label>
                  <textarea 
                    className="w-full border rounded px-2 py-1 bg-white text-gray-900"
                    name="comment"
                    value={editForm.comment || ''}
                    onChange={handleChange}
                    ></textarea>
                </div>
                <div className="col-span-2">
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
              </div>
              {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
              {emailStatus && <div className="text-blue-700 text-sm mt-2">{emailStatus}</div>}
              <div className="flex gap-2 mt-4 justify-end">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Zamknij</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{saving ? 'Zapisywanie...' : 'Zapisz'}</button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="p-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                  title="Usuń rezerwację"
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  <FaTrash size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleDeleteBooking}
                  disabled={saving}
                  className="p-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                  title="Usuń wszystkie płatności tej rezerwacji"
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  <FaTrash size={18} />
                </button>
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