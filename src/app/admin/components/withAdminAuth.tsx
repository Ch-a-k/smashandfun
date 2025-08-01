import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabaseClient';

export function withAdminAuth(WrappedComponent: React.ComponentType) {
  return function AdminProtected() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

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
        setIsAdmin(true);
        setLoading(false);
      }
      checkAuth();
    }, [router]);

    if (loading) {
      return <div style={{ color: '#fff', textAlign: 'center', marginTop: 80 }}>Sprawdź dostępu ...</div>;
    }
    if (!isAdmin) {
      return null;
    }
    return <WrappedComponent />;
  };
} 