/**
 * Siemens GM-SG / GMSG de-hotlink.
 *
 * Four Siemens medium-voltage pages served their Download-PDF straight off
 * assets.new.siemens.com, all pointing at the SAME file -- the GM-SG
 * switchgear instruction manual:
 *
 *   id 9455  GM-SG Switchgear Installation & Maintenance Manual   (correct doc)
 *   id 9775  GMSG 4.76kV 1200A Medium Voltage Circuit Breaker     (WRONG doc)
 *   id 9776  GMSG 4.76kV 2000A Medium Voltage Circuit Breaker     (WRONG doc)
 *   id 9777  GMSG 15kV 1200A Medium Voltage Circuit Breaker       (WRONG doc)
 *
 * The switchgear manual says of itself that it "does not apply to associated
 * type GMSG vacuum circuit breakers" and refers the reader to the separate
 * breaker manual. So the three breaker pages are a cross-document mismatch,
 * not just a hotlink.
 *
 *   node scripts/dehotlink-siemens-gmsg-pdfs.mjs          # DRY RUN
 *   node scripts/dehotlink-siemens-gmsg-pdfs.mjs --live    # upload + write
 *
 * Sources:
 *   GM-SG I&M   Logan supplied it in ...\SEP\sep10th\. md5-identical to what
 *               Siemens serves at the URL id 9455 hotlinked.
 *   GMSG I&M    Siemens' own current edition (77617000002, Version 8, 2024,
 *               76pp), fetched from Siemens and md5-checked below. Logan also
 *               supplied W1001127.pdf, the 2010 edition (E50001-F710-A231-X-
 *               4A00), but every one of its 68 pages is stamped "Courtesy of
 *               store.ips.us" -- a third-party parts shop -- so it was
 *               deliberately NOT used (Logan's call, 2026-09-10).
 *
 * Also fixes, on these four rows only: "Gm-sg"/"Gmsg" title casing (the
 * sitewide casing pass missed the hyphenated form), and id 9455's description,
 * which called GM-SG "low-voltage switchgear for WL series breakers". GM-SG is
 * metal-clad MEDIUM-voltage switchgear, up to 27 kV, for GMSG vacuum breakers.
 * Slugs are unchanged, so no redirect entries are needed.
 */
import { createClient } from '@libsql/client';
import { put } from '@vercel/blob';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import dotenv from 'dotenv';

const ENV_PATH = 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Web-Tech Dev/EPM & VManuals/Project/Structural/VoytenManuals/.env.local';
dotenv.config({ path: ENV_PATH });

const LIVE = process.argv.includes('--live');
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const SRC = 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/2026 Notes-Meets/SEP/sep10th/';
const BACKUP = 'C:/Users/rodol/.claude/projects/C--Users-rodol--local-bin/memory/backups/siemens-gmsg-hotlink-backup-2026-09-10.json';

const HOTLINK = 'assets.new.siemens.com';
const OLD_URL_MATCH = 'ansi-mv-ais-gm-sg-im-en.pdf';

const DOCS = [
  {
    key: 'GM-SG switchgear I&M',
    file: SRC + 'ansi-mv-ais-gm-sg-im-en.pdf',
    md5: '4f5408f74a52b768ae59edfc41f4c6d4',
    blob: 'manuals/circuitBreaker/Siemens/Switchgear/E50001-F710-A230-V5-4A00 GM-SG Metal-Clad Medium-Voltage Switchgear Instruction Manual.pdf',
    pages: 120, manualNumber: 'E50001-F710-A230-V5-4A00',
    ids: [9455],
  },
  {
    key: 'GMSG breaker I&M',
    fetch: 'https://assets.new.siemens.com/siemens/assets/api/uuid:f93fb33f-069a-4bfb-8693-ae325a00ee57/ansi-mv-ais-gmsg-im-en.pdf',
    md5: '8ad1609ec80b289cf561bc93f717a03f',
    blob: 'manuals/circuitBreaker/Siemens/Breakers/77617000002 GMSG and GMSG-GCB 5-27 kV Vacuum Circuit Breakers Instruction Manual.pdf',
    // No E50001 order number is printed on the 2024 edition; 77617000002 is the
    // number on its cover (the GM-SG I&M's cover carries 77617000001).
    pages: 76, manualNumber: '77617000002',
    ids: [9775, 9776, 9777],
  },
];

