'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Calendar, MessageSquare, DollarSign, Check, X, ChevronRight, Filter, Search } from 'lucide-react';
import OwnerSubnav from '@/components/layout/OwnerSubnav';
import Skeleton from '@/components/ui/skeleton';
import Button from '@/components/ui/button';
import { useOwnerAuth } from '@/lib/hooks/useOwnerAuth';

type Notification = {
  id: string;
  type: 'booking' | 'reminder' | 'payment' | 'message' | 'cancellation' | 'confirmation';
  title: string;
  message: string;
  appointmentId?: string;
  customerName?: string;
  serviceName?: string;
  date?: string;
  time?: string;
  status?: string;
  read: boolean;
  createdAt: string;
};

export default function OwnerNotificationsPage() {
  const { user, loading: authLoading, fetchWithAuth } = useOwnerAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (authLoading || !user) return;
    
    const loadNotifications = async () => {
      try {
        const res = await fetchWithAuth('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [authLoading, user, fetchWithAuth]);

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications
    .filter((n) => {
      if (filter !== 'all' && n.type !== filter) return false;
      if (searchTerm && !n.message.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !n.customerName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type: Notification['type']) => {
    const icons = {
      booking: <Calendar size={20} />,
      reminder: <Bell size={20} />,
      payment: <DollarSign size={20} />,
      message: <MessageSquare size={20} />,
      cancellation: <X size={20} />,
      confirmation: <Check size={20} />
    };
    return icons[type] || <Bell size={20} />;
  };

  const getTypeColor = (type: Notification['type']) => {
    const colors = {
      booking: 'bg-blue-100 text-blue-600',
      reminder: 'bg-amber-100 text-amber-600',
      payment: 'bg-green-100 text-green-600',
      message: 'bg-purple-100 text-purple-600',
      cancellation: 'bg-red-100 text-red-600',
      confirmation: 'bg-accent/30 text-primary'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const isLoading = authLoading || loading;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Notifications</p>
          <h1 className="text-3xl font-display text-primary">Activity Feed</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-charcoal/60 mt-1">{unreadCount} unread notifications</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={markAllAsRead} className="flex items-center gap-2">
            <Check size={16} /> Mark All Read
          </Button>
        )}
      </div>

      <OwnerSubnav />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notifications..."
            className="w-full bg-white/80 rounded-xl pl-10 pr-4 py-3 text-sm border border-white/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All' },
            { id: 'booking', label: 'Bookings' },
            { id: 'payment', label: 'Payments' },
            { id: 'cancellation', label: 'Cancelled' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${
                filter === f.id
                  ? 'bg-primary text-white'
                  : 'bg-white/80 text-primary hover:bg-primary/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="glass rounded-2xl p-6 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-charcoal/30 mb-4" />
            <p className="text-sm text-charcoal/60">No notifications found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`card-surface p-4 flex items-start gap-4 transition-all ${
                  !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeColor(notification.type)}`}>
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-primary">{notification.title}</p>
                      <p className="text-sm text-charcoal/70 mt-1">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </div>
                  
                  {(notification.date || notification.customerName) && (
                    <div className="flex items-center gap-4 mt-2 text-xs text-charcoal/50">
                      {notification.customerName && (
                        <span>{notification.customerName}</span>
                      )}
                      {notification.date && notification.time && (
                        <span>{notification.date} at {notification.time}</span>
                      )}
                    </div>
                  )}
                  
                  {notification.appointmentId && (
                    <Link
                      href={`/owner/appointments/${notification.appointmentId}`}
                      className="inline-flex items-center gap-1 text-sm text-primary mt-2 hover:underline"
                    >
                      View Details <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
                
                <div className="text-xs text-charcoal/40 flex-shrink-0">
                  {new Date(notification.createdAt).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
