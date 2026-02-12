'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MessageCircle,
  Wallet
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import Skeleton from '@/components/ui/skeleton';

type CustomerNotification = {
  id: string;
  appointmentId: string;
  type: 'booking' | 'confirmation' | 'cancellation' | 'payment' | 'reminder' | 'message';
  title: string;
  message: string;
  status: string;
  date?: string;
  time?: string;
  serviceName?: string;
  salonName?: string;
  servicePrice?: number;
  paymentStatus?: string | null;
  createdAt: string;
};

function statusBadge(status: string) {
  if (status === 'confirmed' || status === 'completed') return 'bg-green-100 text-green-700';
  if (status === 'canceled') return 'bg-red-100 text-red-700';
  if (status === 'delayed') return 'bg-orange-100 text-orange-700';
  return 'bg-amber-100 text-amber-700';
}

function typeIcon(type: CustomerNotification['type']) {
  if (type === 'confirmation') return <CheckCircle2 size={18} />;
  if (type === 'cancellation') return <AlertCircle size={18} />;
  if (type === 'payment') return <Wallet size={18} />;
  if (type === 'message') return <MessageCircle size={18} />;
  if (type === 'reminder') return <CalendarClock size={18} />;
  return <Clock3 size={18} />;
}

export default function CustomerNotificationsPage() {
  const { user, loading: authLoading, fetchWithAuth } = useAuth();
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const loadNotifications = async () => {
      try {
        const res = await fetchWithAuth('/api/customer/notifications');
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          notifications?: CustomerNotification[];
        };
        if (!res.ok) {
          throw new Error(data.error || 'Unable to load notifications');
        }
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        setError(null);
      } catch (err) {
        setError((err as Error).message || 'Unable to load notifications');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [authLoading, fetchWithAuth, user]);

  const pendingCount = useMemo(
    () => notifications.filter((item) => item.status === 'pending').length,
    [notifications]
  );

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <Bell size={48} className="mx-auto text-charcoal/30 mb-4" />
          <h1 className="text-2xl font-display text-primary mb-2">Notifications</h1>
          <p className="text-charcoal/60 mb-5">Login to view appointment updates.</p>
          <Link href="/login" className="pill bg-primary text-white">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Notifications</p>
          <h1 className="text-3xl font-display text-primary">Appointment Updates</h1>
          <p className="text-sm text-charcoal/60 mt-1">
            {pendingCount} pending confirmation
            {pendingCount === 1 ? '' : 's'}
          </p>
        </div>
        <Link href="/appointments" className="pill bg-white/90 text-primary">
          My Appointments
        </Link>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {notifications.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <Bell size={44} className="mx-auto text-charcoal/30 mb-4" />
          <p className="text-sm text-charcoal/60">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const notificationStatus =
              item.status === 'pending' ||
              item.status === 'confirmed' ||
              item.status === 'completed' ||
              item.status === 'canceled' ||
              item.status === 'delayed'
                ? item.status
                : 'pending';
            const href = item.appointmentId
              ? `/booking-confirmation?appointment=${encodeURIComponent(item.appointmentId)}&status=${encodeURIComponent(notificationStatus)}`
              : '/appointments';

            return (
              <Link
                key={item.id}
                href={href}
                className="glass rounded-2xl p-4 flex items-start gap-3 hover:bg-white/95 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                  {typeIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-primary">{item.title}</p>
                    <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${statusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-charcoal/70 mt-1">{item.message}</p>
                  <div className="text-xs text-charcoal/55 mt-2 flex flex-wrap items-center gap-3">
                    {item.salonName ? <span>{item.salonName}</span> : null}
                    {item.serviceName ? <span>{item.serviceName}</span> : null}
                    {item.date && item.time ? (
                      <span>
                        {formatDate(new Date(`${item.date}T00:00:00`))} at {formatTime(item.time)}
                      </span>
                    ) : null}
                    {typeof item.servicePrice === 'number' ? (
                      <span>{formatCurrency(item.servicePrice)}</span>
                    ) : null}
                  </div>
                </div>
                <ChevronRight size={18} className="text-charcoal/35 mt-1 shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
