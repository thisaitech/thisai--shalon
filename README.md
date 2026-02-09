# Lumiére Salon Booking MVP

A minimalist, design-forward booking experience built with Next.js, Firebase, Tailwind CSS, and Resend.

## 🚀 Setup
1. `cp .env.example .env.local`
2. Populate Firebase/Resend keys
3. `npm install && npm run dev`

## 🌐 Deployment
Vercel (frontend) + Firebase (backend)

### Vercel Env Vars (Important)
Firebase client keys are baked into the frontend at build time. In Vercel, add these env vars for the environments you deploy (Production, Preview, Development):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Server-side API routes (appointments, Razorpay verification, emails) also need:

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RAZORPAY_KEY_SECRET` (and `NEXT_PUBLIC_RAZORPAY_KEY_ID` if using Razorpay checkout)

After changing env vars on Vercel, trigger a redeploy so the build picks them up.

### Firebase Hosting (Next.js Preview)
This repo uses Firebase Hosting “frameworks” (Next.js SSR). It requires the **Cloud Functions API** to be enabled for your Firebase project.

If you see:
`Error: Failed to list functions for thisai-salon`

Enable Cloud Functions API in Google Cloud Console, then deploy again:

- Enable: `cloudfunctions.googleapis.com` for project `thisai-salon`
- Deploy: `firebase deploy --only hosting:thisai-salon-c783a --project thisai-salon`

## 📱 Android APK (Capacitor)
This repo includes an Android wrapper under `android/`.

1. Install Android SDK (Android Studio) and ensure `~/Library/Android/sdk` exists.
2. Use Java 21 to build (Capacitor Android currently compiles with Java 21):
   - Example (macOS):
     - `export JAVA_HOME=/path/to/jdk-21/Contents/Home`
     - `export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk`
3. Optional (recommended): point the APK to your live site:
   - `export CAPACITOR_SERVER_URL=https://your-live-site.example`
4. Build:
   - `npm run apk:debug`

APK output:
- `android/app/build/outputs/apk/debug/app-debug.apk`

## 📌 MVP Validation
- [ ] Customer books appointment → email sent
- [ ] Salon owner sees booking in dashboard
- [ ] Time slot disappears after booking

## Notes
- Single timezone assumption for MVP.
- Reminder automation is Phase 2 (see `app/api/reminders/route.ts`).
- Firebase security rules are stubbed in `firestore.rules` (TODO for production).
# thisai--shalon
