'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

function isModifiedEvent(event: MouseEvent) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

function findAnchor(target: EventTarget | null) {
  let el = target as HTMLElement | null;
  while (el) {
    if (el.tagName === 'A') return el as HTMLAnchorElement;
    el = el.parentElement;
  }
  return null;
}

export default function NavProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const fallbackTimerRef = useRef<number | null>(null);

  // `useSearchParams` would require a Suspense boundary in the root layout.
  // For a lightweight progress indicator, pathname is sufficient.
  const routeKey = useMemo(() => `${pathname}`, [pathname]);

  useEffect(() => {
    // Stop the bar once navigation has resolved (routeKey changes when it finishes).
    setActive(false);
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, [routeKey]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return; // left click only
      if (isModifiedEvent(event)) return;

      const anchor = findAnchor(event.target);
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#')) return;
      if (anchor.target === '_blank') return;
      if (anchor.hasAttribute('download')) return;

      // External links should not trigger.
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
      } catch {
        return;
      }

      setActive(true);
      if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current);
      // Safety: if navigation is interrupted, don't leave the bar stuck.
      fallbackTimerRef.current = window.setTimeout(() => {
        setActive(false);
        fallbackTimerRef.current = null;
      }, 5000);
    };

    const onPopState = () => setActive(true);

    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  if (!active) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] h-1 bg-gradient-to-r from-primary via-lilac to-accent bg-[length:200%_100%] animate-shimmer"
      aria-hidden="true"
    />
  );
}
