/**
 * Ingest five Eaton Pringle bolted pressure contact switch documents into Vercel Blob and the
 * manuals table.
 *
 *   node scripts/add-eaton-pringle-documents.mjs          # DRY RUN
 *   node scripts/add-eaton-pringle-documents.mjs --live
 *
 * Why: the library held ZERO Pringle documents. The only bolted pressure rows were other makers'
 * switches (GE Type HPC #7740, Square D bulletin SB-5 #7822). These are the sources the Pringle
 * decoder (/tools/pringle) is built from. All five are Eaton's own publications, native text, no
 * third-party watermark.
 *
 * Every title carries "Pringle" so the pringle matcher in lib/decoders.ts links each row to the
 * decoder once it launches (matchDecoderForManual refuses comingSoon decoders, so nothing links
 * before then). The descriptions deliberately do NOT mention the decoder: it is still unannounced.
 * The CA08100003E title must never say "Power Defense", "NRX" or "PXR" — the pxr-pdsb matcher sits
 * ahead of pringle and would claim the row. Those words live in the description and keywords only.
 *
 * Not ingested: "Eaton Specification Sheet.pdf" in the project folder is an RSP Supply (distributor)
 * product page for CB1633T120208GR, not an Eaton document. TD00808001E April 2026 (renewal parts
 * edition) is not in this batch — its slug below is year-suffixed so it can be added alongside.
 */
