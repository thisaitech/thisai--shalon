'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Crown,
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
import { salons } from '@/lib/data';
import { serviceImages } from '@/lib/service-images';

const salon = salons[0];

const categories = [
  { id: 'hair', label: 'Haircuts', icon: Scissors },
  { id: 'nails', label: 'Nail', icon: Paintbrush2 },
  { id: 'facial', label: 'Facial', icon: Sparkles },
  { id: 'bridal', label: 'Bridal', icon: Crown },
  { id: 'treatments', label: 'Treatments', icon: Leaf },
  { id: 'groom', label: 'Groom', icon: User }
];

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [search, setSearch] = useState('');

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
          </div>
          <div className="h-10 w-10" aria-hidden="true" />
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

        <div className="grid grid-cols-2 gap-4">
          {salon.services
            .filter((service) =>
              search
                ? service.name.toLowerCase().includes(search.toLowerCase())
                : true
            )
            .map((service) => (
              <ServiceCard
                key={service.id}
                salonId={salon.id}
                service={service}
                image={serviceImages[service.id] ?? salon.image}
                rating={salon.rating}
                reviewsLabel="1.2k"
              />
            ))}
        </div>
      </CustomerContainer>
    </div>
  );
}
