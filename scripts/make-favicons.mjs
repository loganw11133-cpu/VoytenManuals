// Builds the site favicons from the header logo (public/voyten-logo.png):
//   app/icon.png        512×512, logo on a white rounded tile (reads on light and dark tabs)
//   app/apple-icon.png  180×180, full-bleed white — iOS rounds the corners itself
//   app/favicon.ico     16/32/48 PNG-in-ICO for browsers that ask for /favicon.ico
// Usage: node scripts/make-favicons.mjs
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const LOGO = 'public/voyten-logo.png';

// The logo on a square white canvas. `pad` is the margin on each side as a share of `size`.
async function tile(size, { pad, radius }) {
  const inner = Math.round(size * (1 - 2 * pad));
  const logo = await sharp(LOGO).trim().resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius * size}" fill="#ffffff"/></svg>`,
  );
  return sharp(bg).composite([{ input: logo, gravity: 'center' }]).png().toBuffer();
}

// ICO holding PNG images (supported by every current browser and Windows Vista+).
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...pngs.map(p => p.data)]);
}

await writeFile('app/icon.png', await tile(512, { pad: 0.06, radius: 0.18 }));
await writeFile('app/apple-icon.png', await tile(180, { pad: 0.1, radius: 0 }));
// Small sizes use a tighter margin so the mark keeps as many pixels as it can.
const small = await Promise.all([16, 32, 48].map(async size => ({ size, data: await tile(size, { pad: 0.03, radius: 0.18 }) })));
await writeFile('app/favicon.ico', ico(small));
console.log('wrote app/icon.png, app/apple-icon.png, app/favicon.ico');
