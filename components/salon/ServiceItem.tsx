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
        'group relative w-full text-left rounded-[26px] border border-white/70 bg-white/90 p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow focus-ring min-h-[150px] flex flex-col justify-between',
        selected &&
          'border-transparent bg-gradient-to-br from-primary/10 via-lilac/10 to-accent/10 shadow-glow'
      )}
    >
      <div className="flex items-center justify-between gap-3 text-[11px] text-charcoal/60">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-[10px] text-primary">
          Trending
        </span>
        <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-[11px] text-primary shadow-soft">
          {duration} min
        </span>
      </div>
      <div className="mt-4 space-y-2 min-h-[56px]">
        <p className="text-sm sm:text-base font-medium text-primary leading-snug">{name}</p>
        <p className="text-xs text-charcoal/70 max-h-9 overflow-hidden">{description}</p>
      </div>
      <div className="mt-5 flex items-center justify-between">
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
