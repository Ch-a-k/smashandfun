import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row" style={{ minHeight: '100vh', background: '#18171c' }}>
      <AdminSidebar />
      <main style={{ flex: 1, minWidth: 0, background: `#18171c url('https://www.toptal.com/designers/subtlepatterns/uploads/dot-grid.png') repeat`, minHeight: '100vh', overflowX: 'hidden' }} className="pt-4 md:pt-10">
        <div style={{ width: '100%', padding: '0 24px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
