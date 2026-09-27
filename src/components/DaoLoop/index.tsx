import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

// The governance loop on Why a DAO?: contribution earns ARROW, ARROW
// votes, votes release funds, funds pay contributors. Each stage lights up
// in turn around the loop.

type Role = 'people' | 'governance' | 'money';
type Node = { title: string; sub: string; role: Role; icon: React.ReactNode };

// 24x24 stroke glyphs, drawn in the node's role color.
const ICONS = {
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19.5c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" />
      <circle cx="16.5" cy="9" r="2.5" />
      <path d="M15.5 14.1c2.8.4 5 2.7 5 5.4" />
    </>
  ),
  // The Arrow logomark (static/img/brand/SVGs/arrow-logomark-white.svg),
  // filled rather than stroked, in its own coordinate space.
  token: (
    <svg x="0" y="0" width="24" height="24" viewBox="30 30 184 212">
      <path
        className={styles.logomark}
        d="m203.47 159.39-50.36-11.17-31.09 84.49-31.09-84.49-50.36 11.17 81.45-120.1z"
      />
    </svg>
  ),
  ballot: (
    <>
      <path d="M8 11V4h8v7" />
      <path d="m10 7.5 1.5 1.5 2.5-3" />
      <rect x="3.5" y="11" width="17" height="9" />
      <path d="M7 14.5h10" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="12" r="4" />
      <path d="M12 12h8.5" />
      <path d="M17.5 12v3" />
      <path d="M20.5 12v2.5" />
    </>
  ),
  vault: (
    <>
      <rect x="3.5" y="4.5" width="17" height="14" />
      <circle cx="12" cy="11.5" r="3.5" />
      <path d="M12 8v1.5M12 13.5V15M8.5 11.5H10M14 11.5h1.5" />
      <path d="M6 18.5V20M18 18.5V20" />
    </>
  ),
  flag: (
    <>
      <path d="M5.5 21V3.5" />
      <path d="M5.5 4h12l-2.5 4 2.5 4h-12" />
    </>
  ),
};

const NODES: Node[] = [
  { title: 'Contributors', sub: 'design, build, fly', role: 'people', icon: ICONS.people },
  { title: 'Token holders', sub: 'own Arrow', role: 'governance', icon: ICONS.token },
  { title: 'Snapshot', sub: '7 days · 2M quorum', role: 'governance', icon: ICONS.ballot },
  { title: 'Multisig', sub: 'signers execute', role: 'money', icon: ICONS.key },
  { title: 'Treasury', sub: 'USDC · ARROW', role: 'money', icon: ICONS.vault },
  { title: 'Project leads', sub: 'run the projects', role: 'people', icon: ICONS.flag },
];

// EDGE_LABELS[i] labels the edge from NODES[i] to NODES[(i + 1) % 6].
const EDGE_LABELS: string[][] = [
  ['earn $ARROW'],
  ['propose & vote'],
  ['passes'],
  ['executes'],
  ['funds budgets'],
  ['bounties &', 'hourly comp'],
];

const STEP_MS = 1400;
const NODE_W_WIDE = 200;

type Point = [number, number];
type EdgeGeo = { d: string; label: Point; anchor: 'start' | 'middle' | 'end' };
type Group = { x: number; y: number; w: number; h: number; title: string; sub: string };
type Layout = { viewBox: string; w: number; h: number; nodes: Point[]; edges: EdgeGeo[]; group?: Group };

// Desktop: two rows, the loop runs clockwise.
const WIDE: Layout = (() => {
  const w = NODE_W_WIDE, h = 72, xs = [20, 340, 660], top = 52, bottom = 282;
  const nodes: Point[] = [
    [xs[0], top], [xs[1], top], [xs[2], top],
    [xs[2], bottom], [xs[1], bottom], [xs[0], bottom],
  ];
  const mt = top + h / 2, mb = bottom + h / 2, midY = (top + h + bottom) / 2;
  return {
    viewBox: '0 0 880 402', w, h, nodes,
    // The build side of the loop: where the aircraft actually get made.
    group: { x: 4, y: 8, w: w + 32, h: bottom + h + 32, title: 'Where the aircraft get built', sub: 'Quiver · Spearhead · Caribou' },
    edges: [
      { d: `M${xs[0] + w} ${mt} H${xs[1]}`, label: [(xs[0] + w + xs[1]) / 2, mt - 12], anchor: 'middle' },
      { d: `M${xs[1] + w} ${mt} H${xs[2]}`, label: [(xs[1] + w + xs[2]) / 2, mt - 12], anchor: 'middle' },
      { d: `M${xs[2] + w / 2} ${top + h} V${bottom}`, label: [xs[2] + w / 2 + 12, midY], anchor: 'start' },
      { d: `M${xs[2]} ${mb} H${xs[1] + w}`, label: [(xs[1] + w + xs[2]) / 2, mb - 12], anchor: 'middle' },
      { d: `M${xs[1]} ${mb} H${xs[0] + w}`, label: [(xs[0] + w + xs[1]) / 2, mb - 12], anchor: 'middle' },
      { d: `M${xs[0] + w / 2} ${bottom} V${top + h}`, label: [xs[0] + w / 2 + 12, midY], anchor: 'start' },
    ],
  };
})();

