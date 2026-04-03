// Generates static/img/ai-dither-radial.png
// Circular Bayer8 dither: tan on outside, transparent towards center
const fs = require('fs');
const zlib = require('zlib');

const W = 480, H = 480; // lower res = larger grain pixels when upscaled
const TAN = [175, 148, 126]; // #af947e

const BAYER8 = [
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
];

const raw = Buffer.alloc(H * (1 + W * 4));
let p = 0;

for (let y = 0; y < H; y++) {
  raw[p++] = 0; // filter: None
  for (let x = 0; x < W; x++) {
    const cx = W / 2;
    const cy = H * 0.92; // centre sits near the bottom
    const dx = (x - cx) / (W / 2);
    const dy = (y - cy) / (W / 2);
    const dist = Math.sqrt(dx * dx + dy * dy); // 0=center, 1=edge

    // Smoothstep: transparent inside 0.15, fully tan at 0.85
    const t = Math.max(0, Math.min(1, (dist - 0.15) / (0.85 - 0.15)));
    const mask = t * t * (3 - 2 * t);

    const threshold = BAYER8[(y % 8) * 8 + (x % 8)] / 64;
    const on = mask > threshold;

    raw[p++] = on ? TAN[0] : 0;
    raw[p++] = on ? TAN[1] : 0;
    raw[p++] = on ? TAN[2] : 0;
    raw[p++] = on ? 255 : 0;
  }
}

// Minimal PNG encoder
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (const b of buf) c = crcTable[(c ^ b) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw, { level: 6 })),
  chunk('IEND', Buffer.alloc(0)),
]);

fs.writeFileSync('static/img/ai-dither-radial.png', png);
console.log('Generated static/img/ai-dither-radial.png (' + (png.length / 1024).toFixed(1) + 'kb)');
