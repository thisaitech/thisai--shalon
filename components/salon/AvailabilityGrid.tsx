'use client';

import { cn, formatTime, generateTimeSlots } from '@/lib/utils';
import type { BusinessHours } from '@/lib/utils';

export default function AvailabilityGrid({
  date,
  businessHours,
  serviceDuration,
  selectedTime,
  bookedTimes,
  onSelect
}: {
  date: Date | null;
  businessHours: BusinessHours;
  serviceDuration: number;
  selectedTime: string | null;
  bookedTimes: string[];
  onSelect: (time: string) => void;
}) {
  if (!date) {
    return (
      <div className="rounded-2xl border border-dashed border-primary/20 bg-white/60 p-6 text-center text-sm text-charcoal/60">
        Pick a date to reveal available times.
      </div>
    );
  }

  const timeSlots = generateTimeSlots({
    date,
    businessHours,
    intervalMinutes: 30,
    serviceDuration
  });

  if (!timeSlots.length) {
    return (
      <div className="rounded-2xl border border-dashed border-primary/20 bg-white/60 p-6 text-center text-sm text-charcoal/60">
        Closed on this day. Try another date.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {timeSlots.map((slot) => {
        const isBooked = bookedTimes.includes(slot);
        const isSelected = selectedTime === slot;
        return (
          <button
            key={slot}
            type="button"
            disabled={isBooked}
            onClick={() => onSelect(slot)}
            aria-pressed={isSelected}
            className={cn(
              'px-4 py-3 rounded-2xl text-sm transition-all min-h-[48px] focus-ring shadow-soft',
              isSelected && 'bg-gradient-to-r from-primary via-lilac to-accent text-white shadow-glow',
              isBooked && 'bg-white/70 text-charcoal/40 cursor-not-allowed',
              !isSelected && !isBooked && 'bg-white/80 hover:bg-white'
            )}
          >
            {formatTime(slot)}
          </button>
        );
      })}
    </div>
  );
}
