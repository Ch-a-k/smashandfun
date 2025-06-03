"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Booking {
  id: string;
  user_email: string;
  package_id: string;
  room_id: string;
  date: string;
  time: string;
  total_price: number;
  status: string;
  created_at: string;
  extra_items?: { id: string; count?: number }[];
}

interface PackageMap { [id: string]: string; }
interface RoomMap { [id: string]: string; }
interface ExtraItemMap { [id: string]: string; }

interface BookingDetails extends Booking {
  extra_items?: { id: string; count?: number }[];
  promo_code?: string;
}

interface BookingHistoryEntry {
  id: string;
  action: string;
  comment?: string;
  created_at: string;
}

interface CommentEntry {
  id: string;
  author_role: string;
  text: string;
  created_at: string;
}

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [packageMap, setPackageMap] = useState<PackageMap>({});
  const [roomMap, setRoomMap] = useState<RoomMap>({});
  const [extraItemMap, setExtraItemMap] = useState<ExtraItemMap>({});
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [history, setHistory] = useState<BookingHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterRoom, setFilterRoom] = useState<string>('');
  const [sortField, setSortField] = useState<'date'|'total_price'|'status'>('date');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<BookingDetails | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    date: '',
    time: '',
    user_email: '',
    name: '',
    phone: '',
    package_id: '',
    room_id: '',
    total_price: '',
    status: 'pending',
    promo_code: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [timesLoading, setTimesLoading] = useState(false);
  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set());
  const [loadingDates, setLoadingDates] = useState(false);
  const [extraItems, setExtraItems] = useState<{id:string;name:string;price:number}[]>([]);
  const [addExtraItems, setAddExtraItems] = useState<{id:string;count:number}[]>([]);

  async function fetchMaps() {
    // Получаем названия пакетов, комнат и предметов для отображения
    const { data: packages } = await supabase.from('packages').select('id, name');
    const { data: rooms } = await supabase.from('rooms').select('id, name');
    const { data: extraItems } = await supabase.from('extra_items').select('id, name');
    setPackageMap(Object.fromEntries((packages||[]).map((p: {id: string, name: string}) => [p.id, p.name])));
    setRoomMap(Object.fromEntries((rooms||[]).map((r: {id: string, name: string}) => [r.id, r.name])));
    setExtraItemMap(Object.fromEntries((extraItems||[]).map((ei: {id: string, name: string}) => [ei.id, ei.name])));
  }

  async function fetchBookings() {
    setLoading(true);
    setError("");
    let query = supabase.from('bookings').select('*').order('date', { ascending: false }).order('time', { ascending: false });
    if (searchEmail) query = query.ilike('user_email', `%${searchEmail}%`);
    if (searchDate) query = query.eq('date', searchDate);
    const { data, error } = await query;
    if (error) {
      setError("Błąd ładowania rezerwacji");
      setLoading(false);
      return;
    }
    setBookings(data || []);
    setLoading(false);
  }

  async function openDetails(id: string) {
    setDetailsLoading(true);
    setDetailsId(id);
    const { data } = await supabase.from('bookings').select('*').eq('id', id).single();
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      setDetails(data as BookingDetails);
    } else if (Array.isArray(data) && (data as BookingDetails[]).length > 0) {
      setDetails((data as BookingDetails[])[0]);
    } else {
      setDetails(null);
    }
    setDetailsLoading(false);
    // Загружаем историю изменений
    setHistoryLoading(true);
    const { data: hist } = await supabase.from('booking_history').select('*').eq('booking_id', id).order('created_at', { ascending: false });
    setHistory(hist || []);
    setHistoryLoading(false);
    // Загружаем комментарии
    setCommentsLoading(true);
    const { data: comm } = await supabase.from('comments').select('*').eq('booking_id', id).order('created_at', { ascending: false });
    setComments(comm || []);
    setCommentsLoading(false);
  }

  // Экспорт в CSV
  function exportCSV() {
    const header = ['Data','Godzina','E-mail','Pakiet','Pokój','Suma','Status','Dodatki'];
    const rows = bookings.map(b => [
      b.date,
      b.time.slice(0,5),
      b.user_email,
      packageMap[b.package_id] || b.package_id,
      roomMap[b.room_id] || b.room_id,
      Number(b.total_price).toFixed(2),
      b.status,
      Array.isArray(b.extra_items) && b.extra_items.length > 0
        ? b.extra_items.map((ei: {id: string; count?: number}) => `${extraItemMap[ei.id] || ei.id}${ei.count ? ` ×${ei.count}` : ''}`).join(', ')
        : ''
    ]);
    const csv = [header, ...rows].map(r=>r.join(';')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rezerwacje.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Быстрая смена статуса
  async function quickStatus(id: string, status: string) {
    await supabase.from('bookings').update({status}).eq('id', id);
    fetchBookings();
    if (detailsId === id) openDetails(id);
  }

  // Фильтрация и сортировка
  let filtered = bookings;
  if (filterStatus) filtered = filtered.filter(b=>b.status===filterStatus);
  if (filterRoom) filtered = filtered.filter(b=>b.room_id===filterRoom);
  filtered = [...filtered].sort((a,b)=>{
    if (sortField==='date') {
      const d1 = a.date + ' ' + a.time;
      const d2 = b.date + ' ' + b.time;
      return sortDir==='asc' ? d1.localeCompare(d2) : d2.localeCompare(d1);
    }
    if (sortField==='total_price') {
      return sortDir==='asc' ? a.total_price-b.total_price : b.total_price-a.total_price;
    }
    if (sortField==='status') {
      return sortDir==='asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
    }
    return 0;
  });

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !details) return;

    const { id, date, time, user_email, package_id, room_id, total_price, status, promo_code } = editForm;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          date,
          time,
          user_email,
          package_id,
          room_id,
          total_price,
          status,
          promo_code
        })
        .eq('id', id);

      if (error) {
        console.error('Błąd rezerwacji:', error.message);
        return;
      }

      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setDetails(data as BookingDetails);
      } else if (Array.isArray(data) && (data as BookingDetails[]).length > 0) {
        setDetails((data as BookingDetails[])[0]);
      }
      setEditMode(false);
      fetchBookings();
      // Отправить письмо клиенту об изменении бронирования
      await fetch('/api/sendBookingEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user_email,
          booking: {
            date,
            time,
            package: packageMap[package_id] || package_id,
            people: '',
          },
          type: 'update'
        })
      });
    } catch (error) {
      console.error('Błąd podczas edycji rezerwacji:', error);
    }
  };

  async function handleAddBooking(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    // Простая валидация
    if (!addForm.date || !addForm.time || !addForm.user_email || !addForm.package_id || !addForm.status) {
      alert('Wypełnij wszystkie wymagane pola!');
      setAddLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: addForm.user_email,
          name: addForm.name,
          phone: addForm.phone,
          packageId: addForm.package_id,
          date: addForm.date,
          time: addForm.time,
          extraItems: addExtraItems,
          promoCode: addForm.promo_code
        })
      });
      const result = await res.json();
      setAddLoading(false);
      if (!res.ok) {
        alert(result.error || 'Błąd dodawania rezerwacji');
        return;
      }
      setAddModalOpen(false);
      setAddForm({ date: '', time: '', user_email: '', name: '', phone: '', package_id: '', room_id: '', total_price: '', status: 'pending', promo_code: '' });
      fetchBookings();
      // Отправить письмо клиенту о новой брони
      await fetch('/api/sendBookingEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: addForm.user_email,
          booking: {
            date: addForm.date,
            time: addForm.time,
            package: packageMap[addForm.package_id] || addForm.package_id,
            people: '',
          },
          type: 'new'
        })
      });
    } catch {
      setAddLoading(false);
      alert('Błąd dodawania rezerwacji');
    }
  }

  // Получаем роль из localStorage (как в /admin/page.tsx)
  useEffect(() => {
    const email = typeof window !== 'undefined' ? localStorage.getItem('admin_email') : null;
    if (!email) return;
    supabase
      .from('admins')
      .select('role')
      .eq('email', email)
      .single()
      .then(({ data }) => setAdminRole(data?.role || null));
  }, []);

  async function handleDeleteBooking(id: string) {
    setDeleteLoading(true);
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    setDeleteLoading(false);
    setDeleteId(null);
    setDetailsId(null);
    setDetails(null);
    if (error) {
      alert('Błąd usuwania: ' + error.message);
      return;
    }
    fetchBookings();
  }

  // Функция для загрузки дат по диапазону (как на клиенте)
  const loadDates = async (start: Date, end: Date) => {
    setLoadingDates(true);
    const startDate = start.toISOString().slice(0, 10);
    const endDate = end.toISOString().slice(0, 10);
    const res = await fetch('/api/booking/available-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: addForm.package_id, startDate, endDate })
    });
    const data = await res.json();
    if (data.dates) {
      setAvailableDates(prev => Array.from(new Set([...prev, ...data.dates])));
    }
    setLoadingDates(false);
  };

  // Загружаем даты для текущего месяца при открытии модалки и выборе пакета
  useEffect(() => {
    if (!addModalOpen || !addForm.package_id) {
      setAvailableDates([]);
      setLoadedMonths(new Set());
      setAddForm(f => ({ ...f, date: '', time: '' }));
      return;
    }
    // Сброс при смене пакета
    setAvailableDates([]);
    setLoadedMonths(new Set());
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const monthKey = `${start.getFullYear()}-${start.getMonth()}`;
    loadDates(start, end);
    setLoadedMonths(new Set([monthKey]));
    setAddForm(f => ({ ...f, date: '', time: '' }));
  }, [addModalOpen, addForm.package_id]);

  // При смене месяца подгружаем даты для нового месяца
  const handleMonthChange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const monthKey = `${start.getFullYear()}-${start.getMonth()}`;
    if (!loadedMonths.has(monthKey)) {
      loadDates(start, end);
      setLoadedMonths(prev => new Set(prev).add(monthKey));
    }
  };

  // Фильтр для доступных дат
  const availableDatesSet = new Set(availableDates);
  function isDateAvailable(date: Date) {
    const iso = date.toISOString().slice(0, 10);
    return availableDatesSet.has(iso);
  }

  // Загрузка доступных времён при выборе даты
  useEffect(() => {
    if (!addForm.package_id || !addForm.date) {
      setAvailableTimes([]);
      setAddForm(f => ({ ...f, time: '' }));
      return;
    }
    setTimesLoading(true);
    fetch('/api/booking/check-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: addForm.package_id, date: addForm.date })
    })
      .then(res => res.json())
      .then(data => {
        setAvailableTimes(data.times || []);
        setTimesLoading(false);
        setAddForm(f => ({ ...f, time: '' }));
      })
      .catch(() => {
        setAvailableTimes([]);
        setTimesLoading(false);
      });
  }, [addForm.package_id, addForm.date]);

  // Автоматический расчет суммы бронирования
  useEffect(() => {
    async function fetchPrice() {
      if (!addForm.package_id || !addForm.date || !addForm.time) {
        setAddForm(f => ({ ...f, total_price: '' }));
        return;
      }
      try {
        const res = await fetch('/api/booking/calc-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageId: addForm.package_id,
            date: addForm.date,
            time: addForm.time,
            promoCode: addForm.promo_code || null,
            extraItems: addExtraItems
          })
        });
        const data = await res.json();
        setAddForm(f => ({ ...f, total_price: data.totalPrice ? String(data.totalPrice) : '' }));
      } catch {
        setAddForm(f => ({ ...f, total_price: '' }));
      }
    }
    fetchPrice();
  }, [addForm.package_id, addForm.date, addForm.time, addForm.promo_code, addExtraItems]);

  // Загружаем extra items при открытии модалки
  useEffect(() => {
    if (!addModalOpen) return;
    fetch('/api/booking/extra-items')
      .then(res => res.json())
      .then((items) => setExtraItems(items || []));
    setAddExtraItems([]);
  }, [addModalOpen]);

  useEffect(() => { fetchMaps(); }, []);
  useEffect(() => { fetchBookings(); }, [searchEmail, searchDate]);

  return (
    <div style={{color:'#fff'}}>
      <h1 style={{fontSize:28, fontWeight:800, color:'#f36e21', marginBottom:18}}>Rezerwacje</h1>
      <p style={{fontSize:16, opacity:0.9, marginBottom:18}}>Przeglądaj i zarządzaj wszystkimi rezerwacjami klientów.</p>
      <div style={{display:'flex', gap:16, marginBottom:18, flexWrap:'wrap'}}>
        <input
          type="text"
          placeholder="Szukaj po e-mailu..."
          value={searchEmail}
          onChange={e=>setSearchEmail(e.target.value)}
          style={{background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'8px 14px', fontSize:15, fontWeight:500, outline:'none'}}
        />
        <input
          type="date"
          value={searchDate}
          onChange={e=>setSearchDate(e.target.value)}
          style={{background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'8px 14px', fontSize:15, fontWeight:500, outline:'none'}}
        />
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'8px 14px', fontSize:15, fontWeight:500, outline:'none'}}>
          <option value="">Wszystkie statusy</option>
          <option value="pending">Oczekuje</option>
          <option value="paid">Opłacone</option>
          <option value="deposit">Zaliczka</option>
          <option value="cancelled">Anulowane</option>
        </select>
        <select value={filterRoom} onChange={e=>setFilterRoom(e.target.value)} style={{background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'8px 14px', fontSize:15, fontWeight:500, outline:'none'}}>
          <option value="">Wszystkie pokoje</option>
          {Object.entries(roomMap).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <button onClick={()=>{setSearchEmail('');setSearchDate('');setFilterStatus('');setFilterRoom('');}} style={{background:'#23222a', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'8px 18px', fontWeight:700, fontSize:15, cursor:'pointer'}}>Wyczyść</button>
        <button onClick={exportCSV} style={{background:'#f36e21', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontWeight:700, fontSize:15, cursor:'pointer'}}>Eksportuj CSV</button>
        <button onClick={()=>setAddModalOpen(true)} style={{background:'#4caf50', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontWeight:700, fontSize:15, cursor:'pointer'}}>Dodaj rezerwację</button>
      </div>
      <div style={{background:'#23222a', borderRadius:12, padding:32, minHeight:180, color:'#fff', fontSize:16, overflowX:'auto'}}>
        {loading ? (
          <div>Ładowanie...</div>
        ) : error ? (
          <div style={{color:'#ff4d4f'}}>{error}</div>
        ) : filtered.length === 0 ? (
          <div>Brak rezerwacji.</div>
        ) : (
          <table style={{width:'100%', borderCollapse:'collapse', minWidth:900}}>
            <thead>
              <tr style={{background:'#18171c', color:'#ff9f58'}}>
                <th style={{padding:'8px 12px', textAlign:'left', cursor:'pointer'}} onClick={()=>{setSortField('date');setSortDir(d=>sortField==='date'&&d==='desc'?'asc':'desc')}}>
                  Data {sortField==='date' ? (sortDir==='asc'?'▲':'▼') : ''}
                </th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Godzina</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>E-mail</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Pakiet</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Pokój</th>
                <th style={{padding:'8px 12px', textAlign:'left', cursor:'pointer'}} onClick={()=>{setSortField('total_price');setSortDir(d=>sortField==='total_price'&&d==='desc'?'asc':'desc')}}>
                  Suma (PLN) {sortField==='total_price' ? (sortDir==='asc'?'▲':'▼') : ''}
                </th>
                <th style={{padding:'8px 12px', textAlign:'left', cursor:'pointer'}} onClick={()=>{setSortField('status');setSortDir(d=>sortField==='status'&&d==='desc'?'asc':'desc')}}>
                  Status {sortField==='status' ? (sortDir==='asc'?'▲':'▼') : ''}
                </th>
                <th style={{padding:'8px 12px', textAlign:'left', minWidth: 180}}>Dodatki</th>
                <th style={{padding:'8px 12px'}}></th>
                <th style={{padding:'8px 12px'}}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} style={{borderBottom:'1px solid #333'}}>
                  <td style={{padding:'8px 12px'}}>{b.date}</td>
                  <td style={{padding:'8px 12px'}}>{b.time.slice(0,5)}</td>
                  <td style={{padding:'8px 12px'}}>{b.user_email}</td>
                  <td style={{padding:'8px 12px'}}>{packageMap[b.package_id] || b.package_id}</td>
                  <td style={{padding:'8px 12px'}}>{roomMap[b.room_id] || b.room_id}</td>
                  <td style={{padding:'8px 12px'}}>{Number(b.total_price).toFixed(2)}</td>
                  <td style={{padding:'8px 12px', color: b.status==='paid' ? '#4caf50' : b.status==='pending' ? '#ff9f58' : b.status==='deposit' ? '#2196f3' : '#ff4d4f', fontWeight:700}}>{b.status}</td>
                  <td style={{padding:'8px 12px', minWidth: 180}}>{Array.isArray(b.extra_items) && b.extra_items.length > 0 ? b.extra_items.map((ei: {id: string; count?: number}) => `${extraItemMap[ei.id] || ei.id}${ei.count ? ` ×${ei.count}` : ''}`).join(', ') : '-'}</td>
                  <td style={{padding:'8px 12px'}}>
                    <button onClick={()=>openDetails(b.id)} style={{background:'#23222a', color:'#f36e21', border:'2px solid #f36e21', borderRadius:6, padding:'6px 18px', fontWeight:600, cursor:'pointer'}}>Szczegóły</button>
                  </td>
                  <td style={{padding:'8px 12px', display:'block', verticalAlign:'middle', gap:10}}>
                    <button onClick={()=>quickStatus(b.id,'paid')} style={{background:'#4caf50', color:'#fff', border:'none', borderRadius:6, padding:'6px 10px', fontWeight:600, cursor:'pointer', fontSize:13, margin: 5}}>Opłać</button>
                    <button onClick={()=>quickStatus(b.id,'deposit')} style={{background:'#2196f3', color:'#fff', border:'none', borderRadius:6, padding:'6px 10px', fontWeight:600, cursor:'pointer', fontSize:13, margin: 5}}>Zaliczka</button>
                    <button onClick={()=>quickStatus(b.id,'pending')} style={{background:'#ff9f58', color:'#fff', border:'none', borderRadius:6, padding:'6px 10px', fontWeight:600, cursor:'pointer', fontSize:13, margin: 5}}>Oczekuje</button>
                    <button onClick={()=>quickStatus(b.id,'cancelled')} style={{background:'#ff4d4f', color:'#fff', border:'none', borderRadius:6, padding:'6px 10px', fontWeight:600, cursor:'pointer', fontSize:13, margin: 5}}>Anuluj</button>
                  </td>
                  <td style={{padding:'8px 12px', textAlign:'center'}}>
                    {adminRole === 'superadmin' && (
                      <button onClick={()=>setDeleteId(b.id)} title="Usuń rezerwację" style={{background:'#ff4d4f', color:'#fff', border:'none', borderRadius:6, padding:'6px 12px', fontWeight:600, cursor:'pointer', fontSize:15, display:'flex', alignItems:'center', gap:4, opacity:0.85}}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M4 6v6a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#fff" strokeWidth="1.5"/><path d="M2 4h12M6 2h4a1 1 0 0 1 1 1v1H5V3a1 1 0 0 1 1-1Z" stroke="#fff" strokeWidth="1.5"/></svg>
                        <span style={{fontSize:13}}>Usuń</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Модальное окно подробностей */}
      {detailsId && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{background:'#23222a', borderRadius:14, padding:'36px 32px', minWidth:340, maxWidth:480, boxShadow:'0 4px 32px #0008', color:'#fff', display:'flex', flexDirection:'column', gap:18, position:'relative'}}>
            <button onClick={()=>{setDetailsId(null);setDetails(null);}} style={{position:'absolute', top:16, right:16, background:'none', border:'none', color:'#fff', fontSize:22, cursor:'pointer'}}>×</button>
            <h2 style={{color:'#f36e21', fontWeight:800, fontSize:22, marginBottom:8}}>Szczegóły rezerwacji</h2>
            {detailsLoading || !details ? (
              <div>Ładowanie...</div>
            ) : (
              editMode && editForm ? (
                <form onSubmit={handleEditSave} style={{display:'flex',flexDirection:'column',gap:12}}>
                  <label>Data:
                    <input type="date" value={editForm.date} onChange={e=>setEditForm({...editForm,date:e.target.value})} required style={{background:'#18171c',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'8px 14px',fontSize:16,fontWeight:600, marginLeft: 10}} />
                  </label>
                  <label>Godzina:
                    <input type="time" value={editForm.time} onChange={e=>setEditForm({...editForm,time:e.target.value})} required style={{background:'#18171c',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'8px 14px',fontSize:16,fontWeight:600, marginLeft: 10}} />
                  </label>
                  <label>E-mail:
                    <input type="email" value={editForm.user_email} onChange={e=>setEditForm({...editForm,user_email:e.target.value})} required style={{background:'#18171c',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'8px 14px',fontSize:16,fontWeight:600, marginLeft: 10}} />
                  </label>
                  <label>Pakiet:
                    <select value={editForm.package_id} onChange={e=>setEditForm({...editForm,package_id:e.target.value})} required style={{background:'#18171c',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'8px 14px',fontSize:16,fontWeight:600, marginLeft: 10}}>
                      {Object.entries(packageMap).map(([id, name])=>(<option key={id} value={id}>{name}</option>))}
                    </select>
                  </label>
                  <label>Pokój:
                    <select value={editForm.room_id} onChange={e=>setEditForm({...editForm,room_id:e.target.value})} required style={{background:'#18171c',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'8px 14px',fontSize:16,fontWeight:600, marginLeft: 10}}>
                      {Object.entries(roomMap).map(([id, name])=>(<option key={id} value={id}>{name}</option>))}
                    </select>
                  </label>
                  <label>Status:
                    <select value={editForm.status} onChange={e=>setEditForm({...editForm,status:e.target.value})} required style={{background:'#18171c',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'8px 14px',fontSize:16,fontWeight:600, marginLeft: 10}}>
                      <option value="pending">Oczekuje</option>
                      <option value="paid">Opłacone</option>
                      <option value="deposit">Zaliczka</option>
                      <option value="cancelled">Anulowane</option>
                    </select>
                  </label>
                  <label>Kod promocyjny:
                    <input type="text" value={editForm.promo_code||''} onChange={e=>setEditForm({...editForm,promo_code:e.target.value})} style={{background:'#18171c',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'8px 14px',fontSize:16,fontWeight:600, marginLeft: 10}} />
                  </label>
                  <label>Suma:
                    <input type="number" value={editForm.total_price} onChange={e=>setEditForm({...editForm,total_price:Number(e.target.value)})} required style={{background:'#18171c',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'8px 14px',fontSize:16,fontWeight:600, marginLeft: 10}} />
                  </label>
                  {/* Можно добавить редактирование доп. предметов при необходимости */}
                  <div style={{display:'flex',gap:12,marginTop:8}}>
                    <button type="submit" style={{background:'#f36e21',color:'#fff',border:'none',borderRadius:8,padding:'10px 28px',fontWeight:700,fontSize:17,cursor:'pointer'}}>Zapisz</button>
                    <button type="button" onClick={()=>setEditMode(false)} style={{background:'#23222a',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'10px 28px',fontWeight:700,fontSize:17,cursor:'pointer'}}>Anuluj</button>
                  </div>
                </form>
              ) : (
              <div style={{fontSize:16, lineHeight:1.7}}>
                <div><b>Data:</b> {details.date}</div>
                <div><b>Godzina:</b> {details.time?.slice(0,5)}</div>
                <div><b>E-mail:</b> {details.user_email}</div>
                <div><b>Pakiet:</b> {packageMap[details.package_id] || details.package_id}</div>
                <div><b>Pokój:</b> {roomMap[details.room_id] || details.room_id}</div>
                <div><b>Suma:</b> {Number(details.total_price).toFixed(2)} PLN</div>
                <div><b>Status:</b> {details.status}</div>
                {details.promo_code && <div><b>Kod promocyjny:</b> {details.promo_code}</div>}
                {details.extra_items && Array.isArray(details.extra_items) && details.extra_items.length > 0 && (
                  <div><b>Dodatkowe przedmioty:</b>
                    <ul style={{margin:'6px 0 0 18px'}}>
                      {details.extra_items.map((ei, idx) => (
                        <li key={idx}>{extraItemMap[ei.id] || ei.id}{ei.count ? ` × ${ei.count}` : ''}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div style={{fontSize:13, color:'#aaa', marginTop:8}}><b>Utworzono:</b> {details.created_at?.replace('T',' ').slice(0,16)}</div>
                <div style={{marginTop:18}}>
                  <b>Historia zmian:</b>
                  {historyLoading ? (
                    <div style={{color:'#ff9f58', fontSize:14, marginTop:6}}>Ładowanie historii...</div>
                  ) : history.length === 0 ? (
                    <div style={{color:'#aaa', fontSize:14, marginTop:6}}>Brak historii zmian.</div>
                  ) : (
                    <ul style={{margin:'8px 0 0 18px', fontSize:14}}>
                      {history.map(h => (
                        <li key={h.id} style={{marginBottom:4}}>
                          <span style={{color:'#ff9f58'}}>{h.created_at.replace('T',' ').slice(0,16)}</span>: <b>{h.action}</b>{h.comment ? ` — ${h.comment}` : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div style={{marginTop:18}}>
                  <b>Komentarze:</b>
                  {commentsLoading ? (
                    <div style={{color:'#ff9f58', fontSize:14, marginTop:6}}>Ładowanie komentarzy...</div>
                  ) : comments.length === 0 ? (
                    <div style={{color:'#aaa', fontSize:14, marginTop:6}}>Brak komentarzy.</div>
                  ) : (
                    <ul style={{margin:'8px 0 0 18px', fontSize:14}}>
                      {comments.map(c => (
                        <li key={c.id} style={{marginBottom:4}}>
                          <span style={{color:'#ff9f58'}}>{c.created_at.replace('T',' ').slice(0,16)}</span> <b>{c.author_role === 'admin' ? 'Admin' : 'Klient'}:</b> {c.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div style={{marginTop:18,display:'flex',gap:12}}>
                  <button onClick={()=>{if(details) {setEditForm({...details});setEditMode(true);}}} style={{background:'#2196f3',color:'#fff',border:'none',borderRadius:8,padding:'10px 28px',fontWeight:700,fontSize:17,cursor:'pointer'}}>Edytuj</button>
                </div>
              </div>
              )
            )}
            {adminRole === 'superadmin' && details && (
              <button onClick={()=>setDeleteId(details.id)} style={{marginTop:24, background:'#ff4d4f', color:'#fff', border:'none', borderRadius:8, padding:'10px 0', fontWeight:700, fontSize:16, cursor:'pointer', opacity:0.85, display:'flex', alignItems:'center', gap:8, justifyContent:'center'}}>
                <svg width="18" height="18" fill="none" viewBox="0 0 16 16"><path d="M4 6v6a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#fff" strokeWidth="1.5"/><path d="M2 4h12M6 2h4a1 1 0 0 1 1 1v1H5V3a1 1 0 0 1 1-1Z" stroke="#fff" strokeWidth="1.5"/></svg>
                <span style={{fontSize:15}}>Usuń rezerwację</span>
              </button>
            )}
          </div>
        </div>
      )}
      {/* Модальное окно добавления бронирования */}
      {addModalOpen && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div className="modal-booking-simple">
            <div className="modal-simple-header">
              <span className="modal-simple-title">Dodaj rezerwację</span>
              <button className="modal-simple-close" type="button" onClick={()=>setAddModalOpen(false)} title="Zamknij">×</button>
            </div>
            <form onSubmit={handleAddBooking} className="form-simple">
              <label>Pakiet:
                <select value={addForm.package_id} onChange={e=>setAddForm({...addForm,package_id:e.target.value})} required>
                  <option value="">Wybierz pakiet</option>
                  {Object.entries(packageMap).map(([id, name])=>(<option key={id} value={id}>{name}</option>))}
                </select>
              </label>
              <label>Data:
                <DatePicker
                  selected={addForm.date ? new Date(addForm.date + 'T12:00:00') : null}
                  onChange={date => {
                    if (date) {
                      const iso = date.getFullYear() + '-' +
                        String(date.getMonth() + 1).padStart(2, '0') + '-' +
                        String(date.getDate()).padStart(2, '0');
                      setAddForm(f => ({ ...f, date: iso, time: '' }));
                    }
                  }}
                  filterDate={isDateAvailable}
                  minDate={new Date()}
                  maxDate={new Date(new Date().getFullYear(), new Date().getMonth() + 6, 0)}
                  onMonthChange={handleMonthChange}
                  placeholderText="Wybierz datę"
                  dateFormat="yyyy-MM-dd"
                  className="datepicker-input"
                  disabled={loadingDates || availableDates.length === 0}
                  popperPlacement="bottom"
                  locale="pl"
                />
                {loadingDates && <span className="modal-hint" style={{color:'#fff', background:'#009900', borderRadius:6, padding:'4px 10px', fontSize:14, fontWeight:600}}>Ładowanie...</span>}
                {!loadingDates && addForm.package_id === '' && <span className="modal-hint">Najpierw wybierz pakiet</span>}
                {!loadingDates && addForm.package_id !== '' && availableDates.length === 0 && <span className="modal-hint">Brak dostępnych dat</span>}
              </label>
              <label>Godzina:
                {timesLoading ? (
                  <span className="modal-hint">Ładowanie...</span>
                ) : availableTimes.length === 0 ? (
                  <span className="modal-hint">Najpierw wybierz datę</span>
                ) : (
                  <select value={addForm.time} onChange={e=>setAddForm({...addForm,time:e.target.value})} required>
                    <option value="">Wybierz godzinę</option>
                    {availableTimes.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                )}
              </label>
              <label>E-mail:
                <input type="email" value={addForm.user_email} onChange={e=>setAddForm({...addForm,user_email:e.target.value})} required />
              </label>
              <label>Imię:
                <input type="text" value={addForm.name} onChange={e=>setAddForm({...addForm,name:e.target.value})} />
              </label>
              <label>Telefon:
                <input type="text" value={addForm.phone} onChange={e=>setAddForm({...addForm,phone:e.target.value})} />
              </label>
              <label>Suma (PLN):
                <input type="number" value={addForm.total_price} readOnly tabIndex={-1} style={{background:'#222', color:'#fff', opacity:0.8, cursor:'not-allowed'}} />
              </label>
              <label>Status:
                <select value={addForm.status} onChange={e=>setAddForm({...addForm,status:e.target.value})} required>
                  <option value="pending">Oczekuje</option>
                  <option value="paid">Opłacone</option>
                  <option value="deposit">Zaliczka</option>
                  <option value="cancelled">Anulowane</option>
                </select>
              </label>
              <label>Kod promocyjny:
                <input type="text" value={addForm.promo_code} onChange={e=>setAddForm({...addForm,promo_code:e.target.value})} />
              </label>
              {extraItems.length > 0 && (
                <label>Dodatki:
                  <div style={{margin:'8px 0 8px 0',display:'flex',flexDirection:'column',gap:8}}>
                    {extraItems.map(item => {
                      const selected = addExtraItems.find(ei => ei.id === item.id)?.count || 0;
                      return (
                        <div key={item.id} style={{display:'flex',alignItems:'center',background:'#18171c',border:'1.5px solid #f36e21',borderRadius:6,padding:'6px 10px',fontSize:15,fontWeight:600}}>
                          <span style={{flex:1}}>{item.name} (+{item.price} zł)</span>
                          <button type="button" onClick={()=>setAddExtraItems(eis=>eis.map(ei=>ei.id===item.id?{...ei,count:Math.max(0,ei.count-1)}:ei))} disabled={selected===0} style={{marginRight:6}}>-</button>
                          <input type="number" min={0} value={selected} onChange={e=>{
                            const value = Math.max(0,Number(e.target.value));
                            setAddExtraItems(eis=>[...eis.filter(ei=>ei.id!==item.id),...(value>0?[{id:item.id,count:value}]:[])]);
                          }} style={{width:78,textAlign:'center'}} />
                          <button type="button" onClick={()=>setAddExtraItems(eis=>[...eis.filter(ei=>ei.id!==item.id),{id:item.id,count:selected+1}])} style={{marginLeft:6}}>+</button>
                        </div>
                      );
                    })}
                  </div>
                </label>
              )}
              <div className="modal-simple-actions">
                <button type="submit" disabled={addLoading} className="modal-btn-simple modal-btn-main">{addLoading ? 'Dodawanie...' : 'Dodaj'}</button>
                <button type="button" onClick={()=>setAddModalOpen(false)} className="modal-btn-simple modal-btn-cancel">Anuluj</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Модальное окно подтверждения удаления */}
      {deleteId && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.55)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{background:'#23222a', borderRadius:14, padding:'36px 32px', minWidth:320, boxShadow:'0 4px 32px #0008', color:'#fff', display:'flex', flexDirection:'column', gap:18, alignItems:'center'}}>
            <div style={{fontSize:18, fontWeight:700, marginBottom:8}}>Czy na pewno chcesz usunąć tę rezerwację?</div>
            <div style={{display:'flex', gap:12}}>
              <button onClick={()=>handleDeleteBooking(deleteId)} disabled={deleteLoading} style={{background:'#ff4d4f', color:'#fff', border:'none', borderRadius:8, padding:'10px 28px', fontWeight:700, fontSize:17, cursor:deleteLoading?'not-allowed':'pointer'}}>{deleteLoading ? 'Usuwanie...' : 'Usuń'}</button>
              <button onClick={()=>setDeleteId(null)} style={{background:'#23222a', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 28px', fontWeight:700, fontSize:17, cursor:'pointer'}}>Anuluj</button>
            </div>
          </div>
        </div>
      )}
      {/* Глобальные стили для react-datepicker */}
      <style jsx global>{`
        .modal-booking-simple {
          background: #23222a;
          border-radius: 10px;
          color: #fff;
          max-width: 420px;
          min-width: 260px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-y: auto;
          box-shadow: 0 4px 24px #0007;
        }
        .modal-simple-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 18px 8px 18px;
        }
        .modal-simple-title {
          font-size: 20px;
          font-weight: 700;
          color: #f36e21;
        }
        .modal-simple-close {
          background: none;
          border: none;
          color: #fff;
          font-size: 28px;
          font-weight: 700;
          cursor: pointer;
          line-height: 1;
          padding: 0 6px;
        }
        .modal-simple-close:hover {
          color: #f36e21;
        }
        .form-simple {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 10px 18px 18px 18px;
        }
        .form-simple label {
          font-weight: 500;
          font-size: 15px;
          margin-bottom: 2px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .form-simple input,
        .form-simple select,
        .form-simple .datepicker-input {
          min-height: 36px;
          width: 100%;
          box-sizing: border-box;
          background: #18171c;
          color: #fff;
          border: 1.5px solid #f36e21;
          border-radius: 6px;
          padding: 7px 12px;
          font-size: 15px;
          font-weight: 500;
        }
        .modal-hint {
          display: block;
          margin-top: 2px;
          color: #aaa;
          font-size: 13px;
        }
        .modal-simple-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 10px;
        }
        .modal-btn-simple {
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 700;
          padding: 9px 22px;
          cursor: pointer;
        }
        .modal-btn-main {
          background: #f36e21;
          color: #fff;
        }
        .modal-btn-main:disabled {
          background: #bdbdbd;
          color: #fff;
          cursor: not-allowed;
        }
        .modal-btn-cancel {
          background: #23222a;
          color: #fff;
          border: 1.5px solid #f36e21;
        }
        .modal-btn-cancel:hover {
          background: #18171c;
          color: #f36e21;
        }
        @media (max-width: 600px) {
          .modal-booking-simple {
            max-width: 100vw;
            min-width: 0;
            width: 100vw;
            height: 100vh;
            border-radius: 0;
          }
          .modal-simple-header, .form-simple {
            padding-left: 8px;
            padding-right: 8px;
          }
        }
        /* Остальные стили react-datepicker — как раньше */
        .datepicker-input {
          background: #18171c;
          color: #fff;
          border: 1.5px solid #f36e21;
          border-radius: 6px;
          padding: 7px 12px;
          font-size: 15px;
          font-weight: 500;
          width: 100%;
        }
        .react-datepicker__input-container input {
          background: #18171c;
          color: #fff;
          border: 1.5px solid #f36e21;
          border-radius: 6px;
          padding: 7px 12px;
          font-size: 15px;
          font-weight: 500;
          width: 100%;
        }
        .react-datepicker {
          background: #23222a;
          border: 1.5px solid #f36e21;
          color: #fff;
        }
        .react-datepicker__header {
          background: #18171c;
          border-bottom: 1px solid #f36e21;
        }
        .react-datepicker__day,
        .react-datepicker__day-name {
          color: #fff;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background: #f36e21;
          color: #fff;
        }
        .react-datepicker__day--today {
          box-shadow: 0 0 0 2px #f36e21;
          border-radius: 6px;
        }
        .react-datepicker__day--disabled {
          color: #888;
          background: #02020290;
          color: #990000;
          border-radius: 8px;
          font-weight: 600;
        }
        .react-datepicker__current-month,
        .react-datepicker__navigation-icon {
          color: #fff;
        }
        .react-datepicker__triangle {
          display: none;
        }
      `}</style>
    </div>
  );
}