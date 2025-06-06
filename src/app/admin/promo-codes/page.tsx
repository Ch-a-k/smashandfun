"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabaseClient';
import { withAdminAuth } from '../components/withAdminAuth';

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

const emptyPromo: Omit<PromoCode, 'id'> = {
  code: '',
  discount_percent: 0,
  discount_amount: null,
  valid_from: '',
  valid_to: '',
  usage_limit: null,
  used_count: 0,
  time_from: '',
  time_to: '',
};

// --- Функция для автоформатирования времени в HH:mm ---
function formatTime(val: string): string {
  const digits = val.replace(/\D/g, '');
  if (digits.length === 4) {
    return digits.slice(0,2) + ':' + digits.slice(2,4);
  } else if (digits.length === 3) {
    return '0' + digits[0] + ':' + digits.slice(1,3);
  } else if (digits.length === 2) {
    return digits + ':00';
  } else if (digits.length === 1) {
    return '0' + digits + ':00';
  }
  return val;
}

function PromoCodesPage() {
  const router = useRouter();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<PromoCode, 'id'>>(emptyPromo);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  async function fetchPromos() {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('valid_from', { ascending: false });
    if (error) {
      setError("Błąd ładowania promokodów");
      setLoading(false);
      return;
    }
    setPromos(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchPromos(); }, []);

  function openEdit(promo: PromoCode) {
    setEditId(promo.id);
    setForm({
      code: promo.code,
      discount_percent: promo.discount_percent,
      discount_amount: promo.discount_amount ?? null,
      valid_from: promo.valid_from || '',
      valid_to: promo.valid_to || '',
      usage_limit: promo.usage_limit ?? null,
      used_count: promo.used_count ?? 0,
      time_from: promo.time_from || '',
      time_to: promo.time_to || '',
    });
    setModalOpen(true);
  }

  function openAdd() {
    setEditId(null);
    setForm(emptyPromo);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const dataToSave = {
      ...form,
      discount_percent: Number(form.discount_percent) || 0,
      discount_amount: form.discount_amount !== null && form.discount_amount !== undefined && String(form.discount_amount) !== '' ? Number(form.discount_amount) : null,
      usage_limit: form.usage_limit !== null && form.usage_limit !== undefined && String(form.usage_limit) !== '' ? Number(form.usage_limit) : null,
      valid_from: form.valid_from || null,
      valid_to: form.valid_to || null,
      time_from: formatTime(form.time_from || ''),
      time_to: formatTime(form.time_to || ''),
    };
    if (editId) {
      // Update
      const { error } = await supabase
        .from('promo_codes')
        .update(dataToSave)
        .eq('id', editId);
      if (error) {
        alert('Błąd zapisu: ' + error.message);
        setSaving(false);
        return;
      }
    } else {
      // Insert
      const { error } = await supabase
        .from('promo_codes')
        .insert([dataToSave]);
      if (error) {
        alert('Błąd dodawania: ' + error.message);
        setSaving(false);
        return;
      }
    }
    setModalOpen(false);
    setSaving(false);
    fetchPromos();
  }

  async function handleDelete(id: string) {
    setDeleteLoading(true);
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);
    setDeleteLoading(false);
    setDeleteId(null);
    if (error) {
      alert('Błąd usuwania: ' + error.message);
      return;
    }
    fetchPromos();
  }

  return (
    <div style={{color:'#fff'}}>
      <h1 style={{fontSize:28, fontWeight:800, color:'#f36e21', marginBottom:18}}>Promocje</h1>
      <p style={{fontSize:16, opacity:0.9, marginBottom:18}}>Twórz i zarządzaj kodami promocyjnymi oraz rabatami (procent lub zł).</p>
      <button onClick={openAdd} style={{background:'#f36e21', color:'#fff', border:'none', borderRadius:8, padding:'10px 28px', fontWeight:700, fontSize:17, marginBottom:24, cursor:'pointer'}}>Dodaj kod promocyjny</button>
      <div style={{background:'#23222a', borderRadius:12, padding:32, minHeight:180, color:'#fff', fontSize:16}}>
        {loading ? (
          <div>Ładowanie...</div>
        ) : error ? (
          <div style={{color:'#ff4d4f'}}>{error}</div>
        ) : (
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#18171c', color:'#ff9f58'}}>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Kod</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Rabat (%)</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Rabat (zł)</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Od</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Do</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Godzina od</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Godzina do</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Limit</th>
                <th style={{padding:'8px 12px', textAlign:'left'}}>Użyto</th>
                <th style={{padding:'8px 12px'}}></th>
              </tr>
            </thead>
            <tbody>
              {promos.map(promo => (
                <tr key={promo.id} style={{borderBottom:'1px solid #333'}}>
                  <td style={{padding:'8px 12px', fontWeight:700, color:'#f36e21'}}>{promo.code}</td>
                  <td style={{padding:'8px 12px'}}>{promo.discount_percent}</td>
                  <td style={{padding:'8px 12px'}}>{promo.discount_amount ?? ''}</td>
                  <td style={{padding:'8px 12px'}}>{promo.valid_from?.slice(0,10) || ''}</td>
                  <td style={{padding:'8px 12px'}}>{promo.valid_to?.slice(0,10) || ''}</td>
                  <td style={{padding:'8px 12px'}}>{promo.time_from || ''}</td>
                  <td style={{padding:'8px 12px'}}>{promo.time_to || ''}</td>
                  <td style={{padding:'8px 12px'}}>{promo.usage_limit ?? ''}</td>
                  <td style={{padding:'8px 12px'}}>{promo.used_count ?? 0}</td>
                  <td style={{padding:'8px 12px', display:'flex', gap:8}}>
                    <button onClick={() => openEdit(promo)} style={{background:'#f36e21', color:'#fff', border:'none', borderRadius:6, padding:'6px 18px', fontWeight:600, cursor:'pointer'}}>Edytuj</button>
                    <button onClick={() => setDeleteId(promo.id)} style={{background:'#ff4d4f', color:'#fff', border:'none', borderRadius:6, padding:'6px 14px', fontWeight:600, cursor:'pointer'}}>Usuń</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Модальное окно редактирования/добавления */}
      {modalOpen && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.55)', zIndex:1000, display:'flex', alignItems:'flex-start', justifyContent:'center', overflow:'auto'}}>
          <form onSubmit={handleSave} style={{background:'#23222a', borderRadius:14, padding:'36px 32px', minWidth:340, boxShadow:'0 4px 32px #0008', color:'#fff', display:'flex', flexDirection:'column', gap:18, maxHeight:'90vh', overflowY:'auto', marginTop:40}}>
            <h2 style={{color:'#f36e21', fontWeight:800, fontSize:22, marginBottom:8}}>{editId ? 'Edytuj kod promocyjny' : 'Nowy kod promocyjny'}</h2>
            <label>Kod
              <input type="text" value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value}))} required style={{width:'100%', marginTop:6, background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 14px', fontSize:16, fontWeight:600, outline:'none'}} />
            </label>
            <label>Rabat (%)
              <input type="number" value={form.discount_percent} onChange={e => setForm(f => ({...f, discount_percent: Number(e.target.value)}))} min={0} max={100} style={{width:'100%', marginTop:6, background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 14px', fontSize:16, fontWeight:600, outline:'none'}} />
            </label>
            <label>Rabat (zł)
              <input type="number" value={form.discount_amount ?? ''} onChange={e => setForm(f => ({...f, discount_amount: e.target.value === '' ? null : Number(e.target.value)}))} min={0} style={{width:'100%', marginTop:6, background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 14px', fontSize:16, fontWeight:600, outline:'none'}} />
            </label>
            <label>Data od
              <input type="date" value={form.valid_from?.slice(0,10) || ''} onChange={e => setForm(f => ({...f, valid_from: e.target.value}))} style={{width:'100%', marginTop:6, background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 14px', fontSize:16, fontWeight:600, outline:'none'}} />
            </label>
            <label>Data do
              <input type="date" value={form.valid_to?.slice(0,10) || ''} onChange={e => setForm(f => ({...f, valid_to: e.target.value}))} style={{width:'100%', marginTop:6, background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 14px', fontSize:16, fontWeight:600, outline:'none'}} />
            </label>
            <label>Limit użyć
              <input type="number" value={form.usage_limit ?? ''} onChange={e => setForm(f => ({...f, usage_limit: e.target.value === '' ? null : Number(e.target.value)}))} min={0} style={{width:'100%', marginTop:6, background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 14px', fontSize:16, fontWeight:600, outline:'none'}} />
            </label>
            <label>Godzina od
              <input
                type="text"
                inputMode="numeric"
                value={form.time_from || ''}
                onChange={e => setForm(f => ({...f, time_from: e.target.value.replace(/[^\d]/g, '')}))}
                onBlur={e => setForm(f => ({...f, time_from: formatTime(e.target.value)}))}
                placeholder="HHmm lub HH:mm"
                style={{width:'100%', marginTop:6, background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 14px', fontSize:16, fontWeight:600, outline:'none'}}
              />
            </label>
            <label>Godzina do
              <input
                type="text"
                inputMode="numeric"
                value={form.time_to || ''}
                onChange={e => setForm(f => ({...f, time_to: e.target.value.replace(/[^\d]/g, '')}))}
                onBlur={e => setForm(f => ({...f, time_to: formatTime(e.target.value)}))}
                placeholder="HHmm lub HH:mm"
                style={{width:'100%', marginTop:6, background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 14px', fontSize:16, fontWeight:600, outline:'none'}}
              />
            </label>
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
            <div style={{fontSize:18, fontWeight:700, marginBottom:8}}>Czy na pewno chcesz usunąć ten kod promocyjny?</div>
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

export default withAdminAuth(PromoCodesPage); 