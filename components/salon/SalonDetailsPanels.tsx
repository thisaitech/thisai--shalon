'use client';

import { Disclosure } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

export default function SalonDetailsPanels() {
  const panels = ['About this studio', 'Amenities', 'Policies'] as const;
  return (
    <div className="grid gap-4">
      {panels.map((label) => (
        <Disclosure key={label}>
          {({ open }) => (
            <div className="rounded-2xl border border-white/50 bg-white/70 p-4">
              <Disclosure.Button className="w-full flex items-center justify-between text-left focus-ring rounded-2xl">
                <span className="font-medium">{label}</span>
                <ChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} size={18} />
              </Disclosure.Button>
              <Disclosure.Panel className="mt-3 text-sm text-charcoal/70">
                {label === 'About this studio'
                  ? 'A calm, light-filled space designed for slow beauty rituals and intentional self-care.'
                  : label === 'Amenities'
                    ? 'Herbal tea bar, quiet rooms, aromatherapy, and complimentary touch-up station.'
                    : 'Arrive 10 minutes early. Changes welcome up to 12 hours before your booking.'}
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>
      ))}
    </div>
  );
}
