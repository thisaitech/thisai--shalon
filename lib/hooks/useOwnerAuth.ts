'use client';

import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

export function useOwnerAuth() {
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
    return { Authorization: `Bearer ${token}` };
  }, [user]);

  const fetchWithAuth = useCallback(
    async (url: string, options?: RequestInit) => {
      const headers = await getAuthHeaders();
      return fetch(url, {
        ...options,
        headers: { ...headers, 'Content-Type': 'application/json', ...(options?.headers || {}) }
      });
    },
    [getAuthHeaders]
  );

  return { user, loading, getAuthHeaders, fetchWithAuth };
}
