import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

function git(cmd) { try { return execSync(cmd).toString().trim(); } catch { return 'unknown'; } }

const commit = git('git rev-parse --short HEAD');
const time = new Date().toISOString();

const outPath = resolve('src/lib/build-meta.ts');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  `// auto-generated at build\nexport const COMMIT_SHA='${commit}';\nexport const BUILD_TIME='${time}';\n`
);

console.log(`build-meta: ${commit} @ ${time}`);