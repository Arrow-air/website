import React from 'react';
import { FlowDiagram, FlowLayout, FlowNode } from './FlowDiagram';

// Animated explainers built on FlowDiagram. Icons are 24x24 stroke glyphs.
const I = {
  chat: <path d="M4 5h16v11H9.5L5 20v-4H4z" />,
  cube: (<><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" /></>),
  wrench: (<><path d="M14.7 6.3a4 4 0 0 0 5 5" /><path d="M14.7 6.3a4 4 0 0 1 5 5L10 21a2.1 2.1 0 0 1-3-3z" /></>),
  drone: (
    <>
      <circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="18" r="2.5" />
      <path d="M7.8 7.8l2.2 2.2M16.2 7.8L14 10M7.8 16.2L10 14M16.2 16.2L14 14" /><rect x="10" y="10" width="4" height="4" />
    </>
  ),
  share: (<><path d="M4 10v4h3l6 4V6L7 10z" /><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11" /></>),
  bulb: (<><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z" /></>),
  doc: (<><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>),
  people: (<><circle cx="9" cy="8" r="3" /><path d="M3.5 19.5c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" /><circle cx="16.5" cy="9" r="2.5" /><path d="M15.5 14.1c2.8.4 5 2.7 5 5.4" /></>),
  poll: (<><path d="M5 20V10M12 20V4M19 20v-7" /><path d="M3 20h18" /></>),
  bell: (<><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" /><path d="M10 21h4" /></>),
  ballot: (<><path d="M8 11V4h8v7" /><path d="m10 7.5 1.5 1.5 2.5-3" /><rect x="3.5" y="11" width="17" height="9" /><path d="M7 14.5h10" /></>),
  check: (<><circle cx="12" cy="12" r="8.5" /><path d="m8 12.5 2.5 2.5L16 9.5" /></>),
  pause: (<><circle cx="12" cy="12" r="8.5" /><path d="M10 9v6M14 9v6" /></>),
  factory: (<><path d="M3 20V10l5 3v-3l5 3V5h4l2 15z" /><path d="M3 20h18" /></>),
  box: (<><path d="M4 8l8-4 8 4v8l-8 4-8-4z" /><path d="M4 8l8 4 8-4M12 12v8" /></>),
  vault: (<><rect x="3.5" y="4.5" width="17" height="14" /><circle cx="12" cy="11.5" r="3.5" /><path d="M12 8v1.5M12 13.5V15M8.5 11.5H10M14 11.5h1.5" /><path d="M6 18.5V20M18 18.5V20" /></>),
};

// Phone layout helper: one column, consecutive nodes joined top to bottom.
function column(n: number, gap: number, h = 64, extraW = 0): Pick<FlowLayout, 'w' | 'h' | 'nodes'> & { x: number; cx: number; y: (i: number) => number; mid: (i: number) => number; width: number } {
  const x = 120, w = 210, top = 10;
  const y = (i: number) => top + i * gap;
  return { x, w, h, nodes: Array.from({ length: n }, (_, i) => [x, y(i)] as [number, number]), cx: x + w / 2, y, mid: (i) => y(i) + h / 2, width: 340 + extraW };
}

// ---------------------------------------------------------------------------
// How an aircraft gets made at Arrow (About Arrow)

const BUILD_NODES: FlowNode[] = [
  { title: 'Propose', sub: 'forum, AIP or project', role: 'decide', icon: I.chat },
  { title: 'Design', sub: 'open CAD and code', role: 'build', icon: I.cube },
  { title: 'Build', sub: 'workshops worldwide', role: 'build', icon: I.wrench },
  { title: 'Fly & test', sub: 'every flight logged', role: 'build', icon: I.drone },
  { title: 'Share', sub: 'results, posts, docs', role: 'value', icon: I.share },
];

const BUILD_WIDE: FlowLayout = {
  viewBox: '0 0 880 342', w: 200, h: 72,
  nodes: [[20, 40], [340, 40], [660, 40], [660, 250], [340, 250]],
  edges: [
    { d: 'M220 76 H340', label: ['funded'], at: [280, 64] },
    { d: 'M540 76 H660', label: ['parts &', 'files'], at: [600, 57] },
    { d: 'M760 112 V250', label: ['ready to fly'], at: [772, 181], anchor: 'start' },
    { d: 'M660 286 H540', label: ['what we', 'learned'], at: [600, 267] },
    { d: 'M440 250 V112', label: ['next revision'], at: [452, 181], anchor: 'start' },
  ],
};

const bc = column(5, 104);
const BUILD_NARROW: FlowLayout = {
  viewBox: `0 0 ${bc.width} ${bc.y(4) + bc.h + 10}`, w: bc.w, h: bc.h, nodes: bc.nodes,
  edges: [
    ...[0, 1, 2, 3].map((i) => ({ d: `M${bc.cx} ${bc.y(i) + bc.h} V${bc.y(i + 1)}` })),
    { d: `M${bc.x} ${bc.mid(4)} H86 V${bc.mid(1)} H${bc.x}`, label: ['next', 'revision'], at: [78, (bc.mid(4) + bc.mid(1)) / 2] as [number, number], anchor: 'end' as const },
  ],
};

export function BuildLoop(): React.JSX.Element {
  return (
    <FlowDiagram
      id="build-loop"
      description="How an aircraft gets made at Arrow: an idea is proposed and funded, designed in the open on GitHub, built by workshops and community builders, flown and tested, and the results are shared, which feeds the next design revision."
      nodes={BUILD_NODES}
      wide={BUILD_WIDE}
      narrow={BUILD_NARROW}
      steps={[{ node: 0 }, { node: 1, edge: 0 }, { node: 2, edge: 1 }, { node: 3, edge: 2 }, { node: 4, edge: 3 }, { node: 1, edge: 4 }]}
      legend={[{ role: 'decide', label: 'Decide' }, { role: 'build', label: 'Build' }, { role: 'value', label: 'Share' }]}
      caption="Every aircraft goes round this loop more than once. Each flight teaches us something, and what we learn goes straight into the next revision, in public."
    />
  );
}

// ---------------------------------------------------------------------------
// The AIP lifecycle (AIP Process), per AIP-001

const AIP_NODES: FlowNode[] = [
  { title: 'Idea', sub: 'Discord and forum', role: 'build', icon: I.bulb },
  { title: 'Draft', sub: 'PR, editor merges', role: 'build', icon: I.doc },
  { title: 'Review', sub: 'community feedback', role: 'build', icon: I.people },
  { title: 'Sentiment poll', sub: 'informal check', role: 'decide', icon: I.poll },
  { title: 'Last Call', sub: 'editors announce', role: 'decide', icon: I.bell },
  { title: 'Snapshot vote', sub: 'token holders vote', role: 'decide', icon: I.ballot },
  { title: 'Final', sub: 'or Living', role: 'value', icon: I.check },
  { title: 'Stagnant', sub: 'or withdrawn', role: 'muted', icon: I.pause },
];

const AIP_WIDE: FlowLayout = {
  viewBox: '0 0 880 322', w: 194, h: 72,
  nodes: [[10, 30], [232, 30], [454, 30], [676, 30], [676, 230], [454, 230], [232, 230], [10, 230]],
  edges: [
    { d: 'M204 66 H232' },
    { d: 'M426 66 H454' },
    { d: 'M648 66 H676' },
    { d: 'M823 102 V230', label: ['positive'], at: [811, 166], anchor: 'end' },
    { d: 'M676 266 H648' },
    { d: 'M454 266 H426' },
    { d: 'M700 230 V160 H551 V102', label: ['big changes:', 'back to Review'], at: [626, 140], optional: true },
    { d: 'M250 102 V180 H107 V230', label: ['inactive', 'too long'], at: [178, 160], optional: true },
  ],
};

const ac = column(8, 92, 60);
const AIP_NARROW: FlowLayout = {
  viewBox: `0 0 380 ${ac.y(7) + ac.h + 10}`, w: ac.w, h: ac.h, nodes: ac.nodes,
  edges: [
    ...[0, 1, 2, 3, 4, 5].map((i) => ({ d: `M${ac.cx} ${ac.y(i) + ac.h} V${ac.y(i + 1)}` })),
    { d: `M${ac.x} ${ac.mid(4)} H86 V${ac.mid(2)} H${ac.x}`, label: ['big', 'changes'], at: [78, (ac.mid(4) + ac.mid(2)) / 2] as [number, number], anchor: 'end' as const, optional: true },
    { d: `M${ac.x + ac.w} ${ac.mid(1)} H356 V${ac.mid(7)} H${ac.x + ac.w}`, optional: true },
  ],
};

export function AipLifecycle(): React.JSX.Element {
  return (
    <FlowDiagram
      id="aip-lifecycle"
      description="The AIP lifecycle from AIP-001: an idea is discussed, drafted as a pull request, reviewed by the community, checked with a sentiment poll, announced for Last Call by the editors, voted on in Snapshot, and becomes Final or Living. Big changes at Last Call send it back to Review, and an AIP left inactive becomes Stagnant."
      nodes={AIP_NODES}
      wide={AIP_WIDE}
      narrow={AIP_NARROW}
      steps={[0, 1, 2, 3, 4, 5, 6].map((n) => ({ node: n, edge: n === 0 ? undefined : n - 1 }))}
      legend={[{ role: 'build', label: 'Authoring' }, { role: 'decide', label: 'Decision' }, { role: 'value', label: 'Outcome' }]}
      caption="Most of an AIP's life is spent in Review, in the open. A vote that doesn't pass sends it back to Draft, or to Stagnant if nobody picks it up."
    />
  );
}

// ---------------------------------------------------------------------------
// The manufacturing network (Manufacturing), per AIP-009

const MFG_NODES: FlowNode[] = [
  { title: 'Open designs', sub: 'the parts catalog', role: 'build', icon: I.cube },
  { title: 'Manufacturers', sub: 'bonded, build locally', role: 'build', icon: I.factory },
  { title: 'Customers', sub: 'order from the shop', role: 'decide', icon: I.box },
  { title: 'Treasury', sub: 'the DAO', role: 'value', icon: I.vault },
];

const MFG_WIDE: FlowLayout = {
  viewBox: '0 0 880 342', w: 200, h: 72,
  nodes: [[20, 40], [340, 40], [660, 40], [340, 250]],
  edges: [
    { d: 'M220 76 H340', label: ['designs &', 'orders'], at: [280, 57] },
    { d: 'M540 76 H660', label: ['Arrow-quality', 'aircraft'], at: [600, 57] },
    { d: 'M440 112 V250', label: ['commission +', '$ARROW bond'], at: [452, 181], anchor: 'start' },
    { d: 'M340 286 H120 V112', label: ['funds the', 'next design'], at: [230, 267] },
  ],
};

const mc = column(4, 104);
const MFG_NARROW: FlowLayout = {
  viewBox: `0 0 380 ${mc.y(3) + mc.h + 10}`, w: mc.w, h: mc.h, nodes: mc.nodes,
  edges: [
    { d: `M${mc.cx} ${mc.y(0) + mc.h} V${mc.y(1)}` },
    { d: `M${mc.cx} ${mc.y(1) + mc.h} V${mc.y(2)}` },
    { d: `M${mc.x + mc.w} ${mc.mid(1)} H356 V${mc.mid(3)} H${mc.x + mc.w}` },
    { d: `M${mc.x} ${mc.mid(3)} H86 V${mc.mid(0)} H${mc.x}`, label: ['funds next', 'design'], at: [78, (mc.mid(3) + mc.mid(0)) / 2] as [number, number], anchor: 'end' as const },
  ],
};

export function ManufacturingNetwork(): React.JSX.Element {
  return (
    <FlowDiagram
      id="mfg-network"
      description="Arrow's manufacturing model from AIP-009: open designs and customer orders go to bonded community manufacturers, who build and ship Arrow-quality aircraft to customers and pay a commission to the DAO treasury, which funds the next design."
      nodes={MFG_NODES}
      wide={MFG_WIDE}
      narrow={MFG_NARROW}
      steps={[{ node: 0 }, { node: 1, edge: 0 }, { node: 2, edge: 1 }, { node: 3, edge: 2 }, { node: 0, edge: 3 }]}
      legend={[{ role: 'build', label: 'Build' }, { role: 'decide', label: 'Customers' }, { role: 'value', label: 'Value back to Arrow' }]}
      caption="Design globally, build locally. Anyone can build from the open designs; bonded manufacturers sell official Arrow products, and a share of every sale funds what Arrow designs next."
    />
  );
}