const TITLE_FIX = t => t.replace(/\bGm-sg\b/g, 'GM-SG').replace(/\bGmsg\b/g, 'GMSG');
const DESC_9455 = 'Siemens GM-SG non-arc-resistant metal-clad medium-voltage switchgear (up to 27 kV) for type GMSG vacuum circuit breakers. Installation, operation, and maintenance instruction manual. Free PDF download from Voyten Manuals.';

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const md5 = buf => createHash('md5').update(buf).digest('hex');

async function loadDoc(d) {
  if (d.file) {
    if (!existsSync(d.file)) throw new Error(`MISSING SOURCE: ${d.file}`);
    return readFileSync(d.file);
  }
  const res = await fetch(d.fetch);
  if (!res.ok) throw new Error(`fetch ${d.fetch} -> ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  console.log('='.repeat(72));
  console.log(`Siemens GM-SG / GMSG de-hotlink  [${LIVE ? 'LIVE' : 'DRY RUN'}]`);
  console.log('='.repeat(72));
  if (!process.env.TURSO_DATABASE_URL || !BLOB_TOKEN) { console.error('Missing env.'); process.exit(1); }

  const allIds = DOCS.flatMap(d => d.ids);
  const cur = await db.execute({
    sql: `SELECT * FROM manuals WHERE id IN (${allIds.map(() => '?').join(',')}) ORDER BY id`,
    args: allIds,
  });
  if (cur.rows.length !== allIds.length) { console.error(`Expected ${allIds.length} rows, found ${cur.rows.length} - aborting.`); process.exit(1); }
  for (const r of cur.rows) {
    if (!String(r.pdf_url).includes(OLD_URL_MATCH)) { console.error(`id=${r.id} no longer points at ${OLD_URL_MATCH} (${r.pdf_url}) - aborting.`); process.exit(1); }
  }

  for (const d of DOCS) {
    d.buf = await loadDoc(d);
    const got = md5(d.buf);
    if (got !== d.md5) { console.error(`${d.key}: md5 ${got} != expected ${d.md5} - aborting.`); process.exit(1); }
    console.log(`\n--- ${d.key}  (${d.buf.length.toLocaleString()} bytes, ${d.pages}pp, md5 ok) ---`);
    console.log(`    blob ${d.blob}`);
    for (const id of d.ids) {
      const r = cur.rows.find(x => Number(x.id) === id);
      const newTitle = TITLE_FIX(r.title);
      console.log(`      id=${id} [${r.subcategory}] ${r.title}`);
      if (newTitle !== r.title) console.log(`             title -> ${newTitle}`);
      if (id === 9455) console.log(`             desc  -> ${DESC_9455}`);
    }
  }

  if (!LIVE) {
    console.log(`\nWould upload ${DOCS.length} PDFs and update ${allIds.length} rows.`);
    console.log('DRY RUN complete. Re-run with --live to write.');
    return;
  }

  writeFileSync(BACKUP, JSON.stringify(cur.rows, null, 1));
  console.log(`\n[BACKUP] ${cur.rows.length} rows -> ${BACKUP}`);

  for (const d of DOCS) {
    const { url } = await put(d.blob, d.buf, {
      access: 'public', token: BLOB_TOKEN, contentType: 'application/pdf',
      addRandomSuffix: false, allowOverwrite: true,
    });
    console.log(`\n[BLOB] ${d.key} -> ${url}`);
    for (const id of d.ids) {
      const r = cur.rows.find(x => Number(x.id) === id);
      await db.execute({
        sql: `UPDATE manuals SET pdf_url = ?, page_count = ?, file_size_bytes = ?, manual_number = ?, title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        args: [url, d.pages, d.buf.length, d.manualNumber, TITLE_FIX(r.title), id === 9455 ? DESC_9455 : r.description, id],
      });
      console.log(`  [UPD] id=${id} ${TITLE_FIX(r.title)}`);
    }
  }

  try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('\n[FTS] rebuilt.'); }
  catch (err) { console.log(`\n[FTS] rebuild FAILED: ${err instanceof Error ? err.message : String(err)}`); }

  const after = await db.execute({ sql: `SELECT COUNT(*) c FROM manuals WHERE pdf_url LIKE ?`, args: [`%${OLD_URL_MATCH}%`] });
  const left = await db.execute({ sql: `SELECT COUNT(*) c FROM manuals WHERE pdf_url LIKE ?`, args: [`%${HOTLINK}%`] });
  console.log('\n' + '='.repeat(72));
  console.log(`Rows still on ${OLD_URL_MATCH}: ${after.rows[0].c}   ·   ${HOTLINK} hotlinks remaining: ${left.rows[0].c}`);
  console.log('='.repeat(72));
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
