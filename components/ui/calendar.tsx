'use client';

import * as React from 'react';
import DatePicker from 'react-datepicker';
import { cn } from '@/lib/utils';

const CalendarInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      aria-label="Select appointment date"
      className={cn(
        'w-full min-h-[48px] rounded-2xl border border-primary/10 bg-white/80 px-4 py-3 text-sm focus-ring',
        className
      )}
      {...props}
    />
  )
);

CalendarInput.displayName = 'CalendarInput';

export default function Calendar({
  selected,
  onChange,
  className
}: {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  className?: string;
}) {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      minDate={new Date()}
      showPopperArrow={false}
      popperPlacement="bottom-start"
      customInput={<CalendarInput />}
      className={className}
    />
  );
}
