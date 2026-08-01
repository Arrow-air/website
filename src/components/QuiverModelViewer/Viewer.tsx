import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Html, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { QuiverModelViewerProps } from './index';
import styles from './styles.module.css';

interface ManifestModel {
  label: string;
  bom: number;
  file: string;
  bytes: number;
}

interface ManifestCategory {
  label: string;
  bom: number;
  models: ManifestModel[];
}

interface Manifest {
  categories: ManifestCategory[];
}

/** "3112_propeller_1" -> "3112 propeller" (drops dedup suffixes). */
function prettyName(raw: string): string {
  return raw.replace(/_\d+$/, '').replace(/[-_]/g, ' ');
}

// Shared pivot for the exploded view; matches the OrbitControls target.
const EXPLODE_PIVOT = new THREE.Vector3(0, -0.15, 0);

// Scratch vectors for per-frame label math (avoid allocations).
const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();

// 1211/1212 sit between the plates, so the radial explode overlapped the
// upper plate. Send the pair straight down below the lower plate instead;
// the shared direction keeps them together as one unit.
const EXPLODE_DIR_OVERRIDES: {
  pattern?: RegExp;
  match?: (center: THREE.Vector3, size: THREE.Vector3) => boolean;
  worldDir: THREE.Vector3;
}[] = [
  { pattern: /^121[12]/, worldDir: new THREE.Vector3(0, -0.5, 0) },
  // GPS dome and friends (unnamed meshes): wide flat pucks sitting on top
  // of the cap — send them straight up, well above the opened lid.
  {
    match: (center, size) =>
      center.y > 0.09 &&
      size.x > 0.04 &&
      size.z > 0.04 &&
      size.x < 0.12 &&
      size.z < 0.12 &&
      size.y < 0.06,
    worldDir: new THREE.Vector3(0, 0.45, 0),
  },
];

// Slider range; a hinged part reaches its full opening angle at this value.
const EXPLODE_MAX = 1.5;

// Parts that swing open about a hinge line instead of translating. The top
// cap (2412) opens 90° UPWARD about its bottom BACK seam (the antenna side,
// world space) — the front of the lid lifts and it tips back over the rear
// edge like a car hood, staying attached at the seam. `carrier` names the
// part the hinge rides on: the hinge line (and the lid with it) follows the
// carrier's explode translation so the lid stays seated on the enclosure.
const EXPLODE_HINGES: {
  pattern: RegExp;
  carrier?: RegExp;
  point: THREE.Vector3;
  axis: THREE.Vector3;
  maxAngle: number;
}[] = [
  {
    pattern: /^2412/,
    carrier: /^2411/,
    point: new THREE.Vector3(0, 0.05, -0.153),
    axis: new THREE.Vector3(1, 0, 0),
    maxAngle: -Math.PI / 2,
  },
];

// Arrow logomark, rendered onto the top cap (2412) as a decal plane.
const ARROW_LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="244" height="272" viewBox="0 0 244.04 271.73">' +
  '<path d="m203.47 159.39-50.36-11.17-31.09 84.49-31.09-84.49-50.36 11.17 81.45-120.1z" style="fill:#fff;stroke-width:0"/>' +
  '</svg>';
const LOGO_ASPECT = 244.04 / 271.73;

let logoTexture: THREE.Texture | null = null;
function getLogoTexture(): THREE.Texture {
  if (logoTexture) return logoTexture;
  const texture = new THREE.Texture();
  texture.colorSpace = THREE.SRGBColorSpace;
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 460;
    canvas.height = 512;
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    texture.image = canvas;
    texture.needsUpdate = true;
  };
  img.src = `data:image/svg+xml;base64,${btoa(ARROW_LOGO_SVG)}`;
  logoTexture = texture;
  return texture;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface RecolorStyle {
  color: string;
  roughness?: number;
  metalness?: number;
}

