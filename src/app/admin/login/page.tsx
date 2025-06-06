"use client";
import { useState } from "react";

import { supabase } from '@/lib/supabaseClient';

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!email || !password) {
      setError("Введите email и пароль");
      setLoading(false);
      return;
    }
    // 1. Вход через Supabase Auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (authError || !data.session) {
      setError("Nieprawidłowy email lub hasło");
      setLoading(false);
      return;
    }
    // 2. Проверка в таблице admins
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();
    if (adminError || !adminData) {
      setError("Нет доступа: вы не администратор");
      setLoading(false);
      return;
    }
    // 3. Сохраняем email и access_token в localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_email', email);
      localStorage.setItem('admin_token', data.session.access_token);
    }
    setLoading(false);
    if (adminData.role === 'superadmin') {
      window.location.replace('/admin/admins');
    } else {
      window.location.replace('/admin');
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `#18171c url('https://www.toptal.com/designers/subtlepatterns/uploads/dot-grid.png') repeat`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "rgba(30,30,30,0.98)",
          borderRadius: 18,
          boxShadow: "0 4px 32px 0 rgba(0,0,0,0.18)",
          padding: 36,
          minWidth: 340,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          color: "#fff"
        }}
      >
        <h2 style={{ color: "#f36e21", fontWeight: 800, fontSize: 28, marginBottom: 8 }}>Wejście dla administratora</h2>
        <label style={{ fontWeight: 600 }}>Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: "100%",
              marginTop: 6,
              background: "#23222a",
              color: "#fff",
              border: "2px solid #f36e21",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 16,
              fontWeight: 600,
              outline: "none"
            }}
            autoFocus
            autoComplete="username"
          />
        </label>
        <label style={{ fontWeight: 600 }}>Пароль
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: "100%",
              marginTop: 6,
              background: "#23222a",
              color: "#fff",
              border: "2px solid #f36e21",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 16,
              fontWeight: 600,
              outline: "none"
            }}
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 10,
            background: loading ? "#f36e21aa" : "#f36e21",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 0",
            fontWeight: 700,
            fontSize: 18,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s"
          }}
        >
          {loading ? "Вход..." : "Войти"}
        </button>
        {error && <div style={{ color: "#ff4d4f", marginTop: 4, fontWeight: 600 }}>{error}</div>}
      </form>
    </div>
  );
} 