'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Crown,
  Heart,
  Leaf,
  Paintbrush2,
  Scissors,
  Search,
  SlidersHorizontal,
  Sparkles,
  User
} from 'lucide-react';
import CustomerContainer from '@/components/layout/CustomerContainer';
import ServiceCard from '@/components/salon/ServiceCard';
import type { Salon, Service } from '@/lib/data';
import { serviceImages } from '@/lib/service-images';
import { buildApiUrl } from '@/lib/api/client';

type PublicSalon = Pick<Salon, 'id' | 'name' | 'location' | 'image' | 'rating' | 'distance'> & {
  hasServices?: boolean;
};

const categories = [
  { id: 'hair', label: 'Haircuts', icon: Scissors },
  { id: 'nails', label: 'Nail', icon: Paintbrush2 },
  { id: 'facial', label: 'Facial', icon: Sparkles },
  { id: 'bridal', label: 'Bridal', icon: Crown },
  { id: 'treatments', label: 'Treatments', icon: Leaf },
  { id: 'groom', label: 'Groom', icon: User }
];

const FALLBACK_SALON_IMAGE =
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80';

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [search, setSearch] = useState('');
  const [salons, setSalons] = useState<PublicSalon[]>([]);
  const [activeSalonId, setActiveSalonId] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loadingSalons, setLoadingSalons] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSalon = useMemo(
    () => salons.find((salon) => salon.id === activeSalonId) || null,
    [salons, activeSalonId]
  );

  const filteredServices = useMemo(
    () =>
      services.filter((service) =>
        search ? service.name.toLowerCase().includes(search.toLowerCase()) : true
      ),
    [services, search]
  );

  useEffect(() => {
    let cancelled = false;

    const loadSalons = async () => {
      setLoadingSalons(true);
      try {
        const res = await fetch(buildApiUrl('/api/public/salons'), { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Unable to load salons');
        }

        const data = (await res.json()) as { salons?: PublicSalon[] };
        const nextSalons = Array.isArray(data.salons)
          ? data.salons.filter((salon) => Boolean(salon.hasServices))
          : [];
        if (!cancelled) {
          setSalons(nextSalons);
          if (nextSalons.length === 0) {
            setActiveSalonId('');
            setServices([]);
            setError('No owner-added services available yet.');
            return;
          }
          const firstWithServices = nextSalons[0];
          setActiveSalonId((current) =>
            current && nextSalons.some((salon) => salon.id === current)
              ? current
              : firstWithServices.id
          );
        }
      } catch (err) {
        if (!cancelled) {
          setSalons([]);
          setActiveSalonId('');
          setServices([]);
          setError((err as Error).message || 'Unable to load salons');
        }
      } finally {
        if (!cancelled) setLoadingSalons(false);
      }
    };

    loadSalons();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeSalonId) return;
    let cancelled = false;

    const loadServices = async () => {
      setLoadingServices(true);
      setError(null);
      try {
        const res = await fetch(
          buildApiUrl(`/api/public/services?salonId=${encodeURIComponent(activeSalonId)}`),
          { cache: 'no-store' }
        );
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          salon?: PublicSalon;
          services?: Service[];
        };

        if (!res.ok) {
          throw new Error(data.error || 'Unable to load services');
        }

        if (!cancelled) {
          setServices(Array.isArray(data.services) ? data.services : []);
          setError(null);
          if (data.salon) {
            setSalons((prev) =>
              prev.map((salon) =>
                salon.id === activeSalonId
                  ? {
                      ...salon,
                      name: data.salon?.name || salon.name,
                      location: data.salon?.location || salon.location,
                      image: data.salon?.image || salon.image,
                      rating: Number(data.salon?.rating || salon.rating),
                      distance: data.salon?.distance || salon.distance
                    }
                  : salon
              )
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setServices([]);
          setError((err as Error).message || 'Unable to load services');
        }
      } finally {
        if (!cancelled) setLoadingServices(false);
      }
    };

    loadServices();
    return () => {
      cancelled = true;
    };
  }, [activeSalonId]);

  return (
    <div className="min-h-screen pb-32">
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
            <p className="text-xs text-charcoal/60">Menu</p>
            <h1 className="text-xl font-semibold text-ink">Services</h1>
            {activeSalon ? (
              <p className="text-[11px] text-charcoal/60 mt-0.5 truncate max-w-[220px]">
                {activeSalon.name}
              </p>
            ) : null}
          </div>
          <Link
            href="/wishlist"
            className="h-10 w-10 rounded-full bg-white/90 shadow-soft border border-white/70 flex items-center justify-center focus-ring"
            aria-label="Wishlist"
          >
            <Heart size={18} className="text-primary" />
          </Link>
        </header>

        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-2xl bg-white/90 shadow-soft border border-white/70 px-4 h-12 flex items-center gap-3">
            <Search size={16} className="text-charcoal/40" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search services..."
              className="w-full bg-transparent outline-none text-sm text-ink placeholder:text-charcoal/40"
              aria-label="Search services"
            />
          </div>
          <button
            type="button"
            className="h-12 w-12 rounded-2xl bg-white/90 shadow-soft border border-white/70 flex items-center justify-center"
            aria-label="Filters"
          >
            <SlidersHorizontal size={18} className="text-primary" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-5 px-5">
          {categories.map((category) => {
            const Icon = category.icon;
            const selected = category.id === activeCategory;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={
                  selected
                    ? 'shrink-0 inline-flex items-center gap-2 rounded-full bg-primary text-white px-4 py-2 text-xs font-medium shadow-glow'
                    : 'shrink-0 inline-flex items-center gap-2 rounded-full bg-white/90 text-ink px-4 py-2 text-xs font-medium shadow-soft border border-white/70'
                }
              >
                <Icon size={14} />
                {category.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <p className="text-xs text-charcoal/60">Choose salon</p>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-5 px-5">
            {salons.map((salon) => {
              const selected = salon.id === activeSalonId;
              return (
                <button
                  key={salon.id}
                  type="button"
                  onClick={() => setActiveSalonId(salon.id)}
                  className={
                    selected
                      ? 'shrink-0 inline-flex items-center gap-2 rounded-full bg-primary text-white px-4 py-2 text-xs font-medium shadow-glow'
                      : 'shrink-0 inline-flex items-center gap-2 rounded-full bg-white/90 text-ink px-4 py-2 text-xs font-medium shadow-soft border border-white/70'
                  }
                >
                  {salon.name}
                </button>
              );
            })}
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {loadingSalons ? (
          <div className="text-sm text-charcoal/60 py-8 text-center">Loading salons...</div>
        ) : loadingServices ? (
          <div className="text-sm text-charcoal/60 py-8 text-center">Loading services...</div>
        ) : salons.length === 0 ? (
          <div className="text-sm text-charcoal/60 py-8 text-center">
            Owner has not published any salon services yet.
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-sm text-charcoal/60 py-8 text-center">
            No owner-added services available for this salon yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                salonId={activeSalonId}
                salonName={activeSalon?.name || 'Salon'}
                salonLocation={activeSalon?.location || 'Location unavailable'}
                service={service}
                image={serviceImages[service.id] ?? activeSalon?.image ?? FALLBACK_SALON_IMAGE}
                rating={activeSalon?.rating ?? 4.8}
                reviewsLabel="1.2k"
              />
            ))}
          </div>
        )}
      </CustomerContainer>
    </div>
  );
}
