// READ-ONLY scan for the two scrape-era defects found on the S&C SM-20 record.
// Writes nothing. Run: node scripts/audit-scrape-defects.mjs
//
//   A. "&amp;" flattened into the word "AMP"  (e.g. "S AMP C")
//   B. Decimal point dropped from a voltage   (e.g. "138 KV" for 13.8 kV)
//
// B needs care: plenty of voltages legitimately have no decimal (600V, 480V,
// 15 kV, 38 kV, 345 kV on real transmission gear). So we only flag values that
// are implausible for their unit, and we report the evidence rather than a
// verdict -- every hit still needs a human or a PDF check.
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Web-Tech Dev/EPM & VManuals/Project/Structural/VoytenManuals/.env.local' });

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const rows = (await db.execute(
  'SELECT id, slug, title, description, keywords, manufacturer FROM manuals'
)).rows;
console.log('scanned ' + rows.length + ' rows\n');

const FIELDS = ['title', 'description', 'keywords', 'slug'];

/* ─────────── Defect A: &amp; → AMP ─────────── */
// "AMP"/"amp" as a standalone token. Excludes legitimate uses: Ampere(s),
// amperage, "amp" as a rating word ("800 amp"), AMP/Tyco the connector brand,
// clamp/ramp/lamp (guarded by the word boundary anyway).
const ampHits = [];
for (const r of rows) {
  for (const f of FIELDS) {
    const v = r[f]; if (!v) continue;
    const s = String(v);
    // sandwiched between single letters/words the way "S AMP C" is, or a bare
    // "amp" keyword token, or the slug form "-amp-"
    const pats = [
      /\b([A-Za-z]{1,3})\s+AMP\s+([A-Za-z]{1,3})\b/,      // S AMP C
      /(^|,\s*)amp(\s*,|$)/i,                              // bare keyword token
      /(^|-)amp(-|$)/,                                     // slug: s-amp-c
    ];
    // not a hit if preceded by a number ("800 amp") -- that's a real rating
    if (/\d\s*amp/i.test(s) && !/\b[A-Za-z]{1,3}\s+AMP\s+[A-Za-z]{1,3}\b/.test(s)) continue;
    for (const p of pats) {
      if (p.test(s)) { ampHits.push({ id: r.id, field: f, mfr: r.manufacturer, value: s.slice(0, 150) }); break; }
    }
  }
}

/* ─────────── Defect B: dropped decimal in a voltage ─────────── */
// Standard distribution/transmission kV classes that DO exist without a
// decimal -- these are never flagged.
const REAL_KV = new Set([1,2,3,5,6,7,8,10,11,12,13,15,17,20,23,25,26,27,33,34,35,36,38,44,46,48,50,55,63,66,69,72,88,100,110,115,120,132,138,145,150,161,169,220,230,242,245,275,287,300,330,345,362,380,400,420,500,525,550,735,765,800]);
// The decimal-dropped forms we actually expect from real nameplate voltages.
const SUSPECT = new Map([
  ['138', '13.8'], ['345', '34.5'], ['416', '4.16'], ['248', '24.8'],
  ['278', '27.8'], ['138', '13.8'], ['721', '7.2'],  ['144', '14.4'],
  ['481', '4.8'],  ['242', '2.4'],  ['690', '6.9'],  ['1197', '11.97'],
]);

const kvHits = [];
for (const r of rows) {
  for (const f of ['title', 'description']) {
    const v = r[f]; if (!v) continue;
    const s = String(v);
    const re = /\b(\d{3,4})\s*k\s*v\b/gi;
    let m;
    while ((m = re.exec(s))) {
      const n = m[1];
      if (!SUSPECT.has(n)) continue;
      // A genuine transmission doc can legitimately say 138 kV or 345 kV.
      // The tell is context: distribution / indoor / low-voltage gear.
      const ctx = s.toLowerCase();
      const lowVoltCtx = /indoor|distribution|fuse|starter|motor control|switchgear|load ?break|cutout|recloser|padmount|pad-mount|network/.test(ctx);
      kvHits.push({
        id: r.id, field: f, mfr: r.manufacturer,
        found: n + ' kV', likely: SUSPECT.get(n),
        distributionContext: lowVoltCtx,
        value: s.slice(0, 150),
      });
    }
  }
}

/* ─────────── Report ─────────── */
function group(hits) {
  const byId = new Map();
  for (const h of hits) {
    if (!byId.has(h.id)) byId.set(h.id, []);
    byId.get(h.id).push(h);
  }
  return byId;
}

console.log('════════ DEFECT A: "&amp;" flattened to "AMP" ════════');
const aById = group(ampHits);
console.log('rows affected: ' + aById.size + '  (field hits: ' + ampHits.length + ')\n');
for (const [id, hs] of aById) {
  console.log('  id ' + id + '  [' + hs[0].mfr + ']');
  for (const h of hs) console.log('      ' + h.field.padEnd(12) + ' ' + h.value);
}

console.log('\n════════ DEFECT B: dropped decimal in kV ════════');
const bById = group(kvHits);
console.log('rows affected: ' + bById.size + '  (field hits: ' + kvHits.length + ')');
console.log('NOTE: 138/345 kV are real transmission classes. "distributionContext=true"');
console.log('      means the surrounding words say distribution-class gear, so the');
console.log('      value is almost certainly a dropped decimal. false = verify the PDF.\n');
const likely = [...bById].filter(([, hs]) => hs.some(h => h.distributionContext));
const unsure = [...bById].filter(([, hs]) => !hs.some(h => h.distributionContext));
console.log('  -- LIKELY DEFECTS (distribution context): ' + likely.length + ' rows');
for (const [id, hs] of likely) {
  console.log('  id ' + id + '  [' + hs[0].mfr + ']  ' + hs[0].found + ' -> likely ' + hs[0].likely);
  console.log('      ' + hs[0].value);
}
console.log('\n  -- NEEDS VERIFICATION (could be genuine transmission gear): ' + unsure.length + ' rows');
for (const [id, hs] of unsure) {
  console.log('  id ' + id + '  [' + hs[0].mfr + ']  ' + hs[0].found + ' -> maybe ' + hs[0].likely);
  console.log('      ' + hs[0].value);
}
