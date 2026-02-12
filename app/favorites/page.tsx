'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Heart,
  MapPin,
  Star,
  Trash2
} from 'lucide-react';
import CustomerContainer from '@/components/layout/CustomerContainer';
import Skeleton from '@/components/ui/skeleton';
import Button from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';

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

export default function FavoritesPage() {
  const { user, loading: authLoading, fetchWithAuth } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    const loadWishlist = async () => {
      try {
        const res = await fetchWithAuth('/api/wishlist');
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          wishlist?: WishlistItem[];
        };

        if (!res.ok) {
          throw new Error(data.error || 'Unable to load saved items');
        }

        setWishlist(Array.isArray(data.wishlist) ? data.wishlist : []);
        setError(null);
      } catch (err) {
        setError((err as Error).message || 'Unable to load saved items');
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [authLoading, fetchWithAuth, user]);

  const removeFromSaved = async (itemId: string) => {
    const previous = wishlist;
    setRemovingId(itemId);
    setWishlist((prev) => prev.filter((item) => item.id !== itemId));

    try {
      const res = await fetchWithAuth(
        `/api/wishlist?id=${encodeURIComponent(itemId)}`,
        { method: 'DELETE' }
      );
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Unable to remove saved item');
      }
    } catch (err) {
      setWishlist(previous);
      setError((err as Error).message || 'Unable to remove saved item');
    } finally {
      setRemovingId(null);
    }
  };

  const moveToBooking = (item: WishlistItem) => {
    window.location.href = `/booking?salon=${encodeURIComponent(item.salonId)}&service=${encodeURIComponent(item.serviceId)}`;
  };

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <Heart size={56} className="mx-auto text-charcoal/30 mb-4" />
          <h1 className="text-2xl font-display text-primary mb-2">Saved</h1>
          <p className="text-charcoal/60 mb-6">Login to view your wishlist.</p>
          <Link href="/login" className="pill bg-primary text-white">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <CustomerContainer className="pt-7 space-y-6">
        <header className="space-y-1">
          <p className="text-xs text-charcoal/60">Saved</p>
          <h1 className="text-2xl font-semibold text-ink">Your wishlist services</h1>
          <p className="text-sm text-charcoal/70">
            Save services and quickly book them later.
          </p>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : wishlist.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Heart size={56} className="mx-auto text-charcoal/30 mb-4" />
            <h2 className="text-xl font-display text-primary mb-2">No saved services yet</h2>
            <p className="text-charcoal/60 mb-6">
              Browse salons and tap the heart on any service.
            </p>
            <Link href="/salons" className="pill bg-primary text-white">
              Explore Services
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {wishlist.map((item) => (
              <div key={item.id} className="rounded-3xl bg-white/92 shadow-soft border border-white/70 p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-primary">{item.salonName}</p>
                    <p className="text-xs text-charcoal/60 inline-flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-primary" />
                      {item.salonLocation}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-lg bg-amber-100 text-amber-700 inline-flex items-center gap-1">
                    <Star size={12} />
                    {Number(item.salonRating || 0).toFixed(1)}
                  </span>
                </div>

                <div className="card-surface p-4">
                  <p className="font-medium text-primary">{item.serviceName}</p>
                  <div className="mt-2 flex items-center justify-between text-sm text-charcoal/65">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={14} />
                      {item.serviceDuration} min
                    </span>
                    <span className="font-medium text-primary">
                      {formatCurrency(item.servicePrice)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => moveToBooking(item)} className="flex-1 flex items-center gap-2">
                    <Calendar size={16} /> Book now
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => removeFromSaved(item.id)}
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

        <div className="pt-2">
          <Link href="/wishlist" className="text-sm text-primary hover:underline">
            Open wishlist + appointments dashboard
          </Link>
        </div>
      </CustomerContainer>
    </div>
  );
}
