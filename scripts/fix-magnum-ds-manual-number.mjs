/**
 * Magnum DS breaker rows carried manual_number MN036006EN while every one of
 * them serves IB2C12060 (Eaton's Magnum DS/DSX/DSL installation and operation
 * instructions). The number is now the document actually served, everywhere it
 * appears (manual_number, description, keywords). 2026-11-09.
 *
 *   node scripts/fix-magnum-ds-manual-number.mjs          # DRY RUN
 *   node scripts/fix-magnum-ds-manual-number.mjs --live   # write
 */
import { createClient } from '@libsql/client';
import { writeFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const LIVE = process.argv.includes('--live');
const OLD = 'MN036006EN';
const NEW = 'IB2C12060';
const BACKUP = `C:/Users/rodol/.claude/projects/C--Users-rodol--local-bin/memory/backups/magnum-ds-manual-number-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function main() {
  const r = await db.execute({
    sql: `SELECT * FROM manuals WHERE manual_number = ? OR title LIKE ? OR description LIKE ? OR keywords LIKE ?`,
    args: [OLD, `%${OLD}%`, `%${OLD}%`, `%${OLD}%`],
  });
  const bad = r.rows.filter(x => !String(x.pdf_url).toLowerCase().includes(NEW.toLowerCase()));
  if (bad.length) { console.error(`Rows not on ${NEW}: ${bad.map(x => x.id).join(',')} — aborting.`); process.exit(1); }
  console.log(`[${LIVE ? 'LIVE' : 'DRY RUN'}] ${r.rows.length} rows: ${r.rows.map(x => x.id).join(',')}`);
  if (!LIVE) return;
  writeFileSync(BACKUP, JSON.stringify(r.rows, null, 1));
  console.log(`[BACKUP] ${BACKUP}`);
  const sw = (s) => (s == null ? s : String(s).split(OLD).join(NEW));
  for (const x of r.rows) {
    await db.execute({
      sql: `UPDATE manuals SET manual_number = ?, title = ?, description = ?, keywords = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [sw(x.manual_number), sw(x.title), sw(x.description), sw(x.keywords), x.id],
    });
  }
  console.log(`[UPD] ${r.rows.length} rows.`);
  try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('[FTS] rebuilt.'); }
  catch (err) { console.log(`[FTS] rebuild FAILED: ${err instanceof Error ? err.message : String(err)}`); }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
