/**
 * Ingest Eaton catalog CA08100005E (Volume 4, Tab 2 "Molded Case Circuit Breakers", April 2026)
 * into Vercel Blob and the manuals table.
 *
 *   node scripts/add-eaton-mccb-catalog-ca08100005e.mjs          # DRY RUN
 *   node scripts/add-eaton-mccb-catalog-ca08100005e.mjs --live
 *
 * Why: the library held ZERO Power Defense molded case documents — its 26 "Power Defense" titles
 * are all NF / RF / SB insulated-case breakers — so the Power Defense MCCB decoder (/tools/pd-mccb)
 * had no manual to send people to, and its manual matcher matched nothing. This is the current
 * edition of the catalog the decoder is built from (the 2021 edition is the rating basis; this one
 * carries PDK DC, PDL1 and PVGard). It also covers Series G and Series C, the frames Power Defense
 * replaces. Native text, no third-party watermark, PDF Title metadata is Eaton's own.
 *
 * The title deliberately reads "Power Defense … Molded Case" so the pd-mccb matcher in
 * lib/decoders.ts links it to the decoder (it sits ahead of pxr-pdsb, whose bare "power defense"
 * would otherwise claim it).
 */
import { createClient } from '@libsql/client';
import { put } from '@vercel/blob';
import { readFileSync, existsSync, statSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const LIVE = process.argv.includes('--live');
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const SRC = 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Decoders/Eaton Power Defense MCCB/mccb-catalog-v4-t2-ca08100005e.pdf';

const DOC = {
  blob: 'manuals/circuitBreaker/Eaton/Molded_Case_Breakers/CA08100005E Power Defense Series G Series C Molded Case Circuit Breakers Catalog April 2026.pdf',
  row: {
    slug: 'eaton-power-defense-series-g-series-c-molded-case-circuit-breakers-catalog-ca08100005e',
    title: 'Eaton Power Defense, Series G and Series C Molded Case Circuit Breakers Catalog',   // the page appends manual_number itself
    manual_number: 'CA08100005E',
    category: 'Circuit Breakers',
    manufacturer: 'Eaton',
    subcategory: 'Molded Case Breakers',
    description:
      'Eaton catalog CA08100005E, Volume 4 Circuit Protection, Tab 2 "Molded Case Circuit Breakers" (April 2026). '
      + 'Power Defense (pages V4-T2-3 to 157): the catalog numbering system for all six frames (PD1 125 A to PD6 2500 A), '
      + 'UL/CSA interrupting ratings and IEC 60947-2 Icu/Ics breaking capacity, Power Xpert Release PXR 10 / 20 / 25 trip unit '
      + 'options, thermal-magnetic trip units, motor circuit protectors, motor protection circuit breakers, high-instantaneous '
      + 'breakers for selective coordination, PDK direct current breakers to 800 Vdc, PDL1, PVGard 1000 Vdc photovoltaic '
      + 'breakers, terminals and lugs, internal and external accessories, and special modifications. Series G (EG, NG and RG '
      + 'frames) and Series C molded case circuit breakers follow, both marked "to be obsolete" in this edition, then specialty '
      + 'breakers. '
      + 'Use with the free Power Defense MCCB decoder to read a catalog number off the breaker label. 464 pages, English.',
    page_count: 464,
    keywords: [
      'Eaton', 'Cutler-Hammer', 'Circuit Breakers', 'molded case circuit breaker', 'MCCB', 'Power Defense',
      'Power Defense MCCB', 'PD1', 'PD2', 'PD3', 'PD4', 'PD5', 'PD6', 'PDG', 'PDF', 'PDD', 'PDJ', 'PDK', 'PDL1', 'PVGard',
      'Power Xpert Release', 'PXR 10', 'PXR 20', 'PXR 25', 'thermal-magnetic', 'motor circuit protector', 'MCP',
      'motor protection circuit breaker', 'MPCB', 'DC circuit breaker', 'photovoltaic', '1000 Vdc', 'Series G', 'EG',
      'NG', 'RG', 'Series C', 'interrupting rating', 'catalog numbering', 'terminals', 'lugs',
      'accessories', 'shunt trip', 'undervoltage release', 'CA08100005E', 'Volume 4', 'catalog', 'PDF', 'free download',
    ].join(', '),
    search_priority: 92,
  },
};

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function main() {
  console.log(`Eaton CA08100005E molded case catalog  [${LIVE ? 'LIVE' : 'DRY RUN'}]`);
  if (!process.env.TURSO_DATABASE_URL || !BLOB_TOKEN) { console.error('Missing env.'); process.exit(1); }
  if (!existsSync(SRC)) { console.error('MISSING SOURCE: ' + SRC); process.exit(1); }
  const bytes = statSync(SRC).size;
  const head = readFileSync(SRC).subarray(0, 5).toString();
  if (head !== '%PDF-') { console.error('Not a PDF: ' + head); process.exit(1); }

  const dupe = await db.execute({
    sql: `SELECT id, slug FROM manuals WHERE slug = ? OR manual_number = ?`,
    args: [DOC.row.slug, DOC.row.manual_number],
  });
  if (dupe.rows.length) { console.log('ALREADY LISTED: ' + dupe.rows.map((r) => `id=${r.id} ${r.slug}`).join(', ')); return; }

  console.log(`  ${bytes.toLocaleString()} bytes, ${DOC.row.page_count} pages`);
  console.log(`  title : ${DOC.row.title}`);
  console.log(`  slug  : /manual/${DOC.row.slug}`);
  console.log(`  blob  : ${DOC.blob}`);
  console.log(`  kw    : ${DOC.row.keywords.length} chars`);
  if (!LIVE) { console.log('\nDRY RUN complete. Re-run with --live to upload and insert.'); return; }

  const res = await put(DOC.blob, readFileSync(SRC), {
    access: 'public', token: BLOB_TOKEN, contentType: 'application/pdf', addRandomSuffix: false, allowOverwrite: true,
  });
  console.log(`[BLOB] ${res.url}`);
  const h = await fetch(res.url, { method: 'HEAD' });
  const len = Number(h.headers.get('content-length'));
  if (h.status !== 200 || len !== bytes) { console.log(`blob verify FAILED (${h.status}, ${len} != ${bytes}) — not inserting.`); process.exit(1); }

  const row = { ...DOC.row, pdf_url: res.url, file_size_bytes: bytes };
  const cols = Object.keys(row);
  await db.execute({ sql: `INSERT INTO manuals (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`, args: cols.map((c) => row[c]) });
  const ins = await db.execute({ sql: `SELECT id FROM manuals WHERE slug = ?`, args: [row.slug] });
  console.log(`[INS]  id=${ins.rows[0].id}  /manual/${row.slug}`);

  try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('[FTS] rebuilt.'); }
  catch (err) { console.log(`[FTS] rebuild FAILED: ${err.message}`); }
}

main().catch((err) => { console.error('Fatal:', err); process.exit(1); });
