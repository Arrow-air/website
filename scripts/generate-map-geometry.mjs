#!/usr/bin/env node
// Generates src/data/world-map-geometry.json for <ContributorMap /> from the
// Natural Earth 50m dataset (world-atlas npm package) plus NE admin-1
// boundary lines. Run once and commit the output; re-run only if the
// projection, sizing, or dataset changes:
//
//   node scripts/generate-map-geometry.mjs
//
// Output: { width, height, fit: {scale, tx, ty}, countries: [{name, d}],
//           centroids: {countryName: [x, y]}, borders }
// Centroids are the bbox centers of each country's largest polygon (avoids
// e.g. France's centroid drifting into the Atlantic because of overseas
// territories) and are used to place country-only contributors.
// `borders` is a single path of internal first-level admin boundaries
// (US states, Canadian provinces, …) plus the UK home-nation borders,
// rendered by the component as a subtle stroke.

import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {feature} from 'topojson-client';
import {naturalEarth1Raw} from '../src/components/ContributorMap/projection.js';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const WIDTH = 960;
const RAD = Math.PI / 180;
const PRECISION = 10; // one decimal place

// Natural Earth extras not shipped by world-atlas, pinned for
// reproducibility; cached in the OS tmpdir across runs.
const NE_BASE =
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/';
const NE_BASE_FALLBACK =
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
const ADMIN1_LINES_FILE = 'ne_50m_admin_1_states_provinces_lines.geojson';
const SUBUNITS_FILE = 'ne_50m_admin_0_map_subunits.geojson';

// Countries whose internal admin-1 borders are drawn (everything the NE 50m
// lines dataset covers). The UK is handled separately via map subunits.
const BORDER_COUNTRIES = new Set([
    'United States of America',
    'Canada',
    'Australia',
    'Brazil',
    'Russia',
    'India',
    'China',
    'Indonesia',
    'South Africa',
]);

async function fetchNe(file) {
    const cacheDir = join(tmpdir(), 'arrow-map-ne-cache');
    const cached = join(cacheDir, file);
    if (existsSync(cached)) return JSON.parse(readFileSync(cached, 'utf8'));
    let res = await fetch(NE_BASE + file);
    if (!res.ok) res = await fetch(NE_BASE_FALLBACK + file);
    if (!res.ok) throw new Error(`fetch ${file}: HTTP ${res.status}`);
    const text = await res.text();
    mkdirSync(cacheDir, {recursive: true});
    writeFileSync(cached, text);
    return JSON.parse(text);
}

const topo = JSON.parse(
    readFileSync(require.resolve('world-atlas/countries-50m.json'), 'utf8'),
);
const countriesGeo = feature(topo, topo.objects.countries);

// --- Fit: scale the projected sphere to WIDTH, y-flipped, top-left origin ---
let minX = Infinity;
let maxX = -Infinity;
let minY = Infinity;
let maxY = -Infinity;
for (let lng = -180; lng <= 180; lng += 0.5) {
    for (const lat of [-90, 90]) {
        const [x, y] = naturalEarth1Raw(lng * RAD, lat * RAD);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (-y < minY) minY = -y;
        if (-y > maxY) maxY = -y;
    }
}
for (let lat = -90; lat <= 90; lat += 0.5) {
    for (const lng of [-180, 180]) {
        const [x, y] = naturalEarth1Raw(lng * RAD, lat * RAD);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (-y < minY) minY = -y;
        if (-y > maxY) maxY = -y;
    }
}
const scale = WIDTH / (maxX - minX);
const height = Math.ceil((maxY - minY) * scale);
const fit = {
    scale: Math.round(scale * 1e4) / 1e4,
    tx: Math.round(-minX * scale * 1e2) / 1e2,
    ty: Math.round(-minY * scale * 1e2) / 1e2,
};

const projectRaw = ([lng, lat]) => {
    const [x, y] = naturalEarth1Raw(lng * RAD, lat * RAD);
    return [x * fit.scale + fit.tx, -y * fit.scale + fit.ty];
};

