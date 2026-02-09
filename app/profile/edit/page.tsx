'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { updateUserProfile, type UserProfile } from '@/lib/firebase/user';
import CustomerContainer from '@/components/layout/CustomerContainer';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Spinner from '@/components/ui/spinner';
import Skeleton from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  pincode: string;
  reminders: boolean;
  marketing: boolean;
};

export default function ProfileEditPage() {
  const [form, setForm] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    pincode: '',
    reminders: true,
    marketing: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const lastNameRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const locationRef = useRef<HTMLInputElement | null>(null);
  const pincodeRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!auth || !db) {
      setError('Firebase is not configured. Add your NEXT_PUBLIC_FIREBASE_* keys.');
      setLoading(false);
      return;
    }

    const firebaseAuth = auth;
    const firestore = db;
    let unsubscribeProfile = () => {};

    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
      if (!user) {
        setError('Please log in to update your profile.');
        setLoading(false);
        return;
      }

      const profileRef = doc(firestore, 'users', user.uid);
      unsubscribeProfile();
      unsubscribeProfile = onSnapshot(
        profileRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as UserProfile & {
              location?: string;
              pincode?: string;
            };
            setForm({
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: data.email || user.email || '',
              phone: data.phone || '',
              location: data.location || '',
              pincode: data.pincode || '',
              reminders: data.preferences?.reminders ?? true,
              marketing: data.preferences?.marketing ?? false
            });
          } else {
            setForm((prev) => ({
              ...prev,
              email: user.email || ''
            }));
          }
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);

  const handleSave = async () => {
    if (!auth || !db) return;
    const user = auth.currentUser;
    if (!user) {
      setError('Please log in to update your profile.');
      return;
    }
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      await updateUserProfile(user.uid, {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        location: form.location,
        pincode: form.pincode,
        email: user.email ?? form.email ?? '',
        preferences: {
          reminders: form.reminders,
          marketing: form.marketing
        },
        updatedAt: new Date().toISOString()
      });
      setStatus('Profile updated.');
      window.setTimeout(() => setStatus(null), 2500);
    } catch (err) {
      setError((err as Error).message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      document.cookie = 'lumiere_auth=; path=/; max-age=0; samesite=lax';
      window.location.href = '/login';
    } catch (err) {
      setError((err as Error).message || 'Unable to sign out.');
    }
  };

  return (
    <div className="min-h-screen pb-32 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-32 top-32 h-96 w-96 rounded-full bg-sky/25 blur-3xl" />
        <div className="absolute left-1/2 -bottom-48 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/14 blur-3xl" />
      </div>

      <CustomerContainer className="pt-7 space-y-6 relative">
        <header className="flex items-start justify-between">
          <Link
            href="/profile"
            className="h-11 w-11 rounded-2xl bg-white/90 shadow-soft border border-white/70 flex items-center justify-center focus-ring"
            aria-label="Back"
          >
            <ArrowLeft size={18} className="text-ink" />
          </Link>
          <div className="text-center">
            <p className="text-xs text-charcoal/60">Profile</p>
            <h1 className="text-xl font-semibold text-ink">Edit details</h1>
          </div>
          <div className="h-11 w-11" aria-hidden="true" />
        </header>

        <div className="rounded-[40px] border border-white/70 bg-gradient-to-b from-white/80 via-white/70 to-white/65 shadow-glow backdrop-blur-xl p-6 space-y-6 animate-fade-up">
          {loading ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-14 rounded-full" />
                  </div>
                ))}
              </div>
              <div className="rounded-[32px] bg-secondary/60 border border-white/70 p-5 space-y-3">
                <Skeleton className="h-5 w-28" />
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-6 w-6 rounded-md" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-6 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-14 rounded-full" />
            </div>
          ) : error ? (
            <div className="space-y-4">
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
              <Link href="/login" className="text-sm font-medium text-primary">
                Go to login
              </Link>
            </div>
          ) : (
            <>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSave();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, firstName: event.target.value }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        lastNameRef.current?.focus();
                      }
                    }}
                    autoComplete="given-name"
                    enterKeyHint="next"
                    className="rounded-full bg-white/90 border border-white/80 shadow-soft px-6 min-h-[56px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    ref={lastNameRef}
                    id="lastName"
                    value={form.lastName}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, lastName: event.target.value }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        phoneRef.current?.focus();
                      }
                    }}
                    autoComplete="family-name"
                    enterKeyHint="next"
                    className="rounded-full bg-white/90 border border-white/80 shadow-soft px-6 min-h-[56px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    readOnly
                    autoComplete="email"
                    className="rounded-full bg-white/80 border border-white/70 shadow-soft px-6 min-h-[56px] text-charcoal/70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    ref={phoneRef}
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        locationRef.current?.focus();
                      }
                    }}
                    autoComplete="tel"
                    enterKeyHint="next"
                    placeholder="e.g. 90925 67609"
                    className="rounded-full bg-white/90 border border-white/80 shadow-soft px-6 min-h-[56px]"
                  />
                </div>

                <div className="rounded-[32px] bg-secondary/70 border border-white/70 p-5 space-y-3">
                  <p className="text-sm font-semibold text-ink">Location</p>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-xs">
                      Area / City
                    </Label>
                    <Input
                      ref={locationRef}
                      id="location"
                      value={form.location}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, location: event.target.value }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          pincodeRef.current?.focus();
                        }
                      }}
                      placeholder="e.g. Nagercoil, Kanyakumari"
                      enterKeyHint="next"
                      className="rounded-full bg-white/90 border border-white/80 shadow-soft px-6 min-h-[56px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-xs">
                      Pincode
                    </Label>
                    <Input
                      ref={pincodeRef}
                      id="pincode"
                      value={form.pincode}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, pincode: event.target.value }))
                      }
                      placeholder="e.g. 629001"
                      inputMode="numeric"
                      enterKeyHint="done"
                      className="rounded-full bg-white/90 border border-white/80 shadow-soft px-6 min-h-[56px]"
                    />
                  </div>
                </div>

                <div className="rounded-[32px] bg-secondary/70 border border-white/70 p-5 space-y-3">
                  <p className="text-sm font-semibold text-ink">Preferences</p>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-charcoal/80">Appointment reminders</span>
                    <input
                      type="checkbox"
                      checked={form.reminders}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, reminders: event.target.checked }))
                      }
                      className="h-6 w-6 rounded-md border border-primary/20 accent-primary"
                      aria-label="Appointment reminders"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-charcoal/80">New offers</span>
                    <input
                      type="checkbox"
                      checked={form.marketing}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, marketing: event.target.checked }))
                      }
                      className="h-6 w-6 rounded-md border border-primary/20 accent-primary"
                      aria-label="New offers"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={saving}
                    className={cn('w-full rounded-full min-h-[60px] text-base font-semibold')}
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                        Saving...
                      </span>
                    ) : (
                      'Save changes'
                    )}
                  </Button>
                  {status ? <span className="text-sm text-primary">{status}</span> : null}
                </div>
              </form>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-center text-sm text-charcoal/70 hover:text-primary transition-colors"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </CustomerContainer>
    </div>
  );
}

