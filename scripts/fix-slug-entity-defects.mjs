// Renames manual slugs that carry HTML-entity residue to the slug their
// (already repaired) title derives, and 301s every old URL to the new one.
//
//   node scripts/fix-slug-entity-defects.mjs --batch=1            # dry run
//   node scripts/fix-slug-entity-defects.mjs --batch=1 --apply    # write
//
// The rename set is NOT computed here -- it is checked in at
// scripts/slug-entity-batches.json so the diff is reviewable and the run is
// reproducible. Every row is still re-verified against the live DB before it is
// touched: the slug must still exist, the title must still derive the expected
// slug, and the destination must be free. Any mismatch aborts the whole batch
// rather than half-applying it.
//
// Redirects are the point of the exercise -- a bare rename would drop whatever
// ranking the old URL holds. After the DB writes, lib/manual-redirects.ts is
// regenerated with:
//   * a new `old -> new` entry for every rename in this batch,
//   * existing entries whose TARGET was renamed repointed to the new slug,
//   * existing entries whose KEY just became a live slug removed (that key now
//     serves a page; leaving it would 301 the page away from itself).
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

dotenv.config({ path: 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Web-Tech Dev/EPM & VManuals/Project/Structural/VoytenManuals/.env.local' });

const HERE = dirname(fileURLToPath(import.meta.url));
const REDIRECTS_FILE = join(HERE, '..', 'lib', 'manual-redirects.ts');
const MANIFEST_FILE = join(HERE, 'slug-entity-batches.json');

const APPLY = process.argv.includes('--apply');
const batchArg = process.argv.find((a) => a.startsWith('--batch='));
const BATCH = batchArg ? batchArg.split('=')[1] : null;
if (BATCH !== '1' && BATCH !== '2') {
  console.error('usage: node scripts/fix-slug-entity-defects.mjs --batch=1|2 [--apply]');
  process.exit(1);
}

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const toSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const manifest = JSON.parse(readFileSync(MANIFEST_FILE, 'utf8'));
const renames = manifest.batches[BATCH];
console.log(`batch ${BATCH}: ${renames.length} renames  (${APPLY ? 'APPLY' : 'dry run'})\n`);

// ── Verify every row against the live DB before writing anything ──
const { rows: allRows } = await db.execute('SELECT id, slug, title FROM manuals');
const bySlug = new Map(allRows.map((r) => [String(r.slug), { id: r.id, title: String(r.title ?? '') }]));

const problems = [];
const planned = [];

for (const { from, to, title } of renames) {
  const row = bySlug.get(from);
  if (!row) {
    // Already applied is fine and idempotent; anything else is a real mismatch.
    if (bySlug.has(to)) console.log(`  skip (already renamed): ${from}`);
    else problems.push(`missing slug: ${from}`);
    continue;
  }
  if (row.title !== title) {
    problems.push(`title drifted for ${from}\n      manifest: ${title}\n      db:       ${row.title}`);
    continue;
  }
  // `to` may carry a part-number suffix where two documents share a title, so
  // check the derived stem rather than demanding an exact match.
  const derived = toSlug(row.title);
  if (to !== derived && !to.startsWith(`${derived}-`)) {
    problems.push(`derived slug mismatch for ${from}\n      expected: ${to}\n      derives:  ${derived}`);
    continue;
  }
  const taken = bySlug.get(to);
  if (taken && taken.id !== row.id) {
    problems.push(`destination already taken: ${to} (held by id ${taken.id})`);
    continue;
  }
  planned.push({ id: row.id, from, to });
}

if (problems.length) {
  console.error(`ABORT — ${problems.length} row(s) failed verification:\n`);
  for (const p of problems) console.error(`  • ${p}`);
  process.exit(1);
}

for (const p of planned) console.log(`  ${p.from}\n    -> ${p.to}`);
console.log(`\n${planned.length} row(s) verified.`);

// ── Rebuild the redirect map ──
const src = readFileSync(REDIRECTS_FILE, 'utf8');
const existing = {};
for (const m of src.matchAll(/^ {2}"(.+?)": "(.+?)",$/gm)) existing[m[1]] = m[2];

const renamedTo = new Map(planned.map((p) => [p.from, p.to]));
const nowLive = new Set(planned.map((p) => p.to));

const merged = {};
let repointed = 0;
let dropped = 0;
for (const [key, target] of Object.entries(existing)) {
  if (nowLive.has(key)) { dropped++; continue; }        // key now serves a real page
  const moved = renamedTo.get(target);
  if (moved) repointed++;
  merged[key] = moved ?? target;
}
for (const p of planned) merged[p.from] = p.to;

const body = Object.keys(merged)
  .sort()
  .map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(merged[k])},`)
  .join('\n');

const out = `// AUTO-GENERATED (consolidate-wh-eaton-dupes.mjs + fix-square-d-mismatches.mjs + fix-slug-entity-defects.mjs) — do not edit by hand.
// Maps removed duplicate/redundant manual slugs to their canonical slug (301 permanent redirect).
export const MANUAL_REDIRECTS: Record<string, string> = {
${body}
};
`;

console.log(`redirects: ${Object.keys(existing).length} existing -> ${Object.keys(merged).length} total (+${planned.length} new, ${repointed} repointed, ${dropped} dropped)`);

if (!APPLY) {
  console.log('\ndry run — nothing written. Re-run with --apply.');
  process.exit(0);
}

// Slug writes first: if the redirect file were written first and the DB write
// failed, every old URL would 301 to a slug that does not exist yet.
let done = 0;
for (const p of planned) {
  await db.execute({ sql: 'UPDATE manuals SET slug = ? WHERE id = ?', args: [p.to, p.id] });
  if (++done % 25 === 0) console.log(`  ${done}/${planned.length}`);
}
writeFileSync(REDIRECTS_FILE, out);
console.log(`\napplied ${done} renames; rewrote lib/manual-redirects.ts`);
console.log('next: npm run build, then commit and push.');
