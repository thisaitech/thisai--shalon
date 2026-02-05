'use client';

import { cn } from '@/lib/utils';

export default function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary',
        className
      )}
      aria-hidden="true"
    />
  );
}
