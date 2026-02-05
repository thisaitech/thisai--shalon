'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  CalendarDays,
  Crown,
  Gem,
  Hand,
  Leaf,
  Scissors,
  Sparkles,
  Wand2
} from 'lucide-react';
import Carousel from '@/components/ui/carousel';
import PromoModal from '@/components/ui/promo-modal';
import { salons } from '@/lib/data';

const salon = salons[0];

const services = [
  {
    label: 'Indian Bridal Glam',
    description: 'HD makeup, draping, jewelry set',
    icon: Crown
  },
  {
    label: 'Unisex Precision Cuts',
    description: 'Texture-first cuts + styling',
    icon: Scissors
  },
  {
    label: 'Mehendi Artistry',
    description: 'Bridal + party designs',
    icon: Hand
  },
  {
    label: 'Skin & Glow Rituals',
    description: 'Brightening facials',
    icon: Sparkles
  },
  {
    label: 'Nail Art Studio',
    description: 'Custom gel artistry',
    icon: Gem
  },
  {
    label: 'Ayurvedic Hair Spa',
    description: 'Scalp therapy + oils',
    icon: Leaf
  }
];

const slides = [
  {
    title: 'Bridal Season Edit',
    subtitle: 'Saree drape · HD finish · touch-up kit',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80'
  },
  {
    title: 'Unisex Style Lab',
    subtitle: 'Precision cuts + texture resets',
    image:
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=80'
  },
  {
    title: 'Glow Rituals',
    subtitle: 'Skin, nails, and hair ceremonies',
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80'
  }
];

export default function HomePage() {
  return (
    <div className="bg-hero-glow">
      <PromoModal />

      <section className="max-w-6xl mx-auto px-6 pt-10 pb-12 space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-primary/70">
              Single studio · Unisex · Bridal
            </p>
            <h1 className="text-4xl md:text-5xl font-display text-primary text-balance">
              {salon.name}
            </h1>
            <p className="text-sm text-charcoal/70 max-w-xl">
              Indian bridal artistry and modern unisex styling in one elevated space. Book your
              appointment, select a service style, and arrive ready for your glow ritual.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="pill bg-white/90">{salon.location}</span>
              <span className="pill bg-white/90">Open 9:00 — 20:00</span>
              <span className="pill bg-accent/30 text-primary">4.9 rated</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/booking?salon=${salon.id}`}
                className="inline-flex items-center justify-center min-h-[48px] rounded-2xl bg-primary text-white px-6 py-3 text-sm font-medium focus-ring"
              >
                Book appointment
              </Link>
              <Link
                href={`/salon/${salon.id}`}
                className="inline-flex items-center justify-center min-h-[48px] rounded-2xl border border-primary/20 px-6 py-3 text-sm font-medium text-primary"
              >
                View studio
              </Link>
            </div>
          </div>

          <div className="card-surface p-6 space-y-4 animate-fade-up">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-accent/30 flex items-center justify-center">
                <CalendarDays className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-charcoal/50">Today</p>
                <p className="font-display text-lg text-primary">Thursday · 09:41</p>
              </div>
            </div>
            <Carousel className="rounded-2xl">
              {slides.map((slide) => (
                <div key={slide.title} className="relative h-64 w-full overflow-hidden rounded-2xl">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 45vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <p className="text-sm uppercase tracking-[0.3em] text-white/70">Trending</p>
                    <p className="text-xl font-display">{slide.title}</p>
                    <p className="text-sm text-white/80">{slide.subtitle}</p>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-12 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display text-primary">Service styles</h2>
          <span className="pill bg-white/90">Unisex & bridal</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.label} className="card-surface p-5 space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Icon className="text-primary" size={22} />
                </div>
                <div>
                  <p className="font-medium text-primary">{service.label}</p>
                  <p className="text-sm text-charcoal/70">{service.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="glass rounded-2xl p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Appointments</p>
            <h3 className="text-2xl font-display text-primary">Reserve a premium slot today</h3>
            <p className="text-sm text-charcoal/70">
              Same-day bookings available for hair, makeup, grooming, and nail art.
            </p>
          </div>
          <Link
            href={`/booking?salon=${salon.id}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary text-white px-6 py-3 text-sm font-medium"
          >
            Reserve now <Wand2 size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
