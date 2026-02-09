'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

const COOKIE = 'lumiere_auth';

function setCookie(value: string, maxAgeSeconds: number) {
  document.cookie = `${COOKIE}=${value}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

export default function AuthCookieSync() {
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // This cookie is a lightweight "logged-in" flag for middleware route gating.
      // Not a security token. Firebase Auth still protects data access.
      if (user) {
        setCookie('1', 60 * 60 * 24 * 365); // 1 year
      } else {
        setCookie('', 0);
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}

