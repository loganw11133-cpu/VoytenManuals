/**
 * Siemens: set pdf_url = 'NONE' on 12 pages whose Siemens catalog does not
 * document the product the page names. DownloadButton renders 'NONE' as
 * "PDF Not Available" + the phone CTA, the same treatment the four standalone
 * ETU 25B/45B/55B/76B rows got on 2026-05-22.
 *
 *   node scripts/fix-siemens-uncovered-pdfs.mjs          # DRY RUN
 *   node scripts/fix-siemens-uncovered-pdfs.mjs --live    # backup + write
 *
 * Checked with pdftotext against the catalog each page linked (2026-09-10):
 *
 *   ids 9677-9680  "Siemens Sd 1600A/2000A/2500A/3000A Molded Case Circuit
 *                  Breaker" -> s05moldedcasecircuitbreakers.pdf (Jan 2020).
 *                  The catalog has no SD frame: one stray "SD", zero "3000 A".
 *   ids 9959-9966  "Siemens WLF2A3xx ... with ETU 25B/45B/55B/76B" ->
 *                  s06-wl-power-circuit-breakers.pdf (Oct 2019). Zero hits for
 *                  25B, 45B, 55B, 76B or "WLF2"; the catalog documents the
 *                  current ETU 7xx trip units and WLL2F16CONUL-style numbers.
 *
 * Only pdf_url / page_count / file_size_bytes change. Slugs are unchanged, so
 * no redirect entries.
 */
import { createClient } from '@libsql/client';
import { writeFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Web-Tech Dev/EPM & VManuals/Project/Structural/VoytenManuals/.env.local' });

const LIVE = process.argv.includes('--live');
const BACKUP = 'C:/Users/rodol/.claude/projects/C--Users-rodol--local-bin/memory/backups/siemens-uncovered-pdfs-backup-2026-09-10.json';

const TARGETS = [
  { ids: [9677, 9678, 9679, 9680], expect: 's05moldedcasecircuitbreakers.pdf' },
  { ids: [9959, 9960, 9961, 9962, 9963, 9964, 9965, 9966], expect: 's06-wl-power-circuit-breakers.pdf' },
];

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function main() {
  console.log(`Siemens uncovered PDFs -> NONE  [${LIVE ? 'LIVE' : 'DRY RUN'}]\n`);
  const ids = TARGETS.flatMap(t => t.ids);
  const cur = await db.execute({
    sql: `SELECT * FROM manuals WHERE id IN (${ids.map(() => '?').join(',')}) ORDER BY id`,
    args: ids,
  });
  if (cur.rows.length !== ids.length) { console.error(`Expected ${ids.length} rows, found ${cur.rows.length} - aborting.`); process.exit(1); }

  for (const t of TARGETS) {
    for (const id of t.ids) {
      const r = cur.rows.find(x => Number(x.id) === id);
      if (r.manufacturer !== 'Siemens' || !String(r.pdf_url).endsWith(t.expect)) {
        console.error(`id=${id} is no longer [Siemens] -> ${t.expect} (${r.manufacturer}, ${r.pdf_url}) - aborting.`);
        process.exit(1);
      }
      console.log(`  id=${id}  ${r.title}\n           ${t.expect} -> NONE`);
    }
  }

  if (!LIVE) { console.log(`\nWould update ${ids.length} rows. Re-run with --live to write.`); return; }

  writeFileSync(BACKUP, JSON.stringify(cur.rows, null, 1));
  console.log(`\n[BACKUP] ${cur.rows.length} rows -> ${BACKUP}`);

  for (const id of ids) {
    await db.execute({
      sql: `UPDATE manuals SET pdf_url = 'NONE', page_count = NULL, file_size_bytes = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [id],
    });
  }
  console.log(`[UPD] ${ids.length} rows -> NONE`);

  try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('[FTS] rebuilt.'); }
  catch (err) { console.log(`[FTS] rebuild FAILED: ${err instanceof Error ? err.message : String(err)}`); }

  const after = await db.execute({
    sql: `SELECT COUNT(*) c FROM manuals WHERE pdf_url = 'NONE' AND id IN (${ids.map(() => '?').join(',')})`,
    args: ids,
  });
  console.log(`\nVerified: ${after.rows[0].c}/${ids.length} now NONE.`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
