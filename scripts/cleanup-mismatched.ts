import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

async function deleteByCondition(label: string, where: string) {
  // Delete FK-dependent rows first
  const ids = await db.execute(`SELECT id FROM manuals WHERE ${where}`);
  if (ids.rows.length === 0) { console.log(`${label}: 0 (none matched)`); return 0; }

  const idList = ids.rows.map(r => r.id).join(',');
  await db.execute(`DELETE FROM download_events WHERE manual_id IN (${idList})`);
  await db.execute(`DELETE FROM lead_submissions WHERE manual_id IN (${idList})`);
  const r = await db.execute(`DELETE FROM manuals WHERE ${where}`);
  console.log(`${label}: ${r.rowsAffected} deleted`);
  return r.rowsAffected || 0;
}

async function setNoPdf(label: string, where: string) {
  const r = await db.execute(`UPDATE manuals SET pdf_url = 'NONE' WHERE ${where}`);
  console.log(`${label}: ${r.rowsAffected} set to NONE`);
  return r.rowsAffected || 0;
}

async function main() {
  const before = await db.execute('SELECT COUNT(*) as c FROM manuals');
  console.log(`Starting total: ${before.rows[0].c}\n`);

  let deleted = 0;
  let cleared = 0;

  // ============================================================
  // PHASE 1: DELETE entries that are pure content pages (no real manual)
  // These are SEO pages we created that don't correspond to any actual document
  // ============================================================
  console.log('=== PHASE 1: Delete content-only entries ===');

  deleted += await deleteByCondition(
    'EOL Replacement Guides',
    "subcategory = 'EOL Replacement Guides'"
  );
  deleted += await deleteByCondition(
    'Buying Guides',
    "subcategory = 'Buying Guides'"
  );
  deleted += await deleteByCondition(
    'Cross-Reference',
    "subcategory = 'Cross-Reference'"
  );
  deleted += await deleteByCondition(
    'Technical Guides',
    "subcategory = 'Technical Guides'"
  );
  deleted += await deleteByCondition(
    'Retrofit Kits',
    "subcategory = 'Retrofit Kits'"
  );

  // ============================================================
  // PHASE 2: DELETE completely mismatched manufacturer entries
  // Non-Eaton/CH/WH manufacturers pointing to Eaton PDFs
  // Non-ABB/GE manufacturers pointing to ABB PDFs, etc.
  // ============================================================
  console.log('\n=== PHASE 2: Delete manufacturer-mismatched entries ===');

  // Square D entries pointing to Eaton ICCB guide — completely wrong manufacturer
  deleted += await deleteByCondition(
    'Square D -> Eaton guide',
    "manufacturer = 'Square D' AND pdf_url LIKE '%eaton.com%'"
  );

  // Merlin Gerin entries pointing to Eaton guide
  deleted += await deleteByCondition(
    'Merlin Gerin -> Eaton guide',
    "manufacturer = 'Merlin Gerin' AND pdf_url LIKE '%eaton.com%'"
  );

  // Federal Pacific entries pointing to Eaton guide
  deleted += await deleteByCondition(
    'Federal Pacific -> Eaton guide',
    "manufacturer = 'Federal Pacific' AND pdf_url LIKE '%eaton.com%'"
  );

  // ============================================================
  // PHASE 3: Set pdf_url=NONE for entries we want to KEEP for SEO
  // but where the PDF doesn't genuinely match the product
  // ============================================================
  console.log('\n=== PHASE 3: Remove mismatched PDFs (keep entries for SEO) ===');

  // Eaton Molded Case entries using generic ICCB consulting guide — not a molded case manual
  cleared += await setNoPdf(
    'Eaton Molded Case -> generic guide',
    "manufacturer = 'Eaton' AND subcategory = 'Molded Case' AND pdf_url LIKE '%tb01900003e%'"
  );

  // Eaton Insulated Case entries using generic ICCB consulting guide
  // (these should have specific Series C, SPB, or NRX PDFs)
  cleared += await setNoPdf(
    'Eaton Insulated Case -> generic guide',
    "manufacturer = 'Eaton' AND subcategory = 'Insulated Case' AND pdf_url LIKE '%tb01900003e%'"
  );

  // Cutler-Hammer Insulated Case -> generic Eaton guide (should be SPB manual)
  cleared += await setNoPdf(
    'Cutler-Hammer ICCB -> generic guide',
    "manufacturer = 'Cutler-Hammer' AND subcategory = 'Insulated Case' AND pdf_url LIKE '%tb01900003e%'"
  );

  // Westinghouse Molded Case -> generic Eaton guide
  cleared += await setNoPdf(
    'Westinghouse Molded Case -> generic guide',
    "manufacturer = 'Westinghouse' AND subcategory = 'Molded Case' AND pdf_url LIKE '%tb01900003e%'"
  );

  // Westinghouse Insulated Case -> generic Eaton guide
  cleared += await setNoPdf(
    'Westinghouse Insulated Case -> generic guide',
    "manufacturer = 'Westinghouse' AND subcategory = 'Insulated Case' AND pdf_url LIKE '%tb01900003e%'"
  );

  // ============================================================
  // SUMMARY
  // ============================================================
  const after = await db.execute('SELECT COUNT(*) as c FROM manuals');
  const noPdf = await db.execute("SELECT COUNT(*) as c FROM manuals WHERE pdf_url = 'NONE'");
  const withPdf = await db.execute("SELECT COUNT(*) as c FROM manuals WHERE pdf_url != 'NONE'");

  console.log(`\n=== SUMMARY ===`);
  console.log(`Entries deleted: ${deleted}`);
  console.log(`PDFs cleared (kept for SEO): ${cleared}`);
  console.log(`Final total: ${after.rows[0].c}`);
  console.log(`  With valid PDF: ${withPdf.rows[0].c}`);
  console.log(`  No PDF (CTA only): ${noPdf.rows[0].c}`);
}

main().catch(console.error);
