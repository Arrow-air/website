#!/usr/bin/env node
// Generates src/components/DisciplineIcon.tsx — the 43 Nucleo Sharp icons the
// disciplines taxonomy references, extracted as inline SVG markup.
//
//   node scripts/gen-discipline-icons.mjs /path/to/project/with/nucleo-sharp
//
// Why extraction instead of a dependency: nucleo-sharp is license-gated at
// install time (NUCLEO_LICENSE_KEY), which would break `npm install` for every
// contributor and CI run of this public repo. Embedding the rendered icons in
// the built site is normal licensed use; redistributing the icon *library* is
// not — which is exactly why we vendor only the 43 markup snippets the
// taxonomy needs, not the package.
//
// Run from a machine that has a licensed nucleo-sharp install (e.g. the
// disciplines-ui app) after any taxonomy icon change.

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const HOST = process.argv[2];
if (!HOST) {
    console.error('Usage: node scripts/gen-discipline-icons.mjs <path-to-project-with-nucleo-sharp>');
    process.exit(1);
}

const hostRequire = createRequire(`${HOST}/package.json`);
const React = (await import(pathToFileURL(hostRequire.resolve('react')))).default;
const { renderToStaticMarkup } = await import(pathToFileURL(hostRequire.resolve('react-dom/server')));
const nucleo = await import(pathToFileURL(hostRequire.resolve('nucleo-sharp')));

const taxonomy = JSON.parse(readFileSync('src/data/disciplines.json', 'utf8'));
const iconNames = [...new Set(taxonomy.categories.flatMap(c => c.disciplines.map(d => d.icon)))].sort();

const pascal = k => 'Icon' + k.split('-').map(p => p[0].toUpperCase() + p.slice(1)).join('');

const entries = [];
for (const name of iconNames) {
    const Comp = nucleo[pascal(name)];
    if (!Comp) {
        console.error(`Missing icon export ${pascal(name)} for "${name}"`);
        process.exit(1);
    }
    const svg = renderToStaticMarkup(React.createElement(Comp, { size: 24 }));
    const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    entries.push(`  '${name}':\n    '${inner.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',`);
}

const out = `// GENERATED FILE — do not edit by hand.
// Regenerate with: node scripts/gen-discipline-icons.mjs <project-with-nucleo-sharp>
// Inline extracts of the Nucleo Sharp icons (nucleoapp.com, licensed) named by
// src/data/disciplines.json. 24px grid, 2px stroke, currentColor.

import React from 'react';

const ICONS: Record<string, string> = {
${entries.join('\n')}
};

export default function DisciplineIcon({
  name,
  size = 20,
  color,
  style,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}) {
  const inner = ICONS[name];
  if (!inner) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={color ? { color, ...style } : style}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}
`;

writeFileSync('src/components/DisciplineIcon.tsx', out);
console.log(`Wrote src/components/DisciplineIcon.tsx — ${iconNames.length} icons.`);
