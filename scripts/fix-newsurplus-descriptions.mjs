/**
 * Rebrand OEM-prefixed "New Surplus" branding in DB-stored manual descriptions →
 * Voyten-independent "New Surplus authorized source" (2026-06-16). Mirrors the
 * code-file rebrand. Voyten is an independent entity; factual product brand stays
 * in titles/model names — only the description branding text changes.
 *
 * Run: node scripts/fix-newsurplus-descriptions.mjs          (dry run)
 *      node scripts/fix-newsurplus-descriptions.mjs --live    (backup, then apply)
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'node:fs';
dotenv.config({ path: 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local' });
const LIVE = process.argv.includes('--live');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const RULES = [
  ['Eaton New Surplus', 'New Surplus'],
  ['Siemens New Surplus', 'New Surplus'],
  ['factory-authorized', 'authorized'],
  ['New Surplus source', 'New Surplus authorized source'],
  ['Eaton-reconditioned', 'reconditioned'],
];
function fix(s) {
  let t = s;
  for (const [from, to] of RULES) t = t.split(from).join(to);
  return t;
}

const rows = (await db.execute(
  "SELECT id, slug, description FROM manuals WHERE description LIKE '%Eaton New Surplus%' OR description LIKE '%Siemens New Surplus%' OR description LIKE '%factory-authorized%' OR description LIKE '%Eaton-reconditioned%'"
)).rows;

const changes = rows.map(r => ({ id: r.id, slug: r.slug, old: String(r.description), neu: fix(String(r.description)) }))
  .filter(c => c.neu !== c.old);

console.log(`\n=== ${LIVE ? 'LIVE' : 'DRY RUN'} — ${changes.length} descriptions with OEM New-Surplus branding ===\n`);
for (const c of changes.slice(0, 6)) console.log(`  [${c.id}] ${c.slug}\n    OLD: …${c.old.slice(0, 150)}…\n    NEW: …${c.neu.slice(0, 150)}…\n`);
if (changes.length > 6) console.log(`  …(+${changes.length - 6} more)\n`);

if (LIVE) {
  writeFileSync('C:\\Users\\rodol\\Desktop\\memory\\backups\\newsurplus-descriptions-backup-2026-06-16.json', JSON.stringify(rows, null, 2));
  for (const c of changes) await db.execute({ sql: 'UPDATE manuals SET description=? WHERE id=?', args: [c.neu, c.id] });
  console.log(`APPLIED ${changes.length} description updates. Backup saved.`);
} else {
  console.log(`Re-run with --live to apply.`);
}
