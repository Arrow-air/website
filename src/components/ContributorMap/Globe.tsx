import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {geoGraticule10, geoOrthographic, geoPath} from 'd3-geo';
import globeGeometry from '@site/src/data/world-globe-geometry.json';
import {
  Contributor,
  COUNTRY_ALIASES,
  EntryType,
  GOLDEN_ANGLE,
  clusterLabel,
  hashFloats,
  typeOf,
} from './common';
import styles from './styles.module.css';

/* Orthographic ("view from space") globe — the alternate view of the
  contributor map. Same data as the flat map, re-projected at runtime with
  d3-geo so it can rotate under drag. Land is the merged 110m silhouette
  from world-globe-geometry.json; no tiles, no network requests.

  SSR-safe: the initial rotation/zoom are constants and d3-geo is pure math,
  so server render and hydration agree. */

const VIEW_W = 960;
const VIEW_H = 600; // matches the flat map's padded viewBox height
const BASE_R = 270; // sphere radius at zoom 1, fits VIEW_H with padding
const MAX_ZOOM = 8;
const CLUSTER_PX = 18;
/* Initial view: mid-Atlantic, slight northern tilt — most contributors are
  in the Americas/Europe band. */
const HOME_ROTATION: [number, number] = [30, -25];

const RAD = Math.PI / 180;

interface PlacedLL extends Contributor {
  pLng: number;
  pLat: number;
  approx: boolean;
}

interface GlobeCluster {
  key: string;
  sx: number; // projected screen coords at the current rotation/zoom
  sy: number;
  members: PlacedLL[];
  approx: boolean;
  type: EntryType;
  label: string;
}

export interface GlobeHandle {
  focusById: (id: string) => void;
  zoomBy: (factor: number) => void;
  reset: () => void;
}

interface GlobeProps {
  visible: Contributor[];
  selectedIds: ReadonlySet<string>;
  onSelectCluster: (ids: string[]) => void;
  /* Renders the selected dot's tooltip card; called with the dot's position
    as fractions of the view. Skipped while the dot is behind the horizon. */
  anchoredCard?: (ax: number, ay: number) => React.ReactNode;
}

function centroidLLFor(country: string): [number, number] | undefined {
  const centroids = globeGeometry.centroids as unknown as Record<
    string,
    [number, number]
  >;
  return centroids[country] ?? centroids[COUNTRY_ALIASES[country] ?? ''];
}

/* Mirror of the flat map's placement: precise entries use their lat/lng,
  country-only entries scatter around the country centroid on a
  deterministic golden-angle spiral (here in degrees: 1px on the 960-wide
  flat map ≈ 0.375°, so radii are scaled to match its look). */
function placeContributorsLL(list: Contributor[]): PlacedLL[] {
  const placed: PlacedLL[] = [];
  const countryOnly = new Map<string, Contributor[]>();
  for (const c of list) {
    if (typeof c.lat === 'number' && typeof c.lng === 'number') {
      placed.push({...c, pLng: c.lng, pLat: c.lat, approx: false});
      continue;
    }
    const arr = countryOnly.get(c.country);
    if (arr) arr.push(c);
    else countryOnly.set(c.country, [c]);
  }
  for (const [country, members] of countryOnly) {
    const centroid = centroidLLFor(country);
    if (!centroid) continue; // unknown country: table-only, no dot
    members.sort((a, b) => a.id.localeCompare(b.id));
    const [r1] = hashFloats(`country:${country}`, 1);
    for (let i = 0; i < members.length; i++) {
      const angle = r1 * Math.PI * 2 + i * GOLDEN_ANGLE;
      const radius = (5 + 6 * Math.sqrt(i)) * 0.375;
      placed.push({
        ...members[i],
        pLng: centroid[0] + Math.cos(angle) * radius,
        pLat: Math.max(
          -89,
          Math.min(89, centroid[1] + Math.sin(angle) * radius),
        ),
        approx: true,
      });
    }
  }
  return placed;
}

