'use client';

import { cn } from '@/lib/utils';

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-4 w-full rounded-2xl bg-muted/70 shimmer animate-shimmer shadow-soft',
        className
      )}
    />
  );
}
