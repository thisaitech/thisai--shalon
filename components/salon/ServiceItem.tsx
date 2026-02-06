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
        'group relative w-full text-left rounded-3xl border border-white/70 bg-white/85 p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow focus-ring min-h-[140px] flex flex-col justify-between',
        selected &&
          'border-transparent bg-gradient-to-br from-primary/10 via-lilac/10 to-accent/10 shadow-glow'
      )}
    >
      {selected ? (
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-primary shadow-soft">
          Selected
        </span>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm sm:text-base font-medium text-primary">{name}</p>
          <p className="mt-1 hidden text-xs text-charcoal/70 sm:block">{description}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[11px] text-primary shadow-soft">
          {duration} min
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">{formatCurrency(price)}</span>
        <span className="text-[11px] text-charcoal/60">Instant confirmation</span>
      </div>
    </button>
  );
}
