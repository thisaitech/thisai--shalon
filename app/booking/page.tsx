import Link from 'next/link';
import { notFound } from 'next/navigation';
import BookingFlow from '@/components/salon/BookingFlow';
import { salons } from '@/lib/data';

export default function BookingPage({
  searchParams
}: {
  searchParams?: { salon?: string };
}) {
  const salonId = searchParams?.salon || salons[0]?.id;
  const salon = salons.find((item) => item.id === salonId);
  if (!salon) return notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Appointment</p>
          <h1 className="text-3xl font-display text-primary">Book your service</h1>
        </div>
        <Link href={`/salon/${salon.id}`} className="text-sm text-primary focus-ring rounded-md px-1">
          View salon
        </Link>
      </div>
      <div className="glass rounded-2xl p-6">
        <BookingFlow salon={salon} />
      </div>
    </div>
  );
}