const project = ([lng, lat]) => {
    const [x, y] = projectRaw([lng, lat]);
    return [
        Math.round(x * PRECISION) / PRECISION,
        Math.round(y * PRECISION) / PRECISION,
    ];
};

// Douglas-Peucker in projected pixel space. The 50m dataset carries far more
// detail than a 960px-wide map can show; a sub-pixel tolerance keeps the
// smooth coastlines (including under zoom, where error is magnified) while
// dropping the invisible wiggle.
const SIMPLIFY_TOL = 0.15;

function dpSimplify(pts, tol) {
    if (pts.length <= 2) return pts;
    const keep = new Uint8Array(pts.length);
    keep[0] = keep[pts.length - 1] = 1;
    const stack = [[0, pts.length - 1]];
    while (stack.length) {
        const [a, b] = stack.pop();
        const [ax, ay] = pts[a];
        const [bx, by] = pts[b];
        const dx = bx - ax;
        const dy = by - ay;
        const len2 = dx * dx + dy * dy;
        let maxD = -1;
        let maxI = -1;
        for (let i = a + 1; i < b; i++) {
            const [px, py] = pts[i];
            let d;
            if (len2 === 0) {
                d = (px - ax) ** 2 + (py - ay) ** 2;
            } else {
                const cross = dx * (py - ay) - dy * (px - ax);
                d = (cross * cross) / len2;
            }
            if (d > maxD) {
                maxD = d;
                maxI = i;
            }
        }
        if (maxD > tol * tol) {
            keep[maxI] = 1;
            stack.push([a, maxI], [maxI, b]);
        }
    }
    return pts.filter((_, i) => keep[i]);
}

// Split a coordinate sequence wherever consecutive points jump across the
// antimeridian (|Δlng| > 180 — Russia/Chukotka, Fiji, Antarctica). Without
// this, the projected path draws a horizontal streak across the whole map.
// Each crossing is interpolated to a point on ±180 and the sequence is cut
// there. For cyclic sequences (polygon rings, closed with a duplicate first
// point) the trailing and leading pieces are merged so every part is a
// seam-to-seam run.
function splitAtAntimeridian(coords, cyclic) {
    const parts = [];
    let cur = [coords[0]];
    for (let i = 1; i < coords.length; i++) {
        const [lng1, lat1] = coords[i - 1];
        const [lng2, lat2] = coords[i];
        if (Math.abs(lng2 - lng1) > 180) {
            const sign = lng1 > 0 ? 1 : -1; // seam side we're currently on
            const lng2u = lng2 + sign * 360; // lng2 unwrapped onto this side
            // A segment jumping exactly 360° (±180 → ∓180) is the same
            // meridian: denominator 0 would make t (and latX) NaN.
            const t =
                lng2u === lng1 ? 0 : (sign * 180 - lng1) / (lng2u - lng1);
            const latX = lat1 + t * (lat2 - lat1);
            cur.push([sign * 180, latX]);
            parts.push(cur);
            cur = [[-sign * 180, latX], coords[i]];
        } else {
            cur.push(coords[i]);
        }
    }
    if (parts.length === 0) return [coords];
    if (cyclic) {
        // Closed ring: the trailing piece continues into the leading piece.
        const first = parts.shift();
        parts.push(cur.concat(first.slice(1)));
    } else {
        parts.push(cur);
    }
    return parts;
}

function coordsToPath(coords, {cyclic}) {
    let d = '';
    for (const part of splitAtAntimeridian(coords, cyclic)) {
        const simplified = dpSimplify(part.map(projectRaw), SIMPLIFY_TOL);
        let prev = null;
        let sub = '';
        for (const raw of simplified) {
            const p = [
                Math.round(raw[0] * PRECISION) / PRECISION,
                Math.round(raw[1] * PRECISION) / PRECISION,
            ];
            // Drop consecutive points that quantize to the same pixel.
            if (prev && p[0] === prev[0] && p[1] === prev[1]) continue;
            sub += (prev ? 'L' : 'M') + p[0] + ' ' + p[1];
            prev = p;
        }
        // Seam-to-seam ring parts close vertically along ±180.
        d += sub + (cyclic ? 'Z' : '');
    }
    return d;
}

