// Generates the v2 HeartSYNC icons in the redesign palette: a Rose heart
// (#b0264f) on warm paper (#faf6f1). Zero dependencies (zlib + hand-rolled
// PNG/ICO encoding). Writes to public/icons/v2/ and never touches the
// original icons in public/icons/.
//
//   node scripts/gen-icons-v2.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const outDir = join(root, 'icons', 'v2');
mkdirSync(outDir, { recursive: true });

const ROSE = [0xb0, 0x26, 0x4f];
const PAPER = [0xfa, 0xf6, 0xf1];

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

// Classic implicit heart curve, centred; `scale` = heart width as a share of the icon.
function inHeart(nx, ny, scale) {
  const x = (nx / scale) * 1.15;
  const y = (-ny / scale) * 1.15 + 0.15;
  const a = x * x + y * y - 1;
  return a * a * a - x * x * y * y * y <= 0;
}

/**
 * @param size  pixel size
 * @param scale heart width relative to the icon (0.56 keeps it inside the
 *              maskable safe zone; small favicons use a bigger heart)
 * @param transparent  transparent background (badge)
 * @param color heart colour, bg background colour
 */
function makePng(size, { scale = 0.56, transparent = false, color = ROSE, bg = PAPER } = {}) {
  const SS = 4; // 4x4 supersampling for smooth edges
  const raw = Buffer.alloc((size * 4 + 1) * size);
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0;
    for (let x = 0; x < size; x++) {
      let hits = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const nx = ((x + (sx + 0.5) / SS) / size) * 2 - 1;
          const ny = ((y + (sy + 0.5) / SS) / size) * 2 - 1;
          if (inHeart(nx, ny + 0.04, scale)) hits++;
        }
      }
      const t = hits / (SS * SS);
      if (transparent) {
        raw[p++] = color[0];
        raw[p++] = color[1];
        raw[p++] = color[2];
        raw[p++] = Math.round(t * 255);
      } else {
        raw[p++] = Math.round(bg[0] + (color[0] - bg[0]) * t);
        raw[p++] = Math.round(bg[1] + (color[1] - bg[1]) * t);
        raw[p++] = Math.round(bg[2] + (color[2] - bg[2]) * t);
        raw[p++] = 255;
      }
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** ICO container holding PNG-encoded images (supported by all modern browsers). */
function makeIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + dir.length;
  images.forEach(({ size, png }, i) => {
    const o = i * 16;
    dir[o] = size >= 256 ? 0 : size;
    dir[o + 1] = size >= 256 ? 0 : size;
    dir[o + 2] = 0;
    dir[o + 3] = 0;
    dir.writeUInt16LE(1, o + 4); // planes
    dir.writeUInt16LE(32, o + 6); // bpp
    dir.writeUInt32LE(png.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += png.length;
  });
  return Buffer.concat([header, dir, ...images.map((i) => i.png)]);
}

const pngs = [
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  ['icon-180.png', 180, { scale: 0.62 }], // apple-touch-icon (iOS adds no padding mask)
  ['favicon-32.png', 32, { scale: 0.74 }],
  ['badge-72.png', 72, { transparent: true, scale: 0.8, color: [0xff, 0xff, 0xff] }],
];
for (const [name, size, opts] of pngs) {
  writeFileSync(join(outDir, name), makePng(size, opts));
  console.log('wrote icons/v2/' + name);
}

const ico = makeIco([16, 32, 48].map((size) => ({ size, png: makePng(size, { scale: 0.78 }) })));
writeFileSync(join(outDir, 'favicon.ico'), ico);
console.log('wrote icons/v2/favicon.ico');
