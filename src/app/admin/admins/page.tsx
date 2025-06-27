"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import { withAdminAuth } from '../components/withAdminAuth';

interface Admin {
  id: string;
  email: string;
  role: 'admin' | 'superadmin';
}

function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<'admin'|'superadmin'>('admin');
  const [saving, setSaving] = useState(false);
  const [currentRole, setCurrentRole] = useState<string|null>(null);
  const [meEmail, setMeEmail] = useState<string|null>(null);
  const [changePwdId, setChangePwdId] = useState<string|null>(null);
  const [newPwd, setNewPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchAdmins() {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.from('admins').select('*').order('role', { ascending: false });
    if (error) {
      setError("Błąd ładowania listy administratorów");
      setLoading(false);
      return;
    }
    setAdmins(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchAdmins();
    // Pobierz swoją rolę i email
    const email = typeof window !== 'undefined' ? localStorage.getItem('admin_email') : null;
    setMeEmail(email);
    if (!email) return;
    supabase.from('admins').select('role').eq('email', email).single().then(({ data }) => setCurrentRole(data?.role || null));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
  
    if (!email || !password) {
      setError('Podaj email i hasło');
      setSaving(false);
      return;
    }
  
    try {
      const res = await fetch("/api/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        setError("Błąd tworzenia użytkownika: " + result.error);
      } else {
        setEmail("");
        setPassword("");
        setRole("admin");
        fetchAdmins();
      }
    } catch {
      setError("Nieznany błąd przy dodawaniu użytkownika");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, email: string) {
    if (email === meEmail) {
      setError('Nie możesz usunąć samego siebie');
      return;
    }
    setError("");
    setDeletingId(id);
    try {
      const res = await fetch("/api/delete-admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, email })
      });
      const result = await res.json();
      if (!res.ok) {
        setError('Błąd usuwania: ' + (result.error || 'Nieznany błąd'));
        setDeletingId(null);
        return;
      }
      fetchAdmins();
      setError("");
    } catch (e) {
      setError('Błąd usuwania: ' + (e as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleChangeRole(id: string, newRole: 'admin'|'superadmin') {
    const { error } = await supabase.from('admins').update({ role: newRole }).eq('id', id);
    if (error) {
      alert('Błąd zmiany roli: ' + error.message);
      return;
    }
    fetchAdmins();
  }

  async function handleChangePassword(email: string) {
    setPwdLoading(true);
    setError("");
    try {
      const res = await fetch("/api/change-admin-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword: newPwd })
      });
      const result = await res.json();
      setPwdLoading(false);
      setChangePwdId(null);
      setNewPwd("");
      if (!res.ok) {
        setError('Błąd zmiany hasła: ' + (result.error || 'Nieznany błąd'));
        return;
      }
      alert('Hasło zostało zmienione');
    } catch (e) {
      setPwdLoading(false);
      setError('Błąd zmiany hasła: ' + (e as Error).message);
    }
  }

  if (currentRole !== 'superadmin') {
    return <div style={{color:'#fff',marginTop:80,textAlign:'center',fontSize:22}}>Dostęp tylko dla superadmina</div>;
  }

  return (
    <div style={{color:'#fff'}}>
      <h1 style={{fontSize:28, fontWeight:100, color:'#f36e21', marginBottom:18}}>Administratorzy</h1>
      <p style={{fontSize:16, opacity:0.9, marginBottom:18}}>Zarządzaj dostępem: dodawaj, usuwaj i zmieniaj role administratorów. Możesz ustawić lub zmienić hasło.</p>
      <form onSubmit={handleAdd} style={{display:'flex',gap:12,marginBottom:24,alignItems:'center'}}>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required style={{background:'#18171c',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'8px 14px',fontSize:16,fontWeight:600}} />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Hasło" required style={{background:'#18171c',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'8px 14px',fontSize:16,fontWeight:600}} />
        <select value={role} onChange={e=>setRole(e.target.value as 'admin'|'superadmin')} style={{background:'#18171c',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'8px 14px',fontSize:16,fontWeight:600}}>
          <option value="admin">admin</option>
          <option value="superadmin">superadmin</option>
        </select>
        <button type="submit" disabled={saving} style={{background:'#f36e21',color:'#fff',border:'none',borderRadius:8,padding:'8px 22px',fontWeight:700,fontSize:16,cursor:saving?'not-allowed':'pointer'}}>Dodaj</button>
      </form>
      {error && <div style={{color:'#ff4d4f',marginBottom:12}}>{error}</div>}
      <div style={{background:'#23222a', borderRadius:12, padding:32, minHeight:120, color:'#fff', fontSize:16}}>
        {loading ? (
          <div>Ładowanie...</div>
        ) : (
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#18171c', color:'#ff9f58'}}>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Email</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Rola</th>
                <th style={{padding:'8px 12px', textAlign:'center'}}>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id} style={{borderBottom:'1px solid #333', opacity: a.email === meEmail ? 0.7 : 1}}>
                  <td style={{padding:'8px 12px', fontWeight:700, color:a.role==='superadmin'?'#f36e21':'#fff'}}>{a.email}{a.email===meEmail && ' (ty)'}</td>
                  <td style={{padding:'8px 12px'}}>{a.role}</td>
                  <td style={{padding:'8px 12px', textAlign:'center'}}>
                    {a.email !== meEmail && (
                      <>
                        <button onClick={()=>handleChangeRole(a.id, a.role==='admin'?'superadmin':'admin')} style={{background:'#2196f3',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontWeight:600,cursor:'pointer',marginRight:8}}>
                          Ustaw jako {a.role==='admin'?'superadmin':'admin'}
                        </button>
                        <button
                          onClick={() => handleDelete(a.id, a.email)}
                          disabled={deletingId === a.id}
                          style={{
                            background:'#ff4d4f',
                            color:'#fff',
                            border:'none',
                            borderRadius:6,
                            padding:'6px 14px',
                            fontWeight:600,
                            cursor:deletingId === a.id ? 'not-allowed' : 'pointer',
                            marginRight:8
                          }}
                        >
                          {deletingId === a.id ? 'Usuwanie...' : 'Usuń'}
                        </button>
                        {changePwdId !== a.id ? (
                          <button onClick={()=>{setChangePwdId(a.id);setNewPwd("");}} style={{background:'#23222a',color:'#fff',border:'2px solid #f36e21',borderRadius:6,padding:'6px 14px',fontWeight:600,cursor:'pointer'}}>Zmień hasło</button>
                        ) : (
                          <form onSubmit={e=>{e.preventDefault();handleChangePassword(a.email);}} style={{display:'inline-flex',gap:6,alignItems:'center',marginLeft:8}}>
                            <input type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} placeholder="Nowe hasło" required style={{background:'#18171c',color:'#fff',border:'2px solid #f36e21',borderRadius:6,padding:'4px 10px',fontSize:15,fontWeight:600}} />
                            <button type="submit" disabled={pwdLoading} style={{background:'#f36e21',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontWeight:600,cursor:pwdLoading?'not-allowed':'pointer'}}>Zapisz</button>
                            <button type="button" onClick={()=>setChangePwdId(null)} style={{background:'#23222a',color:'#fff',border:'2px solid #f36e21',borderRadius:6,padding:'6px 10px',fontWeight:600,cursor:'pointer'}}>Anuluj</button>
                          </form>
                        )}
                      </>
                    )}
                    {a.email === meEmail && <span style={{color:'#aaa',fontSize:13}}>Nie możesz usunąć ani zmienić swojego hasła tutaj</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default withAdminAuth(AdminsPage); 