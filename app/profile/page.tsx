'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { updateUserProfile, type UserProfile } from '@/lib/firebase/user';
import CustomerContainer from '@/components/layout/CustomerContainer';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Spinner from '@/components/ui/spinner';
import Skeleton from '@/components/ui/skeleton';

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  reminders: boolean;
  marketing: boolean;
};

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    reminders: true,
    marketing: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

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
            const data = snapshot.data() as UserProfile;
            setForm({
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: data.email || user.email || '',
              phone: data.phone || '',
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
    setStatus(null);
    try {
      await updateUserProfile(user.uid, {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: user.email ?? form.email ?? '',
        preferences: {
          reminders: form.reminders,
          marketing: form.marketing
        }
      });
      setStatus('Profile updated.');
    } catch (err) {
      setError((err as Error).message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-32">
      <CustomerContainer className="pt-7 space-y-6">
        <header className="space-y-1">
          <p className="text-xs text-charcoal/60">Profile</p>
          <h1 className="text-2xl font-semibold text-ink">Your profile</h1>
          <p className="text-sm text-charcoal/70">
            Keep your preferences ready for every booking.
          </p>
        </header>

        <div className="rounded-3xl bg-white/92 shadow-soft border border-white/70 p-6 space-y-6 animate-fade-up">
          {loading ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
              <div className="rounded-2xl bg-secondary/60 border border-white/70 p-4 space-y-3">
                <Skeleton className="h-5 w-28" />
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-10" />
                </div>
              </div>
              <Skeleton className="h-12" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, firstName: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, lastName: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-secondary/70 border border-white/70 p-4 space-y-3">
                <p className="text-sm font-semibold text-ink">Preferences</p>
                <div className="flex items-center justify-between text-sm">
                  <span>Appointment reminders</span>
                  <input
                    type="checkbox"
                    checked={form.reminders}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, reminders: event.target.checked }))
                    }
                    className="h-4 w-4 accent-primary"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>New offers</span>
                  <input
                    type="checkbox"
                    checked={form.marketing}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, marketing: event.target.checked }))
                    }
                    className="h-4 w-4 accent-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={handleSave} disabled={saving} className="w-full">
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
            </>
          )}
        </div>

        <div className="rounded-3xl bg-white/92 shadow-soft border border-white/70 p-6 space-y-3 animate-fade-up [animation-delay:80ms]">
          <p className="text-xs text-charcoal/60">Membership</p>
          <h2 className="text-xl font-semibold text-ink">Glow Circle</h2>
          <p className="text-sm text-charcoal/70">
            Priority booking, bridal trials, and spa upgrades every month.
          </p>
          <Button className="w-full">Upgrade membership</Button>
        </div>

        <div className="rounded-3xl bg-white/92 shadow-soft border border-white/70 p-6 space-y-3 animate-fade-up [animation-delay:120ms]">
          <p className="text-sm font-semibold text-ink">Upcoming benefits</p>
          <ul className="text-sm text-charcoal/70 space-y-2">
            <li>• Complimentary bridal touch-ups</li>
            <li>• Groom grooming add-ons</li>
            <li>• 15% off hair spa rituals</li>
          </ul>
        </div>
      </CustomerContainer>
    </div>
  );
}
