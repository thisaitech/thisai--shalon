'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bell,
  ChevronRight,
  Crown,
  Heart,
  Leaf,
  MapPin,
  Paintbrush2,
  Search,
  Scissors,
  SlidersHorizontal,
  Sparkles,
  Star,
  User,
  type LucideIcon
} from 'lucide-react';
import Carousel from '@/components/ui/carousel';
import CustomerContainer from '@/components/layout/CustomerContainer';
import { salons } from '@/lib/data';

const salon = salons[0];

type Category = {
  id: string;
  label: string;
  icon: LucideIcon;
};

type Offer = {
  title: string;
  discount: string;
  date: string;
  image: string;
};

type Stylist = {
  name: string;
  role: string;
  exp: string;
  rating: number;
  avatar: string;
};

const categories: Category[] = [
  { id: 'hair', label: 'Haircuts', icon: Scissors },
  { id: 'nails', label: 'Nail', icon: Paintbrush2 },
  { id: 'facial', label: 'Facial', icon: Sparkles },
  { id: 'bridal', label: 'Bridal', icon: Crown },
  { id: 'treatments', label: 'Treatments', icon: Leaf },
  { id: 'groom', label: 'Groom', icon: User }
];

const offers: Offer[] = [
  {
    title: 'Haircut',
    discount: '20% Off',
    date: 'Jul 16 - Jul 24',
    image:
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=80'
  },
  {
    title: 'Bridal',
    discount: 'Bundle Save',
    date: 'Trial + main day',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80'
  },
  {
    title: 'First Visit',
    discount: '15% Off',
    date: 'New clients only',
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80'
  }
];

const stylists: Stylist[] = [
  {
    name: 'Bella Grace',
    role: 'Hair Stylist',
    exp: '6 yrs exp',
    rating: 4.9,
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80'
  },
  {
    name: 'Daisy Scarlett',
    role: 'Hair Spa',
    exp: '5 yrs exp',
    rating: 4.8,
    avatar:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&q=80'
  }
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(categories[0].id);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 18) return 'Good Afternoon!';
    return 'Good Evening!';
  }, []);

  return (
    <div className="min-h-screen pb-32">
      <CustomerContainer className="pt-7 space-y-6">
        <header className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-charcoal/60">Hello</p>
            <h1 className="text-2xl font-semibold text-ink">{greeting}</h1>
            <p className="text-xs text-charcoal/60 flex items-center gap-1.5">
              <MapPin size={14} className="text-primary" />
              {salon.location}
            </p>
          </div>
          <button
            type="button"
            className="h-11 w-11 rounded-2xl bg-white/90 shadow-soft border border-white/70 flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-primary" />
          </button>
        </header>

        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-2xl bg-white/90 shadow-soft border border-white/70 px-4 h-12 flex items-center gap-3">
            <Search size={16} className="text-charcoal/40" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search services, makeup, hairstyle..."
              className="w-full bg-transparent outline-none text-sm text-ink placeholder:text-charcoal/40"
              aria-label="Search"
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

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Special Offers</h2>
            <Link href="/salons" className="text-xs font-medium text-primary">
              See all
            </Link>
          </div>
          <Carousel className="rounded-3xl">
            {offers.map((offer) => (
              <div key={offer.title} className="relative h-44 w-full overflow-hidden rounded-3xl">
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 440px"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/55 to-transparent" />
                <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                  <div>
                    <p className="text-xs font-medium opacity-90">{offer.title}</p>
                    <p className="text-3xl font-semibold">{offer.discount}</p>
                    <p className="text-xs text-white/80 mt-1">{offer.date}</p>
                  </div>
                  <Link
                    href="/booking"
                    className="inline-flex items-center gap-2 self-start rounded-full bg-white/20 border border-white/30 px-4 py-2 text-sm"
                  >
                    Get Offer Now <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </Carousel>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Pro Care at Home</h2>
            <button type="button" className="text-xs font-medium text-primary">
              See all
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {stylists.map((stylist) => (
              <div
                key={stylist.name}
                className="rounded-3xl bg-white/92 shadow-soft border border-white/70 p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-11 overflow-hidden rounded-full">
                    <Image
                      src={stylist.avatar}
                      alt={stylist.name}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{stylist.name}</p>
                    <p className="text-xs text-charcoal/60 truncate">{stylist.role}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-charcoal/60">
                  <span>{stylist.exp}</span>
                  <span className="inline-flex items-center gap-1 text-primary font-medium">
                    <Star size={12} fill="currentColor" />
                    {stylist.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Nearby Salons</h2>
            <Link href={`/salon/${salon.id}`} className="text-xs font-medium text-primary">
              See all
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar -mx-5 px-5">
            <Link
              href={`/salon/${salon.id}`}
              className="min-w-[280px] rounded-3xl bg-white/92 shadow-soft border border-white/70 overflow-hidden"
            >
              <div className="relative h-36 w-full">
                <Image
                  src={salon.image}
                  alt={salon.name}
                  fill
                  className="object-cover"
                  sizes="280px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
                <button
                  type="button"
                  className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/95 shadow-soft flex items-center justify-center"
                  aria-label="Save salon"
                >
                  <Heart size={16} className="text-primary" />
                </button>
              </div>
              <div className="p-4 space-y-1">
                <p className="text-sm font-semibold text-ink">{salon.name}</p>
                <p className="text-xs text-charcoal/60 flex items-center gap-1.5">
                  <MapPin size={12} className="text-primary" />
                  {salon.location}
                </p>
              </div>
            </Link>
          </div>
        </section>
      </CustomerContainer>

      <Link
        href="/booking"
        className="md:hidden fixed bottom-24 right-5 z-40 rounded-full bg-primary text-white px-5 py-3 text-sm font-semibold shadow-glow"
      >
        Book Now
      </Link>
    </div>
  );
}
