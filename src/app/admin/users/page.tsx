"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import { withAdminAuth } from '../components/withAdminAuth';

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  created_at?: string;
}

interface UserStats extends User {
  bookingsCount: number;
  bookingsSum: number;
}

function UsersPage() {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError("");
      // Получаем всех пользователей
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .returns<User[]>();
      if (usersError) {
        setError("Błąd ładowania użytkowników");
        setLoading(false);
        return;
      }
      // Получаем все бронирования
      type BookingRow = { user_email: string; total_price: number | string | null };
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('user_email, total_price')
        .returns<BookingRow[]>();
      if (bookingsError) {
        setError("Błąd ładowania rezerwacji");
        setLoading(false);
        return;
      }
      // Считаем количество и сумму бронирований для каждого пользователя
      const stats: UserStats[] = (usersData || []).map((u) => {
        const userBookings = (bookingsData || []).filter((b) => b.user_email === u.email);
        return {
          ...u,
          bookingsCount: userBookings.length,
          bookingsSum: userBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)
        };
      });
      setUsers(stats);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  // Фильтрация по имени или email
  const filteredUsers = users.filter(u =>
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Экспорт в CSV
  function exportCSV() {
    let csv = 'Email;Imię;Telefon;Data rejestracji;Liczba rezerwacji;Suma rezerwacji (PLN)\n';
    filteredUsers.forEach(u => {
      csv += `${u.email};${u.name || ''};${u.phone || ''};${u.created_at ? u.created_at.slice(0,10) : ''};${u.bookingsCount};${u.bookingsSum.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `klienci.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{color:'#fff', maxWidth:900, margin:'0 auto', padding:'48px 0'}}>
      <h1 style={{fontSize:28, fontWeight:100, color:'#f36e21', marginBottom:18}}>Klienci</h1>
      <p style={{fontSize:16, opacity:0.9, marginBottom:18}}>Lista wszystkich klientów, którzy dokonali rezerwacji lub zostali dodani przez panel administracyjny.</p>
      <div style={{display:'flex', gap:16, marginBottom:18}}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Szukaj po imieniu lub emailu..."
          style={{background:'#18171c',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'8px 14px',fontSize:16,fontWeight:500,minWidth:260}}
        />
        <button onClick={exportCSV} style={{background:'#4caf50',color:'#fff',border:'none',borderRadius:8,padding:'8px 22px',fontWeight:700,fontSize:15,cursor:'pointer'}}>Eksportuj CSV</button>
      </div>
      {error && <div style={{color:'#ff4d4f',marginBottom:12}}>{error}</div>}
      <div style={{background:'#23222a', borderRadius:12, padding:32, minHeight:120, color:'#fff', fontSize:16}}>
        {loading ? (
          <div>Ładowanie...</div>
        ) : filteredUsers.length === 0 ? (
          <div>Brak klientów.</div>
        ) : (
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#18171c', color:'#ff9f58'}}>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Email</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Imię</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Telefon</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Data rejestracji</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Liczba rezerwacji</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Suma rezerwacji (PLN)</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} style={{borderBottom:'1px solid #333'}}>
                  <td style={{padding:'8px 12px', fontWeight:700, color:'#f36e21'}}>{u.email}</td>
                  <td style={{padding:'8px 12px'}}>{u.name || '-'}</td>
                  <td style={{padding:'8px 12px'}}>{u.phone || '-'}</td>
                  <td style={{padding:'8px 12px'}}>{u.created_at ? u.created_at.slice(0,10) : '-'}</td>
                  <td style={{padding:'8px 12px'}}>{u.bookingsCount}</td>
                  <td style={{padding:'8px 12px'}}>{u.bookingsSum.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default withAdminAuth(UsersPage); 