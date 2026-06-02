/**
 * Consolidate duplicate Westinghouse + Eaton manual rows.
 *
 * Two passes (disjoint):
 *  1. TRIP UNITS — collapse every "Digitrip RMS <model>" row to ONE canonical
 *     (prefers SPB-context + Blob-hosted + newest revision). Explicit ask.
 *  2. SAME-TITLE — any other rows whose normalized title is identical = the same
 *     document re-catalogued (revision/punctuation/OCR variants); keep the best.
 *
 * Deletions are SAFE & reversible:
 *  - every removed row is backed up to JSON (full columns) before deletion
 *  - NO blob is deleted (PDF files preserved)
 *  - each removed slug -> canonical slug is written to lib/manual-redirects.ts (301)
 *
 * Intentional amp/frame VARIANT pages (distinct titles sharing one OEM PDF) are
 * NOT touched — only same-title / same-trip-model repeats.
 *
 * Usage:  node scripts/consolidate-wh-eaton-dupes.mjs [--live]
 */
import { createClient } from '@libsql/client';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local' });

const LIVE = process.argv.includes('--live');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const isBlob = u => (u || '').includes('vercel-storage.com');
const FILLER = /\b(instructions?|instruction|for|the|used|with|in|type|manual|westinghouse|eaton|cutler|hammer|ch|electronic)\b/g;
const normTitle = s => (s || '').toLowerCase().replace(FILLER, ' ').replace(/[^a-z0-9]+/g, '');
// Only true trip-unit DOCS: title must say "Trip Unit", reference exactly ONE RMS model,
// and not be a retrofit-kit or a breaker page (those merely mention a trip unit).
const tripModel = t => {
  const s = String(t || '');
  if (!/trip unit/i.test(s)) return null;
  if (/retrofit/i.test(s)) return null;
  // frame/application-specific leaflets (e.g. K-frame vs L-frame) are DISTINCT docs — don't model-merge
  if (/\bframe\b|series\s*c\b/i.test(s)) return null;
  const uniq = [...new Set([...s.matchAll(/rms\s*0*(\d{2,3})/ig)].map(x => x[1]))];
  return uniq.length === 1 ? uniq[0] : null;
};
// keeper score: SPB-context dominates (trip units), then Blob, then correct spelling, then priority
const score = x => (/SPB|Systems Pow-R/i.test(x.title) ? 100000 : 0)
  + (isBlob(x.pdf_url) ? 1000 : 0)
  + (/sustms|brakers/i.test(x.title) ? -300 : 0)   // penalize known OCR-typo titles
  + (Number(x.search_priority) || 0);
const pickKeeper = v => [...v].sort((a, b) => score(b) - score(a) || a.id - b.id)[0];

const r = await db.execute(`SELECT * FROM manuals WHERE manufacturer IN ('Westinghouse','Eaton') ORDER BY id`);
const rows = r.rows.map(x => ({ ...x, id: Number(x.id) }));

// Re-runnable: if a prior partial run already deleted some rows, merge them back from the
// backup so clusters reform identically and every removed slug still gets a redirect.
const BACKUP_PATH = 'scripts/_wh-eaton-deleted-backup.json';
let priorBackup = [];
if (existsSync(BACKUP_PATH)) {
  priorBackup = JSON.parse(readFileSync(BACKUP_PATH, 'utf8')).map(x => ({ ...x, id: Number(x.id) }));
  const have = new Set(rows.map(x => x.id));
  for (const b of priorBackup) if (!have.has(b.id)) rows.push(b);
}

const handled = new Set();           // ids already assigned to a pass
const plan = [];                     // { delId, delSlug, keepId, keepSlug, reason }
const keepers = new Set();

// ── PASS 1: trip units ──
const byModel = new Map();
for (const x of rows) { const m = tripModel(x.title); if (!m) continue; if (!byModel.has(m)) byModel.set(m, []); byModel.get(m).push(x); }
let tripClusters = 0;
for (const [m, v] of byModel) {
  v.forEach(x => handled.add(x.id));
  if (v.length < 2) continue;
  tripClusters++;
  const keep = pickKeeper(v);
  keepers.add(keep.id);
  if (!LIVE) { console.log(`\n[RMS ${m}]`); for (const x of v) console.log(`   ${x.id===keep.id?'*KEEP':' del '} id=${x.id} ${isBlob(x.pdf_url)?'BLOB':'ext '} ${x.manufacturer} | ${x.title}`); }
  for (const x of v) if (x.id !== keep.id) plan.push({ delId: x.id, delSlug: x.slug, keepId: keep.id, keepSlug: keep.slug, reason: `trip RMS ${m}` });
}

