import { spawn } from 'node:child_process';
import net from 'node:net';
import process from 'node:process';

const variantArg = process.argv[2] || process.env.APP_VARIANT || 'customer';
if (!['customer', 'owner'].includes(variantArg)) {
  console.error('Usage: node scripts/dev-split.mjs <customer|owner>');
  process.exit(1);
}

const defaultPort = variantArg === 'owner' ? 3001 : 3000;
const port = Number(process.env.PORT || defaultPort);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid PORT value: "${process.env.PORT}".`);
  process.exit(1);
}

const host = '127.0.0.1';
const distDir = process.env.NEXT_DIST_DIR || `.next-${variantArg}`;

function isPortInUse(p) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port: p });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
  });
}

if (await isPortInUse(port)) {
  console.error(`Port ${port} is already in use. Stop the existing server or choose another PORT.`);
  process.exit(1);
}

const nextBin = process.platform === 'win32' ? 'node_modules/.bin/next.cmd' : 'node_modules/.bin/next';
const env = {
  ...process.env,
  PORT: String(port),
  NEXT_DIST_DIR: distDir,
  APP_VARIANT: variantArg,
  NEXT_PUBLIC_APP_VARIANT: variantArg
};

if (!env.NEXT_PUBLIC_APP_URL) {
  env.NEXT_PUBLIC_APP_URL = `http://localhost:${port}`;
}

console.log(`[dev:${variantArg}] http://localhost:${port} (dist: ${distDir})`);

const child = spawn(nextBin, ['dev', '-p', String(port)], {
  stdio: 'inherit',
  env
});

child.on('exit', (code) => process.exit(code ?? 0));

