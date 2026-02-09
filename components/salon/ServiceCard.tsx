'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Service } from '@/lib/data';

export default function ServiceCard({
  salonId,
  service,
  image,
  rating = 4.9,
  reviewsLabel = '1.2k'
}: {
  salonId: string;
  service: Service;
  image: string;
  rating?: number;
  reviewsLabel?: string;
}) {
  return (
    <div className="rounded-3xl bg-white/92 shadow-soft border border-white/70 overflow-hidden">
      <div className="relative h-28 w-full">
        <Image
          src={image}
          alt={service.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 220px"
        />
      </div>
      <div className="p-4 space-y-2">
        <p className="text-sm font-semibold text-ink leading-snug">{service.name}</p>
        <div className="flex items-center justify-between text-xs text-charcoal/60">
          <span className="inline-flex items-center gap-1">
            <Star size={12} className="text-primary" fill="currentColor" />
            {rating.toFixed(1)} ({reviewsLabel})
          </span>
          <span>{service.duration} min</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-primary">
            {formatCurrency(service.price)}
          </span>
          <Link
            href={`/booking?salon=${salonId}&service=${service.id}`}
            aria-label={`Add ${service.name} to booking`}
            className={cn(
              'h-10 w-10 rounded-full bg-primary text-white shadow-glow flex items-center justify-center',
              'transition-transform hover:scale-[1.03] focus-ring'
            )}
          >
            <Plus size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

