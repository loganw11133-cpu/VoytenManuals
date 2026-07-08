/**
 * Add the GE WavePro DEH-135 User's Guide (3200-5000A frames) PDF to
 * Vercel Blob + point the existing "PDF NOT AVAILABLE" manual row at it.
 *
 *   node scripts/add-wavepro-deh135.mjs            # DRY RUN (find + report only)
 *   node scripts/add-wavepro-deh135.mjs --live     # upload blob + update row
 *
 * The record is discovered by manual number / WavePro-3200-5000 title so we
 * never touch the wrong row. Requires TURSO_* + BLOB_READ_WRITE_TOKEN (loaded
 * from the structural .env.local, same as the SPB import script).
 */
import { createClient } from '@libsql/client';
import { put } from '@vercel/blob';
import { readFileSync, statSync, existsSync } from 'fs';
import dotenv from 'dotenv';

const ENV_PATH = 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local';
dotenv.config({ path: ENV_PATH });

const LIVE = process.argv.includes('--live');
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const PDF_PATH = 'C:\\Users\\rodol\\Downloads\\DEH-135 Wavepro 3200-5000A Frames.pdf';
// Match the live blob convention: manuals/breaker/<Manufacturer>/<Line>/<file>.pdf
const BLOB_PATH = 'manuals/breaker/General Electric/WavePro/DEH-135 WavePro Users Guide 3200-5000A.pdf';
const MANUAL_NUMBER = 'DEH-135';
const PAGE_COUNT = 22;

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// The one combined-scope row that matches this PDF exactly: the "3200-5000A"
// WavePro guide (id=10089). The per-amperage rows (3200A/4000A/5000A) and the
// 800-2000A series are intentionally NOT touched here.
const FIND_SQL = `
  SELECT id, slug, title, manufacturer, subcategory, category, manual_number, pdf_url, page_count
  FROM manuals
  WHERE title LIKE '%WavePro 3200-5000A%'
`;

async function uploadBlob(absPath, blobPath) {
  const data = readFileSync(absPath);
  const res = await put(blobPath, data, {
    access: 'public',
    token: BLOB_TOKEN,
    contentType: 'application/pdf',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return res.url;
}

async function main() {
  console.log('='.repeat(70));
  console.log(`WavePro DEH-135 import  [${LIVE ? 'LIVE' : 'DRY RUN'}]`);
  console.log('='.repeat(70));

  if (!process.env.TURSO_DATABASE_URL || !BLOB_TOKEN) {
    console.error('Missing TURSO_DATABASE_URL or BLOB_READ_WRITE_TOKEN. Check env path.');
    process.exit(1);
  }
  if (!existsSync(PDF_PATH)) { console.error(`MISSING SOURCE PDF: ${PDF_PATH}`); process.exit(1); }
  const bytes = statSync(PDF_PATH).size;
  console.log(`Source PDF: ${PDF_PATH}\n  ${bytes.toLocaleString()} bytes, ${PAGE_COUNT} pages\n`);

  // Context: every WavePro row (so we see the 800-2000A guide vs this 3200-5000A one)
  const allWave = await db.execute("SELECT id, title, manual_number, pdf_url FROM manuals WHERE title LIKE '%WavePro%' OR title LIKE '%Wave Pro%' OR slug LIKE '%wave-pro%' OR slug LIKE '%wavepro%'");
  console.log(`--- All WavePro rows (${allWave.rows.length}) ---`);
  for (const r of allWave.rows) {
    console.log(`  id=${r.id} [${r.manual_number || '—'}] ${r.title}`);
    console.log(`     pdf_url=${r.pdf_url ? r.pdf_url : '(EMPTY — PDF NOT AVAILABLE)'}`);
  }

  // Blob-URL convention sample
  const sample = await db.execute("SELECT pdf_url FROM manuals WHERE pdf_url LIKE '%blob.vercel-storage.com%' LIMIT 2");
  console.log(`\n--- Blob URL convention sample ---`);
  for (const r of sample.rows) console.log(`  ${r.pdf_url}`);

  // The actual target
  const found = await db.execute(FIND_SQL);
  console.log(`\n--- Target match (${found.rows.length}) ---`);
  for (const r of found.rows) {
    console.log(`  id=${r.id} [${r.manual_number || '—'}] ${r.title}`);
    console.log(`     mfr=${r.manufacturer} sub=${r.subcategory} pdf_url=${r.pdf_url ? r.pdf_url : '(EMPTY)'}`);
  }

  if (found.rows.length !== 1) {
    console.log(`\n⚠ Expected exactly 1 target row, found ${found.rows.length}. Not writing.`);
    console.log(`  Adjust FIND_SQL to match the intended row, then re-run.`);
    return;
  }
  const target = found.rows[0];

  if (!LIVE) {
    console.log(`\nWould upload -> ${BLOB_PATH}`);
    console.log(`Would UPDATE manuals id=${target.id}: pdf_url=<blob url>, page_count=${PAGE_COUNT}, file_size_bytes=${bytes}, ` +
                `manual_number='${MANUAL_NUMBER}' (was '${target.manual_number || '—'}')`);
    console.log('\nDRY RUN complete. Re-run with --live to upload + write.');
    return;
  }

  // LIVE
  const url = await uploadBlob(PDF_PATH, BLOB_PATH);
  console.log(`\n[BLOB] uploaded -> ${url}`);

  // Correct manual_number to the document actually being served (DEH-135).
  await db.execute({
    sql: `UPDATE manuals SET pdf_url = ?, page_count = ?, file_size_bytes = ?, manual_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    args: [url, PAGE_COUNT, bytes, MANUAL_NUMBER, target.id],
  });
  console.log(`[DB] updated id=${target.id} (manual_number ${target.manual_number || '—'} -> ${MANUAL_NUMBER})`);

  try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('[FTS] rebuilt.'); }
  catch (err) { console.log(`[FTS] rebuild skipped: ${err instanceof Error ? err.message : String(err)}`); }

  const check = await db.execute({ sql: 'SELECT slug, title, pdf_url, page_count, file_size_bytes FROM manuals WHERE id = ?', args: [target.id] });
  const c = check.rows[0];
  console.log('\n' + '='.repeat(70));
  console.log(`DONE. /manual/${c.slug}`);
  console.log(`  ${c.title}`);
  console.log(`  pdf_url=${c.pdf_url}`);
  console.log(`  ${c.page_count} pages, ${Number(c.file_size_bytes).toLocaleString()} bytes`);
  console.log('='.repeat(70));
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
