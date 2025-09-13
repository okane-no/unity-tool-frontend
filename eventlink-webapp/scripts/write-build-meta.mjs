import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const tryGit = (cmd) => { try { return execSync(cmd).toString().trim(); } catch { return ''; } };

const envSha =
  (process.env.COMMIT_SHA || process.env.GITHUB_SHA || process.env.SOURCE_COMMIT || '').slice(0, 7);

const commit = envSha || tryGit('git rev-parse --short HEAD') || 'unknown';
const time   = process.env.BUILD_TIME || new Date().toISOString();

const outPath = resolve('src/lib/build-meta.ts');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  `// auto-generated at build
export const COMMIT_SHA='${commit}';
export const BUILD_TIME='${time}';
`
);

console.log(`build-meta: ${commit} @ ${time}`);