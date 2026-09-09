/**
 * Resolve the two Micrologic title-vs-doc mismatches the MasterPact de-hotlink
 * passes carried across untouched.
 *
 *   node scripts/fix-micrologic-mismatches.mjs          # DRY RUN
 *   node scripts/fix-micrologic-mismatches.mjs --live    # write
 *
 * (A) id 10267 "Micrologic 5.0 Electronic Trip Unit (LSI)" serves
 *     48049-137-05EN, the P-series bulletin, which documents 5.0P and 6.0P.
 *     48049-207-06 — already on our blob — is the bulletin that actually
 *     documents 2.0, 3.0 and 5.0 (33 occurrences of 5.0). Repoint it there,
 *     alongside its 2.0 and 3.0 siblings (ids 10266, 10270).
 *
 * (B) id 10269 "Micrologic 7.0 Electronic Trip Unit (LSIG + Measurement)" is a
 *     synthetic page for a trip unit Square D does not sell in this line. The
 *     248-page NT/NW catalog 0613CT0001 never mentions 7.0, nor does the NW
 *     user guide, the field testing guide, or either Micrologic bulletin; 7.0
 *     is the IEC earth-leakage (LSIV) variant, so even the page's own
 *     "LSIG + Measurement" description belongs to 6.0P. 0 downloads,
 *     0 leads. Delete it and 301 to the 6.0 page, which is the same treatment
 *     the 2026-06-02 pass gave the other synthetic MasterPact variant pages.
 *
 * The redirect goes in lib/manual-redirects.ts so the slug keeps resolving.
 */
import { createClient } from '@libsql/client';
import { readFileSync, writeFileSync } from 'fs';
import dotenv from 'dotenv';

const ENV_PATH = 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Web-Tech Dev/EPM & VManuals/Project/Structural/VoytenManuals/.env.local';
dotenv.config({ path: ENV_PATH });

const LIVE = process.argv.includes('--live');
const BACKUP = 'C:/Users/rodol/.claude/projects/C--Users-rodol--local-bin/memory/backups/micrologic-mismatch-backup-2026-09-09.json';
const REDIRECTS_FILE = 'lib/manual-redirects.ts';

const REPOINT_ID = 10267;   // Micrologic 5.0
const SOURCE_ID = 10266;    // Micrologic 2.0 — already on 48049-207-06
const DELETE_ID = 10269;    // Micrologic 7.0
const REDIRECT_TO_ID = 10268; // Micrologic 6.0

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const one = async (id) => (await db.execute({
  sql: `SELECT id, title, slug, manual_number, page_count, file_size_bytes, pdf_url FROM manuals WHERE id = ?`,
  args: [id],
})).rows[0];

