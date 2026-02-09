import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Android APK wrapper (Capacitor)
 *
 * This app is a webview wrapper around the deployed web app.
 * Set `CAPACITOR_SERVER_URL` to your live URL (Vercel/Firebase Hosting) before building an APK.
 *
 * Example:
 *   CAPACITOR_SERVER_URL="https://your-app.vercel.app" npm run apk:debug
 */
const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.thisai.kissmesalon',
  appName: 'KissMe Salon',
  // Not used when `server.url` is set, but Capacitor requires a directory.
  webDir: 'public',
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: serverUrl.startsWith('http://')
        }
      }
    : {})
};

export default config;
