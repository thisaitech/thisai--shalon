'use client';

import { cn } from '@/lib/utils';

export function StepProgress({
  steps,
  current
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-charcoal/70">
      {steps.map((step, index) => {
        const isActive = index + 1 === current;
        const isDone = index + 1 < current;
        return (
          <div key={step} className="flex items-center gap-2">
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full transition-all',
                isDone && 'bg-accent',
                isActive && 'bg-primary animate-pulse',
                !isActive && !isDone && 'bg-charcoal/20'
              )}
            />
            <span className={cn(isActive && 'text-primary font-medium')}>
              {index + 1}. {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
