"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const menu = [
  { href: "/admin", label: "Panel główny" },
  { href: "/admin/packages", label: "Pakiety" },
  { href: "/admin/extra-items", label: "Dodatki" },
  { href: "/admin/bookings", label: "Rezerwacje" },
  { href: "/admin/promo-codes", label: "Promocje" },
  { href: "/admin/users", label: "Klienci" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [isAuth, setIsAuth] = useState(true);
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const email = typeof window !== 'undefined' ? localStorage.getItem('admin_email') : null;
    if (!token || !email) {
      setIsAuth(false);
      return;
    }
    setIsAuth(true);
    import('@/lib/supabaseClient').then(({ supabase }) => {
      supabase
        .from('admins')
        .select('role')
        .eq('email', email)
        .single()
        .then(({ data }) => setRole((data as { role?: string } | null)?.role ?? null));
    });
  }, []);
  if (!isAuth) return null;
  return (
    <aside style={{
      width: 220,
      background: '#23222a',
      color: '#fff',
      padding: '40px 0',
      minHeight: '100vh',
      boxShadow: '2px 0 16px #0004',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }}>
      <div style={{ fontWeight: 900, fontSize: 22, color: '#f36e21', textAlign: 'center', marginBottom: 32, letterSpacing: 1 }}>ADMIN</div>
      {menu.map(item => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            display: 'block',
            padding: '12px 32px',
            color: pathname === item.href ? '#f36e21' : '#fff',
            background: pathname === item.href ? 'rgba(243,110,33,0.08)' : 'none',
            fontWeight: pathname === item.href ? 700 : 500,
            borderLeft: pathname === item.href ? '4px solid #f36e21' : '4px solid transparent',
            textDecoration: 'none',
            fontSize: 17,
            transition: 'all 0.15s'
          }}
        >
          {item.label}
        </Link>
      ))}
      {role === 'superadmin' && (
        <Link
          href="/admin/admins"
          style={{
            display: 'block',
            padding: '12px 32px',
            color: pathname === '/admin/admins' ? '#f36e21' : '#fff',
            background: pathname === '/admin/admins' ? 'rgba(243,110,33,0.08)' : 'none',
            fontWeight: pathname === '/admin/admins' ? 700 : 500,
            borderLeft: pathname === '/admin/admins' ? '4px solid #f36e21' : '4px solid transparent',
            textDecoration: 'none',
            fontSize: 17,
            transition: 'all 0.15s',
            marginTop: 18
          }}
        >
          Administratory
        </Link>
      )}
    </aside>
  );
} 