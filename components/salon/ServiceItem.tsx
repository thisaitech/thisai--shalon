'use client';

import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

export default function ServiceItem({
  name,
  description,
  price,
  duration,
  image,
  selected,
  onSelect
}: {
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative w-full text-left rounded-[28px] border border-white/70 bg-white/92 p-5 transition-transform hover:-translate-y-0.5 hover:shadow-glow focus-ring min-h-[168px] flex flex-col justify-between overflow-hidden',
        selected ? 'border-primary/40 shadow-glow' : 'shadow-soft',
        'active:translate-y-0 active:scale-[0.99]'
      )}
    >
      {image ? (
        <div className="absolute inset-0">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover opacity-20 scale-110 blur-[1px]"
            sizes="(max-width: 768px) 50vw, 220px"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/92 to-white/85" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-lilac/6 to-sky/10 opacity-70" />
      )}

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-ink leading-snug line-clamp-2 min-h-[40px]">
            {name}
          </p>
          <p className="mt-1 text-xs text-charcoal/70 leading-snug line-clamp-2">
            {description}
          </p>
        </div>
        <span className="shrink-0 text-[11px] text-primary/90 bg-white/90 border border-white/70 shadow-soft rounded-full px-2.5 py-1">
          {duration} min
        </span>
      </div>

      <div className="relative z-10 flex items-end justify-between gap-4 pt-4">
        <span className="text-base font-semibold text-primary tracking-tight">
          {formatCurrency(price)}
        </span>
        <span className="text-[11px] text-charcoal/65">Instant confirmation</span>
      </div>

      {selected ? (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary text-white px-2.5 py-1 text-[10px] font-medium shadow-glow">
          <CheckCircle2 size={12} />
          Selected
        </span>
      ) : null}
    </button>
  );
}
