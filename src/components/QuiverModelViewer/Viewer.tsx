import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import type * as THREE from 'three';
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

/** "3111-Motor" -> "3111 Motor" for the hover tooltip. */
function prettyName(raw: string): string {
  return raw.replace(/-/g, ' ');
}

function SubassemblyModel({
  url,
  visible,
  onHover,
}: {
  url: string;
  visible: boolean;
  onHover: (name: string | null) => void;
}): React.JSX.Element {
  const { scene } = useGLTF(url, true); // true = Draco decoder from CDN
  const restore = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());

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
        highlighted.emissive.set('#2563eb');
        highlighted.emissiveIntensity = 0.45;
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
  const [hoverName, setHoverName] = useState<string | null>(null);

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
    <div className={styles.viewer} style={{ height }}>
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
      </aside>
      <div className={styles.canvasWrap}>
        <Canvas camera={{ position: [1.7, 0.8, 1.7], fov: 40 }}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[4, 6, 4]} intensity={1.6} />
          <directionalLight position={[-4, 2, -4]} intensity={0.7} />
          <Suspense fallback={null}>
            {allFiles.map((file) => (
              <SubassemblyModel
                key={file}
                url={`${base}/${file}`}
                visible={!hidden.has(file)}
                onHover={setHoverName}
              />
            ))}
          </Suspense>
          <OrbitControls makeDefault target={[0, -0.15, 0]} maxDistance={8} minDistance={0.3} />
        </Canvas>
        {hoverName && <div className={styles.hoverLabel}>{hoverName}</div>}
        <div className={styles.hint}>drag to orbit · scroll to zoom · hover to identify</div>
      </div>
    </div>
  );
}
