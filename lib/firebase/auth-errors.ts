import type { FirebaseError } from 'firebase/app';

function isFirebaseError(error: unknown): error is FirebaseError {
  return Boolean(error) && typeof error === 'object' && 'code' in (error as Record<string, unknown>);
}

export function getAuthErrorMessage(error: unknown) {
  const fallback = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
  if (!isFirebaseError(error)) return fallback;

  switch (error.code) {
    case 'auth/invalid-api-key':
      return 'Invalid Firebase API key. Check NEXT_PUBLIC_FIREBASE_API_KEY in your environment variables.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is disabled. In Firebase Console → Authentication → Sign-in method, enable Email/Password.';
    case 'auth/user-not-found':
      return 'No account found for this email. Try signing up first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'This email is already in use. Try logging in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return fallback;
  }
}

