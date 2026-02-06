'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  CalendarCheck,
  Crown,
  Heart,
  MessageCircle,
  Scissors,
  Sparkles,
  SprayCan,
  Star,
  User
} from 'lucide-react';
import Carousel from '@/components/ui/carousel';
import PromoModal from '@/components/ui/promo-modal';
import { salons } from '@/lib/data';

const salon = salons[0];

const categoryTiles = [
  {
    label: 'Indian Bridal',
    description: 'HD makeup · draping · jewelry',
    icon: Crown
  },
  {
    label: 'Groom Makeover',
    description: 'Skin prep · beard sculpt',
    icon: User
  },
  {
    label: 'Makeover & Party',
    description: 'Soft glam · statement eyes',
    icon: Sparkles
  },
  {
    label: 'Hairstyle & Blowout',
    description: 'Volume sets · sleek finish',
    icon: Scissors
  },
  {
    label: 'Bridal Reception',
    description: 'Soft glam · waves · lashes',
    icon: Heart
  },
  {
    label: 'Hair Spa & Scalp',
    description: 'Steam therapy · oils',
    icon: SprayCan
  },
  {
    label: 'Skin & Glow',
    description: 'Radiance facials · peels',
    icon: Star
  }
];

const slides = [
  {
    title: 'Bridal Season Edit',
    subtitle: 'Signature drape · HD finish · touch-up kit',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80'
  },
  {
    title: 'Grooming House',
    subtitle: 'Shape · cleanse · confidence',
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

const quickActions = [
  { label: 'Book', href: '/booking', icon: CalendarCheck },
  { label: 'Saved', href: '/favorites', icon: Heart },
  { label: 'Message', href: '/messages', icon: MessageCircle },
  { label: 'Profile', href: '/profile', icon: User }
];

const spotlightServices = [
  {
    id: 'bridal',
    title: 'Bridal Couture',
    price: '$260',
    note: 'HD glam · drape · jewelry',
    image:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'groom',
    title: 'Groom Studio',
    price: '$120',
    note: 'Skin prep · beard sculpt',
    image:
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'spa',
    title: 'Hair Spa Ritual',
    price: '$70',
    note: 'Steam · oils · scalp reset',
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80'
  }
];

export default function HomePage() {
  return (
    <div className="app-shell">
      <PromoModal />

      <section className="max-w-6xl mx-auto px-6 pt-8 pb-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Good morning</p>
            <h1 className="text-3xl md:text-4xl font-display text-gradient">
              Ready for your glow?
            </h1>
            <p className="text-sm text-charcoal/80 mt-2">
              Bridal, groom, and unisex rituals curated for every moment.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/messages" className="icon-orb">
              <MessageCircle size={18} />
            </Link>
            <Link href="/profile" className="icon-orb">
              <User size={18} />
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="space-y-4 animate-fade-up">
            <div className="card-spotlight p-6 relative overflow-hidden">
              <div className="absolute -right-16 -top-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-accent/30 blur-3xl" />
              <div className="relative z-10 space-y-3">
                <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Lumiére Studio</p>
                <h2 className="text-2xl font-display text-primary">
                  {salon.name}
                </h2>
                <p className="text-sm text-charcoal/80">
                  Single studio · Bridal · Groom · Unisex · {salon.location}
                </p>
              </div>
              <div className="relative mt-6 h-48 w-full overflow-hidden rounded-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80"
                  alt="Studio"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/booking?salon=${salon.id}`}
                  className="inline-flex items-center justify-center min-h-[44px] rounded-2xl bg-gradient-to-r from-primary via-lilac to-accent text-white px-5 py-2 text-sm font-medium shadow-glow"
                >
                  Book appointment
                </Link>
                <Link
                  href={`/salon/${salon.id}`}
                  className="inline-flex items-center justify-center min-h-[44px] rounded-2xl border border-primary/20 px-5 py-2 text-sm font-medium text-primary"
                >
                  View studio
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickActions.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="card-spotlight p-4 flex flex-col items-start gap-3 transition-all hover:-translate-y-1"
                >
                  <span className="icon-orb">
                    <Icon size={18} />
                  </span>
                  <span className="text-sm font-medium text-primary">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4 animate-fade-up">
            <Carousel className="rounded-3xl">
              {slides.map((slide) => (
                <div key={slide.title} className="relative h-64 w-full overflow-hidden rounded-3xl">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/70">Special</p>
                    <p className="text-xl font-display">{slide.title}</p>
                    <p className="text-sm text-white/80">{slide.subtitle}</p>
                  </div>
                </div>
              ))}
            </Carousel>

            <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
              {spotlightServices.map((service) => (
                <div key={service.id} className="card-spotlight overflow-hidden">
                  <div className="relative h-32 w-full">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 30vw"
                    />
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="text-sm font-medium text-primary">{service.title}</p>
                    <p className="text-xs text-charcoal/60">{service.note}</p>
                    <p className="text-sm font-medium text-primary">{service.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-8 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display text-primary">Styles & services</h2>
          <span className="pill bg-white/90">Indian bridal to daily glam</span>
        </div>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
          {categoryTiles.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.label} className="card-spotlight p-5 space-y-3">
                <div className="icon-orb">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-medium text-primary">{service.label}</p>
                  <p className="text-sm text-charcoal/80">{service.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-12 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display text-primary">Signature services</h3>
          <span className="pill bg-white/90">Instant booking</span>
        </div>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {salon.services.slice(0, 6).map((service) => (
            <div key={service.id} className="card-surface p-5 flex items-center justify-between">
              <div>
                <p className="font-medium text-primary">{service.name}</p>
                <p className="text-sm text-charcoal/80">{service.description}</p>
              </div>
              <div className="text-right text-sm text-charcoal/80">
                <p className="font-medium text-primary">${service.price}</p>
                <p>{service.duration} min</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="glass-panel rounded-3xl p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Appointments</p>
            <h3 className="text-2xl font-display text-primary">Reserve a premium slot today</h3>
            <p className="text-sm text-charcoal/80">
              Same-day bookings for bridal trials, groom makeovers, hair spa, and glow facials.
            </p>
          </div>
          <Link
            href={`/booking?salon=${salon.id}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary via-lilac to-accent text-white px-6 py-3 text-sm font-medium shadow-glow"
          >
            Reserve now
          </Link>
        </div>
      </section>
    </div>
  );
}
