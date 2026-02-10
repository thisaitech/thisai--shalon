'use client';

import { useEffect, useState } from 'react';
import { Search, Phone, Calendar, DollarSign, User, ChevronDown, ChevronUp } from 'lucide-react';
import OwnerSubnav from '@/components/layout/OwnerSubnav';
import Skeleton from '@/components/ui/skeleton';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useOwnerAuth } from '@/lib/hooks/useOwnerAuth';
import { formatCurrency, formatDate } from '@/lib/utils';

type CustomerAppointment = {
  id: string;
  date: string;
  time: string;
  serviceName: string;
  price: number;
  status: string;
};

type Customer = {
  email: string;
  customerId: string | null;
  customerPhone?: string;
  customerName?: string;
  visits: number;
  lastDate: string;
  lastService: string;
  totalSpent: number;
  averageSpend: number;
  firstDate: string;
  appointments: CustomerAppointment[];
};

export default function OwnerCustomersPage() {
  const { user, loading: authLoading, fetchWithAuth } = useOwnerAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'visits' | 'spent'>('recent');
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    const load = async () => {
      try {
        const res = await fetchWithAuth('/api/customers');
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.customers || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authLoading, user, fetchWithAuth]);

  const filteredCustomers = customers
    .filter((c) =>
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'visits') return b.visits - a.visits;
      if (sortBy === 'spent') return b.totalSpent - a.totalSpent;
      return b.lastDate.localeCompare(a.lastDate);
    });

  const isLoading = authLoading || loading;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Customers</p>
        <h1 className="text-3xl font-display text-primary">Client Management</h1>
        <p className="text-sm text-charcoal/60 mt-1">View and manage your customer base</p>
      </div>

      <OwnerSubnav />

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <Input
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'recent' ? 'primary' : 'ghost'}
            onClick={() => setSortBy('recent')}
            className="text-sm px-3 py-2"
          >
            Recent
          </Button>
          <Button
            variant={sortBy === 'visits' ? 'primary' : 'ghost'}
            onClick={() => setSortBy('visits')}
            className="text-sm px-3 py-2"
          >
            Most Visits
          </Button>
          <Button
            variant={sortBy === 'spent' ? 'primary' : 'ghost'}
            onClick={() => setSortBy('spent')}
            className="text-sm px-3 py-2"
          >
            Highest Spent
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="card-surface p-4 space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">Total Customers</p>
          <p className="text-2xl font-display text-primary">{customers.length}</p>
        </div>
        <div className="card-surface p-4 space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">Total Revenue</p>
          <p className="text-2xl font-display text-primary">{formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}</p>
        </div>
        <div className="card-surface p-4 space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">Avg. Visit Value</p>
          <p className="text-2xl font-display text-primary">
            {customers.length > 0 ? formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0) / Math.max(1, customers.reduce((sum, c) => sum + c.visits, 0))) : formatCurrency(0)}
          </p>
        </div>
        <div className="card-surface p-4 space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">Returning Rate</p>
          <p className="text-2xl font-display text-primary">
            {customers.length > 0 ? Math.round((customers.filter((c) => c.visits > 1).length / customers.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Customer List */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="hidden md:grid grid-cols-12 gap-4 text-xs uppercase tracking-[0.2em] text-charcoal/50 px-4">
          <span className="col-span-4">Customer</span>
          <span className="col-span-2 text-center">Visits</span>
          <span className="col-span-2 text-center">Total Spent</span>
          <span className="col-span-2">Last Visit</span>
          <span className="col-span-2 text-center">Action</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <User size={48} className="mx-auto text-charcoal/30 mb-4" />
            <p className="text-sm text-charcoal/60">No customers found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <div key={customer.email}>
                <div 
                  className="card-surface p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center cursor-pointer hover:bg-white/60 transition-colors"
                  onClick={() => setExpandedCustomer(expandedCustomer === customer.email ? null : customer.email)}
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <User size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">{customer.customerName || customer.email}</p>
                      {customer.customerPhone && (
                        <p className="text-xs text-charcoal/50 flex items-center gap-1">
                          <Phone size={10} /> {customer.customerPhone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      customer.visits > 5 ? 'bg-green-100 text-green-700' : 
                      customer.visits > 1 ? 'bg-white/80 text-primary' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {customer.visits} {customer.visits === 1 ? 'visit' : 'visits'}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <p className="font-medium text-primary">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-xs text-charcoal/50">avg: {formatCurrency(customer.averageSpend)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-primary">{customer.lastDate || 'N/A'}</p>
                    <p className="text-xs text-charcoal/50">{customer.firstDate && `First: ${customer.firstDate}`}</p>
                  </div>
                  <div className="col-span-2 flex justify-center items-center gap-2">
                    {expandedCustomer === customer.email ? (
                      <ChevronUp size={20} className="text-charcoal/40" />
                    ) : (
                      <ChevronDown size={20} className="text-charcoal/40" />
                    )}
                  </div>
                </div>

                {/* Expanded Customer History */}
                {expandedCustomer === customer.email && (
                  <div className="ml-4 md:ml-0 mt-2 p-4 bg-white/60 rounded-xl space-y-3">
                    <h4 className="text-sm font-medium text-primary flex items-center gap-2">
                      <Calendar size={16} />
                      Appointment History ({customer.appointments.length} total)
                    </h4>
                    {customer.appointments.length === 0 ? (
                      <p className="text-xs text-charcoal/60">No appointment history available.</p>
                    ) : (
                      <div className="space-y-2">
                        {customer.appointments.slice(0, 10).map((appointment) => (
                          <div key={appointment.id} className="flex items-center justify-between p-2 bg-white/80 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-charcoal/50">{appointment.date}</span>
                              <span className="text-xs text-charcoal/50">{appointment.time}</span>
                              <span className="text-sm font-medium text-primary">{appointment.serviceName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                appointment.status === 'confirmed' ? 'bg-accent/30 text-primary' :
                                appointment.status === 'canceled' ? 'bg-red-100 text-red-600' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {appointment.status}
                              </span>
                              <span className="text-sm font-medium">{formatCurrency(appointment.price)}</span>
                            </div>
                          </div>
                        ))}
                        {customer.appointments.length > 10 && (
                          <p className="text-xs text-charcoal/50 text-center">
                            And {customer.appointments.length - 10} more appointments...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
