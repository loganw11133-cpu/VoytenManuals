/**
 * Remove "exclusive" branding from DB-stored manual descriptions, 2026-06-09.
 * 56 Siemens RL descriptions share one sentence: "...your exclusive source for
 * new-surplus and reconditioned RL parts." → "...your source for Siemens New
 * Surplus and reconditioned RL parts." (matches the sitewide rebrand).
 *
 * Run: node scripts/fix-exclusive-descriptions.mjs          (dry run)
 *      node scripts/fix-exclusive-descriptions.mjs --live   (backup, then apply)
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'node:fs';
for (const p of ['.env.local', 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local']) dotenv.config({ path: p });
const LIVE = process.argv.includes('--live');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const OLD = 'your exclusive source for new-surplus and reconditioned RL parts';
const NEW = 'your source for Siemens New Surplus and reconditioned RL parts';

const rows = (await db.execute("SELECT id, slug, description FROM manuals WHERE LOWER(description) LIKE '%exclusive%'")).rows;
console.log(`\n=== ${LIVE ? 'LIVE' : 'DRY RUN'} — ${rows.length} descriptions contain "exclusive" ===`);
const stillOther = rows.filter(r => !String(r.description).includes(OLD));
if (stillOther.length) console.log(`NOTE: ${stillOther.length} rows have a different "exclusive" phrase — not auto-handled:`, stillOther.map(r => r.id));

if (LIVE) {
  writeFileSync('C:\\Users\\rodol\\Desktop\\memory\\backups\\exclusive-desc-backup-2026-06-09.json', JSON.stringify(rows, null, 2));
  const r = await db.execute({ sql: 'UPDATE manuals SET description = REPLACE(description, ?, ?) WHERE description LIKE ?', args: [OLD, NEW, '%' + OLD + '%'] });
  console.log(`Applied: ${r.rowsAffected} descriptions updated. Backup saved.`);
  const left = (await db.execute("SELECT COUNT(*) n FROM manuals WHERE LOWER(description) LIKE '%exclusive%'")).rows[0].n;
  console.log(`Descriptions still containing "exclusive": ${left}`);
} else {
  console.log(`Would replace the shared sentence in ${rows.length - stillOther.length} rows. Re-run with --live.`);
}