function ringToPath(ring) {
    return coordsToPath(ring, {cyclic: true});
}

function polygonBBoxCenterAndArea(polygon) {
    // polygon = array of rings; ring 0 is the outer ring.
    // Longitudes are unwrapped point-by-point (±360 on >180° jumps) so rings
    // crossing the antimeridian (Russia, Fiji) get a bbox on one continuous
    // side instead of one spanning the whole map — the raw bbox would put
    // Russia's "centroid" near lng 0.
    const outer = polygon[0];
    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;
    let prevLng = null;
    let offset = 0;
    for (const [rawLng, lat] of outer) {
        let lng = rawLng + offset;
        if (prevLng !== null && Math.abs(lng - prevLng) > 180) {
            offset += lng > prevLng ? -360 : 360;
            lng = rawLng + offset;
        }
        prevLng = lng;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
    }
    let centerLng = (minLng + maxLng) / 2;
    if (centerLng > 180) centerLng -= 360;
    if (centerLng < -180) centerLng += 360;
    return {
        center: [centerLng, (minLat + maxLat) / 2],
        area: (maxLng - minLng) * (maxLat - minLat),
    };
}

const countries = [];
const centroids = {};
const centroidsLL = {}; // lon/lat versions, for the globe view

for (const f of countriesGeo.features) {
    const name = f.properties?.name;
    if (!name) continue;
    const polygons =
        f.geometry.type === 'Polygon'
            ? [f.geometry.coordinates]
            : f.geometry.coordinates;

    let d = '';
    let best = null;
    for (const polygon of polygons) {
        for (const ring of polygon) d += ringToPath(ring);
        const {center, area} = polygonBBoxCenterAndArea(polygon);
        if (!best || area > best.area) best = {center, area};
    }
    countries.push({name, d});
    if (best) {
        const c = project(best.center);
        centroids[name] = c;
        centroidsLL[name] = [
            Math.round(best.center[0] * 100) / 100,
            Math.round(best.center[1] * 100) / 100,
        ];
    }
}

countries.sort((a, b) => a.name.localeCompare(b.name));

// --- ISO 3166-1 alpha-2 codes ---------------------------------------------
// world-atlas strips NE properties down to `name`, so codes come from the
// raw NE countries file, matched by any of its name fields. ISO_A2_EH first:
// plain ISO_A2 is '-99' for France, Norway, and a few others. Codes drive
// the flag icon on the contributor card; a country without one just shows
// no flag.
const iso2 = {};
{
    const neCountries = await fetchNe('ne_50m_admin_0_countries.geojson');
    const byName = new Map();
    for (const f of neCountries.features) {
        const p = f.properties ?? {};
        const code = [p.ISO_A2_EH, p.ISO_A2].find(
            c => typeof c === 'string' && /^[A-Za-z]{2}$/.test(c),
        );
        if (!code) continue;
        for (const key of [p.NAME, p.NAME_LONG, p.ADMIN, p.BRK_NAME]) {
            if (key && !byName.has(key)) byName.set(key, code.toLowerCase());
        }
    }
    // world-atlas predates NE's rename; N. Cyprus, Somaliland, and Siachen
    // Glacier have no ISO code and get no flag.
    if (!byName.has('Macedonia') && byName.has('North Macedonia')) {
        byName.set('Macedonia', byName.get('North Macedonia'));
    }
    for (const {name} of countries) {
        const code = byName.get(name);
        if (code) iso2[name] = code;
    }
    const missing = countries.filter(c => !iso2[c.name]).map(c => c.name);
    if (missing.length) console.log(`No ISO2 code for: ${missing.join(', ')}`);
}

