import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export type UserProfile = {
  uid: string;
  email: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  location?: string;
  pincode?: string;
  role: 'customer' | 'owner';
  preferences: {
    reminders: boolean;
    marketing: boolean;
  };
  stats?: {
    points: number;
    wallet: number;
    wishlist: number;
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
      location: '',
      pincode: '',
      role,
      preferences: {
        reminders: true,
        marketing: false
      },
      stats: {
        points: 250,
        wallet: 500,
        wishlist: 8
      },
      createdAt: now,
      updatedAt: now
    });
    return;
  }

  const data = snap.data();
  const defaults: Partial<UserProfile> = {};
  if (typeof data.location !== 'string') defaults.location = '';
  if (typeof data.pincode !== 'string') defaults.pincode = '';
  if (!data.stats) {
    defaults.stats = { points: 250, wallet: 500, wishlist: 8 };
  }
  if (!data.role || data.role !== role) {
    defaults.role = role;
  }
  if (!data.email && user.email) {
    defaults.email = user.email;
  }

  if (Object.keys(defaults).length) {
    await setDoc(ref, defaults, { merge: true });
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  if (!db) return;
  const ref = doc(db, 'users', uid);
  await setDoc(ref, data, { merge: true });
}
