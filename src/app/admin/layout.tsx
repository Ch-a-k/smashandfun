import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#18171c' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '40px 0', background: `#18171c url('https://www.toptal.com/designers/subtlepatterns/uploads/dot-grid.png') repeat`, minHeight: '100vh' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
          {children}
        </div>
      </main>
    </div>
  );
} 