import React from 'react';
import disciplines from '@site/src/data/disciplines.json';

const FONT = "'Neue Haas Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/**
 * Renders the canonical contributor disciplines taxonomy
 * (src/data/disciplines.json) as category cards with their disciplines.
 * Used by /docs/community/disciplines.
 */
export default function DisciplineGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
      {disciplines.categories.map(category => (
        <section
          key={category.name}
          style={{
            border: '1px solid var(--ifm-color-emphasis-300, #d1d5db)',
            borderTop: `3px solid ${category.color}`,
            padding: '14px 16px',
            background: 'var(--ifm-background-color, #fff)',
          }}
        >
          <h3 style={{ marginBottom: '2px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            {category.name}
          </h3>
          <p style={{ fontFamily: FONT, fontSize: '13px', color: 'var(--docs-text-secondary, #6b7280)', marginBottom: '22px' }}>
            {category.tagline}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {category.disciplines.map(d => (
              <div key={d.name} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: category.color,
                    background: hexToRgba(category.color, 0.08),
                    border: `1px solid ${hexToRgba(category.color, 0.35)}`,
                    padding: '2px 6px',
                    alignSelf: 'flex-start',
                  }}
                >
                  {d.name}
                </span>
                <span style={{ fontFamily: FONT, fontSize: '13px', color: 'var(--docs-text-secondary, #6b7280)', lineHeight: 1.45 }}>
                  {d.blurb}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
