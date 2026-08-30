import React, { useEffect, useState } from 'react';

const RAW_URL = 'https://raw.githubusercontent.com/Arrow-air/dao-aips/main/AIPs/AIP-007.md';
const AIP_URL = 'https://github.com/Arrow-air/dao-aips/blob/main/AIPs/AIP-007.md';

type Row = string[];

/** Pull the first markdown table out of AIP-007's Projects section. */
function parseProjectsTable(markdown: string): { header: Row; rows: Row[] } | null {
  const section = markdown.split(/^## Projects/m)[1];
  if (!section) return null;
  const lines = section
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|'));
  if (lines.length < 3) return null;
  const parse = (line: string): Row =>
    line
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((cell) => cell.trim());
  const header = parse(lines[0]);
  const rows = lines
    .slice(2) // skip the separator row
    .map(parse)
    .filter((row) => row.length === header.length);
  return rows.length > 0 ? { header, rows } : null;
}

function cell(text: string, key: number): JSX.Element {
  if (/^https?:\/\//.test(text)) {
    const label = text.replace(/^https?:\/\/(www\.)?github\.com\//, '');
    return (
      <td key={key}>
        <a href={text}>{label}</a>
      </td>
    );
  }
  return <td key={key}>{text}</td>;
}

/**
 * The binding projects list, read live from AIP-007 so this page can never
 * drift from the governance record. Renders nothing when unreachable — the
 * curated tables above carry the page on their own.
 */
export default function Aip007Projects(): JSX.Element | null {
  const [table, setTable] = useState<{ header: Row; rows: Row[] } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(RAW_URL, { signal: controller.signal })
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(String(res.status)))))
      .then((text) => {
        const parsed = parseProjectsTable(text);
        if (!parsed) throw new Error('no table');
        setTable(parsed);
      })
      .catch(() => setFailed(true));
    return () => controller.abort();
  }, []);

  if (failed) {
    return (
      <p>
        Couldn't reach GitHub just now — the binding list is always in{' '}
        <a href={AIP_URL}>AIP-007</a>.
      </p>
    );
  }

  if (!table) return <p>Loading the projects list from AIP-007…</p>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            {table.header.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i}>{row.map((c, j) => cell(c, j))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
