'use client';

import Link from 'next/link';
import { ArrowLeft, Gem, Wallet as WalletIcon } from 'lucide-react';
import CustomerContainer from '@/components/layout/CustomerContainer';
import Button from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useUserProfile } from '@/lib/firebase/useUserProfile';

export default function WalletPage() {
  const { profile, loading, error } = useUserProfile();

  const points = profile?.stats?.points ?? 250;
  const wallet = profile?.stats?.wallet ?? 500;

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
            <h1 className="text-xl font-semibold text-ink">Wallet</h1>
          </div>
          <div className="h-11 w-11" aria-hidden="true" />
        </header>

        {error ? (
          <div className="rounded-3xl bg-white/92 shadow-soft border border-white/70 p-5 text-sm text-red-600">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-[34px] bg-white/92 shadow-soft border border-white/70 p-5 space-y-4 animate-fade-up">
              <div className="flex items-center gap-3">
                <span className="h-12 w-12 rounded-2xl bg-accent/18 text-primary grid place-items-center shadow-soft">
                  <WalletIcon size={18} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-charcoal/50">Balance</p>
                  <p className="mt-1 text-2xl font-semibold text-ink">
                    {loading ? 'Loading…' : formatCurrency(wallet)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-charcoal/70">
                Wallet credits are applied automatically on eligible offers.
              </p>
            </div>

            <div className="rounded-[34px] bg-white/92 shadow-soft border border-white/70 p-5 space-y-4 animate-fade-up [animation-delay:80ms]">
              <div className="flex items-center gap-3">
                <span className="h-12 w-12 rounded-2xl bg-highlight/60 text-ink grid place-items-center shadow-soft">
                  <Gem size={18} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-charcoal/50">Points</p>
                  <p className="mt-1 text-2xl font-semibold text-ink">{loading ? '…' : points}</p>
                </div>
              </div>
              <p className="text-sm text-charcoal/70">
                Earn points with every appointment. Redeem on premium upgrades.
              </p>
            </div>

            <Button className="w-full" onClick={() => (window.location.href = '/booking')}>
              Book a service
            </Button>
          </div>
        )}
      </CustomerContainer>
    </div>
  );
}
