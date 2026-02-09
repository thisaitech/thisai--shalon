import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin } from 'lucide-react';
import CustomerContainer from '@/components/layout/CustomerContainer';
import { salons } from '@/lib/data';

const salon = salons[0];

const savedLooks = [
  {
    title: 'Bridal Pearl Glow',
    subtitle: 'HD glam · soft shimmer',
    image:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Groom Classic',
    subtitle: 'Beard sculpt · hair finish',
    image:
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Sangeet Waves',
    subtitle: 'Long-wear curls · glow',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Radiance Facial',
    subtitle: 'Brightening · hydration',
    image:
      'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=1200&q=80'
  }
];

export default function FavoritesPage() {
  return (
    <div className="min-h-screen pb-32">
      <CustomerContainer className="pt-7 space-y-6">
        <header className="space-y-1">
          <p className="text-xs text-charcoal/60">Saved</p>
          <h1 className="text-2xl font-semibold text-ink">Your saved looks</h1>
          <p className="text-sm text-charcoal/70">
            Keep your favorite styles ready for instant rebooking.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-4">
          {savedLooks.map((look) => (
            <div
              key={look.title}
              className="rounded-3xl bg-white/92 shadow-soft border border-white/70 overflow-hidden"
            >
              <div className="relative h-32 w-full">
                <Image
                  src={look.image}
                  alt={look.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 220px"
                />
              </div>
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink leading-snug">{look.title}</p>
                  <Heart size={16} className="text-primary" />
                </div>
                <p className="text-xs text-charcoal/60">{look.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Saved studio</h2>
            <Link href="/booking" className="text-xs font-medium text-primary">
              Book now
            </Link>
          </div>
          <Link
            href={`/salon/${salon.id}`}
            className="rounded-3xl bg-white/92 shadow-soft border border-white/70 overflow-hidden flex"
          >
            <div className="relative h-24 w-24 shrink-0">
              <Image
                src={salon.image}
                alt={salon.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="p-4 flex-1">
              <p className="text-sm font-semibold text-ink">{salon.name}</p>
              <p className="text-xs text-charcoal/60 mt-1 inline-flex items-center gap-1.5">
                <MapPin size={12} className="text-primary" />
                {salon.location}
              </p>
              <p className="text-xs text-charcoal/60 mt-2">Tap to view services and offers.</p>
            </div>
          </Link>
        </section>
      </CustomerContainer>
    </div>
  );
}
