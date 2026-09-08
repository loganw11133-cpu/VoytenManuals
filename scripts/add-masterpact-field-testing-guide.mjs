/**
 * Create the listing for Schneider 0613IB1202 "Maintenance and Field Testing
 * Guide for Masterpact NT and NW Circuit Breakers" (204pp, trilingual EN/ES/FR).
 *
 *   node scripts/add-masterpact-field-testing-guide.mjs          # DRY RUN
 *   node scripts/add-masterpact-field-testing-guide.mjs --live
 *
 * The PDF is already on the blob (uploaded 2026-09-08). It was cited by the
 * NT/NW catalog but had NO row in the library — the biggest MasterPact content
 * gap. Fields mirror its 33 sibling MasterPact rows.
 */
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

const ENV_PATH = 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Web-Tech Dev/EPM & VManuals/Project/Structural/VoytenManuals/.env.local';
dotenv.config({ path: ENV_PATH });

const LIVE = process.argv.includes('--live');

const ROW = {
  slug: 'square-d-masterpact-nt-nw-maintenance-field-testing-guide',
  title: 'Square D Masterpact NT/NW Maintenance & Field Testing Guide',
  manual_number: '0613IB1202',
  category: 'Circuit Breakers',
  manufacturer: 'Square D',
  subcategory: 'Air Circuit Breakers',
  description:
    'Schneider Electric / Square D instruction bulletin 0613IB1202 (Class 0613, R08/15) — the maintenance and field testing guide for Masterpact NT and NW low voltage air circuit breakers. Covers visual inspection during operation, contact wear indicators, contact resistance testing, dielectric and insulation resistance (high potential) testing, arc chute inspection, thermographic inspection, drawout cradle inspection and lubrication, Micrologic trip unit and ERMS testing, and recommended preventive maintenance intervals. Trilingual (English / Spanish / French), 204 pages.',
  pdf_url:
    'https://dl93ei534z45nvu1.public.blob.vercel-storage.com/manuals/circuitBreaker/Square%20D/Breakers/0613IB1202%20Masterpact%20NT%20and%20NW%20Maintenance%20and%20Field%20Testing%20Guide.pdf',
  page_count: 204,
  file_size_bytes: 5446555,
  keywords:
    'Square D, Circuit Breakers, Air Circuit Breakers, Schneider Electric, Square D Schneider, Square D breaker, masterpact, nt, nw, maintenance, field testing, test procedure, contact wear, contact resistance, insulation resistance, dielectric test, hipot, thermographic inspection, arc chute, drawout cradle, lubrication, preventive maintenance, micrologic, ERMS, 0613IB1202, Class 0613, instruction bulletin, manual, technical manual, PDF, free download',
  search_priority: 90,
};

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function main() {
  console.log('='.repeat(70));
  console.log(`Add 0613IB1202 field testing guide  [${LIVE ? 'LIVE' : 'DRY RUN'}]`);
  console.log('='.repeat(70));

  const dupe = await db.execute({
    sql: `SELECT id, slug FROM manuals WHERE slug = ? OR pdf_url = ? OR manual_number = ?`,
    args: [ROW.slug, ROW.pdf_url, ROW.manual_number],
  });
  if (dupe.rows.length) {
    console.log('Already listed — aborting:', dupe.rows.map(r => `id=${r.id} ${r.slug}`).join(', '));
    return;
  }

  const head = await fetch(ROW.pdf_url, { method: 'HEAD' });
  const len = Number(head.headers.get('content-length'));
  console.log(`\nBlob: ${head.status} ${head.headers.get('content-type')} ${len}`);
  if (head.status !== 200 || len !== ROW.file_size_bytes) { console.log('⚠ Blob check failed — aborting.'); return; }

  for (const [k, v] of Object.entries(ROW)) console.log(`  ${k}: ${String(v).slice(0, 160)}`);

  if (!LIVE) { console.log('\nDRY RUN complete. Re-run with --live to insert.'); return; }

  const cols = Object.keys(ROW);
  await db.execute({
    sql: `INSERT INTO manuals (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
    args: cols.map(c => ROW[c]),
  });
  const ins = await db.execute({ sql: `SELECT id FROM manuals WHERE slug = ?`, args: [ROW.slug] });
  console.log(`\n[INS] id=${ins.rows[0].id}  /manual/${ROW.slug}`);

  try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('[FTS] rebuilt.'); }
  catch (err) { console.log(`[FTS] rebuild FAILED: ${err instanceof Error ? err.message : String(err)}`); }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
