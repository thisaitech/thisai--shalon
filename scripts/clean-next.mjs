import { readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

// Workaround for "missing chunk" dev errors:
// If `.next` gets corrupted (often by multiple dev servers), remove it and restart.
const entries = readdirSync(process.cwd(), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.startsWith('.next'))
  .map((entry) => entry.name);

if (!entries.length) {
  console.log('ℹ️ No .next* directories found.');
} else {
  for (const dir of entries) {
    rmSync(join(process.cwd(), dir), { recursive: true, force: true });
  }
  console.log(`✅ Cleaned: ${entries.join(', ')}`);
}
