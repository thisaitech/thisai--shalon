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
    // Keep it crisp: show ~1s, then fade out quickly.
    const hideTimer = window.setTimeout(() => setHidden(true), 1000);
    const unmountTimer = window.setTimeout(() => setMounted(false), 1300);
    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(unmountTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[70] flex items-center justify-center bg-secondary/70 backdrop-blur-xl transition-opacity duration-300',
        hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-pulse-soft" />
        <div className="absolute -right-28 top-10 h-80 w-80 rounded-full bg-sky/30 blur-3xl animate-pulse-soft [animation-delay:120ms]" />
        <div className="absolute left-1/2 -bottom-32 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/18 blur-3xl animate-pulse-soft [animation-delay:220ms]" />
      </div>

      <div className="relative w-[min(420px,92vw)] rounded-[38px] border border-white/70 bg-white/86 shadow-glow overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-lilac/10 to-sky/25" />

        <div className="relative p-8 text-center">
          <div className="mx-auto grid place-items-center h-16 w-16 rounded-[24px] bg-white/70 border border-white/70 shadow-soft">
            <div className="grid place-items-center h-12 w-12 rounded-[18px] bg-gradient-to-br from-primary via-lilac to-accent text-white shadow-glow">
              <Sparkles size={20} />
            </div>
          </div>

          <p className="mt-5 text-xs uppercase tracking-[0.35em] text-primary/70">Lumiére Studio</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">Loading your glow session</h1>
          <p className="mt-2 text-sm text-charcoal/65">
            Curating bridal, groom & unisex rituals for you.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-12 rounded-2xl bg-white/70 border border-white/70 shadow-soft overflow-hidden',
                  i === 0 && 'animate-fade-up',
                  i === 1 && 'animate-fade-up [animation-delay:60ms]',
                  i === 2 && 'animate-fade-up [animation-delay:120ms]'
                )}
              >
                <div className="h-full w-full bg-gradient-to-r from-muted/60 via-white/80 to-muted/60 bg-[length:200%_100%] animate-shimmer" />
              </div>
            ))}
          </div>

          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted/70">
            <div className="h-full w-[65%] bg-gradient-to-r from-primary via-lilac to-accent bg-[length:200%_100%] animate-shimmer rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
