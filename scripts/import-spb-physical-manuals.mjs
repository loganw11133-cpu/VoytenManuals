/**
 * Import physical SPB instruction PDFs into Vercel Blob + Turso.
 *
 * Source: Logan's local SPB manual set (Westinghouse/Cutler-Hammer Type SPB
 * "Systems Pow-R Breaker"). 10 new docs + 1 revision upgrade (Aux Switch A->C).
 * 4 exact duplicates already on Blob are intentionally skipped.
 *
 * Manufacturer tagging follows the existing per-heritage DB convention:
 *   - I.L./I.B./I.S. 15xxx + 6647C19H04 part-style => Westinghouse
 *   - 29-88x Digitrip RMS trip units              => Eaton (Cutler-Hammer era)
 * "RMA" in source filenames is an OCR error for "RMS" (no RMA product exists).
 *
 * Usage:
 *   node scripts/import-spb-physical-manuals.mjs            # DRY RUN (default)
 *   node scripts/import-spb-physical-manuals.mjs --live      # upload + write to prod
 */

import { readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';
import { put } from '@vercel/blob';
import dotenv from 'dotenv';

// .env.local lives in the DesktopBackup structural copy, not this clone.
const ENV_PATH = 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local';
dotenv.config({ path: ENV_PATH });

const LIVE = process.argv.includes('--live');
const SRC_DIR = 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\RLBreakers, SPBBreakers, EatonRetrofit\\SPBBreakers -- VM';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 120);
}

const SPB_TAIL = 'Free PDF download from Voyten Manuals.';

