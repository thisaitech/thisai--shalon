'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Plus, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Service } from '@/lib/data';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ServiceCard({
  salonId,
  salonName,
  salonLocation,
  service,
  image,
  rating = 4.9,
  reviewsLabel = '1.2k'
}: {
  salonId: string;
  salonName?: string;
  salonLocation?: string;
  service: Service;
  image: string;
  rating?: number;
  reviewsLabel?: string;
}) {
  const { user, loading: authLoading, fetchWithAuth } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToWishlist = async () => {
    if (saving || authLoading) return;
    if (!user) {
      const redirect = `${window.location.pathname}${window.location.search}`;
      window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`;
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetchWithAuth('/api/wishlist', {
        method: 'POST',
        body: JSON.stringify({
          salonId,
          salonName: salonName || 'Salon',
          salonLocation: salonLocation || 'Location unavailable',
          salonRating: rating,
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: service.price,
          serviceDuration: service.duration
        })
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        alreadySaved?: boolean;
      };

      if (!res.ok) {
        throw new Error(data.error || 'Unable to save service');
      }

      setSaved(true);
    } catch (err) {
      setError((err as Error).message || 'Unable to save service');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white/92 shadow-soft border border-white/70 overflow-hidden">
      <div className="relative h-28 w-full">
        <Image
          src={image}
          alt={service.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 220px"
        />
      </div>
      <div className="p-4 space-y-2">
        <p className="text-sm font-semibold text-ink leading-snug">{service.name}</p>
        <div className="flex items-center justify-between text-xs text-charcoal/60">
          <span className="inline-flex items-center gap-1">
            <Star size={12} className="text-primary" fill="currentColor" />
            {rating.toFixed(1)} ({reviewsLabel})
          </span>
          <span>{service.duration} min</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-primary">
            {formatCurrency(service.price)}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addToWishlist}
              disabled={saving || saved}
              aria-label={saved ? 'Saved to wishlist' : `Save ${service.name} to wishlist`}
              className={cn(
                'h-10 w-10 rounded-full border shadow-soft flex items-center justify-center transition-transform focus-ring',
                saved
                  ? 'bg-primary/10 border-primary/20 text-primary'
                  : 'bg-white border-white/70 text-primary hover:scale-[1.03]',
                saving && 'opacity-70 cursor-not-allowed'
              )}
            >
              <Heart size={17} className={saved ? 'fill-current' : ''} />
            </button>
            <Link
              href={`/booking?salon=${salonId}&service=${service.id}`}
              aria-label={`Add ${service.name} to booking`}
              className={cn(
                'h-10 w-10 rounded-full bg-primary text-white shadow-glow flex items-center justify-center',
                'transition-transform hover:scale-[1.03] focus-ring'
              )}
            >
              <Plus size={18} />
            </Link>
          </div>
        </div>
        {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
