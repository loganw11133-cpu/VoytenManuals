/**
 * Sitewide title-casing fix, round 2. Diagnose with audit-title-casing-2.mjs.
 *
 * The 2026-06-15 pass (fix-mfr-title-casing.mjs) only uppercased codes that its
 * audit had surfaced from the "Type X" / "X Frame" slots, so three classes of
 * title-cased part code were never seen:
 *
 *   A. codes fused with digits     Iac51a -> IAC51A, Dpu2000r -> DPU2000R,
 *                                  Grl100 -> GRL100, Cj400 -> CJ400
 *   B. bare codes in code position "Siemens Fd 15A" -> "Siemens FD 15A",
 *                                  "Eaton Series C Hfb" -> HFB, "ABB Sace" -> SACE
 *   C. hyphenated codes            Vcp-w -> VCP-W, Ii-a -> II-A (+ UPS anywhere)
 *
 * A is safe globally: a Title-case word with digits fused into it is never an
 * English word. The few exceptions are OCR garble, listed in A_SKIP.
 *
 * B uses a curated per-manufacturer code list (every token reviewed by hand
 * from the audit, minus real words like Thru/Phase/Hertz/Steam and brand names
 * that are correct as written: Emax, Ekip, Gould). A code is uppercased only
 * in a code context, never in free prose:
 *   - straight after the brand at the start of the title ("Siemens Fd ...")
 *   - after Type/Types, before Frame, or before a number ("Fd 15A")
 *   - chained after an already-known code ("Types Sx Tr 1 Trb 1 ...")
 *
 * Title-only. Slugs are unchanged, so no redirects.
 *
 *   node scripts/fix-title-casing-2.mjs            # DRY RUN, diff to --out file
 *   node scripts/fix-title-casing-2.mjs --live     # backup, write, FTS rebuild
 */
