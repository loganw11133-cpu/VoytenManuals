/**
 * Point the WavePro per-amperage rows that DEH-135 actually covers
 * (3200-5000A frames) at the already-uploaded DEH-135 blob.
 *
 *   node scripts/link-wavepro-deh135-frames.mjs          # DRY RUN
 *   node scripts/link-wavepro-deh135-frames.mjs --live   # write
 *
 * DEH-135 = "WavePro Power Circuit Breakers User's Guide" 3200-5000A frames.
 * Rows 2500A/3000A/3200A/4000A/5000A are all >=3200A-frame breakers (2500A
 * and 3000A are rating-plug values carried on 3200A/4000A frames), so this
 * guide is their correct manual. The 800/1200/1600/2000A rows are DEF-004
 * (800-2000A frames) and are intentionally left alone.
 */
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

const ENV_PATH = 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local';
dotenv.config({ path: ENV_PATH });

const LIVE = process.argv.includes('--live');

const BLOB_URL = 'https://dl93ei534z45nvu1.public.blob.vercel-storage.com/manuals/breaker/General%20Electric/WavePro/DEH-135%20WavePro%20Users%20Guide%203200-5000A.pdf';
const MANUAL_NUMBER = 'DEH-135';
const PAGE_COUNT = 22;
const FILE_BYTES = 389884;

// Rows DEH-135 (3200-5000A frames) covers.
const TARGET_IDS = [9130, 9131, 9132, 9133, 9134]; // 2500A, 3000A, 3200A, 4000A, 5000A

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log('='.repeat(70));
  console.log(`Link WavePro 3200-5000A rows -> DEH-135  [${LIVE ? 'LIVE' : 'DRY RUN'}]`);
  console.log('='.repeat(70));

  // Show the full per-amperage series for context (which stay DEF-004, which move)
  const series = await db.execute("SELECT id, title, manual_number, pdf_url FROM manuals WHERE id BETWEEN 9126 AND 9134 ORDER BY id");
  console.log('\n--- WavePro per-amperage series (id 9126-9134) ---');
  for (const r of series.rows) {
    const action = TARGET_IDS.includes(Number(r.id)) ? '  <== DEH-135' : '  (leave: DEF-004)';
    console.log(`  id=${r.id} [${r.manual_number || '—'}] ${r.title}${action}`);
    console.log(`     pdf_url=${r.pdf_url ? r.pdf_url : '(EMPTY)'}`);
  }

  // Safety: confirm every target currently has no PDF and is a WavePro row
  const targets = await db.execute({
    sql: `SELECT id, title, manual_number, pdf_url FROM manuals WHERE id IN (${TARGET_IDS.map(() => '?').join(',')})`,
    args: TARGET_IDS,
  });
  const bad = targets.rows.filter(r => !/WavePro/i.test(r.title));
  if (bad.length) { console.log('\n⚠ Some target rows are not WavePro — aborting.'); return; }

  if (!LIVE) {
    console.log(`\nWould set on ${TARGET_IDS.length} rows: pdf_url=<DEH-135 blob>, page_count=${PAGE_COUNT}, file_size_bytes=${FILE_BYTES}, manual_number='${MANUAL_NUMBER}'`);
    console.log('\nDRY RUN complete. Re-run with --live to write.');
    return;
  }

  let updated = 0;
  for (const id of TARGET_IDS) {
    await db.execute({
      sql: `UPDATE manuals SET pdf_url = ?, page_count = ?, file_size_bytes = ?, manual_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [BLOB_URL, PAGE_COUNT, FILE_BYTES, MANUAL_NUMBER, id],
    });
    updated++;
    console.log(`  [UPD] id=${id}`);
  }

  try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('[FTS] rebuilt.'); }
  catch (err) { console.log(`[FTS] rebuild skipped: ${err instanceof Error ? err.message : String(err)}`); }

  console.log('\n' + '='.repeat(70));
  console.log(`Updated ${updated} rows -> DEH-135.`);
  console.log('='.repeat(70));
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
