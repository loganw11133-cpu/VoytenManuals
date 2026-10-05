// Fixes the five broken-PDF defects the 2026-10-05 library watermark sweep
// turned up (every pdf_url downloaded and opened):
//
//   1. #10612 "Circuit Breaker Tutorial" -- the blob file is a 210-byte Linux
//      Firefox .desktop launcher, not a PDF. No real document exists. DELETED,
//      no redirect (nothing equivalent to send it to); its single download
//      event is backed up and removed.
//   2. #10393 ".B.94A2990R17" -- a corrupt copy (no xref table) of IB
//      B94A2990R17, which is properly listed as #4610. DELETED + 301 to #4610.
//   3. #9442 EntelliGuard TU (DEH-4567) -- the ABB checkout link 404s. Now
//      served from our blob: DEH-4567C (2014, 116 pp), the official ABB copy
//      from library.e.abb.com.
//   4. #9456 "Siemens RL Switchgear Installation & Maintenance Manual" -- had
//      pdf_url = https://rlbreakers.com (a storefront, not a PDF). No such
//      separate document exists; the RL instruction book is SGIM-3068, already
//      listed. DELETED + 301 to #10579 (SGIM-3068E); downloads reassigned.
//   5. The 22 GE TED/THED rows pointed at ABB's E150 *product web page*
//      (2026-05-22 DEH-41304 decision: no per-frame instruction book exists).
//      Now point at ABB's official BuyLog Section 6, Molded Case Circuit
//      Breakers (rev. 06/2026, 180 pp, E150 TEB/TED/THED on pp. 63-69), on our
//      blob. Our older BuyLog section-3 copy (#10417) covers TED too, but it is
//      ElectricalPartManuals-watermarked on all 104 pages, so it was not used.
//
// DRY-RUN by default; --live to upload, write, and regenerate the redirect map.
import { createClient } from '@libsql/client';
import { put } from '@vercel/blob';
import * as dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';

dotenv.config({ path: '.env.local', quiet: true });
const LIVE = process.argv.includes('--live');
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const SRC = 'C:/Users/rodol/Desktop/memory/sources-2026-10-05';
const BACKUP = 'C:/Users/rodol/Desktop/memory/backups/broken-pdf-links-backup-2026-10-05.json';
const REDIRECTS_FILE = 'lib/manual-redirects.ts';

const UPLOADS = {
  deh4567: { file: 'DEH-4567C.pdf', blob: 'manuals/circuitBreaker/General Electric/Trip Units/DEH-4567C.pdf', pages: 116 },
  buylog6: { file: 'BuyLog-Section-6-Molded-Case-Circuit-Breakers-2026-06.pdf', blob: 'manuals/circuitBreaker/General Electric/Molded Case Breakers/BuyLog-Section-6-Molded-Case-Circuit-Breakers-2026-06.pdf', pages: 180 },
};
const E150_PAGE = 'https://new.abb.com/low-voltage/products/circuit-breakers/nema-circuit-breakers/thermal-magnetic-e150-molded-case-circuit-breakers-series-teb-ted-thed';

const DELETES = [
  { id: 10612, expectUrl: /Tutorial\/Tutorial\/Tutorial\.pdf$/, keepId: null },
  { id: 10393, expectUrl: /\/\.B\.94A2990R17\.pdf$/, keepId: 4610 },
  { id: 9456, expectUrl: /^https:\/\/rlbreakers\.com$/, keepId: 10579 },
];

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const q = async (sql, args = []) => (await db.execute({ sql, args })).rows;

console.log(`=== broken PDF links, 2026-10-05 — ${LIVE ? 'LIVE' : 'DRY RUN'} ===`);
if (!process.env.TURSO_DATABASE_URL || !BLOB_TOKEN) { console.error('Missing env.'); process.exit(1); }

