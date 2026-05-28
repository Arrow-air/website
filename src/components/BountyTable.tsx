import React, { useState } from 'react';

type BountyStatus = 'OPEN' | 'CLAIMED' | 'EXPIRED' | 'CLOSED';

export type SkillTag =
  | 'CAD'
  | 'FEA'
  | 'CFD'
  | 'Python'
  | 'TypeScript'
  | 'Rust'
  | 'Electronics'
  | 'Software'
  | 'DevOps'
  | 'Writing'
  | 'Documentation'
  | 'Translation'
  | 'Design'
  | 'Media'
  | 'Video'
  | 'Governance'
  | 'Research'
  | 'Testing';

export type BountyRow = {
  title: string;
  description: string;
  status: BountyStatus;
  usdc?: string;
  arrow?: string;
  expires?: string;
  expectedWindow?: string;
  skills?: SkillTag[];
  posted?: string;
  issueUrl?: string;
  applyUrl?: string;
  detailUrl?: string;
  /** @deprecated Use issueUrl instead. */
  outline?: string;
  /** @deprecated Use applyUrl instead. */
  apply?: string;
  image?: string;
};

const PILL_BASE: React.CSSProperties = {
  fontFamily: "'Neue Haas Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontSize: '11px',
  letterSpacing: '0.02em',
  borderRadius: '0',
  whiteSpace: 'nowrap',
  display: 'block',
  textAlign: 'center',
};

function formatExpires(input: string): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function getReadMoreUrl(row: BountyRow): string | undefined {
  return row.detailUrl ?? row.issueUrl ?? row.outline;
}

function getIssueUrl(row: BountyRow): string | undefined {
  return row.issueUrl ?? row.outline;
}

function getApplyUrl(row: BountyRow): string | undefined {
  return row.applyUrl ?? row.apply;
}

function getTimingLabel(row: BountyRow): string | undefined {
  if (row.expires) return `Expires ${formatExpires(row.expires)}`;
  if (row.expectedWindow) return row.expectedWindow;
  return undefined;
}

