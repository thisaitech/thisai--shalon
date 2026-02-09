'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/client';
import { ensureUserProfile } from '@/lib/firebase/user';
import { getAuthErrorMessage } from '@/lib/firebase/auth-errors';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Button from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';

export default function OwnerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserProfile(credential.user, 'owner');
      document.cookie = 'lumiere_auth=1; path=/';
      router.push('/owner');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="glass rounded-2xl p-10 w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Owner access</p>
        <h1 className="text-3xl font-display text-primary mt-3">Business login</h1>
        <p className="mt-2 text-sm text-charcoal/70">
          Manage bookings, customers, and services in real time.
        </p>
        {!auth || !db ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            Firebase is not configured. Add your NEXT_PUBLIC_FIREBASE_* keys in Vercel.
          </p>
        ) : null}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading || !auth || !db}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                Signing in...
              </span>
            ) : (
              'Log in'
            )}
          </Button>
        </form>
        <p className="mt-4 text-sm text-charcoal/70">
          Need a partner account?{' '}
          <Link href="/signup-salon" className="font-medium text-primary">
            Register your studio
          </Link>
        </p>
      </div>
    </div>
  );
}
