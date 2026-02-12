'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Bell, Heart, Calendar, Clock, MapPin, Star, Trash2, 
  ShoppingBag, ChevronRight, CheckCircle, XCircle,
  MessageCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatCurrency, formatTime, formatDate, toDateKey } from '@/lib/utils';
import Skeleton from '@/components/ui/skeleton';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';

type WishlistItem = {
  id: string;
  salonId: string;
  salonName: string;
  salonLocation: string;
  salonRating: number;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  addedAt: string;
};

type Appointment = {
  id: string;
  salonId: string;
  salonName: string;
  salonLocation: string;
  serviceName: string;
  servicePrice: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled' | 'delayed';
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  paymentStatus?: string;
};

export default function WishlistPage() {
  const { user, loading: authLoading, fetchWithAuth } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'wishlist' | 'appointments'>('wishlist');
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    const loadData = async () => {
      try {
        if (!user?.email) {
          setWishlist([]);
          setAppointments([]);
          return;
        }

        // Load wishlist
        const wishlistRes = await fetchWithAuth('/api/wishlist');
        if (wishlistRes.ok) {
          const data = await wishlistRes.json();
          setWishlist(data.wishlist || []);
        }

        // Load customer appointments
        const appointmentsRes = await fetchWithAuth(
          `/api/appointments?customerEmail=${encodeURIComponent(user.email)}`
        );
        if (appointmentsRes.ok) {
          const data = await appointmentsRes.json();
          const normalized = Array.isArray(data.appointments)
            ? data.appointments.map((apt: Record<string, unknown>) => ({
                id: String(apt.id || ''),
                salonId: String(apt.salonId || ''),
                salonName: String(apt.salonName || 'Salon'),
                salonLocation: String(apt.salonLocation || 'Location unavailable'),
                serviceName: String(apt.serviceName || 'Service'),
                servicePrice: Number(apt.servicePrice || apt.price || 0),
                date: String(apt.date || ''),
                time: String(apt.time || ''),
                status: String(apt.status || 'pending') as Appointment['status'],
                customerName: apt.customerName ? String(apt.customerName) : undefined,
                customerPhone: apt.customerPhone ? String(apt.customerPhone) : undefined,
                customerEmail: apt.customerEmail ? String(apt.customerEmail) : undefined,
                notes: apt.notes ? String(apt.notes) : undefined,
                paymentStatus: apt.paymentStatus ? String(apt.paymentStatus) : undefined
              }))
            : [];
          setAppointments(normalized);
        }
      } catch {
        setWishlist([]);
        setAppointments([]);
        setActionError('Unable to load wishlist data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authLoading, fetchWithAuth, user?.email]);

  const removeFromWishlist = async (itemId: string) => {
    const previous = wishlist;
    setActionError(null);
    setRemovingId(itemId);
    setWishlist((prev) => prev.filter((item) => item.id !== itemId));
    try {
      const res = await fetchWithAuth(
        `/api/wishlist?id=${encodeURIComponent(itemId)}`,
        { method: 'DELETE' }
      );
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Unable to remove wishlist item');
      }
    } catch (err) {
      setWishlist(previous);
      setActionError((err as Error).message || 'Unable to remove wishlist item');
    } finally {
      setRemovingId(null);
    }
  };

  const moveToBooking = (item: WishlistItem) => {
    // Navigate to booking page with pre-selected service
    window.location.href = `/booking?salon=${encodeURIComponent(item.salonId)}&service=${encodeURIComponent(item.serviceId)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'canceled': return 'bg-red-100 text-red-700';
      case 'delayed': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const todayKey = toDateKey(new Date());
  const upcomingAppointments = appointments.filter(
    (apt) => ['pending', 'confirmed', 'delayed'].includes(apt.status) && apt.date >= todayKey
  );
  const pastAppointments = appointments.filter(
    (apt) => apt.status === 'completed' || apt.status === 'canceled' || apt.date < todayKey
  );

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart size={64} className="mx-auto text-charcoal/30 mb-4" />
          <h1 className="text-2xl font-display text-primary mb-4">Please Login</h1>
          <p className="text-charcoal/60 mb-6">Login to view your wishlist and appointments</p>
          <Link href="/login" className="pill bg-primary text-white">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary/70">My Account</p>
          <h1 className="text-3xl font-display text-primary">My Bookings</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/notifications" className="pill bg-white/90 text-primary flex items-center gap-2">
            <Bell size={16} /> Notifications
          </Link>
          <Link href="/appointments" className="pill bg-white/90 text-primary flex items-center gap-2">
            <Calendar size={16} /> My Appointments
          </Link>
        </div>
      </div>

      {actionError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-charcoal/10 pb-4">
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
            activeTab === 'wishlist'
              ? 'bg-primary text-white'
              : 'bg-white/80 text-primary hover:bg-primary/10'
          }`}
        >
          <Heart size={18} />
          <span>Wishlist ({wishlist.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
            activeTab === 'appointments'
              ? 'bg-primary text-white'
              : 'bg-white/80 text-primary hover:bg-primary/10'
          }`}
        >
          <Calendar size={18} />
          <span>Appointments ({upcomingAppointments.length})</span>
        </button>
      </div>

      {/* Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : wishlist.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <ShoppingBag size={64} className="mx-auto text-charcoal/30 mb-4" />
              <h2 className="text-xl font-display text-primary mb-2">Your Wishlist is Empty</h2>
              <p className="text-charcoal/60 mb-6">Browse salons and save your favorite services</p>
              <Link href="/salons" className="pill bg-primary text-white">
                Browse Salons
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {wishlist.map((item) => (
                <div key={item.id} className="glass rounded-2xl p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-primary">{item.salonName}</h3>
                      <p className="text-sm text-charcoal/60 flex items-center gap-1 mt-1">
                        <MapPin size={14} /> {item.salonLocation}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-lg">
                      <Star size={14} className="text-amber-600" />
                      <span className="text-sm font-medium text-amber-600">{item.salonRating}</span>
                    </div>
                  </div>

                  <div className="card-surface p-4 space-y-2">
                    <p className="font-medium text-primary">{item.serviceName}</p>
                    <div className="flex items-center gap-4 text-sm text-charcoal/60">
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {item.serviceDuration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {formatCurrency(item.servicePrice)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => moveToBooking(item)}
                      className="flex-1 flex items-center gap-2"
                    >
                      <Calendar size={16} /> Book Now
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-red-500"
                      disabled={removingId === item.id}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="space-y-8">
          {/* Upcoming Appointments */}
          <div>
            <h2 className="text-xl font-display text-primary mb-4 flex items-center gap-2">
              <Calendar size={20} /> Upcoming Appointments
            </h2>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <Calendar size={48} className="mx-auto text-charcoal/30 mb-4" />
                <p className="text-charcoal/60">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="glass rounded-2xl p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-primary">{apt.salonName}</h3>
                        <p className="text-sm text-charcoal/60 flex items-center gap-1 mt-1">
                          <MapPin size={14} /> {apt.salonLocation}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="card-surface p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">Date</p>
                        <p className="font-medium text-primary">{formatDate(new Date(apt.date))}</p>
                      </div>
                      <div className="card-surface p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">Time</p>
                        <p className="font-medium text-primary">{formatTime(apt.time)}</p>
                      </div>
                      <div className="card-surface p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">Service</p>
                        <p className="font-medium text-primary">{apt.serviceName}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-medium text-primary">{formatCurrency(apt.servicePrice)}</span>
                      <div className="flex gap-2">
                        {apt.status === 'pending' && (
                          <Badge className="bg-amber-100 text-amber-700">
                            Awaiting Confirmation
                          </Badge>
                        )}
                        {apt.status === 'confirmed' && (
                          <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                            <CheckCircle size={12} /> Confirmed
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-charcoal/10">
                      <Link
                        href={`/booking-confirmation?appointment=${encodeURIComponent(apt.id)}&status=${encodeURIComponent(apt.status)}`}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <CheckCircle size={14} /> View Confirmation
                      </Link>
                      <span className="text-charcoal/30">|</span>
                      <Link
                        href={`/salon/${apt.salonId}`}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <ChevronRight size={14} /> View Salon
                      </Link>
                      <span className="text-charcoal/30">|</span>
                      <Link
                        href={`/messages?appointment=${encodeURIComponent(apt.id)}`}
                        className="text-sm text-charcoal/60 hover:text-primary flex items-center gap-1"
                      >
                        <MessageCircle size={14} /> Contact
                      </Link>
                      <span className="text-charcoal/30">|</span>
                      <button className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
                        <XCircle size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div>
              <h2 className="text-xl font-display text-primary mb-4 flex items-center gap-2">
                <CheckCircle size={20} /> Past Appointments
              </h2>
              <div className="space-y-3">
                {pastAppointments.map((apt) => (
                  <div key={apt.id} className="card-surface p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-primary">{apt.salonName}</p>
                      <p className="text-sm text-charcoal/60">{apt.serviceName} • {formatDate(new Date(apt.date))}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/salons" className="card-surface p-6 space-y-3 hover:shadow-lg transition-all">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <RefreshCw size={24} />
          </div>
          <h3 className="font-medium text-primary">Browse Salons</h3>
          <p className="text-sm text-charcoal/60">Discover new salons and services</p>
        </Link>
        <Link href="/favorites" className="card-surface p-6 space-y-3 hover:shadow-lg transition-all">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <Heart size={24} />
          </div>
          <h3 className="font-medium text-primary">Favorites</h3>
          <p className="text-sm text-charcoal/60">View your favorite salons</p>
        </Link>
        <Link href="/messages" className="card-surface p-6 space-y-3 hover:shadow-lg transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <MessageCircle size={24} />
          </div>
          <h3 className="font-medium text-primary">Messages</h3>
          <p className="text-sm text-charcoal/60">Chat with salon owners</p>
        </Link>
      </div>
    </div>
  );
}
