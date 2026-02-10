'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Calendar, Clock, User, Phone, Mail, MapPin, 
  Check, X, MessageCircle, ChevronLeft, DollarSign,
  Bell, Send, AlertCircle, CalendarClock, Settings
} from 'lucide-react';
import Link from 'next/link';
import OwnerSubnav from '@/components/layout/OwnerSubnav';
import Skeleton from '@/components/ui/skeleton';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { useOwnerAuth } from '@/lib/hooks/useOwnerAuth';
import { formatCurrency, formatTime, formatDate } from '@/lib/utils';

type AppointmentDetail = {
  id: string;
  date: string;
  time: string;
  serviceName: string;
  serviceId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerId?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled' | 'delayed';
  price: number;
  duration: number;
  notes?: string;
  salonId: string;
  salonName?: string;
  salonLocation?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  updatedAt: string;
};

type Message = {
  id: string;
  sender: 'owner' | 'customer';
  text: string;
  timestamp: string;
  read: boolean;
};

export default function AppointmentDetailPage() {
  const { user, loading: authLoading, fetchWithAuth } = useOwnerAuth();
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [delayDays, setDelayDays] = useState(1);
  const [delayReason, setDelayReason] = useState('');

  useEffect(() => {
    if (authLoading || !user) return;
    
    const loadAppointment = async () => {
      try {
        const res = await fetchWithAuth(`/api/owner/appointments?appointmentId=${appointmentId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.appointments && data.appointments.length > 0) {
            setAppointment({ ...data.appointments[0], id: appointmentId });
          }
        }
      } catch (error) {
        console.error('Error loading appointment:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointment();
  }, [authLoading, user, appointmentId, fetchWithAuth]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetchWithAuth('/api/appointments/status', {
        method: 'PATCH',
        body: JSON.stringify({ appointmentId, status })
      });
      if (res.ok) {
        setAppointment((prev) => prev ? { ...prev, status: status as AppointmentDetail['status'] } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !appointment) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'owner',
      text: message,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setMessage('');
    
    try {
      await fetchWithAuth('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId,
          sender: 'owner',
          text: newMessage.text
        })
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const delayAppointment = async () => {
    if (!appointment) return;
    
    setUpdating(true);
    try {
      const currentDate = new Date(appointment.date);
      currentDate.setDate(currentDate.getDate() + delayDays);
      const newDate = currentDate.toISOString().slice(0, 10);
      
      const res = await fetchWithAuth('/api/appointments/status', {
        method: 'PATCH',
        body: JSON.stringify({ 
          appointmentId, 
          status: 'delayed',
          delayDate: newDate,
          delayReason
        })
      });
      
      if (res.ok) {
        setAppointment((prev) => prev ? { ...prev, status: 'delayed', date: newDate } : null);
        setShowDelayModal(false);
      }
    } catch (error) {
      console.error('Error delaying appointment:', error);
    } finally {
      setUpdating(false);
    }
  };

  const sendConfirmation = async () => {
    if (!appointment) return;
    
    try {
      await fetchWithAuth('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId,
          type: 'sms',
          customerPhone: appointment.customerPhone,
          customerName: appointment.customerName,
          serviceName: appointment.serviceName,
          date: appointment.date,
          time: appointment.time,
          status: appointment.status
        })
      });
      alert('Confirmation sent to customer!');
    } catch (error) {
      console.error('Error sending confirmation:', error);
    }
  };

  const isLoading = authLoading || loading;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-display text-primary mb-4">Appointment Not Found</h1>
        <Link href="/owner/calendar" className="pill bg-primary text-white">
          Back to Calendar
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/owner/calendar" className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
            <ChevronLeft size={20} className="text-primary" />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Appointment Details</p>
            <h1 className="text-3xl font-display text-primary">{appointment.serviceName}</h1>
          </div>
        </div>
        <Badge className={
          appointment.status === 'confirmed' ? 'bg-accent/30 text-primary' :
          appointment.status === 'completed' ? 'bg-green-100 text-green-600' :
          appointment.status === 'canceled' ? 'bg-red-100 text-red-600' :
          appointment.status === 'delayed' ? 'bg-orange-100 text-orange-600' :
          'bg-amber-100 text-amber-600'
        }>
          {appointment.status}
        </Badge>
      </div>

      <OwnerSubnav />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appointment Details */}
        <div className="glass rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-display text-primary flex items-center gap-2">
            <Calendar size={20} />
            Appointment Information
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="card-surface p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">Date</p>
                <p className="text-lg font-display text-primary">{formatDate(new Date(appointment.date))}</p>
              </div>
              <div className="card-surface p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">Time</p>
                <p className="text-lg font-display text-primary">{formatTime(appointment.time)}</p>
              </div>
            </div>

            <div className="card-surface p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">Service</p>
              <p className="text-lg font-medium text-primary">{appointment.serviceName}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-charcoal/60">
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {appointment.duration} min
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign size={14} /> {formatCurrency(appointment.price)}
                </span>
              </div>
            </div>

            {appointment.notes && (
              <div className="card-surface p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">Notes</p>
                <p className="text-sm text-primary">{appointment.notes}</p>
              </div>
            )}

            <div className="card-surface p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">Payment</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-medium text-primary">{formatCurrency(appointment.price)}</span>
                <Badge className={appointment.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}>
                  {appointment.paymentStatus || 'Pending'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="glass rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-display text-primary flex items-center gap-2">
            <User size={20} />
            Customer Information
          </h2>

          <div className="space-y-4">
            {appointment.customerName && (
              <div className="card-surface p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">Name</p>
                <p className="text-lg font-medium text-primary">{appointment.customerName}</p>
              </div>
            )}

            {appointment.customerEmail && (
              <div className="card-surface p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">Email</p>
                <p className="text-lg font-medium text-primary flex items-center gap-2">
                  <Mail size={16} className="text-charcoal/40" />
                  {appointment.customerEmail}
                </p>
              </div>
            )}

            {appointment.customerPhone && (
              <div className="card-surface p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">Phone</p>
                <p className="text-lg font-medium text-primary flex items-center gap-2">
                  <Phone size={16} className="text-charcoal/40" />
                  {appointment.customerPhone}
                </p>
              </div>
            )}

            {appointment.salonLocation && (
              <div className="card-surface p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">Salon Location</p>
                <p className="text-sm text-primary flex items-center gap-2 mt-1">
                  <MapPin size={14} className="text-charcoal/40" />
                  {appointment.salonLocation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-display text-primary flex items-center gap-2">
          <Settings size={20} />
          Actions
        </h2>

        <div className="flex flex-wrap gap-3">
          {appointment.status === 'pending' && (
            <>
              <Button onClick={() => updateStatus('confirmed')} disabled={updating} className="flex items-center gap-2">
                <Check size={16} /> Confirm Booking
              </Button>
              <Button variant="ghost" onClick={() => updateStatus('canceled')} disabled={updating} className="flex items-center gap-2 text-red-600">
                <X size={16} /> Cancel
              </Button>
              <Button variant="secondary" onClick={() => setShowDelayModal(true)} className="flex items-center gap-2">
                <CalendarClock size={16} /> Delay Booking
              </Button>
            </>
          )}
          
          {appointment.status === 'confirmed' && (
            <>
              <Button onClick={() => updateStatus('completed')} disabled={updating} className="flex items-center gap-2">
                <Check size={16} /> Mark Complete
              </Button>
              <Button variant="ghost" onClick={() => updateStatus('canceled')} disabled={updating} className="flex items-center gap-2 text-red-600">
                <X size={16} /> Cancel
              </Button>
              <Button variant="secondary" onClick={() => setShowDelayModal(true)} className="flex items-center gap-2">
                <CalendarClock size={16} /> Reschedule
              </Button>
              <Button variant="secondary" onClick={sendConfirmation} className="flex items-center gap-2">
                <Bell size={16} /> Send Reminder
              </Button>
            </>
          )}

          {appointment.status === 'delayed' && (
            <>
              <Button onClick={() => updateStatus('confirmed')} disabled={updating} className="flex items-center gap-2">
                <Check size={16} /> Confirm New Date
              </Button>
              <Button variant="ghost" onClick={() => updateStatus('canceled')} disabled={updating} className="flex items-center gap-2 text-red-600">
                <X size={16} /> Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Messages Section */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-display text-primary flex items-center gap-2">
          <MessageCircle size={20} />
          Messages
        </h2>

        <div className="card-surface p-4 space-y-4 max-h-64 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-charcoal/60 text-center py-4">No messages yet</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'owner' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-xl ${
                  msg.sender === 'owner' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white/80 text-primary rounded-tl-none'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'owner' ? 'text-white/70' : 'text-charcoal/50'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-white/80 rounded-xl px-4 py-3 text-sm border border-white/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button onClick={sendMessage} className="flex items-center gap-2">
            <Send size={16} /> Send
          </Button>
        </div>
      </div>

      {/* Delay Modal */}
      {showDelayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-display text-primary">Delay Appointment</h3>
            <p className="text-sm text-charcoal/60">Reschedule this appointment for a later date.</p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Delay by (days)</label>
              <input
                type="number"
                value={delayDays}
                onChange={(e) => setDelayDays(parseInt(e.target.value) || 1)}
                min="1"
                max="30"
                className="w-full bg-white/80 rounded-xl px-4 py-3 text-sm border border-white/70"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Reason (optional)</label>
              <textarea
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                placeholder="Reason for delay..."
                className="w-full bg-white/80 rounded-xl px-4 py-3 text-sm border border-white/70 min-h-[80px]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={delayAppointment} disabled={updating} className="flex-1">
                {updating ? 'Processing...' : 'Confirm Delay'}
              </Button>
              <Button variant="ghost" onClick={() => setShowDelayModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
