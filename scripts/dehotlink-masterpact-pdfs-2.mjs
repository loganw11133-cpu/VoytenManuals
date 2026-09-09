/**
 * MasterPact / PowerPact de-hotlink, part 2.
 *
 * Part 1 (scripts/dehotlink-masterpact-pdfs.mjs, commit 521eea1) moved 33 rows
 * off download.schneider-electric.com and left 27 behind for want of a local
 * PDF. Logan supplied six of the seven missing docs in ...\SEP\sep9th\, which
 * covers 13 of those 27 rows.
 *
 *   node scripts/dehotlink-masterpact-pdfs-2.mjs          # DRY RUN
 *   node scripts/dehotlink-masterpact-pdfs-2.mjs --live    # upload + write
 *
 * Every local file was checked against what Schneider serves today: five are
 * byte-identical; 48049-137-05EN differs by 39 bytes of PDF trailer (identical
 * R07/2020 revision, 124pp, same CreationDate -- only ModDate moved), so the
 * local copy is content-equivalent.
 *
 * sep9th also contains 0614IB1702EN.pdf, which is md5-identical to the copy
 * part 1 already uploaded. It is deliberately NOT re-uploaded.
 *
 * NOT covered (still no local PDF): 0614IB1701EN, the MasterPact MTZ2/MTZ3
 * user guide, 14 rows (ids 10247-10260). That is the whole remainder.
 *
 * Like part 1, this script only rewrites pdf_url / page_count /
 * file_size_bytes / manual_number. It does NOT re-target any row onto a
 * different document, so two pre-existing title-vs-doc mismatches survive it
 * untouched:
 *   id 10269 "Micrologic 7.0" -> 48049-137-05EN, which covers 5.0P and 6.0P
 *            only (zero occurrences of 7.0 anywhere in the document).
 *   id 10267 "Micrologic 5.0 (LSI)" -> 48049-137-05EN (the P-series bulletin),
 *            when 48049-207-06 is the bulletin that actually documents 5.0.
 */
import { createClient } from '@libsql/client';
import { put } from '@vercel/blob';
import { readFileSync, statSync, existsSync, writeFileSync } from 'fs';
import dotenv from 'dotenv';

const ENV_PATH = 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Web-Tech Dev/EPM & VManuals/Project/Structural/VoytenManuals/.env.local';
dotenv.config({ path: ENV_PATH });

const LIVE = process.argv.includes('--live');
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const SRC = 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/2026 Notes-Meets/SEP/sep9th/';
const BLOB_DIR = 'manuals/circuitBreaker/Square D/Breakers/';
const BACKUP = 'C:/Users/rodol/.claude/projects/C--Users-rodol--local-bin/memory/backups/masterpact-hotlink-backup-2026-09-09.json';

// p_Doc_Ref as it appears in pdf_url -> local file + blob destination + metadata
const DOCS = [
  {
    ref: '48940-313-01',
    file: '48940-313-01.pdf',
    blob: '48940-313-01 PowerPacT H-, J- and L-Frame Circuit Breakers with MicroLogic Trip Units User Guide.pdf',
    pages: 296, manualNumber: '48940-313-01',
  },
  {
    ref: '48049-137-05',
    file: '48049-137-05EN.pdf',
    blob: '48049-137-05EN MicroLogic 5.0P and 6.0P Electronic Trip Units Instruction Bulletin.pdf',
    pages: 124, manualNumber: '48049-137-05EN',
  },
  {
    ref: '48049-207-06',
    file: '48049-207-06.pdf',
    blob: '48049-207-06 MicroLogic 2.0, 3.0 and 5.0 Electronic Trip Units Instruction Bulletin.pdf',
    pages: 70, manualNumber: '48049-207-06',
  },
  {
    ref: '48049-148-05',
    file: '48049-148-05.pdf',
    blob: '48049-148-05 PowerPacT P-Frame and NS630b-NS1600 Circuit Breakers Instruction Bulletin.pdf',
    pages: 16, manualNumber: '48049-148-05',
  },
  {
    ref: '48049-243-04',
    file: '48049-243-04.pdf',
    blob: '48049-243-04 PowerPacT R-Frame and NS1600b-NS3200 Circuit Breakers Instruction Bulletin.pdf',
    pages: 16, manualNumber: '48049-243-04',
  },
  {
    // Cover reads DOCA0102EN-12; -12 is the revision, DOCA0102EN is the stable
    // doc ref customers search by, so that is what manual_number carries.
    ref: 'DOCA0102EN',
    file: 'DOCA0102EN-12.pdf',
    blob: 'DOCA0102EN-12 MasterPacT MTZ MicroLogic X Control Unit User Guide.pdf',
    pages: 358, manualNumber: 'DOCA0102EN',
  },
];

