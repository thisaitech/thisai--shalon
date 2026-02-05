'use client';

import Link from 'next/link';
import Image from 'next/image';
import Badge from '@/components/ui/badge';
import { Heart, MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SalonCard({
  id,
  name,
  location,
  distance,
  image,
  tags,
  rating,
  startingPrice,
  className
}: {
  id: string;
  name: string;
  location: string;
  distance: string;
  image: string;
  tags: string[];
  rating: number;
  startingPrice: number;
  className?: string;
}) {
  return (
    <Link
      href={`/salon/${id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl bg-white/80 shadow-soft border border-white/40 transition-all hover:-translate-y-1 hover:shadow-lg focus-ring',
        className
      )}
    >
      <div className="relative h-52 w-full">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <Badge className="bg-white/90 flex items-center gap-1">
            <MapPin size={12} /> {distance}
          </Badge>
          <Badge className="bg-white/90 flex items-center gap-1">
            <Star size={12} /> {rating.toFixed(1)}
          </Badge>
        </div>
        <button
          className="absolute right-4 top-4 h-9 w-9 rounded-full bg-white/90 flex items-center justify-center shadow-soft"
          aria-label="Save to favorites"
        >
          <Heart size={16} className="text-primary" />
        </button>
      </div>
      <div className="flex-1 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display text-primary">{name}</h3>
          <span className="text-sm text-charcoal/70">From ${startingPrice}</span>
        </div>
        <p className="text-sm text-charcoal/70">{location}</p>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        <p className="text-xs text-charcoal/60">Instant booking · 48+ slots today</p>
      </div>
    </Link>
  );
}