// Playground tweak: per-file material overrides. Receives each mesh plus its
// world-space bounding box size, since the motor arm GLB has no useful names.
const CARBON = { color: '#161616', roughness: 0.5, metalness: 0.35 };
const ALUMINUM = { color: '#cfd3d6', roughness: 0.35, metalness: 0.9 };
const DARK_ALUMINUM = { color: '#969ca3', roughness: 0.4, metalness: 0.9 };
const MATTE_BLACK_PLASTIC = { color: '#1d1d1f', roughness: 0.9, metalness: 0.05 };
const ACCENT_BLUE = '#0A43BF';
// PCB component palette: chip blacks, connector silvers, kapton yellows,
// and oranges, picked deterministically per part so the board reads as a
// real populated PCB instead of uniform neutral.
const PCB_BOARD_GREEN: RecolorStyle = {
  color: '#0e7a3a',
  roughness: 0.7,
  metalness: 0.05,
};
const PCB_PALETTE: RecolorStyle[] = [
  { color: '#1b1d20', roughness: 0.85, metalness: 0.05 }, // chip black
  { color: '#b8bcc0', roughness: 0.35, metalness: 0.85 }, // connector silver
  { color: '#1b1d20', roughness: 0.85, metalness: 0.05 },
  { color: '#d9a514', roughness: 0.6, metalness: 0.1 }, // kapton yellow
  { color: '#15803d', roughness: 0.7, metalness: 0.05 }, // component green
  { color: '#b8bcc0', roughness: 0.35, metalness: 0.85 },
  { color: '#c25a12', roughness: 0.6, metalness: 0.1 }, // orange
  { color: '#1b1d20', roughness: 0.85, metalness: 0.05 },
];

const RECOLOR_BY_FILE: Record<
  string,
  (mesh: THREE.Mesh, size: THREE.Vector3) => RecolorStyle | null
> = {
  '3300_pcb.glb': (mesh, size) => {
    const dims = [size.x, size.y, size.z].sort((a, b) => a - b);
    // Thin + large = the board itself; everything else is a component.
    if (dims[0] < 0.004 && dims[2] > 0.035) return PCB_BOARD_GREEN;
    const c = new THREE.Box3()
      .setFromObject(mesh)
      .getCenter(new THREE.Vector3());
    const hash = Math.abs(
      Math.round(c.x * 1e4) * 31 +
        Math.round(c.y * 1e4) * 17 +
        Math.round(c.z * 1e4) * 7,
    );
    return PCB_PALETTE[hash % PCB_PALETTE.length];
  },
  // Carbon fibre props, matte black plastic motors.
  '3100_propulsion.glb': (mesh) => {
    if (/propeller/i.test(mesh.name)) return CARBON;
    if (/motor/i.test(mesh.name)) return MATTE_BLACK_PLASTIC;
    return null;
  },
  // Structural frame (walls, long beams, plates) in metallic aluminum.
  '1200_beams.glb': () => ALUMINUM,
  '1100_plates.glb': () => ALUMINUM,
  '3200_peripheral.glb': () => MATTE_BLACK_PLASTIC,
  '3400_battery.glb': () => DARK_ALUMINUM,
  '1300_landing_gear.glb': (mesh) => {
    if (/^1334/.test(mesh.name)) return { color: ACCENT_BLUE };
    // The foot tips are unnamed SOLIDs; identify them by their baked-in
    // orange CAD color (≈0.85, 0.55, 0.2).
    const { color } = mesh.material as THREE.MeshStandardMaterial;
    if (color.r > 0.7 && color.g > 0.4 && color.g < 0.7 && color.b < 0.35) {
      return { color: ACCENT_BLUE };
    }
    return null;
  },
  // Arm tube + motor mounts in carbon black, small hardware as blue accents.
  '1400_motor_arm.glb': (_mesh, size) => {
    const maxDim = Math.max(size.x, size.y, size.z);
    return maxDim < 0.035 ? { color: ACCENT_BLUE } : CARBON;
  },
};

