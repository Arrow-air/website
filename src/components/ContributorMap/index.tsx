import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import contributorsFile from '@site/src/data/contributors.json';
import geometry from '@site/src/data/world-map-geometry.json';
import {projectLngLat} from './projection';
import Globe, {GlobeHandle} from './Globe';
import {
  Contributor,
  COUNTRY_ALIASES,
  DISCIPLINE_COLOR,
  EntryType,
  GOLDEN_ANGLE,
  LEGEND_LABEL,
  TYPE_NOUN,
  clusterLabel,
  hashFloats,
  typeOf,
} from './common';
import 'flag-icons/css/flag-icons.min.css';
import styles from './styles.module.css';

/* Contributor map + list panel for /docs/community/contributor-map.
  Spec: https://github.com/Arrow-air/website/issues/180

  SSR notes: everything rendered here is a pure function of the two JSON
  files (deterministic scatter is seeded, never random), so the component
  server-renders and hydrates cleanly. The one client-only value — the live
  local-time clock — starts as a placeholder and is filled in by an effect
  after mount. Do not wrap this component in <BrowserOnly>. */

const MAP_W: number = geometry.width;
const MAP_H: number = geometry.height;
/* Extra viewBox height above/below the projected map (960×500 is a wide
  letterbox; the panel reads better taller). The pan clamp + pointer math
  account for it. */
const PAD_Y = 90;
const VIEW_H = MAP_H + 2 * PAD_Y;
const MAX_ZOOM = 12;
const CLUSTER_PX = 18;

interface Placed extends Contributor {
  x: number;
  y: number;
  approx: boolean; // country-only => approximate position
}

interface Cluster {
  key: string;
  x: number; // base (unzoomed) map coords of the anchor location
  y: number;
  ox: number; // screen-px offset, separates same-place clusters of
  oy: number; // different types (they never merge)
  members: Placed[];
  approx: boolean; // true when every member is country-only
  type: EntryType;
  label: string;
}

interface Transform {
  k: number;
  x: number;
  y: number;
}

function centroidFor(country: string): [number, number] | undefined {
  const centroids = geometry.centroids as unknown as Record<
    string,
    [number, number]
  >;
  return centroids[country] ?? centroids[COUNTRY_ALIASES[country] ?? ''];
}

/* Country-only entries render as regular dots scattered around the country
  centroid. Placement is a golden-angle spiral over the country's entries
  (sorted by id, so it is deterministic across builds and SSR-safe) — spiral
  spacing guarantees co-country dots do not overlap, and a per-country
  id-hashed base angle keeps different countries from sharing a pattern. */
function placeContributors(list: Contributor[]): Placed[] {
  const placed: Placed[] = [];
  const countryOnly = new Map<string, Contributor[]>();
  for (const c of list) {
    if (typeof c.lat === 'number' && typeof c.lng === 'number') {
      const [x, y] = projectLngLat(c.lng, c.lat, geometry.fit);
      placed.push({...c, x, y, approx: false});
      continue;
    }
    const arr = countryOnly.get(c.country);
    if (arr) arr.push(c);
    else countryOnly.set(c.country, [c]);
  }
  for (const [country, members] of countryOnly) {
    const centroid = centroidFor(country);
    if (!centroid) continue; // unknown country: list-only, no dot
    members.sort((a, b) => a.id.localeCompare(b.id));
    const [r1] = hashFloats(`country:${country}`, 1);
    for (let i = 0; i < members.length; i++) {
      const angle = r1 * Math.PI * 2 + i * GOLDEN_ANGLE;
      const radius = 5 + 6 * Math.sqrt(i);
      placed.push({
        ...members[i],
        x: centroid[0] + Math.cos(angle) * radius,
        y: centroid[1] + Math.sin(angle) * radius,
        approx: true,
      });
    }
  }
  return placed;
}

/* Group by exact place first (same city => one dot), then greedily merge
  anything closer than CLUSTER_PX on screen at the current zoom. Entry types
  never share a cluster — a dot's color must stay unambiguous. */
