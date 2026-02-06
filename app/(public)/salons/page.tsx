import Link from 'next/link';
import { salons } from '@/lib/data';
import ServiceItem from '@/components/salon/ServiceItem';

const salon = salons[0];

export default function ServicesPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Services</p>
          <h1 className="text-4xl font-display text-gradient">Indian bridal + unisex menu</h1>
          <p className="text-sm text-charcoal/70 mt-2">
            Explore curated service styles and reserve an appointment instantly.
          </p>
        </div>
        <Link
          href={`/booking?salon=${salon.id}`}
          className="inline-flex items-center justify-center min-h-[48px] rounded-2xl bg-gradient-to-r from-primary via-lilac to-accent text-white px-5 py-3 text-sm font-medium shadow-glow"
        >
          Book appointment
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {salon.services.map((service) => (
          <ServiceItem
            key={service.id}
            name={service.name}
            description={service.description}
            price={service.price}
            duration={service.duration}
          />
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm text-charcoal/70">Need a custom bridal package?</p>
          <p className="font-display text-lg text-primary">We tailor every look for the ceremony.</p>
        </div>
        <Link href={`/salon/${salon.id}`} className="pill bg-white/90 text-primary">
          View studio
        </Link>
      </div>
    </div>
  );
}
