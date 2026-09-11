// Regenerates the pending batch in scripts/slug-entity-batches.json from the
// live DB, so the rename set is derived from data rather than from a guess
// about which tokens look like entity residue.
//
// The authoritative test for "this slug is stale" is simply
// toSlug(title) !== slug on a slug that contains entity residue. Comparing
// against the repaired title is what keeps real product names out: `Amp-Trap`
// fuses and `Multi-Amp` test sets derive the slug they already have, so they
// fall out on their own. An earlier hand-written heuristic tried to spot the
// mangled ampersands by ignoring any `amp` preceded by a digit -- that kept
// `10 amp continuous rating` out correctly but also threw away sixteen real
// ones like `2-amp-3-pole` (`2 & 3 Pole`) and `ft-32-amp-ft-42`.
//
//   node scripts/plan-slug-entity-batches.mjs            # report only
//   node scripts/plan-slug-entity-batches.mjs --write    # update the manifest
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

dotenv.config({ path: 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Web-Tech Dev/EPM & VManuals/Project/Structural/VoytenManuals/.env.local' });

const HERE = dirname(fileURLToPath(import.meta.url));
const MANIFEST_FILE = join(HERE, 'slug-entity-batches.json');
const WRITE = process.argv.includes('--write');

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const toSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const SUSPECT = /(^|-)(amp|quot|nbsp|deg|mdash|ndash|rsquo|lsquo|ldquo|rdquo|hellip|reg|trade|copy|middot|cent)(-|$)|acirc|atilde|iquest|iuml|frac12|quot[a-z0-9]|[a-z0-9]quot/;
// Residue that only a TITLE repair can clear -- renaming against a title that
// is itself still mangled would just need a second 301 later.
const UNRESOLVABLE = /acirc|atilde|iquest|iuml|frac12|quot/;

const { rows } = await db.execute('SELECT id, slug, title, manual_number FROM manuals');
const live = new Set(rows.map((r) => String(r.slug)));

const candidates = [];
const blocked = [];
for (const r of rows) {
  const slug = String(r.slug ?? '');
  const title = String(r.title ?? '');
  if (!SUSPECT.test(slug)) continue;
  const want = toSlug(title);
  if (!want || want === slug) continue;
  if (UNRESOLVABLE.test(want)) {
    blocked.push({ slug, title, reason: 'title-still-corrupt' });
    continue;
  }
  candidates.push({ id: r.id, from: slug, want, title, part: String(r.manual_number ?? '') });
}

// Two documents can share a title (different part numbers, different PDFs), so
// the derived slug is not guaranteed unique. Disambiguate with the part number
// the page already prints, and never let a rename land on an occupied slug.
const wantCount = candidates.reduce((m, c) => m.set(c.want, (m.get(c.want) ?? 0) + 1), new Map());
const renaming = new Set(candidates.map((c) => c.from));
const claimed = new Set();
const renames = [];
for (const c of candidates) {
  let to = c.want;
  const contested = wantCount.get(c.want) > 1 || (live.has(to) && !renaming.has(to));
  if (contested && c.part) to = `${c.want}-${toSlug(c.part)}`;
  if (claimed.has(to) || (live.has(to) && !renaming.has(to))) {
    blocked.push({ slug: c.from, title: c.title, reason: `destination-unavailable (${to})` });
    continue;
  }
  claimed.add(to);
  renames.push({ from: c.from, to, title: c.title });
}

renames.sort((a, b) => a.from.localeCompare(b.from));

console.log(`scanned ${rows.length} manuals`);
console.log(`pending renames: ${renames.length}`);
console.log(`held back:       ${blocked.length}`);
for (const b of blocked) console.log(`  [${b.reason}] ${b.slug}`);

if (!WRITE) {
  console.log('\nreport only — pass --write to update the manifest.');
  process.exit(0);
}

const manifest = JSON.parse(readFileSync(MANIFEST_FILE, 'utf8'));
manifest.batches['2'] = renames;
manifest.skipped = blocked;
manifest.note =
  'Batch 1 applied 2026-09-11. Batch 2 regenerated from the DB: the authoritative test is toSlug(title) !== slug, which supersedes the original token heuristic and picks up 16 ampersands it had wrongly excluded.';
writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nwrote batch 2 (${renames.length} renames) to scripts/slug-entity-batches.json`);
