/**
 * Trip-unit / parts pages that served a breaker manual, plus the Magnum DS
 * "insulated case" mislabel (2026-11-09).
 *
 *   node scripts/fix-trip-unit-mismatches-2026-11.mjs          # DRY RUN
 *   node scripts/fix-trip-unit-mismatches-2026-11.mjs --live   # upload + write
 *
 * Found by grouping manuals by pdf_url and flagging PDFs shared by different
 * kinds of product (trip unit vs breaker). Each target below was checked by
 * opening the PDF:
 *
 *  A. Magnum DS Digitrip 520 / 520M / 520MC (8857-8859) served IB2C12060, the
 *     Magnum DS breaker I&O manual. Now IL70C1037H05 (Oct 2009, 40pp, covers
 *     520/520i/520M/520Mi/520MC/520MCi incl. 520MC Maintenance Mode), supplied
 *     by Logan and uploaded to the blob here.
 *  B. Repointed onto documents already in the library:
 *     8860 Magnum DS Digitrip 1150   -> I.L.70C1036H02 (blob, as id 10341)
 *     8862/8863 Magnum DS PXR 20/25  -> MZ013001E PXR guide (as ids 9438/9439)
 *     8870 Magnum DS Renewal Parts   -> TD013013EN renewal parts (as id 4097)
 *     9440/9441 GE MicroVersaTrip PM/Plus: served DEH-41526, the EntelliGuard E
 *               breaker IOM -> GEH-6273, the MVT PM/Plus manual (as id 5016)
 *  C. 'NONE' ("PDF Not Available" + phone CTA):
 *     9447-9449 ABB Ekip Touch/Dip/Hi-Touch served a 6-page Tmax T4-T5 Ekip
 *               E-LSIG neutral-kit sheet; no Ekip manual in the library.
 *     9791 "Magnum SB Renewal Parts Catalog" served the Magnum SB O&M manual
 *          (IB2C12063H03); no SB parts catalog in the library, and eaton.com
 *          can't be fetched from here to confirm TD013013EN covers SB.
 *  D. 4143: title said "Characteristic Curves ... 1150" but the PDF is the
 *     Digitrip 1150/1150i user manual IL70C1036H06 -> title/description/
 *     subcategory now describe that manual.
 *  E. Magnum DS is a UL 1066 low voltage POWER circuit breaker (Magnum SB is
 *     Eaton's insulated-case line). 51 Magnum DS rows said "Insulated Case":
 *     title/description/keywords reworded; subcategory Insulated Case Breakers
 *     -> Air Circuit Breakers (breakers) / Trip Units & Accessories
 *     (accessories) / Other (parts + wiring). Slugs unchanged, so no redirects.
 */
