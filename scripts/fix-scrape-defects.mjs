// Corrects scrape-era data defects that can be resolved without the PDF.
// DRY-RUN by default; pass --apply to write. Slugs are never touched (live URLs).
//
//   A. "&amp;" decoded to the word AMP. NOT regex-driven: "AMP" is also the
//      ampere unit ("1200 AMP Ruptair"), so all 79 candidate rows were read and
//      classified by hand. Only the ids in AMPERSAND_IDS below are ampersands.
//      Left alone: AMP-TRAP (Gould/Ferraz brand), Multi-Amp (AVO), and every
//      row where AMP means amperes.
//   B. '"' decoded to "quot"  ->  Quotfquot => "F"
//   C. UTF-8 read as latin-1  ->  acircreg => (R), acircmiddot => ·
//   D. Dropped decimal before kV, only where the integer is NOT a real
//      ANSI/IEEE class AND exactly one decimal reading is. "kV BIL" is skipped
//      (BIL legitimately runs 110-900 kV). Values plausible either way
//      (138, 345, 69, 230, 500 ...) are left for PDF verification.
//   E. Mashed numeric runs in generated descriptions ("47682515kV rated") --
//      the bogus clause is removed rather than guessed at.
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Web-Tech Dev/EPM & VManuals/Project/Structural/VoytenManuals/.env.local' });

const APPLY = process.argv.includes('--apply');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

// Hand-verified: AMP here is an ampersand, not amperes.
const AMPERSAND_IDS = new Set([
  4000, 4080, 4094, 4177, 4254, 4303, 4364, 4420, 4480, 4649, 4680, 4816,
  4849, 4859, 4863, 4875, 4918, 4926, 5035, 5037, 5040, 5089, 5158, 5164,
  5189, 5321, 5352, 5358, 5361, 5364, 5602, 6197, 6265, 6270, 6279, 6560,
  6637, 7287, 7347, 7467, 7659, 7842, 7864, 8249, 8401, 8693, 8795,
  10470, 10477, 10513, 10607, 12019, 12674,
]);
// Company names conventionally written without spaces around the ampersand.
const TIGHT_IDS = new Map([[5321, 'S&C'], [5358, 'S&C'], [5361, 'S&C'], [6270, 'B&B']]);

const REAL = new Set([
  0.24, 0.48, 0.6, 0.635,
  2.4, 4.16, 4.8, 6.9, 7.2, 8.32, 11.5, 12, 12.47, 13.2, 13.8, 14.4,
  23, 24.94, 25, 26.4, 27.6, 34.5, 46, 69,
  4.76, 5, 8.25, 15, 15.5, 25.8, 27, 38, 48.3, 72.5,
  115, 121, 138, 145, 161, 169, 230, 242, 287, 345, 362, 500, 550, 765, 800,
]);
function decimalCandidates(d) {
  const out = [];
  for (let i = 1; i < d.length; i++) {
    const c = parseFloat(d.slice(0, i) + '.' + d.slice(i));
    if (REAL.has(c)) out.push(c);
  }
  return out;
}

function fixAmp(s, id) {
  if (!AMPERSAND_IDS.has(id)) return s;
  let out = s;
  if (TIGHT_IDS.has(id)) {
    out = out.replace(/\bS\s+AMP\s+C\b/g, 'S&C').replace(/\bB\s+AMP\s+B\b/g, 'B&B');
  }
  return out.replace(/\s+AMP\s+/g, ' & ');
}

function fixEntities(s) {
  let out = s;
  out = out.replace(/\bSampc\b/gi, 'S&C');
  out = out.replace(/\bQuot([a-z])quot\b/gi, (_, c) => '"' + c.toUpperCase() + '"');
  out = out.replace(/([A-Za-z])quot([a-z])quot\b/gi, (_, p, c) => p + ' "' + c.toUpperCase() + '"');
  out = out.replace(/acircreg/gi, '\u00AE');
  out = out.replace(/acircmiddot/gi, '\u00B7');
  return out;
}

function fixVoltages(s) {
  return s.replace(/\b(\d{2,5})(\s*)(k\.?\s*v)\b(?!a)(\s*bil)?/gi, (m, digits, sp, unit, bil) => {
    if (bil) return m;
    if (REAL.has(parseInt(digits, 10))) return m;
    const c = decimalCandidates(digits);
    if (c.length !== 1) return m;
    return String(c[0]) + sp + unit;
  });
}

// "3000A, 47682515kV rated." -> "3000A rated."   |   bare clause -> removed.
const stripBogusRated = s => s
  .replace(/(\d+A),\s*\d{6,}\s*kV rated\./gi, '$1 rated.')
  .replace(/\s*\b\d{6,}\s*kV rated\.\s*/gi, ' ');

const rows = (await db.execute('SELECT id, title, description, keywords, manufacturer FROM manuals')).rows;

const changes = [];
for (const r of rows) {
  const id = Number(r.id);
  const next = {};
  for (const f of ['title', 'description', 'keywords']) {
    const orig = r[f] == null ? null : String(r[f]);
    if (orig == null) continue;
    let v = fixAmp(orig, id);
    v = fixEntities(v);
    if (f !== 'keywords') { v = stripBogusRated(v); v = fixVoltages(v); }
    else if (AMPERSAND_IDS.has(id)) {
      v = v.split(',').map(x => x.trim()).filter(x => x.toLowerCase() !== 'amp').join(', ');
    }
    if (v !== orig) next[f] = { from: orig, to: v };
  }
  if (Object.keys(next).length) changes.push({ id, mfr: r.manufacturer, next });
}

console.log((APPLY ? 'APPLYING' : 'DRY RUN') + ' -- ' + changes.length + ' rows\n');
for (const c of changes) {
  console.log('id ' + String(c.id).padEnd(7) + '[' + c.mfr + ']');
  for (const [f, d] of Object.entries(c.next)) {
    console.log('  ' + f + '\n    - ' + d.from.slice(0, 170) + '\n    + ' + d.to.slice(0, 170));
  }
}

if (APPLY) {
  let n = 0;
  for (const c of changes) {
    const sets = [], args = [];
    for (const [f, d] of Object.entries(c.next)) { sets.push(f + ' = ?'); args.push(d.to); }
    args.push(c.id);
    await db.execute({ sql: 'UPDATE manuals SET ' + sets.join(', ') + ", updated_at = datetime('now') WHERE id = ?", args });
    n++;
  }
  console.log('\nwrote ' + n + ' rows');
} else {
  console.log('\n(no writes -- rerun with --apply)');
}