function SubassemblyModel({
  url,
  visible,
  tint,
  recolor,
  explode = 0,
  label,
  showLabel = false,
  labelIndex = 0,
  onHover,
}: {
  url: string;
  visible: boolean;
  tint?: string;
  recolor?: (mesh: THREE.Mesh, size: THREE.Vector3) => RecolorStyle | null;
  explode?: number;
  label?: string;
  showLabel?: boolean;
  labelIndex?: number;
  onHover: (name: string | null) => void;
}): React.JSX.Element {
  const { scene } = useGLTF(url, true); // true = Draco decoder from CDN
  const restore = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());
  // Eased explode animation: `current` chases the slider target with an
  // ease-in-out tween driven from useFrame.
  const explodeAnim = useRef({ current: 0, from: 0, to: 0, t: 1 });
  // Label anchor: tracks the subassembly's biggest part through the explode.
  const labelGroup = useRef<THREE.Group>(null);
  const labelAnchor = useRef<{ base: THREE.Vector3; dir: THREE.Vector3 } | null>(
    null,
  );
  const labelDivRef = useRef<HTMLDivElement>(null);
  const labelLineRef = useRef<SVGLineElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);
  const labelShown = useRef(true);
  const EXPLODE_TWEEN_SECONDS = 0.8;

  const applyExplode = (value: number) => {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.userData.explodeBase) return;
      if (mesh.userData.hingeAxis) {
        // Swing about the hinge edge instead of translating.
        const angle = (value / EXPLODE_MAX) * mesh.userData.hingeMaxAngle;
        const q = new THREE.Quaternion().setFromAxisAngle(
          mesh.userData.hingeAxis,
          angle,
        );
        mesh.position
          .copy(mesh.userData.explodeBase)
          .sub(mesh.userData.hingePoint)
          .applyQuaternion(q)
          .add(mesh.userData.hingePoint);
        // The hinge rides on its carrier part: follow its explode offset.
        if (mesh.userData.hingeCarrierDir) {
          mesh.position.addScaledVector(mesh.userData.hingeCarrierDir, value);
        }
        mesh.quaternion.copy(q).multiply(mesh.userData.hingeBaseQuat);
        return;
      }
      mesh.position
        .copy(mesh.userData.explodeBase)
        .addScaledVector(mesh.userData.explodeDir, value);
    });
  };

  useEffect(() => {
    // Exploded view: cluster nearby parts (union-find on mesh centers) so
    // each logical component — motor + prop + mount, a landing gear leg, a
    // board with its chips — travels as one rigid unit along the line from
    // the shared pivot through the cluster's center, instead of every
    // individual mesh scattering on its own.
    const CLUSTER_RADIUS = 0.16; // world units; parts closer than this move together
    scene.updateMatrixWorld(true);
    const entries: {
      mesh: THREE.Mesh;
      center: THREE.Vector3;
      size: THREE.Vector3;
    }[] = [];
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || mesh.name === 'ArrowLogo' || mesh.name === 'EdgeMarker') return;
      const box = new THREE.Box3().setFromObject(mesh);
      entries.push({
        mesh,
        center: box.getCenter(new THREE.Vector3()),
        size: box.getSize(new THREE.Vector3()),
      });
    });

    const roots = entries.map((_, i) => i);
    const find = (i: number): number =>
      roots[i] === i ? i : (roots[i] = find(roots[i]));
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        if (entries[i].center.distanceTo(entries[j].center) < CLUSTER_RADIUS) {
          roots[find(i)] = find(j);
        }
      }
    }

    const clusterSums = new Map<number, { sum: THREE.Vector3; count: number }>();
    entries.forEach((entry, i) => {
      const root = find(i);
      const acc = clusterSums.get(root) ?? { sum: new THREE.Vector3(), count: 0 };
      acc.sum.add(entry.center);
      acc.count += 1;
      clusterSums.set(root, acc);
    });

    entries.forEach((entry, i) => {
      const parent = entry.mesh.parent!;
      const override = EXPLODE_DIR_OVERRIDES.find(
        (o) =>
          (o.pattern ? o.pattern.test(entry.mesh.name) : false) ||
          (o.match ? o.match(entry.center, entry.size) : false),
      );
      // Directions in parent space; the translation cancels in the subtraction.
      let dir: THREE.Vector3;
      if (override) {
        dir = parent
          .worldToLocal(entry.center.clone().add(override.worldDir))
          .sub(parent.worldToLocal(entry.center.clone()));
      } else {
        const { sum, count } = clusterSums.get(find(i))!;
        const clusterCenter = sum.clone().divideScalar(count);
        dir = parent
          .worldToLocal(clusterCenter.clone())
          .sub(parent.worldToLocal(EXPLODE_PIVOT.clone()));
      }
      if (!entry.mesh.userData.explodeBase) {
        entry.mesh.userData.explodeBase = entry.mesh.position.clone();
      }
      entry.mesh.userData.explodeDir = dir;
    });

    // Hinged parts: rotate about the configured world-space hinge line
    // rather than translating away.
    EXPLODE_HINGES.forEach(({ pattern, carrier, point, axis, maxAngle }) => {
      const carrierDir = carrier
        ? entries.find((e) => carrier.test(e.mesh.name))?.mesh.userData
            .explodeDir
        : undefined;
      entries
        .filter((e) => pattern.test(e.mesh.name))
        .forEach((e) => {
          if (e.mesh.userData.hingeAxis) return;
          const parent = e.mesh.parent!;
          const p0 = parent.worldToLocal(point.clone());
          const p1 = parent.worldToLocal(point.clone().add(axis));
          e.mesh.userData.hingePoint = p0;
          e.mesh.userData.hingeAxis = p1.sub(p0).normalize();
          e.mesh.userData.hingeBaseQuat = e.mesh.quaternion.clone();
          e.mesh.userData.hingeMaxAngle = maxAngle;
          e.mesh.userData.hingeCarrierDir = carrierDir?.clone();
        });
    });

    // Arrow logomark on top of the cap; parented to the cap mesh so it
    // follows the lid as it hinges open.
    const cap = entries.find((e) => /^2412/.test(e.mesh.name))?.mesh;
    if (cap && !cap.userData.logoAdded) {
      const box = new THREE.Box3().setFromObject(cap);
      const topWorld = new THREE.Vector3(
        (box.min.x + box.max.x) / 2,
        box.max.y + 0.002,
        (box.min.z + box.max.z) / 2,
      );
      const size =
        Math.min(box.max.x - box.min.x, box.max.z - box.min.z) * 0.5;
      const logo = new THREE.Mesh(
        new THREE.PlaneGeometry(size * LOGO_ASPECT, size),
        new THREE.MeshBasicMaterial({
          map: getLogoTexture(),
          transparent: true,
        }),
      );
      logo.name = 'ArrowLogo';
      logo.raycast = () => {}; // not hoverable
      logo.position.copy(cap.worldToLocal(topWorld));
      cap.add(logo);
      cap.userData.logoAdded = true;
    }

    // Label anchor: the center of the subassembly's biggest part, following
    // its explode direction so labels track exploded components.
    if (entries.length) {
      const biggest = entries.reduce((a, b) =>
        a.size.x * a.size.y * a.size.z >= b.size.x * b.size.y * b.size.z ? a : b,
      );
      labelAnchor.current = {
        base: biggest.center.clone(),
        dir: (biggest.mesh.userData.explodeDir as THREE.Vector3).clone(),
      };
    }

    applyExplode(explodeAnim.current.current);
  }, [scene]);

  useEffect(() => {
    const anim = explodeAnim.current;
    if (anim.to === explode) return;
    anim.from = anim.current;
    anim.to = explode;
    anim.t = 0;
  }, [explode]);

  useFrame(({ camera }, delta) => {
    const anim = explodeAnim.current;
    if (anim.t < 1) {
      anim.t = Math.min(1, anim.t + delta / EXPLODE_TWEEN_SECONDS);
      anim.current = anim.from + (anim.to - anim.from) * easeInOutCubic(anim.t);
      applyExplode(anim.current);
    }
    if (labelGroup.current && labelAnchor.current) {
      const pos = labelGroup.current.position
        .copy(labelAnchor.current.base)
        .addScaledVector(labelAnchor.current.dir, anim.current);
      if (labelDivRef.current) {
        // Hide labels on the far hemisphere (relative to the orbit target)
        // so only front annotations show; orbiting reveals the others.
        // Small hysteresis band avoids flicker at the boundary.
        const facing = tmpA
          .copy(pos)
          .sub(EXPLODE_PIVOT)
          .normalize()
          .dot(tmpB.copy(camera.position).sub(EXPLODE_PIVOT).normalize());
        if (labelShown.current && facing < -0.15) labelShown.current = false;
        else if (!labelShown.current && facing > 0) labelShown.current = true;
        labelDivRef.current.style.display = labelShown.current ? '' : 'none';
        // Leader goes left or right based on which half of the screen the
        // part sits in; vertical stagger keeps neighboring chips apart.
        const ndcX = tmpA.copy(pos).project(camera).x;
        const side = ndcX >= 0 ? 1 : -1;
        const dx = side * (44 + (labelIndex % 3) * 14);
        const dy = -14 - (labelIndex % 5) * 14;
        labelLineRef.current?.setAttribute('x2', String(100 + dx));
        labelLineRef.current?.setAttribute('y2', String(80 + dy));
        if (labelTextRef.current) {
          labelTextRef.current.style.left = `${dx + side * 5}px`;
          labelTextRef.current.style.top = `${dy - 10}px`;
          labelTextRef.current.style.transform =
            side < 0 ? 'translateX(-100%)' : '';
        }
      }
    }
  });

  useEffect(() => {
    if (!tint) return;
    // Clone before recoloring: useGLTF caches scenes, and materials can be
    // shared between meshes within a GLB.
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || mesh.name === 'ArrowLogo' || mesh.name === 'EdgeMarker') return;
      const material = (mesh.material as THREE.MeshStandardMaterial).clone();
      material.color.set(tint);
      mesh.material = material;
    });
  }, [scene, tint]);

  useEffect(() => {
    if (!recolor) return;
    scene.updateMatrixWorld(true);
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      if (mesh.name === 'ArrowLogo' || mesh.name === 'EdgeMarker') return;
      const size = new THREE.Box3()
        .setFromObject(mesh)
        .getSize(new THREE.Vector3());
      const style = recolor(mesh, size);
      if (!style) return;
      const material = (mesh.material as THREE.MeshStandardMaterial).clone();
      material.color.set(style.color);
      if (style.roughness !== undefined) material.roughness = style.roughness;
      if (style.metalness !== undefined) material.metalness = style.metalness;
      mesh.material = material;
    });
  }, [scene, recolor]);

  const clearHighlight = () => {
    restore.current.forEach((material, mesh) => {
      mesh.material = material;
    });
    restore.current.clear();
  };

  useEffect(() => clearHighlight, []);

  return (
    <group
      visible={visible}
      onPointerOver={(e) => {
        if (!visible) return;
        e.stopPropagation();
        const mesh = e.object as THREE.Mesh;
        if (!mesh.isMesh || restore.current.has(mesh)) return;
        clearHighlight();
        restore.current.set(mesh, mesh.material);
        const highlighted = (mesh.material as THREE.MeshStandardMaterial).clone();
        highlighted.emissive.set('#3b82f6');
        highlighted.emissiveIntensity = 1.0;
        mesh.material = highlighted;
        onHover(mesh.name ? prettyName(mesh.name) : null);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        clearHighlight();
        onHover(null);
      }}
    >
      <primitive object={scene} />
      {label && showLabel && visible && (
        <group ref={labelGroup}>
          <Html zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
            <div className={styles.componentLabel} ref={labelDivRef}>
              <svg
                className={styles.labelLeader}
                width="200"
                height="160"
                style={{ left: -100, top: -80 }}
              >
                <line ref={labelLineRef} x1={100} y1={80} x2={150} y2={56} />
                <circle cx={100} cy={80} r={2.5} />
              </svg>
              <span className={styles.labelText} ref={labelTextRef}>
                {label}
              </span>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

export default function Viewer({
  modelsBase,
  height,
}: QuiverModelViewerProps & { height: number }): React.JSX.Element {
  const base = modelsBase.replace(/\/$/, '');
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [explode, setExplode] = useState(0); // 0 = assembled, 1.5 = fully exploded
  const [labelsOn, setLabelsOn] = useState(false);
  const [hoverName, setHoverName] = useState<string | null>(null);
  const [treeOpen, setTreeOpen] = useState(true);
  const cursor = useRef({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const trackCursor = (e: React.PointerEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    cursor.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const tip = tooltipRef.current;
    if (tip) {
      tip.style.left = `${cursor.current.x + 14}px`;
      tip.style.top = `${cursor.current.y + 14}px`;
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetch(`${base}/manifest.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Manifest) => !cancelled && setManifest(data))
      .catch((err) => !cancelled && setError(String(err)));
    return () => {
      cancelled = true;
    };
  }, [base]);

  const allFiles = useMemo(
    () => manifest?.categories.flatMap((c) => c.models.map((m) => m.file)) ?? [],
    [manifest],
  );

  const labelByFile = useMemo(() => {
    const map = new Map<string, string>();
    manifest?.categories.forEach((c) =>
      c.models.forEach((m) => map.set(m.file, m.label)),
    );
    return map;
  }, [manifest]);

  // Playground tweak: recolor the Supporting Structure subassemblies (BOM 2000).
  const tintByFile = useMemo(() => {
    const map = new Map<string, string>();
    manifest?.categories
      .filter((c) => c.bom === 2000)
      .forEach((c) => c.models.forEach((m) => map.set(m.file, '#0A43BF')));
    return map;
  }, [manifest]);

  const toggle = (files: string[], show: boolean) => {
    setHidden((prev) => {
      const next = new Set(prev);
      files.forEach((f) => (show ? next.delete(f) : next.add(f)));
      return next;
    });
  };

  if (error) {
    return (
      <div className={styles.error} style={{ height }}>
        Could not load 3D models ({error}). They may not have been generated
        for this build.
      </div>
    );
  }

  return (
    // quiver-model-viewer is a stable global hook used by custom.css to lift
    // the docs content-width caps on pages embedding the viewer.
    <div className={`${styles.viewer} quiver-model-viewer`} style={{ height }}>
      {treeOpen && (
      <aside className={styles.sidebar}>
        <div className={styles.sidebarActions}>
          <button type="button" onClick={() => toggle(allFiles, true)}>
            Show all
          </button>
          <button type="button" onClick={() => setHidden(new Set(allFiles))}>
            Hide all
          </button>
        </div>
        {manifest?.categories.map((cat) => {
          const files = cat.models.map((m) => m.file);
          const shownCount = files.filter((f) => !hidden.has(f)).length;
          // A category whose only model shares its name (e.g. Harness)
          // needs no child checkbox.
          const single = cat.models.length === 1 && cat.models[0].label === cat.label;
          return (
            <div key={cat.label} className={styles.category}>
              <label className={styles.categoryLabel}>
                <input
                  type="checkbox"
                  checked={shownCount === files.length}
                  ref={(el) => {
                    if (el) el.indeterminate = shownCount > 0 && shownCount < files.length;
                  }}
                  onChange={(e) => toggle(files, e.target.checked)}
                />
                {cat.label}
              </label>
              {!single && cat.models.map((m) => (
                <label key={m.file} className={styles.modelLabel}>
                  <input
                    type="checkbox"
                    checked={!hidden.has(m.file)}
                    onChange={(e) => toggle([m.file], e.target.checked)}
                  />
                  {m.label}
                </label>
              ))}
            </div>
          );
        })}
        <div className={styles.sliderControl}>
          <label className={styles.categoryLabel} htmlFor="explode-amount">
            Exploded View
          </label>
          <input
            id="explode-amount"
            type="range"
            min={0}
            max={1.5}
            step={0.01}
            value={explode}
            onChange={(e) => setExplode(Number(e.target.value))}
          />
        </div>
        <div className={styles.sliderControl}>
          <label className={styles.categoryLabel}>
            <input
              type="checkbox"
              checked={labelsOn}
              onChange={(e) => setLabelsOn(e.target.checked)}
            />
            Component Labels
          </label>
        </div>
      </aside>
      )}
      <div className={styles.canvasWrap} ref={wrapRef} onPointerMove={trackCursor}>
        <button
          type="button"
          className={styles.treeToggle}
          onClick={() => setTreeOpen((open) => !open)}
        >
          {treeOpen ? '⟨ hide parts' : '⟩ parts'}
        </button>
        <Canvas camera={{ position: [1.7, 0.8, 1.7], fov: 40 }}>
          <ambientLight intensity={0.3} />
          <hemisphereLight intensity={0.6} color="#ffffff" groundColor="#404550" />
          <directionalLight position={[4, 6, 4]} intensity={1.2} />
          <directionalLight position={[-4, 2, -4]} intensity={0.5} />
          <Suspense fallback={null}>
            {/* Image-based lighting so faces pointing away from the key
                lights still pick up bounce instead of going black. */}
            <Environment preset="city" />
            {allFiles.map((file, i) => (
              <SubassemblyModel
                key={file}
                url={`${base}/${file}`}
                visible={!hidden.has(file)}
                tint={tintByFile.get(file)}
                recolor={RECOLOR_BY_FILE[file]}
                explode={explode}
                label={labelByFile.get(file)}
                showLabel={labelsOn}
                labelIndex={i}
                onHover={setHoverName}
              />
            ))}
          </Suspense>
          <OrbitControls
            makeDefault
            target={[0, -0.15, 0]}
            maxDistance={8}
            minDistance={0.3}
            mouseButtons={{
              LEFT: THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.PAN,
              RIGHT: THREE.MOUSE.PAN,
            }}
          />
        </Canvas>
        {hoverName && (
          <div
            ref={tooltipRef}
            className={styles.hoverLabel}
            style={{ left: cursor.current.x + 14, top: cursor.current.y + 14 }}
          >
            {hoverName}
          </div>
        )}
        <div className={styles.hint}>drag to orbit · scroll to zoom · hover to identify</div>
      </div>
    </div>
  );
}
