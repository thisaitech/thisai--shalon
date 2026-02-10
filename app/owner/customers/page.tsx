'use client';

import { useEffect, useState } from 'react';
import OwnerSubnav from '@/components/layout/OwnerSubnav';
import Skeleton from '@/components/ui/skeleton';
import { useOwnerAuth } from '@/lib/hooks/useOwnerAuth';
import { formatCurrency } from '@/lib/utils';

type Customer = {
  email: string;
  customerId: string | null;
  visits: number;
  lastDate: string;
  lastService: string;
  totalSpent: number;
};

export default function OwnerCustomersPage() {
  const { user, loading: authLoading, fetchWithAuth } = useOwnerAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

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

  const isLoading = authLoading || loading;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Customers</p>
        <h1 className="text-3xl font-display text-primary">Client history</h1>
      </div>

      <OwnerSubnav />

      <div className="glass rounded-2xl p-6">
        <div className="grid grid-cols-5 text-xs uppercase tracking-[0.3em] text-charcoal/50 gap-4">
          <span>Email</span>
          <span>Visits</span>
          <span>Last booking</span>
          <span>Last service</span>
          <span>Total spent</span>
        </div>

        {isLoading ? (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : customers.length === 0 ? (
          <p className="text-sm text-charcoal/60 py-8 text-center">No customers yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {customers.map((customer, idx) => (
              <div key={idx} className="card-surface p-4 grid grid-cols-5 text-sm gap-4 items-center">
                <span className="font-medium text-primary truncate">{customer.email || 'Anonymous'}</span>
                <span>{customer.visits}</span>
                <span>{customer.lastDate}</span>
                <span className="truncate">{customer.lastService}</span>
                <span className="font-medium">{formatCurrency(customer.totalSpent)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
