// Zero-dependency "lint": syntax-checks every JS file with `node --check` and
// flags leftover debugger statements. (Swap for ESLint via `npx eslint .` if wanted.)
import { readdir, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dirs = ['src', 'test', 'scripts', 'public'];
let failures = 0;
let count = 0;

for (const dir of dirs) {
  const entries = await readdir(path.join(root, dir), { recursive: true, withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !/\.(c|m)?js$/.test(entry.name)) continue;
    const file = path.join(entry.parentPath, entry.name);
    count += 1;
    try {
      execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    } catch (err) {
      failures += 1;
      console.error(`x ${path.relative(root, file)}\n${err.stderr}`);
    }
    if (/^\s*debugger;?\s*$/m.test(await readFile(file, 'utf8'))) {
      failures += 1;
      console.error(`x ${path.relative(root, file)}: debugger statement`);
    }
  }
}
console.log(failures ? `${failures} problem(s) in ${count} files` : `lint ok: ${count} files`);
process.exitCode = failures ? 1 : 0;
