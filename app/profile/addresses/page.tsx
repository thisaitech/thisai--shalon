'use client';

import Link from 'next/link';
import { ArrowLeft, MapPin, Pencil } from 'lucide-react';
import CustomerContainer from '@/components/layout/CustomerContainer';
import Button from '@/components/ui/button';
import { useUserProfile } from '@/lib/firebase/useUserProfile';

function formatLocation(location?: string, pincode?: string) {
  const city = (location || '').trim();
  const pin = (pincode || '').trim();
  if (city && pin) return `${city} - ${pin}`;
  return city || pin || 'Add your location';
}

export default function AddressesPage() {
  const { profile, loading, error } = useUserProfile();

  return (
    <div className="min-h-screen pb-32">
      <CustomerContainer className="pt-7 space-y-6">
        <header className="flex items-start justify-between">
          <Link
            href="/profile"
            className="h-11 w-11 rounded-2xl bg-white/90 shadow-soft border border-white/70 flex items-center justify-center focus-ring"
            aria-label="Back"
          >
            <ArrowLeft size={18} className="text-ink" />
          </Link>
          <div className="text-center">
            <p className="text-xs text-charcoal/60">Account</p>
            <h1 className="text-xl font-semibold text-ink">My Address</h1>
          </div>
          <div className="h-11 w-11" aria-hidden="true" />
        </header>

        {error ? (
          <div className="rounded-3xl bg-white/92 shadow-soft border border-white/70 p-5 text-sm text-red-600">
            {error}
          </div>
        ) : (
          <div className="rounded-[34px] bg-white/92 shadow-soft border border-white/70 p-5 space-y-4 animate-fade-up">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="h-12 w-12 rounded-2xl bg-sky/30 text-primary grid place-items-center shadow-soft">
                  <MapPin size={18} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-charcoal/50">
                    Default Location
                  </p>
                  <p className="mt-1 text-base font-semibold text-ink">
                    {loading ? 'Loading…' : formatLocation(profile?.location, profile?.pincode)}
                  </p>
                  <p className="mt-1 text-sm text-charcoal/70">
                    Used for confirmations and quick booking.
                  </p>
                </div>
              </div>

              <Link
                href="/profile/edit"
                className="h-11 w-11 rounded-2xl bg-white/90 shadow-soft border border-white/70 flex items-center justify-center focus-ring"
                aria-label="Edit address"
              >
                <Pencil size={18} className="text-ink" />
              </Link>
            </div>

            <Button className="w-full" onClick={() => (window.location.href = '/profile/edit')}>
              Edit address
            </Button>
          </div>
        )}
      </CustomerContainer>
    </div>
  );
}
