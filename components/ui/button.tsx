'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 min-h-[48px] rounded-2xl px-5 py-3 text-sm font-medium transition-all focus-ring disabled:opacity-60 disabled:pointer-events-none',
          variant === 'primary' &&
            'bg-gradient-to-r from-primary via-lilac to-accent text-white shadow-glow hover:-translate-y-0.5 hover:shadow-lg',
          variant === 'secondary' &&
            'bg-white/80 border border-primary/10 text-primary hover:border-primary/30',
          variant === 'ghost' &&
            'bg-transparent border border-transparent text-primary hover:bg-white/60',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
