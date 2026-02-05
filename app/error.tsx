'use client';

import Link from 'next/link';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="glass rounded-2xl p-10 max-w-lg text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-charcoal/60">Something went wrong</p>
        <h1 className="mt-4 text-3xl font-display">We lost the glow for a moment.</h1>
        <p className="mt-3 text-charcoal/70">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="min-h-[48px] rounded-2xl bg-charcoal text-white px-6 py-3 focus-ring"
          >
            Try again
          </button>
          <Link
            href="/"
            className="min-h-[48px] rounded-2xl border border-charcoal/20 px-6 py-3 focus-ring"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
