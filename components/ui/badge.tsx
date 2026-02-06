'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export default function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-primary/80 shadow-soft',
        className
      )}
      {...props}
    />
  );
}
