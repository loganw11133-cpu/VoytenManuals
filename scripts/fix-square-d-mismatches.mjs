/**
 * Fix Square D Masterpact mismatches & category sorting.
 *
 *  REMOVE  59 redundant "Masterpact N{T,W}## ### with Micrologic X — Specifications"
 *          breaker-variant pages (most pointed at a MicroLogic TRIP-UNIT guide, not a
 *          breaker manual). Each 301-redirects to its canonical same-frame breaker page.
 *  KEEP    16 canonical breaker pages (NT06-16, NW08-63), all MTZ1/MTZ2/MTZ3 & PowerPact,
 *          and the 6 standalone MicroLogic trip-unit listings.
 *  REPOINT the MicroLogic 7.0 trip-unit listing off the NW breaker manual onto the
 *          MicroLogic P-series trip-unit guide (48049-137-05).
 *  RETAG   4 accessories  (Air Circuit Breakers -> Trip Units & Accessories)
 *          4 reference docs (Air Circuit Breakers -> Other)
 *
 * Reversible: removed rows backed up to JSON; FK refs reassigned to the canonical keeper;
 * NO external docs touched; redirects merged into lib/manual-redirects.ts.
 *
 * Usage: node scripts/fix-square-d-mismatches.mjs [--live]
 */
import { createClient } from '@libsql/client';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local' });

const LIVE = process.argv.includes('--live');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const REDIRECTS_FILE = 'lib/manual-redirects.ts';
const BACKUP = 'C:\\Users\\rodol\\Desktop\\memory\\backups\\square-d-fix-removed-2026-06-02.json';

const rows = (await db.execute("SELECT * FROM manuals WHERE manufacturer='Square D'")).rows.map(r => ({ ...r, id: Number(r.id) }));
const frameOf = t => (t.match(/Masterpact\s+(N[TW]\d{2})\b/i) || [])[1];

// canonical per-frame breaker page (keeper) -> {slug,id}
const canon = new Map();
for (const r of rows) if (/Air Circuit Breaker — Manual & Specifications/i.test(r.title)) { const f = frameOf(r.title); if (f) canon.set(f.toUpperCase(), { slug: r.slug, id: r.id }); }

// ── REMOVE set ──
const removals = rows.filter(r => /with Micrologic/i.test(r.title) && /Specifications/i.test(r.title) && frameOf(r.title));
const redir = [];
for (const r of removals) { const k = canon.get(frameOf(r.title).toUpperCase()); if (!k) { console.error('ABORT no canonical for', r.title); process.exit(1); } redir.push({ delId: r.id, delSlug: r.slug, keepId: k.id, keepSlug: k.slug }); }

// ── RETAG sets ──
const ACC = /auxiliary switch|drawout cradle|chassis|motor operator|shunt trip|undervoltage/i;
const REF = /coordination|selectivity|renewal parts|cross-reference|cross reference|retrofit|upgrade guide/i;
const retagAcc = rows.filter(r => /Air Circuit Breakers/i.test(r.subcategory) && ACC.test(r.title) && !removals.includes(r));
const retagRef = rows.filter(r => /Air Circuit Breakers/i.test(r.subcategory) && REF.test(r.title) && !removals.includes(r));

// ── REPOINT: MicroLogic 7.0 trip unit -> P-series trip-unit guide (same URL as the 5.0 listing) ──
const pGuide = rows.find(r => /Micrologic 5\.0 Electronic Trip Unit/i.test(r.title))?.pdf_url;
const repoint = rows.find(r => /Micrologic 7\.0 Electronic Trip Unit/i.test(r.title));

console.log(`Square D rows: ${rows.length}`);
console.log(`REMOVE: ${removals.length}  RETAG acc->TU&A: ${retagAcc.length}  RETAG ref->Other: ${retagRef.length}  REPOINT 7.0: ${repoint && pGuide ? 1 : 0}`);
console.log('sample removals -> redirect:');
for (const x of redir.slice(0, 4)) console.log(`   ${x.delSlug}  ->  ${x.keepSlug}`);

if (!LIVE) { console.log('\nDRY RUN — re-run with --live'); process.exit(0); }

// ── BACKUP removed rows ──
const delIds = new Set(redir.map(r => r.delId));
writeFileSync(BACKUP, JSON.stringify(rows.filter(r => delIds.has(r.id)), null, 1));
console.log(`Backed up ${delIds.size} removed rows -> ${BACKUP}`);

// ── DELETE (reassign FK deps to keeper first) ──
let reassigned = 0;
for (const x of redir) {
  const a = await db.execute({ sql: 'UPDATE download_events SET manual_id=? WHERE manual_id=?', args: [x.keepId, x.delId] });
  const b = await db.execute({ sql: 'UPDATE lead_submissions SET manual_id=? WHERE manual_id=?', args: [x.keepId, x.delId] });
  reassigned += Number(a.rowsAffected || 0) + Number(b.rowsAffected || 0);
  await db.execute({ sql: 'DELETE FROM manuals WHERE id=?', args: [x.delId] });
}
console.log(`Deleted ${redir.length} rows, reassigned ${reassigned} FK refs`);

// ── RETAG ──
for (const r of retagAcc) await db.execute({ sql: "UPDATE manuals SET subcategory='Trip Units & Accessories', updated_at=CURRENT_TIMESTAMP WHERE id=?", args: [r.id] });
for (const r of retagRef) await db.execute({ sql: "UPDATE manuals SET subcategory='Other', updated_at=CURRENT_TIMESTAMP WHERE id=?", args: [r.id] });
console.log(`Retagged ${retagAcc.length} accessories -> Trip Units & Accessories, ${retagRef.length} reference -> Other`);

// ── REPOINT 7.0 ──
if (repoint && pGuide) { await db.execute({ sql: 'UPDATE manuals SET pdf_url=?, updated_at=CURRENT_TIMESTAMP WHERE id=?', args: [pGuide, repoint.id] }); console.log('Repointed MicroLogic 7.0 trip unit -> 48049-137-05'); }

// ── MERGE redirects into existing map ──
let existing = {};
if (existsSync(REDIRECTS_FILE)) for (const m of readFileSync(REDIRECTS_FILE, 'utf8').matchAll(/"([^"]+)":\s*"([^"]+)"/g)) existing[m[1]] = m[2];
for (const x of redir) existing[x.delSlug] = x.keepSlug;
const entries = Object.entries(existing).sort((a, b) => a[0].localeCompare(b[0]));
let ts = `// AUTO-GENERATED (consolidate-wh-eaton-dupes.mjs + fix-square-d-mismatches.mjs) — do not edit by hand.\n`;
ts += `// Maps removed duplicate/redundant manual slugs to their canonical slug (301 permanent redirect).\n`;
ts += `export const MANUAL_REDIRECTS: Record<string, string> = {\n`;
for (const [f, t] of entries) ts += `  ${JSON.stringify(f)}: ${JSON.stringify(t)},\n`;
ts += `};\n`;
writeFileSync(REDIRECTS_FILE, ts);
console.log(`Redirect map now has ${entries.length} entries`);

try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('FTS rebuilt'); } catch (e) { console.log('FTS skip: ' + e.message); }

const sd = await db.execute("SELECT subcategory, COUNT(*) c FROM manuals WHERE manufacturer='Square D' GROUP BY subcategory ORDER BY c DESC");
console.log('\nSquare D subcategories now:');
for (const x of sd.rows) console.log(`  ${x.subcategory}: ${x.c}`);
const tot = await db.execute("SELECT COUNT(*) c FROM manuals WHERE manufacturer='Square D'");
console.log(`Square D total: ${tot.rows[0].c}`);
