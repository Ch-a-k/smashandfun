"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabaseClient';
// Графики
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<{ email: string, role: string } | null>(null);
  const [stats, setStats] = useState<{ total: number, today: number, revenue: number } | null>(null);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [packageStats, setPackageStats] = useState<Array<{name: string, count: number, sum: number}>>([]);
  const [clientStats, setClientStats] = useState<Array<{email: string, count: number, sum: number}>>([]);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const email = typeof window !== 'undefined' ? localStorage.getItem('admin_email') : null;
      if (!token || !email) {
        router.replace("/admin/login");
        return;
      }
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      if (userError || !userData.user || userData.user.email !== email) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_email');
        router.replace("/admin/login");
        return;
      }
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();
      if (adminError || !adminData) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_email');
        router.replace("/admin/login");
        return;
      }
      setAdmin({ email, role: adminData.role });
      setLoading(false);
    }
    checkAuth();
  }, [router]);

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
      if (!data || data.role !== "superadmin") {
        router.replace("/admin/bookings");
      }
    }
    checkRole();
  }, [router]);

  // Общая статистика (без фильтра)
  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('id, total_price, date');
      let total = 0, today = 0, revenue = 0;
      if (allBookings && Array.isArray(allBookings)) {
        total = allBookings.length;
        const todayStr = new Date().toISOString().slice(0, 10);
        today = allBookings.filter(b => b.date === todayStr).length;
        revenue = allBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
      }
      setStats({ total, today, revenue });
      setLoading(false);
    }
    fetchStats();
  }, []);

  // Функция для загрузки отчёта по фильтру
  async function fetchReport() {
    setReportLoading(true);
    // Фильтр по дате
    let query = supabase.from('bookings').select('id, date, total_price, package_id, user_email');
    if (dateFrom) query = query.gte('date', dateFrom);
    if (dateTo) query = query.lte('date', dateTo);
    const { data: bookings } = await query;
    // Получаем названия пакетов
    const { data: packages } = await supabase.from('packages').select('id, name');
    const packageMap = Object.fromEntries((packages||[]).map((p:{id:string, name:string})=>[p.id,p.name]));
    // Статистика по пакетам
    const byPackage: Record<string, {name:string, count:number, sum:number}> = {};
    // Статистика по клиентам
    const byClient: Record<string, {email:string, count:number, sum:number}> = {};
    for (const b of bookings||[]) {
      // По пакетам
      if (!byPackage[b.package_id]) byPackage[b.package_id] = {name: packageMap[b.package_id]||b.package_id, count:0, sum:0};
      byPackage[b.package_id].count++;
      byPackage[b.package_id].sum += Number(b.total_price)||0;
      // По клиентам
      if (!byClient[b.user_email]) byClient[b.user_email] = {email: b.user_email, count:0, sum:0};
      byClient[b.user_email].count++;
      byClient[b.user_email].sum += Number(b.total_price)||0;
    }
    setPackageStats(Object.values(byPackage).sort((a,b)=>b.count-a.count));
    setClientStats(Object.values(byClient).sort((a,b)=>b.sum-a.sum));
    setReportLoading(false);
  }

  // Автоматически подгружаем отчёт при изменении фильтра
  useEffect(()=>{ fetchReport(); }, [dateFrom, dateTo]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_email');
    }
    router.replace('/admin/login');
  };

  // Экспорт в CSV
  function exportCSV() {
    let csv = 'Pakiet;Liczba rezerwacji;Suma (PLN)\n';
    packageStats.forEach(p => {
      csv += `${p.name};${p.count};${p.sum.toFixed(2)}\n`;
    });
    csv += '\nE-mail;Liczba rezerwacji;Suma (PLN)\n';
    clientStats.forEach(c => {
      csv += `${c.email};${c.count};${c.sum.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statystyki_${dateFrom||'od'}_${dateTo||'do'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Цвета для графиков
  const COLORS = ['#f36e21', '#ff9f58', '#4caf50', '#2196f3', '#ff4d4f', '#9c27b0', '#00bcd4'];

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: 80 }}>Ładowanie...</div>;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: `#18171c url('https://www.toptal.com/designers/subtlepatterns/uploads/dot-grid.png') repeat`,
      padding: 0,
      margin: 0,
      color: "#fff"
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "48px 0 48px 0",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start"
      }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "#f36e21" }}>Panel administracyjny</h1>
          <button onClick={handleLogout} style={{ background: '#23222a', color: '#fff', border: '2px solid #f36e21', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Wyloguj się</button>
        </div>
        <div style={{
          background: "rgba(30,30,30,0.98)",
          borderRadius: 18,
          boxShadow: "0 4px 32px 0 rgba(0,0,0,0.18)",
          padding: 36,
          width: "100%",
          maxWidth: 700,
          marginBottom: 32
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>Witaj, {admin?.email}!</h2>
          <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 18 }}>
            Twoja rola: <span style={{ color: '#ff9f58', fontWeight: 700 }}>{admin?.role}</span><br />
            Tutaj znajdziesz statystyki, zarządzanie pakietami, promocjami i innymi funkcjami.<br />
            <span style={{ color: '#ff9f58' }}>To dopiero początek 🚀</span>
          </p>
          {/* <ul style={{ fontSize: 16, lineHeight: 2, marginLeft: 18 }}>
            <li>📊 Statystyki rezerwacji</li>
            <li>📝 Edycja pakietów i cen</li>
            <li>🎁 Zarządzanie promocjami</li>
            <li>🛠️ Zarządzanie przedmiotami i pokojami</li>
          </ul> */}
        </div>
        {/* Блок общей статистики */}
        <div style={{display:'flex', gap:24, marginBottom:32, flexWrap:'wrap'}}>
          <div style={{background:'#23222a', borderRadius:12, padding:'32px 36px', minWidth:220, minHeight:120, color:'#fff', fontWeight:700, fontSize:22, boxShadow:'0 2px 16px #0003'}}>
            {loading ? 'Ładowanie...' : <>
              <div style={{fontSize:15, color:'#ff9f58', fontWeight:600, marginBottom:8}}>Wszystkie rezerwacje</div>
              <div style={{fontSize:32, color:'#f36e21', fontWeight:900}}>{stats?.total ?? '-'}</div>
            </>}
          </div>
          <div style={{background:'#23222a', borderRadius:12, padding:'32px 36px', minWidth:220, minHeight:120, color:'#fff', fontWeight:700, fontSize:22, boxShadow:'0 2px 16px #0003'}}>
            {loading ? 'Ładowanie...' : <>
              <div style={{fontSize:15, color:'#ff9f58', fontWeight:600, marginBottom:8}}>Rezerwacje dzisiaj</div>
              <div style={{fontSize:32, color:'#f36e21', fontWeight:900}}>{stats?.today ?? '-'}</div>
            </>}
          </div>
          <div style={{background:'#23222a', borderRadius:12, padding:'32px 36px', minWidth:220, minHeight:120, color:'#fff', fontWeight:700, fontSize:22, boxShadow:'0 2px 16px #0003'}}>
            {loading ? 'Ładowanie...' : <>
              <div style={{fontSize:15, color:'#ff9f58', fontWeight:600, marginBottom:8}}>Przychód (PLN)</div>
              <div style={{fontSize:32, color:'#f36e21', fontWeight:900}}>{stats?.revenue ?? '-'}</div>
            </>}
          </div>
        </div>
        {/* Фильтр по дате */}
        <div style={{background:'#23222a', borderRadius:12, padding:24, marginBottom:32, width:'100%', maxWidth:700}}>
          <div style={{fontWeight:700, fontSize:18, color:'#f36e21', marginBottom:12}}>Raport za wybrany okres</div>
          <div style={{display:'flex', gap:16, marginBottom:18, flexWrap:'wrap'}}>
            <div>
              <label>Data od:<br/>
                <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{background:'#18171c',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'8px 14px',fontSize:15,fontWeight:500,outline:'none'}} />
              </label>
            </div>
            <div>
              <label>Data do:<br/>
                <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{background:'#18171c',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'8px 14px',fontSize:15,fontWeight:500,outline:'none'}} />
              </label>
            </div>
            <button onClick={fetchReport} disabled={reportLoading} style={{background:'#f36e21',color:'#fff',border:'none',borderRadius:8,padding:'8px 22px',fontWeight:700,fontSize:15,cursor:reportLoading?'not-allowed':'pointer',marginTop:22}}>Odśwież</button>
            <button onClick={()=>{setDateFrom('');setDateTo('');}} style={{background:'#23222a',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'8px 18px',fontWeight:700,fontSize:15,cursor:'pointer',marginTop:22}}>Wyczyść</button>
            <button onClick={exportCSV} style={{background:'#4caf50',color:'#fff',border:'none',borderRadius:8,padding:'8px 22px',fontWeight:700,fontSize:15,cursor:'pointer',marginTop:22}}>Eksportuj CSV</button>
          </div>
          {/* Графики */}
          <div style={{display:'flex', gap:32, flexWrap:'wrap', marginBottom:32}}>
            {/* Столбчатая диаграмма по пакетам */}
            <div style={{flex:'1 1 320px', minWidth:320, background:'#18171c', borderRadius:12, padding:18}}>
              <div style={{fontWeight:600, fontSize:15, marginBottom:8, color:'#ff9f58'}}>Pakiety (liczba rezerwacji)</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={packageStats} margin={{top:10,right:10,left:0,bottom:10}}>
                  <XAxis dataKey="name" stroke="#fff" fontSize={13} tick={{fill:'#fff'}} interval={0} angle={-15} dy={10} height={60} />
                  <YAxis stroke="#fff" fontSize={13} tick={{fill:'#fff'}} allowDecimals={false} />
                  <Tooltip contentStyle={{background:'#23222a',color:'#fff',border:'1px solid #f36e21'}} />
                  <Bar dataKey="count" fill="#f36e21">
                    {packageStats.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Круговая диаграмма по клиентам */}
            <div style={{flex:'1 1 320px', minWidth:320, background:'#18171c', borderRadius:12, padding:18}}>
              <div style={{fontWeight:600, fontSize:15, marginBottom:12, color:'#ff9f58'}}>Top 5 klientów (wg sumy)</div>
              <ResponsiveContainer width="100%" height={290}>
                <PieChart>
                  <Pie data={clientStats.slice(0,5)} dataKey="sum" nameKey="email" cx="50%" cy="50%" outerRadius={80} label={({percent})=>`${(percent*100).toFixed(0)}%`}>
                    {clientStats.slice(0,5).map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{background:'#23222a',color:'#fff',border:'1px solid #f36e21'}} />
                  <Legend formatter={(value, entry, idx) => <span style={{color:'#fff',fontSize:13}}>{clientStats[idx]?.email}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Статистика по пакетам */}
          <div style={{marginBottom:24}}>
            <div style={{fontWeight:600, fontSize:16, marginBottom:8}}>Statystyka według pakietów</div>
            <table style={{width:'100%', borderCollapse:'collapse', background:'#18171c', color:'#fff', borderRadius:8, overflow:'hidden'}}>
              <thead>
                <tr style={{background:'#23222a', color:'#ff9f58'}}>
                  <th style={{padding:'8px 12px', textAlign:'left'}}>Pakiet</th>
                  <th style={{padding:'8px 12px', textAlign:'left'}}>Liczba rezerwacji</th>
                  <th style={{padding:'8px 12px', textAlign:'left'}}>Suma (PLN)</th>
                </tr>
              </thead>
              <tbody>
                {packageStats.length === 0 ? (
                  <tr><td colSpan={3} style={{padding:'8px 12px', color:'#aaa'}}>Brak danych</td></tr>
                ) : packageStats.map((p,idx)=>(
                  <tr key={idx} style={{borderBottom:'1px solid #333'}}>
                    <td style={{padding:'8px 12px'}}>{p.name}</td>
                    <td style={{padding:'8px 12px'}}>{p.count}</td>
                    <td style={{padding:'8px 12px'}}>{p.sum.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Статистика по клиентам */}
          <div>
            <div style={{fontWeight:600, fontSize:16, marginBottom:8}}>Top klienci (wg sumy)</div>
            <table style={{width:'100%', borderCollapse:'collapse', background:'#18171c', color:'#fff', borderRadius:8, overflow:'hidden'}}>
              <thead>
                <tr style={{background:'#23222a', color:'#ff9f58'}}>
                  <th style={{padding:'8px 12px', textAlign:'left'}}>E-mail</th>
                  <th style={{padding:'8px 12px', textAlign:'left'}}>Liczba rezerwacji</th>
                  <th style={{padding:'8px 12px', textAlign:'left'}}>Suma (PLN)</th>
                </tr>
              </thead>
              <tbody>
                {clientStats.length === 0 ? (
                  <tr><td colSpan={3} style={{padding:'8px 12px', color:'#aaa'}}>Brak danych</td></tr>
                ) : clientStats.slice(0,10).map((c,idx)=>(
                  <tr key={idx} style={{borderBottom:'1px solid #333'}}>
                    <td style={{padding:'8px 12px'}}>{c.email}</td>
                    <td style={{padding:'8px 12px'}}>{c.count}</td>
                    <td style={{padding:'8px 12px'}}>{c.sum.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Информация о системе */}
        <div style={{background:'#23222a', borderRadius:12, padding:32, color:'#fff', fontSize:18, opacity:0.85, marginTop:12}}>
          <div style={{fontWeight:700, fontSize:20, color:'#f36e21', marginBottom:8}}>O systemie</div>
          <ul style={{marginBottom:12, fontSize:16, opacity:0.95}}>
            <li>• Panel administratora Smash&Fun</li>
            <li>• Zarządzanie rezerwacjami, pakietami, promocjami i przedmiotami</li>
            <li>• Szybki podgląd statystyk i przychodu</li>
            <li>• Wsparcie: <a href="mailto:hello@smashandfun.pl" style={{color:'#ff9f58'}}>hello@smashandfun.pl</a></li>
          </ul>
          <div style={{fontSize:15, opacity:0.7}}>Dokumentacja i instrukcje dostępne na życzenie.</div>
        </div>
      </div>
    </div>
  );
} 