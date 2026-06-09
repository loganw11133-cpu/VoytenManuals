/**
 * Correct the RL "Static Trip — Parts & Technical Manual" page (2026-06-08, rev 2).
 *
 * This page is already INDEXED with organic traffic landing on the SG-3068 RL
 * breaker/renewal-parts book, so we KEEP it on SG-3068 (reverting the earlier
 * repoint to SG-3118) and instead fix the DESCRIPTION so it accurately reflects
 * SG-3068 (renewal parts for the Static Trip device) rather than the SG-3118
 * operation/settings guide. The separate page `siemens-rl-static-trip-iii-unit-manual`
 * remains the SG-3118 operation manual.
 *
 * Run:  node scripts/fix-siemens-rl-static-trip-desc.mjs          (dry run)
 *       node scripts/fix-siemens-rl-static-trip-desc.mjs --live   (apply; backs up first)
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'node:fs';

const ENV_PATHS = [
  '.env.local',
  'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local',
];
for (const p of ENV_PATHS) dotenv.config({ path: p });

const LIVE = process.argv.includes('--live');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const SG3068_URL =
  'https://dl93ei534z45nvu1.public.blob.vercel-storage.com/part_manuals/pdf/circuitBreaker/Siemens/Breakers/SG-3068.pdf';

const NEW_DESC =
  'Renewal parts and technical reference for the Static Trip device on Siemens Type RL low-voltage power ' +
  'circuit breakers, from the Type RL renewal parts catalog (SG-3068). Use it to identify the Static Trip ' +
  'unit and its related renewal parts across the RL, RLE, RLI, and RLF frames. Voyten Electric purchased ' +
  'all remaining RL & LA breaker inventory from Siemens Wendell, NC — your exclusive source for ' +
  'new-surplus and reconditioned RL parts. Free PDF download from Voyten Manuals.';

const SET = { pdf_url: SG3068_URL, manual_number: 'SG-3068', description: NEW_DESC };
const WHERE = "slug = 'siemens-rl-static-trip-unit-parts-manual'";
const cols = 'id, slug, manual_number, title, pdf_url, description';

async function main() {
  console.log(`\n=== RL Static Trip parts-page description fix — ${LIVE ? 'LIVE' : 'DRY RUN'} ===\n`);
  const before = (await db.execute(`SELECT ${cols} FROM manuals WHERE ${WHERE}`)).rows;
  if (before.length !== 1) { console.log(`Matched ${before.length} rows (expected 1) — ABORT`); return; }
  const row = before[0];
  console.log(`id=${row.id} slug=${row.slug}\n`);
  for (const [k, v] of Object.entries(SET)) {
    console.log(`${k}:\n  OLD: ${JSON.stringify(row[k])}\n  NEW: ${JSON.stringify(v)}\n`);
  }
  if (LIVE) {
    writeFileSync(
      'C:\\Users\\rodol\\Desktop\\memory\\backups\\siemens-rl-static-trip-desc-backup-2026-06-08.json',
      JSON.stringify(row, null, 2)
    );
    const setSql = Object.keys(SET).map(k => `${k} = ?`).join(', ');
    const r = await db.execute({ sql: `UPDATE manuals SET ${setSql} WHERE ${WHERE}`, args: Object.values(SET) });
    console.log(`-> ${r.rowsAffected} row updated; backup saved.`);
  } else {
    console.log('Dry run only — re-run with --live to apply.');
  }
}
main().catch(e => { console.error(e); process.exit(1); });
