import { rmSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

// Workaround for "missing chunk" dev errors:
// If `.next` gets corrupted (often by multiple dev servers), remove it and restart.
rmSync(join(process.cwd(), '.next'), { recursive: true, force: true });
console.log('✅ Cleaned .next');

