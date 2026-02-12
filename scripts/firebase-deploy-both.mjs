import { spawnSync } from 'node:child_process';
import process from 'node:process';

const project = process.env.FIREBASE_PROJECT || 'thisai-salon';
const customerTarget = process.env.FIREBASE_CUSTOMER_TARGET || 'customer';
const ownerTarget = process.env.FIREBASE_OWNER_TARGET || 'owner';
const customerSite = process.env.FIREBASE_CUSTOMER_SITE || 'thisai-salon-c783a';
const ownerSite = process.env.FIREBASE_OWNER_SITE || `${project}-owner`;
const region = process.env.FIREBASE_REGION || 'us-central1';

function execFirebase(args, envOverrides = {}) {
  const result = spawnSync('firebase', args, {
    env: {
      ...process.env,
      ...envOverrides
    },
    encoding: 'utf8'
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  return result;
}

function runOrThrow(step, args, envOverrides = {}) {
  process.stdout.write(`\n==> ${step}\n`);
  const result = execFirebase(args, envOverrides);
  if (result.status !== 0) {
    throw new Error(`Failed step: ${step}`);
  }
}

function ensureSite(site) {
  process.stdout.write(`\n==> Ensure hosting site "${site}"\n`);
  const result = execFirebase(['hosting:sites:create', site, '--project', project]);
  if (result.status === 0) return;

  const output = `${result.stdout || ''}\n${result.stderr || ''}`.toLowerCase();
  if (output.includes('already exists')) {
    process.stdout.write(`Site "${site}" already exists.\n`);
    return;
  }
  throw new Error(`Unable to create site "${site}".`);
}

function applyTarget(target, site) {
  runOrThrow(
    `Map target "${target}" -> site "${site}"`,
    ['target:apply', 'hosting', target, site, '--project', project]
  );
}

try {
  process.stdout.write(
    `Deploying Firebase portals for project "${project}" (region: ${region})...\n`
  );

  ensureSite(customerSite);
  ensureSite(ownerSite);

  applyTarget(customerTarget, customerSite);
  applyTarget(ownerTarget, ownerSite);

  runOrThrow(
    'Deploy customer portal',
    ['deploy', '--only', `hosting:${customerTarget}`, '--project', project],
    {
      APP_VARIANT: 'customer',
      NEXT_PUBLIC_APP_VARIANT: 'customer',
      NEXT_PUBLIC_APP_URL: `https://${customerSite}.web.app`
    }
  );

  runOrThrow(
    'Deploy owner portal',
    ['deploy', '--only', `hosting:${ownerTarget}`, '--project', project],
    {
      APP_VARIANT: 'owner',
      NEXT_PUBLIC_APP_VARIANT: 'owner',
      NEXT_PUBLIC_APP_URL: `https://${ownerSite}.web.app`
    }
  );

  process.stdout.write('\nDeploy complete.\n');
  process.stdout.write(`Customer URL: https://${customerSite}.web.app\n`);
  process.stdout.write(`Owner URL: https://${ownerSite}.web.app\n`);
} catch (error) {
  const message =
    error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : String(error);
  process.stderr.write(`\n${message}\n`);
  process.exit(1);
}
