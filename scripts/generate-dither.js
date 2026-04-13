/**
 * Generates a seamless Bayer-dithered island texture as a PNG.
 * Run: node scripts/generate-dither.js
 * Output: static/img/dither-texture.png
 */

const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────
const SIZE        = 4096;   // tile dimensions (px)
const BLOCK       = 4;      // dither pixel block size (px)
const ALPHA       = 7;      // dot opacity 0-255 (~3%)
const MASK_CYCLES = 5;      // island frequency across tile
const TEX_CYCLES  = 16;     // texture detail frequency
// ──────────────────────────────────────────────────────────

const CELLS = SIZE / BLOCK;

// Bayer 4×4
const bayer4 = [0,8,2,10, 12,4,14,6, 3,11,1,9, 15,7,13,5];
function bayerVal(x, y) { return bayer4[(y % 4) * 4 + (x % 4)] / 16; }

function fract(x) { return x - Math.floor(x); }
function hash(x, y) { return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453); }

// Tiling gradient noise (simplex-style) — smoother than value noise
// Uses angle-based gradients at lattice points + quintic interpolation
function tilingNoise(x, y, period) {
  const ix  = ((Math.floor(x) % period) + period) % period;
  const iy  = ((Math.floor(y) % period) + period) % period;
  const fx  = x - Math.floor(x), fy = y - Math.floor(y);
  // Quintic fade — smoother than cubic smoothstep
  const ux  = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const uy  = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
  const ix1 = (ix + 1) % period, iy1 = (iy + 1) % period;
  // Map hash to unit-circle gradient, dot with offset vector
  function grad(hx, hy, dx, dy) {
    const angle = hash(hx, hy) * 6.2831853;
    return Math.cos(angle) * dx + Math.sin(angle) * dy;
  }
  const a = grad(ix,  iy,  fx,   fy  );
  const b = grad(ix1, iy,  fx-1, fy  );
  const c = grad(ix,  iy1, fx,   fy-1);
  const d = grad(ix1, iy1, fx-1, fy-1);
  return (a + (b-a)*ux + (c-a)*uy + (a-b-c+d)*ux*uy) * 0.5 + 0.5;
}

function smoothstep(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

// ── Generate pixel data ───────────────────────────────────
function generate(R, G, B, outFile, alpha, seed, ssLow, ssHigh) {
alpha  = alpha  !== undefined ? alpha  : ALPHA;
seed   = seed   !== undefined ? seed   : 0;
ssLow  = ssLow  !== undefined ? ssLow  : 0.45;
ssHigh = ssHigh !== undefined ? ssHigh : 0.85;
console.log(`Generating ${SIZE}×${SIZE} dither tile → ${outFile}…`);
const pixels = new Uint8Array(SIZE * SIZE * 4);

for (let cy = 0; cy < CELLS; cy++) {
  for (let cx = 0; cx < CELLS; cx++) {
    const mx = cx * MASK_CYCLES / CELLS + seed;
    const my = cy * MASK_CYCLES / CELLS + seed;
    let mask = tilingNoise(mx, my, MASK_CYCLES) * 0.67
             + tilingNoise(mx * 2, my * 2, MASK_CYCLES * 2) * 0.33;
    mask = smoothstep(ssLow, ssHigh, mask);
    if (mask < 0.05) continue;

    const tx = cx * TEX_CYCLES / CELLS;
    const ty = cy * TEX_CYCLES / CELLS;
    const tex = tilingNoise(tx, ty, TEX_CYCLES) * 0.4 + 0.3;

    if (tex * mask >= bayerVal(cx, cy)) {
      for (let dy = 0; dy < BLOCK; dy++) {
        for (let dx = 0; dx < BLOCK; dx++) {
          const i = ((cy * BLOCK + dy) * SIZE + (cx * BLOCK + dx)) * 4;
          pixels[i]   = R;
          pixels[i+1] = G;
          pixels[i+2] = B;
          pixels[i+3] = alpha;
        }
      }
    }
  }
}

  // ── Encode as PNG ───────────────────────────────────────
  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  function chunk(type, data) {
    const t = Buffer.from(type, 'ascii'), d = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const ln = Buffer.alloc(4); ln.writeUInt32BE(d.length);
    const cr = Buffer.alloc(4); cr.writeUInt32BE(crc32(Buffer.concat([t, d])));
    return Buffer.concat([ln, t, d, cr]);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0); ihdr.writeUInt32BE(SIZE, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1));
  for (let y = 0; y < SIZE; y++) {
    const rowOff = y * (SIZE * 4 + 1); raw[rowOff] = 0;
    for (let x = 0; x < SIZE; x++) {
      const si = rowOff + 1 + x * 4, pi = (y * SIZE + x) * 4;
      raw[si] = pixels[pi]; raw[si+1] = pixels[pi+1];
      raw[si+2] = pixels[pi+2]; raw[si+3] = pixels[pi+3];
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const png = Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0)),
  ]);
  const out = path.join(__dirname, `../static/img/${outFile}`);
  fs.writeFileSync(out, png);
  console.log(`Written: ${out} (${(png.length / 1024).toFixed(1)} KB)`);
} // end generate

generate(255, 255, 255, 'dither-texture.png', 20, 54.2, 0.44, 0.88);
// generate(0,   0,   0,   'dither-texture-dark.png', 100, 62.1, 0.40, 0.68);
