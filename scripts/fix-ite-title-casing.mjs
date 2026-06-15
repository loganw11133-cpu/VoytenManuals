/**
 * ITE title casing normalization (2026-06-15). Same class of fix as the GE
 * frame-casing pass (scripts/fix-ge-frame-casing.mjs): OCR/template-generated
 * ITE titles have frame/type part-codes title-cased ("Jj", "Cr", "Fd") instead
 * of all-caps, plus spaced product names ("K Don", "K Line") and the "I T E"
 * initialism. Title-only (slugs/URLs unchanged → no redirects/FK work).
 *
 * NAMING CONVENTIONS (ITE):
 *  1. Frame & type designations are ALL-CAPS 2-3 letter codes (JJ, CR, EF, EH,
 *     HE, KP, KM, FJ, JL, LD, KB, KC, KD, KA, KF, FD, GR, DR, HK, LG, LX, MT,
 *     LU, SO, TTR, ET, CL, MO, AG...). Uppercase any title-cased occurrence.
 *  2. Product-family names keep canonical casing: "K-Line" (hyphen, cap K+L),
 *     "K-DON" (all-caps fused-breaker product name).
 *  3. Manufacturer initialism "I T E" → "ITE".
 *  4. MCCB203: the too-generic "Molded Case Circuit Breakers" → the PDF's actual
 *     section title "Product Selection and Application" (ITE Section 2.0.3, 1971).
 *
 * NOT in scope: deeper OCR garble (missing punctuation, "Ammpere", "2AND",
 * "Devicentraveling", spaced K-### part numbers). Capitalization only, per ask.
 *
 * Run: node scripts/fix-ite-title-casing.mjs          (dry run)
 *      node scripts/fix-ite-title-casing.mjs --live    (backup, then apply)
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'node:fs';
dotenv.config({ path: 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local' });
const LIVE = process.argv.includes('--live');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

// Title-cased frame/type codes observed in the ITE catalog → uppercase.
// Case-SENSITIVE match (only the wrong "Xx" form), word-boundaried, so it is
// idempotent and never touches already-correct "XX" or unrelated lowercase text.
const CODES = ['Ef','Eh','He','Hr','Hj','Hk','Kp','Km','Kb','Kc','Kd','Ka','Kf',
  'Cp','Cr','Cj','Cl','Fd','Fj','Jl','Jj','Ld','Lg','Lx','Lu','Mt','Mo','Dr',
  'Gr','So','Et','Ag','Ttr'];

const MCCB203_TITLE = 'ITE Molded-Case Circuit Breakers — Product Selection and Application';

function fixTitle(title, id) {
  let t = String(title);
  if (id === 4307) return MCCB203_TITLE;            // explicit retitle
  // Pre-rules: spaced product/initialism forms
  t = t.replace(/\bI T E\b/g, 'ITE');
  t = t.replace(/\bK Don\b/g, 'K-DON');
  t = t.replace(/\bK Line\b/g, 'K-Line');
  // Code uppercasing (case-sensitive, standalone)
  for (const c of CODES) {
    t = t.replace(new RegExp(`\\b${c}\\b`, 'g'), c.toUpperCase());
  }
  return t;
}

const rows = (await db.execute("SELECT id, title FROM manuals WHERE manufacturer='ITE' ORDER BY title")).rows;
const changes = rows
  .map(r => ({ id: r.id, old: String(r.title), neu: fixTitle(r.title, Number(r.id)) }))
  .filter(c => c.neu !== c.old);

console.log(`\n=== ${LIVE ? 'LIVE' : 'DRY RUN'} — ITE title casing — ${changes.length} rows change (of ${rows.length}) ===\n`);
// Group identical old→new (the catalog has 4xxx/10xxx duplicate pairs) for a compact review.
const uniq = new Map();
for (const c of changes) {
  const k = c.old + '||' + c.neu;
  if (!uniq.has(k)) uniq.set(k, { old: c.old, neu: c.neu, ids: [] });
  uniq.get(k).ids.push(c.id);
}
for (const u of [...uniq.values()].sort((a, b) => a.neu.localeCompare(b.neu))) {
  console.log(`  ${u.old}\n    -> ${u.neu}   [ids: ${u.ids.join(', ')}]\n`);
}
console.log(`${uniq.size} distinct title transforms across ${changes.length} rows.`);

if (LIVE) {
  writeFileSync(
    'C:\\Users\\rodol\\Desktop\\memory\\backups\\ite-title-casing-backup-2026-06-15.json',
    JSON.stringify(rows.filter(r => changes.some(c => c.id === r.id)), null, 2)
  );
  for (const c of changes) await db.execute({ sql: 'UPDATE manuals SET title=? WHERE id=?', args: [c.neu, c.id] });
  console.log(`\nAPPLIED ${changes.length} title updates. Backup saved.`);
} else {
  console.log(`\nRe-run with --live to apply.`);
}
