#!/usr/bin/env node
// Drafts a changelog entry from the PRs merged since the newest entry in
// docs/changelog.mdx. Prints markdown to stdout for a human to edit and
// paste in — it never writes to the changelog itself.
//
// Usage: npm run changelog-draft            (PRs since the last entry)
//        npm run changelog-draft -- 2026-08-01   (PRs since an explicit date)
//
// Requires the GitHub CLI (`gh`) to be installed and authenticated.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const CHANGELOG_PATH = 'docs/changelog.mdx';
const REPO = 'Arrow-air/website';
const BOT_AUTHORS = new Set(['app/dependabot', 'app/github-actions', 'app/arrow-contributor-map-bot']);

const MONTHS = new Map([
    ['January', 0], ['February', 1], ['March', 2], ['April', 3],
    ['May', 4], ['June', 5], ['July', 6], ['August', 7],
    ['September', 8], ['October', 9], ['November', 10], ['December', 11],
]);

function lastEntryDate(markdown) {
    // Entry headings look like "## August 4, 2026" or "## July 17 to 22, 2026".
    for (const line of markdown.split('\n')) {
        const match = line.match(/^## ([A-Z][a-z]+) \d+(?: to (\d+))?, (\d{4})$/);
        if (!match) continue;
        const day = match[2] ?? line.match(/^## [A-Z][a-z]+ (\d+)/)[1];
        return new Date(Date.UTC(Number(match[3]), MONTHS.get(match[1]), Number(day)));
    }
    return null;
}

function mergedPRsSince(sinceISO) {
    const raw = execFileSync('gh', [
        'pr', 'list', '--repo', REPO, '--state', 'merged', '--limit', '200',
        '--json', 'number,title,author,mergedAt,url',
    ], { encoding: 'utf8' });
    return JSON.parse(raw)
        .filter((pr) => pr.mergedAt > sinceISO)
        .filter((pr) => !BOT_AUTHORS.has(pr.author.login))
        .sort((a, b) => a.mergedAt.localeCompare(b.mergedAt));
}

function bucketFor(title) {
    const lowered = title.toLowerCase();
    if (/^(feat|add)/.test(lowered)) return 'New';
    if (/^docs/.test(lowered)) return 'Docs';
    return 'Updated';
}

function cleanTitle(title) {
    return title.replace(/^(feat|fix|docs|chore|style|ui|ci|refactor)(\([^)]*\))?[:!]\s*/i, '').trim();
}

const argDate = process.argv[2] ? new Date(process.argv[2]) : null;
const since = argDate ?? lastEntryDate(readFileSync(CHANGELOG_PATH, 'utf8'));
if (!since || Number.isNaN(since.getTime())) {
    console.error('Could not determine a since-date. Pass one explicitly: npm run changelog-draft -- YYYY-MM-DD');
    process.exit(1);
}
// Start the day after the last entry so its own PRs aren't re-listed.
const sinceISO = new Date(since.getTime() + 24 * 60 * 60 * 1000).toISOString();

const prs = mergedPRsSince(sinceISO);
if (prs.length === 0) {
    console.error(`No non-bot PRs merged since ${sinceISO.slice(0, 10)}. Nothing to draft.`);
    process.exit(0);
}

const today = new Date();
const monthName = [...MONTHS.keys()][today.getUTCMonth()];
const buckets = new Map([['New', []], ['Docs', []], ['Updated', []]]);
for (const pr of prs) {
    buckets.get(bucketFor(pr.title)).push(pr);
}

const lines = [];
lines.push(`## ${monthName} ${today.getUTCDate()}, ${today.getUTCFullYear()}`);
lines.push('');
lines.push(`_Draft generated from ${prs.length} merged PRs since ${sinceISO.slice(0, 10)}. Rewrite the intro, merge related items, and drop anything not visible to readers._`);
lines.push('');
for (const [label, items] of buckets) {
    if (items.length === 0) continue;
    lines.push(`**${label}**`);
    for (const pr of items) {
        lines.push(`- ${cleanTitle(pr.title)} ([#${pr.number}](${pr.url}))`);
    }
    lines.push('');
}
lines.push('---');
console.log(lines.join('\n'));