// ── 10 NEW manuals ──
const NEW_ENTRIES = [
  {
    file: '6647C19H04 Instructions for Electric Operator-Spring Release.pdf',
    blobPath: 'part_manuals/pdf/circuitBreaker/Westinghouse/SPB_Accessories/6647C19H04.pdf',
    title: 'Instructions for Electric Operator and Spring Release in Type SPB Systems Pow-R Breakers',
    manual_number: '6647C19H04',
    manufacturer: 'Westinghouse',
    subcategory: 'Other',
    page_count: 8,
    search_priority: 7,
    description: `Westinghouse instructions for the electric (motor) operator and spring release device used with Type SPB Systems Pow-R low-voltage power circuit breakers. Covers installation, operation, and adjustment of the motorized spring-charging operator and the spring-release solenoid that permits remote electrical closing of a charged SPB breaker. ${SPB_TAIL}`,
    keywords: 'Westinghouse SPB, Systems Pow-R Breaker, electric operator, motor operator, spring release, spring charging, remote close, 6647C19H04, SPB accessories',
  },
  {
    file: 'I.B. 29-801C SYSTEMS POW-R BREAKER.pdf',
    blobPath: 'part_manuals/pdf/circuitBreaker/Westinghouse/Breakers/IB29-801C.pdf',
    title: 'Westinghouse Type SPB Systems Pow-R Breaker Instruction Book (I.B. 29-801C)',
    manual_number: 'I.B. 29-801C',
    manufacturer: 'Westinghouse',
    subcategory: 'Air Circuit Breakers',
    page_count: 32,
    search_priority: 8,
    description: `Westinghouse Instruction Book (publication 29-801, revision C) for the Type SPB Systems Pow-R low-voltage power circuit breaker. A 32-page instruction book covering the SPB breaker; see also the Systems Pow-R Breaker and Drawout Mechanism (I.B. 15082) and the Master Connection Diagram manuals. ${SPB_TAIL}`,
    keywords: 'Westinghouse SPB, Systems Pow-R Breaker, instruction book, 29-801, I.B. 29-801C, insulated case, low voltage power circuit breaker, SPB-50, SPB-65, SPB-100, SPB-150',
  },
  {
    file: 'I.L. 15129 Installing Mechnical Cable Interlock.pdf',
    blobPath: 'part_manuals/pdf/circuitBreaker/Westinghouse/SPB_Accessories/IL15129.pdf',
    title: 'Instructions for Installing Mechanical Cable Interlock in Type SPB Systems Pow-R Breakers',
    manual_number: 'I.L. 15129',
    manufacturer: 'Westinghouse',
    subcategory: 'Other',
    page_count: 2,
    search_priority: 6,
    description: `Westinghouse instructions (I.L. 15129) for field installation of the mechanical cable interlock between Type SPB Systems Pow-R breakers. The cable interlock mechanically prevents two breakers from being closed simultaneously (e.g., main-tie-main schemes). ${SPB_TAIL}`,
    keywords: 'Westinghouse SPB, Systems Pow-R Breaker, mechanical cable interlock, Bowden cable interlock, main-tie-main, breaker interlock, I.L. 15129, SPB accessories',
  },
  {
    file: 'I.L. 15146-A Instructions for Capactitor Trip Device.pdf',
    blobPath: 'part_manuals/pdf/circuitBreaker/Westinghouse/SPB_Accessories/IL15146A.pdf',
    title: 'Instructions for Capacitor Trip Device Used with Type SPB Systems Pow-R Breakers',
    manual_number: 'I.L. 15146-A',
    manufacturer: 'Westinghouse',
    subcategory: 'Other',
    page_count: 7,
    search_priority: 6,
    description: `Westinghouse instructions (I.L. 15146-A) for the capacitor trip device used with the DC shunt trip on Type SPB Systems Pow-R breakers. The capacitor trip device stores a charge so the breaker can be tripped even after control power is lost. ${SPB_TAIL}`,
    keywords: 'Westinghouse SPB, Systems Pow-R Breaker, capacitor trip device, capacitor trip, DC shunt trip, control power loss, I.L. 15146-A, SPB accessories',
  },
  {
    file: 'I.L. 15162C Instructions for UVR.PDF',
    blobPath: 'part_manuals/pdf/circuitBreaker/Westinghouse/SPB_Accessories/IL15162C.pdf',
    title: 'Instructions for Undervoltage Release (UVR) in Type SPB Systems Pow-R Breakers',
    manual_number: 'I.L. 15162C',
    manufacturer: 'Westinghouse',
    subcategory: 'Other',
    page_count: 7,
    search_priority: 6,
    description: `Westinghouse instructions (I.L. 15162, revision C) for the instantaneous undervoltage release (UVR) device that trips a Type SPB Systems Pow-R breaker when control voltage drops below threshold. Used with the I.L. 15141 UVR time-delay device for delayed operation. ${SPB_TAIL}`,
    keywords: 'Westinghouse SPB, Systems Pow-R Breaker, undervoltage release, UVR, instantaneous undervoltage, voltage monitoring, I.L. 15162C, SPB accessories',
  },
  {
    file: 'I.L. 15494D Instructions Handles and Hub Assembly.PDF',
    blobPath: 'part_manuals/pdf/circuitBreaker/Westinghouse/SPB_Accessories/IL15494D.pdf',
    title: 'Instructions for Replacing Handle Hub Assembly on Type SPB Systems Pow-R Breakers',
    manual_number: 'I.L. 15494D',
    manufacturer: 'Westinghouse',
    subcategory: 'Other',
    page_count: 5,
    search_priority: 6,
    description: `Westinghouse instructions (I.L. 15494, revision D) for replacing the manual charging-handle hub assembly on Type SPB Systems Pow-R breakers. Covers removing the handle and breaker cover and replacing the charging hub, sleeve, and key assembly. ${SPB_TAIL}`,
    keywords: 'Westinghouse SPB, Systems Pow-R Breaker, handle hub assembly, charging handle, charging hub, hub replacement, I.L. 15494D, SPB accessories',
  },
  {
    file: 'I.L. 29-885D Digitrip RMS 510 Trip Unit.pdf',
    blobPath: 'part_manuals/pdf/breaker/Cutler-Hammer/Digitrip/IL_29-885D.pdf',
    title: 'Instructions for Digitrip RMS 510 Trip Unit for Use with Type SPB Systems Pow-R Breakers',
    manual_number: 'I.L. 29-885D',
    manufacturer: 'Eaton',
    subcategory: 'Trip Units & Accessories',
    page_count: 20,
    search_priority: 8,
    description: `Cutler-Hammer / Eaton instructions (I.L. 29-885D) for the Digitrip RMS 510 electronic trip unit used with Type SPB Systems Pow-R breakers (also Types DS/DSII and Series C R-frame). Covers installation, settings, and operation of the rotary-switch RMS 510 trip unit. ${SPB_TAIL}`,
    keywords: 'Eaton, Cutler-Hammer, Digitrip RMS 510, trip unit, electronic trip, Systems Pow-R Breaker, SPB, DS, DSII, R-frame, I.L. 29-885D, LSI',
  },
  {
    file: 'I.L. 29-886B Instructions for Digitrip RMA 610 Trip Unit.pdf',
    blobPath: 'part_manuals/pdf/breaker/Cutler-Hammer/Digitrip/IL_29-886B.pdf',
    title: 'Instructions for Digitrip RMS 610 Trip Unit for Use with Type SPB Systems Pow-R Breakers',
    manual_number: 'I.L. 29-886B',
    manufacturer: 'Eaton',
    subcategory: 'Trip Units & Accessories',
    page_count: 24,
    search_priority: 8,
    description: `Cutler-Hammer / Eaton instructions (I.L. 29-886B) for the Digitrip RMS 610 (LSIG) electronic trip unit used with Type SPB Systems Pow-R breakers (also Types DS/DSII and Series C R-frame). The RMS 610 adds ground-fault protection and a four-character information display. ${SPB_TAIL}`,
    keywords: 'Eaton, Cutler-Hammer, Digitrip RMS 610, trip unit, electronic trip, LSIG, ground fault, Systems Pow-R Breaker, SPB, DS, DSII, I.L. 29-886B',
  },
  {
    file: 'I.L. 29-888B Instructions for Digitrip RMA 810 Trip Unit.pdf',
    blobPath: 'part_manuals/pdf/breaker/Cutler-Hammer/Digitrip/IL_29-888B.pdf',
    title: 'Instructions for Digitrip RMS 810 Trip Unit for Use with Type SPB Systems Pow-R Breakers',
    manual_number: 'I.L. 29-888B',
    manufacturer: 'Eaton',
    subcategory: 'Trip Units & Accessories',
    page_count: 32,
    search_priority: 8,
    description: `Cutler-Hammer / Eaton instructions (I.L. 29-888B) for the Digitrip RMS 810 electronic trip unit used with Type SPB Systems Pow-R breakers (also Types DS/DSII and Series C R-frame). Provides up to five phase and two ground time-current settings. ${SPB_TAIL}`,
    keywords: 'Eaton, Cutler-Hammer, Digitrip RMS 810, trip unit, electronic trip, LSIG, Systems Pow-R Breaker, SPB, DS, DSII, R-frame, I.L. 29-888B',
  },
  {
    file: 'I.L. 29-889B Instructions for Digitrip RMA 910 Trip Unit.pdf',
    blobPath: 'part_manuals/pdf/breaker/Cutler-Hammer/Digitrip/IL_29-889B.pdf',
    title: 'Instructions for Digitrip RMS 910 Trip Unit for Use with Type SPB Systems Pow-R Breakers',
    manual_number: 'I.L. 29-889B',
    manufacturer: 'Eaton',
    subcategory: 'Trip Units & Accessories',
    page_count: 32,
    search_priority: 8,
    description: `Cutler-Hammer / Eaton instructions (I.L. 29-889B) for the top-tier Digitrip RMS 910 electronic trip unit used with Type SPB Systems Pow-R breakers (also Types DS/DSII and Series C R-frame). The RMS 910 adds communications and metering capability. ${SPB_TAIL}`,
    keywords: 'Eaton, Cutler-Hammer, Digitrip RMS 910, trip unit, electronic trip, communications, metering, Systems Pow-R Breaker, SPB, DS, DSII, I.L. 29-889B',
  },
];