import { createClient } from '@libsql/client';
import { put } from '@vercel/blob';
import { readFileSync, existsSync, statSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const LIVE = process.argv.includes('--live');
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const SRC = 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Decoders/Eaton Pringle Switch';
const BLOB_DIR = 'part_manuals/pdf/switch/Eaton';

const KW_BASE = [
  'Eaton', 'Cutler-Hammer', 'Pringle', 'Pringle Electrical', 'Pringle switch', 'bolted pressure switch',
  'bolted pressure contact switch', 'bolted contact switch', 'Switches', 'service entrance switch',
  'UL 977', 'UL 891 switchboard', 'Class L fuse',
];
const kw = (extra) => [...KW_BASE, ...extra, 'PDF', 'free download'].join(', ');

const DOCS = [
  {
    file: 'PringleCatalog.pdf',
    blob: `${BLOB_DIR}/Disconnect_Switches/TD00808001E Pringle Switch and Replacement Parts Technical Data February 2007.pdf`,
    row: {
      slug: 'eaton-pringle-bolted-contact-switch-replacement-parts-technical-data-td00808001e-2007',
      title: 'Eaton Pringle Bolted Contact Switch and Replacement Parts Technical Data (2007)',
      manual_number: 'TD00808001E',
      category: 'Switches',
      manufacturer: 'Eaton',
      subcategory: 'Disconnect Switches',
      description:
        'Eaton Technical Data TD00808001E, effective February 2007 (supersedes the August 2006 edition). '
        + 'Covers the Pringle bolted contact switch family: CBC electrical trip (charge-before-close), FP fault protector, '
        + 'QA manually operated (quick-acting), EO electrically operated and the PMS Pringle Mill Switch. Includes the catalog '
        + 'numbering systems for each type, replacement parts, and cross-reference tables from old Pringle catalog numbers '
        + '(CBC-…, QA-…, FP-…) to the current Eaton (Vista) catalog numbers. 800 A to 6000 A. 8 pages, English.',
      page_count: 8,
      keywords: kw([
        'CBC', 'charge before close', 'electrical trip', 'QA', 'quick acting', 'manually operated', 'FP', 'fault protector',
        'EO', 'electrically operated', 'PMS', 'Pringle Mill Switch', 'catalog numbering', 'old Pringle catalog number',
        'cross reference', 'Vista catalog number', 'replacement parts', 'renewal parts', 'CB1633B120480', 'QA0833B480',
        'CBC-0833-B-120', 'QA-0833-B', 'TD00808001E', 'technical data',
      ]),
      search_priority: 92,
    },
  },
  {
    file: 'eaton-pringle-switches-bolted-contact-switches-brochures-br00808001e-ca.pdf',
    blob: `${BLOB_DIR}/Disconnect_Switches/BR00808001E Pringle Switches Bolted Contact Switches Brochure July 2014.pdf`,
    row: {
      slug: 'eaton-pringle-switches-bolted-contact-switches-brochure-br00808001e',
      title: 'Eaton Pringle Switches Bolted Contact Switches Brochure',
      manual_number: 'BR00808001E',
      category: 'Switches',
      manufacturer: 'Eaton',
      subcategory: 'Disconnect Switches',
      description:
        'Eaton brochure BR00808001E, July 2014. How the Pringle bolted pressure mechanism works (blades, hinge and jaw '
        + 'bolts, clamping nuts, non-magnetic bolting mechanism), the CBC electrical trip and QA manually operated switches, '
        + 'performance standards (UL 977, temperature rise, no-load endurance, load make-and-break, 200 kA with Class L '
        + 'fuses, trip solenoid), the washer-stack spring mechanism, accessories, switch variations (FP fault protector, '
        + 'EO electrically operated, PMS mill switch, enclosed, manual transfer and live front switches), and the '
        + 'replacement parts Eaton offers: pole and pole yoke assemblies, arc chutes, clamping mechanism, coil/solenoid, '
        + 'operating mechanism, pan assemblies and handles. 12 pages, English.',
      page_count: 12,
      keywords: kw([
        'CBC', 'charge before close', 'QA', 'quick acting', 'FP', 'fault protector', 'EO', 'electrically operated', 'PMS',
        'mill switch', 'manual transfer switch', 'live front switch', 'arc chute', 'pole yoke', 'operating mechanism',
        'deadfront', 'trip solenoid', 'blown fuse detector', 'replacement parts', 'BR00808001E', 'brochure',
      ]),
      search_priority: 88,
    },
  },
  {
    file: 'sources/pringle-cbc-install-maint-il00808003e.pdf',
    blob: `${BLOB_DIR}/Disconnect_Switches/IL00808003E Pringle Type CBC Switch Installation Operating Maintenance Instructions.pdf`,
    row: {
      slug: 'eaton-pringle-type-cbc-switch-installation-operating-maintenance-instructions-il00808003e',
      title: 'Eaton Pringle Type CBC Switch Installation, Operating and Maintenance Instructions',
      manual_number: 'IL00808003E',
      category: 'Switches',
      manufacturer: 'Eaton',
      subcategory: 'Disconnect Switches',
      description:
        'Eaton instructions IL00808003E, December 2008, for Pringle type CBC (charge-before-close) bolted pressure switches. '
        + 'Installation in the switchboard (shipping position, mounting, bus and cable connection, handle and trim plate), '
        + 'how to open and close the switch, and the annual inspection and maintenance routine. English.',
      page_count: 1,
      keywords: kw([
        'CBC', 'charge before close', 'electrical trip', 'installation', 'operation', 'maintenance', 'inspection',
        'instruction leaflet', 'IL00808003E',
      ]),
      search_priority: 90,
    },
  },
  {
    file: 'sources/pringle-productaid-pa008002en_eaton-cn-current.pdf',
    blob: `${BLOB_DIR}/Disconnect_Switches/PA008002EN Pringle Bolted Pressure Contact Switches Product Aid March 2018.pdf`,
    row: {
      slug: 'eaton-pringle-bolted-pressure-contact-switches-product-aid-pa008002en',
      title: 'Eaton Pringle Bolted Pressure Contact Switches Product Aid',
      manual_number: 'PA008002EN',
      category: 'Switches',
      manufacturer: 'Eaton',
      subcategory: 'Disconnect Switches',
      description:
        'Eaton product aid PA008002EN, March 2018. Features and ratings of the Pringle QA, CBC and FP switches, the NEMA 3R '
        + 'enclosed switch, a comparison matrix of QA / CBC / FP / PMS by frame (800 A, 1200-2000 A, 2500 A, 3000-4000 A) and '
        + 'feature, and the catalog numbering systems for each switch type including the Pringle Mill Switch. 4 pages, English.',
      page_count: 4,
      keywords: kw([
        'QA', 'quick acting', 'CBC', 'charge before close', 'FP', 'fault protector', 'PMS', 'Pringle Mill Switch',
        'NEMA 3R', 'enclosed switch', 'catalog numbering', 'comparison matrix', 'product aid', 'PA008002EN',
      ]),
      search_priority: 90,
    },
  },
  {
    file: 'sources/switching-devices-catalog-vol1-tab2-ca08100003e.pdf',
    blob: `${BLOB_DIR}/Safety_Switches/CA08100003E Volume 2 Tab 1 Switching Devices Catalog August 2026.pdf`,
    row: {
      slug: 'eaton-switching-devices-catalog-safety-switches-pringle-bolted-pressure-switches-ca08100003e',
      title: 'Eaton Switching Devices Catalog: Safety Switches, Pringle Bolted Pressure Switches and Enclosed Disconnects',
      manual_number: 'CA08100003E',
      category: 'Switches',
      manufacturer: 'Eaton',
      subcategory: 'Safety Switches',
      description:
        'Eaton catalog CA08100003E, Volume 2 Commercial Distribution, Tab 1 "Switching Devices" (August 2026). '
        + 'Safety switches (general-duty, heavy-duty, 800 Vac and 1000 Vac, double-door, six-pole, double-throw, EnviroLine '
        + 'stainless, window, receptacle, KRYDON non-metallic, shunt trip, NEMA 7/9 hazardous location, quick-connect, DC '
        + 'disconnect, mill-duty, elevator control, surge and OEM line isolation), catalog number selection, accessories and '
        + 'short-circuit ratings. Pringle bolted pressure switches (pages V2-T1-101 to 103): CBC and QA product selection '
        + 'and the current catalog numbering system, including FP. Also Type DS fusible and non-fusible switches, Visi-Flex DE-ION and flange-mounted '
        + 'disconnects, enclosed circuit breakers (Power Defense, Power Xpert and NRX) and enclosed rotary disconnects. '
        + '141 pages, English.',
      page_count: 141,
      keywords: kw([
        'safety switch', 'heavy-duty safety switch', 'general-duty safety switch', 'double-throw switch', 'DC disconnect',
        'KRYDON', 'EnviroLine', 'shunt trip safety switch', 'NEMA 7/9', 'Type DS', 'Visi-Flex', 'DE-ION', 'flange mounted',
        'enclosed circuit breaker', 'Power Defense', 'Power Xpert', 'NRX', 'rotary disconnect', 'CBC', 'QA',
        'FP', 'catalog numbering', 'CA08100003E', 'Volume 2', 'catalog',
      ]),
      search_priority: 90,
    },
  },
];

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function main() {
  console.log(`Eaton Pringle documents (${DOCS.length})  [${LIVE ? 'LIVE' : 'DRY RUN'}]`);
  if (!process.env.TURSO_DATABASE_URL || !BLOB_TOKEN) { console.error('Missing env.'); process.exit(1); }

  // Validate every source before touching anything.
  for (const d of DOCS) {
    const p = `${SRC}/${d.file}`;
    if (!existsSync(p)) { console.error('MISSING SOURCE: ' + p); process.exit(1); }
    const head = readFileSync(p).subarray(0, 5).toString();
    if (head !== '%PDF-') { console.error(`Not a PDF (${head}): ${p}`); process.exit(1); }
    d.path = p;
    d.bytes = statSync(p).size;
  }

  let inserted = 0;
  for (const d of DOCS) {
    console.log(`\n${d.row.manual_number}  ${d.bytes.toLocaleString()} bytes, ${d.row.page_count} pages`);
    const dupe = await db.execute({
      sql: `SELECT id, slug FROM manuals WHERE slug = ? OR manual_number = ?`,
      args: [d.row.slug, d.row.manual_number],
    });
    if (dupe.rows.length) { console.log('  ALREADY LISTED: ' + dupe.rows.map((r) => `id=${r.id} ${r.slug}`).join(', ')); continue; }
    console.log(`  title : ${d.row.title}`);
    console.log(`  slug  : /manual/${d.row.slug}`);
    console.log(`  file  : ${d.row.category} / ${d.row.subcategory}`);
    console.log(`  blob  : ${d.blob}`);
    console.log(`  kw    : ${d.row.keywords.length} chars`);
    if (!LIVE) continue;

    const res = await put(d.blob, readFileSync(d.path), {
      access: 'public', token: BLOB_TOKEN, contentType: 'application/pdf', addRandomSuffix: false, allowOverwrite: true,
    });
    console.log(`  [BLOB] ${res.url}`);
    const h = await fetch(res.url, { method: 'HEAD' });
    const len = Number(h.headers.get('content-length'));
    if (h.status !== 200 || len !== d.bytes) { console.log(`  blob verify FAILED (${h.status}, ${len} != ${d.bytes}) — not inserting.`); process.exit(1); }

    const row = { ...d.row, pdf_url: res.url, file_size_bytes: d.bytes };
    const cols = Object.keys(row);
    await db.execute({ sql: `INSERT INTO manuals (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`, args: cols.map((c) => row[c]) });
    const ins = await db.execute({ sql: `SELECT id FROM manuals WHERE slug = ?`, args: [row.slug] });
    console.log(`  [INS]  id=${ins.rows[0].id}  /manual/${row.slug}`);
    inserted++;
  }

  if (!LIVE) { console.log('\nDRY RUN complete. Re-run with --live to upload and insert.'); return; }
  if (inserted) {
    try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('\n[FTS] rebuilt.'); }
    catch (err) { console.log(`\n[FTS] rebuild FAILED: ${err.message}`); }
  }
}

main().catch((err) => { console.error('Fatal:', err); process.exit(1); });
