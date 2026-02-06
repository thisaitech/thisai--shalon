import Image from 'next/image';
import Link from 'next/link';
import { Heart, Sparkles } from 'lucide-react';
import SalonCard from '@/components/salon/SalonCard';
import { salons } from '@/lib/data';

export default function FavoritesPage() {
  const favorites = salons.slice(0, 2);
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
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Saved</p>
        <h1 className="text-4xl font-display text-gradient">Your saved looks</h1>
        <p className="text-sm text-charcoal/70 max-w-2xl">
          Keep your favorite bridal, groom, and glow styles ready for instant rebooking.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {savedLooks.map((look) => (
          <div key={look.title} className="card-spotlight overflow-hidden">
            <div className="relative h-40 w-full">
              <Image
                src={look.image}
                alt={look.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-primary">{look.title}</p>
                <Heart size={16} className="text-accent" />
              </div>
              <p className="text-xs text-charcoal/60">{look.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Studio</p>
          <h2 className="text-2xl font-display text-primary">Saved studio</h2>
        </div>
        <Link href="/booking" className="text-sm text-primary focus-ring rounded-md px-1">
          Book now
        </Link>
      </div>

      {favorites.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {favorites.map((salon) => (
            <SalonCard key={salon.id} {...salon} />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <Sparkles className="mx-auto text-primary mb-2" />
          <p className="font-display text-lg text-primary">No favorites yet.</p>
          <p className="text-sm text-charcoal/60">Save a studio to rebook instantly.</p>
        </div>
      )}
    </div>
  );
}
