'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Mail, Phone, Check, X, Clock, Calendar, MessageSquare, Send } from 'lucide-react';
import OwnerSubnav from '@/components/layout/OwnerSubnav';
import Skeleton from '@/components/ui/skeleton';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useOwnerAuth } from '@/lib/hooks/useOwnerAuth';
import { formatTime, formatDate } from '@/lib/utils';

type Appointment = {
  id: string;
  date: string;
  time: string;
  serviceName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  status: string;
  duration?: number;
  price?: number;
  notes?: string;
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

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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
  const [showNotificationModal, setShowNotificationModal] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'email' | 'sms'>('sms');
  const [sendingNotification, setSendingNotification] = useState(false);

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

  const sendNotification = async (appointmentId: string, type: 'email' | 'sms') => {
    setSendingNotification(true);
    try {
      const appointment = appointments.find((a) => a.id === appointmentId);
      if (!appointment) return;

      const res = await fetchWithAuth('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId,
          type,
          customerEmail: appointment.customerEmail,
          customerPhone: appointment.customerPhone,
          customerName: appointment.customerName,
          serviceName: appointment.serviceName,
          date: appointment.date,
          time: appointment.time,
          status: appointment.status
        })
      });

      if (res.ok) {
        alert(`${type === 'email' ? 'Email' : 'SMS'} notification sent successfully!`);
        setShowNotificationModal(null);
      }
    } catch {
      alert('Failed to send notification');
    } finally {
      setSendingNotification(false);
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

  // Group appointments by date for calendar dots
  const appointmentsByDate = appointments.reduce((acc, apt) => {
    const key = apt.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Calendar</p>
          <h1 className="text-3xl font-display text-primary">Manage Appointments</h1>
        </div>
      </div>

      <OwnerSubnav />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Calendar */}
        <div className="card-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="h-10 w-10 rounded-full bg-white/90 shadow-soft flex items-center justify-center hover:bg-primary/10 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h3 className="font-display text-primary text-lg">{MONTHS[viewMonth]} {viewYear}</h3>
            <button onClick={nextMonth} className="h-10 w-10 rounded-full bg-white/90 shadow-soft flex items-center justify-center hover:bg-primary/10 transition-colors">
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
              const dateStr = toDateKey(date);
              const isSelected = isSameDay(selectedDate, date);
              const isToday = isSameDay(today, date);
              const dayAppointments = appointmentsByDate[dateStr] || [];
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={`rounded-xl py-3 text-sm transition-all relative ${
                    isSelected ? 'bg-primary text-white' : isToday ? 'ring-2 ring-primary/30 bg-white/80' : 'bg-white/80 hover:bg-primary/10'
                  }`}
                >
                  {day}
                  {dayAppointments.length > 0 && (
                    <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 ${isSelected ? 'invert' : ''}`}>
                      {dayAppointments.slice(0, 3).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-accent" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Appointments List */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display text-primary">
              {isSameDay(selectedDate, today) ? "Today's" : formatDate(selectedDate)} Schedule
            </h2>
            <span className="text-xs text-charcoal/50">{appointments.length} appointments</span>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-charcoal/30 mb-4" />
              <p className="text-sm text-charcoal/60">No appointments for this date.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="card-surface p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-charcoal/50" />
                      <span className="text-sm text-primary/80">{formatTime(appointment.time)}</span>
                      {appointment.duration && (
                        <span className="text-xs text-charcoal/50">({appointment.duration}min)</span>
                      )}
                    </div>
                    <Badge className={
                      appointment.status === 'confirmed' ? 'bg-accent/30 text-primary' :
                      appointment.status === 'canceled' ? 'bg-red-100 text-red-600' :
                      appointment.status === 'completed' ? 'bg-green-100 text-green-600' :
                      'bg-highlight/20 text-amber-600'
                    }>
                      {appointment.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="font-medium text-primary">{appointment.serviceName}</p>
                    {appointment.customerName && (
                      <p className="text-sm text-charcoal/70">{appointment.customerName}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-charcoal/50">
                    {appointment.customerEmail && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} /> {appointment.customerEmail}
                      </span>
                    )}
                    {appointment.customerPhone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} /> {appointment.customerPhone}
                      </span>
                    )}
                    {appointment.price && (
                      <span className="font-medium text-primary">₹{appointment.price}</span>
                    )}
                  </div>
                  
                  {appointment.notes && (
                    <p className="text-xs text-charcoal/50 italic">Note: {appointment.notes}</p>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {appointment.status === 'pending' && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => updateStatus(appointment.id, 'confirmed')}
                          disabled={updating === appointment.id}
                          className="text-xs px-3 py-1.5"
                        >
                          <Check size={14} /> Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => updateStatus(appointment.id, 'canceled')}
                          disabled={updating === appointment.id}
                          className="text-xs px-3 py-1.5"
                        >
                          <X size={14} /> Cancel
                        </Button>
                      </>
                    )}
                    {appointment.status === 'confirmed' && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => updateStatus(appointment.id, 'completed')}
                          disabled={updating === appointment.id}
                          className="text-xs px-3 py-1.5"
                        >
                          <Check size={14} /> Complete
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setNotificationType('sms');
                            setShowNotificationModal(appointment.id);
                          }}
                          className="text-xs px-3 py-1.5"
                        >
                          <MessageSquare size={14} /> Send SMS
                        </Button>
                      </>
                    )}
                    {appointment.status === 'completed' && (
                      <Button
                        variant="ghost"
                        onClick={() => updateStatus(appointment.id, 'confirmed')}
                        disabled={updating === appointment.id}
                        className="text-xs px-3 py-1.5"
                      >
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-display text-primary">Send Confirmation</h3>
            <p className="text-sm text-charcoal/60">
              Send {notificationType === 'sms' ? 'SMS' : 'email'} confirmation to the client for this appointment.
            </p>
            <div className="flex gap-2">
              <Button
                variant={notificationType === 'sms' ? 'primary' : 'ghost'}
                onClick={() => setNotificationType('sms')}
                className="flex-1"
              >
                <MessageSquare size={16} /> SMS
              </Button>
              <Button
                variant={notificationType === 'email' ? 'primary' : 'ghost'}
                onClick={() => setNotificationType('email')}
                className="flex-1"
              >
                <Mail size={16} /> Email
              </Button>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => sendNotification(showNotificationModal, notificationType)}
                disabled={sendingNotification}
                className="flex-1"
              >
                {sendingNotification ? 'Sending...' : 'Send Confirmation'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowNotificationModal(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
