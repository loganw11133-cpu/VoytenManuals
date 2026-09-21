/**
 * Ingest the four official Schneider / Square D Type VR documents sourced
 * 2026-09-21 from se.com product range 62197.
 *
 *   node scripts/add-sqd-vr-source-bulletins.mjs          # DRY RUN
 *   node scripts/add-sqd-vr-source-bulletins.mjs --live
 *
 * Why these matter: Type VR is the #6 most-downloaded manual in the library,
 * but everything we held for it was the 1995 O&M bulletin 6055-31 -- stamped
 * PRELIMINARY on every page, carrying no ratings table and no catalog grammar.
 * These four are current, native-text (not scans) and carry no third-party
 * watermark, unlike several of the library's existing Square D MV copies.
 *
 * 6055DB1402 also adds a voltage class we did not hold at all: 27 kV.
 *
 * Verified transcription of every table in these files lives outside the repo
 * at Projects/Decoders/SQD-VR/vr-data.json, together with the five recorded
 * document defects (duplicated VR-08050 catalog numbers, the 60 kV BIL misprint,
 * VR-15150-40 missing from the ratings chart, the hyphenation split, PRELIMINARY).
 */
import { createClient } from '@libsql/client';
import { put } from '@vercel/blob';
import { readFileSync, existsSync, statSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const LIVE = process.argv.includes('--live');
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const SRC = 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Decoders/SQD-VR';

const KW_BASE = 'Square D, Schneider Electric, Square D Schneider, Circuit Breakers, Type VR, Square D Type VR, VR, Masterclad, Class 6055, medium voltage vacuum circuit breaker, vacuum circuit breaker, drawout, metal clad switchgear, ANSI, NEMA, PDF, free download';

// Catalog numbers each document actually publishes. Scoped per document on
// purpose -- 6055-33 and 6055-37 carry no catalog chart at all, so they get none.
const CAT_5_15 = [
  'VR-05025-12','VR-05025-20','VR-05025-30',
  'VR-05035-12','VR-05035-20','VR-05035-30','VR-05035-40',
  'VR-05050-12','VR-05050-20','VR-05050-30','VR-05050-40',
  'VR-08050-12','VR-08050-20','VR-08050-30','VR-08050-40',
  'VR-15050-12','VR-15050-20','VR-15050-30',
  'VR-15075-12','VR-15075-20','VR-15075-30',
  'VR-15100-12','VR-15100-20','VR-15100-30',
  'VR-15150-12','VR-15150-20','VR-15150-30','VR-15150-40',
];
// 6055DB1402 prints these BOTH ways in the same document (p6 unhyphenated,
// p8 hyphenated), so both spellings are indexed.
const CAT_27 = [
  'VR-27016-12','VR-27016-20','VR-27025-12','VR-27025-20','VR-27040-12','VR-27040-20',
  'VR-2701612','VR-2701620','VR-2702512','VR-2702520','VR-2704012','VR-2704020',
];

const DOCS = [
  {
    file: '6055DB1401_TypeVR_5-15kV_2022-06.pdf',
    blob: 'manuals/circuitBreaker/Square D/Breakers/6055DB1401 Type VR Medium Voltage Vacuum Circuit Breaker Data Bulletin 5-15 kV.pdf',
    row: {
      slug: 'square-d-type-vr-medium-voltage-vacuum-circuit-breaker-data-bulletin-5-15kv',
      title: 'Square D Type VR Medium Voltage Vacuum Circuit Breaker Data Bulletin 5-15 kV',
      manual_number: '6055DB1401',
      category: 'Circuit Breakers',
      manufacturer: 'Square D',
      subcategory: 'Medium & High Voltage Breakers',
      description:
        'Schneider Electric / Square D data bulletin 6055DB1401 (06/2022, replaces Rev. 01 03/2014) for Type VR medium voltage vacuum circuit breakers, ANSI/NEMA 5-15 kV, 1200/2000/3000/4000 A, 25-63 kA. Carries the full 5-15 kV rated values chart keyed by catalog number — nominal voltage, K factor, MVA rating, rated continuous current, power frequency withstand, lightning impulse (BIL), system interrupting, close and latch, short time current and duration, interrupting time and mechanical endurance — plus the capacitor switching duty table with rated capacitor switching current and test certificate per catalog number, the ANSI C37.06 Table 9 control voltage operating ranges, dimensions and weights. Note that the MVA column is published "for reference only"; the controlling rating is the kA column. 3-cycle interrupting, ANSI C37.06 / C37.09 / C37.54, UL Listed. 6 pages, English.',
      page_count: 6,
      keywords: `${KW_BASE}, 6055DB1401, data bulletin, 5 kV, 8.25 kV, 15 kV, 4.76 kV, 1200A, 2000A, 3000A, 4000A, 25 kA, 40 kA, 50 kA, 63 kA, MVA rating, close and latch, BIL, capacitor switching, C37.06, C37.09, C37.54, control voltage, mechanical endurance, ${CAT_5_15.join(', ')}`,
      search_priority: 92,
    },
  },
  {
    file: '6055DB1402_TypeVR_27kV_2026-03.pdf',
    blob: 'manuals/circuitBreaker/Square D/Breakers/6055DB1402 Type VR 27 kV Medium Voltage Vacuum Circuit Breakers Data Bulletin.pdf',
    row: {
      slug: 'square-d-type-vr-27kv-medium-voltage-vacuum-circuit-breakers-data-bulletin',
      title: 'Square D Type VR 27 kV Medium Voltage Vacuum Circuit Breakers Data Bulletin',
      manual_number: '6055DB1402',
      category: 'Circuit Breakers',
      manufacturer: 'Square D',
      subcategory: 'Medium & High Voltage Breakers',
      description:
        'Schneider Electric / Square D data bulletin 6055DB1402 (R03/26) for Type VR 27 kV medium voltage vacuum circuit breakers, ANSI/NEMA 1200 and 2000 A, 16-40 kA. Carries the 27 kV rated values chart keyed by catalog number, breaker-mounted auxiliary contact ratings, capacitor switching data, dimensions and weights (625 lb at 1200 A, 650 lb at 2000 A). On the 27 kV line the middle field of the catalog number is the short circuit current in kA — VR-27040 is 40 kA — not the MVA class it denotes on the 5, 8.25 and 15 kV lines. 10 pages, English.',
      page_count: 10,
      keywords: `${KW_BASE}, 6055DB1402, data bulletin, 27 kV, 1200A, 2000A, 16 kA, 25 kA, 40 kA, auxiliary contact ratings, capacitor switching, 125 kV BIL, ${CAT_27.join(', ')}`,
      search_priority: 92,
    },
  },
  {
    file: '6055-33_TypeVR_InstructionBulletin_2012-03.pdf',
    blob: 'manuals/circuitBreaker/Square D/Breakers/6055-33 Type VR Vacuum Circuit Breaker Instruction Bulletin.pdf',
    row: {
      slug: 'square-d-type-vr-vacuum-circuit-breaker-instruction-bulletin-6055-33',
      title: 'Square D Type VR Vacuum Circuit Breaker Instruction Bulletin 6055-33',
      manual_number: '6055-33',
      category: 'Circuit Breakers',
      manufacturer: 'Square D',
      subcategory: 'Medium & High Voltage Breakers',
      description:
        'Schneider Electric / Square D instruction bulletin 6055-33 (03/2012) for Type VR vacuum circuit breakers — 4.76 kV, 8.25 kV and 15 kV at 3000 A / 50 kA, and 4.76 kV and 15 kV at 1200, 2000 and 3000 A / 63 kA. Covers receiving, handling and storage, description of the stored-energy operating mechanism and control circuit, initial preparation, manual open and close, hi-pot (dielectric) testing, racking in and out, operation, maintenance, vacuum interrupter inspection and replacement, contact gap measurement and lubrication — with the contact gap and hi-pot values given separately for the 50 kA and 63 kA builds. Supersedes the 1995 bulletin 6055-31 for these ratings. Trilingual (English / Spanish / French), 113 pages.',
      page_count: 113,
      keywords: `${KW_BASE}, 6055-33, instruction bulletin, 4.76 kV, 8.25 kV, 15 kV, 1200A, 2000A, 3000A, 50 kA, 63 kA, vacuum interrupter replacement, contact gap, hi-pot, dielectric test, racking, stored energy mechanism, maintenance, trilingual, English Spanish French, interruptor automatico al vacio tipo VR, disjoncteur sous vide type VR`,
      search_priority: 90,
    },
  },
  {
    file: '6055-37_TypeVR_GroundAndTestDevice_2015-09.pdf',
    blob: 'manuals/circuitBreaker/Square D/Breakers/6055-37 Type VR Electrically Operated Ground and Test Device Instruction Bulletin.pdf',
    row: {
      slug: 'square-d-type-vr-electrically-operated-ground-and-test-device-6055-37',
      title: 'Square D Type VR Electrically Operated Ground and Test Device Instruction Bulletin 6055-37',
      manual_number: '6055-37',
      category: 'Circuit Breakers',
      manufacturer: 'Square D',
      subcategory: 'Switchgear & Parts',
      description:
        'Schneider Electric / Square D instruction bulletin 6055-37 (Rev. 01, 09/2015) for the Type VR electrically operated ground and test device, for use with Masterclad metal-clad switchgear, 4.76 kV to 15 kV, 1200/2000/3000/4000 A, up to 63 kA short circuit rating, Class 6055. Covers the device description, controls and indicators, installation into the circuit breaker cell, grounding procedure, operation and maintenance. This is a ground and test device, not a circuit breaker. 29 pages.',
      page_count: 29,
      keywords: `${KW_BASE}, 6055-37, ground and test device, G&T, electrically operated, grounding, test device, circuit breaker cell, 4.76 kV, 15 kV, 1200A, 2000A, 3000A, 4000A, 63 kA, instruction bulletin, safety grounding`,
      search_priority: 80,
    },
  },
];

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function main() {
  console.log('='.repeat(72));
  console.log(`Square D Type VR source bulletins  [${LIVE ? 'LIVE' : 'DRY RUN'}]`);
  console.log('='.repeat(72));

  if (!process.env.TURSO_DATABASE_URL || !BLOB_TOKEN) { console.error('Missing env.'); process.exit(1); }

  // Pre-flight: every file present, and nothing already listed.
  const ready = [];
  for (const d of DOCS) {
    const abs = `${SRC}/${d.file}`;
    if (!existsSync(abs)) { console.log(`  MISSING SOURCE: ${abs}`); continue; }
    const bytes = statSync(abs).size;
    const dupe = await db.execute({
      sql: `SELECT id, slug FROM manuals WHERE slug = ? OR manual_number = ?`,
      args: [d.row.slug, d.row.manual_number],
    });
    if (dupe.rows.length) {
      console.log(`  ALREADY LISTED, skipping ${d.row.manual_number}: ` + dupe.rows.map(r => `id=${r.id}`).join(', '));
      continue;
    }
    console.log(`\n  ${d.row.manual_number}  ${bytes.toLocaleString()} bytes, ${d.row.page_count} pages`);
    console.log(`    title : ${d.row.title}`);
    console.log(`    sub   : ${d.row.subcategory}   priority ${d.row.search_priority}`);
    console.log(`    slug  : /manual/${d.row.slug}`);
    console.log(`    blob  : ${d.blob}`);
    console.log(`    kw    : ${d.row.keywords.length} chars`);
    ready.push({ ...d, abs, bytes });
  }

  console.log(`\n${ready.length} of ${DOCS.length} ready to ingest.`);
  if (!LIVE) { console.log('\nDRY RUN complete. Re-run with --live to upload and insert.'); return; }
  if (!ready.length) return;

  for (const d of ready) {
    const res = await put(d.blob, readFileSync(d.abs), {
      access: 'public', token: BLOB_TOKEN, contentType: 'application/pdf',
      addRandomSuffix: false, allowOverwrite: true,
    });
    console.log(`\n[BLOB] ${d.row.manual_number} -> ${res.url}`);

    const head = await fetch(res.url, { method: 'HEAD' });
    const len = Number(head.headers.get('content-length'));
    if (head.status !== 200 || len !== d.bytes) {
      console.log(`  ⚠ blob verify FAILED (${head.status}, ${len} != ${d.bytes}) — not inserting.`);
      continue;
    }

    const row = { ...d.row, pdf_url: res.url, file_size_bytes: d.bytes };
    const cols = Object.keys(row);
    await db.execute({
      sql: `INSERT INTO manuals (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
      args: cols.map(c => row[c]),
    });
    const ins = await db.execute({ sql: `SELECT id FROM manuals WHERE slug = ?`, args: [row.slug] });
    console.log(`[INS]  id=${ins.rows[0].id}  /manual/${row.slug}`);
  }

  try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('\n[FTS] rebuilt.'); }
  catch (err) { console.log(`\n[FTS] rebuild FAILED: ${err.message}`); }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
