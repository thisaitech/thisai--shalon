'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, Users, Settings, BarChart3, Store, Clock, 
  MessageSquare, CreditCard, Bell, ChevronRight, TrendingUp 
} from 'lucide-react';
import { useOwnerAuth } from '@/lib/hooks/useOwnerAuth';
import { buildApiUrl } from '@/lib/api/client';
import { formatCurrency, toDateKey } from '@/lib/utils';

type QuickStat = {
  label: string;
  value: string;
  icon: string;
  color: string;
};

export default function OwnerPortalPage() {
  const { user, loading: authLoading } = useOwnerAuth();
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    const loadStats = async () => {
      try {
        const todayKey = toDateKey(new Date());
        const token = await user.getIdToken();
        const res = await fetch(buildApiUrl(`/api/owner/stats?date=${todayKey}`), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const s = data.stats || {};
          setStats([
            { label: 'Today\'s Appointments', value: String(s.todayAppointments || 0), icon: 'Calendar', color: 'bg-blue-500' },
            { label: 'Owner Earnings', value: formatCurrency(s.ownerEarningsToday || s.ownerEarnings || 0), icon: 'DollarSign', color: 'bg-green-500' },
            { label: 'Pending Appointments', value: String(s.pendingAppointments || 0), icon: 'Calendar', color: 'bg-amber-500' },
            { label: 'Monthly Revenue', value: formatCurrency(s.monthlyRevenue || 0), icon: 'TrendingUp', color: 'bg-orange-500' }
          ]);
        }
      } catch {
        setStats([
          { label: 'Today\'s Appointments', value: '0', icon: 'Calendar', color: 'bg-blue-500' },
          { label: 'Owner Earnings', value: formatCurrency(0), icon: 'DollarSign', color: 'bg-green-500' },
          { label: 'Pending Appointments', value: '0', icon: 'Calendar', color: 'bg-amber-500' },
          { label: 'Monthly Revenue', value: formatCurrency(0), icon: 'TrendingUp', color: 'bg-orange-500' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [authLoading, user]);

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      Calendar: <Calendar size={24} />,
      DollarSign: <CreditCard size={24} />,
      Users: <Users size={24} />,
      TrendingUp: <TrendingUp size={24} />
    };
    return icons[iconName] || <Calendar size={24} />;
  };

  const menuItems = [
    { href: '/owner', icon: <BarChart3 size={20} />, label: 'Dashboard', desc: 'Overview & quick stats' },
    { href: '/owner/calendar', icon: <Calendar size={20} />, label: 'Calendar', desc: 'Manage appointments' },
    { href: '/owner/customers', icon: <Users size={20} />, label: 'Customers', desc: 'Client management' },
    { href: '/owner/services', icon: <Store size={20} />, label: 'Services', desc: 'Service menu & pricing' },
    { href: '/owner/stats', icon: <TrendingUp size={20} />, label: 'Analytics', desc: 'Business insights' },
    { href: '/owner/settings', icon: <Settings size={20} />, label: 'Settings', desc: 'Salon configuration' }
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display text-primary mb-4">Please Login</h1>
          <Link href="/owner/login" className="pill bg-primary text-white">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/10">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display text-primary">Owner Portal</h1>
              <p className="text-sm text-charcoal/60">Welcome back! Manage your salon</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors relative">
                <Bell size={20} className="text-primary" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-medium">
                {user.email?.charAt(0).toUpperCase() || 'O'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <section className="mb-8">
          <h2 className="text-lg font-display text-primary mb-4">Quick Overview</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card-surface p-5 space-y-3">
                  <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))
            ) : (
              stats.map((stat, idx) => (
                <div key={idx} className="card-surface p-5 space-y-3 hover:shadow-lg transition-shadow">
                  <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center text-white`}>
                    {getIcon(stat.icon)}
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">{stat.label}</p>
                  <p className="text-2xl font-display text-primary">{stat.value}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-lg font-display text-primary mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/owner/calendar" className="card-surface p-6 space-y-4 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="font-medium text-primary">View Calendar</h3>
                <p className="text-sm text-charcoal/60">Check today's appointments</p>
              </div>
              <ChevronRight size={20} className="text-charcoal/30 group-hover:text-primary transition-colors" />
            </Link>
            <Link href="/owner/customers" className="card-surface p-6 space-y-4 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-medium text-primary">Manage Customers</h3>
                <p className="text-sm text-charcoal/60">View client history</p>
              </div>
              <ChevronRight size={20} className="text-charcoal/30 group-hover:text-primary transition-colors" />
            </Link>
            <Link href="/owner/services" className="card-surface p-6 space-y-4 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                <Store size={24} />
              </div>
              <div>
                <h3 className="font-medium text-primary">Edit Services</h3>
                <p className="text-sm text-charcoal/60">Update menu & pricing</p>
              </div>
              <ChevronRight size={20} className="text-charcoal/30 group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </section>

        {/* Main Navigation */}
        <section>
          <h2 className="text-lg font-display text-primary mb-4">All Sections</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className="card-surface p-4 flex items-center gap-4 hover:bg-white/60 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-primary">{item.label}</h3>
                  <p className="text-xs text-charcoal/50">{item.desc}</p>
                </div>
                <ChevronRight size={18} className="text-charcoal/30 group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </section>

        {/* Help Section */}
        <section className="mt-8">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className="font-medium text-primary">Need Help?</h3>
                <p className="text-sm text-charcoal/60 mt-1">
                  Contact our support team for assistance with your salon management.
                </p>
                <button className="pill bg-primary/10 text-primary mt-3 hover:bg-primary/20 transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
