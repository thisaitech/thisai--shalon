'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  BadgeDollarSign,
  Clock,
  Heart,
  MapPin,
  Share2,
  Star
} from 'lucide-react';
import Carousel from '@/components/ui/carousel';
import CustomerContainer from '@/components/layout/CustomerContainer';
import SalonDetailTabs from '@/components/salon/SalonDetailTabs';
import type { Salon, Service } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { defaultBusinessHours } from '@/lib/utils';
import { buildApiUrl } from '@/lib/api/client';

type PublicSalon = {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
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
  salon?: Partial<PublicSalon> | null;
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

export default function SalonDetailPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salon, setSalon] = useState<Salon>(() => toSalon({ id: params.id }));
  const [services, setServices] = useState<Service[]>(salon.services);

  useEffect(() => {
    let cancelled = false;

    const loadSalon = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          buildApiUrl(`/api/public/services?salonId=${encodeURIComponent(params.id)}`),
          { cache: 'no-store' }
        );
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          salon?: Partial<PublicSalon>;
          services?: Service[];
        };

        if (!res.ok) {
          throw new Error(data.error || 'Salon not found');
        }

        if (!cancelled) {
          const nextSalon = toSalon({
            id: params.id,
            salon: data.salon,
            services: Array.isArray(data.services) ? data.services : []
          });
          setSalon(nextSalon);
          setServices(nextSalon.services);
        }
      } catch (err) {
        if (!cancelled) {
          const message = (err as Error).message || 'Unable to load salon';
          setError(message);
          setSalon(toSalon({ id: params.id }));
          setServices([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSalon();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const priceRange = useMemo(() => {
    const prices = services.map((service) => Number(service.price || 0)).filter((price) => price > 0);
    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return formatCurrency(min);
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  }, [services]);

  const gallery = [
    salon.image,
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80'
  ];

  return (
    <div className="min-h-screen pb-36">
      <CustomerContainer className="pt-6 space-y-5">
        <div className="relative h-80 w-full overflow-hidden rounded-3xl bg-white/90 shadow-soft border border-white/70">
          <Carousel className="h-full">
            {gallery.map((image) => (
              <div key={image} className="relative h-80 w-full">
                <Image
                  src={image}
                  alt={salon.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 440px"
                />
              </div>
            ))}
          </Carousel>

          <div className="absolute inset-x-4 top-4 flex items-center justify-between">
            <Link
              href="/"
              className="h-10 w-10 rounded-full bg-white/90 shadow-soft border border-white/70 flex items-center justify-center focus-ring"
              aria-label="Back"
            >
              <ArrowLeft size={18} className="text-ink" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-10 w-10 rounded-full bg-white/90 shadow-soft border border-white/70 flex items-center justify-center"
                aria-label="Share"
              >
                <Share2 size={18} className="text-ink" />
              </button>
              <button
                type="button"
                className="h-10 w-10 rounded-full bg-white/90 shadow-soft border border-white/70 flex items-center justify-center"
                aria-label="Save"
              >
                <Heart size={18} className="text-primary" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-ink">{salon.name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-charcoal/60">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="text-primary" />
              {salon.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star size={14} className="text-primary" fill="currentColor" />
              {salon.rating.toFixed(1)} (1.2k)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} className="text-primary" />
              10am - 10pm
            </span>
            {priceRange ? (
              <span className="inline-flex items-center gap-1.5">
                <BadgeDollarSign size={14} className="text-primary" />
                {priceRange}
              </span>
            ) : null}
          </div>
          {loading ? <p className="text-xs text-charcoal/55">Loading latest services...</p> : null}
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>

        <SalonDetailTabs
          salonId={salon.id}
          salonName={salon.name}
          salonLocation={salon.location}
          salonImage={salon.image}
          salonRating={salon.rating}
          services={services}
        />
      </CustomerContainer>

      <div className="fixed bottom-20 left-0 right-0 z-30 md:hidden">
        <CustomerContainer>
          <Link
            href={`/booking?salon=${salon.id}`}
            className="w-full inline-flex items-center justify-center rounded-2xl bg-primary text-white px-6 py-4 text-sm font-semibold shadow-glow"
          >
            Book Appointment
          </Link>
        </CustomerContainer>
      </div>
    </div>
  );
}
