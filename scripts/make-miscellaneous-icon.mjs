/**
 * Build public/icons/miscellaneous.png from the supplied MISC artwork so it
 * sits in exactly the same box as the seven icons that were already there.
 *
 *   node scripts/make-miscellaneous-icon.mjs <source.png>
 *
 * The existing icons share a measured geometry: a 96x96 canvas on slate-50
 * (#f8fafc) with the beige rounded square occupying x26..69, y26..70 — a
 * 44x45 box inset 26px on every side. The supplied artwork is the same family
 * (beige rounded square, black line art inset ~2px from its edges) just drawn
 * larger on a pale mint ground, so the whole job is: drop the mint, crop to
 * the beige square, scale it to 44x45, and centre it on a slate-50 canvas.
 */
import sharp from 'sharp';

const SRC = process.argv[2];
const OUT = 'public/icons/miscellaneous.png';

const CANVAS = 96;      // every icon is 96x96
const BOX = { x: 26, y: 26, w: 44, h: 45 };   // where the beige square lands
const SLATE = { r: 248, g: 250, b: 252 };     // tailwind slate-50, the canvas
const BEIGE = [235, 237, 224];                // the rounded square's fill

if (!SRC) { console.error('usage: node scripts/make-miscellaneous-icon.mjs <source.png>'); process.exit(1); }

const near = (c, t, tol) => Math.abs(c[0] - t[0]) + Math.abs(c[1] - t[1]) + Math.abs(c[2] - t[2]) <= tol;

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h, channels: ch } = info;
const at = (x, y) => { const i = (y * w + x) * ch; return [data[i], data[i + 1], data[i + 2]]; };

// The mint ground is the only light colour with more blue than red; the beige
// square runs the other way (r > b) and the line art is near-black. That one
// comparison separates ground from artwork without touching either.
let minted = 0;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * ch;
    const [r, g, b] = at(x, y);
    if (r > 200 && b > 200 && b >= r) {
      data[i] = SLATE.r; data[i + 1] = SLATE.g; data[i + 2] = SLATE.b; data[i + 3] = 255;
      minted++;
    }
  }
}

// Crop to the beige square. The art sits inside it, so this is the icon's
// true extent — the same thing the 44x45 box measures on the other seven.
let x0 = w, y0 = h, x1 = -1, y1 = -1;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    if (near(at(x, y), BEIGE, 30)) {
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
}
if (x1 < 0) { console.error('No beige rounded square found in the source.'); process.exit(1); }
const cw = x1 - x0 + 1, chh = y1 - y0 + 1;

const flattened = await sharp(data, { raw: { width: w, height: h, channels: ch } }).png().toBuffer();

const scaled = await sharp(flattened)
  .extract({ left: x0, top: y0, width: cw, height: chh })
  // 'fill' rather than 'contain': the source square is 297x312 and the target
  // is 44x45, a 2.7% difference in aspect. Stretching by that much is
  // invisible and it guarantees the icon lands on the same pixel bounds as
  // its neighbours, which letterboxing would not.
  .resize(BOX.w, BOX.h, { fit: 'fill', kernel: 'lanczos3' })
  .png()
  .toBuffer();

await sharp({ create: { width: CANVAS, height: CANVAS, channels: 4, background: { ...SLATE, alpha: 1 } } })
  .composite([{ input: scaled, left: BOX.x, top: BOX.y }])
  .png({ compressionLevel: 9, palette: true })
  .toFile(OUT);

console.log(`source        ${w}x${h}`);
console.log(`mint dropped  ${minted.toLocaleString()} px -> slate-50`);
console.log(`beige square  x${x0}..${x1} y${y0}..${y1}  ${cw}x${chh}`);
console.log(`written       ${OUT}  ${CANVAS}x${CANVAS}, square at ${BOX.x},${BOX.y} ${BOX.w}x${BOX.h}`);
