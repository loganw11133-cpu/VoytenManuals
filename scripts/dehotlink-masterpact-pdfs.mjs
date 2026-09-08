/**
 * Remove the download.schneider-electric.com hotlinks from the MasterPact rows:
 * upload the local PDFs to Vercel Blob and repoint every row that referenced
 * each Schneider p_Doc_Ref at the blob copy.
 *
 *   node scripts/dehotlink-masterpact-pdfs.mjs          # DRY RUN
 *   node scripts/dehotlink-masterpact-pdfs.mjs --live    # upload + write
 *
 * Source PDFs: …\2026 Notes-Meets\SEP\ (4 of the 10 hotlinked docs).
 * 0613CT0001 / 0613IB1202 / 0613IB1204 are byte-identical to what Schneider
 * serves; 0614IB1702EN is the FULLER 160-page edition (Schneider serves 132pp,
 * same doc ref + 11/2018 date) — the local copy is deliberately preferred.
 *
 * NOT covered (no local file): 0614IB1701EN(14 rows) 48049-137-05(4)
 * 48940-313-01(4) 48049-207-06(2) 48049-148-05(1) 48049-243-04(1) DOCA0102EN(1).
 *
 * This script ONLY changes pdf_url/page_count/file_size_bytes/manual_number.
 * It does NOT re-target any row onto a different document — the known
 * title-vs-doc mismatches (10276, 10277, 10279) are left exactly as they are.
 */
import { createClient } from '@libsql/client';
import { put } from '@vercel/blob';
import { readFileSync, statSync, existsSync, writeFileSync } from 'fs';
import dotenv from 'dotenv';

const ENV_PATH = 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Web-Tech Dev/EPM & VManuals/Project/Structural/VoytenManuals/.env.local';
dotenv.config({ path: ENV_PATH });

const LIVE = process.argv.includes('--live');
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const SRC = 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/2026 Notes-Meets/SEP/';
const BACKUP = 'C:/Users/rodol/.claude/projects/C--Users-rodol--local-bin/memory/backups/masterpact-hotlink-backup-2026-09-08.json';

// docRef -> local file + blob destination + metadata
const DOCS = [
  {
    ref: '0613IB1204',
    file: 'SQD-NW.pdf',
    blob: 'manuals/circuitBreaker/Square D/Breakers/0613IB1204 Masterpact NW Low-Voltage Power Circuit Breaker User Guide.pdf',
    pages: 208, manualNumber: '0613IB1204',
  },
  {
    ref: '0613CT0001',
    file: '0613CT0001 MasterPacT NT-NW Universal Power Circuit Breaker Catalog (boolkmap).pdf',
    blob: 'manuals/circuitBreaker/Square D/Breakers/0613CT0001 MasterPacT NT-NW Universal Power Circuit Breakers Catalog.pdf',
    pages: 248, manualNumber: '0613CT0001',
  },
  {
    ref: '0614IB1702',
    file: '0614IB1702EN.pdf',
    blob: 'manuals/circuitBreaker/Square D/Breakers/0614IB1702EN Masterpact MTZ1 Circuit Breakers and Switches User Guide.pdf',
    pages: 160, manualNumber: '0614IB1702EN',
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
  console.log(`MasterPact de-hotlink  [${LIVE ? 'LIVE' : 'DRY RUN'}]`);
  console.log('='.repeat(72));
  if (!process.env.TURSO_DATABASE_URL || !BLOB_TOKEN) { console.error('Missing env.'); process.exit(1); }

  // Everything still pointing at Schneider, so the untouched remainder is explicit.
  const all = await db.execute({
    sql: `SELECT id, title, manufacturer, manual_number, pdf_url FROM manuals WHERE pdf_url LIKE ? ORDER BY id`,
    args: [`%${HOTLINK}%`],
  });
  console.log(`\nRows currently hotlinked to Schneider: ${all.rows.length}`);

  const plan = [];
  for (const d of DOCS) {
    const abs = SRC + d.file;
    if (!existsSync(abs)) { console.error(`MISSING SOURCE: ${abs}`); process.exit(1); }
    d.bytes = statSync(abs).size;
    d.rows = all.rows.filter(r => new RegExp(`p_Doc_Ref=${d.ref}(&|$)`).test(r.pdf_url));
    if (!d.rows.length) { console.error(`No rows match p_Doc_Ref=${d.ref} — aborting.`); process.exit(1); }
    plan.push(d);
    console.log(`\n--- ${d.ref}  (${d.rows.length} rows, ${d.bytes.toLocaleString()} bytes, ${d.pages}pp) ---`);
    console.log(`    src  ${d.file}`);
    console.log(`    blob ${d.blob}`);
    for (const r of d.rows) console.log(`      id=${r.id} [${r.manufacturer}] ${r.title}`);
  }

  const touched = new Set(plan.flatMap(d => d.rows.map(r => Number(r.id))));
  const left = all.rows.filter(r => !touched.has(Number(r.id)));
  console.log(`\n--- STILL ON SCHNEIDER after this run: ${left.length} rows (no local PDF) ---`);
  const byRef = {};
  for (const r of left) { const k = r.pdf_url.match(/p_Doc_Ref=([^&]+)/)[1]; (byRef[k] = byRef[k] || []).push(Number(r.id)); }
  for (const [k, v] of Object.entries(byRef)) console.log(`    ${k.padEnd(14)} ${v.length} rows: ${v.join(',')}`);

  if (!LIVE) {
    console.log(`\nWould upload 3 PDFs and update ${touched.size} rows.`);
    console.log('DRY RUN complete. Re-run with --live to write.');
    return;
  }

  writeFileSync(BACKUP, JSON.stringify(all.rows, null, 1));
  console.log(`\n[BACKUP] ${all.rows.length} rows -> ${BACKUP}`);

  let updated = 0;
  for (const d of plan) {
    const url = await uploadBlob(SRC + d.file, d.blob);
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