// ── pre-flight ──
for (const u of Object.values(UPLOADS)) {
  const abs = `${SRC}/${u.file}`;
  if (!existsSync(abs) || readFileSync(abs).subarray(0, 5).toString() !== '%PDF-') { console.error(`ABORT: source not a PDF: ${abs}`); process.exit(1); }
  u.abs = abs; u.bytes = statSync(abs).size;
}
const delRows = [];
for (const d of DELETES) {
  const [r] = await q('SELECT * FROM manuals WHERE id=?', [d.id]);
  if (!r) { console.log(`  #${d.id} already gone`); continue; }
  if (!d.expectUrl.test(r.pdf_url)) { console.error(`ABORT: #${d.id} pdf_url changed: ${r.pdf_url}`); process.exit(1); }
  const keep = d.keepId ? (await q('SELECT id, slug FROM manuals WHERE id=?', [d.keepId]))[0] : null;
  if (d.keepId && !keep) { console.error(`ABORT: keeper #${d.keepId} missing`); process.exit(1); }
  const dl = (await q('SELECT count(*) n FROM download_events WHERE manual_id=?', [d.id]))[0].n;
  console.log(`  DELETE #${d.id} /manual/${r.slug}  (${dl} downloads) -> ${keep ? `301 /manual/${keep.slug}` : '404, no equivalent'}`);
  delRows.push({ ...d, row: r, keep });
}
const [deh] = await q('SELECT * FROM manuals WHERE id=9442');
console.log(`  REPOINT #9442 ${deh.manual_number}: ${deh.pdf_url.slice(0, 60)}… -> blob ${UPLOADS.deh4567.blob}`);
const ted = await q('SELECT * FROM manuals WHERE pdf_url=?', [E150_PAGE]);
const notTed = ted.filter(r => !/\b(TED|THED)\b/.test(r.title));
if (notTed.length) { console.error('ABORT: non-TED/THED rows on the E150 page:', notTed.map(r => r.id)); process.exit(1); }
console.log(`  REPOINT ${ted.length} TED/THED rows (${ted.map(r => r.id).join(',')}) -> blob ${UPLOADS.buylog6.blob}`);

if (!LIVE) { console.log('\nDRY RUN — re-run with --live'); process.exit(0); }

// ── backup ──
const tutorialEvents = await q('SELECT * FROM download_events WHERE manual_id=10612');
writeFileSync(BACKUP, JSON.stringify({ deleted: delRows.map(d => d.row), repointed: [deh, ...ted], tutorialEvents }, null, 1));
console.log(`\nBacked up -> ${BACKUP}`);

// ── upload + verify ──
for (const u of Object.values(UPLOADS)) {
  const res = await put(u.blob, readFileSync(u.abs), { access: 'public', token: BLOB_TOKEN, contentType: 'application/pdf', addRandomSuffix: false, allowOverwrite: true });
  const head = await fetch(res.url, { method: 'HEAD' });
  const len = Number(head.headers.get('content-length'));
  if (head.status !== 200 || len !== u.bytes) { console.error(`ABORT: blob verify failed ${res.url} (${head.status}, ${len} != ${u.bytes})`); process.exit(1); }
  u.url = res.url;
  console.log(`[BLOB] ${u.file} -> ${res.url}`);
}

// ── repoint ──
await db.execute({ sql: "UPDATE manuals SET pdf_url=?, manual_number='DEH-4567C', page_count=?, file_size_bytes=?, updated_at=CURRENT_TIMESTAMP WHERE id=9442", args: [UPLOADS.deh4567.url, UPLOADS.deh4567.pages, UPLOADS.deh4567.bytes] });
const r5 = await db.execute({ sql: 'UPDATE manuals SET pdf_url=?, page_count=?, file_size_bytes=?, updated_at=CURRENT_TIMESTAMP WHERE pdf_url=?', args: [UPLOADS.buylog6.url, UPLOADS.buylog6.pages, UPLOADS.buylog6.bytes, E150_PAGE] });
console.log(`Repointed #9442 + ${r5.rowsAffected} TED/THED rows`);

// ── delete (reassign FK refs to keeper first) ──
const redirects = {};
for (const d of delRows) {
  if (d.keep) {
    await db.execute({ sql: 'UPDATE download_events SET manual_id=? WHERE manual_id=?', args: [d.keep.id, d.id] });
    await db.execute({ sql: 'UPDATE lead_submissions SET manual_id=? WHERE manual_id=?', args: [d.keep.id, d.id] });
    redirects[d.row.slug] = d.keep.slug;
  } else {
    await db.execute({ sql: 'DELETE FROM download_events WHERE manual_id=?', args: [d.id] });
    await db.execute({ sql: 'UPDATE lead_submissions SET manual_id=NULL WHERE manual_id=?', args: [d.id] });
  }
  await db.execute({ sql: 'DELETE FROM manuals WHERE id=?', args: [d.id] });
}
console.log(`Deleted ${delRows.length} rows`);

// ── merge redirects ──
const existing = {};
for (const m of readFileSync(REDIRECTS_FILE, 'utf8').matchAll(/"([^"]+)":\s*"([^"]+)"/g)) existing[m[1]] = m[2];
Object.assign(existing, redirects);
const header = readFileSync(REDIRECTS_FILE, 'utf8').split('export const')[0];
let ts = header + 'export const MANUAL_REDIRECTS: Record<string, string> = {\n';
for (const [f, t] of Object.entries(existing).sort((a, b) => a[0].localeCompare(b[0]))) ts += `  ${JSON.stringify(f)}: ${JSON.stringify(t)},\n`;
writeFileSync(REDIRECTS_FILE, ts + '};\n');
console.log(`Redirect map: +${Object.keys(redirects).length}, now ${Object.keys(existing).length} entries`);

await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')");
console.log('FTS rebuilt');
