# Lumiére Salon Booking MVP

A minimalist, design-forward booking experience built with Next.js, Firebase, Tailwind CSS, and Resend.

## 🚀 Setup
1. `cp .env.example .env.local`
2. Populate Firebase/Resend keys
3. `npm install && npm run dev`

Important: use `NEXT_PUBLIC_FIREBASE_API_KEY` (not `NEXT_PUBLIC_FIREBASE_zAPI_KEY`).

If you see missing chunk 404s like `/_next/static/chunks/... 404`, run:
- `npm run dev:clean`

### Run Owner + Customer on Separate Servers
- Customer app: `npm run dev:customer` (defaults to `http://localhost:3000`)
- Owner portal: `npm run dev:owner` (defaults to `http://localhost:3001`)

Each server uses a separate Next dist directory to avoid chunk corruption.  
If one frontend should call another server's API routes, set:
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:<api-port>`

## 🌐 Deployment
Vercel (frontend) + Firebase (backend)

### Fast Demo on Vercel (Beginner)
Use one deployment for customer + owner + API on free Hobby plan.

1. Push code to GitHub.
2. In this repo, verify env file before deploy:
   - `npm run demo:check`
3. Open `https://vercel.com/new` and import this repo.
4. In Vercel project settings -> Environment Variables, add all keys from `.env.local`.
5. Set these two values in Vercel:
   - `APP_VARIANT=all`
   - `NEXT_PUBLIC_APP_VARIANT=all`
6. Deploy.

Result:
- Main app + owner portal + `/api/*` endpoints on one URL.
- Example API URL: `https://<your-vercel-domain>/api/appointments`

### Vercel Env Vars (Important)
Firebase client keys are baked into the frontend at build time. In Vercel, add these env vars for the environments you deploy (Production, Preview, Development):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Portal routing mode:

- `APP_VARIANT` (`all` | `customer` | `owner`)
- `NEXT_PUBLIC_APP_VARIANT` (`all` | `customer` | `owner`)

Server-side API routes (appointments, Razorpay verification, emails) also need:

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RAZORPAY_KEY_SECRET` (and `NEXT_PUBLIC_RAZORPAY_KEY_ID` if using Razorpay checkout)

After changing env vars on Vercel, trigger a redeploy so the build picks them up.

### Deploy Both Portals on Vercel (Two Projects)
Use the same Git repo for both projects and change only portal env vars.

1. Create project `salon-customer` in Vercel from this repo.
2. Set env vars for `salon-customer`:
   - all common Firebase/Admin/Resend/Razorpay vars listed above
   - `APP_VARIANT=customer`
   - `NEXT_PUBLIC_APP_VARIANT=customer`
   - `NEXT_PUBLIC_APP_URL=https://<your-customer-domain>`
3. Create project `salon-owner` in Vercel from this repo.
4. Set env vars for `salon-owner`:
   - all common Firebase/Admin/Resend/Razorpay vars listed above
   - `APP_VARIANT=owner`
   - `NEXT_PUBLIC_APP_VARIANT=owner`
   - `NEXT_PUBLIC_APP_URL=https://<your-owner-domain>`
5. (Optional) If either frontend should use API from the other domain:
   - set `NEXT_PUBLIC_API_BASE_URL=https://<api-domain>`
6. Add domains:
   - customer domain -> `salon-customer`
   - owner domain -> `salon-owner`

Expected behavior:

- customer deployment blocks `/owner/*`
- owner deployment redirects `/` to `/owner/portal` and blocks customer routes
- both deployments still serve `/api/*` routes

### Firebase Hosting (Next.js Preview)
This repo uses Firebase Hosting “frameworks” (Next.js SSR). It requires the **Cloud Functions API** to be enabled for your Firebase project.

If you see:
`Error: Failed to list functions for thisai-salon`

Enable Cloud Functions API in Google Cloud Console, then deploy again:

- Enable: `cloudfunctions.googleapis.com` for project `thisai-salon`
- Deploy: `firebase deploy --only hosting:thisai-salon-c783a --project thisai-salon`

### Firebase Deploy Both Portals
Deploy customer + owner as two Firebase Hosting sites:

1. Re-auth Firebase CLI:
   - `firebase login --reauth --no-localhost`
2. Run:
   - `npm run deploy:firebase:both`

Default URLs:
- Customer: `https://thisai-salon-c783a.web.app`
- Owner: `https://thisai-salon-owner.web.app`

If you use different site IDs, set before deploy:
- `FIREBASE_CUSTOMER_SITE=<your-customer-site-id>`
- `FIREBASE_OWNER_SITE=<your-owner-site-id>`

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
