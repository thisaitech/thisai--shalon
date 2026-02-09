'use client';

import { cn } from '@/lib/utils';

export default function CustomerContainer({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('mx-auto w-full max-w-[440px] px-5', className)}>
      {children}
    </div>
  );
}