export default forwardRef<GlobeHandle, GlobeProps>(function Globe(
  {visible, selectedIds, onSelectCluster, anchoredCard},
  ref,
) {
  const [rotation, setRotation] = useState<[number, number]>(HOME_ROTATION);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const rotationRef = useRef(rotation);
  rotationRef.current = rotation;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const animRef = useRef<number | null>(null);
  const reducedMotion = useRef(false);
  const pointers = useRef(new Map<number, {x: number; y: number}>());
  const gesture = useRef<{
    startRotation: [number, number];
    startZoom: number;
    startPts: Array<{x: number; y: number}>;
    moved: boolean;
  } | null>(null);
  /* Recent single-pointer samples for flick-to-spin inertia. */
  const trail = useRef<Array<{t: number; x: number; y: number}>>([]);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
  }, []);

  const stopAnim = useCallback(() => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  }, []);
  useEffect(() => stopAnim, [stopAnim]);

  const projection = useMemo(
    () =>
      geoOrthographic()
        .translate([VIEW_W / 2, VIEW_H / 2])
        .scale(BASE_R * zoom)
        .rotate([rotation[0], rotation[1], 0])
        .clipAngle(90)
        .precision(0.5),
    [rotation, zoom],
  );

  const {spherePath, graticulePath, landPath} = useMemo(() => {
    const path = geoPath(projection);
    return {
      spherePath: path({type: 'Sphere'}) ?? '',
      graticulePath: path(geoGraticule10()) ?? '',
      landPath:
        path({
          type: 'MultiPolygon',
          coordinates: globeGeometry.land as unknown as number[][][][],
        }) ?? '',
    };
  }, [projection]);

  const placed = useMemo(() => placeContributorsLL(visible), [visible]);

  /* Cluster in screen space after projecting — same greedy CLUSTER_PX merge
    as the flat map, types never mixed. Far-side dots are dropped first
    (angular distance from the view center > 90°). */
  const clusters = useMemo<GlobeCluster[]>(() => {
    const cLng = -rotation[0] * RAD;
    const cLat = -rotation[1] * RAD;
    const sinC = Math.sin(cLat);
    const cosC = Math.cos(cLat);
    interface Loc {
      key: string;
      sx: number;
      sy: number;
      members: PlacedLL[];
    }
    const byPlace = new Map<string, PlacedLL[]>();
    for (const p of placed) {
      const lat = p.pLat * RAD;
      const cosAngle =
        sinC * Math.sin(lat) +
        cosC * Math.cos(lat) * Math.cos(p.pLng * RAD - cLng);
      if (cosAngle <= 0.05) continue; // behind (or grazing) the horizon
      const key = p.approx
        ? `person:${p.id}`
        : `city:${typeOf(p)}|${p.country}|${p.city}`;
      const arr = byPlace.get(key);
      if (arr) arr.push(p);
      else byPlace.set(key, [p]);
    }
    const locs: Loc[] = [];
    for (const [key, members] of byPlace) {
      const pt = projection([members[0].pLng, members[0].pLat]);
      if (!pt) continue;
      locs.push({key, sx: pt[0], sy: pt[1], members});
    }
    locs.sort(
      (a, b) =>
        b.members.length - a.members.length || a.key.localeCompare(b.key),
    );
    const used = new Array(locs.length).fill(false);
    const out: GlobeCluster[] = [];
    for (let i = 0; i < locs.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      const anchor = locs[i];
      const anchorType = typeOf(anchor.members[0]);
      const members = [...anchor.members];
      for (let j = i + 1; j < locs.length; j++) {
        if (used[j]) continue;
        if (typeOf(locs[j].members[0]) !== anchorType) continue;
        const dx = locs[j].sx - anchor.sx;
        const dy = locs[j].sy - anchor.sy;
        if (dx * dx + dy * dy < CLUSTER_PX * CLUSTER_PX) {
          used[j] = true;
          members.push(...locs[j].members);
        }
      }
      out.push({
        key: anchor.key,
        sx: anchor.sx,
        sy: anchor.sy,
        members,
        approx: members.every(m => m.approx),
        type: anchorType,
        label: clusterLabel(members, anchorType),
      });
    }
    return out;
  }, [placed, projection, rotation]);

  const clampLat = (lat: number) => Math.max(-90, Math.min(90, lat));

  const animateRotation = useCallback(
    (target: [number, number], targetZoom?: number) => {
      stopAnim();
      const toZoom = targetZoom ?? zoomRef.current;
      /* Rotate the short way around. */
      const from: [number, number] = [...rotationRef.current];
      let dLng = target[0] - from[0];
      dLng = ((dLng % 360) + 540) % 360 - 180;
      const to: [number, number] = [from[0] + dLng, clampLat(target[1])];
      if (reducedMotion.current) {
        setRotation(to);
        setZoom(toZoom);
        return;
      }
      const fromZoom = zoomRef.current;
      const start = performance.now();
      const dur = 600;
      const step = (ts: number) => {
        const t = Math.min(1, (ts - start) / dur);
        const e = 1 - Math.pow(1 - t, 3);
        setRotation([
          from[0] + (to[0] - from[0]) * e,
          from[1] + (to[1] - from[1]) * e,
        ]);
        setZoom(fromZoom + (toZoom - fromZoom) * e);
        if (t < 1) animRef.current = requestAnimationFrame(step);
        else animRef.current = null;
      };
      animRef.current = requestAnimationFrame(step);
    },
    [stopAnim],
  );

  const placedById = useMemo(() => {
    const m = new Map<string, PlacedLL>();
    for (const p of placed) m.set(p.id, p);
    return m;
  }, [placed]);

  useImperativeHandle(
    ref,
    () => ({
      focusById: (id: string) => {
        const p = placedById.get(id);
        if (!p) return;
        animateRotation(
          [-p.pLng, -p.pLat],
          Math.max(zoomRef.current, 2),
        );
      },
      zoomBy: (factor: number) => {
        stopAnim();
        setZoom(z => Math.min(Math.max(z * factor, 1), MAX_ZOOM));
      },
      reset: () => {
        animateRotation(HOME_ROTATION, 1);
      },
    }),
    [placedById, animateRotation, stopAnim],
  );

  /* Degrees of rotation per pixel of drag, tuned so the point under the
    cursor roughly follows it at any zoom. */
  const degPerPx = useCallback(() => {
    const svg = svgRef.current;
    const rect = svg?.getBoundingClientRect();
    const pxScale = rect ? VIEW_W / rect.width : 1;
    return (pxScale * 57) / (BASE_R * zoomRef.current);
  }, []);

  /* Non-passive wheel listener (React's onWheel can't preventDefault). */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stopAnim();
      setZoom(z =>
        Math.min(Math.max(z * Math.exp(-e.deltaY * 0.002), 1), MAX_ZOOM),
      );
    };
    svg.addEventListener('wheel', onWheel, {passive: false});
    return () => svg.removeEventListener('wheel', onWheel);
  }, [stopAnim]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      stopAnim();
      (e.target as Element).setPointerCapture?.(e.pointerId);
      pointers.current.set(e.pointerId, {x: e.clientX, y: e.clientY});
      gesture.current = {
        startRotation: [...rotationRef.current],
        startZoom: zoomRef.current,
        startPts: Array.from(pointers.current.values()),
        moved: false,
      };
      trail.current = [{t: performance.now(), x: e.clientX, y: e.clientY}];
      if (pointers.current.size === 1) setDragging(true);
    },
    [stopAnim],
  );

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, {x: e.clientX, y: e.clientY});
    const g = gesture.current;
    const pts = Array.from(pointers.current.values());

    if (pts.length >= 2 && g.startPts.length >= 2) {
      const d0 = Math.hypot(
        g.startPts[0].x - g.startPts[1].x,
        g.startPts[0].y - g.startPts[1].y,
      );
      const d1 = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (d0 > 0 && d1 > 0) {
        setZoom(Math.min(Math.max(g.startZoom * (d1 / d0), 1), MAX_ZOOM));
        g.moved = true;
      }
    } else if (pts.length === 1 && g.startPts.length >= 1) {
      const dx = pts[0].x - g.startPts[0].x;
      const dy = pts[0].y - g.startPts[0].y;
      if (Math.abs(dx) + Math.abs(dy) > 3) g.moved = true;
      const s = degPerPx();
      setRotation([
        g.startRotation[0] + dx * s,
        clampLat(g.startRotation[1] - dy * s),
      ]);
      const now = performance.now();
      trail.current.push({t: now, x: pts[0].x, y: pts[0].y});
      while (trail.current.length > 2 && now - trail.current[0].t > 100) {
        trail.current.shift();
      }
    }
  }, [degPerPx]);

  /* Flick to spin: velocity from the last ~100ms of pointer travel decays
    exponentially (τ = 325ms, the d3-zoom feel). */
  const startInertia = useCallback(
    (vx: number, vy: number) => {
      if (reducedMotion.current) return;
      const speed = Math.hypot(vx, vy);
      if (speed < 0.05) return; // px/ms — below this it reads as a stop
      let last = performance.now();
      let cvx = vx;
      let cvy = vy;
      const step = (ts: number) => {
        const dt = ts - last;
        last = ts;
        const s = degPerPx();
        setRotation(r => [r[0] + cvx * dt * s, clampLat(r[1] - cvy * dt * s)]);
        const decay = Math.exp(-dt / 325);
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
    [degPerPx, stopAnim],
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
          if (dt > 0) {
            startInertia((lastPt.x - first.x) / dt, (lastPt.y - first.y) / dt);
          }
        }
        trail.current = [];
        // keep gesture.moved readable by the click handler for one tick
        setTimeout(() => {
          gesture.current = null;
        }, 0);
      } else if (gesture.current) {
        gesture.current = {
          startRotation: [...rotationRef.current],
          startZoom: zoomRef.current,
          startPts: Array.from(pointers.current.values()),
          moved: gesture.current.moved,
        };
      }
    },
    [startInertia],
  );

  const selectedCluster = anchoredCard
    ? clusters.find(c => c.members.some(m => selectedIds.has(m.id)))
    : undefined;

  return (
    <>
    <svg
      ref={svgRef}
      className={`${styles.mapSvg} ${dragging ? styles.dragging : ''}`}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="group"
      aria-label="Globe of Arrow contributors, workspaces, and manufacturers. Drag to rotate. The same information is available in the table below."
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onDoubleClick={() => {
        stopAnim();
        setZoom(z => Math.min(z * 2, MAX_ZOOM));
      }}
    >
      <path className={styles.globeOcean} d={spherePath} />
      <path className={styles.globeGraticule} d={graticulePath} />
      <path className={styles.land} d={landPath} />
      <path className={styles.globeOutline} d={spherePath} />
      <g>
        {clusters.map(cluster => {
          const n = cluster.members.length;
          const r = n > 1 ? 9 + 2.4 * Math.sqrt(n - 1) : 6.5;
          const isSelected = cluster.members.some(m => selectedIds.has(m.id));
          return (
            <g
              key={cluster.key}
              className={[
                styles.dot,
                cluster.type === 'workspace' ? styles.dotWorkspace : '',
                cluster.type === 'manufacturer' ? styles.dotManufacturer : '',
                isSelected ? styles.dotSelected : '',
              ]
                .filter(Boolean)
                .join(' ')}
              role="button"
              tabIndex={0}
              aria-label={cluster.label}
              onClick={() => {
                if (gesture.current?.moved) return;
                onSelectCluster(cluster.members.map(m => m.id));
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCluster(cluster.members.map(m => m.id));
                }
              }}
            >
              <title>{cluster.label}</title>
              {isSelected && (
                <circle
                  className={styles.selectionRing}
                  cx={cluster.sx}
                  cy={cluster.sy}
                  r={r + 4}
                />
              )}
              <circle
                className={styles.dotCircle}
                cx={cluster.sx}
                cy={cluster.sy}
                r={r}
              />
              {n > 1 && (
                <text
                  className={styles.dotCount}
                  x={cluster.sx}
                  y={cluster.sy}
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
    {anchoredCard &&
      selectedCluster &&
      anchoredCard(selectedCluster.sx / VIEW_W, selectedCluster.sy / VIEW_H)}
    </>
  );
});
