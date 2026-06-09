/**
 * Fix GE breaker frame-code casing, 2026-06-09.
 * Templated titles "GE [Spectra RMS] <frame> <amps>A … Breaker" had the frame code
 * title-cased (e.g. "GE Ted 40A…") instead of all-caps ("GE TED 40A…"). Uppercase
 * just the frame token. Excludes product NAMES that are correctly mixed-case
 * (WavePro, Power Break, Magne-Blast, Spectra). Title-only — slugs/URLs unchanged.
 *
 * Run: node scripts/fix-ge-frame-casing.mjs          (dry run + review CSV)
 *      node scripts/fix-ge-frame-casing.mjs --live    (backup rows, then apply)
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'node:fs';

for (const p of ['.env.local', 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local']) dotenv.config({ path: p });
const LIVE = process.argv.includes('--live');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const EXCLUDE = new Set(['Power', 'Magne', 'Spectra', 'WavePro']); // correctly-cased product names
const RE = /^(GE (?:Spectra RMS )?)([A-Za-z][A-Za-z0-9]{1,6})(\s+\d+\s*(?:A|kV)\b)/;

function fixTitle(t) {
  if (!/(Circuit Breaker|Breaker)/i.test(t)) return t;
  return t.replace(RE, (m, p1, frame, p3) => (EXCLUDE.has(frame) || !/[a-z]/.test(frame)) ? m : p1 + frame.toUpperCase() + p3);
}

let all = [], page = 1, total = Infinity;
while (all.length < total) {
  const j = await (await fetch('https://www.voytenmanuals.com/api/manuals?manufacturer=General%20Electric&limit=100&page=' + page)).json();
  total = j.total; all = all.concat(j.manuals || []); if (!j.manuals || !j.manuals.length) break; page++;
}

const changes = [];
for (const m of all) {
  const nt = fixTitle(m.title || '');
  if (nt !== m.title) changes.push({ id: m.id, old: m.title, new: nt });
}

console.log(`\n=== GE frame-casing fix — ${LIVE ? 'LIVE' : 'DRY RUN'} — ${changes.length} titles ===\n`);
const csv = ['id,old_title,new_title'];
for (const c of changes) csv.push([c.id, JSON.stringify(c.old), JSON.stringify(c.new)].join(','));
writeFileSync('C:\\Users\\rodol\\Desktop\\memory\\ge-frame-casing-proposed.csv', csv.join('\n'));
for (const c of changes.slice(0, 12)) console.log(`  ${c.old}  ->  ${c.new}`);
if (changes.length > 12) console.log(`  … and ${changes.length - 12} more (full list in ge-frame-casing-proposed.csv)`);

if (LIVE) {
  writeFileSync('C:\\Users\\rodol\\Desktop\\memory\\backups\\ge-frame-casing-backup-2026-06-09.json', JSON.stringify(changes, null, 2));
  for (const c of changes) await db.execute({ sql: 'UPDATE manuals SET title=? WHERE id=?', args: [c.new, c.id] });
  console.log(`\nAPPLIED ${changes.length} title updates. Backup saved.`);
} else {
  console.log(`\nReview CSV: C:\\Users\\rodol\\Desktop\\memory\\ge-frame-casing-proposed.csv — re-run with --live to apply.`);
}
