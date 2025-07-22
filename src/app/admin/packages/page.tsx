"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabaseClient';

interface Package {
  id: string;
  name: string;
  price: string;
  duration: string;
  people: string;
  description: string;
  items: string[];
  tools: string[];
  isBestseller: boolean;
  allowed_rooms?: string[];
  room_priority?: string[];
  position: number;
}

const emptyPackage: Omit<Package, 'id'> = {
  name: '',
  price: '',
  duration: '',
  people: '',
  description: '',
  items: [],
  tools: [],
  isBestseller: false,
  position: 0,
};

export default function PackagesAdmin() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Package, 'id'>>(emptyPackage);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [rooms, setRooms] = useState<{id:string, name:string}[]>([]);
  const [roomOrder, setRoomOrder] = useState<string[]>([]);
  const [roomMap, setRoomMap] = useState<{[id:string]: string}>({});

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

  async function fetchPackages() {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('position', { ascending: true });
    if (error) {
      setError("Błąd ładowania pakietów");
      setLoading(false);
      return;
    }
    setPackages(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchPackages();
    // Загружаем список комнат
    supabase.from('rooms').select('id, name').order('priority').then(({data}) => {
      setRooms(data||[]);
      setRoomMap(Object.fromEntries((data||[]).map((r:{id:string, name:string})=>[r.id, r.name])));
    });
  }, []);

  function openEdit(pkg: Package) {
    setEditId(pkg.id);
    setForm({
      name: pkg.name,
      price: pkg.price !== undefined && pkg.price !== null ? String(pkg.price) : '',
      duration: pkg.duration !== undefined && pkg.duration !== null ? String(pkg.duration) : '',
      people: pkg.people || '',
      description: pkg.description || '',
      items: pkg.items || [],
      tools: pkg.tools || [],
      isBestseller: !!pkg.isBestseller,
      position: pkg.position,
    });
    // allowed_rooms и room_priority могут быть undefined
    const allowed = Array.isArray(pkg.allowed_rooms) ? pkg.allowed_rooms : [];
    const order = Array.isArray(pkg.room_priority) && pkg.room_priority.length > 0 ? pkg.room_priority : allowed;
    setRoomOrder(order);
    setModalOpen(true);
  }

  function openAdd() {
    setEditId(null);
    setForm(emptyPackage);
    setRoomOrder(rooms.map(r => r.id));
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const dataToSave = { 
      ...form, 
      allowed_rooms: roomOrder, 
      room_priority: roomOrder,
      people_count: Number(form.people) || 0,
      duration: Number(form.duration) || 0,
      price: Number(form.price) || 0
    };
    if (editId) {
      // Update
      const { error } = await supabase
        .from('packages')
        .update(dataToSave)
        .eq('id', editId);
      if (error) {
        alert('Błąd zapisu: ' + error.message);
        setSaving(false);
        return;
      }
    } else {
      // Insert
      // Получаем максимальное значение position
      const { data: allPkgs } = await supabase.from('packages').select('position');
      const maxPosition = allPkgs && allPkgs.length > 0 ? Math.max(...(allPkgs as {position: number}[]).map((p) => p.position || 0)) : 0;
      const { error } = await supabase
        .from('packages')
        .insert([{ ...dataToSave, position: maxPosition + 1 }]);
      if (error) {
        alert('Błąd dodawania: ' + error.message);
        setSaving(false);
        return;
      }
    }
    setModalOpen(false);
    setSaving(false);
    fetchPackages();
  }

  async function handleDelete(id: string) {
    setDeleteLoading(true);
    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', id);
    setDeleteLoading(false);
    setDeleteId(null);
    if (error) {
      alert('Błąd usuwania: ' + error.message);
      return;
    }
    fetchPackages();
  }

  return (
    <div style={{color:'#fff'}}>
      <h1 style={{fontSize:28, fontWeight:100, color:'#f36e21', marginBottom:18}}>Pakiety</h1>
      <p style={{fontSize:16, opacity:0.9, marginBottom:18}}>Zarządzaj pakietami usług, edytuj ceny, opisy i zawartość pakietów.</p>
      <button onClick={openAdd} style={{background:'#f36e21', color:'#fff', border:'none', borderRadius:8, padding:'10px 28px', fontWeight:700, fontSize:17, marginBottom:24, cursor:'pointer'}}>Dodaj pakiet</button>
      <div style={{background:'#23222a', borderRadius:12, padding:32, minHeight:180, color:'#fff', fontSize:16}}>
        {loading ? (
          <div>Ładowanie...</div>
        ) : error ? (
          <div style={{color:'#ff4d4f'}}>{error}</div>
        ) : (
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#18171c', color:'#ff9f58'}}>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Nazwa</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Cena (PLN)</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Czas (min)</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Liczba osób</th>
                <th style={{width:'50%',padding:'8px 12px', textAlign:'left'}}>Opis</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Dostępne pokoje</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Priorytet pokoi</th>
                <th style={{padding:'8px 12px'}}></th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg, idx) => (
                <tr key={pkg.id} style={{borderBottom:'1px solid #333'}}>
                  <td style={{padding:'8px 12px', fontWeight:700, color:'#f36e21'}}>{pkg.name}</td>
                  <td style={{padding:'8px 12px'}}>{pkg.price}</td>
                  <td style={{padding:'8px 12px'}}>{pkg.duration}</td>
                  <td style={{padding:'8px 12px'}}>{pkg.people}</td>
                  <td style={{padding:'8px 12px', maxWidth:220, whiteSpace:'pre-line', overflow:'hidden', textOverflow:'ellipsis'}}>{pkg.description}</td>
                  <td style={{padding:'8px 12px'}}>{Array.isArray(pkg.allowed_rooms) && pkg.allowed_rooms.length > 0 ? pkg.allowed_rooms.map(id => roomMap[id] || id).join(', ') : '—'}</td>
                  <td style={{padding:'8px 12px'}}>{Array.isArray(pkg.room_priority) && pkg.room_priority.length > 0 ? pkg.room_priority.map(id => roomMap[id] || id).join(', ') : '—'}</td>
                  <td style={{padding:'8px 12px', display:'flex', gap:8, alignItems:'center'}}>
                    <button onClick={() => openEdit(pkg)} style={{background:'#f36e21', color:'#fff', border:'none', borderRadius:6, padding:'6px 18px', fontWeight:600, cursor:'pointer'}}>Edytuj</button>
                    <button onClick={() => setDeleteId(pkg.id)} style={{background:'#ff4d4f', color:'#fff', border:'none', borderRadius:6, padding:'6px 14px', fontWeight:600, cursor:'pointer'}}>Usuń</button>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={async () => {
                        if (idx === 0) return;
                        const above = packages[idx - 1];
                        await supabase.from('packages').update({ position: above.position }).eq('id', pkg.id);
                        await supabase.from('packages').update({ position: pkg.position }).eq('id', above.id);
                        fetchPackages();
                      }}
                      style={{background:'#23222a', color:'#fff', border:'1px solid #f36e21', borderRadius:4, padding:'2px 7px', fontWeight:700, fontSize:15, cursor:idx===0?'not-allowed':'pointer'}}
                    >▲</button>
                    <button
                      type="button"
                      disabled={idx === packages.length - 1}
                      onClick={async () => {
                        if (idx === packages.length - 1) return;
                        const below = packages[idx + 1];
                        await supabase.from('packages').update({ position: below.position }).eq('id', pkg.id);
                        await supabase.from('packages').update({ position: pkg.position }).eq('id', below.id);
                        fetchPackages();
                      }}
                      style={{background:'#23222a', color:'#fff', border:'1px solid #f36e21', borderRadius:4, padding:'2px 7px', fontWeight:700, fontSize:15, cursor:idx===packages.length-1?'not-allowed':'pointer'}}
                    >▼</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Модальное окно редактирования/добавления */}
      {modalOpen && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <form onSubmit={handleSave} style={{background:'#23222a', borderRadius:14, padding:'36px 32px', minWidth:340, boxShadow:'0 4px 32px #0008', color:'#fff', display:'flex', flexDirection:'column', gap:18, maxHeight:'90vh', overflowY:'auto'}}>
            <h2 style={{color:'#f36e21', fontWeight:800, fontSize:22, marginBottom:8}}>{editId ? 'Edytuj pakiet' : 'Nowy pakiet'}</h2>
            <label>Nazwa
              <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required style={{width:'100%', marginTop:6, background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 14px', fontSize:16, fontWeight:600, outline:'none'}} />
            </label>
            <label>Przedmioty (każdy w nowej linii)
              <textarea value={form.items.join('\n')} onChange={e => setForm(f => ({...f, items: e.target.value.split(/\r?\n/).filter(Boolean)}))} rows={3} style={{width:'100%', marginTop:6, background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 14px', fontSize:16, fontWeight:600, outline:'none', resize:'vertical'}} />
            </label>
            <label>Narzędzia (sprzęt ochronny):<br/>
              <span style={{fontSize:13, color:'#aaa'}}>Wybierz dostępne opcje</span>
              <div style={{display:'flex', gap:12, marginTop:6}}>
                {['ubranie','kask','rękawice'].map(tool => (
                  <label key={tool} style={{display:'flex',alignItems:'center',gap:4}}>
                    <input type="checkbox" checked={form.tools.includes(tool)} onChange={e => setForm(f => ({...f, tools: e.target.checked ? [...f.tools, tool] : f.tools.filter(t => t !== tool)}))} /> {tool}
                  </label>
                ))}
              </div>
            </label>
            <label>Liczba osób
              <input
                type="text"
                value={form.people}
                onChange={e => setForm(f => ({...f, people: e.target.value}))}
                style={{width:'100%', marginTop:6, background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 14px', fontSize:16, fontWeight:600, outline:'none'}}
                required
              />
            </label>
            <label>Czas trwania
              <input
                type="number"
                min={1}
                step={1}
                value={String(form.duration ?? '')}
                onChange={e => setForm(f => ({...f, duration: e.target.value}))}
                style={{width:'100%', marginTop:6, background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 14px', fontSize:16, fontWeight:600, outline:'none'}}
                required
              />
            </label>
            <label>Cena (PLN)
              <input
                type="number"
                min={0}
                step={0.01}
                value={String(form.price ?? '')}
                onChange={e => setForm(f => ({...f, price: e.target.value}))}
                style={{width:'100%', marginTop:6, background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 14px', fontSize:16, fontWeight:600, outline:'none'}}
                required
              />
            </label>
            <label style={{display:'flex',alignItems:'center',gap:8}}>
              <input type="checkbox" checked={form.isBestseller} onChange={e => setForm(f => ({...f, isBestseller: e.target.checked}))} /> Bestseller
            </label>
            <label>Opis
              <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3} style={{width:'100%', marginTop:6, background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 14px', fontSize:16, fontWeight:600, outline:'none', resize:'vertical'}} />
            </label>
            <label style={{marginTop:8, fontWeight:700, color:'#ff9f58'}}>Priorytet i dostępność pokoi:</label>
            <table style={{width:'100%', background:'#18171c', borderRadius:8, marginBottom:8, color:'#fff', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#23222a', color:'#ff9f58'}}>
                  <th style={{padding:'8px 12px', textAlign:'left'}}>№</th>
                  <th style={{padding:'8px 12px', textAlign:'left'}}>Pokój</th>
                  <th style={{padding:'8px 12px', textAlign:'center'}}>Włącz</th>
                  <th style={{padding:'8px 12px', textAlign:'center'}}>Działania</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => {
                  const enabledIdx = roomOrder.indexOf(room.id);
                  const enabled = enabledIdx !== -1;
                  return (
                    <tr key={room.id} style={{borderBottom:'1px solid #333', opacity: enabled ? 1 : 0.5}}>
                      <td style={{padding:'8px 12px'}}>{enabled ? enabledIdx + 1 : '-'}</td>
                      <td style={{padding:'8px 12px'}}>{room.name}</td>
                      <td style={{padding:'8px 12px', textAlign:'center'}}>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={e => {
                            if (e.target.checked) {
                              // Добавить в конец списка
                              setRoomOrder(prev => [...prev, room.id]);
                            } else {
                              // Убрать из списка
                              setRoomOrder(prev => prev.filter(id => id !== room.id));
                            }
                          }}
                        />
                      </td>
                      <td style={{padding:'8px 12px', textAlign:'center'}}>
                        <button
                          type="button"
                          disabled={!enabled || enabledIdx === 0}
                          onClick={() => {
                            if (!enabled || enabledIdx === 0) return;
                            setRoomOrder(prev => {
                              const arr = [...prev];
                              [arr[enabledIdx - 1], arr[enabledIdx]] = [arr[enabledIdx], arr[enabledIdx - 1]];
                              return arr;
                            });
                          }}
                          style={{marginRight:6, background:'#23222a', color:'#fff', border:'1px solid #f36e21', borderRadius:4, padding:'2px 7px', fontWeight:700, fontSize:15, cursor:!enabled||enabledIdx===0?'not-allowed':'pointer'}}
                        >▲</button>
                        <button
                          type="button"
                          disabled={!enabled || enabledIdx === roomOrder.length - 1 || enabledIdx === -1}
                          onClick={() => {
                            if (!enabled || enabledIdx === roomOrder.length - 1 || enabledIdx === -1) return;
                            setRoomOrder(prev => {
                              const arr = [...prev];
                              [arr[enabledIdx], arr[enabledIdx + 1]] = [arr[enabledIdx + 1], arr[enabledIdx]];
                              return arr;
                            });
                          }}
                          style={{background:'#23222a', color:'#fff', border:'1px solid #f36e21', borderRadius:4, padding:'2px 7px', fontWeight:700, fontSize:15, cursor:!enabled||enabledIdx===roomOrder.length-1||enabledIdx===-1?'not-allowed':'pointer'}}
                        >▼</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{display:'flex', gap:12, marginTop:8}}>
              <button type="submit" disabled={saving} style={{background:'#f36e21', color:'#fff', border:'none', borderRadius:8, padding:'10px 28px', fontWeight:700, fontSize:17, cursor:saving?'not-allowed':'pointer'}}>{saving ? 'Zapisywanie...' : 'Zapisz'}</button>
              <button type="button" onClick={()=>setModalOpen(false)} style={{background:'#23222a', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 28px', fontWeight:700, fontSize:17, cursor:'pointer'}}>Anuluj</button>
            </div>
          </form>
        </div>
      )}
      {/* Модальное окно подтверждения удаления */}
      {deleteId && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{background:'#23222a', borderRadius:14, padding:'36px 32px', minWidth:320, boxShadow:'0 4px 32px #0008', color:'#fff', display:'flex', flexDirection:'column', gap:18, alignItems:'center'}}>
            <div style={{fontSize:18, fontWeight:700, marginBottom:8}}>Czy na pewno chcesz usunąć ten pakiet?</div>
            <div style={{display:'flex', gap:12}}>
              <button onClick={()=>handleDelete(deleteId)} disabled={deleteLoading} style={{background:'#ff4d4f', color:'#fff', border:'none', borderRadius:8, padding:'10px 28px', fontWeight:700, fontSize:17, cursor:deleteLoading?'not-allowed':'pointer'}}>{deleteLoading ? 'Usuwanie...' : 'Usuń'}</button>
              <button onClick={()=>setDeleteId(null)} style={{background:'#23222a', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 28px', fontWeight:700, fontSize:17, cursor:'pointer'}}>Anuluj</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 