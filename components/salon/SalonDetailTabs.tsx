'use client';

import { Tab } from '@headlessui/react';
import { cn } from '@/lib/utils';
import type { Service } from '@/lib/data';
import { serviceImages } from '@/lib/service-images';
import ServiceCard from '@/components/salon/ServiceCard';

const tabs = ['Services', 'Package', 'Specialist', 'Portfolio', 'Shop'] as const;

export default function SalonDetailTabs({
  salonId,
  salonImage,
  salonRating,
  services
}: {
  salonId: string;
  salonImage: string;
  salonRating: number;
  services: Service[];
}) {
  return (
    <Tab.Group>
      <Tab.List className="flex gap-6 overflow-x-auto no-scrollbar border-b border-muted/80 pb-2">
        {tabs.map((tab) => (
          <Tab
            key={tab}
            className={({ selected }) =>
              cn(
                'shrink-0 text-sm font-medium focus:outline-none pb-2',
                selected ? 'text-primary border-b-2 border-primary' : 'text-charcoal/50'
              )
            }
          >
            {tab}
          </Tab>
        ))}
      </Tab.List>

      <Tab.Panels className="pt-4">
        <Tab.Panel>
          <div className="grid grid-cols-2 gap-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                salonId={salonId}
                service={service}
                image={serviceImages[service.id] ?? salonImage}
                rating={salonRating}
                reviewsLabel="1.2k"
              />
            ))}
          </div>
        </Tab.Panel>

        {tabs.slice(1).map((tab) => (
          <Tab.Panel key={tab}>
            <div className="rounded-3xl bg-white/92 shadow-soft border border-white/70 p-6 text-sm text-charcoal/70">
              {tab} content is coming next. For now, book from the Services tab.
            </div>
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
}

