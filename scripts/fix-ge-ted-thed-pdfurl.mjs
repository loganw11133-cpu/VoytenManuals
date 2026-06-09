/**
 * Fix corrupted GE TED/THED pdf_url, 2026-06-09.
 * 22 GE TED/THED molded-case records had pdf_url overwritten with a space-joined
 * list of manual IDs ("9549 9550 … 10139") instead of a URL — so the Download
 * button rendered <a href="9549 9550 …"> and clicking it 404'd ("MANUAL NOT FOUND").
 * A URL never contains a space, so we target pdf_url LIKE '% %'. Per the 2026-05-22
 * DEH-41304 decision, TED/THED point to the ABB E150 successor page. All 22 are
 * TED/THED, so restore that URL.
 *
 * Run: node scripts/fix-ge-ted-thed-pdfurl.mjs          (dry run)
 *      node scripts/fix-ge-ted-thed-pdfurl.mjs --live   (backup, then apply)
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'node:fs';

for (const p of ['.env.local', 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local']) dotenv.config({ path: p });
const LIVE = process.argv.includes('--live');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const E150 = 'https://new.abb.com/low-voltage/products/circuit-breakers/nema-circuit-breakers/thermal-magnetic-e150-molded-case-circuit-breakers-series-teb-ted-thed';

const rows = (await db.execute("SELECT id, slug, title, pdf_url FROM manuals WHERE manufacturer='General Electric' AND pdf_url LIKE '% %'")).rows;
console.log(`\n=== GE corrupted pdf_url fix — ${LIVE ? 'LIVE' : 'DRY RUN'} — ${rows.length} records ===\n`);

// Safety: confirm every target is TED/THED before repointing them all to E150.
const nonTed = rows.filter(r => !/^GE T?HED |^GE TED |ted|thed/i.test(r.slug) && !/ted|thed/i.test(r.title));
if (nonTed.length) { console.log('ABORT — non-TED/THED rows present:', nonTed.map(r => r.id)); process.exit(1); }

for (const r of rows) console.log(`  id=${r.id} ${r.slug}  (pdf_url was a ${String(r.pdf_url).length}-char ID list)`);

if (LIVE) {
  writeFileSync('C:\\Users\\rodol\\Desktop\\memory\\backups\\ge-ted-thed-pdfurl-backup-2026-06-09.json', JSON.stringify(rows, null, 2));
  const ids = rows.map(r => r.id);
  const res = await db.execute({ sql: `UPDATE manuals SET pdf_url=? WHERE id IN (${ids.join(',')})`, args: [E150] });
  console.log(`\nAPPLIED: ${res.rowsAffected} pdf_url restored to ABB E150 page. Backup saved.`);
} else {
  console.log(`\nAll ${rows.length} are TED/THED -> would set pdf_url to:\n  ${E150}\nRe-run with --live to apply.`);
}
