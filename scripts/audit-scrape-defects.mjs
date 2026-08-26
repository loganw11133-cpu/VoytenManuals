// READ-ONLY scan for scrape-era data defects. Writes nothing.
// Run: node scripts/audit-scrape-defects.mjs [--visible]
//   --visible  restrict to customer-facing fields (title/description/keywords),
//              skipping slugs, which must not change or live URLs break.
//
//   A. HTML entities decoded into words: "&amp;" -> "AMP"/"Sampc",
//      '"' -> "quot", '·' -> "acircmiddot", 'Â' -> "acirc", etc.
//   B. Decimal point dropped from a voltage: "138 KV" for 13.8 kV,
//      "825" for 8.25, "725" for 72.5, "72" for 7.2.
//   C. Delimiters lost between mashed numbers: "47682515KV" = 4.76/8.25/15 kV.
//
// B is decided by ANSI/IEEE voltage classes: a bare integer before kV that is
// NOT a real class, but which BECOMES one when a decimal is reinserted, is a
// defect. Values that are real classes either way are reported as ambiguous.
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Web-Tech Dev/EPM & VManuals/Project/Structural/VoytenManuals/.env.local' });

const VISIBLE_ONLY = process.argv.includes('--visible');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const rows = (await db.execute(
  'SELECT id, slug, title, description, keywords, manufacturer FROM manuals'
)).rows;

const FIELDS = VISIBLE_ONLY ? ['title', 'description', 'keywords'] : ['title', 'description', 'keywords', 'slug'];
console.log('scanned ' + rows.length + ' rows across [' + FIELDS.join(', ') + ']\n');

/* ── ANSI/IEEE voltage classes actually manufactured (kV) ── */
const REAL = new Set([
  // LV
  0.24, 0.48, 0.6, 0.635,
  // MV nominal
  2.4, 4.16, 4.8, 6.9, 7.2, 8.32, 11.5, 12, 12.47, 13.2, 13.8, 14.4,
  23, 24.94, 25, 26.4, 27.6, 34.5, 46, 69,
  // max-design ratings
  4.76, 5, 8.25, 15, 15.5, 25.8, 27, 38, 48.3, 72.5,
  // transmission
  115, 121, 138, 145, 161, 169, 230, 242, 287, 345, 362, 500, 550, 765, 800,
]);
const isReal = n => REAL.has(n);

// Insert a decimal at each interior position; return real-class candidates.
function decimalCandidates(digits) {
  const out = [];
  for (let i = 1; i < digits.length; i++) {
    const cand = parseFloat(digits.slice(0, i) + '.' + digits.slice(i));
    if (isReal(cand)) out.push(cand);
  }
  return out;
}

/* ── Defect A: entity fossils ── */
const ENTITY = [
  { name: '&amp; -> AMP',   re: /\b([A-Za-z]{1,4})\s+AMP\s+([A-Za-z]{1,4})\b/,  note: 'ampersand between two codes' },
  { name: '&amp; -> Sampc', re: /\bSampc\b/i,                                    note: 'S&C collapsed' },
  { name: '&amp; token',    re: /(^|,\s*)amp(\s*,|$)/i,                          note: 'stray keyword' },
  { name: '&quot;',         re: /quot[a-z]?quot|&?\bquot\b/i,                    note: 'double-quote fossil' },
  { name: 'mojibake Â·',    re: /acircmiddot|acirc|Atilde|Acirc|â€/i,            note: 'UTF-8 read as latin-1' },
  { name: '&nbsp; / dashes',re: /\bnbsp\b|\bndash\b|\bmdash\b|\bhellip\b/i,      note: 'entity word' },
  { name: 'quotes/symbols', re: /\brsquo\b|\blsquo\b|\bldquo\b|\brdquo\b|\bdeg\b|\btrade\b(?!\s?mark)/i, note: 'entity word' },
];
const aHits = [];
for (const r of rows) {
  for (const f of FIELDS) {
    const v = r[f]; if (!v) continue;
    const s = String(v);
    for (const e of ENTITY) {
      // "800 amp" is a real rating, not an entity fossil
      if (e.name === '&amp; token' && /\d\s*amp/i.test(s)) continue;
      if (e.re.test(s)) {
        aHits.push({ id: r.id, field: f, mfr: r.manufacturer, kind: e.name, value: s.slice(0, 130) });
        break;
      }
    }
  }
}

