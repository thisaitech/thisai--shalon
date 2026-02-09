import './globals.css';

import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import NavProgress from '@/components/layout/NavProgress';
import RouteTransition from '@/components/layout/RouteTransition';

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
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <div className="min-h-screen flex flex-col app-shell">
          <NavProgress />
          <div className="hidden md:block">
            <Navbar />
          </div>
          <main className="flex-1 pb-28 md:pb-0">
            <RouteTransition>{children}</RouteTransition>
          </main>
          <div className="hidden md:block">
            <Footer />
          </div>
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
