/**
 * Make the Siemens GM-SG / GMSG manuals findable by every number printed on
 * or cited for them. Follows dehotlink-siemens-gmsg-pdfs.mjs.
 *
 * Site search (manuals_fts) indexes title, manual_number, manufacturer and
 * keywords -- not description. Each document carries two identifiers but
 * manual_number holds one:
 *
 *   id 9455       GM-SG switchgear I&M. manual_number is the order number
 *                 E50001-F710-A230-V5-4A00; the cover also prints 77617000001,
 *                 which searched to nothing. -> keyword 77617000001
 *   ids 9775-9777 GMSG breaker I&M. manual_number is 77617000002 (its cover
 *                 number). The switchgear manual refers readers to "instruction
 *                 manual E50001-F710-A231" for GMSG breakers, which also
 *                 searched to nothing. -> keyword E50001-F710-A231
 *
 *   node scripts/add-siemens-gmsg-doc-keywords.mjs          # DRY RUN
 *   node scripts/add-siemens-gmsg-doc-keywords.mjs --live    # backup + write
 */
import { createClient } from '@libsql/client';
import { writeFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Web-Tech Dev/EPM & VManuals/Project/Structural/VoytenManuals/.env.local' });

const LIVE = process.argv.includes('--live');
const BACKUP = 'C:/Users/rodol/.claude/projects/C--Users-rodol--local-bin/memory/backups/siemens-gmsg-keywords-backup-2026-09-10.json';

const ADD = { 9455: '77617000001', 9775: 'E50001-F710-A231', 9776: 'E50001-F710-A231', 9777: 'E50001-F710-A231' };
const ids = Object.keys(ADD).map(Number);

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const cur = (await db.execute({ sql: `SELECT id, title, keywords FROM manuals WHERE id IN (${ids.join(',')}) ORDER BY id` })).rows;
if (cur.length !== ids.length) { console.error(`Expected ${ids.length} rows, found ${cur.length} - aborting.`); process.exit(1); }

const plan = cur.map(r => {
  const kw = String(r.keywords ?? '');
  const add = ADD[Number(r.id)];
  const has = kw.split(/\s*,\s*/).includes(add);
  return { id: Number(r.id), title: r.title, add, has, neu: has ? kw : (kw ? `${kw}, ${add}` : add) };
});
console.log(`Siemens GM-SG/GMSG doc-number keywords  [${LIVE ? 'LIVE' : 'DRY RUN'}]`);
for (const p of plan) console.log(`  id=${p.id} ${p.has ? '(already has)' : '+'} ${p.add}   ${p.title}`);

if (!LIVE) { console.log('\nDRY RUN complete. Re-run with --live to write.'); process.exit(0); }

writeFileSync(BACKUP, JSON.stringify(cur, null, 1));
for (const p of plan.filter(p => !p.has)) {
  await db.execute({ sql: 'UPDATE manuals SET keywords = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [p.neu, p.id] });
}
await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')");
console.log(`\n[BACKUP] -> ${BACKUP}\n[UPD] ${plan.filter(p => !p.has).length} rows\n[FTS] rebuilt.`);
