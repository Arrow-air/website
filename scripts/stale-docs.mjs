#!/usr/bin/env node
// Lists docs pages that haven't been touched in a while, oldest first, so
// stale content can be reviewed before it misleads anyone.
//
//   npm run stale-docs                 pages untouched for 6+ months
//   npm run stale-docs -- --months 3   use a different threshold
//   npm run stale-docs -- --json       machine-readable output
//
// "Touched" means the file's last commit, read in one pass over git history.
// Only tracked Markdown/MDX under docs/ is checked, so docs imported from
// project repos at build time are skipped. Draft pages are listed separately.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const monthsArg = args.indexOf('--months');
const months = monthsArg >= 0 ? Number(args[monthsArg + 1]) : 6;
const asJson = args.includes('--json');

if (!Number.isFinite(months) || months <= 0) {
  console.error('--months needs a positive number');
  process.exit(1);
}

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const tracked = new Set(
  git('ls-files', 'docs')
    .split('\n')
    .filter((f) => /\.mdx?$/.test(f)),
);

// Walk history newest first; the first date seen for a file is its last change.
const lastChanged = new Map();
let date = null;
for (const line of git('log', '--format=@%cs', '--name-only', '--', 'docs').split('\n')) {
  if (line.startsWith('@')) date = line.slice(1);
  else if (line && tracked.has(line) && !lastChanged.has(line)) lastChanged.set(line, date);
}

const cutoff = new Date();
cutoff.setMonth(cutoff.getMonth() - months);
const cutoffIso = cutoff.toISOString().slice(0, 10);

const isDraft = (file) => {
  const text = readFileSync(file, 'utf8');
  const fm = text.startsWith('---\n') ? text.slice(4, text.indexOf('\n---', 4)) : '';
  return /^draft:\s*true\s*$/m.test(fm);
};

const stale = [...lastChanged]
  .filter(([, d]) => d < cutoffIso)
  .map(([file, d]) => ({ file, lastChanged: d, draft: isDraft(file) }))
  .sort((a, b) => a.lastChanged.localeCompare(b.lastChanged) || a.file.localeCompare(b.file));

if (asJson) {
  console.log(JSON.stringify({ months, cutoff: cutoffIso, stale }, null, 2));
  process.exit(0);
}

const published = stale.filter((s) => !s.draft);
const drafts = stale.filter((s) => s.draft);

console.log(`Docs pages not changed since ${cutoffIso} (${months}+ months): ${published.length} published, ${drafts.length} draft\n`);
for (const s of published) console.log(`  ${s.lastChanged}  ${s.file}`);
if (drafts.length) {
  console.log('\nDrafts (not published):');
  for (const s of drafts) console.log(`  ${s.lastChanged}  ${s.file}`);
}
