'use client';

import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const getAuthHeaders = useCallback(async () => {
    if (!user) return {};
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` } as Record<string, string>;
  }, [user]);

  const fetchWithAuth = useCallback(
    async (url: string, options?: RequestInit) => {
      const headers = await getAuthHeaders();
      const allHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers
      };
      return fetch(url, {
        ...options,
        headers: allHeaders
      });
    },
    [getAuthHeaders]
  );

  return { user, loading, getAuthHeaders, fetchWithAuth };
}
