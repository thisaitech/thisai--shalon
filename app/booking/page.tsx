'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import CustomerContainer from '@/components/layout/CustomerContainer';
import BookingFlow from '@/components/salon/BookingFlow';
import type { Salon, Service } from '@/lib/data';
import { defaultBusinessHours } from '@/lib/utils';
import { buildApiUrl } from '@/lib/api/client';

type PublicSalonPayload = {
  id?: string;
  name?: string;
  location?: string;
  image?: string;
  rating?: number;
  distance?: string;
  tags?: string[];
  businessHours?: Salon['businessHours'];
};

const FALLBACK_SALON_IMAGE =
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80';

function toSalon({
  id,
  salon,
  services
}: {
  id: string;
  salon?: PublicSalonPayload | null;
  services?: Service[];
}): Salon {
  return {
    id,
    name: salon?.name || 'Salon',
    location: salon?.location || 'Location unavailable',
    distance: salon?.distance || '',
    image: salon?.image || FALLBACK_SALON_IMAGE,
    tags: Array.isArray(salon?.tags) ? salon.tags : [],
    rating: Number(salon?.rating || 4.8),
    startingPrice:
      services && services.length > 0
        ? Math.min(...services.map((service) => Number(service.price || 0)))
        : 0,
    businessHours: salon?.businessHours || defaultBusinessHours,
    services: Array.isArray(services) ? services : []
  };
}

export default function BookingPage() {
  const searchParams = useSearchParams();
  const salonParam = searchParams.get('salon') || '';
  const initialServiceId = searchParams.get('service') || undefined;

  const [salon, setSalon] = useState<Salon>(() => toSalon({ id: salonParam || '' }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadSalon = async () => {
      setLoading(true);
      setError(null);
      try {
        let targetSalonId = salonParam;

        if (!targetSalonId) {
          const salonsRes = await fetch(buildApiUrl('/api/public/salons'), { cache: 'no-store' });
          const salonsData = (await salonsRes.json().catch(() => ({}))) as {
            salons?: Array<{ id: string; hasServices?: boolean }>;
          };
          const firstWithServices = salonsData.salons?.find((salon) => salon.hasServices);
          targetSalonId = firstWithServices?.id || salonsData.salons?.[0]?.id || '';
        }

        if (!targetSalonId) {
          throw new Error('No salon available yet. Owner needs to add services.');
        }

        const res = await fetch(
          buildApiUrl(`/api/public/services?salonId=${encodeURIComponent(targetSalonId)}`),
          { cache: 'no-store' }
        );
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          salon?: PublicSalonPayload;
          services?: Service[];
        };

        if (!res.ok) {
          throw new Error(data.error || 'Unable to load salon details');
        }

        if (!cancelled) {
          setSalon(
            toSalon({
              id: targetSalonId,
              salon: data.salon,
              services: Array.isArray(data.services) ? data.services : []
            })
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message || 'Unable to load salon details');
          setSalon(toSalon({ id: salonParam || '' }));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSalon();
    return () => {
      cancelled = true;
    };
  }, [salonParam]);

  const headerLocation = useMemo(() => salon?.location || 'Location unavailable', [salon]);

  return (
    <div className="min-h-screen pb-40">
      <CustomerContainer className="pt-6 space-y-5">
        <header className="flex items-start justify-between">
          <Link
            href="/"
            className="h-10 w-10 rounded-full bg-white/90 shadow-soft border border-white/70 flex items-center justify-center focus-ring"
            aria-label="Back"
          >
            <ArrowLeft size={18} className="text-ink" />
          </Link>
          <div className="text-center">
            <p className="text-xs text-charcoal/60">Appointment</p>
            <h1 className="text-xl font-semibold text-ink">Booking</h1>
            <p className="text-xs text-charcoal/60 inline-flex items-center justify-center gap-1.5">
              <MapPin size={12} className="text-primary" />
              {headerLocation}
            </p>
            {loading ? <p className="text-[10px] text-charcoal/55 mt-1">Loading latest services...</p> : null}
          </div>
          <div className="h-10 w-10" aria-hidden="true" />
        </header>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <BookingFlow salon={salon} initialServiceId={initialServiceId} />
      </CustomerContainer>
    </div>
  );
}