async function main() {
  console.log('='.repeat(72));
  console.log(`Micrologic mismatch fix  [${LIVE ? 'LIVE' : 'DRY RUN'}]`);
  console.log('='.repeat(72));
  if (!process.env.TURSO_DATABASE_URL) { console.error('Missing env.'); process.exit(1); }

  const target = await one(REPOINT_ID);
  const source = await one(SOURCE_ID);
  const doomed = await one(DELETE_ID);
  const keeper = await one(REDIRECT_TO_ID);
  for (const [r, n] of [[target, REPOINT_ID], [source, SOURCE_ID], [doomed, DELETE_ID], [keeper, REDIRECT_TO_ID]]) {
    if (!r) { console.error(`id ${n} not found — aborting.`); process.exit(1); }
  }
  if (!String(source.pdf_url).includes('48049-207-06')) {
    console.error('id 10266 is not on 48049-207-06 — aborting rather than guessing the URL.');
    process.exit(1);
  }

  console.log(`\n(A) REPOINT id=${target.id}  ${target.title}`);
  console.log(`      from ${target.manual_number}  ${target.pdf_url}`);
  console.log(`      to   ${source.manual_number}  ${source.pdf_url}`);

  console.log(`\n(B) DELETE  id=${doomed.id}  ${doomed.title}`);
  console.log(`      slug ${doomed.slug}`);
  console.log(`      301 -> ${keeper.slug}  (id ${keeper.id}, ${keeper.title})`);

  // download_events / lead_submissions carry FKs onto manuals(id); reassign
  // before deleting or the delete throws.
  const dl = await db.execute({ sql: `SELECT COUNT(*) c FROM download_events WHERE manual_id = ?`, args: [DELETE_ID] });
  const ld = await db.execute({ sql: `SELECT COUNT(*) c FROM lead_submissions WHERE manual_id = ?`, args: [DELETE_ID] });
  console.log(`      dependents: ${dl.rows[0].c} download_events, ${ld.rows[0].c} lead_submissions -> reassign to ${REDIRECT_TO_ID}`);

  const redirects = readFileSync(REDIRECTS_FILE, 'utf8');
  const alreadyMapped = redirects.includes(`"${doomed.slug}":`);
  console.log(`\n    ${REDIRECTS_FILE}: ${alreadyMapped ? 'already mapped, leaving alone' : `add "${doomed.slug}": "${keeper.slug}"`}`);

  if (!LIVE) {
    console.log('\nDRY RUN complete. Re-run with --live to write.');
    return;
  }

  writeFileSync(BACKUP, JSON.stringify({ repointed: target, deleted: doomed, redirectTo: keeper.slug }, null, 1));
  console.log(`\n[BACKUP] -> ${BACKUP}`);

  await db.execute({
    sql: `UPDATE manuals SET pdf_url = ?, manual_number = ?, page_count = ?, file_size_bytes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    args: [source.pdf_url, source.manual_number, source.page_count, source.file_size_bytes, REPOINT_ID],
  });
  console.log(`[UPD] id=${REPOINT_ID} -> ${source.manual_number}`);

  await db.execute({ sql: `UPDATE download_events SET manual_id = ? WHERE manual_id = ?`, args: [REDIRECT_TO_ID, DELETE_ID] });
  await db.execute({ sql: `UPDATE lead_submissions SET manual_id = ? WHERE manual_id = ?`, args: [REDIRECT_TO_ID, DELETE_ID] });
  await db.execute({ sql: `DELETE FROM manuals WHERE id = ?`, args: [DELETE_ID] });
  console.log(`[DEL] id=${DELETE_ID} ${doomed.slug}`);

  if (!alreadyMapped) {
    // The file is generated and kept in slug order, so rebuild the whole
    // object rather than splicing a line in at the top.
    const open = redirects.indexOf('{', redirects.indexOf('export const MANUAL_REDIRECTS'));
    const close = redirects.lastIndexOf('}');
    const pairs = [...redirects.slice(open + 1, close).matchAll(/"((?:[^"\\]|\\.)*)":\s*"((?:[^"\\]|\\.)*)"/g)]
      .map(m => [m[1], m[2]]);
    pairs.push([doomed.slug, keeper.slug]);
    pairs.sort((a, b) => a[0].localeCompare(b[0]));
    const body = pairs.map(([k, v]) => `  "${k}": "${v}",`).join('\n');
    writeFileSync(REDIRECTS_FILE, `${redirects.slice(0, open + 1)}\n${body}\n${redirects.slice(close)}`);
    console.log(`[REDIRECT] ${doomed.slug} -> ${keeper.slug}  (${pairs.length} entries)`);
  }

  try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('[FTS] rebuilt.'); }
  catch (err) { console.log(`[FTS] rebuild FAILED: ${err instanceof Error ? err.message : String(err)}`); }

  const sq = await db.execute(`SELECT COUNT(*) c FROM manuals WHERE manufacturer = 'Square D'`);
  console.log('\n' + '='.repeat(72));
  console.log(`Done. Square D rows: ${sq.rows[0].c}`);
  console.log('='.repeat(72));
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
