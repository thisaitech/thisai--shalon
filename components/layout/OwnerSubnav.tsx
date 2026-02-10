import Link from 'next/link';

const items = [
  { href: '/owner', label: 'Dashboard' },
  { href: '/owner/calendar', label: 'Calendar' },
  { href: '/owner/customers', label: 'Customers' },
  { href: '/owner/services', label: 'Services' },
  { href: '/owner/stats', label: 'Analytics' },
  { href: '/owner/settings', label: 'Settings' }
];

export default function OwnerSubnav() {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="pill bg-white/90 text-primary">
          {item.label}
        </Link>
      ))}
    </div>
  );
}
