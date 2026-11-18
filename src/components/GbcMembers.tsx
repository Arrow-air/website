import React, { useEffect, useState } from 'react';

// Current Grants & Bounties Committee members, read live from AIP-003, the
// Living AIP that records committee membership. Uses the same approach as
// the AIP index: render a snapshot, replace it once GitHub answers.

const AIP_URL = 'https://raw.githubusercontent.com/Arrow-air/dao-aips/main/AIPs/AIP-003.md';
const AIP_LINK = 'https://github.com/Arrow-air/dao-aips/blob/main/AIPs/AIP-003.md';

/** Snapshot of AIP-003 as of September 2026, kept if the fetch fails. */
const FALLBACK = ['Alperenag', 'Errrks', 'Sleety', 'Thomasg', 'WhiteDadJokes'];

/** Pull the member names out of the GBC "Current Membership" table,
 *  ignoring commented-out placeholder rows. */
export function parseGbcMembers(markdown: string): string[] {
  const text = markdown.replace(/<!--[\s\S]*?-->/g, '');
  const section = text.split(/^## Grants and Bounties Committee\s*$/m)[1];
  if (!section) return [];
  const current = section.split(/^### Current Membership\s*$/m)[1];
  if (!current) return [];
  const rows = current.split(/^#{2,3} /m)[0].split('\n').filter((l) => l.trim().startsWith('|'));
  if (rows.length < 3) return [];
  const cells = (row: string) => row.split('|').slice(1, -1).map((c) => c.trim());
  const header = cells(rows[0]);
  const col = header.findIndex((h) => /^members?$/i.test(h));
  if (col === -1) return [];
  return rows.slice(2).map((r) => cells(r)[col]).filter(Boolean);
}

export default function GbcMembers(): React.JSX.Element {
  const [members, setMembers] = useState<string[]>(FALLBACK);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(AIP_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub ${res.status}`);
        return res.text();
      })
      .then((markdown) => {
        const parsed = parseGbcMembers(markdown);
        if (parsed.length === 0) throw new Error('no members parsed');
        setMembers(parsed);
        setLive(true);
      })
      .catch(() => {
        /* keep the snapshot */
      });
    return () => controller.abort();
  }, []);

  return (
    <>
      <table>
        <thead>
          <tr><th>Member</th></tr>
        </thead>
        <tbody>
          {members.map((m) => <tr key={m}><td>{m}</td></tr>)}
        </tbody>
      </table>
      <p>
        <em>
          {live
            ? <>Listed live from <a href={AIP_LINK}>AIP-003</a>.</>
            : <>Snapshot of <a href={AIP_LINK}>AIP-003</a> as of September 2026.</>}
        </em>
      </p>
    </>
  );
}
