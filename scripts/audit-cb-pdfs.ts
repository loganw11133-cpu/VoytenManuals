import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

async function main() {
  const r = await db.execute(
    "SELECT id, slug, manufacturer, subcategory, pdf_url FROM manuals WHERE category = 'Circuit Breakers' AND pdf_url != 'NONE' AND pdf_url NOT LIKE '%electricalpartmanuals%' ORDER BY manufacturer, subcategory, slug"
  );
  console.log(`Circuit Breaker entries with manufacturer PDFs: ${r.rows.length}\n`);

  // Group by manufacturer + subcategory
  const groups: Record<string, { slug: string; pdf: string; url: string }[]> = {};
  for (const row of r.rows) {
    const key = `${row.manufacturer} | ${row.subcategory}`;
    if (!groups[key]) groups[key] = [];
    const fn = String(row.pdf_url).split('/').pop()!.substring(0, 55);
    groups[key].push({ slug: String(row.slug), pdf: fn, url: String(row.pdf_url) });
  }

  for (const key of Object.keys(groups).sort()) {
    const items = groups[key];
    // Group by PDF filename
    const pdfs: Record<string, number> = {};
    items.forEach(i => { pdfs[i.pdf] = (pdfs[i.pdf] || 0) + 1; });

    console.log(`--- ${key} (${items.length} entries) ---`);
    Object.entries(pdfs).forEach(([p, c]) => console.log(`  ${c}x ${p}`));
    // Show sample slugs
    items.slice(0, 3).forEach(i => console.log(`    -> ${i.slug}`));
    if (items.length > 3) console.log(`    ... and ${items.length - 3} more`);
    console.log('');
  }
}

main().catch(console.error);
