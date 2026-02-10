'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/client';
import { ensureUserProfile } from '@/lib/firebase/user';
import { getAuthErrorMessage } from '@/lib/firebase/auth-errors';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Button from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/appointments';
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
      await ensureUserProfile(credential.user, 'customer');
      document.cookie = 'lumiere_auth=1; path=/; max-age=31536000; samesite=lax';
      router.push(redirectTo);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] px-6 py-12 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="glass rounded-2xl p-10 w-full animate-fade-up">
          <h2 className="text-2xl font-display text-primary">Log in with email</h2>
          <p className="mt-2 text-sm text-charcoal/70">We’ll keep your appointments in sync.</p>
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
            New here?{' '}
            <Link href="/signup" className="font-medium text-primary">
              Create an account
            </Link>
          </p>
          <p className="mt-2 text-xs text-charcoal/50">
            Own a studio?{' '}
            <Link href="/owner/login" className="text-primary">
              Owner login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
