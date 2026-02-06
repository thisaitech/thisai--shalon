import { notFound } from 'next/navigation';
import BookingFlow from '@/components/salon/BookingFlow';
import { salons } from '@/lib/data';
import { CalendarCheck, MapPin, Sparkles } from 'lucide-react';

export default function BookingPage({
  searchParams
}: {
  searchParams?: { salon?: string };
}) {
  const salonId = searchParams?.salon || salons[0]?.id;
  const salon = salons.find((item) => item.id === salonId);
  if (!salon) return notFound();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Booking</p>
        <h1 className="text-4xl font-display text-gradient">Reserve your appointment</h1>
        <p className="text-sm text-charcoal/80 max-w-2xl">
          Select your service, pick a time, and confirm your glow session. Bridal, groom, and unisex
          bookings are available every day.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="pill bg-white/90">Same-day slots</span>
          <span className="pill bg-primary/10 text-primary">Instant confirmation</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-panel p-6">
          <BookingFlow salon={salon} />
        </div>
        <div className="space-y-4">
          <div className="card-spotlight p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="icon-orb">
                <MapPin size={18} />
              </span>
              <div>
                <p className="text-sm font-medium text-primary">{salon.name}</p>
                <p className="text-xs text-charcoal/60">{salon.location}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="pill bg-white/90">Open 9:00 — 20:00</span>
              <span className="pill bg-primary/10 text-primary">Instant booking</span>
            </div>
          </div>
          <div className="card-surface p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="icon-orb">
                <CalendarCheck size={18} />
              </span>
              <div>
                <p className="font-medium text-primary">What to bring</p>
                <p className="text-sm text-charcoal/80">Reference photos + outfit inspiration.</p>
              </div>
            </div>
            <ul className="text-sm text-charcoal/80 space-y-2">
              <li>• Bridal trials arrive makeup-free.</li>
              <li>• Groom services include skin prep + beard grooming.</li>
              <li>• Hair spa includes herbal cleanse + steam.</li>
            </ul>
          </div>
          <div className="card-surface p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="icon-orb">
                <Sparkles size={18} />
              </span>
              <div>
                <p className="font-medium text-primary">Glow promise</p>
                <p className="text-sm text-charcoal/80">Luxury products and precision artists.</p>
              </div>
            </div>
            <p className="text-sm text-charcoal/80">
              Need to reschedule? Message us within 12 hours for complimentary adjustments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
