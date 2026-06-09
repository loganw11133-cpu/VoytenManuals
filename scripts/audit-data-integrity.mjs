/**
 * Sitewide data-integrity sweep (all manufacturers). READ-ONLY.
 * Flags pdf_url corruption + related anomalies and breaks them down by manufacturer.
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
for (const p of ['.env.local', 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local']) dotenv.config({ path: p });
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const total = (await db.execute('SELECT COUNT(*) n FROM manuals')).rows[0].n;
console.log(`Total manuals: ${total}\n`);

const checks = [
  ['pdf_url contains a SPACE (corruption — like the GE TED/THED bug)', "pdf_url LIKE '% %'"],
  ["pdf_url not http & not 'NONE'/empty (non-URL value)", "pdf_url NOT LIKE 'http%' AND pdf_url NOT IN ('NONE','') AND pdf_url IS NOT NULL"],
  ['pdf_url NULL or empty', "pdf_url IS NULL OR pdf_url=''"],
  ['slug contains a space (breaks the page URL)', "slug LIKE '% %'"],
  ['slug has UPPERCASE (slugs should be lowercase)', "slug GLOB '*[A-Z]*'"],
  ["manual_number ends with '.pdf' (stray suffix)", "manual_number LIKE '%.pdf'"],
  ['title === manual_number (raw machine title)', 'title = manual_number'],
];

for (const [label, where] of checks) {
  const rows = (await db.execute(`SELECT id, manufacturer, slug, manual_number, substr(pdf_url,1,60) pu FROM manuals WHERE ${where}`)).rows;
  console.log(`=== ${label}: ${rows.length} ===`);
  if (rows.length) {
    const by = {}; for (const r of rows) by[r.manufacturer] = (by[r.manufacturer] || 0) + 1;
    console.log('   by mfr:', JSON.stringify(by));
    for (const r of rows.slice(0, 6)) console.log(`     id=${r.id} [${r.manufacturer}] ${r.slug}  num=${JSON.stringify(r.manual_number)} pdf="${r.pu}"`);
    if (rows.length > 6) console.log(`     … +${rows.length - 6} more`);
  }
  console.log('');
}
