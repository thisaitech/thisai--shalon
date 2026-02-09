'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Gem,
  Heart,
  MapPin,
  Pencil,
  ReceiptText,
  Wallet,
  LogOut
} from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import CustomerContainer from '@/components/layout/CustomerContainer';
import { cn, formatCurrency } from '@/lib/utils';
import { useUserProfile } from '@/lib/firebase/useUserProfile';
import { auth, db } from '@/lib/firebase/client';

function formatLocation(location?: string, pincode?: string) {
  const city = (location || '').trim();
  const pin = (pincode || '').trim();
  if (city && pin) return `${city} - ${pin}`;
  return city || pin || 'Add your location';
}

export default function ProfileOverviewPage() {
  const { user, profile, loading, error } = useUserProfile();
  const [orders, setOrders] = useState<number>(0);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !user) {
      setOrders(0);
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);
    const q = query(collection(db, 'appointments'), where('customerId', '==', user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setOrders(snap.size);
        setOrdersLoading(false);
      },
      () => {
        setOrders(0);
        setOrdersLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const displayName = useMemo(() => {
    const full = `${(profile?.firstName || '').trim()} ${(profile?.lastName || '').trim()}`.trim();
    if (full) return full;
    const email = profile?.email || user?.email || '';
    if (email.includes('@')) return email.split('@')[0];
    return 'Your profile';
  }, [profile?.email, profile?.firstName, profile?.lastName, user?.email]);

  const avatarLetter = useMemo(() => {
    const source = (profile?.firstName || profile?.email || user?.email || 'U').trim();
    return source ? source[0].toUpperCase() : 'U';
  }, [profile?.email, profile?.firstName, user?.email]);

  const locationLine = useMemo(() => formatLocation(profile?.location, profile?.pincode), [
    profile?.location,
    profile?.pincode
  ]);

  const points = profile?.stats?.points ?? 250;
  const wallet = profile?.stats?.wallet ?? 500;
  const wishlist = profile?.stats?.wishlist ?? 8;

  const handleLogout = async () => {
    if (!auth) return;
    setActionError(null);
    try {
      await signOut(auth);
      document.cookie = 'lumiere_auth=; path=/; max-age=0; samesite=lax';
      window.location.href = '/login';
    } catch (err) {
      setActionError((err as Error).message || 'Unable to sign out.');
    }
  };

  return (
    <div className="min-h-screen pb-32 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-primary/14 blur-3xl" />
        <div className="absolute -right-28 top-28 h-96 w-96 rounded-full bg-sky/22 blur-3xl" />
        <div className="absolute left-1/2 -bottom-56 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-accent/14 blur-3xl" />
      </div>

      <CustomerContainer className="pt-7 space-y-6 relative">
        <header className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-charcoal/60">Profile</p>
            <h1 className="text-3xl font-semibold text-ink leading-tight">Your space</h1>
            <p className="text-sm text-charcoal/70">Bookings, saved looks, and preferences.</p>
          </div>

          <button
            type="button"
            className="relative h-12 w-12 rounded-2xl bg-white/90 shadow-soft border border-white/70 flex items-center justify-center focus-ring"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-ink" />
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
        </header>

        {error ? (
          <div className="rounded-3xl bg-white/92 shadow-soft border border-white/70 p-5 text-sm text-red-600">
            {error}{' '}
            <Link href="/login" className="text-primary font-medium">
              Go to login
            </Link>
          </div>
        ) : null}

        <section className="space-y-3">
          <div className="rounded-[34px] overflow-hidden border border-white/70 shadow-glow">
            <div className="relative bg-gradient-to-r from-primary via-lilac to-ink p-5">
              <div
                className="pointer-events-none absolute inset-0 opacity-80"
                aria-hidden="true"
                style={{
                  background:
                    'radial-gradient(circle at 20% 10%, rgba(255, 213, 158, 0.22), transparent 45%), radial-gradient(circle at 85% 0%, rgba(174, 230, 255, 0.18), transparent 50%)'
                }}
              />
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative h-14 w-14 shrink-0 rounded-2xl bg-white grid place-items-center shadow-soft">
                    <span className="text-2xl font-semibold text-primary">{avatarLetter}</span>
                    <span className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full bg-white grid place-items-center shadow-soft">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    </span>
                  </div>
                  <div className="relative min-w-0 text-white">
                    <p className="text-lg font-semibold truncate">
                      {loading ? 'Loading...' : displayName}
                    </p>
                    <p className="mt-1 text-xs text-white/90 inline-flex items-center gap-1.5 truncate">
                      <MapPin size={12} className="opacity-90" />
                      {locationLine}
                    </p>
                  </div>
                </div>

                <Link
                  href="/profile/edit"
                  className="h-12 w-12 rounded-2xl bg-white/18 border border-white/30 grid place-items-center text-white shadow-soft focus-ring"
                  aria-label="Edit profile"
                >
                  <Pencil size={18} />
                </Link>
              </div>
            </div>

            <div className="bg-white/92 p-4">
              <div className="rounded-3xl bg-secondary/60 border border-white/70 shadow-soft p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="h-11 w-11 rounded-2xl bg-sky/30 text-primary grid place-items-center shadow-soft">
                    <MapPin size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-charcoal/50">
                      Default Location
                    </p>
                    <p className="mt-1 text-sm font-medium text-ink truncate">{locationLine}</p>
                  </div>
                </div>
                <Link
                  href="/profile/edit"
                  className="shrink-0 rounded-2xl bg-primary/10 border border-primary/15 px-4 py-2 text-xs font-semibold text-primary shadow-soft focus-ring"
                >
                  Change
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] bg-white/92 shadow-soft border border-white/70 p-4">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-sky/30 text-primary grid place-items-center shadow-soft">
                <ReceiptText size={18} />
              </div>
              <p className="mt-2 text-lg font-semibold text-ink">
                {ordersLoading ? <span className="inline-block h-5 w-8 rounded bg-muted/60" /> : orders}
              </p>
              <p className="text-[11px] text-charcoal/55">Orders</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-highlight/60 text-ink grid place-items-center shadow-soft">
                <Gem size={18} />
              </div>
              <p className="mt-2 text-lg font-semibold text-ink">{points}</p>
              <p className="text-[11px] text-charcoal/55">Points</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-accent/18 text-primary grid place-items-center shadow-soft">
                <Wallet size={18} />
              </div>
              <p className="mt-2 text-lg font-semibold text-ink">{formatCurrency(wallet)}</p>
              <p className="text-[11px] text-charcoal/55">Wallet</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shadow-soft">
                <Heart size={18} />
              </div>
              <p className="mt-2 text-lg font-semibold text-ink">{wishlist}</p>
              <p className="text-[11px] text-charcoal/55">Wishlist</p>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] overflow-hidden border border-white/70 shadow-glow">
          <div className="relative bg-gradient-to-r from-ink via-primary/45 to-ink p-5 text-white">
            <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-highlight/18 blur-3xl" />
            <div className="absolute -right-16 -bottom-24 h-72 w-72 rounded-full bg-sky/14 blur-3xl" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="h-11 w-11 rounded-2xl bg-highlight/18 text-highlight grid place-items-center">
                  <Gem size={18} />
                </span>
                <div>
                  <p className="text-base font-semibold">ThisAI Premium</p>
                  <p className="mt-0.5 text-xs text-white/70">
                    Exclusive deals + priority booking perks.
                  </p>
                </div>
              </div>
              <Link
                href="/help"
                className="rounded-2xl bg-highlight text-ink px-4 py-2 text-xs font-semibold shadow-soft focus-ring"
              >
                Try Free
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] bg-white/92 shadow-soft border border-white/70 p-2">
          <p className="px-4 pt-4 pb-2 text-[11px] uppercase tracking-[0.22em] text-charcoal/50">
            Account Settings
          </p>
          <div className="space-y-1 pb-2">
            <Link
              href="/profile/edit"
              className="flex items-center justify-between rounded-3xl px-4 py-4 hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="h-11 w-11 rounded-2xl bg-primary/10 text-primary grid place-items-center">
                  <Pencil size={18} />
                </span>
                <span className="text-sm font-medium text-ink">Edit Profile</span>
              </div>
              <ChevronRight size={18} className="text-charcoal/40" />
            </Link>

            <Link
              href="/profile/addresses"
              className="flex items-center justify-between rounded-3xl px-4 py-4 hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="h-11 w-11 rounded-2xl bg-sky/30 text-primary grid place-items-center">
                  <MapPin size={18} />
                </span>
                <span className="text-sm font-medium text-ink">My Address</span>
              </div>
              <ChevronRight size={18} className="text-charcoal/40" />
            </Link>

            <Link
              href="/profile/wallet"
              className="flex items-center justify-between rounded-3xl px-4 py-4 hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="h-11 w-11 rounded-2xl bg-accent/18 text-primary grid place-items-center">
                  <Wallet size={18} />
                </span>
                <span className="text-sm font-medium text-ink">Wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">{formatCurrency(wallet)}</span>
                <ChevronRight size={18} className="text-charcoal/40" />
              </div>
            </Link>

            <Link
              href="/help"
              className="flex items-center justify-between rounded-3xl px-4 py-4 hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="h-11 w-11 rounded-2xl bg-highlight/60 text-ink grid place-items-center">
                  <ReceiptText size={18} />
                </span>
                <span className="text-sm font-medium text-ink">Help & Support</span>
              </div>
              <ChevronRight size={18} className="text-charcoal/40" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-between rounded-3xl px-4 py-4 hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="h-11 w-11 rounded-2xl bg-charcoal/5 text-ink grid place-items-center">
                  <LogOut size={18} />
                </span>
                <span className="text-sm font-medium text-ink">Sign out</span>
              </div>
              <ChevronRight size={18} className="text-charcoal/40" />
            </button>
          </div>
        </section>

        {actionError ? (
          <div className="rounded-3xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
            {actionError}
          </div>
        ) : null}

        {/* Optional floating language button (visual accent like the reference) */}
        <div className="md:hidden fixed right-5 bottom-[108px] z-40">
          <button
            type="button"
            className={cn(
              'h-12 w-12 rounded-full bg-gradient-to-br from-primary via-lilac to-accent text-white shadow-glow',
              'grid place-items-center text-xs font-semibold'
            )}
            aria-label="Language"
          >
            EN
          </button>
        </div>
      </CustomerContainer>
    </div>
  );
}
