// Experimental app: interactive 3D overview for an aircraft.
// Loads the Quiver web-export GLBs (Draco) and lets the user orbit, hover a
// component to highlight it in the project colour, and click it to drill in.
// Low fidelity on purpose; materials are a flat neutral scheme per subassembly.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const DRACO_PATH = 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/';

const SCHEME = {
  '1100_plates.glb': { color: '#9aa0a6', roughness: 0.35, metalness: 0.85 },
  '1200_beams.glb': { color: '#9aa0a6', roughness: 0.35, metalness: 0.85 },
  '1300_landing_gear.glb': { color: '#2a2c30', roughness: 0.8, metalness: 0.1 },
  '1400_motor_arm.glb': { color: '#1b1d20', roughness: 0.55, metalness: 0.3 },
  '2100_attachment_interface.glb': { color: '#3a3d42', roughness: 0.7, metalness: 0.2 },
  '2200_battery_slider.glb': { color: '#3a3d42', roughness: 0.7, metalness: 0.2 },
  '2300_equipment_mount.glb': { color: '#3a3d42', roughness: 0.7, metalness: 0.2 },
  '2400_cockpit_enclosure.glb': { color: '#3a3d42', roughness: 0.7, metalness: 0.2 },
  '3100_propulsion.glb': { color: '#1b1d20', roughness: 0.55, metalness: 0.3 },
  '3200_peripheral.glb': { color: '#26282c', roughness: 0.85, metalness: 0.05 },
  '3300_pcb.glb': { color: '#14532d', roughness: 0.7, metalness: 0.05 },
  '3400_battery.glb': { color: '#4b4f57', roughness: 0.5, metalness: 0.6 },
  '4000_harness.glb': { color: '#1b1d20', roughness: 0.9, metalness: 0.0 },
};

function prettyName(raw) {
  return (raw || 'component').replace(/_\d+$/, '').replace(/[-_]/g, ' ');
}

const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath(DRACO_PATH);
loader.setDRACOLoader(draco);

const cache = new Map();
function loadGLB(url) {
  if (!cache.has(url)) {
    cache.set(url, new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject)));
  }
  return cache.get(url);
}

export async function mount(el, opts) {
  const base = (opts.base || '/app-models').replace(/\/$/, '');
  const accent = new THREE.Color(opts.accent || '#218191');
  const focus = opts.focus || null; // { file, mesh } to isolate one component
  const onHover = opts.onHover || (() => {});
  const onPick = opts.onPick || (() => {});

  const manifest = await (await fetch(base + '/manifest.json')).json();
  const entries = [];
  manifest.categories.forEach((c) => c.models.forEach((m) => entries.push({ ...m, category: c.label })));
  const wanted = focus ? entries.filter((e) => e.file === focus.file) : entries;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  el.appendChild(renderer.domElement);
  renderer.domElement.style.display = 'block';

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(4, 6, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5);
  fill.position.set(-4, 2, -4);
  scene.add(fill);

  const root = new THREE.Group();
  scene.add(root);

  const pickables = [];
  const gltfs = await Promise.all(wanted.map((e) => loadGLB(base + '/' + e.file)));
  gltfs.forEach((gltf, i) => {
    const entry = wanted[i];
    const style = SCHEME[entry.file] || { color: '#6b6f79', roughness: 0.6, metalness: 0.2 };
    gltf.scene.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.material = new THREE.MeshStandardMaterial(style);
      obj.userData.file = entry.file;
      obj.userData.system = entry.label;
      obj.userData.category = entry.category;
      obj.userData.label = prettyName(obj.name);
      obj.userData.baseMaterial = obj.material;
      pickables.push(obj);
    });
    root.add(gltf.scene);
  });

  // Fit camera: whole assembly, or the focused component.
  let target = null;
  if (focus) {
    target = pickables.find((m) => m.name === focus.mesh) || null;
    pickables.forEach((m) => {
      if (m !== target) {
        m.material = m.material.clone();
        m.material.transparent = true;
        m.material.opacity = 0.12;
        m.userData.baseMaterial = m.material;
      }
    });
  }
  const box = new THREE.Box3().setFromObject(target || root);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.x, size.y, size.z) * 0.5 || 0.5;
  const dist = radius / Math.tan((camera.fov * Math.PI) / 360) * 1.35;
  camera.position.set(center.x + dist * 0.75, center.y + dist * 0.45, center.z + dist * 0.75);
  controls.target.copy(center);
  controls.minDistance = radius * 0.4;
  controls.maxDistance = dist * 4;
  camera.near = Math.max(dist / 500, 0.001);
  camera.far = dist * 20;
  camera.updateProjectionMatrix();
  controls.update();

  // Highlight
  const highlightMat = (mat) => {
    const m = mat.clone();
    m.transparent = false;
    m.opacity = 1;
    m.color.lerp(accent, 0.55);
    m.emissive.copy(accent);
    m.emissiveIntensity = 0.85;
    return m;
  };
  let hovered = null;
  const setHover = (mesh) => {
    if (hovered === mesh) return;
    if (hovered) hovered.material = hovered.userData.baseMaterial;
    hovered = mesh;
    if (hovered) hovered.material = highlightMat(hovered.userData.baseMaterial);
    renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab';
    onHover(hovered ? { ...hovered.userData, mesh: hovered.name } : null);
  };
  if (target) target.material = highlightMat(target.userData.baseMaterial);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let downAt = null;
  const pick = (ev) => {
    const r = renderer.domElement.getBoundingClientRect();
    pointer.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickables, false);
    const hit = hits.find((h) => h.object.material.opacity === undefined || h.object.material.opacity > 0.5);
    return hit ? hit.object : null;
  };
  const onMove = (ev) => { if (!focus) setHover(pick(ev)); };
  const onLeave = () => setHover(null);
  const onDown = (ev) => { downAt = [ev.clientX, ev.clientY]; };
  const onUp = (ev) => {
    if (!downAt || focus) return;
    const moved = Math.hypot(ev.clientX - downAt[0], ev.clientY - downAt[1]);
    downAt = null;
    if (moved > 4) return; // it was an orbit drag
    const m = pick(ev);
    if (m) onPick({ ...m.userData, mesh: m.name });
  };
  renderer.domElement.addEventListener('pointermove', onMove);
  renderer.domElement.addEventListener('pointerleave', onLeave);
  renderer.domElement.addEventListener('pointerdown', onDown);
  renderer.domElement.addEventListener('pointerup', onUp);
  renderer.domElement.style.cursor = 'grab';

  // Size + loop
  const resize = () => {
    const w = el.clientWidth || 1;
    const h = el.clientHeight || 1;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(el);
  resize();

  let alive = true;
  const tick = () => {
    if (!alive) return;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  tick();

  return {
    dispose() {
      alive = false;
      ro.disconnect();
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerleave', onLeave);
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      controls.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    },
  };
}
