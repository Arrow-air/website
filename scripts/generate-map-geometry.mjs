#!/usr/bin/env node
// Generates src/data/world-map-geometry.json for <ContributorMap /> from the
// Natural Earth 110m dataset (world-atlas npm package). Run once and commit
// the output; re-run only if the projection, sizing, or dataset changes:
//
//   node scripts/generate-map-geometry.mjs
//
// Output: { width, height, fit: {scale, tx, ty}, countries: [{name, d}],
//           centroids: {countryName: [x, y]} }
// Centroids are the bbox centers of each country's largest polygon (avoids
// e.g. France's centroid drifting into the Atlantic because of overseas
// territories) and are used to place country-only contributors.

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';
import { naturalEarth1Raw } from '../src/components/ContributorMap/projection.js';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const WIDTH = 960;
const RAD = Math.PI / 180;
const PRECISION = 10; // one decimal place

const topo = JSON.parse(
    readFileSync(require.resolve('world-atlas/countries-110m.json'), 'utf8'),
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

const project = ([lng, lat]) => {
    const [x, y] = naturalEarth1Raw(lng * RAD, lat * RAD);
    return [
        Math.round((x * fit.scale + fit.tx) * PRECISION) / PRECISION,
        Math.round((-y * fit.scale + fit.ty) * PRECISION) / PRECISION,
    ];
};

function ringToPath(ring) {
    let d = '';
    let prev = null;
    for (const coord of ring) {
        const p = project(coord);
        // Drop consecutive points that quantize to the same pixel.
        if (prev && p[0] === prev[0] && p[1] === prev[1]) continue;
        d += (prev ? 'L' : 'M') + p[0] + ' ' + p[1];
        prev = p;
    }
    return d + 'Z';
}

function polygonBBoxCenterAndArea(polygon) {
    // polygon = array of rings; ring 0 is the outer ring.
    const outer = polygon[0];
    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;
    for (const [lng, lat] of outer) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
    }
    return {
        center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
        area: (maxLng - minLng) * (maxLat - minLat),
    };
}

const countries = [];
const centroids = {};

for (const f of countriesGeo.features) {
    const name = f.properties?.name;
    if (!name) continue;
    const polygons =
        f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;

    let d = '';
    let best = null;
    for (const polygon of polygons) {
        for (const ring of polygon) d += ringToPath(ring);
        const { center, area } = polygonBBoxCenterAndArea(polygon);
        if (!best || area > best.area) best = { center, area };
    }
    countries.push({ name, d });
    if (best) {
        const c = project(best.center);
        centroids[name] = c;
    }
}

countries.sort((a, b) => a.name.localeCompare(b.name));

const out = { width: WIDTH, height, fit, countries, centroids };
const outPath = join(__dirname, '..', 'src', 'data', 'world-map-geometry.json');
writeFileSync(outPath, JSON.stringify(out));
console.log(
    `Wrote ${outPath}: ${countries.length} countries, ` +
        `${(JSON.stringify(out).length / 1024).toFixed(0)} KB, ${WIDTH}x${height}`,
);
