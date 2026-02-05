'use client';

import Link from 'next/link';
import { Disclosure } from '@headlessui/react';
import { Menu, X } from 'lucide-react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/salons', label: 'Services' },
  { href: '/appointments', label: 'Appointments' },
  { href: '/help', label: 'Help' }
];

export default function Navbar() {
  return (
    <Disclosure as="nav" className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/50">
      {({ open }) => (
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between relative">
          <Link href="/" className="text-xl font-display tracking-wide text-primary">
            Lumiére Studio
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm hover:text-charcoal/70 focus-ring rounded-md px-1"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm focus-ring rounded-md px-1 text-primary">
              Log in
            </Link>
            <Link href="/owner/login" className="text-sm focus-ring rounded-md px-1 text-primary/70">
              Owner
            </Link>
            <Link
              href="/signup"
              className="min-h-[48px] rounded-2xl bg-primary text-white px-5 py-3 text-sm font-medium focus-ring"
            >
              Get started
            </Link>
          </div>
          <Disclosure.Button
            className="md:hidden focus-ring rounded-2xl p-2"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </Disclosure.Button>
          <Disclosure.Panel className="absolute left-0 top-full w-full bg-white/95 border-b border-white/50 px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm focus-ring rounded-md px-1"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-3 pt-2">
                <Link href="/login" className="text-sm focus-ring rounded-md px-1 text-primary">
                  Log in
                </Link>
                <Link href="/owner/login" className="text-sm focus-ring rounded-md px-1 text-primary/70">
                  Owner
                </Link>
                <Link
                  href="/signup"
                  className="min-h-[44px] rounded-2xl bg-primary text-white px-4 py-2 text-sm"
                >
                  Get started
                </Link>
              </div>
            </div>
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
}
