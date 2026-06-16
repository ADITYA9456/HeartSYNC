// Generates CoupleSpace brand PNG icons (gradient background + heart) with zero
// external dependencies, using Node's zlib + hand-rolled PNG chunk encoding.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

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
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

// Heart implicit function on normalized coords centered at origin.
function inHeart(nx, ny) {
  const x = nx * 1.5;
  const y = -ny * 1.5 + 0.35;
  const a = x * x + y * y - 1;
  return a * a * a - x * x * y * y * y <= 0;
}

function makePng(size, { badge = false } = {}) {
  const c1 = [0x6d, 0x5d, 0xfc]; // primary
  const c2 = [0xc3, 0x54, 0xff]; // primary-2
  const raw = Buffer.alloc((size * 4 + 1) * size);
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0; // filter byte
    for (let x = 0; x < size; x++) {
      const t = (x + y) / (2 * size);
      const [r, g, b] = lerp(c1, c2, t);
      const nx = (x / size) * 2 - 1;
      const ny = (y / size) * 2 - 1;
      const heart = inHeart(nx * 1.25, ny * 1.25);
      if (heart) {
        raw[p++] = 255;
        raw[p++] = 255;
        raw[p++] = 255;
        raw[p++] = 255;
      } else {
        raw[p++] = r;
        raw[p++] = g;
        raw[p++] = b;
        raw[p++] = badge ? 0 : 255; // badge = transparent bg
      }
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  return png;
}

const targets = [
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  ['icon-180.png', 180, {}],
  ['badge-72.png', 72, { badge: true }],
];
for (const [name, size, opts] of targets) {
  writeFileSync(join(outDir, name), makePng(size, opts));
  console.log('wrote', name);
}
