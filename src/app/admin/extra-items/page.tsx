"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import { withAdminAuth } from '../components/withAdminAuth';

interface ExtraItem {
  id: string;
  name: string;
  price: number;
  description: string;
}

const emptyItem: Omit<ExtraItem, 'id'> = {
  name: '',
  price: 0,
  description: '',
};

function ExtraItemsPage() {
  const [items, setItems] = useState<ExtraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ExtraItem, 'id'>>(emptyItem);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function fetchItems() {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from('extra_items')
      .select('*')
      .order('price', { ascending: true });
    if (error) {
      setError("Błąd ładowania dodatków");
      setLoading(false);
      return;
    }
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function openEdit(item: ExtraItem) {
    setEditId(item.id);
    setForm({
      name: item.name,
      price: item.price,
      description: item.description,
    });
    setModalOpen(true);
  }

  function openAdd() {
    setEditId(null);
    setForm(emptyItem);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (editId) {
      // Update
      const { error } = await supabase
        .from('extra_items')
        .update(form)
        .eq('id', editId);
      if (error) {
        alert('Błąd zapisu: ' + error.message);
        setSaving(false);
        return;
      }
    } else {
      // Insert
      const { error } = await supabase
        .from('extra_items')
        .insert([form]);
      if (error) {
        alert('Błąd dodawania: ' + error.message);
        setSaving(false);
        return;
      }
    }
    setModalOpen(false);
    setSaving(false);
    fetchItems();
  }

  async function handleDelete(id: string) {
    setDeleteLoading(true);
    const { error } = await supabase
      .from('extra_items')
      .delete()
      .eq('id', id);
    setDeleteLoading(false);
    setDeleteId(null);
    if (error) {
      alert('Błąd usuwania: ' + error.message);
      return;
    }
    fetchItems();
  }

  return (
    <div style={{color:'#fff'}}>
      <h1 style={{fontSize:28, fontWeight:100, color:'#f36e21', marginBottom:18}}>Dodatki</h1>
      <p style={{fontSize:16, opacity:0.9, marginBottom:18}}>Zarządzaj dodatkowymi przedmiotami, ich cenami i opisami.</p>
      <button onClick={openAdd} style={{background:'#f36e21', color:'#fff', border:'none', borderRadius:8, padding:'10px 28px', fontWeight:700, fontSize:17, marginBottom:24, cursor:'pointer'}}>Dodaj dodatek</button>
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
                <th style={{padding:'8px 12px', textAlign:'left'}}>Opis</th>
                <th style={{padding:'8px 12px'}}></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{borderBottom:'1px solid #333'}}>
                  <td style={{padding:'8px 12px', fontWeight:700, color:'#f36e21'}}>{item.name}</td>
                  <td style={{padding:'8px 12px'}}>{item.price}</td>
                  <td style={{padding:'8px 12px', maxWidth:320, whiteSpace:'pre-line', overflow:'hidden', textOverflow:'ellipsis'}}>{item.description}</td>
                  <td style={{padding:'8px 12px', display:'flex', gap:8}}>
                    <button onClick={() => openEdit(item)} style={{background:'#f36e21', color:'#fff', border:'none', borderRadius:6, padding:'6px 18px', fontWeight:600, cursor:'pointer'}}>Edytuj</button>
                    <button onClick={() => setDeleteId(item.id)} style={{background:'#ff4d4f', color:'#fff', border:'none', borderRadius:6, padding:'6px 14px', fontWeight:600, cursor:'pointer'}}>Usuń</button>
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
          <form onSubmit={handleSave} style={{background:'#23222a', borderRadius:14, padding:'36px 32px', minWidth:340, boxShadow:'0 4px 32px #0008', color:'#fff', display:'flex', flexDirection:'column', gap:18}}>
            <h2 style={{color:'#f36e21', fontWeight:800, fontSize:22, marginBottom:8}}>{editId ? 'Edytuj dodatek' : 'Nowy dodatek'}</h2>
            <label>Nazwa
              <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required style={{width:'100%', marginTop:6, background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 14px', fontSize:16, fontWeight:600, outline:'none'}} />
            </label>
            <label>Cena (PLN)
              <input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: Number(e.target.value)}))} required min={0} style={{width:'100%', marginTop:6, background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 14px', fontSize:16, fontWeight:600, outline:'none'}} />
            </label>
            <label>Opis
              <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3} style={{width:'100%', marginTop:6, background:'#18171c', color:'#fff', border:'2px solid #f36e21', borderRadius:8, padding:'10px 14px', fontSize:16, fontWeight:600, outline:'none', resize:'vertical'}} />
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
            <div style={{fontSize:18, fontWeight:700, marginBottom:8}}>Czy na pewno chcesz usunąć ten dodatek?</div>
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

export default withAdminAuth(ExtraItemsPage); 