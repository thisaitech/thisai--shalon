'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { ensureUserProfile } from '@/lib/firebase/user';
import { getAuthErrorMessage } from '@/lib/firebase/auth-errors';
import { defaultBusinessHours } from '@/lib/utils';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Button from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';

export default function SalonSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [salonName, setSalonName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    if (!auth || !db) {
      setError('Firebase is not configured. Add your NEXT_PUBLIC_FIREBASE_* keys.');
      setLoading(false);
      return;
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await ensureUserProfile(cred.user, 'owner');
      const salonId = `salon-${cred.user.uid}`;
      await setDoc(doc(db, 'salons', salonId), {
        name: salonName,
        location,
        ownerId: cred.user.uid,
        ownerEmail: email,
        status: 'active',
        businessHours: defaultBusinessHours,
        services: [],
        createdAt: new Date().toISOString()
      });
      document.cookie = 'lumiere_auth=1; path=/';
      router.push('/dashboard/admin/settings');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="glass rounded-2xl p-10 w-full max-w-lg">
        <h1 className="text-3xl font-display text-primary">Join as a salon partner</h1>
        <p className="mt-2 text-sm text-charcoal/70">
          Let clients discover your space and book instantly.
        </p>
        {!auth || !db ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            Firebase is not configured. Add your NEXT_PUBLIC_FIREBASE_* keys in Vercel.
          </p>
        ) : null}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="salonName">Salon name</Label>
            <Input
              id="salonName"
              required
              value={salonName}
              onChange={(event) => setSalonName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              required
              placeholder="SoHo, New York"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Owner email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading || !auth || !db}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                Creating...
              </span>
            ) : (
              'Create salon'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
