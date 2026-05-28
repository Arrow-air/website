#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const CONFIG_PATH = 'bounty-sources.yml';
const OUTPUT_PATH = 'src/data/bounties.generated.json';

const CATEGORY_KEYS = new Map([
  ['Engineering', 'engineering'],
  ['Software', 'software'],
  ['Growth & Media', 'growthMedia'],
  ['General DAO', 'generalDao'],
]);

function parseConfig(raw) {
  const repos = [];
  const labels = { bounty: 'bounty', completed: 'bounty:completed', cancelled: 'bounty:cancelled' };
  let section = null;

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (trimmed === 'repos:') {
      section = 'repos';
      continue;
    }
    if (trimmed === 'labels:') {
      section = 'labels';
      continue;
    }
    if (section === 'repos' && trimmed.startsWith('- ')) {
      repos.push(trimmed.slice(2).trim());
      continue;
    }
    if (section === 'labels') {
      const match = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.+)$/);
      if (match) labels[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  }

  if (!repos.length) throw new Error(`${CONFIG_PATH} must list at least one repo`);
  return { repos, labels };
}

function gh(args) {
  return execFileSync('gh', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, GH_TOKEN: process.env.GH_TOKEN || process.env.GITHUB_TOKEN },
  });
}

function listBountyIssues(repo, label) {
  const json = gh([
    'issue', 'list',
    '--repo', repo,
    '--state', 'all',
    '--label', label,
    '--limit', '200',
    '--json', 'number,title,body,url,state,assignees,labels,createdAt,closedAt',
  ]);
  return JSON.parse(json);
}

function parseSections(body) {
  const sections = new Map();
  const headingRe = /^###\s+(.+?)\s*$/gm;
  const headings = [...body.matchAll(headingRe)];

  for (let i = 0; i < headings.length; i += 1) {
    const heading = headings[i];
    const label = normalizeLabel(heading[1]);
    const start = heading.index + heading[0].length;
    const end = i + 1 < headings.length ? headings[i + 1].index : body.length;
    const value = body.slice(start, end).trim();
    sections.set(label, value);
  }

  return sections;
}

