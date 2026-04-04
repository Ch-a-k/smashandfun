"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SUPERADMIN_MENU = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/packages", label: "Pakiety" },
  { href: "/admin/extra-items", label: "Dodatki" },
  { href: "/admin/bookings", label: "Rezerwacje" },
  { href: "/admin/promo-codes", label: "Promocje" },
  { href: "/admin/users", label: "Klienci" },
  { href: "/admin/ads", label: "IF. ADS" },
  { href: "/admin/admins", label: "Administratory" },
];

const ADMIN_MENU = [{ href: "/admin/bookings", label: "Rezerwacje" }];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [isAuth, setIsAuth] = useState(false);
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

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_email");
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `admin_role=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
    }
    window.location.replace("/admin/login");
  }

  const visibleMenu = role === 'superadmin' ? SUPERADMIN_MENU : ADMIN_MENU;

  const logoutButtonClass =
    "w-full text-left rounded-md px-8 py-2.5 text-[15px] font-medium text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-gray-200 active:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f36e21]/50";

  return (
    <>
      {/* Mobile */}
      <nav className="md:hidden sticky top-0 z-50 flex flex-col bg-[#23222a] shadow-lg border-b border-white/[0.06]">
        <div className="flex items-center gap-1 overflow-x-auto px-2 py-2 no-scrollbar">
          <span className="text-[#f36e21] font-black text-base shrink-0 pl-1 pr-2">ADMIN</span>
          {visibleMenu.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                pathname === item.href
                  ? 'bg-[#f36e21] text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="shrink-0 border-t border-white/[0.06] px-2 py-1.5">
          <button type="button" onClick={handleLogout} className={logoutButtonClass}>
            Wyloguj się
          </button>
        </div>
      </nav>

      {/* Desktop: фиксированная высота окна — футер с выходом не «прыгает» с длиной контента main */}
      <aside className="hidden md:flex md:flex-col md:h-dvh md:sticky md:top-0 md:shrink-0 w-[220px] bg-[#23222a] text-white shadow-[2px_0_16px_rgba(0,0,0,0.25)]">
        <div className="shrink-0 pt-8 pb-6 text-center font-black text-[22px] tracking-wide text-[#f36e21]">
          ADMIN
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-1">
          {visibleMenu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-8 py-3 text-[17px] no-underline transition-all ${
                pathname === item.href
                  ? 'border-l-4 border-[#f36e21] bg-[rgba(243,110,33,0.08)] font-bold text-[#f36e21]'
                  : 'border-l-4 border-transparent font-medium text-white hover:bg-white/[0.04]'
              } ${item.href === '/admin/ads' || item.href === '/admin/admins' ? 'mt-[18px]' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/[0.08] py-3 px-0">
          <button type="button" onClick={handleLogout} className={logoutButtonClass}>
            Wyloguj się
          </button>
        </div>
      </aside>
    </>
  );
}