// --- Internal admin borders ------------------------------------------------
// 1. NE admin-1 boundary lines for every country the 50m dataset covers.
let borders = '';
const admin1 = await fetchNe(ADMIN1_LINES_FILE);
for (const f of admin1.features) {
    if (!BORDER_COUNTRIES.has(f.properties.ADM0_NAME)) continue;
    const lines =
        f.geometry.type === 'LineString'
            ? [f.geometry.coordinates]
            : f.geometry.coordinates;
    for (const line of lines) borders += coordsToPath(line, {cyclic: false});
}

// 2. UK home-nation borders. The 50m admin-1 lines dataset has no GB, so we
// take the England/Scotland/Wales/N. Ireland map-subunit polygons and keep
// only edges shared by two subunits — internal land borders, no coastline.
const subunits = await fetchNe(SUBUNITS_FILE);
const gb = subunits.features.filter(f => f.properties.ADM0_A3 === 'GBR');
{
    const edgeKey = (a, b) => {
        const s1 = a[0] + ',' + a[1];
        const s2 = b[0] + ',' + b[1];
        return s1 < s2 ? s1 + '|' + s2 : s2 + '|' + s1;
    };
    const counts = new Map();
    const eachRing = (f, cb) => {
        const polys =
            f.geometry.type === 'Polygon'
                ? [f.geometry.coordinates]
                : f.geometry.coordinates;
        for (const poly of polys) for (const ring of poly) cb(ring);
    };
    for (const f of gb) {
        eachRing(f, ring => {
            for (let i = 1; i < ring.length; i++) {
                const k = edgeKey(ring[i - 1], ring[i]);
                counts.set(k, (counts.get(k) || 0) + 1);
            }
        });
    }
    const emitted = new Set();
    for (const f of gb) {
        eachRing(f, ring => {
            let run = null;
            for (let i = 1; i < ring.length; i++) {
                const k = edgeKey(ring[i - 1], ring[i]);
                if (counts.get(k) >= 2 && !emitted.has(k)) {
                    emitted.add(k);
                    if (run) run.push(ring[i]);
                    else run = [ring[i - 1], ring[i]];
                } else if (run) {
                    borders += coordsToPath(run, {cyclic: false});
                    run = null;
                }
            }
            if (run) borders += coordsToPath(run, {cyclic: false});
        });
    }
}

const out = {width: WIDTH, height, fit, countries, centroids, iso2, borders};
const outPath = join(__dirname, '..', 'src', 'data', 'world-map-geometry.json');
writeFileSync(outPath, JSON.stringify(out));
console.log(
    `Wrote ${outPath}: ${countries.length} countries, ` +
        `borders ${(borders.length / 1024).toFixed(0)} KB, ` +
        `${(JSON.stringify(out).length / 1024).toFixed(0)} KB total, ${WIDTH}x${height}`,
);

// --- Globe geometry ----------------------------------------------------------
// The globe view re-projects at runtime (orthographic, rotates with drag), so
// it needs raw lon/lat rather than baked paths. Land comes from the merged
// 110m silhouette — plenty of detail at globe scale, a fraction of the size
// of the 50m country set. Country centroids (lon/lat) place country-only
// contributors, mirroring `centroids` in the flat file.
const landTopo = JSON.parse(
    readFileSync(require.resolve('world-atlas/land-110m.json'), 'utf8'),
);
const landGeo = feature(landTopo, landTopo.objects.land);
const roundLL = ([lng, lat]) => [
    Math.round(lng * 100) / 100,
    Math.round(lat * 100) / 100,
];
const landPolygons =
    landGeo.features[0].geometry.type === 'Polygon'
        ? [landGeo.features[0].geometry.coordinates]
        : landGeo.features[0].geometry.coordinates;
const land = landPolygons.map(polygon =>
    polygon.map(ring => ring.map(roundLL)),
);

const globeOut = {land, centroids: centroidsLL};
const globePath = join(
    __dirname,
    '..',
    'src',
    'data',
    'world-globe-geometry.json',
);
writeFileSync(globePath, JSON.stringify(globeOut));
console.log(
    `Wrote ${globePath}: ${land.length} land polygons, ` +
        `${(JSON.stringify(globeOut).length / 1024).toFixed(0)} KB`,
);