function normalizeLabel(label) {
  return label
    .toLowerCase()
    .replace(/\s*\/\s*/g, ' ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function firstSection(sections, labels) {
  for (const label of labels) {
    const value = sections.get(normalizeLabel(label));
    if (value && !/^_?no response_?$/i.test(value)) return value;
  }
  return undefined;
}

function parseSkills(value) {
  if (!value) return undefined;
  const checked = [...value.matchAll(/^- \[[xX]\]\s+(.+)$/gm)].map(match => match[1].trim());
  if (checked.length) return checked;
  const csv = value.split(',').map(part => part.trim()).filter(Boolean);
  return csv.length ? csv : undefined;
}

function formatUsdc(value) {
  if (!value) return undefined;
  const cleaned = value.replace(/\bUSDC\b/gi, '').trim();
  if (!cleaned) return undefined;
  return cleaned.startsWith('$') ? cleaned : `$${cleaned}`;
}

function formatArrow(value) {
  if (!value) return undefined;
  const cleaned = value.replace(/\$?ARROW\b/gi, '').trim();
  if (!cleaned) return undefined;
  const numeric = Number(cleaned.replace(/,/g, ''));
  return Number.isFinite(numeric) ? numeric.toLocaleString('en-US') : cleaned;
}

function isPastExpiry(expires) {
  if (!expires) return false;
  const time = Date.parse(expires);
  if (Number.isNaN(time)) return false;
  return time < Date.now();
}

function deriveStatus(issue, expires) {
  if (issue.state === 'CLOSED') return 'CLOSED';
  if (issue.assignees?.length) return 'CLAIMED';
  if (isPastExpiry(expires)) return 'EXPIRED';
  return 'OPEN';
}

function normalizeDate(value) {
  if (!value) return undefined;
  const time = Date.parse(value);
  if (Number.isNaN(time)) return value;
  return new Date(time).toISOString().slice(0, 10);
}

function issueToBounty(repo, issue, labels) {
  const sections = parseSections(issue.body || '');
  const category = firstSection(sections, ['Category']);
  const key = CATEGORY_KEYS.get(category);

  if (!key) {
    throw new Error(`${repo}#${issue.number}: missing or invalid Category (${category || 'blank'})`);
  }

  const usdc = formatUsdc(firstSection(sections, ['USDC reward, optional', 'USDC reward']));
  const arrow = formatArrow(firstSection(sections, ['ARROW reward, optional', 'ARROW reward']));
  if (!usdc && !arrow) throw new Error(`${repo}#${issue.number}: expected USDC reward and/or ARROW reward`);

  const description = firstSection(sections, ['Short bounty board description']);
  if (!description) throw new Error(`${repo}#${issue.number}: missing Short bounty board description`);

  const expires = normalizeDate(firstSection(sections, ['Expiry date, optional', 'Expiry date']));
  const status = deriveStatus(issue, expires);
  const applyUrl = status === 'OPEN' ? issue.url : undefined;

  const bounty = {
    title: issue.title.replace(/^\[Bounty\]:\s*/i, '').trim(),
    description,
    status,
    ...(usdc ? { usdc } : {}),
    ...(arrow ? { arrow } : {}),
    posted: issue.createdAt,
    ...(expires ? { expires } : {}),
    ...(firstSection(sections, ['Expected completion window']) ? { expectedWindow: firstSection(sections, ['Expected completion window']) } : {}),
    ...(parseSkills(firstSection(sections, ['Skills / tags', 'Skills/tags'])) ? { skills: parseSkills(firstSection(sections, ['Skills / tags', 'Skills/tags'])) } : {}),
    ...(firstSection(sections, ['Thumbnail image URL, optional', 'Thumbnail / image URL']) ? { image: firstSection(sections, ['Thumbnail image URL, optional', 'Thumbnail / image URL']) } : {}),
    issueUrl: issue.url,
    ...(applyUrl ? { applyUrl } : {}),
  };

  return { key, bounty };
}

function validateBounty(bounty, source) {
  const errors = [];
  if (!bounty.title) errors.push('title is required');
  if (!bounty.description) errors.push('description is required');
  if (!['OPEN', 'CLAIMED', 'EXPIRED', 'CLOSED'].includes(bounty.status)) errors.push(`invalid status ${bounty.status}`);
  if (!bounty.usdc && !bounty.arrow) errors.push('at least one reward is required');
  if (!bounty.issueUrl) errors.push('issueUrl is required');
  if (errors.length) throw new Error(`${source}: ${errors.join('; ')}`);
}

function main() {
  const config = parseConfig(readFileSync(CONFIG_PATH, 'utf8'));
  const data = { engineering: [], software: [], growthMedia: [], generalDao: [] };
  const failures = [];

  for (const repo of config.repos) {
    let issues;
    try {
      issues = listBountyIssues(repo, config.labels.bounty);
    } catch (error) {
      failures.push(`${repo}: failed to query issues: ${error.message}`);
      continue;
    }

    for (const issue of issues) {
      try {
        const { key, bounty } = issueToBounty(repo, issue, config.labels);
        validateBounty(bounty, `${repo}#${issue.number}`);
        data[key].push(bounty);
      } catch (error) {
        failures.push(error.message);
      }
    }
  }

  for (const rows of Object.values(data)) {
    rows.sort((a, b) => String(b.posted || '').localeCompare(String(a.posted || '')));
  }

  writeFileSync(OUTPUT_PATH, `${JSON.stringify(data, null, 2)}\n`);

  for (const failure of failures) {
    console.error(`::warning::${failure}`);
  }

  if (failures.length) {
    console.error(`Completed with ${failures.length} issue warning(s).`);
  }
}

main();