import { createClient } from '@libsql/client';
import { put, head } from '@vercel/blob';
import { readFileSync, statSync, writeFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const LIVE = process.argv.includes('--live');
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const BACKUP = `C:/Users/rodol/.claude/projects/C--Users-rodol--local-bin/memory/backups/trip-unit-mismatch-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

const IL520_SRC = 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/2026 Notes-Meets/NOV/digitrip-trip-520-units-for-use-in-magnum-low-voltage-circuit-breakers-il70c1037h05.pdf';
const IL520_BLOB = 'manuals/circuitBreaker/Cutler-Hammer/Digitrip/IL70C1037H05.pdf';
const IL520 = { manualNumber: 'IL70C1037H05', pages: 40 };

// B: target id -> id whose (correct) document it should share
const REPOINT = { 8860: 10341, 8862: 9438, 8863: 9438, 8870: 4097, 9440: 5016, 9441: 5016 };
const REPOINT_NUM = { 10341: 'I.L.70C1036H02', 9438: 'MZ013001E', 4097: 'TD013013EN', 5016: 'GEH-6273' };
const NONE_IDS = [9447, 9448, 9449, 9791];
const IL520_IDS = [8857, 8858, 8859];

const T4143 = {
  title: 'Eaton Digitrip 1150 and 1150i Trip Units for Magnum and Magnum DS Circuit Breakers — User Manual (IL70C1036H06)',
  description: 'Eaton (Cutler-Hammer) user manual IL70C1036H06 for the Digitrip 1150 and 1150i electronic trip units used in Magnum and Magnum DS low voltage power circuit breakers. Free PDF download from Voyten Manuals.',
  subcategory: 'Trip Units & Accessories',
};

const ACCESSORY_IDS = new Set([8864, 8865, 8866, 8867, 8868, 8869, 10078]);
const OTHER_IDS = new Set([8870, 8871]);
function relabel(r) {
  const fix = (s) => s == null ? s : s
    .replace(/Insulated Case Circuit Breakers?/g, (m) => m.endsWith('s') ? 'Low Voltage Power Circuit Breakers' : 'Low Voltage Power Circuit Breaker')
    .replace(/insulated case circuit breakers?/g, (m) => m.endsWith('s') ? 'low voltage power circuit breakers' : 'low voltage power circuit breaker')
    .replace(/Insulated Case Breakers/g, 'Air Circuit Breakers')
    .replace(/\bflagship ICCB\b/g, 'flagship low voltage power circuit breaker')
    .replace(/\bhigh-amperage ICCB\b/g, 'high-amperage low voltage power circuit breaker')
    .replace(/\bICCB\b/g, 'power circuit breaker');
  let sub = r.subcategory;
  if (sub === 'Insulated Case Breakers') sub = ACCESSORY_IDS.has(Number(r.id)) ? 'Trip Units & Accessories' : OTHER_IDS.has(Number(r.id)) ? 'Other' : 'Air Circuit Breakers';
  return { title: fix(r.title), description: fix(r.description), keywords: fix(r.keywords), subcategory: sub };
}

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function main() {
  console.log(`Trip-unit mismatch fix [${LIVE ? 'LIVE' : 'DRY RUN'}]`);
  if (!process.env.TURSO_DATABASE_URL || !BLOB_TOKEN) { console.error('Missing env.'); process.exit(1); }

  const magnum = await db.execute(`SELECT * FROM manuals WHERE manufacturer='Eaton' AND title LIKE '%Magnum DS%'
    AND (title LIKE '%Insulated Case%' OR description LIKE '%insulated case%' OR subcategory='Insulated Case Breakers' OR description LIKE '%ICCB%')`);
  const ids = [...new Set([...IL520_IDS, ...Object.keys(REPOINT).map(Number), ...Object.values(REPOINT), ...NONE_IDS, 4143, ...magnum.rows.map(r => Number(r.id))])];
  const all = await db.execute(`SELECT * FROM manuals WHERE id IN (${ids.join(',')})`);
  const byId = Object.fromEntries(all.rows.map(r => [Number(r.id), r]));
  for (const id of ids) if (!byId[id]) { console.error(`Missing row ${id}`); process.exit(1); }

  // Each row's final state = its current row with every applicable change merged in.
  const next = {};
  const set = (id, patch) => { next[id] = { ...(next[id] || {}), ...patch }; };
  for (const r of magnum.rows) {
    const p = relabel(r); const cur = byId[Number(r.id)];
    const diff = Object.fromEntries(Object.entries(p).filter(([k, v]) => v !== cur[k]));
    if (Object.keys(diff).length) set(Number(r.id), diff);
  }
  const bytes = statSync(IL520_SRC).size;
  for (const id of IL520_IDS) set(id, { pdf_url: '<IL70C1037H05 blob>', manual_number: IL520.manualNumber, page_count: IL520.pages, file_size_bytes: bytes });
  for (const [id, src] of Object.entries(REPOINT)) {
    const s = byId[src];
    set(Number(id), { pdf_url: s.pdf_url, manual_number: REPOINT_NUM[src], page_count: s.page_count, file_size_bytes: s.file_size_bytes });
  }
  for (const id of NONE_IDS) set(id, { pdf_url: 'NONE', page_count: null, file_size_bytes: null });
  set(4143, T4143);

  for (const [id, p] of Object.entries(next)) {
    console.log(`\nid=${id}  ${byId[id].title}`);
    for (const [k, v] of Object.entries(p)) console.log(`   ${k}: ${String(byId[id][k]).slice(0, 90)}\n      -> ${String(v).slice(0, 90)}`);
  }
  console.log(`\n${Object.keys(next).length} rows to update; 1 PDF to upload (${bytes.toLocaleString()} bytes).`);
  if (!LIVE) { console.log('DRY RUN complete. Re-run with --live to write.'); return; }

  writeFileSync(BACKUP, JSON.stringify(Object.keys(next).map(id => byId[id]), null, 1));
  console.log(`[BACKUP] ${Object.keys(next).length} rows -> ${BACKUP}`);

  let existing = null;
  try { existing = await head(IL520_BLOB, { token: BLOB_TOKEN }); } catch { /* not there yet */ }
  if (existing) { console.error(`Blob already exists at ${existing.url} — aborting, not overwriting.`); process.exit(1); }
  const blob = await put(IL520_BLOB, readFileSync(IL520_SRC), { access: 'public', token: BLOB_TOKEN, contentType: 'application/pdf', addRandomSuffix: false });
  console.log(`[BLOB] ${blob.url}`);

  for (const [id, p] of Object.entries(next)) {
    if (p.pdf_url === '<IL70C1037H05 blob>') p.pdf_url = blob.url;
    const cols = Object.keys(p);
    await db.execute({
      sql: `UPDATE manuals SET ${cols.map(c => `${c} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [...cols.map(c => p[c]), Number(id)],
    });
  }
  console.log(`[UPD] ${Object.keys(next).length} rows.`);
  try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('[FTS] rebuilt.'); }
  catch (err) { console.log(`[FTS] rebuild FAILED: ${err instanceof Error ? err.message : String(err)}`); }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
