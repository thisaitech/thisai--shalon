'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export default function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('text-sm font-medium text-primary/80', className)}
      {...props}
    />
  );
}
