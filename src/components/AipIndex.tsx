import React, { useEffect, useState } from 'react';

const REPO = 'Arrow-air/dao-aips';
const LIST_URL = `https://api.github.com/repos/${REPO}/contents/AIPs`;
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/main/AIPs`;
const BLOB_BASE = `https://github.com/${REPO}/blob/main/AIPs`;

type AipRow = {
  file: string;
  number: number;
  title: string;
  type: string;
  status: string;
  voteDate?: string;
  voteResult?: string;
};

/**
 * Snapshot of the repo as of August 2026, rendered until the live fetch
 * resolves and kept if it fails. The table is never empty.
 */
const FALLBACK: AipRow[] = [
  { file: 'AIP-001.md', number: 1, title: 'AIP Purpose and Guidelines', type: 'Operational', status: 'Living', voteDate: '2024-09-12', voteResult: 'Passed' },
  { file: 'AIP-002.md', number: 2, title: 'Creation of Grants and Bounties Committee', type: 'Operational', status: 'Final', voteDate: '2024-09-12', voteResult: 'Passed' },
  { file: 'AIP-003.md', number: 3, title: 'Create Membership List', type: 'Informational', status: 'Living', voteDate: '2024-09-12', voteResult: 'Passed' },
  { file: 'AIP-004.md', number: 4, title: 'Introduce Time Commitment Grant', type: 'Operational', status: 'Final', voteDate: '2024-09-26', voteResult: 'Passed' },
  { file: 'AIP-005.md', number: 5, title: 'Task, Bounty & Grant Submission', type: 'Operational', status: 'Final', voteDate: '2025-01-07', voteResult: 'Passed' },
  { file: 'AIP-006.md', number: 6, title: 'Create Projects Framework', type: 'Operational', status: 'Final', voteDate: '2025-02-21', voteResult: 'Passed' },
  { file: 'AIP-007.md', number: 7, title: 'Create Projects List', type: 'Informational', status: 'Living', voteDate: '2025-02-21', voteResult: 'Passed' },
  { file: 'AIP-008.md', number: 8, title: 'Mission and Broad Roadmap', type: 'Operational', status: 'Final', voteDate: '2025-04-22', voteResult: 'Passed' },
  { file: 'AIP-009.md', number: 9, title: 'Manufacturing Protocol Basic Design', type: 'Protocol', status: 'Final', voteDate: '2025-11-15', voteResult: 'Passed' },
  { file: 'AIP-010.md', number: 10, title: 'Tokenomics V1', type: 'Protocol', status: 'Final', voteDate: '2026-07-21', voteResult: 'Passed' },
];

/** Parse the YAML preamble of an AIP without a YAML library — the fields are
 *  all simple `key: value` scalars. */
function parseFrontmatter(markdown: string): Record<string, string> {
  const out: Record<string, string> = {};
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return out;
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    out[line.slice(0, idx).trim().toLowerCase()] = line.slice(idx + 1).trim();
  }
  return out;
}

function titleCase(value: string | undefined): string {
  if (!value) return '—';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

async function fetchLiveIndex(signal: AbortSignal): Promise<AipRow[]> {
  const listRes = await fetch(LIST_URL, { signal });
  if (!listRes.ok) throw new Error(`GitHub API ${listRes.status}`);
  const listing: Array<{ name: string }> = await listRes.json();
  const files = listing
    .map((entry) => entry.name)
    .filter((name) => /^AIP-\d+\.md$/i.test(name));

  const rows = await Promise.all(
    files.map(async (file): Promise<AipRow | null> => {
      const res = await fetch(`${RAW_BASE}/${file}`, { signal });
      if (!res.ok) return null;
      const fm = parseFrontmatter(await res.text());
      const number = parseInt(file.match(/\d+/)?.[0] ?? '', 10);
      if (!Number.isFinite(number)) return null;
      return {
        file,
        number,
        title: fm['title'] ?? file,
        type: titleCase(fm['type']),
        status: fm['status'] ?? '—',
        voteDate: fm['vote-date'],
        voteResult: fm['vote-result'],
      };
    }),
  );

  const clean = rows.filter((row): row is AipRow => row !== null);
  if (clean.length === 0) throw new Error('no AIPs parsed');
  return clean.sort((a, b) => a.number - b.number);
}

export default function AipIndex(): JSX.Element {
  const [rows, setRows] = useState<AipRow[]>(FALLBACK);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchLiveIndex(controller.signal)
      .then((liveRows) => {
        setRows(liveRows);
        setLive(true);
      })
      .catch(() => {
        /* keep the fallback snapshot */
      });
    return () => controller.abort();
  }, []);

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>AIP</th>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Vote</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.file}>
              <td>
                <a href={`${BLOB_BASE}/${row.file}`}>
                  AIP-{String(row.number).padStart(3, '0')}
                </a>
              </td>
              <td>{row.title}</td>
              <td>{row.type}</td>
              <td>{row.status}</td>
              <td>
                {row.voteResult ?? '—'}
                {row.voteDate ? ` · ${row.voteDate}` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        <em>
          {live
            ? 'Listed live from the dao-aips repository.'
            : 'Snapshot as of August 2026 — the live list is a refresh away if GitHub was unreachable.'}
        </em>
      </p>
    </>
  );
}