import { createClient } from '@libsql/client';
import { writeFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Web-Tech Dev/EPM & VManuals/Project/Structural/VoytenManuals/.env.local' });

const LIVE = process.argv.includes('--live');
const outAt = process.argv.indexOf('--out');
const OUT = outAt > -1 ? process.argv[outAt + 1] : null;
// Timestamped so a re-run never overwrites the backup of an earlier run.
const BACKUP = `C:/Users/rodol/.claude/projects/C--Users-rodol--local-bin/memory/backups/title-casing-2-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

// ── A: digit-fused codes ────────────────────────────────────────────────────
const A_RE = /\b([A-Z][a-z]{1,3}\d[a-z0-9]*)\b/g;
const A_SKIP = /^(Watt\d+|Data\d+|Trip\d+|Flex\d+|Kv\d+)$/;   // OCR garble / product names

// ── C: hyphenated codes ─────────────────────────────────────────────────────
// (plus UPS, which also appears in prose position: "Mitsubishi Ups Systems 9700 Series")
const C_FIX = [[/\bVcp-w\b/g, 'VCP-W'], [/\bIi-a\b/g, 'II-A'], [/\bGm-sg\b/g, 'GM-SG'], [/\bKdon\b/g, 'K-DON'],
  [/\bUps\b/g, 'UPS']];

// ── B: curated per-manufacturer codes ───────────────────────────────────────
const CODES = {
  Siemens: ['Fd','Fxd','Jd','Jxd','Ld','Lxd','Nd','Pd','Rd','Sd','Bqd','Bq','Wl','Wll','Wlf','Gmsg',
    'Mj','Tp','Samms','Vb','Cps','Sb','Pts','Mcv','Esp','Ij','Pcs','Spm','Sgsa','Digsi'],
  'Siemens-Allis': ['Laf','Sg','Clf','Fcv'],
  Siprotec: ['Mj'],
  Eaton: ['Rf','Nf','Sb','Ak','Akr','Aku','Fps','Hl','Mb','Lx','Dp','Tm','Dbl','Laf','Rs','Lkd','Lg',
    'Dk','Da','Kb','Hfb','Hmcp','Hfd','Hfc','Optim','Bbc'],
  'General Electric': ['Akr','Gek','Akrt','Gef','Tjk','Tjd','Tlb','Tfj','Ted','Oem','St','Vb','Akf','Akru',
    'Akt','Aku','Aks','Ejo','Fkr','Pk','Pst','Smor'],
  ABB: ['Ksp','Rs','Sc','Lc','Tr','Td','Trb','Kd','Bl','Mo','Dt','Cwp','Cwc','Cv','Cvd','Sace','Rea','Ref',
    'Dnp','Lke','Rem','Hu','Mns','Rahl','Rxhl','Rxma','Rxme','Rxmh','Rxms','Rxmt','Rxsf','Rxkm','Reg','Res',
    'Svf','Syn'],
  'Allis-Chalmers': ['Bwx','Ag','Bf','Se'],
  'Basler Electric': ['Dse','Iac','Mvc','Ra','Dgc','Apr','Cbs','Decs','Apm','Prp','Rdp','Be','Esd','Nff','Prs',
    'Pss','Scp'],
  'Cooper Power Systems': ['Cl','Icp','Idp','Itp','Ixp'],
  'Merlin Gerin': ['Sf','Ce','Ck','Cj'],
  'Other Manufacturers': ['Ups','Sr','Cx','Sel','Mtr','Bpu','Atrt','Bpii','Ck','Cms','Dda','Er','Gchk','Ho','Nc',
    'Se','Sif'],
  'Schweitzer Engineering Laboratories': ['Sel'],
  'Square D': ['Bil'],
  Toshiba: ['Grd','Rc','Cv','Grf','Grl'],
  Westinghouse: ['Ab','Sm','Gx','Gy','Sp','Dsii','Mct','Hfb','Pds','Hu','Rw','Dbf','Emf','Ku','Rbd','Svf','Ah',
    'Cmd','Dit','Kg','Ob','Oe','Pc','Po','Ri','Scb','Spcb','Srg','Sy','Wt'],
  ITE: ['Ksp','Vbm','Vbp','Vrm','Vrp'],
  'Brown Boveri': ['Lke'],
};

const ALIASES = ['General Electric', 'GE', 'Square D', 'Cutler-Hammer', 'Cutler Hammer', 'Westinghouse',
  'Siemens-Allis', 'Siemens Allis', 'Siemens', 'Eaton', 'ABB', 'ITE', 'Federal Pacific', 'Allis-Chalmers',
  'Schneider Electric', 'Merlin Gerin', 'Brown Boveri', 'Basler Electric', 'Cooper Power Systems', 'Toshiba'];
const LEAD = `^(?:${ALIASES.map(a => a.replace(/-/g, '\\-')).join('|')})\\s+`;

function compile(codes) {
  const UP = codes.map(c => c.toUpperCase());
  const KNOWN = `(?:${UP.join('|')})`;
  return codes.map((c, i) => {
    const U = UP[i];
    return [
      [new RegExp(`(${LEAD})${c}\\b`), `$1${U}`],
      [new RegExp(`\\b(Types?)\\s+${c}\\b`, 'g'), `$1 ${U}`],
      [new RegExp(`\\b${c}(\\s+Frame\\b)`, 'g'), `${U}$1`],
      [new RegExp(`\\b${c}(\\s+\\d)`, 'g'), `${U}$1`],
      [new RegExp(`(?<=\\b${KNOWN}\\s(?:\\d+\\s)?(?:(?:and|or)\\s)?)${c}\\b`, 'g'), U],
    ];
  });
}
const RULES = Object.fromEntries(Object.entries(CODES).map(([m, c]) => [m, compile(c)]));

function fix(title, mfr) {
  let t = String(title);
  for (const [re, rep] of C_FIX) t = t.replace(re, rep);
  t = t.replace(A_RE, tok => (A_SKIP.test(tok) ? tok : tok.toUpperCase()));
  const rules = RULES[mfr];
  if (rules) {
    let prev;
    do {                                     // fixpoint so code lists propagate left to right
      prev = t;
      for (const rs of rules) for (const [re, rep] of rs) t = t.replace(re, rep);
    } while (t !== prev);
  }
  return t;
}

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const rows = (await db.execute('SELECT id, manufacturer, title FROM manuals ORDER BY manufacturer, title')).rows;
const changes = rows.map(r => ({ id: Number(r.id), mfr: r.manufacturer, old: String(r.title), neu: fix(r.title, r.manufacturer) }))
  .filter(c => c.neu !== c.old);

// A title that now collides with another row's title would be a new duplicate.
const titles = new Map(rows.map(r => [String(r.title), Number(r.id)]));
const collisions = changes.filter(c => titles.has(c.neu) && titles.get(c.neu) !== c.id);

const byMfr = {};
for (const c of changes) byMfr[c.mfr] = (byMfr[c.mfr] || 0) + 1;
console.log(`\n=== ${LIVE ? 'LIVE' : 'DRY RUN'} — title casing round 2 — ${changes.length} of ${rows.length} rows change ===`);
for (const [m, n] of Object.entries(byMfr).sort((a, b) => b[1] - a[1])) console.log(`  ${m.padEnd(38)} ${n}`);
console.log(`  new-duplicate collisions: ${collisions.length}`);
for (const c of collisions) console.log(`    id=${c.id} "${c.neu}" already used by id=${titles.get(c.neu)}`);

if (OUT) {
  writeFileSync(OUT, changes.map(c => `[${c.mfr}] id=${c.id}\n  ${c.old}\n  ${c.neu}`).join('\n'));
  console.log(`\nFull diff -> ${OUT}`);
}

if (!LIVE) { console.log('\nDRY RUN complete. Re-run with --live to write.'); process.exit(0); }
if (collisions.length) { console.error('\nRefusing to write: resolve collisions first.'); process.exit(1); }

writeFileSync(BACKUP, JSON.stringify(rows.filter(r => changes.some(c => c.id === Number(r.id))), null, 1));
console.log(`\n[BACKUP] ${changes.length} rows -> ${BACKUP}`);
for (let i = 0; i < changes.length; i += 100) {
  const batch = changes.slice(i, i + 100).map(c => ({ sql: 'UPDATE manuals SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [c.neu, c.id] }));
  await db.batch(batch, 'write');
}
console.log(`[UPD] ${changes.length} titles`);
try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('[FTS] rebuilt.'); }
catch (err) { console.log(`[FTS] rebuild FAILED: ${err instanceof Error ? err.message : String(err)}`); }
