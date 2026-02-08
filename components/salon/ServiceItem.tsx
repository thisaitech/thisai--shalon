'use client';

import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function ServiceItem({
  name,
  description,
  price,
  duration,
  selected,
  onSelect
}: {
  name: string;
  description: string;
  price: number;
  duration: number;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative w-full text-left rounded-[26px] border border-white/70 bg-white/92 p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow focus-ring min-h-[160px] flex flex-col justify-between overflow-hidden',
        selected &&
          'border-transparent bg-gradient-to-br from-primary/10 via-lilac/10 to-accent/10 shadow-glow'
      )}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
      </div>
      <div className="relative z-10 flex items-center justify-between gap-3 text-[11px] text-charcoal/60">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-[10px] text-primary">
          Trending
        </span>
        <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-[11px] text-primary shadow-soft">
          {duration} min
        </span>
      </div>
      <div className="relative z-10 mt-4 space-y-2 min-h-[60px]">
        <p className="text-sm sm:text-base font-semibold text-primary leading-snug">{name}</p>
        <p className="text-xs text-charcoal/70 max-h-10 overflow-hidden">{description}</p>
      </div>
      <div className="relative z-10 mt-5 flex items-center justify-between">
        <span className="text-base font-semibold text-primary">{formatCurrency(price)}</span>
        <span className="text-[11px] text-charcoal/60">Instant confirmation</span>
      </div>
      {selected ? (
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2 py-1 text-[10px] font-medium text-primary shadow-soft">
          Selected
        </span>
      ) : null}
    </button>
  );
}