// Phone: one column, the return edge runs up the left side.
const NARROW: Layout = (() => {
  const w = 210, h = 64, x = 120, gap = 108, top = 10;
  const nodes: Point[] = NODES.map((_, i) => [x, top + i * gap]);
  const cx = x + w / 2;
  const edges: EdgeGeo[] = NODES.slice(0, 5).map((_, i) => {
    const y1 = top + i * gap + h, y2 = top + (i + 1) * gap;
    return { d: `M${cx} ${y1} V${y2}`, label: [cx + 12, (y1 + y2) / 2], anchor: 'start' };
  });
  const yLast = top + 5 * gap + h / 2, yFirst = top + h / 2, side = 84;
  edges.push({ d: `M${x} ${yLast} H${side} V${yFirst} H${x}`, label: [side - 10, (yLast + yFirst) / 2], anchor: 'end' });
  return { viewBox: `0 0 340 ${top + 5 * gap + h + 10}`, w, h, nodes, edges };
})();

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// An edge label: plain text, vertically centred on `at`.
function EdgeLabel({ at, lines, anchor }: { at: Point; lines: string[]; anchor: EdgeGeo['anchor'] }) {
  const lineH = 12;
  const [x, y] = at;
  return (
    <text x={x} y={y - ((lines.length - 1) * lineH) / 2 + 3.5} textAnchor={anchor} className={styles.edgeLabel}>
      {lines.map((line, j) => (
        <tspan key={j} x={x} dy={j === 0 ? 0 : lineH}>{line}</tspan>
      ))}
    </text>
  );
}

function Diagram({ layout, step, still, id }: { layout: Layout; step: number; still: boolean; id: string }) {
  const arrowId = `${id}-arrow`;
  const active = (step + 1) % NODES.length; // the stage currently lit
  const tile = 34;
  return (
    <svg viewBox={layout.viewBox} className={styles.svg} role="img" aria-labelledby={`${id}-title`}>
      <title id={`${id}-title`}>
        Arrow's governance loop, which exists to fund building aircraft such as Quiver, Spearhead and Caribou: contributors earn ARROW, token holders propose and vote on Snapshot,
        the multisig executes, the treasury funds project budgets, and project leads pay contributors
        through bounties and hourly compensation.
      </title>
      <defs>
        <marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" className={styles.arrowHead} />
        </marker>
      </defs>

      {layout.group ? (
        <g className={styles.group}>
          <rect x={layout.group.x} y={layout.group.y} width={layout.group.w} height={layout.group.h} />
          <text x={layout.group.x + layout.group.w / 2} y={layout.group.y + 26} textAnchor="middle" className={styles.groupTitle}>
            {layout.group.title}
          </text>
          <text x={layout.group.x + layout.group.w / 2} y={layout.group.y + layout.group.h - 13} textAnchor="middle" className={styles.groupSub}>
            {layout.group.sub}
          </text>
        </g>
      ) : null}

      {layout.edges.map((e, i) => (
        <path key={`e${i}`} id={`${id}-edge-${i}`} d={e.d} className={styles.edge} markerEnd={`url(#${arrowId})`} />
      ))}

      {layout.nodes.map(([x, y], i) => {
        const n = NODES[i];
        const tx = x + 14, ty = y + (layout.h - tile) / 2;
        const textX = tx + tile + 12;
        return (
          <g key={`n${i}`} className={`${styles[n.role]} ${!still && i === active ? styles.nodeActive : ''}`}>
            <rect x={x} y={y} width={layout.w} height={layout.h} className={styles.nodeBox} />
            <rect x={tx} y={ty} width={tile} height={tile} className={styles.tile} />
            <g transform={`translate(${tx + (tile - 20) / 2} ${ty + (tile - 20) / 2}) scale(${20 / 24})`} className={styles.icon}>
              {n.icon}
            </g>
            <text x={textX} y={y + layout.h / 2 - 3} className={styles.nodeTitle}>{n.title}</text>
            <text x={textX} y={y + layout.h / 2 + 14} className={styles.nodeSub}>{n.sub}</text>
          </g>
        );
      })}

      {layout.edges.map((e, i) => <EdgeLabel key={`l${i}`} at={e.label} lines={EDGE_LABELS[i]} anchor={e.anchor} />)}

    </svg>
  );
}

export function DaoLoop(): React.JSX.Element {
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Only animate while the figure is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || paused || !visible) return;
    const t = window.setInterval(() => setStep((s) => (s + 1) % EDGE_LABELS.length), STEP_MS);
    return () => window.clearInterval(t);
  }, [reduced, paused, visible]);

  return (
    <figure
      ref={ref}
      className={styles.figure}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.wide}><Diagram layout={WIDE} step={step} still={reduced} id="dao-loop-wide" /></div>
      <div className={styles.narrow}><Diagram layout={NARROW} step={step} still={reduced} id="dao-loop-narrow" /></div>
      <figcaption className={styles.caption}>
        <span className={styles.key}><i className={styles.keyPeople} />Building</span>
        <span className={styles.key}><i className={styles.keyGovernance} />Governance</span>
        <span className={styles.key}><i className={styles.keyMoney} />Funds</span>
        <span className={styles.captionText}>
          The loop exists to keep aircraft getting built. Building earns ownership, ownership steers the treasury, and the treasury funds the next round of building.
        </span>
      </figcaption>
    </figure>
  );
}

export default DaoLoop;
