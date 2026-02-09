'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'lumiere_boot_shown';

export default function BootSplash() {
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') return;
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Ignore storage errors (private mode etc.)
    }

    setMounted(true);
    const hideTimer = window.setTimeout(() => setHidden(true), 850);
    const unmountTimer = window.setTimeout(() => setMounted(false), 1200);
    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(unmountTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[70] flex items-center justify-center bg-secondary/80 backdrop-blur-xl transition-opacity duration-300',
        hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="relative w-[min(420px,92vw)] rounded-[36px] border border-white/70 bg-white/85 shadow-glow overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-lilac/10 to-sky/20" />
        <div className="relative p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] bg-primary/12 text-primary shadow-soft">
            <Sparkles size={22} />
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.35em] text-primary/70">Lumiére</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">Your glow-up starts now</h1>
          <p className="mt-2 text-sm text-charcoal/65">
            Loading your booking experience…
          </p>

          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted/70">
            <div className="h-full w-[60%] bg-gradient-to-r from-primary via-lilac to-accent bg-[length:200%_100%] animate-shimmer rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

