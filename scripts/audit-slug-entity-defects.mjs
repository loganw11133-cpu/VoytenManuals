// Scans every manual slug for HTML-entity residue left by the original import.
//
// The import wrote entity NAMES into the slug where a character belonged, so
// `&quot;` became `quot`, `&amp;` became `amp`, and UTF-8 read as Latin-1 left
// mojibake runs like `acircreg` (®), `acirccent` (¢), `acircmiddot` (·).
// The title-repair passes fixed what readers see; slugs are immutable once
// published, so the two drifted apart -- a page titled `Ab De-Ion® Circuit
// Breakers` still lives at /manual/ab-de-ionacircreg-circuit-breakers.
//
// A slug is only reported when toSlug(title) actually differs from it, which
// keeps real product names out of the report: `Amp-Trap` fuses and `Multi-Amp`
// test sets both contain a legitimate `amp` token.
//
// Read-only. Run after a fix batch to confirm the remaining count.
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Web-Tech Dev/EPM & VManuals/Project/Structural/VoytenManuals/.env.local' });

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const toSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Entity names and mojibake runs, matched as whole slug tokens or as an
// embedded run (`ionacircreg`, `quotdquot`) that never occurs in real wording.
const SUSPECT = /(^|-)(amp|quot|nbsp|deg|mdash|ndash|rsquo|lsquo|ldquo|rdquo|hellip|reg|trade|copy|middot|cent)(-|$)|acirc|atilde|iquest|iuml|frac12|quot[a-z0-9]|[a-z0-9]quot/;

const { rows } = await db.execute('SELECT id, slug, title FROM manuals ORDER BY slug');

const flagged = [];
for (const r of rows) {
  const slug = String(r.slug ?? '');
  const title = String(r.title ?? '');
  if (!SUSPECT.test(slug)) continue;
  const want = toSlug(title);
  if (!want || want === slug) continue; // slug already matches the repaired title
  flagged.push({ id: r.id, slug, title, want });
}

const classify = (s) =>
  /acirc|atilde|iquest|iuml|frac12/.test(s) ? 'mojibake'
  : /quot/.test(s) ? 'quot'
  : 'amp';

const byClass = flagged.reduce((acc, f) => {
  acc[classify(f.slug)] = (acc[classify(f.slug)] ?? 0) + 1;
  return acc;
}, {});

console.log(`scanned ${rows.length} manuals`);
console.log(`slugs still carrying entity residue: ${flagged.length}`);
for (const [k, v] of Object.entries(byClass).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(9)} ${v}`);
}

// Titles that are themselves still corrupt cannot be fixed by a rename -- the
// derived slug would only have to change again once the title is repaired.
const titleStillBad = flagged.filter((f) => SUSPECT.test(f.want));
if (titleStillBad.length) {
  console.log(`\nrepair the TITLE first (${titleStillBad.length}) -- renaming now would need a second 301:`);
  for (const f of titleStillBad) console.log(`  [${f.id}] ${f.title}\n        ${f.slug}`);
}

if (process.argv.includes('--list')) {
  console.log('\nall flagged:');
  for (const f of flagged) console.log(`  [${f.id}] ${f.slug}\n        -> ${f.want}`);
}