function clusterPlaced(placed: Placed[], k: number): Cluster[] {
  const byPlace = new Map<string, Placed[]>();
  for (const p of placed) {
    const key = p.approx
      ? `person:${p.id}` // country-only people never share a "place"
      : `city:${typeOf(p)}|${p.country}|${p.city}`;
    const arr = byPlace.get(key);
    if (arr) arr.push(p);
    else byPlace.set(key, [p]);
  }
  interface Loc {
    key: string;
    x: number;
    y: number;
    members: Placed[];
  }
  const locs: Loc[] = Array.from(byPlace.entries()).map(([key, members]) => ({
    key,
    x: members[0].x,
    y: members[0].y,
    members,
  }));
  locs.sort(
    (a, b) => b.members.length - a.members.length || a.key.localeCompare(b.key),
  );

  const used = new Array(locs.length).fill(false);
  const clusters: Cluster[] = [];
  for (let i = 0; i < locs.length; i++) {
    if (used[i]) continue;
    used[i] = true;
    const anchor = locs[i];
    const anchorType = typeOf(anchor.members[0]);
    const members = [...anchor.members];
    for (let j = i + 1; j < locs.length; j++) {
      if (used[j]) continue;
      if (typeOf(locs[j].members[0]) !== anchorType) continue;
      const dx = (locs[j].x - anchor.x) * k;
      const dy = (locs[j].y - anchor.y) * k;
      if (dx * dx + dy * dy < CLUSTER_PX * CLUSTER_PX) {
        used[j] = true;
        members.push(...locs[j].members);
      }
    }
    clusters.push({
      key: anchor.key,
      x: anchor.x,
      y: anchor.y,
      ox: 0,
      oy: 0,
      members,
      approx: members.every(m => m.approx),
      type: anchorType,
      label: clusterLabel(members, anchorType),
    });
  }
  // Different-type clusters at the same place (e.g. a workspace in a city
  // that also has contributors) would render concentric — fan them out a
  // few screen pixels instead. Deterministic: order is cluster build order.
  const byPoint = new Map<string, Cluster[]>();
  for (const c of clusters) {
    const key = `${c.x},${c.y}`;
    const arr = byPoint.get(key);
    if (arr) arr.push(c);
    else byPoint.set(key, [c]);
  }
  for (const group of byPoint.values()) {
    if (group.length < 2) continue;
    for (let i = 1; i < group.length; i++) {
      const angle = -Math.PI / 4 + ((i - 1) * Math.PI) / 2;
      group[i].ox = Math.cos(angle) * 15;
      group[i].oy = Math.sin(angle) * 15;
    }
  }
  return clusters;
}

function clampTransform(t: Transform): Transform {
  const k = Math.min(Math.max(t.k, 1), MAX_ZOOM);
  // Vertically: while the scaled map is shorter than the padded viewport
  // (-PAD_Y .. MAP_H+PAD_Y), keep it centered; once it's taller, clamp so it
  // always covers the viewport.
  const y =
    MAP_H * k <= VIEW_H
      ? (MAP_H - MAP_H * k) / 2
      : Math.min(-PAD_Y, Math.max(MAP_H + PAD_Y - MAP_H * k, t.y));
  return {
    k,
    x: Math.min(0, Math.max(MAP_W - MAP_W * k, t.x)),
    y,
  };
}

function formatJoined(joined: string): string {
  const [y, m] = joined.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatLocalTime(
  tz: string | undefined,
  now: Date | null,
): {time: string; abbr: string} | null {
  if (!tz || !now) return null;
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: tz,
      timeZoneName: 'short',
    }).formatToParts(now);
    const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
    return {
      time: `${get('hour')}:${get('minute')}`,
      abbr: get('timeZoneName'),
    };
  } catch {
    return null;
  }
}

/* One icon per entry type (hexagon family, matching the map key colors):
  contributors get the hexagon-user, workspaces the plain hexagon, and
  manufacturers a hexagon with a bolt-hole — a nut. */
const TYPE_ICON_PATH: Record<EntryType, string> = {
  contributor:
    'M30 8.16267L16 0.35498L2 8.16267V23.8373L16 31.645L30 23.8373V8.16267ZM20.5 14.5C20.5 16.9853 18.4853 19 16 19C13.5147 19 11.5 16.9853 11.5 14.5C11.5 12.0147 13.5147 10 16 10C18.4853 10 20.5 12.0147 20.5 14.5ZM16 29.5L24.4814 24.9146C22.4618 22.5212 19.4091 21 15.9999 21C12.5908 21 9.53811 22.5212 7.51849 24.9146L16 29.5Z',
  workspace:
    'M30 8.16267L16 0.35498L2 8.16267V23.8373L16 31.645L30 23.8373V8.16267Z',
  manufacturer:
    'M30 8.16267L16 0.35498L2 8.16267V23.8373L16 31.645L30 23.8373V8.16267ZM16 22C19.3137 22 22 19.3137 22 16C22 12.6863 19.3137 10 16 10C12.6863 10 10 12.6863 10 16C10 19.3137 12.6863 22 16 22Z',
};

const TYPE_AVATAR_BG: Record<EntryType, string> = {
  contributor: 'var(--cm-accent)',
  workspace: 'var(--cm-workspace)',
  manufacturer: 'var(--cm-manufacturer)',
};

/* Fallback avatar when no snapshot or GitHub avatar exists: the entry
  type's key color with its icon at 0.4 opacity. */
function TypeAvatar({
  type,
  size,
  className,
}: {
  type: EntryType;
  size: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-hidden="true"
    >
      <rect width="32" height="32" fill={TYPE_AVATAR_BG[type]} />
      <g transform="translate(6.4 6.4) scale(0.6)">
        <path
          d={TYPE_ICON_PATH[type]}
          fill="#fff"
          opacity="0.4"
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </g>
    </svg>
  );
}

function Avatar({person, size}: {person: Contributor; size: number}) {
  if (person.avatar) {
    return (
      <img
        className={styles.cardAvatar}
        src={person.avatar}
        alt=""
        width={size}
        height={size}
        loading="lazy"
      />
    );
  }
  if (person.github) {
    return (
      <img
        className={styles.cardAvatar}
        src={`https://github.com/${person.github}.png?size=128`}
        alt=""
        width={size}
        height={size}
        loading="lazy"
      />
    );
  }
  return (
    <TypeAvatar
      type={typeOf(person)}
      size={size}
      className={styles.cardAvatar}
    />
  );
}