const HOTLINK = 'download.schneider-electric.com';

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function uploadBlob(absPath, blobPath) {
  const res = await put(blobPath, readFileSync(absPath), {
    access: 'public', token: BLOB_TOKEN, contentType: 'application/pdf',
    addRandomSuffix: false, allowOverwrite: true,
  });
  return res.url;
}

async function main() {
  console.log('='.repeat(72));
  console.log(`MasterPact de-hotlink, part 2  [${LIVE ? 'LIVE' : 'DRY RUN'}]`);
  console.log('='.repeat(72));
  if (!process.env.TURSO_DATABASE_URL || !BLOB_TOKEN) { console.error('Missing env.'); process.exit(1); }

  const all = await db.execute({
    sql: `SELECT id, title, manufacturer, subcategory, manual_number, page_count, file_size_bytes, pdf_url
          FROM manuals WHERE pdf_url LIKE ? ORDER BY id`,
    args: [`%${HOTLINK}%`],
  });
  console.log(`\nRows currently hotlinked to Schneider: ${all.rows.length}`);

  const plan = [];
  for (const d of DOCS) {
    const abs = SRC + d.file;
    if (!existsSync(abs)) { console.error(`MISSING SOURCE: ${abs}`); process.exit(1); }
    d.bytes = statSync(abs).size;
    d.rows = all.rows.filter(r => new RegExp(`p_Doc_Ref=${d.ref}(&|$)`).test(r.pdf_url));
    if (!d.rows.length) { console.error(`No rows match p_Doc_Ref=${d.ref} - aborting.`); process.exit(1); }
    plan.push(d);
    console.log(`\n--- ${d.ref}  (${d.rows.length} rows, ${d.bytes.toLocaleString()} bytes, ${d.pages}pp) ---`);
    console.log(`    src  ${d.file}`);
    console.log(`    blob ${BLOB_DIR}${d.blob}`);
    for (const r of d.rows) console.log(`      id=${r.id} [${r.manufacturer}/${r.subcategory}] ${r.title}`);
  }

  const touched = new Set(plan.flatMap(d => d.rows.map(r => Number(r.id))));
  const left = all.rows.filter(r => !touched.has(Number(r.id)));
  console.log(`\n--- STILL ON SCHNEIDER after this run: ${left.length} rows (no local PDF) ---`);
  const byRef = {};
  for (const r of left) { const k = r.pdf_url.match(/p_Doc_Ref=([^&]+)/)[1]; (byRef[k] = byRef[k] || []).push(Number(r.id)); }
  for (const [k, v] of Object.entries(byRef)) console.log(`    ${k.padEnd(14)} ${v.length} rows: ${v.join(',')}`);

  if (!LIVE) {
    console.log(`\nWould upload ${plan.length} PDFs and update ${touched.size} rows.`);
    console.log('DRY RUN complete. Re-run with --live to write.');
    return;
  }

  writeFileSync(BACKUP, JSON.stringify(all.rows, null, 1));
  console.log(`\n[BACKUP] ${all.rows.length} rows -> ${BACKUP}`);

  let updated = 0;
  for (const d of plan) {
    const url = await uploadBlob(SRC + d.file, BLOB_DIR + d.blob);
    console.log(`\n[BLOB] ${d.ref} -> ${url}`);
    for (const r of d.rows) {
      await db.execute({
        sql: `UPDATE manuals SET pdf_url = ?, page_count = ?, file_size_bytes = ?, manual_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        args: [url, d.pages, d.bytes, d.manualNumber, r.id],
      });
      updated++;
      console.log(`  [UPD] id=${r.id} ${r.title}`);
    }
  }

  try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('\n[FTS] rebuilt.'); }
  catch (err) { console.log(`\n[FTS] rebuild FAILED: ${err instanceof Error ? err.message : String(err)}`); }

  const after = await db.execute({ sql: `SELECT COUNT(*) c FROM manuals WHERE pdf_url LIKE ?`, args: [`%${HOTLINK}%`] });
  console.log('\n' + '='.repeat(72));
  console.log(`Updated ${updated} rows. Schneider hotlinks remaining: ${after.rows[0].c}`);
  console.log('='.repeat(72));
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