// ── 1 REVISION UPGRADE: Aux Switch A -> C ──
const AUX_UPGRADE = {
  file: 'I.L. 15159C Instructions for Aux Switch.PDF',
  blobPath: 'part_manuals/pdf/switch/Westinghouse/Auxiliary_Switch/IL15159C.pdf',
  matchTitleLike: 'Auxiliary Switches in Type SPB%',
  matchManufacturer: 'Westinghouse',
  new_manual_number: 'I.L. 15159C',
  page_count: 6,
};

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
  console.log('='.repeat(64));
  console.log(`SPB physical-manual import  [${LIVE ? 'LIVE' : 'DRY RUN'}]`);
  console.log('='.repeat(64));

  if (!process.env.TURSO_DATABASE_URL || !BLOB_TOKEN) {
    console.error('Missing TURSO_DATABASE_URL or BLOB_READ_WRITE_TOKEN. Check env path.');
    process.exit(1);
  }

  // Validate source files exist
  for (const e of [...NEW_ENTRIES, AUX_UPGRADE]) {
    const p = path.join(SRC_DIR, e.file);
    if (!existsSync(p)) { console.error(`MISSING SOURCE: ${p}`); process.exit(1); }
  }

  // Pre-flight: collision check on slugs/manual numbers
  console.log('\n--- Pre-flight: existing-row check ---');
  for (const e of NEW_ENTRIES) {
    const slug = slugify(e.title);
    const bySlug = await db.execute({ sql: 'SELECT id, title FROM manuals WHERE slug = ?', args: [slug] });
    const byNum = await db.execute({ sql: 'SELECT id, title FROM manuals WHERE manual_number = ?', args: [e.manual_number] });
    const flags = [];
    if (bySlug.rows.length) flags.push(`slug-exists(id=${bySlug.rows[0].id})`);
    if (byNum.rows.length) flags.push(`manual_number-exists(id=${byNum.rows[0].id})`);
    console.log(`  ${e.manual_number.padEnd(14)} ${e.manufacturer.padEnd(12)} ${e.subcategory.padEnd(24)} ${flags.length ? 'WARN: ' + flags.join(', ') : 'ok-new'}`);
  }
  const aux = await db.execute({ sql: 'SELECT id, slug, title, pdf_url, manual_number FROM manuals WHERE title LIKE ? AND manufacturer = ?', args: [AUX_UPGRADE.matchTitleLike, AUX_UPGRADE.matchManufacturer] });
  console.log(`\n  Aux-switch upgrade target: ${aux.rows.length} row(s) matched`);
  for (const r of aux.rows) console.log(`    id=${r.id} num=${r.manual_number} :: ${r.title}\n      cur pdf_url=${r.pdf_url}`);

  if (!LIVE) {
    console.log('\nDRY RUN complete. Re-run with --live to upload + write.');
    return;
  }

  // ── LIVE: upload blobs + insert/update rows ──
  let inserted = 0, updated = 0, errors = 0;

  for (const e of NEW_ENTRIES) {
    const abs = path.join(SRC_DIR, e.file);
    const slug = slugify(e.title);
    try {
      const url = await uploadBlob(abs, e.blobPath);
      const bytes = statSync(abs).size;
      await db.execute({
        sql: `INSERT INTO manuals (slug, title, manual_number, category, manufacturer, subcategory, description, pdf_url, page_count, file_size_bytes, keywords, search_priority)
              VALUES (?, ?, ?, 'Circuit Breakers', ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [slug, e.title, e.manual_number, e.manufacturer, e.subcategory, e.description, url, e.page_count, bytes, e.keywords, e.search_priority],
      });
      inserted++;
      console.log(`  [INS] ${e.manual_number} -> ${url}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('UNIQUE')) { console.log(`  [SKIP] ${e.manual_number} (slug exists)`); }
      else { console.error(`  [ERR] ${e.manual_number}: ${msg}`); errors++; }
    }
  }

  // Aux switch upgrade
  if (aux.rows.length === 1) {
    try {
      const abs = path.join(SRC_DIR, AUX_UPGRADE.file);
      const url = await uploadBlob(abs, AUX_UPGRADE.blobPath);
      const bytes = statSync(abs).size;
      await db.execute({
        sql: `UPDATE manuals SET pdf_url = ?, manual_number = ?, page_count = ?, file_size_bytes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        args: [url, AUX_UPGRADE.new_manual_number, AUX_UPGRADE.page_count, bytes, aux.rows[0].id],
      });
      updated++;
      console.log(`  [UPD] Aux Switch id=${aux.rows[0].id} -> ${url}`);
    } catch (err) {
      console.error(`  [ERR] Aux upgrade: ${err instanceof Error ? err.message : String(err)}`); errors++;
    }
  } else {
    console.log(`  [SKIP] Aux upgrade: expected 1 matching row, found ${aux.rows.length}`);
  }

  // Rebuild FTS
  try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('  FTS rebuilt.'); }
  catch (err) { console.log(`  FTS rebuild skipped: ${err instanceof Error ? err.message : String(err)}`); }

  const total = await db.execute('SELECT COUNT(*) as c FROM manuals');
  console.log('\n' + '='.repeat(64));
  console.log(`Inserted: ${inserted}  Updated: ${updated}  Errors: ${errors}`);
  console.log(`Total manuals in DB: ${total.rows[0].c}`);
  console.log('='.repeat(64));
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
