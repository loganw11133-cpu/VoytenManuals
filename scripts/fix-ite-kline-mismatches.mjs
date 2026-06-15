/**
 * ITE K-Line cluster fixes (2026-06-15). Audit: scripts/audit-mismatches.mjs "ITE".
 * The only shared-PDF cluster in the ITE catalog is the ABB K-Line K225-K2000 IB
 * (IB 6.1.12.1-1E). Verified against the OEM PDF cover/designation section:
 *
 *  FIX A — 22 ITE K-Line rows are tagged subcategory "Insulated Case Breakers" with
 *    titles "...Insulated Case Circuit Breaker...", but the K-Line is a "Low Voltage
 *    Air-Magnetic Power Circuit Breaker" (per its own manual). PDF is correct; only
 *    the labels are wrong. Relabel title + subcategory -> "Air Circuit Breaker(s)".
 *    (Same defect/fix as the RL Insulated-Case relabel. UPDATE-only, slugs unchanged.)
 *
 *  FIX B — 13 "ITE Type FA/FB/FC/FD" rows point at the K-Line manual, but Type F is a
 *    separate, older ITE line (the catalog already hosts a dedicated Type FB doc,
 *    RP4608-51, a D-C renewal-parts list). Rather than serve the wrong-line K-Line
 *    book, set pdf_url -> 'NONE' (DownloadButton shows "PDF Not Available" + phone CTA),
 *    matching the Siemens-ETU / GE-legacy-frame approach. Titles/subcat already correct.
 *
 * UPDATE-only: no slug/URL change -> no redirect-map entry, no FK reassignment.
 * Run: node scripts/fix-ite-kline-mismatches.mjs          (dry run)
 *      node scripts/fix-ite-kline-mismatches.mjs --live    (backup, then apply)
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'node:fs';
for (const p of ['.env.local', 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local']) dotenv.config({ path: p });
const LIVE = process.argv.includes('--live');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

// ── FIX A: K-Line relabel (the whole ITE "Insulated Case Breakers" subcat is K-Line) ──
const aRows = (await db.execute(
  "SELECT * FROM manuals WHERE manufacturer='ITE' AND subcategory='Insulated Case Breakers'"
)).rows;
const aChanges = aRows.map(r => ({
  id: r.id,
  oldTitle: r.title,
  newTitle: String(r.title).replace(/Insulated Case Circuit Breaker/g, 'Air Circuit Breaker'),
  oldSub: r.subcategory,
  newSub: 'Air Circuit Breakers',
}));

// ── FIX B: Type FA/FB/FC/FD wrongly on the K-Line manual -> NONE ──
const bRows = (await db.execute(
  "SELECT * FROM manuals WHERE manufacturer='ITE' AND title LIKE 'ITE Type F%' AND pdf_url LIKE '%K225%'"
)).rows;

console.log(`\n=== ${LIVE ? 'LIVE' : 'DRY RUN'} — ITE K-Line cluster fixes ===`);
console.log(`\nFIX A — relabel ${aChanges.length} K-Line rows (expect 22): Insulated Case -> Air Circuit Breaker`);
for (const c of aChanges) {
  const titleNote = c.newTitle !== c.oldTitle ? `\n      title: ${c.oldTitle}\n          -> ${c.newTitle}` : ' (title already air; subcat only)';
  console.log(`  [${c.id}]${titleNote}`);
}
const aTitleUnmatched = aChanges.filter(c => c.newTitle === c.oldTitle);
if (aTitleUnmatched.length) console.log(`  ⚠️ ${aTitleUnmatched.length} rows had no "Insulated Case Circuit Breaker" phrase in title (subcat still moved): ${aTitleUnmatched.map(c => c.id).join(', ')}`);

console.log(`\nFIX B — set pdf_url='NONE' on ${bRows.length} Type F rows (expect 13):`);
for (const r of bRows) console.log(`  [${r.id}] ${r.title}`);

if (aChanges.length !== 22) console.log(`\n⚠️ FIX A count ${aChanges.length} != expected 22 — review before --live.`);
if (bRows.length !== 13) console.log(`⚠️ FIX B count ${bRows.length} != expected 13 — review before --live.`);

if (LIVE) {
  writeFileSync(
    'C:\\Users\\rodol\\Desktop\\memory\\backups\\ite-kline-relabel-backup-2026-06-15.json',
    JSON.stringify({ fixA: aRows, fixB: bRows }, null, 2)
  );
  for (const c of aChanges) {
    await db.execute({ sql: 'UPDATE manuals SET title=?, subcategory=? WHERE id=?', args: [c.newTitle, c.newSub, c.id] });
  }
  for (const r of bRows) {
    await db.execute({ sql: "UPDATE manuals SET pdf_url='NONE' WHERE id=?", args: [r.id] });
  }
  console.log(`\nAPPLIED: ${aChanges.length} relabels + ${bRows.length} pdf_url->NONE. Backup saved.`);
} else {
  console.log(`\nWould apply ${aChanges.length} relabels + ${bRows.length} NONE updates. Re-run with --live.`);
}
