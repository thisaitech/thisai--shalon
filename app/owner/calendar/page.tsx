'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import OwnerSubnav from '@/components/layout/OwnerSubnav';
import Skeleton from '@/components/ui/skeleton';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { useOwnerAuth } from '@/lib/hooks/useOwnerAuth';
import { formatTime } from '@/lib/utils';

type Appointment = {
  id: string;
  time: string;
  serviceName: string;
  customerEmail?: string;
  status: string;
  duration?: number;
  price?: number;
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Monday-start
}

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function OwnerCalendarPage() {
  const { user, loading: authLoading, fetchWithAuth } = useOwnerAuth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const dateKey = toDateKey(selectedDate);

  useEffect(() => {
    if (authLoading || !user) return;
    setLoading(true);
    const load = async () => {
      try {
        const res = await fetchWithAuth(`/api/owner/appointments?date=${dateKey}`);
        if (res.ok) {
          const data = await res.json();
          setAppointments(data.appointments || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authLoading, user, dateKey, fetchWithAuth]);

  const updateStatus = async (appointmentId: string, status: string) => {
    setUpdating(appointmentId);
    try {
      const res = await fetchWithAuth('/api/appointments/status', {
        method: 'PATCH',
        body: JSON.stringify({ appointmentId, status })
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === appointmentId ? { ...a, status } : a))
        );
      }
    } catch {
      // ignore
    } finally {
      setUpdating(null);
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Calendar</p>
          <h1 className="text-3xl font-display text-primary">Manage appointments</h1>
        </div>
      </div>

      <OwnerSubnav />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="h-10 w-10 rounded-full bg-white/90 shadow-soft flex items-center justify-center">
              <ChevronLeft size={18} />
            </button>
            <h3 className="font-display text-primary">{MONTHS[viewMonth]} {viewYear}</h3>
            <button onClick={nextMonth} className="h-10 w-10 rounded-full bg-white/90 shadow-soft flex items-center justify-center">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-3 text-center text-xs text-charcoal/60">
            {DAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const date = new Date(viewYear, viewMonth, day);
              const isSelected = isSameDay(selectedDate, date);
              const isToday = isSameDay(today, date);
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={`rounded-xl py-3 text-sm transition-all ${
                    isSelected ? 'bg-primary text-white' : isToday ? 'ring-2 ring-primary/30 bg-white/80' : 'bg-white/80 hover:bg-primary/10'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-display text-primary">
            {isSameDay(selectedDate, today) ? "Today's" : dateKey} schedule
          </h2>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : appointments.length === 0 ? (
            <p className="text-sm text-charcoal/60 py-4 text-center">No appointments for this date.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="card-surface p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-primary/80">{formatTime(appointment.time)}</p>
                    <Badge className={
                      appointment.status === 'confirmed' ? 'bg-accent/30 text-primary' :
                      appointment.status === 'canceled' ? 'bg-red-100 text-red-600' :
                      'bg-highlight/20 text-primary'
                    }>
                      {appointment.status}
                    </Badge>
                  </div>
                  <p className="font-medium text-primary">{appointment.serviceName}</p>
                  {appointment.customerEmail && (
                    <p className="text-xs text-charcoal/50">{appointment.customerEmail}</p>
                  )}
                  {appointment.status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="secondary"
                        onClick={() => updateStatus(appointment.id, 'confirmed')}
                        disabled={updating === appointment.id}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => updateStatus(appointment.id, 'canceled')}
                        disabled={updating === appointment.id}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  {appointment.status === 'confirmed' && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="secondary"
                        onClick={() => updateStatus(appointment.id, 'completed')}
                        disabled={updating === appointment.id}
                      >
                        Complete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
