import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import contributorsFile from '@site/src/data/contributors.json';
import geometry from '@site/src/data/world-map-geometry.json';
import {projectLngLat} from './projection';
import styles from './styles.module.css';

/* Contributor map + directory table for /docs/community.
  Spec: https://github.com/Arrow-air/website/issues/180

  SSR notes: everything rendered here is a pure function of the two JSON
  files (deterministic scatter is seeded, never random), so the component
  server-renders and hydrates cleanly. The one client-only value — the live
  local-time clock — starts as a placeholder and is filled in by an effect
  after mount. Do not wrap this component in <BrowserOnly>. */

const MAP_W: number = geometry.width;
const MAP_H: number = geometry.height;
const MAX_ZOOM = 12;
const CLUSTER_PX = 18;

interface Contributor {
  id: string;
  name: string;
  country: string;
  city?: string;
  lat?: number;
  lng?: number;
  tz?: string;
  disciplines: string[];
  blurb?: string;
  joined: string;
  discord?: string;
  github?: string;
  avatar?: string;
  demo?: boolean;
}

interface Placed extends Contributor {
  x: number;
  y: number;
  approx: boolean; // country-only => approximate position
}

interface Cluster {
  key: string;
  x: number; // base (unzoomed) map coords of the anchor location
  y: number;
  members: Placed[];
  approx: boolean; // true when every member is country-only
  label: string;
}

interface Transform {
  k: number;
  x: number;
  y: number;
}

/* Natural Earth 110m uses long-form names for a few countries people
  will more likely type/store in short form. */
const COUNTRY_ALIASES: Record<string, string> = {
  'United States': 'United States of America',
  USA: 'United States of America',
  UK: 'United Kingdom',
  Czechia: 'Czech Republic',
  Türkiye: 'Turkey',
};

function centroidFor(country: string): [number, number] | undefined {
  const centroids = geometry.centroids as unknown as Record<
    string,
    [number, number]
  >;
  return centroids[country] ?? centroids[COUNTRY_ALIASES[country] ?? ''];
}

/* Small deterministic hash → [0,1) floats, seeded by contributor id, so
  country-only scatter is stable across builds and SSR-safe. */
