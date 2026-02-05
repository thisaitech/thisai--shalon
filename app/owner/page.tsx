import Link from 'next/link';
import { CalendarCheck, Clock, DollarSign, Users } from 'lucide-react';
import OwnerSubnav from '@/components/layout/OwnerSubnav';

const upcoming = [
  { name: 'Jordan Lee', service: 'Precision Cut', time: '10:00 AM' },
  { name: 'Alex Kim', service: 'Texture Reset', time: '12:30 PM' },
  { name: 'Sam Rivera', service: 'Soft Sculpt Massage', time: '2:00 PM' }
];

export default function OwnerDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Owner dashboard</p>
          <h1 className="text-3xl font-display text-primary">Today at a glance</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/owner/calendar" className="pill bg-white/90">View calendar</Link>
          <Link href="/owner/services" className="pill bg-white/90">Edit services</Link>
        </div>
      </div>

      <OwnerSubnav />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Appointments', value: '12', icon: CalendarCheck },
          { label: 'Avg. duration', value: '58m', icon: Clock },
          { label: 'Today revenue', value: '$1,280', icon: DollarSign },
          { label: 'Returning clients', value: '64%', icon: Users }
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card-surface p-5 space-y-3">
            <Icon size={18} className="text-primary" />
            <p className="text-xs uppercase tracking-[0.3em] text-charcoal/50">{label}</p>
            <p className="text-2xl font-display text-primary">{value}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display text-primary">Upcoming appointments</h2>
          <Link href="/owner/calendar" className="text-sm text-primary">See all</Link>
        </div>
        <div className="space-y-3">
          {upcoming.map((item) => (
            <div key={item.name} className="card-surface p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-primary">{item.name}</p>
                <p className="text-sm text-charcoal/70">{item.service}</p>
              </div>
              <span className="pill bg-accent/30 text-primary">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
