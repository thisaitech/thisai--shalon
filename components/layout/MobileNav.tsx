'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CalendarCheck,
  Heart,
  MessageCircle,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/booking', label: 'Booking', icon: CalendarCheck },
  { href: '/favorites', label: 'Saved', icon: Heart },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/profile', label: 'Profile', icon: User }
];

export default function MobileNav() {
  const pathname = usePathname();

  if (
    pathname.startsWith('/owner') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/payment') ||
    pathname.startsWith('/welcome')
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[min(520px,94vw)] -translate-x-1/2 rounded-[28px] bg-white/92 shadow-glow border border-white/70 px-2 py-2 backdrop-blur-xl md:hidden">
      <nav className="flex items-center justify-between">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-medium transition-all',
                isActive ? 'text-primary' : 'text-charcoal/55'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-2xl transition-all',
                  isActive ? 'bg-primary/12 text-primary' : 'text-charcoal/45'
                )}
              >
                <Icon size={18} />
              </span>
              <span className={cn(isActive ? 'text-primary' : 'text-charcoal/55')}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
