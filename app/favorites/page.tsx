import Link from 'next/link';
import SalonCard from '@/components/salon/SalonCard';
import { salons } from '@/lib/data';

export default function FavoritesPage() {
  const favorites = salons.slice(0, 2);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Favorites</p>
          <h1 className="text-3xl font-display text-primary">Saved salons</h1>
        </div>
        <Link href="/salons" className="text-sm text-primary focus-ring rounded-md px-1">
          Find more
        </Link>
      </div>

      {favorites.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {favorites.map((salon) => (
            <SalonCard key={salon.id} {...salon} />
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="font-display text-lg text-primary">No favorites yet.</p>
          <p className="text-sm text-charcoal/60">Save a salon to rebook instantly.</p>
        </div>
      )}
    </div>
  );
}
