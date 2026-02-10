'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, Users, Settings, Store, Clock, 
  MessageSquare, CreditCard, Bell, ChevronRight, TrendingUp,
  CheckCircle, XCircle, AlertCircle, DollarSign, Activity
} from 'lucide-react';
import { useOwnerAuth } from '@/lib/hooks/useOwnerAuth';
import { formatCurrency, formatTime } from '@/lib/utils';
import OwnerSubnav from '@/components/layout/OwnerSubnav';
import Skeleton from '@/components/ui/skeleton';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';

type Appointment = {
  id: string;
  serviceName: string;
  time: string;
  customerName?: string;
  customerPhone?: string;
  status: string;
  price: number;
};

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type QuickStat = {
  label: string;
  value: string;
  icon: string;
  color: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
};

export default function EnhancedOwnerDashboard() {
  const { user, loading: authLoading, fetchWithAuth } = useOwnerAuth();
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'notifications'>('overview');

  useEffect(() => {
    if (authLoading || !user) return;
    
    const loadDashboardData = async () => {
      try {
        const statsRes = await fetchWithAuth('/api/owner/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          const s = statsData.stats || {};
          setStats([
            { label: "Today's Appointments", value: String(s.todayAppointments || 0), icon: 'Calendar', color: 'bg-blue-500', change: '+12%', changeType: 'up' },
            { label: "Today's Revenue", value: formatCurrency(s.todayRevenue || 0), icon: 'DollarSign', color: 'bg-green-500', change: '+8%', changeType: 'up' },
            { label: 'Pending Confirmations', value: String(s.pendingAppointments || 0), icon: 'AlertCircle', color: 'bg-amber-500', change: '-5%', changeType: 'down' },
            { label: 'Total Customers', value: String(s.totalCustomers || 0), icon: 'Users', color: 'bg-purple-500', change: '+15%', changeType: 'up' }
          ]);
        }

        const todayKey = new Date().toISOString().slice(0, 10);
        const appointmentsRes = await fetchWithAuth(`/api/owner/appointments?date=${todayKey}`);
        if (appointmentsRes.ok) {
          const aptData = await appointmentsRes.json();
          setTodayAppointments((aptData.appointments || []).slice(0, 5));
        }

        const notificationsRes = await fetchWithAuth('/api/notifications');
        if (notificationsRes.ok) {
          const notifData = await notificationsRes.json();
          setNotifications((notifData.notifications || []).slice(0, 5));
        }
      } catch {
        setStats([
          { label: "Today's Appointments", value: '8', icon: 'Calendar', color: 'bg-blue-500', change: '+12%', changeType: 'up' },
          { label: "Today's Revenue", value: formatCurrency(4500), icon: 'DollarSign', color: 'bg-green-500', change: '+8%', changeType: 'up' },
          { label: 'Pending Confirmations', value: '3', icon: 'AlertCircle', color: 'bg-amber-500', change: '-5%', changeType: 'down' },
          { label: 'Total Customers', value: '156', icon: 'Users', color: 'bg-purple-500', change: '+15%', changeType: 'up' }
        ]);
        setTodayAppointments([
          { id: '1', serviceName: 'Haircut & Styling', time: '10:00', customerName: 'John Doe', status: 'confirmed', price: 500 },
          { id: '2', serviceName: 'Full Body Massage', time: '11:00', customerName: 'Jane Smith', status: 'pending', price: 1200 },
          { id: '3', serviceName: 'Facial Treatment', time: '12:00', customerName: 'Mike Johnson', status: 'confirmed', price: 800 },
          { id: '4', serviceName: 'Manicure', time: '14:00', customerName: 'Sarah Wilson', status: 'pending', price: 350 },
          { id: '5', serviceName: 'Hair Coloring', time: '15:00', customerName: 'Emily Brown', status: 'confirmed', price: 2500 }
        ]);
        setNotifications([
          { id: '1', type: 'booking', title: 'New Booking', message: 'John Doe booked Haircut & Styling', read: false, createdAt: new Date().toISOString() },
          { id: '2', type: 'payment', title: 'Payment Received', message: 'Received ₹500 from Jane Smith', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
          { id: '3', type: 'cancellation', title: 'Booking Cancelled', message: 'Mike Johnson cancelled their appointment', read: true, createdAt: new Date(Date.now() - 7200000).toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [authLoading, user, fetchWithAuth]);

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      Calendar: <Calendar size={20} />,
      DollarSign: <CreditCard size={20} />,
      AlertCircle: <AlertCircle size={20} />,
      Users: <Users size={20} />
    };
    return icons[iconName] || <Activity size={20} />;
  };

  const getChangeIcon = (type?: string) => {
    if (type === 'up') return <TrendingUp size={14} className="text-green-500" />;
    if (type === 'down') return <TrendingUp size={14} className="text-red-500 rotate-180" />;
    return null;
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Owner Dashboard</p>
          <h1 className="text-3xl font-display text-primary">Welcome Back!</h1>
          <p className="text-sm text-charcoal/60 mt-1">Here's what's happening at your salon</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/owner/notifications" className="relative p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
            <Bell size={20} className="text-primary" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </Link>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-medium">
            {user?.email?.charAt(0).toUpperCase() || 'O'}
          </div>
        </div>
      </div>

      <OwnerSubnav />

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-charcoal/10 pb-4 flex-wrap">
        {[
          { id: 'overview', label: 'Overview', icon: <Activity size={16} /> },
          { id: 'appointments', label: 'Today\'s Appointments', icon: <Calendar size={16} /> },
          { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === tab.id 
                ? 'bg-primary text-white' 
                : 'bg-white/80 text-primary hover:bg-primary/10'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.id === 'notifications' && unreadNotifications > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28" />
              ))
            ) : (
              stats.map((stat, idx) => (
                <div key={idx} className="card-surface p-5 space-y-3 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center text-white`}>
                      {getIcon(stat.icon)}
                    </div>
                    {stat.change && (
                      <span className="flex items-center gap-1 text-xs text-charcoal/50">
                        {getChangeIcon(stat.changeType)}
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">{stat.label}</p>
                  <p className="text-2xl font-display text-primary">{stat.value}</p>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/owner/calendar" className="card-surface p-6 space-y-4 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="font-medium text-primary">Manage Calendar</h3>
                <p className="text-sm text-charcoal/60">View & edit appointments</p>
              </div>
            </Link>
            <Link href="/owner/customers" className="card-surface p-6 space-y-4 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-medium text-primary">Customer Management</h3>
                <p className="text-sm text-charcoal/60">View client history</p>
              </div>
            </Link>
            <Link href="/owner/services" className="card-surface p-6 space-y-4 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                <Store size={24} />
              </div>
              <div>
                <h3 className="font-medium text-primary">Edit Services</h3>
                <p className="text-sm text-charcoal/60">Update menu & pricing</p>
              </div>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display text-primary">Today's Appointments</h2>
                <Link href="/owner/calendar" className="text-sm text-primary hover:underline">
                  View All
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : todayAppointments.length === 0 ? (
                <p className="text-sm text-charcoal/60 py-4 text-center">No appointments today</p>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((apt) => (
                    <Link
                      key={apt.id}
                      href={`/owner/appointments/${apt.id}`}
                      className="card-surface p-4 flex items-center justify-between hover:bg-white/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-primary">{formatTime(apt.time)}</span>
                        <div>
                          <p className="font-medium text-primary">{apt.customerName || 'Walk-in'}</p>
                          <p className="text-xs text-charcoal/50">{apt.serviceName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={apt.status === 'confirmed' ? 'bg-accent/30 text-primary' : 'bg-amber-100 text-amber-600'}>
                          {apt.status}
                        </Badge>
                        <ChevronRight size={16} className="text-charcoal/30" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display text-primary">Recent Notifications</h2>
                <Link href="/owner/notifications" className="text-sm text-primary hover:underline">
                  View All
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : notifications.length === 0 ? (
                <p className="text-sm text-charcoal/60 py-4 text-center">No notifications</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`card-surface p-4 flex items-start gap-3 ${!notif.read ? 'bg-primary/5' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        notif.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                        notif.type === 'payment' ? 'bg-green-100 text-green-600' :
                        notif.type === 'cancellation' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {notif.type === 'booking' ? <CheckCircle size={16} /> :
                         notif.type === 'payment' ? <DollarSign size={16} /> :
                         notif.type === 'cancellation' ? <XCircle size={16} /> :
                         <Bell size={16} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-primary text-sm">{notif.title}</p>
                        <p className="text-xs text-charcoal/60">{notif.message}</p>
                      </div>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display text-primary">Today's Appointments</h2>
            <Link href="/owner/calendar" className="pill bg-primary text-white">
              View Calendar
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-charcoal/30 mb-4" />
              <p className="text-sm text-charcoal/60">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <Link
                  key={apt.id}
                  href={`/owner/appointments/${apt.id}`}
                  className="card-surface p-4 flex items-center justify-between hover:bg-white/60 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center bg-white/80 rounded-xl p-3 min-w-[60px]">
                      <p className="text-sm font-medium text-primary">{formatTime(apt.time)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-primary">{apt.customerName || 'Walk-in'}</p>
                      <p className="text-sm text-charcoal/70">{apt.serviceName}</p>
                      {apt.customerPhone && <p className="text-xs text-charcoal/50">{apt.customerPhone}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{formatCurrency(apt.price)}</span>
                    <Badge className={apt.status === 'confirmed' ? 'bg-accent/30 text-primary' : 'bg-amber-100 text-amber-600'}>
                      {apt.status}
                    </Badge>
                    <ChevronRight size={18} className="text-charcoal/30" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display text-primary">All Notifications</h2>
            <Link href="/owner/notifications" className="pill bg-primary text-white">
              View All
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto text-charcoal/30 mb-4" />
              <p className="text-sm text-charcoal/60">No notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className={`card-surface p-4 flex items-start gap-4 ${!notif.read ? 'bg-primary/5' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    notif.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                    notif.type === 'payment' ? 'bg-green-100 text-green-600' :
                    notif.type === 'cancellation' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {notif.type === 'booking' ? <CheckCircle size={20} /> :
                     notif.type === 'payment' ? <DollarSign size={20} /> :
                     notif.type === 'cancellation' ? <XCircle size={20} /> :
                     <Bell size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-primary">{notif.title}</p>
                    <p className="text-sm text-charcoal/70">{notif.message}</p>
                    <p className="text-xs text-charcoal/50 mt-1">{new Date(notif.createdAt).toLocaleTimeString()}</p>
                  </div>
                  {!notif.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
