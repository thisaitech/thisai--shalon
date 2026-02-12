'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Skeleton from '@/components/ui/skeleton';
import Badge from '@/components/ui/badge';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'canceled' | 'delayed';

type Appointment = {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  salonId: string;
  salonName?: string;
  salonLocation?: string;
  servicePrice?: number;
  paymentStatus?: string | null;
};

function normalizeStatus(value: unknown): AppointmentStatus {
  const status = String(value || 'pending').toLowerCase();
  if (status === 'confirmed') return 'confirmed';
  if (status === 'completed') return 'completed';
  if (status === 'canceled' || status === 'cancelled') return 'canceled';
  if (status === 'delayed') return 'delayed';
  return 'pending';
}

function getStatusBadgeClass(status: AppointmentStatus) {
  if (status === 'confirmed') return 'bg-green-100 text-green-700';
  if (status === 'completed') return 'bg-blue-100 text-blue-700';
  if (status === 'canceled') return 'bg-red-100 text-red-700';
  if (status === 'delayed') return 'bg-orange-100 text-orange-700';
  return 'bg-amber-100 text-amber-700';
}

function getAppointmentStart(appointment: Pick<Appointment, 'date' | 'time'>) {
  if (!appointment.date) return null;
  const timePart = /^\d{2}:\d{2}$/.test(appointment.time) ? appointment.time : '00:00';
  const value = new Date(`${appointment.date}T${timePart}:00`);
  if (Number.isNaN(value.getTime())) return null;
  return value;
}

function isCurrentAppointment(appointment: Appointment) {
  if (appointment.status === 'completed' || appointment.status === 'canceled') return false;
  const start = getAppointmentStart(appointment);
  if (!start) return true;
  return start.getTime() >= Date.now();
}

export default function AppointmentsView({ title }: { title: string }) {
  const { user, loading: authLoading, fetchWithAuth } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    let refreshTimer: number | null = null;

    if (!user) {
      setAppointments([]);
      setLoading(false);
      return () => {};
    }

    const query = new URLSearchParams();
    if (user.uid) query.set('customerId', user.uid);
    if (user.email) query.set('customerEmail', user.email);

    if (!query.toString()) {
      setAppointments([]);
      setLoading(false);
      return () => {};
    }

    const loadAppointments = async ({ silent }: { silent: boolean }) => {
      if (!silent) setLoading(true);
      try {
        const res = await fetchWithAuth(`/api/appointments?${query.toString()}`);
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          appointments?: Array<Record<string, unknown>>;
        };
        if (!res.ok) {
          throw new Error(data.error || 'Unable to load appointments');
        }

        const next = Array.isArray(data.appointments)
          ? data.appointments.map((appointment) => {
              const price = Number(
                appointment.servicePrice ??
                  appointment.price ??
                  0
              );
              return {
                id: String(appointment.id || ''),
                serviceName: String(appointment.serviceName || 'Service'),
                date: String(appointment.date || ''),
                time: String(appointment.time || ''),
                status: normalizeStatus(appointment.status),
                salonId: String(appointment.salonId || ''),
                salonName:
                  typeof appointment.salonName === 'string'
                    ? appointment.salonName
                    : undefined,
                salonLocation:
                  typeof appointment.salonLocation === 'string'
                    ? appointment.salonLocation
                    : undefined,
                servicePrice: Number.isFinite(price) ? price : undefined,
                paymentStatus:
                  typeof appointment.paymentStatus === 'string'
                    ? appointment.paymentStatus
                    : null
              } as Appointment;
            })
          : [];

        next.sort((a, b) => {
          const aStart = getAppointmentStart(a);
          const bStart = getAppointmentStart(b);
          if (aStart && bStart) return aStart.getTime() - bStart.getTime();
          return `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
        });
        if (!cancelled) {
          setAppointments(next);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message || 'Unable to load appointments');
        }
      } finally {
        if (!cancelled && !silent) setLoading(false);
      }
    };

    void loadAppointments({ silent: false });
    refreshTimer = window.setInterval(() => {
      void loadAppointments({ silent: true });
    }, 15000);

    return () => {
      cancelled = true;
      if (refreshTimer) window.clearInterval(refreshTimer);
    };
  }, [authLoading, fetchWithAuth, user]);

  const currentAppointments = useMemo(
    () => appointments.filter((appointment) => isCurrentAppointment(appointment)),
    [appointments]
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Appointments</p>
        <h1 className="text-4xl font-display text-gradient">{title}</h1>
        <p className="mt-2 text-sm text-charcoal/60">Showing current appointments only.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : error ? (
        <div className="glass-panel rounded-2xl p-6 text-sm text-red-600" role="alert">
          {error}
        </div>
      ) : currentAppointments.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <p className="font-display text-lg text-primary">No current appointments.</p>
          <p className="text-sm text-charcoal/60">Previous/completed bookings are hidden here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <p className="font-medium">{appointment.serviceName}</p>
                {appointment.salonName ? (
                  <p className="text-sm text-charcoal/60">{appointment.salonName}</p>
                ) : null}
                <p className="text-sm text-charcoal/70">
                  {formatDate(new Date(`${appointment.date}T00:00:00`))} · {formatTime(appointment.time)}
                </p>
                {typeof appointment.servicePrice === 'number' ? (
                  <p className="text-sm text-primary mt-1">{formatCurrency(appointment.servicePrice)}</p>
                ) : null}
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2">
                <Badge className={getStatusBadgeClass(appointment.status)}>
                  {appointment.status}
                </Badge>
                {appointment.paymentStatus ? (
                  <p className="text-xs text-charcoal/55">Payment: {appointment.paymentStatus}</p>
                ) : null}
                <Link
                  href={`/booking-confirmation?appointment=${encodeURIComponent(appointment.id)}&status=${encodeURIComponent(appointment.status)}`}
                  className="text-sm text-primary hover:underline"
                >
                  Order confirmation
                </Link>
                <Link
                  href={`/messages?appointment=${encodeURIComponent(appointment.id)}`}
                  className="text-sm text-primary hover:underline"
                >
                  Message owner
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