function hashFloats(seedStr: string, n: number): number[] {
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

function placeContributors(list: Contributor[]): Placed[] {
  const placed: Placed[] = [];
  for (const c of list) {
    if (typeof c.lat === 'number' && typeof c.lng === 'number') {
      const [x, y] = projectLngLat(c.lng, c.lat, geometry.fit);
      placed.push({...c, x, y, approx: false});
      continue;
    }
    const centroid = centroidFor(c.country);
    if (!centroid) continue; // unknown country: table-only, no dot
    const [r1, r2] = hashFloats(c.id, 2);
    const angle = r1 * Math.PI * 2;
    const radius = 4 + r2 * 8;
    placed.push({
      ...c,
      x: centroid[0] + Math.cos(angle) * radius,
      y: centroid[1] + Math.sin(angle) * radius,
      approx: true,
    });
  }
  return placed;
}

/* Group by exact place first (same city => one dot), then greedily merge
  anything closer than CLUSTER_PX on screen at the current zoom. */
function clusterPlaced(placed: Placed[], k: number): Cluster[] {
  const byPlace = new Map<string, Placed[]>();
  for (const p of placed) {
    const key = p.approx
      ? `person:${p.id}` // country-only people never share a "place"
      : `city:${p.country}|${p.city}`;
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
  locs.sort((a, b) => b.members.length - a.members.length || a.key.localeCompare(b.key));

  const used = new Array(locs.length).fill(false);
  const clusters: Cluster[] = [];
  for (let i = 0; i < locs.length; i++) {
    if (used[i]) continue;
    used[i] = true;
    const anchor = locs[i];
    const members = [...anchor.members];
    for (let j = i + 1; j < locs.length; j++) {
      if (used[j]) continue;
      const dx = (locs[j].x - anchor.x) * k;
      const dy = (locs[j].y - anchor.y) * k;
      if (dx * dx + dy * dy < CLUSTER_PX * CLUSTER_PX) {
        used[j] = true;
        members.push(...locs[j].members);
      }
    }
    const approx = members.every((m) => m.approx);
    const places = Array.from(
      new Set(members.map((m) => (m.city ? `${m.city}, ${m.country}` : m.country))),
    );
    clusters.push({
      key: anchor.key,
      x: anchor.x,
      y: anchor.y,
      members,
      approx,
      label:
        places.length === 1
          ? `${places[0]} — ${members.length} contributor${members.length > 1 ? 's' : ''}`
          : `${members.length} contributors near ${places[0]}`,
    });
  }
  return clusters;
}

function clampTransform(t: Transform): Transform {
  const k = Math.min(Math.max(t.k, 1), MAX_ZOOM);
  return {
    k,
    x: Math.min(0, Math.max(MAP_W - MAP_W * k, t.x)),
    y: Math.min(0, Math.max(MAP_H - MAP_H * k, t.y)),
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
    const get = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? '';
    return {
      time: `${get('hour')}:${get('minute')}`,
      abbr: get('timeZoneName'),
    };
  } catch {
    return null;
  }
}

/* Deterministic dithered-gradient avatar — the fallback when no snapshot or
  GitHub avatar exists. Seeded by contributor id: stable per person. */
function GeneratedAvatar({
  id,
  size,
  className,
}: {
  id: string;
  size: number;
  className?: string;
}) {
  const [r1, r2, r3] = hashFloats(`avatar:${id}`, 3);
  const palettes: Array<[string, string]> = [
    ['#0843BF', '#218191'],
    ['#218191', '#7ba0ff'],
    ['#052d85', '#4d7ef7'],
    ['#0843BF', '#9aa0ac'],
  ];
  const [c1, c2] = palettes[Math.floor(r1 * palettes.length)];
  const angle = Math.floor(r2 * 360);
  const seed = Math.floor(r3 * 1000);
  const gid = `cm-av-${id.replace(/[^a-zA-Z0-9-]/g, '')}`;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 44 44"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${gid}-g`}
          gradientTransform={`rotate(${angle} 0.5 0.5)`}
        >
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <filter id={`${gid}-d`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.35 0.35 0.35 0 0" />
          <feComposite operator="over" in2="SourceGraphic" />
        </filter>
      </defs>
      <rect width="44" height="44" fill={`url(#${gid}-g)`} filter={`url(#${gid}-d)`} />
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
  return <GeneratedAvatar id={person.id} size={size} className={styles.cardAvatar} />;
}

interface Selection {
  ids: string[];
  index: number;
}

type SortKey = 'name' | 'country' | 'joined';

const PAGE_SIZE = 15;

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

  const clusters = useMemo(
    () => clusterPlaced(placed, transform.k),
    [placed, transform.k],
  );

  const stopAnim = useCallback(() => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
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
      const step = (ts: number) => {
        const t = Math.min(1, (ts - start) / dur);
        const e = 1 - Math.pow(1 - t, 3);
        setTransform({
          k: from.k + (clamped.k - from.k) * e,
          x: from.x + (clamped.x - from.x) * e,
          y: from.y + (clamped.y - from.y) * e,
        });
        if (t < 1) animRef.current = requestAnimationFrame(step);
        else animRef.current = null;
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
      y: ((clientY - rect.top) / rect.height) * MAP_H,
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
      (e.target as Element).setPointerCapture?.(e.pointerId);
      pointers.current.set(e.pointerId, {x: e.clientX, y: e.clientY});
      gesture.current = {
        startT: {...transformRef.current},
        startPts: Array.from(pointers.current.values()),
        moved: false,
      };
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
      }
    },
    [toMapPoint],
  );

  const endPointer = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) {
      setDragging(false);
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
  }, []);

  const selectCluster = useCallback((cluster: Cluster) => {
    setSelection({ids: cluster.members.map((m) => m.id), index: 0});
  }, []);

  const zoomToPerson = useCallback(
    (id: string) => {
      const p = placedById.get(id);
      if (!p) return;
      setSelection({ids: [id], index: 0});
      const k = Math.max(transformRef.current.k, 4);
      animateTo({
        k,
        x: MAP_W / 2 - p.x * k,
        y: MAP_H / 2 - p.y * k,
      });
    },
    [placedById, animateTo],
  );

  const selectedIds = useMemo(
    () => new Set(selection?.ids ?? []),
    [selection],
  );
  const selectedPerson: Placed | undefined = selection
    ? placedById.get(selection.ids[selection.index])
    : undefined;

  const onMapKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setSelection(null);
  }, []);

  const {k, x, y} = transform;

  return (
    <div className={styles.wrapper}>
      <div className={styles.mapPanel} onKeyDown={onMapKeyDown}>
        <svg
          ref={svgRef}
          className={`${styles.mapSvg} ${dragging ? styles.dragging : ''}`}
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          role="group"
          aria-label="World map of Arrow contributors. The same information is available in the table below."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onDoubleClick={(e) => {
            const {x: px, y: py} = toMapPoint(e.clientX, e.clientY);
            zoomAt(px, py, 2, true);
          }}
        >
          <g transform={`translate(${x} ${y}) scale(${k})`}>
            {(geometry.countries as Array<{name: string; d: string}>).map(
              (c) => (
                <path key={c.name} className={styles.land} d={c.d} />
              ),
            )}
          </g>
          {/* Dots render in screen space so their size/labels stay crisp. */}
          <g>
            {clusters.map((cluster) => {
              const cx = cluster.x * k + x;
              const cy = cluster.y * k + y;
              if (
                cx < -20 ||
                cx > MAP_W + 20 ||
                cy < -20 ||
                cy > MAP_H + 20
              ) {
                return null;
              }
              const n = cluster.members.length;
              const r = n > 1 ? 7 + 2.2 * Math.sqrt(n - 1) : 5;
              const isSelected = cluster.members.some((m) =>
                selectedIds.has(m.id),
              );
              return (
                <g
                  key={cluster.key}
                  className={[
                    styles.dot,
                    cluster.approx ? styles.dotApprox : '',
                    isSelected ? styles.dotSelected : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  role="button"
                  tabIndex={0}
                  aria-label={cluster.label}
                  onClick={() => {
                    if (gesture.current?.moved) return;
                    selectCluster(cluster);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectCluster(cluster);
                    }
                  }}
                >
                  <title>{cluster.label}</title>
                  {isSelected && (
                    <circle className={styles.selectionRing} cx={cx} cy={cy} r={r + 4} />
                  )}
                  <circle className={styles.dotCircle} cx={cx} cy={cy} r={r} />
                  {n > 1 && (
                    <text
                      className={styles.dotCount}
                      x={cx}
                      y={cy}
                      dy="3.2"
                      fontSize="9"
                    >
                      {n}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        <div className={styles.zoomControls}>
          <button
            type="button"
            className={styles.zoomButton}
            aria-label="Zoom in"
            onClick={() => zoomAt(MAP_W / 2, MAP_H / 2, 1.6, true)}
          >
            +
          </button>
          <button
            type="button"
            className={styles.zoomButton}
            aria-label="Zoom out"
            onClick={() => zoomAt(MAP_W / 2, MAP_H / 2, 1 / 1.6, true)}
          >
            −
          </button>
          <button
            type="button"
            className={styles.zoomButton}
            aria-label="Reset zoom"
            onClick={() => {
              setSelection(null);
              animateTo({k: 1, x: 0, y: 0});
            }}
          >
            ⌂
          </button>
        </div>

        {!selectedPerson && (
          <div className={styles.mapHint} aria-hidden="true">
            drag to pan · scroll or pinch to zoom · click a dot
          </div>
        )}

        {selectedPerson && selection && (
          <div
            className={styles.card}
            role="dialog"
            aria-label={`Profile: ${selectedPerson.name}`}
          >
            <button
              type="button"
              className={styles.cardClose}
              aria-label="Close profile"
              onClick={() => setSelection(null)}
            >
              ×
            </button>
            <div className={styles.cardHeader}>
              <Avatar person={selectedPerson} size={44} />
              <div>
                <p className={styles.cardName}>{selectedPerson.name}</p>
                <div className={styles.cardPlace}>
                  {selectedPerson.city
                    ? `${selectedPerson.city}, ${selectedPerson.country}`
                    : selectedPerson.country}
                  {selectedPerson.approx && (
                    <span className={styles.cardApprox}> · approx.</span>
                  )}
                </div>
              </div>
            </div>
            {(() => {
              const lt = formatLocalTime(selectedPerson.tz, now);
              return (
                <div className={styles.cardTime}>
                  🕐 {lt ? `${lt.time} local` : '— local'}
                </div>
              );
            })()}
            {selectedPerson.blurb && (
              <p className={styles.cardBlurb}>{selectedPerson.blurb}</p>
            )}
            <div className={styles.cardTags}>
              {selectedPerson.disciplines.map((d) => (
                <span key={d} className={styles.cardTag}>
                  {d}
                </span>
              ))}
            </div>
            <div className={styles.cardMeta}>
              Joined {formatJoined(selectedPerson.joined)}
            </div>
            {(selectedPerson.discord || selectedPerson.github) && (
              <div className={styles.cardLinks}>
                {selectedPerson.discord && (
                  <a
                    href={`https://discord.com/users/${selectedPerson.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Discord
                  </a>
                )}
                {selectedPerson.github && (
                  <a
                    href={`https://github.com/${selectedPerson.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                )}
              </div>
            )}
            {selection.ids.length > 1 && (
              <div className={styles.cardPager}>
                <button
                  type="button"
                  className={styles.pagerButton}
                  aria-label="Previous contributor here"
                  disabled={selection.index === 0}
                  onClick={() =>
                    setSelection({...selection, index: selection.index - 1})
                  }
                >
                  ‹
                </button>
                <span className={styles.cardPagerLabel}>
                  {selection.index + 1} of {selection.ids.length} here
                </span>
                <button
                  type="button"
                  className={styles.pagerButton}
                  aria-label="Next contributor here"
                  disabled={selection.index === selection.ids.length - 1}
                  onClick={() =>
                    setSelection({...selection, index: selection.index + 1})
                  }
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <DirectoryTable
        contributors={contributors}
        now={now}
        selectedId={selection ? selection.ids[selection.index] : null}
        onRowClick={zoomToPerson}
      />
      {contributors.some((c) => c.demo) && (
        <p className={styles.demoNotice}>
          Showing placeholder demo data — real contributors will appear here
          via the opt-in <code>/new-contributor</code> Discord command.
        </p>
      )}
    </div>
  );
}

function DirectoryTable({
  contributors,
  now,
  selectedId,
  onRowClick,
}: {
  contributors: Contributor[];
  now: Date | null;
  selectedId: string | null;
  onRowClick: (id: string) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    const arr = [...contributors];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'country') {
        cmp =
          a.country.localeCompare(b.country) || a.name.localeCompare(b.name);
      } else if (sortKey === 'joined') {
        cmp = a.joined.localeCompare(b.joined) || a.name.localeCompare(b.name);
      } else {
        cmp = a.name.localeCompare(b.name);
      }
      return sortAsc ? cmp : -cmp;
    });
    return arr;
  }, [contributors, sortKey, sortAsc]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount - 1);
  const rows = sorted.slice(
    clampedPage * PAGE_SIZE,
    clampedPage * PAGE_SIZE + PAGE_SIZE,
  );

  const setSort = (key: SortKey, defaultAsc: boolean) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(defaultAsc);
    }
    setPage(0);
  };

  const ariaSort = (key: SortKey): 'ascending' | 'descending' | 'none' =>
    sortKey === key ? (sortAsc ? 'ascending' : 'descending') : 'none';

  const arrow = (key: SortKey) =>
    sortKey === key ? (sortAsc ? ' ↑' : ' ↓') : '';

  return (
    <div className={styles.tableSection}>
      <table className={styles.table}>
        <caption className={styles.srOnly}>
          Arrow contributors: names, locations, and local times. Click a row to
          highlight that contributor on the map above.
        </caption>
        <thead>
          <tr>
            <th aria-sort={ariaSort('name')}>
              <button
                type="button"
                className={styles.sortButton}
                onClick={() => setSort('name', true)}
              >
                Discord name{arrow('name')}
              </button>
            </th>
            <th aria-sort={ariaSort('country')}>
              <button
                type="button"
                className={styles.sortButton}
                onClick={() => setSort('country', true)}
              >
                Place{arrow('country')}
              </button>
            </th>
            <th aria-sort={ariaSort('joined')}>
              <button
                type="button"
                className={styles.sortButton}
                onClick={() => setSort('joined', false)}
              >
                Joined{arrow('joined')}
              </button>
            </th>
            <th>Local time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const lt = formatLocalTime(c.tz, now);
            return (
              <tr
                key={c.id}
                className={`${styles.row} ${
                  selectedId === c.id ? styles.rowSelected : ''
                }`}
                tabIndex={0}
                onClick={() => onRowClick(c.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRowClick(c.id);
                  }
                }}
                aria-label={`Show ${c.name} on the map`}
              >
                <td className={styles.rowName}>{c.name}</td>
                <td>{c.city ? `${c.city}, ${c.country}` : c.country}</td>
                <td>{formatJoined(c.joined)}</td>
                <td className={styles.rowTime}>
                  {lt ? lt.time : '—'}
                  {lt && <span className={styles.rowTzAbbr}>{lt.abbr}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className={styles.tableFooter}>
        <span>
          {sorted.length} contributor{sorted.length === 1 ? '' : 's'}
        </span>
        {pageCount > 1 && (
          <div className={styles.pageControls}>
            <button
              type="button"
              className={styles.pageButton}
              disabled={clampedPage === 0}
              onClick={() => setPage(clampedPage - 1)}
            >
              ‹ Prev
            </button>
            <span>
              Page {clampedPage + 1} of {pageCount}
            </span>
            <button
              type="button"
              className={styles.pageButton}
              disabled={clampedPage >= pageCount - 1}
              onClick={() => setPage(clampedPage + 1)}
            >
              Next ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
