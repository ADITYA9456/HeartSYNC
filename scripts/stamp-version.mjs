// Stamps a unique build id into lib/version.json before `next build`.
// The client bundle and /api/version both read it, so a deployed build that
// differs from what a user is running triggers the "Update available" prompt.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const version =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ||
  process.env.BUILD_ID ||
  Date.now().toString(36);

const file = fileURLToPath(new URL('../lib/version.json', import.meta.url));
writeFileSync(file, JSON.stringify({ version }, null, 2) + '\n');
console.log(`[version] ${version}`);
