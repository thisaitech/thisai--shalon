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
        'w-full text-left rounded-2xl border border-transparent bg-white/80 p-4 transition-all hover:border-primary/40 hover:-translate-y-0.5 focus-ring',
        selected && 'border-primary bg-white shadow-soft'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-primary">{name}</p>
          <p className="text-sm text-charcoal/70">{description}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{formatCurrency(price)}</p>
          <p className="text-xs text-charcoal/60">{duration} min</p>
        </div>
      </div>
    </button>
  );
}
