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
    pathname.startsWith('/signup')
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[min(520px,94vw)] -translate-x-1/2 rounded-[28px] bg-white/90 shadow-glow border border-white/70 px-3 py-2 backdrop-blur-xl md:hidden">
      <nav className="flex items-center justify-between">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 text-[10px] font-medium text-charcoal/60 transition-all',
                isActive && 'text-primary'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full transition-all',
                  isActive && 'bg-gradient-to-r from-primary via-lilac to-accent text-white shadow-glow'
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