// ── PASS 2: same normalized title (excluding trip-unit rows) ──
const byTitle = new Map();
for (const x of rows) { if (handled.has(x.id)) continue; const k = normTitle(x.title); if (!k) continue; if (!byTitle.has(k)) byTitle.set(k, []); byTitle.get(k).push(x); }
let titleClusters = 0;
for (const [, v] of byTitle) {
  if (v.length < 2) continue;
  titleClusters++;
  const keep = pickKeeper(v);
  keepers.add(keep.id);
  for (const x of v) if (x.id !== keep.id) plan.push({ delId: x.id, delSlug: x.slug, keepId: keep.id, keepSlug: keep.slug, reason: 'same-title' });
}

// sanity: no row both kept and deleted; no redirect target that is itself deleted
const delIds = new Set(plan.map(p => p.delId));
const conflicts = plan.filter(p => delIds.has(p.keepId));
console.log(`trip-model clusters: ${tripClusters}  same-title clusters: ${titleClusters}`);
console.log(`rows to delete: ${plan.length}  conflicts(target-also-deleted): ${conflicts.length}`);
if (conflicts.length) { console.error('ABORT: redirect target is itself deleted', conflicts.slice(0,5)); process.exit(1); }

// preview
for (const p of plan.slice(0, 8)) console.log(`  del ${p.delId} -> keep ${p.keepId} (${p.reason})`);
console.log(`  ... (${plan.length} total)`);

if (!LIVE) {
  // write the redirect map preview so it can be reviewed pre-commit
  console.log('\nDRY RUN — re-run with --live to back up, delete, and write lib/manual-redirects.ts');
  process.exit(0);
}

// ── BACKUP (union of any prior backup + current plan, deduped by id) ──
const backupRows = rows.filter(x => delIds.has(x.id));
const mergedBackup = [...new Map([...priorBackup, ...backupRows].map(x => [Number(x.id), x])).values()];
writeFileSync(BACKUP_PATH, JSON.stringify(mergedBackup, null, 1));
console.log(`\nBacked up ${mergedBackup.length} rows -> ${BACKUP_PATH}`);

// ── DELETE (reassign FK dependents to the canonical keeper first) ──
let deleted = 0, reassigned = 0;
for (const p of plan) {
  const de = await db.execute({ sql: 'UPDATE download_events SET manual_id = ? WHERE manual_id = ?', args: [p.keepId, p.delId] });
  const ls = await db.execute({ sql: 'UPDATE lead_submissions SET manual_id = ? WHERE manual_id = ?', args: [p.keepId, p.delId] });
  reassigned += Number(de.rowsAffected || 0) + Number(ls.rowsAffected || 0);
  await db.execute({ sql: 'DELETE FROM manuals WHERE id = ?', args: [p.delId] });
  deleted++;
}
console.log(`Reassigned ${reassigned} FK refs (download_events/lead_submissions) to keepers`);
console.log(`Deleted ${deleted} rows`);

// ── FTS rebuild ──
try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('FTS rebuilt'); } catch (e) { console.log('FTS skip: ' + e.message); }

// ── redirect map (sorted, deduped) ──
const map = {};
for (const p of plan) map[p.delSlug] = p.keepSlug;
const entries = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
let ts = `// AUTO-GENERATED by scripts/consolidate-wh-eaton-dupes.mjs — do not edit by hand.\n`;
ts += `// Maps removed duplicate manual slugs to their canonical slug (301 permanent redirect).\n`;
ts += `export const MANUAL_REDIRECTS: Record<string, string> = {\n`;
for (const [from, to] of entries) ts += `  ${JSON.stringify(from)}: ${JSON.stringify(to)},\n`;
ts += `};\n`;
writeFileSync('lib/manual-redirects.ts', ts);
console.log(`Wrote lib/manual-redirects.ts with ${entries.length} redirects`);

const c = await db.execute('SELECT COUNT(*) c FROM manuals');
console.log(`Total manuals now: ${c.rows[0].c}`);
