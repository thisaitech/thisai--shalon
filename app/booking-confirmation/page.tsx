'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Clock3, RefreshCcw } from 'lucide-react';
import { buildApiUrl } from '@/lib/api/client';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';

type Appointment = {
  id: string;
  salonName?: string;
  serviceName?: string;
  date?: string;
  time?: string;
  status?: string;
  servicePrice?: number;
  paymentStatus?: string | null;
  updatedAt?: string;
};

function getStatusTheme(status: string) {
  if (status === 'confirmed' || status === 'completed') {
    return {
      label: 'Confirmed',
      title: 'Your appointment is confirmed!',
      subtitle: 'Owner has confirmed your booking.',
      badgeClass: 'bg-green-100 text-green-700',
      Icon: CheckCircle2
    };
  }
  if (status === 'canceled') {
    return {
      label: 'Canceled',
      title: 'Appointment canceled',
      subtitle: 'This booking was canceled by the salon.',
      badgeClass: 'bg-red-100 text-red-700',
      Icon: AlertCircle
    };
  }
  if (status === 'delayed') {
    return {
      label: 'Rescheduled',
      title: 'Appointment rescheduled',
      subtitle: 'Salon has updated your appointment schedule.',
      badgeClass: 'bg-orange-100 text-orange-700',
      Icon: RefreshCcw
    };
  }
  return {
    label: 'Pending',
    title: 'Booking received!',
    subtitle: 'Waiting for owner confirmation. This page updates automatically.',
    badgeClass: 'bg-amber-100 text-amber-700',
    Icon: Clock3
  };
}

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointment') || '';
  const statusParam = searchParams.get('status') || '';
  const method = searchParams.get('method') || '';

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(Boolean(appointmentId));
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const effectiveStatus = useMemo(() => {
    if (appointment?.status) return String(appointment.status);
    if (
      statusParam === 'pending' ||
      statusParam === 'confirmed' ||
      statusParam === 'completed' ||
      statusParam === 'canceled' ||
      statusParam === 'delayed'
    ) {
      return statusParam;
    }
    return 'pending';
  }, [appointment?.status, statusParam]);

  useEffect(() => {
    if (!appointmentId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const loadAppointment = async () => {
      try {
        const res = await fetch(
          buildApiUrl(`/api/appointments?appointmentId=${encodeURIComponent(appointmentId)}`),
          { cache: 'no-store' }
        );
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          appointment?: Appointment;
        };

        if (!res.ok) {
          throw new Error(data.error || 'Unable to load booking status');
        }

        if (cancelled) return;
        if (data.appointment) {
          setAppointment(data.appointment);
          setLastUpdated(new Date().toISOString());
        }
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message || 'Unable to load booking status');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadAppointment();

    // Keep status in sync while booking is awaiting owner action.
    intervalId = setInterval(() => {
      if (['pending', 'delayed'].includes(effectiveStatus)) {
        loadAppointment();
      }
    }, 10000);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [appointmentId, effectiveStatus]);

  const theme = getStatusTheme(effectiveStatus);

  const dateLabel =
    appointment?.date ? formatDate(new Date(`${appointment.date}T00:00:00`)) : null;
  const timeLabel = appointment?.time ? formatTime(appointment.time) : null;
  const priceLabel =
    typeof appointment?.servicePrice === 'number'
      ? formatCurrency(appointment.servicePrice)
      : null;

  const methodHint =
    effectiveStatus === 'pending'
      ? method === 'upi'
        ? 'UPI verification is in progress.'
        : method === 'cash'
          ? 'Pay at the studio once owner confirms your booking.'
          : 'We are waiting for salon confirmation.'
      : null;

  return (
    <div className="confetti min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="glass-panel rounded-3xl p-8 sm:p-10 max-w-xl w-full">
        <div className="text-center">
          <p className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${theme.badgeClass}`}>
            {theme.label}
          </p>
          <h1 className="mt-4 text-3xl font-display text-gradient">{theme.title}</h1>
          <p className="mt-3 text-sm text-charcoal/70">{theme.subtitle}</p>
          {methodHint ? <p className="mt-2 text-xs text-charcoal/60">{methodHint}</p> : null}
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-primary/10 bg-white/70 p-4 text-sm text-charcoal/70">
            Loading appointment status...
          </div>
        ) : appointment ? (
          <div className="mt-6 rounded-2xl border border-primary/10 bg-white/70 p-4 space-y-2 text-sm">
            <p className="font-medium text-primary">{appointment.serviceName || 'Service'}</p>
            {appointment.salonName ? <p className="text-charcoal/70">{appointment.salonName}</p> : null}
            {dateLabel && timeLabel ? (
              <p className="text-charcoal/70">
                {dateLabel} at {timeLabel}
              </p>
            ) : null}
            {priceLabel ? <p className="text-primary font-medium">{priceLabel}</p> : null}
            {appointment.paymentStatus ? (
              <p className="text-xs text-charcoal/60">
                Payment: {String(appointment.paymentStatus)}
              </p>
            ) : null}
            {lastUpdated ? (
              <p className="text-xs text-charcoal/50">
                Last checked: {new Date(lastUpdated).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </p>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/appointments"
            className="min-h-[48px] rounded-2xl bg-gradient-to-r from-primary via-lilac to-accent text-white px-6 py-3 text-sm font-medium focus-ring shadow-glow text-center"
          >
            View my appointments
          </Link>
          <Link
            href="/salons"
            className="min-h-[48px] rounded-2xl border border-primary/20 px-6 py-3 text-sm font-medium focus-ring text-center"
          >
            Book another service
          </Link>
        </div>
      </div>
    </div>
  );
}
