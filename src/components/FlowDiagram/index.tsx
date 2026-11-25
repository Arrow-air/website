import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

// A stepped, animated flow diagram in the same visual language as DaoLoop:
// boxed nodes with a role-coloured icon tile, dashed edges, and one stage lit
// at a time. Each step lights a node and (optionally) the edge leading into
// it. Wide and phone layouts are drawn separately; motion stops for
// prefers-reduced-motion and while the figure is off screen or hovered.

export type Role = 'build' | 'decide' | 'value' | 'muted';
export type Point = [number, number];
export type FlowNode = { title: string; sub: string; role: Role; icon: React.ReactNode };
export type FlowEdge = { d: string; label?: string[]; at?: Point; anchor?: 'start' | 'middle' | 'end'; optional?: boolean };
export type FlowLayout = { viewBox: string; w: number; h: number; nodes: Point[]; edges: FlowEdge[] };
export type FlowStep = { node: number; edge?: number };

type Props = {
  id: string;
  description: string;
  nodes: FlowNode[];
  wide: FlowLayout;
  narrow: FlowLayout;
  steps: FlowStep[];
  legend: { role: Role; label: string }[];
  caption: React.ReactNode;
  stepMs?: number;
};

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

function EdgeLabel({ edge }: { edge: FlowEdge }) {
  if (!edge.label || !edge.at) return null;
  const lineH = 14;
  const [x, y] = edge.at;
  return (
    <text x={x} y={y - ((edge.label.length - 1) * lineH) / 2 + 4} textAnchor={edge.anchor ?? 'middle'} className={styles.edgeLabel}>
      {edge.label.map((line, j) => (
        <tspan key={j} x={x} dy={j === 0 ? 0 : lineH}>{line}</tspan>
      ))}
    </text>
  );
}

function Diagram({ p, layout, step, still, id }: { p: Props; layout: FlowLayout; step: number; still: boolean; id: string }) {
  const tile = 34;
  const cur = p.steps[step];
  const activeRole = p.nodes[cur.node].role;
  return (
    <svg viewBox={layout.viewBox} className={styles.svg} role="img" aria-labelledby={`${id}-title`}>
      <title id={`${id}-title`}>{p.description}</title>
      <defs>
        <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" className={styles.arrowHead} />
        </marker>
        <marker id={`${id}-arrow-on`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse" className={styles[activeRole]}>
          <path d="M0 0 L10 5 L0 10 z" className={styles.arrowHeadOn} />
        </marker>
      </defs>

      {layout.edges.map((e, i) => {
        const on = !still && cur.edge === i;
        return (
          <path
            key={`e${i}`}
            d={e.d}
            className={`${styles.edge} ${e.optional ? styles.edgeOptional : ''} ${on ? `${styles.edgeOn} ${styles[activeRole]}` : ''}`}
            markerEnd={`url(#${id}-arrow${on ? '-on' : ''})`}
          />
        );
      })}

      {layout.nodes.map(([x, y], i) => {
        const n = p.nodes[i];
        const tx = x + 14, ty = y + (layout.h - tile) / 2;
        const textX = tx + tile + 12;
        const on = !still && cur.node === i;
        return (
          <g key={`n${i}`} className={`${styles[n.role]} ${on ? styles.nodeActive : ''}`}>
            <rect x={x} y={y} width={layout.w} height={layout.h} className={styles.nodeBox} />
            <rect x={tx} y={ty} width={tile} height={tile} className={styles.tile} />
            <g transform={`translate(${tx + (tile - 20) / 2} ${ty + (tile - 20) / 2}) scale(${20 / 24})`} className={styles.icon}>
              {n.icon}
            </g>
            <text x={textX} y={y + layout.h / 2 - 5} className={styles.nodeTitle}>{n.title}</text>
            <text x={textX} y={y + layout.h / 2 + 15} className={styles.nodeSub}>{n.sub}</text>
          </g>
        );
      })}

      {layout.edges.map((e, i) => <EdgeLabel key={`l${i}`} edge={e} />)}
    </svg>
  );
}

export function FlowDiagram(p: Props): React.JSX.Element {
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || paused || !visible) return;
    const t = window.setInterval(() => setStep((s) => (s + 1) % p.steps.length), p.stepMs ?? 1400);
    return () => window.clearInterval(t);
  }, [reduced, paused, visible, p.steps.length, p.stepMs]);

  return (
    <figure ref={ref} className={styles.figure} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className={styles.wide}><Diagram p={p} layout={p.wide} step={step} still={reduced} id={`${p.id}-wide`} /></div>
      <div className={styles.narrow}><Diagram p={p} layout={p.narrow} step={step} still={reduced} id={`${p.id}-narrow`} /></div>
      <figcaption className={styles.caption}>
        {p.legend.map((l) => (
          <span key={l.role} className={`${styles.key} ${styles[l.role]}`}><i />{l.label}</span>
        ))}
        <span className={styles.captionText}>{p.caption}</span>
      </figcaption>
    </figure>
  );
}

export default FlowDiagram;
