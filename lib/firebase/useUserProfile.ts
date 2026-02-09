import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import type { UserProfile } from '@/lib/firebase/user';

export function useUserProfile() {
  const [user, setUser] = useState<User | null>(auth?.currentUser ?? null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      setUser(null);
      setProfile(null);
      return;
    }

    const firebaseAuth = auth;
    const firestore = db;
    let unsubscribeProfile = () => {};

    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setError(null);

      unsubscribeProfile();
      setProfile(null);

      if (!nextUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const ref = doc(firestore, 'users', nextUser.uid);
      unsubscribeProfile = onSnapshot(
        ref,
        (snap) => {
          setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
          setLoading(false);
        },
        (err) => {
          setError(err.message || 'Unable to load profile.');
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);

  return { user, profile, loading, error };
}

