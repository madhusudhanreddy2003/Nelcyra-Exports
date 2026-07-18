'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  
  // Hides public website navbar/footers if path starts with '/admin'
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <main style={{ minHeight: "100vh" }}>{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh" }}>
        {children}
      </main>
      <Footer />
    </>
  );
}