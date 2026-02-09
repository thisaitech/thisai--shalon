import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export type UserProfile = {
  uid: string;
  email: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'customer' | 'owner';
  preferences: {
    reminders: boolean;
    marketing: boolean;
  };
  createdAt: string;
  updatedAt?: string;
};

export async function ensureUserProfile(user: User, role: UserProfile['role']) {
  if (!db) return;
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const now = new Date().toISOString();
    await setDoc(ref, {
      uid: user.uid,
      email: user.email ?? null,
      firstName: '',
      lastName: '',
      phone: '',
      role,
      preferences: {
        reminders: true,
        marketing: false
      },
      createdAt: now,
      updatedAt: now
    });
    return;
  }

  const data = snap.data();
  if (!data.role || data.role !== role) {
    await setDoc(ref, { role }, { merge: true });
  }
  if (!data.email && user.email) {
    await setDoc(ref, { email: user.email }, { merge: true });
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  if (!db) return;
  const ref = doc(db, 'users', uid);
  await setDoc(ref, data, { merge: true });
}
