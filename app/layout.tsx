import './globals.css';

import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';

const inter = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});

const playfair = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Lumiére | Salon Booking',
  description: 'Find and book your next glow-up in minutes.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 pb-28 md:pb-0">{children}</main>
          <Footer />
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
