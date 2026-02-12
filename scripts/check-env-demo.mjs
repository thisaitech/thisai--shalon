import fs from 'node:fs';
import path from 'node:path';

const envPath = path.join(process.cwd(), '.env.local');

function parseEnv(content) {
  const map = new Map();
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const rawValue = trimmed.slice(idx + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, '');
    map.set(key, value);
  }
  return map;
}

const requiredForDemo = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY'
];

const recommended = [
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'NEXT_PUBLIC_RAZORPAY_KEY_ID',
  'NEXT_PUBLIC_SALON_UPI_ID',
  'NEXT_PUBLIC_APP_URL',
  'APP_VARIANT',
  'NEXT_PUBLIC_APP_VARIANT'
];

if (!fs.existsSync(envPath)) {
  console.error('Missing .env.local file in project root.');
  process.exit(1);
}

const env = parseEnv(fs.readFileSync(envPath, 'utf8'));
const missingRequired = requiredForDemo.filter((key) => !(env.get(key) || '').trim());
const missingRecommended = recommended.filter((key) => !(env.get(key) || '').trim());

if (missingRequired.length) {
  console.error('Missing required demo env vars:');
  for (const key of missingRequired) {
    console.error(`- ${key}`);
  }
  console.error('\nDeploy is likely to fail or key app flows will break.');
  process.exit(1);
}

console.log('Required env vars are present for demo deploy.');
if (missingRecommended.length) {
  console.log('\nOptional/recommended vars not set:');
  for (const key of missingRecommended) {
    console.log(`- ${key}`);
  }
}

console.log('\nSuggested Vercel mode:');
console.log('- APP_VARIANT=all');
console.log('- NEXT_PUBLIC_APP_VARIANT=all');
