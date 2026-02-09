import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  BadgeDollarSign,
  Clock,
  Heart,
  MapPin,
  Share2,
  Star
} from 'lucide-react';
import Carousel from '@/components/ui/carousel';
import CustomerContainer from '@/components/layout/CustomerContainer';
import SalonDetailTabs from '@/components/salon/SalonDetailTabs';
import { formatCurrency } from '@/lib/utils';
import { salons } from '@/lib/data';

export default function SalonDetailPage({ params }: { params: { id: string } }) {
  const salon = salons.find((item) => item.id === params.id);
  if (!salon) return notFound();

  const priceRange = (() => {
    const prices = salon.services.map((service) => service.price);
    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return formatCurrency(min);
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  })();

  const gallery = [
    salon.image,
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80'
  ];

  return (
    <div className="min-h-screen pb-36">
      <CustomerContainer className="pt-6 space-y-5">
        <div className="relative h-80 w-full overflow-hidden rounded-3xl bg-white/90 shadow-soft border border-white/70">
          <Carousel className="h-full">
            {gallery.map((image) => (
              <div key={image} className="relative h-80 w-full">
                <Image
                  src={image}
                  alt={salon.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 440px"
                />
              </div>
            ))}
          </Carousel>

          <div className="absolute inset-x-4 top-4 flex items-center justify-between">
            <Link
              href="/"
              className="h-10 w-10 rounded-full bg-white/90 shadow-soft border border-white/70 flex items-center justify-center focus-ring"
              aria-label="Back"
            >
              <ArrowLeft size={18} className="text-ink" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-10 w-10 rounded-full bg-white/90 shadow-soft border border-white/70 flex items-center justify-center"
                aria-label="Share"
              >
                <Share2 size={18} className="text-ink" />
              </button>
              <button
                type="button"
                className="h-10 w-10 rounded-full bg-white/90 shadow-soft border border-white/70 flex items-center justify-center"
                aria-label="Save"
              >
                <Heart size={18} className="text-primary" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-ink">{salon.name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-charcoal/60">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="text-primary" />
              {salon.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star size={14} className="text-primary" fill="currentColor" />
              {salon.rating.toFixed(1)} (1.2k)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} className="text-primary" />
              10am - 10pm
            </span>
            {priceRange ? (
              <span className="inline-flex items-center gap-1.5">
                <BadgeDollarSign size={14} className="text-primary" />
                {priceRange}
              </span>
            ) : null}
          </div>
        </div>

        <SalonDetailTabs
          salonId={salon.id}
          salonImage={salon.image}
          salonRating={salon.rating}
          services={salon.services}
        />
      </CustomerContainer>

      <div className="fixed bottom-20 left-0 right-0 z-30 md:hidden">
        <CustomerContainer>
          <Link
            href={`/booking?salon=${salon.id}`}
            className="w-full inline-flex items-center justify-center rounded-2xl bg-primary text-white px-6 py-4 text-sm font-semibold shadow-glow"
          >
            Book Appointment
          </Link>
        </CustomerContainer>
      </div>
    </div>
  );
}
