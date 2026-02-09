import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import CustomerContainer from '@/components/layout/CustomerContainer';
import BookingFlow from '@/components/salon/BookingFlow';
import { salons } from '@/lib/data';

export default function BookingPage({
  searchParams
}: {
  searchParams?: { salon?: string; service?: string };
}) {
  const salonId = searchParams?.salon || salons[0]?.id;
  const salon = salons.find((item) => item.id === salonId);
  if (!salon) return notFound();

  return (
    <div className="min-h-screen pb-36">
      <CustomerContainer className="pt-6 space-y-5">
        <header className="flex items-start justify-between">
          <Link
            href="/"
            className="h-10 w-10 rounded-full bg-white/90 shadow-soft border border-white/70 flex items-center justify-center focus-ring"
            aria-label="Back"
          >
            <ArrowLeft size={18} className="text-ink" />
          </Link>
          <div className="text-center">
            <p className="text-xs text-charcoal/60">Appointment</p>
            <h1 className="text-xl font-semibold text-ink">Booking</h1>
            <p className="text-xs text-charcoal/60 inline-flex items-center justify-center gap-1.5">
              <MapPin size={12} className="text-primary" />
              {salon.location}
            </p>
          </div>
          <div className="h-10 w-10" aria-hidden="true" />
        </header>

        <div className="rounded-3xl bg-white/92 shadow-soft border border-white/70 p-5">
          <BookingFlow salon={salon} initialServiceId={searchParams?.service} />
        </div>
      </CustomerContainer>
    </div>
  );
}
