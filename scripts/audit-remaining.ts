import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

async function main() {
  const remaining = await db.execute(
    "SELECT manufacturer, subcategory, pdf_url, COUNT(*) as c FROM manuals WHERE pdf_url NOT LIKE '%electricalpartmanuals.com%' AND pdf_url != 'NONE' GROUP BY manufacturer, pdf_url ORDER BY manufacturer, c DESC"
  );

  console.log('=== Flagged potential manufacturer-PDF mismatches ===');
  for (const r of remaining.rows) {
    const mfr = String(r.manufacturer);
    const url = String(r.pdf_url);
    let domain: string;
    try { domain = new URL(url).hostname; } catch { domain = url.substring(0, 40); }

    let flag = false;
    // These manufacturers should NOT point to Eaton/Siemens/ABB unless it's heritage
    if (mfr === 'Allis-Chalmers' && !url.includes('siemens') && !url.includes('npeinc')) flag = true;
    if (mfr === 'Brown Boveri Electric Inc' && !url.includes('abb')) flag = true;
    if (mfr === 'Federal Pacific') flag = true;
    if (mfr === 'Gould' && !url.includes('abb') && !url.includes('K-Line') && !url.includes('kline')) flag = true;
    if (mfr === 'Square D' && url.includes('eaton.com')) flag = true;
    if (mfr === 'Merlin Gerin') flag = true;

    if (flag) {
      console.log(`  ${r.c}x | ${mfr} | ${r.subcategory} | ${domain}`);
    }
  }

  // Summary
  const summary = await db.execute(
    "SELECT manufacturer, COUNT(*) as c, SUM(CASE WHEN pdf_url = 'NONE' THEN 1 ELSE 0 END) as no_pdf FROM manuals WHERE pdf_url NOT LIKE '%electricalpartmanuals.com%' GROUP BY manufacturer ORDER BY c DESC"
  );
  console.log('\n=== Non-EPM entries by manufacturer ===');
  summary.rows.forEach(r => {
    const noPdf = Number(r.no_pdf);
    const extra = noPdf > 0 ? ` (${noPdf} no PDF)` : '';
    console.log(`  ${r.c}x | ${r.manufacturer}${extra}`);
  });

  // Check Wiring Diagrams, Curves, Switchgear, Sensors subcategories
  const special = await db.execute(
    "SELECT manufacturer, subcategory, COUNT(*) as c FROM manuals WHERE pdf_url != 'NONE' AND pdf_url NOT LIKE '%electricalpartmanuals.com%' AND subcategory IN ('Sensors & Rating Plugs','Wiring Diagrams','Curves','Switchgear') GROUP BY manufacturer, subcategory ORDER BY c DESC"
  );
  console.log('\n=== Specialty subcategories with PDFs ===');
  special.rows.forEach(r => console.log(`  ${r.c}x | ${r.manufacturer} | ${r.subcategory}`));

  const total = await db.execute('SELECT COUNT(*) as c FROM manuals');
  const withPdf = await db.execute("SELECT COUNT(*) as c FROM manuals WHERE pdf_url != 'NONE'");
  const noPdf = await db.execute("SELECT COUNT(*) as c FROM manuals WHERE pdf_url = 'NONE'");
  console.log(`\nTotal: ${total.rows[0].c} | With PDF: ${withPdf.rows[0].c} | No PDF: ${noPdf.rows[0].c}`);
}

main().catch(console.error);