function PhotoPlaceholder({ size = 72 }: { size?: number }) {
  const scale = size / 72;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <rect width="72" height="72" rx={0} fill="var(--ifm-color-emphasis-200, #e5e7eb)" stroke="var(--ifm-color-emphasis-400, #9ca3af)" strokeWidth={1 / scale} />
      <circle cx="36" cy="31" r="9" stroke="var(--ifm-color-emphasis-600, #6b7280)" strokeWidth={1.5 / scale} fill="none" />
      <path
        d="M18 50c0-3 2-6 6-7l4-1.5a14 14 0 0 0 16 0L48 43c4 1 6 4 6 7"
        stroke="var(--ifm-color-emphasis-600, #6b7280)"
        strokeWidth={1.5 / scale}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BountyTable({ rows, hideClaimedToggle = false }: { rows: BountyRow[], hideClaimedToggle?: boolean }) {
  const [hideClaimed, setHideClaimed] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const visibleRows = hideClaimed ? rows.filter(r => r.status !== 'CLAIMED') : rows;

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '640px', tableLayout: 'fixed' }}>
          <colgroup>
            <col />
            <col style={{ width: '120px' }} />
            <col style={{ width: '120px' }} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">
                <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '5px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor"><path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="square" fill="none"/><path d="M16 3H21V8" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none"/><path d="M16 21H21V16" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none"/><path d="M3 8L3 3L8 3" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none"/><path d="M3 16L3 21L8 21" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none"/></g></svg>
                  BOUNTY DESCRIPTION
                </span>
              </th>
              <th scope="col" style={{ textAlign: 'center' }}>
                <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor"><path d="M3 7L3 5.19193L18 2H19V7" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none"/><path d="M22 12H17V16H22" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none"/><path d="M22 21L22 7L3 7L3 21L22 21Z" stroke="currentColor" strokeWidth="2" fill="none"/></g></svg>
                  REWARD
                </span>
              </th>
              <th scope="col" style={{ textAlign: 'center' }}>
                <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor"><path d="M10 12H20.9999H20.4999" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none"/><path d="M16.9999 16L20.9999 12L16.9999 8.00002" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none"/><path d="M20 1V6.75781L18 4.75781V3H6V21H18V19.2422L20 17.2422V23H4V1H20Z" fill="currentColor" stroke="none"/></g></svg>
                  LINKS
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => (
              <tr
                key={row.title}
                onMouseEnter={() => setHoveredRow(row.title)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  background: hoveredRow === row.title ? '#e2e8f0' : i % 2 === 1 ? 'var(--docs-bg-subtle, #f3f6f9)' : 'transparent',
                }}
              >
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {row.image
                      ? <span className="bt-img-wrapper" style={{ width: '56px', height: '56px', flexShrink: 0, display: 'block', background: 'var(--docs-bg-subtle, #e2e8f0)', padding: '2px', overflow: 'hidden', boxSizing: 'border-box', border: '1px solid var(--ifm-color-emphasis-400, #9ca3af)' }}>
                          <img src={row.image} alt={row.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </span>
                      : <PhotoPlaceholder size={56} />}
                    <span style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                      <span style={{ color: 'var(--docs-text-primary, #111827)', fontWeight: 500, fontSize: '15px' }}>{row.title}</span>
                      <span style={{ color: 'var(--docs-text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>
                        {(() => {
                          const MAX = 130;
                          const isLong = row.description.length > MAX;
                          const excerpt = isLong ? row.description.slice(0, MAX).trimEnd() : row.description;
                          const readMoreUrl = getReadMoreUrl(row);
                          const timing = getTimingLabel(row);
                          return <>{excerpt}{isLong && readMoreUrl && <>{' '}...<a href={readMoreUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'inherit' }}>read more</a></>}{timing && <> <span style={{ fontWeight: 500, color: 'var(--docs-text-primary, #374151)' }}>| {timing}</span></>}</>;
                        })()}
                      </span>
                    </span>
                  </span>
                </td>
                <td>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {row.usdc && (
                      <span className="bt-pill-usdc" style={{
                        ...PILL_BASE,
                        padding: '4px 6px',
                        border: '1px solid rgba(8,67,191,0.4)',
                        color: '#0843BF',
                        background: 'rgba(8,67,191,0.07)',
                        cursor: 'default',
                      }}>{row.usdc} USDC</span>
                    )}
                    {row.arrow && (
                      <span className="bt-pill-arrow" style={{
                        ...PILL_BASE,
                        padding: '4px 6px',
                        border: '1px solid rgba(8,67,191,0.4)',
                        color: '#0843BF',
                        background: 'rgba(8,67,191,0.07)',
                        cursor: 'default',
                      }}>{row.arrow} $ARROW</span>
                    )}
                    {!row.usdc && !row.arrow && '—'}
                  </span>
                </td>
                <td>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {row.status === 'CLAIMED' ? (
                      <span className="bt-pill-claimed" style={{
                        ...PILL_BASE,
                        padding: '4px 6px',
                        border: '1px solid #92400e',
                        color: '#ffffff',
                        background: '#b45309',
                        letterSpacing: '-0.28px',
                        cursor: 'default',
                      }}>Claimed</span>
                    ) : row.status === 'EXPIRED' ? (
                      <span className="bt-pill-expired" style={{
                        ...PILL_BASE,
                        padding: '4px 6px',
                        border: '1px solid rgba(107,114,128,0.45)',
                        color: 'var(--docs-text-secondary, #6b7280)',
                        background: 'rgba(107,114,128,0.12)',
                        letterSpacing: '-0.28px',
                        cursor: 'default',
                      }}>Expired</span>
                    ) : row.status === 'CLOSED' ? (
                      <span className="bt-pill-closed" style={{
                        ...PILL_BASE,
                        padding: '4px 6px',
                        border: '1px solid rgba(107,114,128,0.45)',
                        color: 'var(--docs-text-secondary, #6b7280)',
                        background: 'rgba(107,114,128,0.07)',
                        letterSpacing: '-0.28px',
                        cursor: 'default',
                      }}>Closed</span>
                    ) : getApplyUrl(row) && (
                      <a
                        href={getApplyUrl(row)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bt-pill-apply"
                        style={{
                          ...PILL_BASE,
                          padding: '4px 6px',
                          border: '1px solid #15803d',
                          color: '#ffffff',
                          background: '#16a34a',
                          textDecoration: 'none',
                          letterSpacing: '-0.28px',
                        }}
                      >Apply</a>
                    )}
                    {getIssueUrl(row) && (
                      <a
                        href={getIssueUrl(row)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          ...PILL_BASE,
                          padding: '4px 6px',
                          border: '1px solid rgba(107,114,128,0.35)',
                          color: 'var(--docs-text-secondary, #6b7280)',
                          background: 'rgba(107,114,128,0.07)',
                          textDecoration: 'none',
                          letterSpacing: '-0.28px',
                        }}
                      >GitHub</a>
                    )}
                    {!getIssueUrl(row) && !getApplyUrl(row) && '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hideClaimedToggle && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button
            onClick={() => setHideClaimed(v => !v)}
            style={{
              fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Arial, sans-serif",
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '0',
              border: '1px solid var(--ifm-color-emphasis-300, #d1d5db)',
              background: hideClaimed ? 'var(--ifm-color-emphasis-200, #e5e7eb)' : 'transparent',
              color: 'var(--ifm-color-emphasis-700, #374151)',
              cursor: 'pointer',
            }}
          >
            {hideClaimed ? 'Show all' : 'Hide claimed'}
          </button>
        </div>
      )}
    </div>
  );
}