/* ── Defect B: dropped decimal before kV ── */
const bDefect = [], bAmbiguous = [];
for (const r of rows) {
  for (const f of ['title', 'description']) {
    const v = r[f]; if (!v) continue;
    const s = String(v);
    // digits immediately before kV/KV/kv, NOT kVA
    const re = /\b(\d{2,5})\s*k\.?\s*v\b(?!a)/gi;
    let m;
    while ((m = re.exec(s))) {
      const digits = m[1];
      const asInt = parseInt(digits, 10);
      const cands = decimalCandidates(digits);
      if (isReal(asInt)) {
        // real either way -> only note it if a decimal reading also works
        if (cands.length) {
          bAmbiguous.push({ id: r.id, field: f, mfr: r.manufacturer, found: digits, alt: cands.join(' / '), value: s.slice(0, 130) });
        }
      } else if (cands.length) {
        bDefect.push({ id: r.id, field: f, mfr: r.manufacturer, found: digits, fix: cands.join(' / '), value: s.slice(0, 130) });
      }
    }
  }
}

/* ── Defect C: mashed numeric runs before kV ── */
const cHits = [];
for (const r of rows) {
  for (const f of ['title', 'description']) {
    const v = r[f]; if (!v) continue;
    const s = String(v);
    const re = /\b(\d{6,})\s*k\.?\s*v\b(?!a)/gi;
    let m;
    while ((m = re.exec(s))) {
      cHits.push({ id: r.id, field: f, mfr: r.manufacturer, run: m[1], value: s.slice(0, 130) });
    }
  }
}

/* ── Report ── */
const uniq = hits => new Set(hits.map(h => h.id)).size;

console.log('════ DEFECT A: HTML entity fossils ════');
console.log('rows: ' + uniq(aHits) + '   hits: ' + aHits.length);
const byKind = {};
for (const h of aHits) (byKind[h.kind] ||= []).push(h);
for (const [k, hs] of Object.entries(byKind)) {
  console.log('\n  ' + k + '  -- ' + uniq(hs) + ' rows');
  const vis = hs.filter(h => h.field !== 'slug');
  for (const h of vis.slice(0, 25)) console.log('    id ' + String(h.id).padEnd(6) + h.field.padEnd(12) + h.value);
  if (vis.length > 25) console.log('    ... +' + (vis.length - 25) + ' more visible');
  const slugOnly = uniq(hs) - uniq(vis);
  if (slugOnly > 0) console.log('    (' + slugOnly + ' further rows slug-only)');
}

console.log('\n\n════ DEFECT B: dropped decimal before kV ════');
console.log('CONFIRMED (value is not a real class; decimal reading is): ' + uniq(bDefect) + ' rows, ' + bDefect.length + ' hits');
const seenB = new Set();
for (const h of bDefect) {
  const key = h.id + h.found;
  if (seenB.has(key)) continue; seenB.add(key);
  console.log('  id ' + String(h.id).padEnd(6) + '[' + h.mfr + ']  ' + h.found + ' kV -> ' + h.fix);
  console.log('      ' + h.value);
}
console.log('\nAMBIGUOUS (real class either way -- needs the PDF): ' + uniq(bAmbiguous) + ' rows');
const seenA2 = new Set();
for (const h of bAmbiguous) {
  const key = h.id + h.found;
  if (seenA2.has(key)) continue; seenA2.add(key);
  console.log('  id ' + String(h.id).padEnd(6) + '[' + h.mfr + ']  ' + h.found + ' kV  (or ' + h.alt + ')');
  console.log('      ' + h.value);
}

console.log('\n\n════ DEFECT C: mashed numeric runs before kV ════');
console.log('rows: ' + uniq(cHits));
for (const h of cHits) console.log('  id ' + String(h.id).padEnd(6) + h.run + ' -> ' + h.value);
