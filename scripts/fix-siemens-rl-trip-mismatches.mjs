/**
 * Fix Siemens RL Static Trip III Download-PDF / title mismatches — audit 2026-06-08.
 *
 * Findings (via public /api/manuals?manufacturer=Siemens + PDF render verification):
 *   SG-3068 family  = Type RL *breaker* book (rev -01/-02). SGIM-3068(D/E) = RL install/maint.
 *   SG-3118 (-01)   = Static Trip III "Information & Instruction Guide" (the trip unit).
 *   SG-3169         = Static Trip III "Microprocessor-Based Tripping System" (verified via cover scan).
 *
 * Mismatches fixed:
 *   #1  siemens-rl-static-trip-unit-parts-manual : Static-Trip page served the RL breaker book
 *       (SG-3068.pdf, num SG-3068). Repoint -> SG-3118.pdf, num -> SG-3118.
 *   #2  siemens-rl-static-trip-iii-unit-manual   : PDF already SG-3118.pdf but num wrongly SG-3068.
 *       Fix num -> SG-3118.
 *   #3  Machine/raw titles (title === manual_number) for confirmed Static-Trip docs -> humanized.
 *
 * Run:  node scripts/fix-siemens-rl-trip-mismatches.mjs          (dry run, no writes)
 *       node scripts/fix-siemens-rl-trip-mismatches.mjs --live   (apply; backs up rows first)
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'node:fs';

// Creds live in the DesktopBackup clone's .env.local on this workstation.
const ENV_PATHS = [
  '.env.local',
  'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local',
];
for (const p of ENV_PATHS) dotenv.config({ path: p });

const LIVE = process.argv.includes('--live');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const SG3118_URL =
  'https://dl93ei534z45nvu1.public.blob.vercel-storage.com/part_manuals/pdf/circuitBreaker/Siemens/Trip_Units/SG-3118.pdf';

// Each fix: a WHERE selector (slug or id), the SET columns, and a human label.
const FIXES = [
  {
    label: '#1 Static Trip parts page -> SG-3118 (was RL breaker book SG-3068)',
    where: "slug = 'siemens-rl-static-trip-unit-parts-manual'",
    set: { pdf_url: SG3118_URL, manual_number: 'SG-3118' },
  },
  {
    label: '#2 Static Trip III unit manual -> fix number to SG-3118 (PDF already correct)',
    where: "slug = 'siemens-rl-static-trip-iii-unit-manual'",
    set: { manual_number: 'SG-3118' },
  },
  {
    label: '#3a humanize STATICTRIPIIIRETROFIT title',
    where: 'id = 10588',
    set: { title: 'Siemens Static Trip III Retrofit Kit Instructions' },
  },
  {
    label: '#3b humanize SGIM-3118C title',
    where: 'id = 10593',
    set: { title: 'Siemens Static Trip III Information & Instruction Guide (SGIM-3118C)' },
  },
  {
    label: '#3c humanize BULLETINSG3169 title',
    where: 'id = 10592',
    set: { title: 'Siemens Static Trip III Microprocessor Tripping System Bulletin (SG-3169)' },
  },
];

const cols = 'id, slug, manual_number, title, subcategory, pdf_url';

async function main() {
  console.log(`\n=== Siemens RL trip-unit mismatch fix — ${LIVE ? 'LIVE' : 'DRY RUN'} ===\n`);
  const backups = [];

  for (const f of FIXES) {
    const before = (await db.execute(`SELECT ${cols} FROM manuals WHERE ${f.where}`)).rows;
    if (before.length !== 1) {
      console.log(`⚠️  ${f.label}\n    matched ${before.length} rows (expected 1) — SKIPPING\n`);
      continue;
    }
    const row = before[0];
    backups.push(row);
    console.log(`• ${f.label}`);
    console.log(`    id=${row.id} slug=${row.slug}`);
    for (const [k, v] of Object.entries(f.set)) {
      console.log(`    ${k}: ${JSON.stringify(row[k])}  ->  ${JSON.stringify(v)}`);
    }
    if (LIVE) {
      const setSql = Object.keys(f.set).map(k => `${k} = ?`).join(', ');
      const r = await db.execute({ sql: `UPDATE manuals SET ${setSql} WHERE ${f.where}`, args: Object.values(f.set) });
      console.log(`    -> ${r.rowsAffected} row updated`);
    }
    console.log('');
  }

  if (LIVE) {
    const file = `C:\\Users\\rodol\\Desktop\\memory\\backups\\siemens-rl-trip-backup-2026-06-08.json`;
    writeFileSync(file, JSON.stringify(backups, null, 2));
    console.log(`Backup of ${backups.length} pre-change rows written to:\n  ${file}`);
  } else {
    console.log('Dry run only — re-run with --live to apply (rows will be backed up first).');
  }
}
main().catch(e => { console.error(e); process.exit(1); });
