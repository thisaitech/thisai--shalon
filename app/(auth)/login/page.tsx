'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
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
    try {
      await signInWithEmailAndPassword(auth, email, password);
      document.cookie = 'lumiere_auth=1; path=/';
      router.push(redirectTo);
    } catch (err) {
      setError((err as Error).message || 'Unable to log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] px-6 py-12 flex items-center justify-center">
      <div className="max-w-5xl w-full grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-center">
        <div className="card-surface p-8 space-y-4 animate-fade-up">
          <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Welcome</p>
          <h1 className="text-4xl font-display text-primary">Choose your login</h1>
          <p className="text-sm text-charcoal/70">
            Gender-neutral, studio-first booking. Pick your preferred way to sign in.
          </p>
          <div className="grid gap-3">
            <button className="card-surface p-4 flex items-center justify-between text-sm font-medium">
              Continue with email
              <span className="text-primary">→</span>
            </button>
            <button className="card-surface p-4 flex items-center justify-between text-sm text-charcoal/50">
              Passkey login (coming soon)
              <span>✦</span>
            </button>
          </div>
          <div className="relative h-44 w-full overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80"
              alt="Salon interior"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
        </div>

        <div className="glass rounded-2xl p-10 w-full max-w-md mx-auto">
          <h2 className="text-2xl font-display text-primary">Log in with email</h2>
          <p className="mt-2 text-sm text-charcoal/70">We’ll keep your appointments in sync.</p>
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
            <Button type="submit" className="w-full">
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
