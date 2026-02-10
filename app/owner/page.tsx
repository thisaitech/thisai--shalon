'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, Clock, DollarSign, Users } from 'lucide-react';
import OwnerSubnav from '@/components/layout/OwnerSubnav';
import Skeleton from '@/components/ui/skeleton';
import Badge from '@/components/ui/badge';
import { useOwnerAuth } from '@/lib/hooks/useOwnerAuth';
import { formatCurrency, formatTime } from '@/lib/utils';

type Stats = {
  todayAppointments: number;
  avgDuration: string;
  todayRevenue: number;
  returningPct: string;
};

type UpcomingAppointment = {
  id: string;
  serviceName: string;
  time: string;
  customerEmail?: string;
  status: string;
};

export default function OwnerDashboardPage() {
  const { user, loading: authLoading, fetchWithAuth } = useOwnerAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    const load = async () => {
      try {
        const res = await fetchWithAuth('/api/owner/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setUpcoming(data.upcoming || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authLoading, user, fetchWithAuth]);

  const isLoading = authLoading || loading;

  const statCards = stats
    ? [
        { label: 'Appointments', value: String(stats.todayAppointments), icon: CalendarCheck },
        { label: 'Avg. duration', value: stats.avgDuration, icon: Clock },
        { label: 'Today revenue', value: formatCurrency(stats.todayRevenue), icon: DollarSign },
        { label: 'Returning clients', value: stats.returningPct, icon: Users }
      ]
    : [
        { label: 'Appointments', value: '—', icon: CalendarCheck },
        { label: 'Avg. duration', value: '—', icon: Clock },
        { label: 'Today revenue', value: '—', icon: DollarSign },
        { label: 'Returning clients', value: '—', icon: Users }
      ];

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
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))
          : statCards.map(({ label, value, icon: Icon }) => (
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
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-charcoal/60 py-4 text-center">No upcoming appointments today.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((item) => (
              <div key={item.id} className="card-surface p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-primary">{item.customerEmail || 'Walk-in'}</p>
                  <p className="text-sm text-charcoal/70">{item.serviceName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={
                    item.status === 'confirmed' ? 'bg-accent/30 text-primary' : 'bg-highlight/20 text-primary'
                  }>
                    {item.status}
                  </Badge>
                  <span className="pill bg-accent/30 text-primary">{formatTime(item.time)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
