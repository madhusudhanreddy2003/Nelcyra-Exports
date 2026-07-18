import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from '../context/CartContext';
import LayoutShell from '../components/LayoutShell';

export const metadata = {
  title: 'Nelcyra Exports',
  description: 'Premium Sustainable Agri-Products & Spices Sourced Directly from India.',
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <CartProvider>
          <LayoutShell>
            {children}
          </LayoutShell>
        </CartProvider>
      </body>
    </html>
  );
}