interface Selection {
  ids: string[];
  index: number;
}

/* Dense tooltip-style card content: name, place, local time, join date,
  and skill tags — nothing that makes it tall. Rendered inside an
  <AnchoredCard> pointing at the selected dot. */
function DotCard({
  person,
  now,
  selection,
  onPage,
  onClose,
  approx,
}: {
  person: Contributor;
  now: Date | null;
  selection: Selection;
  onPage: (index: number) => void;
  onClose: () => void;
  approx?: boolean;
}) {
  const lt = formatLocalTime(person.tz, now);
  const iso2 = geometry.iso2 as Record<string, string>;
  const flagCode =
    iso2[person.country] ?? iso2[COUNTRY_ALIASES[person.country] ?? ''];
  return (
    <>
      <button
        type="button"
        className={styles.cardClose}
        aria-label="Close profile"
        onClick={onClose}
      >
        ×
      </button>
      <span
        className={[
          styles.cardTypeBadge,
          {
            contributor: styles.cardTypeBadgeContributor,
            workspace: styles.cardTypeBadgeWorkspace,
            manufacturer: styles.cardTypeBadgeManufacturer,
          }[typeOf(person)],
        ].join(' ')}
      >
        {TYPE_NOUN[typeOf(person)][0]}
      </span>
      <p className={styles.cardName}>{person.name}</p>
      <div className={styles.cardPlace}>
        {person.city ? `${person.city}, ${person.country}` : person.country}
        {flagCode && (
          <span
            className={`fi fi-${flagCode} ${styles.cardFlag}`}
            aria-hidden="true"
          />
        )}
        {approx && <span className={styles.cardApprox}> · approx.</span>}
      </div>
      <div className={styles.cardMeta}>
        <div>
          <div className={styles.cardMetaLabel}>Local time</div>
          <div className={styles.cardMetaValue}>
            {lt ? `${lt.time} ${lt.abbr}` : '—'}
          </div>
        </div>
        <div>
          <div className={styles.cardMetaLabel}>
            {typeOf(person) === 'contributor' ? 'Joined' : 'Since'}
          </div>
          <div className={styles.cardMetaValue}>
            {formatJoined(person.joined)}
          </div>
        </div>
      </div>
      {person.blurb && <p className={styles.cardBlurb}>{person.blurb}</p>}
      {(person.disciplines?.length ?? 0) > 0 && (
        <div className={styles.cardTags}>
          {person.disciplines!.map(d => (
            <span
              key={d}
              className={styles.cardTag}
              style={DISCIPLINE_COLOR[d] ? {borderLeft: `3px solid ${DISCIPLINE_COLOR[d]}`} : undefined}
            >
              {d}
            </span>
          ))}
        </div>
      )}
      {(person.discord || person.github || selection.ids.length > 1) && (
        <div className={styles.cardFooter}>
          {person.discord && (
            <a
              href={`https://discord.com/users/${person.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </a>
          )}
          {person.github && (
            <a
              href={`https://github.com/${person.github}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          )}
          {selection.ids.length > 1 && (
            <span className={styles.cardPagerCompact}>
              <button
                type="button"
                className={styles.pagerButton}
                aria-label="Previous contributor here"
                disabled={selection.index === 0}
                onClick={() => onPage(selection.index - 1)}
              >
                ‹
              </button>
              <span className={styles.pagerCount}>
                {selection.index + 1}/{selection.ids.length}
              </span>
              <button
                type="button"
                className={styles.pagerButton}
                aria-label="Next contributor here"
                disabled={selection.index === selection.ids.length - 1}
                onClick={() => onPage(selection.index + 1)}
              >
                ›
              </button>
            </span>
          )}
        </div>
      )}
    </>
  );
}

/* Positions its children as a tooltip pointing at a dot. ax/ay are the
  dot's position as fractions of the map area; the card flips below the dot
  when it sits near the top and hides when the dot leaves the viewport. */
function AnchoredCard({
  ax,
  ay,
  label,
  children,
}: {
  ax: number;
  ay: number;
  label: string;
  children: React.ReactNode;
}) {
  if (ax < 0.02 || ax > 0.98 || ay < 0.02 || ay > 0.98) return null;
  return (
    <div
      className={[
        styles.card,
        styles.cardAnchored,
        ay < 0.45 ? styles.cardAnchoredBelow : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{left: `${ax * 100}%`, top: `${ay * 100}%`}}
      role="dialog"
      aria-label={label}
    >
      {children}
    </div>
  );
}

/* Store-locator-style panel beside the map (desktop only; CSS hides it on
  stacks below the map on narrow viewports).
  Tabs per entry type → searchable list synced with the dots; the selected
  entry expands at the top. */
function MapSidebar({
  contributors,
  now,
  selectedId,
  selectedPerson,
  onPick,
  onCollapse,
  panelWidth,
  onPanelWidth,
}: {
  contributors: Contributor[];
  now: Date | null;
  selectedId: string | null;
  selectedPerson: Contributor | undefined;
  onPick: (id: string) => void;
  onCollapse: () => void;
  panelWidth: number;
  onPanelWidth: (width: number) => void;
}) {
  const [tab, setTab] = useState<EntryType>('contributor');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'joined' | 'place' | 'time'>(
    'name',
  );
  const resizeRef = useRef<{startX: number; startW: number} | null>(null);

  /* Selecting a dot of another type (e.g. a map click) follows it. */
  useEffect(() => {
    if (selectedPerson) setTab(typeOf(selectedPerson));
  }, [selectedPerson]);

  const tabs = useMemo(() => {
    const present = new Set(contributors.map(typeOf));
    return (['contributor', 'workspace', 'manufacturer'] as EntryType[]).filter(
      t => present.has(t),
    );
  }, [contributors]);

  /* Current minutes-since-midnight in an entry's timezone, for the local
    time sort; entries without a tz sort last. */
  const localMinutes = useCallback(
    (c: Contributor): number => {
      if (!c.tz || !now) return Number.POSITIVE_INFINITY;
      try {
        const parts = new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hourCycle: 'h23',
          timeZone: c.tz,
        }).formatToParts(now);
        const get = (t: string) =>
          Number(parts.find(p => p.type === t)?.value ?? 0);
        return get('hour') * 60 + get('minute');
      } catch {
        return Number.POSITIVE_INFINITY;
      }
    },
    [now],
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const place = (c: Contributor) =>
      c.city ? `${c.city}, ${c.country}` : c.country;
    return contributors
      .filter(c => typeOf(c) === tab)
      .filter(c => {
        if (!q) return true;
        return [c.name, c.city ?? '', c.country, ...(c.disciplines ?? [])]
          .join(' ')
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'joined') {
          cmp = b.joined.localeCompare(a.joined); // newest first
        } else if (sortBy === 'place') {
          cmp = place(a).localeCompare(place(b));
        } else if (sortBy === 'time') {
          cmp = localMinutes(a) - localMinutes(b);
        }
        return cmp || a.name.localeCompare(b.name);
      });
  }, [contributors, tab, query, sortBy, localMinutes]);

  return (
    <div className={styles.sidePanel}>
      <div
        className={styles.sideTabs}
        role="group"
        aria-label="Entry type list"
      >
        {tabs.map(t => (
          <button
            key={t}
            type="button"
            className={`${styles.sideTab} ${
              tab === t ? styles.sideTabActive : ''
            }`}
            aria-pressed={tab === t}
            onClick={() => setTab(t)}
          >
            <span
              className={[
                styles.legendSwatch,
                t === 'workspace' ? styles.legendSwatchWorkspace : '',
                t === 'manufacturer' ? styles.legendSwatchManufacturer : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />
            <span className={styles.sideTabLabel}>{SIDE_TAB_LABEL[t]}</span>
            <span className={styles.sideTabCount}>
              {contributors.filter(c => typeOf(c) === t).length}
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className={styles.sideCollapseButton}
        aria-label="Hide list panel"
        title="Hide list panel"
        onClick={onCollapse}
      >
        ‹
      </button>
      {/* Invisible drag strip along the divider: resize the panel. */}
      <div
        className={styles.sideResizer}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize list panel"
        onPointerDown={e => {
          e.preventDefault();
          try {
            (e.target as Element).setPointerCapture?.(e.pointerId);
          } catch {
            // synthetic/stale pointer id — capture is best-effort
          }
          resizeRef.current = {startX: e.clientX, startW: panelWidth};
        }}
        onPointerMove={e => {
          const r = resizeRef.current;
          if (!r) return;
          onPanelWidth(
            Math.min(440, Math.max(200, r.startW + e.clientX - r.startX)),
          );
        }}
        onPointerUp={() => {
          resizeRef.current = null;
        }}
        onPointerCancel={() => {
          resizeRef.current = null;
        }}
      />
      <div className={styles.sideControls}>
        <input
          type="search"
          className={styles.sideSearch}
          placeholder={`Search ${TYPE_NOUN[tab][1]}…`}
          aria-label={`Search ${TYPE_NOUN[tab][1]}`}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <select
          className={styles.sideSort}
          aria-label="Sort list by"
          title="Sort list by"
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
        >
          <option value="name">Name</option>
          <option value="joined">Joined</option>
          <option value="place">Place</option>
          <option value="time">Local time</option>
        </select>
      </div>
      <ul className={styles.sideList} aria-label={LEGEND_LABEL[tab]}>
        {list.map(c => {
          const lt = formatLocalTime(c.tz, now);
          return (
            <li key={c.id} className={styles.sideItem}>
              <button
                type="button"
                className={`${styles.sideItemButton} ${
                  selectedId === c.id ? styles.sideItemSelected : ''
                }`}
                aria-current={selectedId === c.id || undefined}
                title={c.city ? `${c.city}, ${c.country}` : c.country}
                onClick={() => onPick(c.id)}
              >
                <Avatar person={c} size={18} />
                <span className={styles.sideItemName}>{c.name}</span>
                <span className={styles.sideItemPlace}>
                  {c.city ? `${c.city}, ${c.country}` : c.country}
                </span>
                {lt && <span className={styles.sideItemTime}>{lt.time}</span>}
              </button>
            </li>
          );
        })}
        {list.length === 0 && (
          <li className={styles.sideEmpty}>No matches.</li>
        )}
      </ul>
    </div>
  );
}

/* Short tab labels — the full branded names don't fit three-up. */
const SIDE_TAB_LABEL: Record<EntryType, string> = {
  contributor: 'People',
  workspace: 'Spaces',
  manufacturer: 'Makers',
};

export default function ContributorMap(): React.ReactElement {
  const contributors = (contributorsFile as {contributors: Contributor[]})
    .contributors;
  const placed = useMemo(() => placeContributors(contributors), [contributors]);
  const placedById = useMemo(() => {
    const m = new Map<string, Placed>();
    for (const p of placed) m.set(p.id, p);
    return m;
  }, [placed]);

  const [transform, setTransform] = useState<Transform>({k: 1, x: 0, y: 0});
  const [selection, setSelection] = useState<Selection | null>(null);
  const [dragging, setDragging] = useState(false);
  /* The dot-anchored card hides during fly-to animations — anchored to a
    moving dot it sweeps and flips erratically; it fades in on arrival. */
  const [camAnimating, setCamAnimating] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState<'flat' | 'globe'>('flat');
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState(264);
  const globeRef = useRef<GlobeHandle | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const transformRef = useRef(transform);
  transformRef.current = transform;
  const animRef = useRef<number | null>(null);
  const pointers = useRef(new Map<number, {x: number; y: number}>());
  const gesture = useRef<{
    startT: Transform;
    startPts: Array<{x: number; y: number}>;
    moved: boolean;
  } | null>(null);
  const reducedMotion = useRef(false);
  /* Recent single-pointer samples for release-glide inertia. */
  const trail = useRef<Array<{t: number; x: number; y: number}>>([]);

  // Live clock: client-only by design (SSR renders the placeholder).
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
  }, []);

  /* Below 1280px the panel stacks under the map and has no reopen grip, so
    entering that layout with the panel collapsed would strand it hidden. */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1279px)');
    const onChange = () => {
      if (mq.matches) setPanelOpen(true);
    };
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  /* Expanded (modal) mode: lock body scroll, close on Escape. */
  useEffect(() => {
    if (!expanded) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [expanded]);

  /* Legend checkboxes double as type filters: everything is shown by
    default, unchecking a type hides its dots (the list panel stays
    complete — it is the canonical text equivalent). */
  const [hiddenTypes, setHiddenTypes] = useState<ReadonlySet<EntryType>>(
    () => new Set(),
  );
  const toggleType = useCallback((t: EntryType) => {
    setHiddenTypes(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }, []);

  const visiblePlaced = useMemo(
    () => placed.filter(p => !hiddenTypes.has(typeOf(p))),
    [placed, hiddenTypes],
  );

  const clusters = useMemo(
    () => clusterPlaced(visiblePlaced, transform.k),
    [visiblePlaced, transform.k],
  );

  /* Legend rows: entry types present in the data (in canonical order). */
  const legendTypes = useMemo(() => {
    const present = new Set(contributors.map(typeOf));
    return (['contributor', 'workspace', 'manufacturer'] as EntryType[]).filter(
      t => present.has(t),
    );
  }, [contributors]);

  const stopAnim = useCallback(() => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    setCamAnimating(false);
  }, []);

  const animateTo = useCallback(
    (target: Transform) => {
      stopAnim();
      const clamped = clampTransform(target);
      if (reducedMotion.current) {
        setTransform(clamped);
        return;
      }
      const from = {...transformRef.current};
      const start = performance.now();
      const dur = 350;
      setCamAnimating(true);
      const step = (ts: number) => {
        const t = Math.min(1, (ts - start) / dur);
        const e = 1 - Math.pow(1 - t, 3);
        setTransform({
          k: from.k + (clamped.k - from.k) * e,
          x: from.x + (clamped.x - from.x) * e,
          y: from.y + (clamped.y - from.y) * e,
        });
        if (t < 1) {
          animRef.current = requestAnimationFrame(step);
        } else {
          animRef.current = null;
          setCamAnimating(false);
        }
      };
      animRef.current = requestAnimationFrame(step);
    },
    [stopAnim],
  );

  useEffect(() => stopAnim, [stopAnim]);

  /* Convert a client-space point to map viewBox units. */
  const toMapPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return {x: 0, y: 0};
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * MAP_W,
      y: ((clientY - rect.top) / rect.height) * VIEW_H - PAD_Y,
    };
  }, []);

  const zoomAt = useCallback(
    (px: number, py: number, factor: number, animate = false) => {
      const t = transformRef.current;
      const k = Math.min(Math.max(t.k * factor, 1), MAX_ZOOM);
      const ratio = k / t.k;
      const next = clampTransform({
        k,
        x: px - (px - t.x) * ratio,
        y: py - (py - t.y) * ratio,
      });
      if (animate) animateTo(next);
      else setTransform(next);
    },
    [animateTo],
  );

  /* Non-passive wheel listener (React's onWheel can't preventDefault). */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stopAnim();
      const {x, y} = toMapPoint(e.clientX, e.clientY);
      zoomAt(x, y, Math.exp(-e.deltaY * 0.002));
    };
    svg.addEventListener('wheel', onWheel, {passive: false});
    return () => svg.removeEventListener('wheel', onWheel);
  }, [toMapPoint, zoomAt, stopAnim]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      stopAnim();
      try {
        (e.target as Element).setPointerCapture?.(e.pointerId);
      } catch {
        // synthetic/stale pointer id — capture is best-effort
      }
      pointers.current.set(e.pointerId, {x: e.clientX, y: e.clientY});
      gesture.current = {
        startT: {...transformRef.current},
        startPts: Array.from(pointers.current.values()),
        moved: false,
      };
      trail.current = [{t: performance.now(), x: e.clientX, y: e.clientY}];
      if (pointers.current.size === 1) setDragging(true);
    },
    [stopAnim],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!pointers.current.has(e.pointerId) || !gesture.current) return;
      pointers.current.set(e.pointerId, {x: e.clientX, y: e.clientY});
      const g = gesture.current;
      const pts = Array.from(pointers.current.values());
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const sx = MAP_W / rect.width;

      if (pts.length >= 2 && g.startPts.length >= 2) {
        // Pinch: scale by distance ratio around the midpoint.
        const d0 = Math.hypot(
          g.startPts[0].x - g.startPts[1].x,
          g.startPts[0].y - g.startPts[1].y,
        );
        const d1 = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (d0 > 0 && d1 > 0) {
          const mid = toMapPoint(
            (pts[0].x + pts[1].x) / 2,
            (pts[0].y + pts[1].y) / 2,
          );
          const k = Math.min(Math.max(g.startT.k * (d1 / d0), 1), MAX_ZOOM);
          const ratio = k / g.startT.k;
          setTransform(
            clampTransform({
              k,
              x: mid.x - (mid.x - g.startT.x) * ratio,
              y: mid.y - (mid.y - g.startT.y) * ratio,
            }),
          );
          g.moved = true;
        }
      } else if (pts.length === 1 && g.startPts.length >= 1) {
        const dx = (pts[0].x - g.startPts[0].x) * sx;
        const dy = (pts[0].y - g.startPts[0].y) * sx;
        if (Math.abs(dx) + Math.abs(dy) > 3) g.moved = true;
        setTransform(
          clampTransform({
            k: g.startT.k,
            x: g.startT.x + dx,
            y: g.startT.y + dy,
          }),
        );
        const now = performance.now();
        trail.current.push({t: now, x: pts[0].x, y: pts[0].y});
        while (trail.current.length > 2 && now - trail.current[0].t > 100) {
          trail.current.shift();
        }
      }
    },
    [toMapPoint],
  );

  /* Release-glide: velocity from the last ~100ms of drag (in map units)
    decays exponentially. Damped launch + short τ keep the total glide to a
    modest fraction of the drag speed — full velocity catapults the map.
    Clamping still applies each frame, so a glide into an edge stops there. */
  const startInertia = useCallback(
    (vx: number, vy: number) => {
      if (reducedMotion.current) return;
      if (Math.hypot(vx, vy) < 0.08) return; // map-units/ms — reads as a stop
      let last = performance.now();
      let cvx = vx * 0.45;
      let cvy = vy * 0.45;
      const step = (ts: number) => {
        const dt = ts - last;
        last = ts;
        const t = transformRef.current;
        setTransform(
          clampTransform({k: t.k, x: t.x + cvx * dt, y: t.y + cvy * dt}),
        );
        const decay = Math.exp(-dt / 200);
        cvx *= decay;
        cvy *= decay;
        if (Math.hypot(cvx, cvy) > 0.01) {
          animRef.current = requestAnimationFrame(step);
        } else {
          animRef.current = null;
        }
      };
      stopAnim();
      animRef.current = requestAnimationFrame(step);
    },
    [stopAnim],
  );

  const endPointer = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size === 0) {
        setDragging(false);
        if (gesture.current?.moved && trail.current.length >= 2) {
          const first = trail.current[0];
          const lastPt = trail.current[trail.current.length - 1];
          const dt = lastPt.t - first.t;
          const svg = svgRef.current;
          if (dt > 0 && svg) {
            const sx = MAP_W / svg.getBoundingClientRect().width;
            startInertia(
              ((lastPt.x - first.x) * sx) / dt,
              ((lastPt.y - first.y) * sx) / dt,
            );
          }
        }
        trail.current = [];
        // keep gesture.moved readable by the click handler for one tick
        setTimeout(() => {
          gesture.current = null;
        }, 0);
      } else if (gesture.current) {
        gesture.current = {
          startT: {...transformRef.current},
          startPts: Array.from(pointers.current.values()),
          moved: gesture.current.moved,
        };
      }
    },
    [startInertia],
  );

  const selectCluster = useCallback((cluster: Cluster) => {
    setSelection({ids: cluster.members.map(m => m.id), index: 0});
  }, []);

  const zoomToPerson = useCallback(
    (id: string) => {
      const p = placedById.get(id);
      if (!p) return;
      // A list-row click re-shows the person's type if it was filtered out
      // — jumping to an invisible dot would look broken.
      setHiddenTypes(prev => {
        if (!prev.has(typeOf(p))) return prev;
        const next = new Set(prev);
        next.delete(typeOf(p));
        return next;
      });
      setSelection({ids: [id], index: 0});
      if (view === 'globe') {
        globeRef.current?.focusById(id);
        return;
      }
      const k = Math.max(transformRef.current.k, 4);
      animateTo({
        k,
        x: MAP_W / 2 - p.x * k,
        y: MAP_H / 2 - p.y * k,
      });
    },
    [placedById, animateTo, view],
  );

  const selectedIds = useMemo(() => new Set(selection?.ids ?? []), [selection]);
  const selectedPerson: Placed | undefined = selection
    ? placedById.get(selection.ids[selection.index])
    : undefined;

  /* Hiding a type also dismisses a card belonging to it. */
  useEffect(() => {
    if (selectedPerson && hiddenTypes.has(typeOf(selectedPerson))) {
      setSelection(null);
    }
  }, [hiddenTypes, selectedPerson]);

  const onMapKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setSelection(null);
  }, []);

  const {k, x, y} = transform;

  /* The selected dot's card renders as a tooltip anchored to the dot. The
    card content is shared; each view supplies the dot's screen position
    (the flat map here, the globe via its anchoredCard callback). */
  const dotCard =
    selectedPerson && selection ? (
      <DotCard
        person={selectedPerson}
        now={now}
        selection={selection}
        onPage={index => setSelection({...selection, index})}
        onClose={() => setSelection(null)}
        approx={selectedPerson.approx}
      />
    ) : null;

  const flatCardAnchor = useMemo(() => {
    if (view !== 'flat' || !selectedPerson) return null;
    const cluster = clusters.find(cl =>
      cl.members.some(m => m.id === selectedPerson.id),
    );
    if (!cluster) return null;
    return {
      ax: (cluster.x * k + x + cluster.ox) / MAP_W,
      ay: (cluster.y * k + y + cluster.oy + PAD_Y) / VIEW_H,
    };
  }, [view, selectedPerson, clusters, k, x, y]);

  /* When expanded, the panel is portaled to <body>: the docs layout creates
    stacking contexts (sticky navbar et al.) that an in-place overlay cannot
    reliably sit above. styles.modalOverlay composes the theme variables the
    panel needs outside the .wrapper subtree. */
  const mapPanelNode = (
    <div
      className={expanded ? styles.modalOverlay : undefined}
      onClick={
        expanded
          ? (e: React.MouseEvent) => {
              if (e.target === e.currentTarget) setExpanded(false);
            }
          : undefined
      }
      role={expanded ? 'dialog' : undefined}
      aria-modal={expanded || undefined}
      aria-label={expanded ? 'Expanded contributor map' : undefined}
    >
      <div
        className={`${styles.mapPanel} ${
          expanded ? styles.mapPanelExpanded : ''
        }`}
        style={{'--cm-panel-w': `${panelWidth}px`} as React.CSSProperties}
        onKeyDown={onMapKeyDown}
      >
        {panelOpen && (
          <MapSidebar
            contributors={contributors}
            now={now}
            selectedId={selection ? selection.ids[selection.index] : null}
            selectedPerson={selectedPerson}
            onPick={zoomToPerson}
            onCollapse={() => setPanelOpen(false)}
            panelWidth={panelWidth}
            onPanelWidth={setPanelWidth}
          />
        )}
        <div className={styles.mapArea}>
          {!panelOpen && (
            <button
              type="button"
              className={styles.panelOpenButton}
              aria-label="Show list panel"
              title="Show list panel"
              onClick={() => setPanelOpen(true)}
            >
              ›
            </button>
          )}
        {view === 'globe' ? (
          <Globe
            ref={globeRef}
            visible={contributors.filter(c => !hiddenTypes.has(typeOf(c)))}
            selectedIds={selectedIds}
            onSelectCluster={ids => setSelection({ids, index: 0})}
            onBackgroundClick={() => setSelection(null)}
            anchoredCard={
              dotCard && selectedPerson
                ? (ax, ay) => (
                    <AnchoredCard
                      ax={ax}
                      ay={ay}
                      label={`Profile: ${selectedPerson.name}`}
                    >
                      {dotCard}
                    </AnchoredCard>
                  )
                : undefined
            }
          />
        ) : (
        <svg
          ref={svgRef}
          className={`${styles.mapSvg} ${dragging ? styles.dragging : ''}`}
          viewBox={`0 ${-PAD_Y} ${MAP_W} ${VIEW_H}`}
          role="group"
          aria-label="World map of Arrow contributors, workspaces, and manufacturers. The same information is available in the list panel."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onClick={() => {
            // Click on empty map (not a drag, not a dot — dots stop
            // propagation) dismisses the profile card.
            if (gesture.current?.moved) return;
            setSelection(null);
          }}
          onDoubleClick={e => {
            const {x: px, y: py} = toMapPoint(e.clientX, e.clientY);
            zoomAt(px, py, 2, true);
          }}
        >
          <g transform={`translate(${x} ${y}) scale(${k})`}>
            {(geometry.countries as Array<{name: string; d: string}>).map(c => (
              <path key={c.name} className={styles.land} d={c.d} />
            ))}
            {'borders' in geometry && (
              <path
                className={styles.adminBorders}
                d={(geometry as {borders: string}).borders}
                vectorEffect="non-scaling-stroke"
              />
            )}
          </g>
          {/* Dots render in screen space so their size/labels stay crisp. */}
          <g>
            {clusters.map(cluster => {
              const cx = cluster.x * k + x + cluster.ox;
              const cy = cluster.y * k + y + cluster.oy;
              if (
                cx < -20 ||
                cx > MAP_W + 20 ||
                cy < -PAD_Y - 20 ||
                cy > MAP_H + PAD_Y + 20
              ) {
                return null;
              }
              const n = cluster.members.length;
              const r = n > 1 ? 9 + 2.4 * Math.sqrt(n - 1) : 6.5;
              const isSelected = cluster.members.some(m =>
                selectedIds.has(m.id),
              );
              return (
                <g
                  key={cluster.key}
                  className={[
                    styles.dot,
                    cluster.type === 'workspace' ? styles.dotWorkspace : '',
                    cluster.type === 'manufacturer'
                      ? styles.dotManufacturer
                      : '',
                    isSelected ? styles.dotSelected : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  role="button"
                  tabIndex={0}
                  aria-label={cluster.label}
                  onClick={e => {
                    e.stopPropagation();
                    if (gesture.current?.moved) return;
                    selectCluster(cluster);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectCluster(cluster);
                    }
                  }}
                >
                  <title>{cluster.label}</title>
                  {isSelected && (
                    <circle
                      className={styles.selectionRing}
                      cx={cx}
                      cy={cy}
                      r={r + 4}
                    />
                  )}
                  <circle className={styles.dotCircle} cx={cx} cy={cy} r={r} />
                  {n > 1 && (
                    <text
                      className={styles.dotCount}
                      x={cx}
                      y={cy}
                      dy="3.6"
                      fontSize="10"
                    >
                      {n}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
        )}

        <img
          className={styles.watermark}
          src="/img/brand/SVGs/arrow-lockup-white.svg"
          alt=""
          aria-hidden="true"
          width={96}
          height={32}
          loading="lazy"
        />

        <div className={styles.zoomControls}>
          <button
            type="button"
            className={styles.zoomButton}
            aria-label={expanded ? 'Close expanded map' : 'Expand map'}
            title={expanded ? 'Close expanded map' : 'Expand map'}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '×' : '⛶'}
          </button>
          <button
            type="button"
            className={`${styles.zoomButton} ${styles.viewToggleButton}`}
            aria-label={
              view === 'globe' ? 'Switch to flat map' : 'Switch to globe'
            }
            title={view === 'globe' ? 'Switch to flat map' : 'Switch to globe'}
            onClick={() => setView(view === 'globe' ? 'flat' : 'globe')}
          >
            {view === 'globe' ? '2D' : '3D'}
          </button>
          <button
            type="button"
            className={styles.zoomButton}
            aria-label="Zoom in"
            onClick={() =>
              view === 'globe'
                ? globeRef.current?.zoomBy(1.6)
                : zoomAt(MAP_W / 2, MAP_H / 2, 1.6, true)
            }
          >
            +
          </button>
          <button
            type="button"
            className={styles.zoomButton}
            aria-label="Zoom out"
            onClick={() =>
              view === 'globe'
                ? globeRef.current?.zoomBy(1 / 1.6)
                : zoomAt(MAP_W / 2, MAP_H / 2, 1 / 1.6, true)
            }
          >
            −
          </button>
          <button
            type="button"
            className={styles.zoomButton}
            aria-label="Reset zoom"
            onClick={() => {
              setSelection(null);
              if (view === 'globe') globeRef.current?.reset();
              else animateTo({k: 1, x: 0, y: 0});
            }}
          >
            ⌂
          </button>
        </div>

        {legendTypes.length > 1 && (
          <ul className={styles.legend} aria-label="Map key and filters">
            {legendTypes.map(t => (
              <li key={t} className={styles.legendItem}>
                <label className={styles.legendLabel}>
                  <input
                    type="checkbox"
                    className={styles.legendCheckbox}
                    checked={!hiddenTypes.has(t)}
                    onChange={() => toggleType(t)}
                    aria-label={`Show ${TYPE_NOUN[t][1]}`}
                  />
                  <span
                    className={[
                      styles.legendSwatch,
                      t === 'workspace' ? styles.legendSwatchWorkspace : '',
                      t === 'manufacturer'
                        ? styles.legendSwatchManufacturer
                        : '',
                      hiddenTypes.has(t) ? styles.legendSwatchOff : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  />
                  {LEGEND_LABEL[t]}
                </label>
              </li>
            ))}
          </ul>
        )}

        {!selectedPerson && (
          <div className={styles.mapHint} aria-hidden="true">
            {view === 'globe'
              ? 'drag to spin · scroll or pinch to zoom · click a dot'
              : 'drag to pan · scroll or pinch to zoom · click a dot'}
          </div>
        )}

        {dotCard && selectedPerson && flatCardAnchor && !camAnimating && (
          <AnchoredCard
            ax={flatCardAnchor.ax}
            ay={flatCardAnchor.ay}
            label={`Profile: ${selectedPerson.name}`}
          >
            {dotCard}
          </AnchoredCard>
        )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.wrapper}>
      {expanded && <div className={styles.mapPlaceholder} aria-hidden="true" />}
      {expanded ? createPortal(mapPanelNode, document.body) : mapPanelNode}

      {contributors.some(c => c.demo) && (
        <p className={styles.demoNotice}>
          Showing placeholder demo data — real contributors will appear here via
          the opt-in <code>/new-contributor</code> Discord command.
        </p>
      )}
    </div>
  );
}
