/**
 * Fix RL manual titles mis-labeled "Insulated Case" — RL is an AIR (low-voltage
 * power) circuit breaker, not insulated-case (that's SPB). 2026-06-09.
 * "Siemens Type RL[E] ###A … Insulated Case Circuit Breaker Manual"
 *   → "… Air Circuit Breaker Manual"
 * Scoped to RL-family Siemens titles only (SPB IS insulated-case — untouched).
 *
 * Run: node scripts/fix-rl-air-titles.mjs          (dry run)
 *      node scripts/fix-rl-air-titles.mjs --live    (backup, then apply)
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'node:fs';
for (const p of ['.env.local', 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local']) dotenv.config({ path: p });
const LIVE = process.argv.includes('--live');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const rows = (await db.execute(
  "SELECT id, title, subcategory FROM manuals WHERE manufacturer='Siemens' AND title LIKE '%Insulated Case%' AND (title LIKE 'Siemens Type RL%' OR title LIKE '%Type RLE%' OR title LIKE '%Type RLI%' OR title LIKE '%Type RLF%')"
)).rows;

console.log(`\n=== ${LIVE ? 'LIVE' : 'DRY RUN'} — ${rows.length} RL titles mis-labeled "Insulated Case" ===\n`);
const changes = rows.map(r => ({ id: r.id, old: r.title, new: String(r.title).replace(/Insulated Case Circuit Breaker/g, 'Air Circuit Breaker') }))
  .filter(c => c.new !== c.old);
for (const c of changes) console.log(`  ${c.old}\n    -> ${c.new}`);

// Any RL "Insulated Case" titles NOT matched by the replace (different phrasing)?
const unmatched = rows.filter(r => !String(r.title).includes('Insulated Case Circuit Breaker'));
if (unmatched.length) console.log(`\n⚠️ ${unmatched.length} RL "Insulated Case" titles use a different phrase (review):`, unmatched.map(r => `${r.id}: ${r.title}`));

if (LIVE) {
  writeFileSync('C:\\Users\\rodol\\Desktop\\memory\\backups\\rl-air-titles-backup-2026-06-09.json', JSON.stringify(rows, null, 2));
  for (const c of changes) await db.execute({ sql: 'UPDATE manuals SET title=? WHERE id=?', args: [c.new, c.id] });
  console.log(`\nAPPLIED ${changes.length} title updates. Backup saved.`);
} else {
  console.log(`\nWould update ${changes.length} titles. Re-run with --live.`);
}
