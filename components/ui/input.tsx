'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full min-h-[48px] rounded-2xl border border-primary/10 bg-white/80 px-4 py-3 text-sm focus-ring',
        className
      )}
      {...props}
    />
  )
);

Input.displayName = 'Input';

export default Input;
