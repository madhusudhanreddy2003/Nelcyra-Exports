// src/app/admin/layout.js
export const metadata = {
  title: 'Nelcyra Exports - Management Console',
  description: 'Internal logistics control dashboard matrix.',
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-root-wrapper" style={{ minHeight: '100vh', background: '#F4F6F5' }}>
      {children}
    </div>
  );
}