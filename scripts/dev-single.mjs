import { spawn } from 'node:child_process';
import net from 'node:net';

const port = Number(process.env.PORT || 3000);
const host = '127.0.0.1';

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
  console.error(
    `Port ${port} is already in use.\n` +
      `Stop the existing Next.js dev server before starting another one.\n` +
      `Running multiple servers in the same folder can corrupt .next and cause missing chunk 404s.`
  );
  process.exit(1);
}

const nextBin = process.platform === 'win32' ? 'node_modules/.bin/next.cmd' : 'node_modules/.bin/next';
const child = spawn(nextBin, ['dev', '-p', String(port)], { stdio: 'inherit' });

child.on('exit', (code) => process.exit(code ?? 0));
