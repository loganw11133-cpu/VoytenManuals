/**
 * Per-manufacturer title-casing fixer (curated-set, safe). Generalizes the ITE
 * pass (scripts/fix-ite-title-casing.mjs) so each manufacturer's verified frame/
 * type code vocabulary can be uppercased without false positives. Diagnose first
 * with scripts/audit-title-casing.mjs, eyeball the tokens, add a CONFIG entry.
 *
 * Codes are uppercased CASE-SENSITIVELY at word boundaries → idempotent, and a
 * real word ("Small", "Group") is never touched because it's not in the set.
 * Title-only (slugs/URLs unchanged → no redirects/FK work).
 *
 * Run: node scripts/fix-mfr-title-casing.mjs Eaton          (dry run)
 *      node scripts/fix-mfr-title-casing.mjs Eaton --live    (backup, then apply)
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'node:fs';
dotenv.config({ path: 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local' });

// Per-mfr verified code vocabulary (Title-case form → uppercased). `pre` holds
// optional spaced-form/initialism fixes applied before code uppercasing.
const CONFIG = {
  Eaton: {
    // Series-G molded-case frames (FD/FDB/GDB/GHB) + power-breaker / retrofit
    // codes verified by inspecting every title-cased Eaton row. Dslii/Dst/Wr/Oem
    // added so adjacent codes (e.g. "DSII and DSLII") end up fully consistent.
    codes: ['Fd','Fdb','Gdb','Ghb','Dhp','Dsii','Dslii','Dsui','Dst','Vcp','Vr','Wr',
      'Am','Sodh','Soaxu','Soxu','Fp','Mol','Oem'],
    pre: [],
  },
  // Westinghouse: { codes: [...352 curated...], pre: [...] }  // next pass
};

const mfr = process.argv[2];
const LIVE = process.argv.includes('--live');
if (!mfr || !CONFIG[mfr]) {
  console.error(`Usage: node scripts/fix-mfr-title-casing.mjs <${Object.keys(CONFIG).join('|')}> [--live]`);
  process.exit(1);
}
const { codes, pre } = CONFIG[mfr];
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

function fix(title) {
  let t = String(title);
  for (const [re, rep] of pre) t = t.replace(re, rep);
  for (const c of codes) t = t.replace(new RegExp(`\\b${c}\\b`, 'g'), c.toUpperCase());
  return t;
}

const rows = (await db.execute({ sql: 'SELECT id, title FROM manuals WHERE manufacturer=? ORDER BY title', args: [mfr] })).rows;
const changes = rows.map(r => ({ id: r.id, old: String(r.title), neu: fix(r.title) })).filter(c => c.neu !== c.old);

console.log(`\n=== ${LIVE ? 'LIVE' : 'DRY RUN'} — ${mfr} title casing — ${changes.length} rows change (of ${rows.length}) ===\n`);
const uniq = new Map();
for (const c of changes) {
  const k = c.old + '||' + c.neu;
  (uniq.get(k) || uniq.set(k, { old: c.old, neu: c.neu, ids: [] }).get(k)).ids.push(c.id);
}
for (const u of [...uniq.values()].sort((a, b) => a.neu.localeCompare(b.neu))) {
  console.log(`  ${u.old}\n    -> ${u.neu}   [ids: ${u.ids.join(', ')}]\n`);
}
console.log(`${uniq.size} distinct transforms across ${changes.length} rows.`);

if (LIVE) {
  const stamp = '2026-06-15';
  writeFileSync(
    `C:\\Users\\rodol\\Desktop\\memory\\backups\\${mfr.toLowerCase()}-title-casing-backup-${stamp}.json`,
    JSON.stringify(rows.filter(r => changes.some(c => c.id === r.id)), null, 2)
  );
  for (const c of changes) await db.execute({ sql: 'UPDATE manuals SET title=? WHERE id=?', args: [c.neu, c.id] });
  console.log(`\nAPPLIED ${changes.length} title updates for ${mfr}. Backup saved.`);
} else {
  console.log(`\nRe-run with --live to apply.`);
}
