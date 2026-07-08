/**
 * Upload the GE WavePro DEF-004-R03 User's Guide (800-2000A frames) to Vercel
 * Blob and point the 800-2000A WavePro rows at it.
 *
 *   node scripts/add-wavepro-def004.mjs          # DRY RUN
 *   node scripts/add-wavepro-def004.mjs --live    # upload + write
 *
 * DEF-004 covers the 800/1200/1600/2000A frames — the rows DEH-135
 * (3200-5000A) does NOT cover. The 2000A top-seller page is included.
 */
import { createClient } from '@libsql/client';
import { put } from '@vercel/blob';
import { readFileSync, statSync, existsSync } from 'fs';
import dotenv from 'dotenv';

const ENV_PATH = 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local';
dotenv.config({ path: ENV_PATH });

const LIVE = process.argv.includes('--live');
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const PDF_PATH = 'C:\\Users\\rodol\\Downloads\\DEF-004-R03 WavePro Power Circuit Breakers 800-2000A Frames.pdf';
const BLOB_PATH = 'manuals/breaker/General Electric/WavePro/DEF-004-R03 WavePro Users Guide 800-2000A.pdf';
const MANUAL_NUMBER = 'DEF-004';
const PAGE_COUNT = 20;

// 800/1200/1600/2000A rows + the 2000A top-seller page.
const TARGET_IDS = [9126, 9127, 9128, 9129, 10165];

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function uploadBlob(absPath, blobPath) {
  const data = readFileSync(absPath);
  const res = await put(blobPath, data, {
    access: 'public', token: BLOB_TOKEN, contentType: 'application/pdf',
    addRandomSuffix: false, allowOverwrite: true,
  });
  return res.url;
}

async function main() {
  console.log('='.repeat(70));
  console.log(`WavePro DEF-004 import  [${LIVE ? 'LIVE' : 'DRY RUN'}]`);
  console.log('='.repeat(70));

  if (!process.env.TURSO_DATABASE_URL || !BLOB_TOKEN) { console.error('Missing env.'); process.exit(1); }
  if (!existsSync(PDF_PATH)) { console.error(`MISSING SOURCE PDF: ${PDF_PATH}`); process.exit(1); }
  const bytes = statSync(PDF_PATH).size;
  console.log(`Source: ${bytes.toLocaleString()} bytes, ${PAGE_COUNT} pages\n`);

  const targets = await db.execute({
    sql: `SELECT id, title, manual_number, pdf_url FROM manuals WHERE id IN (${TARGET_IDS.map(() => '?').join(',')}) ORDER BY id`,
    args: TARGET_IDS,
  });
  console.log(`--- Target rows (${targets.rows.length}) ---`);
  for (const r of targets.rows) {
    console.log(`  id=${r.id} [${r.manual_number || '—'}] ${r.title}`);
    console.log(`     pdf_url=${r.pdf_url ? r.pdf_url : '(EMPTY)'}`);
  }
  const bad = targets.rows.filter(r => !/WavePro/i.test(r.title));
  if (bad.length || targets.rows.length !== TARGET_IDS.length) { console.log('\n⚠ Target mismatch — aborting.'); return; }

  if (!LIVE) {
    console.log(`\nWould upload -> ${BLOB_PATH}`);
    console.log(`Would set on ${TARGET_IDS.length} rows: pdf_url=<blob>, page_count=${PAGE_COUNT}, file_size_bytes=${bytes}, manual_number='${MANUAL_NUMBER}'`);
    console.log('\nDRY RUN complete. Re-run with --live to write.');
    return;
  }

  const url = await uploadBlob(PDF_PATH, BLOB_PATH);
  console.log(`\n[BLOB] uploaded -> ${url}`);

  let updated = 0;
  for (const id of TARGET_IDS) {
    await db.execute({
      sql: `UPDATE manuals SET pdf_url = ?, page_count = ?, file_size_bytes = ?, manual_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [url, PAGE_COUNT, bytes, MANUAL_NUMBER, id],
    });
    updated++;
    console.log(`  [UPD] id=${id}`);
  }

  try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('[FTS] rebuilt.'); }
  catch (err) { console.log(`[FTS] rebuild skipped: ${err instanceof Error ? err.message : String(err)}`); }

  console.log('\n' + '='.repeat(70));
  console.log(`Uploaded DEF-004 + updated ${updated} rows.`);
  console.log('='.repeat(70));
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
