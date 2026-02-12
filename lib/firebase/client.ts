import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const legacyApiKey = process.env.NEXT_PUBLIC_FIREBASE_zAPI_KEY || '';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || legacyApiKey || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
};

const envKeyMap: Record<keyof typeof firebaseConfig, string> = {
  apiKey: 'NEXT_PUBLIC_FIREBASE_API_KEY',
  authDomain: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  projectId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  storageBucket: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'NEXT_PUBLIC_FIREBASE_APP_ID'
};

const missingKeys = (Object.keys(firebaseConfig) as Array<keyof typeof firebaseConfig>)
  .filter((key) => !firebaseConfig[key])
  .map((key) => envKeyMap[key]);

export const isFirebaseConfigured = missingKeys.length === 0;

let app: ReturnType<typeof initializeApp> | null = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY && legacyApiKey) {
    console.warn(
      'Using deprecated env var NEXT_PUBLIC_FIREBASE_zAPI_KEY. Rename it to NEXT_PUBLIC_FIREBASE_API_KEY.'
    );
  }
} else if (typeof window !== 'undefined') {
  console.warn(
    `Firebase env vars missing: ${missingKeys.join(', ')}. ` +
      'Add them to your environment to enable auth and Firestore.'
  );
}

export const auth: Auth | null = app ? getAuth(app) : null;
export const db: Firestore | null = app ? getFirestore(app) : null;

export default app;
