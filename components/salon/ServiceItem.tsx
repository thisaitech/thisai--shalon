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
        'w-full text-left rounded-3xl border border-white/70 bg-white/85 p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow focus-ring',
        selected && 'border-primary/40 bg-white shadow-glow'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-primary">{name}</p>
          <p className="text-sm text-charcoal/70">{description}</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-sm font-medium">{formatCurrency(price)}</p>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
            {duration} min
          </span>
        </div>
      </div>
    </button>
  );
}
