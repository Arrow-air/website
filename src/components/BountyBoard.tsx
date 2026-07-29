import React, { useMemo, useState } from 'react';
import disciplines from '@site/src/data/disciplines.json';
import bounties from '@site/src/data/bounties.generated.json';
import BountyTable, { BountyRow } from '@site/src/components/BountyTable';

type StatusFilter = 'ALL' | 'OPEN' | 'CLAIMED' | 'CLOSED' | 'EXPIRED';
type RewardFilter = 'ALL' | 'USDC' | 'ARROW';

/** camelCase a category name the same way scripts/sync-bounties.mjs does */
function camelCase(name: string): string {
  return name
    .replace(/[^A-Za-z0-9]+(.)/g, (_, ch: string) => ch.toUpperCase())
    .replace(/^[A-Z]/, ch => ch.toLowerCase());
}

const FONT = "'Neue Haas Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const CONTROL_STYLE: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: '13px',
  padding: '6px 8px',
  borderRadius: 0,
  border: '1px solid var(--ifm-color-emphasis-300, #d1d5db)',
  background: 'var(--ifm-background-color, #fff)',
  color: 'var(--docs-text-primary, #111827)',
};

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: '11px',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--docs-text-secondary, #6b7280)',
  display: 'block',
  marginBottom: '3px',
};

export default function BountyBoard() {
  const [category, setCategory] = useState<string>('ALL');
  const [discipline, setDiscipline] = useState<string>('ALL');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [reward, setReward] = useState<RewardFilter>('ALL');
  const [query, setQuery] = useState('');

  const rowFilter = (row: BountyRow): boolean => {
    if (status !== 'ALL' && row.status !== status) return false;
    if (reward === 'USDC' && !row.usdc) return false;
    if (reward === 'ARROW' && !row.arrow) return false;
    if (discipline !== 'ALL' && !(row.skills ?? []).includes(discipline)) return false;
    if (query.trim()) {
      const haystack = `${row.title} ${row.description} ${(row.skills ?? []).join(' ')}`.toLowerCase();
      if (!haystack.includes(query.trim().toLowerCase())) return false;
    }
    return true;
  };

  const sections = useMemo(() => {
    return disciplines.categories
      .filter(cat => category === 'ALL' || cat.name === category)
      .map(cat => {
        const rows = ((bounties as Record<string, BountyRow[]>)[camelCase(cat.name)] ?? []).filter(rowFilter);
        return { ...cat, rows };
      })
      .filter(section => section.rows.length > 0);
  }, [category, discipline, status, reward, query]);

  const totalShown = sections.reduce((n, s) => n + s.rows.length, 0);
  const totalAll = disciplines.categories.reduce(
    (n, cat) => n + (((bounties as Record<string, BountyRow[]>)[camelCase(cat.name)] ?? []).length),
    0,
  );
  const anyFilterActive =
    category !== 'ALL' || discipline !== 'ALL' || status !== 'ALL' || reward !== 'ALL' || query.trim() !== '';

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'flex-end',
          padding: '12px',
          border: '1px solid var(--ifm-color-emphasis-300, #d1d5db)',
          background: 'var(--docs-bg-subtle, #f3f6f9)',
          marginBottom: '20px',
        }}
      >
        <div>
          <span style={LABEL_STYLE}>Category</span>
          <select style={CONTROL_STYLE} value={category} onChange={e => { setCategory(e.target.value); setDiscipline('ALL'); }}>
            <option value="ALL">All categories</option>
            {disciplines.categories.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <span style={LABEL_STYLE}>Discipline</span>
          <select style={CONTROL_STYLE} value={discipline} onChange={e => setDiscipline(e.target.value)}>
            <option value="ALL">All disciplines</option>
            {disciplines.categories
              .filter(cat => category === 'ALL' || cat.name === category)
              .map(cat => (
                <optgroup key={cat.name} label={cat.name}>
                  {cat.disciplines.map(d => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </optgroup>
              ))}
          </select>
        </div>
        <div>
          <span style={LABEL_STYLE}>Status</span>
          <select style={CONTROL_STYLE} value={status} onChange={e => setStatus(e.target.value as StatusFilter)}>
            <option value="ALL">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="CLAIMED">Claimed</option>
            <option value="CLOSED">Completed</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
        <div>
          <span style={LABEL_STYLE}>Reward</span>
          <select style={CONTROL_STYLE} value={reward} onChange={e => setReward(e.target.value as RewardFilter)}>
            <option value="ALL">Any reward</option>
            <option value="USDC">USDC</option>
            <option value="ARROW">$ARROW</option>
          </select>
        </div>
        <div style={{ flexGrow: 1, minWidth: '160px' }}>
          <span style={LABEL_STYLE}>Search</span>
          <input
            style={{ ...CONTROL_STYLE, width: '100%', boxSizing: 'border-box' }}
            type="search"
            placeholder="Search bounties…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        {anyFilterActive && (
          <button
            onClick={() => { setCategory('ALL'); setDiscipline('ALL'); setStatus('ALL'); setReward('ALL'); setQuery(''); }}
            style={{
              ...CONTROL_STYLE,
              cursor: 'pointer',
              background: 'transparent',
              color: 'var(--docs-text-secondary, #6b7280)',
            }}
          >
            Clear ({totalShown}/{totalAll})
          </button>
        )}
      </div>

      {totalAll === 0 && (
        <p style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--docs-text-secondary)' }}>
          No bounties are live right now — fresh bounties are coming soon.
        </p>
      )}
      {totalAll > 0 && sections.length === 0 && (
        <p style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--docs-text-secondary)' }}>
          No bounties match the current filters.
        </p>
      )}

      {sections.map(section => (
        <section key={section.name} style={{ marginBottom: '32px' }}>
          <h2 style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
            <span
              aria-hidden="true"
              style={{
                width: '10px',
                height: '10px',
                background: section.color,
                display: 'inline-block',
                alignSelf: 'center',
                flexShrink: 0,
              }}
            />
            {section.name}
            <span style={{ fontFamily: FONT, fontSize: '13px', fontWeight: 400, color: 'var(--docs-text-secondary, #6b7280)' }}>
              {section.rows.length} {section.rows.length === 1 ? 'bounty' : 'bounties'}
            </span>
          </h2>
          <p style={{ color: 'var(--docs-text-secondary)', marginBottom: '12px' }}>{section.tagline}</p>
          <BountyTable hideClaimedToggle rows={section.rows} />
        </section>
      ))}
    </div>
  );
}
