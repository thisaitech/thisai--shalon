'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarClock,
  HelpCircle,
  Home,
  Scissors,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/salons', label: 'Services', icon: Scissors },
  { href: '/appointments', label: 'Bookings', icon: CalendarClock },
  { href: '/help', label: 'Help', icon: HelpCircle },
  { href: '/profile', label: 'Profile', icon: User }
];

export default function MobileNav() {
  const pathname = usePathname();

  if (
    pathname.startsWith('/owner') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup')
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[min(520px,94vw)] -translate-x-1/2 rounded-2xl bg-white/90 shadow-glow border border-white/70 px-3 py-2 backdrop-blur-xl md:hidden">
      <nav className="flex items-center justify-between">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 text-[11px] font-medium text-charcoal/60 transition-all',
                isActive && 'text-primary'
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full',
                  isActive && 'bg-primary/10'
                )}
              >
                <Icon size={18} />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
