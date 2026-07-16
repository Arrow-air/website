/* Types and helpers shared by the flat map (index.tsx) and the globe view
  (Globe.tsx). Everything here is pure and SSR-safe. */

export type EntryType = 'contributor' | 'workspace' | 'manufacturer';

export interface Contributor {
  id: string;
  name: string;
  type?: EntryType; // absent = contributor
  country: string;
  city?: string;
  lat?: number;
  lng?: number;
  tz?: string;
  disciplines?: string[]; // required for contributors, optional otherwise
  blurb?: string;
  joined: string;
  discord?: string;
  github?: string;
  avatar?: string;
  demo?: boolean;
}

export const typeOf = (c: Contributor): EntryType => c.type ?? 'contributor';

/* Display nouns per entry type (cluster labels, table footer). */
export const TYPE_NOUN: Record<EntryType, [string, string]> = {
  contributor: ['contributor', 'contributors'],
  workspace: ['Arrow workspace', 'Arrow workspaces'],
  manufacturer: ['manufacturer', 'manufacturers'],
};

/* Branded title-case labels for the map key. */
export const LEGEND_LABEL: Record<EntryType, string> = {
  contributor: 'Arrow Contributors',
  workspace: 'Arrow Workspaces',
  manufacturer: 'Arrow Manufacturers',
};

/* Natural Earth 50m naming differs from what people will likely
  type/store for a few countries. */
export const COUNTRY_ALIASES: Record<string, string> = {
  'United States': 'United States of America',
  USA: 'United States of America',
  UK: 'United Kingdom',
  'Czech Republic': 'Czechia',
  Türkiye: 'Turkey',
};

/* Small deterministic hash → [0,1) floats, seeded by contributor id, so
  country-only scatter is stable across builds and SSR-safe. */
export function hashFloats(seedStr: string, n: number): number[] {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    h |= 0;
    out.push(((h >>> 0) % 100000) / 100000);
  }
  return out;
}

export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ≈ 2.39996

/* "City, Country — 3 contributors" / "4 contributors near Berlin, Germany" */
export function clusterLabel(members: Contributor[], type: EntryType): string {
  const places = Array.from(
    new Set(members.map(m => (m.city ? `${m.city}, ${m.country}` : m.country))),
  );
  const noun = TYPE_NOUN[type][members.length > 1 ? 1 : 0];
  return places.length === 1
    ? `${places[0]} — ${members.length} ${noun}`
    : `${members.length} ${noun} near ${places[0]}`;
}
