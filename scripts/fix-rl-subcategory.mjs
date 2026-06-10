/**
 * Move RL-family Siemens records out of the "Insulated Case Breakers"
 * subcategory into "Air Circuit Breakers" — RL is an AIR (low-voltage power)
 * breaker. Companion to fix-rl-air-titles.mjs (which fixed the titles). 2026-06-09.
 *
 * SCOPED to RL-family titles only (\bRL[EIF]?\b). Genuine Siemens insulated-case
 * breakers (and all Eaton SPB, which IS insulated-case) are left untouched and
 * printed for review.
 *
 * Run: node scripts/fix-rl-subcategory.mjs          (dry run + survey)
 *      node scripts/fix-rl-subcategory.mjs --live    (backup, then apply)
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'node:fs';
for (const p of ['.env.local', 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local']) dotenv.config({ path: p });
const LIVE = process.argv.includes('--live');
const NEW_SUBCAT = 'Air Circuit Breakers';
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const RL = /\bRL[EIF]?\b/;

// Survey: how are Siemens subcategories distributed?
const survey = (await db.execute(
  "SELECT subcategory, COUNT(*) n FROM manuals WHERE manufacturer='Siemens' GROUP BY subcategory ORDER BY n DESC"
)).rows;
console.log('\n=== Siemens subcategories (current) ===');
for (const s of survey) console.log(`  ${String(s.n).padStart(4)}  ${s.subcategory ?? '(null)'}`);

// Candidates: Siemens insulated-case records
const rows = (await db.execute(
  "SELECT id, title, subcategory FROM manuals WHERE manufacturer='Siemens' AND subcategory='Insulated Case Breakers'"
)).rows;
const rlRows = rows.filter(r => RL.test(String(r.title || '')));
const nonRl = rows.filter(r => !RL.test(String(r.title || '')));

console.log(`\n=== ${LIVE ? 'LIVE' : 'DRY RUN'} — ${rows.length} Siemens "Insulated Case Breakers" records ===`);
console.log(`\nRL-family → will become "${NEW_SUBCAT}" (${rlRows.length}):`);
for (const r of rlRows) console.log(`  [${r.id}] ${r.title}`);
console.log(`\nNON-RL Siemens insulated-case → LEFT UNTOUCHED (${nonRl.length}):`);
for (const r of nonRl) console.log(`  [${r.id}] ${r.title}`);

if (LIVE) {
  writeFileSync('C:\\Users\\rodol\\Desktop\\memory\\backups\\rl-subcategory-backup-2026-06-09.json', JSON.stringify(rlRows, null, 2));
  for (const r of rlRows) await db.execute({ sql: 'UPDATE manuals SET subcategory=? WHERE id=?', args: [NEW_SUBCAT, r.id] });
  console.log(`\nAPPLIED: moved ${rlRows.length} RL records to "${NEW_SUBCAT}". Backup saved.`);
} else {
  console.log(`\nWould move ${rlRows.length} RL records to "${NEW_SUBCAT}". Re-run with --live.`);
}
