"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import { withAdminAuth } from './components/withAdminAuth';
// Графики
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

function TooltipInfo({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{position:'relative', display:'inline-block', marginLeft:6}}>
      <span
        style={{
          cursor:'pointer',
          color:'#ff9f58',
          fontWeight:700,
          fontSize:18,
          verticalAlign:'middle',
          background:'#23222a',
          borderRadius: '50%',
          padding: '2px 6px'
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
          {text}
        </span>
      )}
    </span>
  );
}

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<{ email: string, role: string } | null>(null);
  const [stats, setStats] = useState<{ total: number, today: number, revenue: number } | null>(null);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [packageStats, setPackageStats] = useState<Array<{name: string, count: number, sum: number}>>([]);
  const [clientStats, setClientStats] = useState<Array<{email: string, count: number, sum: number}>>([]);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    async function fetchAdmin() {
      const email = typeof window !== 'undefined' ? localStorage.getItem('admin_email') : null;
      if (!email) return;
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();
      if (adminData) setAdmin({ email, role: adminData.role });
    }
    fetchAdmin();
  }, []);

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

  async function fetchReport() {
    setReportLoading(true);
    let query = supabase.from('bookings').select('id, date, total_price, package_id, user_email');
    if (dateFrom) query = query.gte('date', dateFrom);
    if (dateTo) query = query.lte('date', dateTo);
    const { data: bookings } = await query;
    const { data: packages } = await supabase.from('packages').select('id, name');
    const packageMap = Object.fromEntries((packages||[]).map((p:{id:string, name:string})=>[p.id,p.name]));
    const byPackage: Record<string, {name:string, count:number, sum:number}> = {};
    const byClient: Record<string, {email:string, count:number, sum:number}> = {};
    for (const b of bookings||[]) {
      if (!byPackage[b.package_id]) byPackage[b.package_id] = {name: packageMap[b.package_id]||b.package_id, count:0, sum:0};
      byPackage[b.package_id].count++;
      byPackage[b.package_id].sum += Number(b.total_price)||0;
      if (!byClient[b.user_email]) byClient[b.user_email] = {email: b.user_email, count:0, sum:0};
      byClient[b.user_email].count++;
      byClient[b.user_email].sum += Number(b.total_price)||0;
    }
    setPackageStats(Object.values(byPackage).sort((a,b)=>b.count-a.count));
    setClientStats(Object.values(byClient).sort((a,b)=>b.sum-a.sum));
    setReportLoading(false);
  }

  useEffect(()=>{ fetchReport(); }, [dateFrom, dateTo]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_email');
    }
    window.location.replace('/admin/login');
  };

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

  const COLORS = ['#f36e21', '#ff9f58', '#4caf50', '#2196f3', '#ff4d4f', '#9c27b0', '#00bcd4'];

  if (admin && admin.role !== 'superadmin') {
    return <div style={{color:'#fff',marginTop:80,textAlign:'center',fontSize:22}}>Dostęp tylko dla superadmina</div>;
  }

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
      <div
        style={{
          width: "100%",
          maxWidth: 1600,
          margin: "0 auto",
          padding: "18px 8px 18px 8px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 18,
          alignItems: "flex-start"
        }}
      >
        {/* Блок приветствия и кнопка выхода */}
        <div style={{gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6}}>
          <h1 style={{ fontSize: 28, fontWeight: 100, color: "#f36e21", margin: 0 }}>Panel administracyjny</h1>
          <button onClick={handleLogout} style={{ background: '#23222a', color: '#fff', border: '2px solid #f36e21', borderRadius: 8, padding: '6px 18px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Wyloguj się</button>
        </div>
        <div style={{gridColumn: '1 / -1', background: "rgba(30,30,30,0.98)", borderRadius: 14, boxShadow: "0 2px 12px 0 rgba(0,0,0,0.18)", padding: 14, marginBottom: 0, fontSize:15}}>
          <b>Witaj, {admin?.email}!</b> Twoja rola: <span style={{ color: '#ff9f58', fontWeight: 700 }}>{admin?.role}</span>. Zarządzaj rezerwacjami, pakietami, promocjami i klientami.
        </div>
        {/* Статистика */}
        <div style={{background:'#23222a', borderRadius:10, padding:'12px 10px', color:'#fff', fontWeight:700, fontSize:18, boxShadow:'0 1px 8px #0003', minWidth:180, minHeight:80, display:'flex', flexDirection:'column', gap:2}}>
          <span style={{fontSize:13, color:'#ff9f58', fontWeight:600, marginBottom:2}}>Wszystkie rezerwacje <TooltipInfo text="Łączna liczba wszystkich rezerwacji w systemie." /></span>
          <span style={{fontSize:26, color:'#f36e21', fontWeight:900}}>{stats?.total ?? '-'}</span>
        </div>
        <div style={{background:'#23222a', borderRadius:10, padding:'12px 10px', color:'#fff', fontWeight:700, fontSize:18, boxShadow:'0 1px 8px #0003', minWidth:180, minHeight:80, display:'flex', flexDirection:'column', gap:2}}>
          <span style={{fontSize:13, color:'#ff9f58', fontWeight:600, marginBottom:2}}>Rezerwacje dzisiaj <TooltipInfo text="Liczba rezerwacji utworzonych dzisiaj (wg daty)." /></span>
          <span style={{fontSize:26, color:'#f36e21', fontWeight:900}}>{stats?.today ?? '-'}</span>
        </div>
        <div style={{background:'#23222a', borderRadius:10, padding:'12px 10px', color:'#fff', fontWeight:700, fontSize:18, boxShadow:'0 1px 8px #0003', minWidth:180, minHeight:80, display:'flex', flexDirection:'column', gap:2}}>
          <span style={{fontSize:13, color:'#ff9f58', fontWeight:600, marginBottom:2}}>Przychód (PLN) <TooltipInfo text="Suma przychodu brutto z wszystkich rezerwacji." /></span>
          <span style={{fontSize:26, color:'#f36e21', fontWeight:900}}>{stats?.revenue ?? '-'}</span>
        </div>
        {/* Фильтр по dacie + таблица по пакетам */}
        <div style={{background:'#23222a', borderRadius:10, padding:10, width:'100%', minWidth:260, gridColumn: '1 / -1', boxShadow:'0 1px 8px #0003', marginBottom:0}}>
          <div style={{fontWeight:700, fontSize:16, color:'#f36e21', marginBottom:6, display:'flex', alignItems:'center', gap:6}}>
            Raport za okres <TooltipInfo text="Wybierz zakres dat, aby zobaczyć statystyki rezerwacji i przychodu dla każdego pakietu." />
          </div>
          <div style={{display:'flex', gap:8, marginBottom:10, flexWrap:'wrap'}}>
            <div>
              <label>Data od:<br/>
                <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{background:'#18171c',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'4px 8px',fontSize:14,fontWeight:500,outline:'none',minWidth:120}} />
              </label>
            </div>
            <div>
              <label>Data do:<br/>
                <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{background:'#18171c',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'4px 8px',fontSize:14,fontWeight:500,outline:'none',minWidth:120}} />
              </label>
            </div>
            <button onClick={fetchReport} disabled={reportLoading} style={{background:'#f36e21',color:'#fff',border:'none',borderRadius:8,padding:'6px 16px',fontWeight:700,fontSize:14,cursor:reportLoading?'not-allowed':'pointer',marginTop:18}}>Odśwież</button>
            <button onClick={()=>{setDateFrom('');setDateTo('');}} style={{background:'#23222a',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'6px 12px',fontWeight:700,fontSize:14,cursor:'pointer',marginTop:18}}>Wyczyść</button>
            <button onClick={exportCSV} style={{background:'#4caf50',color:'#fff',border:'none',borderRadius:8,padding:'6px 16px',fontWeight:700,fontSize:14,cursor:'pointer',marginTop:18}}>Eksportuj CSV</button>
          </div>
          {/* Таблица по пакетам за период */}
          <div style={{marginBottom:10}}>
            <div style={{fontWeight:600, fontSize:15, marginBottom:4, color:'#ff9f58', display:'flex', alignItems:'center', gap:6}}>
              Raport po pakietach <TooltipInfo text="Liczba rezerwacji i suma przychodu dla każdego pakietu w wybranym okresie." />
            </div>
            <table style={{width:'100%', borderCollapse:'collapse', background:'#18171c', color:'#fff', borderRadius:8, overflow:'hidden', fontSize:14}}>
              <thead>
                <tr style={{background:'#23222a', color:'#ff9f58'}}>
                  <th style={{padding:'6px 8px', textAlign:'left'}}>Pakiet</th>
                  <th style={{padding:'6px 8px', textAlign:'left'}}>Rezerwacje</th>
                  <th style={{padding:'6px 8px', textAlign:'left'}}>Suma (PLN)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{background:'#23222a', fontWeight:700}}>
                  <td style={{padding:'6px 8px'}}>Wszystkie pakiety</td>
                  <td style={{padding:'6px 8px'}}>{packageStats.reduce((acc, p) => acc + p.count, 0)}</td>
                  <td style={{padding:'6px 8px'}}>{packageStats.reduce((acc, p) => acc + p.sum, 0).toFixed(2)}</td>
                </tr>
                {packageStats.map((p,idx)=>(
                  <tr key={idx} style={{borderBottom:'1px solid #333'}}>
                    <td style={{padding:'6px 8px'}}>{p.name}</td>
                    <td style={{padding:'6px 8px'}}>{p.count}</td>
                    <td style={{padding:'6px 8px'}}>{p.sum.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Графики и топ-клиенты */}
        <div style={{width:'100%', minWidth:260, gridColumn: '1 / -1', display:'flex', gap:18, flexWrap:'wrap', marginBottom:0}}>
          {/* Столбчатая диаграмма по пакетам */}
          <div style={{flex:'1 1 320px', minWidth:260, background:'#18171c', borderRadius:10, padding:10, marginBottom:0}}>
            <div style={{fontWeight:600, fontSize:14, marginBottom:4, color:'#ff9f58', display:'flex', alignItems:'center', gap:6}}>
              Pakiety (liczba rezerwacji) <TooltipInfo text="Wizualizacja liczby rezerwacji dla każdego pakietu w wybranym okresie." />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={packageStats} margin={{top:6,right:6,left:0,bottom:6}}>
                <XAxis dataKey="name" stroke="#fff" fontSize={12} tick={{fill:'#fff'}} interval={0} angle={-15} dy={10} height={50} />
                <YAxis stroke="#fff" fontSize={12} tick={{fill:'#fff'}} allowDecimals={false} />
                <RechartsTooltip contentStyle={{background:'#23222a',color:'#fff',border:'1px solid #f36e21', fontSize:13}} />
                <Bar dataKey="count" fill="#f36e21">
                  {packageStats.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Круговая диаграмма по клиентам */}
          <div style={{flex:'1 1 320px', minWidth:260, background:'#18171c', borderRadius:10, padding:10, marginBottom:0}}>
            <div style={{fontWeight:600, fontSize:14, marginBottom:4, color:'#ff9f58', display:'flex', alignItems:'center', gap:6}}>
              Top 5 klientów (wg sumy) <TooltipInfo text="Najlepsi klienci według sumy wydatków w wybranym okresie." />
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={clientStats.slice(0,5)}
                  dataKey="sum"
                  nameKey="email"
                  cx="40%"
                  cy="50%"
                  outerRadius={60}
                  label={({percent})=>`${(percent*100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {clientStats.slice(0,5).map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{background:'#fff',color:'#000',border:'1px solid #f36e21', fontSize:13}} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  formatter={(value, entry, idx) => (
                    <span style={{color:'#fff',fontSize:12}}>{clientStats[idx]?.email}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Статистика по пакетам */}
        <div style={{marginBottom:10, background:'#23222a', borderRadius:10, padding:10}}>
          <div style={{fontWeight:600, fontSize:15, marginBottom:4, color:'#ff9f58', display:'flex', alignItems:'center', gap:6}}>
            Statystyka według pakietów <TooltipInfo text="Podsumowanie liczby rezerwacji i przychodu dla każdego pakietu (wszystkie dane)." />
          </div>
          <table style={{width:'100%', borderCollapse:'collapse', background:'#18171c', color:'#fff', borderRadius:8, overflow:'hidden', fontSize:14}}>
            <thead>
              <tr style={{background:'#23222a', color:'#ff9f58'}}>
                <th style={{padding:'6px 8px', textAlign:'left'}}>Pakiet</th>
                <th style={{padding:'6px 8px', textAlign:'left'}}>Liczba rezerwacji</th>
                <th style={{padding:'6px 8px', textAlign:'left'}}>Suma (PLN)</th>
              </tr>
            </thead>
            <tbody>
              {packageStats.length === 0 ? (
                <tr><td colSpan={3} style={{padding:'6px 8px', color:'#aaa'}}>Brak danych</td></tr>
              ) : packageStats.map((p,idx)=>(
                <tr key={idx} style={{borderBottom:'1px solid #333'}}>
                  <td style={{padding:'6px 8px'}}>{p.name}</td>
                  <td style={{padding:'6px 8px'}}>{p.count}</td>
                  <td style={{padding:'6px 8px'}}>{p.sum.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Статистика по клиентам */}
        <div style={{background:'#23222a', borderRadius:10, padding:10}}>
          <div style={{fontWeight:600, fontSize:15, marginBottom:4, color:'#ff9f58', display:'flex', alignItems:'center', gap:6}}>
            Top klienci (wg sumy) <TooltipInfo text="Suma dotyczy wszystkich zarezerwowanych terminów (nie tylko opłaconych). Klienci są sortowani według łącznej wartości wszystkich rezerwacji, niezależnie od ich statusu." />
          </div>
          <table style={{width:'100%', borderCollapse:'collapse', background:'#18171c', color:'#fff', borderRadius:8, overflow:'hidden', fontSize:14}}>
            <thead>
              <tr style={{background:'#23222a', color:'#ff9f58'}}>
                <th style={{padding:'6px 8px', textAlign:'left'}}>E-mail</th>
                <th style={{padding:'6px 8px', textAlign:'left'}}>Liczba rezerwacji</th>
                <th style={{padding:'6px 8px', textAlign:'left'}}>Suma (PLN)</th>
              </tr>
            </thead>
            <tbody>
              {clientStats.length === 0 ? (
                <tr><td colSpan={3} style={{padding:'6px 8px', color:'#aaa'}}>Brak danych</td></tr>
              ) : clientStats.slice(0,10).map((c,idx)=>(
                <tr key={idx} style={{borderBottom:'1px solid #333'}}>
                  <td style={{padding:'6px 8px'}}>{c.email}</td>
                  <td style={{padding:'6px 8px'}}>{c.count}</td>
                  <td style={{padding:'6px 8px'}}>{c.sum.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminDashboard); 