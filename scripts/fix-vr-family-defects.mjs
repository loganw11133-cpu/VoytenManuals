// Corrects the VR-family rows: the misfiled subcategories and the scrape-era
// damage in the Eaton VR-Series titles, descriptions and keywords.
//
// Every title below was verified against the source PDF -- rendered page 1,
// because all four of these files are scans with only a thin OCR text layer.
// Quoted evidence sits next to each row in `src`.
//
// DRY-RUN by default; --apply to write.
//
// Two defect classes from [voyten-scrape-data-defects] are represented:
//   (2) decimal point dropped from a voltage -- "AM 416" is GE's AM-4.16 kV,
//       which the description generator then re-read as an ampere rating and
//       published as "416A rated". Same for "75A rated", which came from the
//       Westinghouse 75U *frame* code.
//   (3) delimiters lost between mashed numbers -- "DST 2 12002000A" is
//       DST-2, 1200/2000 A.
//
// NOT corrected, deliberately: the misspelling "Vaccum" is in the source
// document's own printed title (IB 6513C80E). The record's title is fixed so
// the page reads correctly, and "vaccum" is KEPT in that row's keywords so the
// document's own spelling still resolves in search.
//
// Slugs are untouched, so no MANUAL_REDIRECTS entry is needed.
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const APPLY = process.argv.includes('--apply');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const MV = 'Medium & High Voltage Breakers';

// --------------------------------------------------------------- gap 4
// Medium-voltage vacuum breakers filed as air breakers or as "Other".
// #4439 argues the case in its own title: "VR Series MEDIUM VOLTAGE Vacuum
// Replacement Breakers", filed under Air Circuit Breakers.
const SUBCATEGORY = {
  4439:  { from: 'Air Circuit Breakers', src: 'title: "VR Series Medium Voltage Vacuum Replacement Breakers"' },
  4610:  { from: 'Air Circuit Breakers', src: 'VR-Series vacuum replacements for GE AM-4.16/7.2/13.8/15 metal-clad' },
  5207:  { from: 'Air Circuit Breakers', src: 'VR-Series vacuum replacements for Westinghouse 50DH-VR / 75U class gear' },
  4104:  { from: 'Other',                src: 'Square D Type VAD-2, Class 6055 metal-clad vacuum breaker' },
  4384:  { from: 'Air Circuit Breakers', src: 'ABB Type VHKX vacuum replacements for Type HK / HKV 5 kV breakers' },
  10616: { from: 'Other',                src: 'Type VCP-W 150 = 15 kV Eaton/Westinghouse vacuum breaker test report' },
};

// --------------------------------------------------------------- gap 5
// Each entry lists exact search/replace pairs per column. A search string that
// is not found aborts the row -- silence here is how bad data gets written.
const TEXT = {
  4610: {
    src: 'cover: "Instructions for VR-Series Replacement Breakers for General Electric Type AM-4.16, AM-7.2, AM-13.8, and AM-15"; figures: GE AM-4.16-VR-250-1200A, GE AM-13.8-VR-500-1200A, GE AM-13.8-VR-1000-3000A',
    title: [['VR Series Replacement', 'VR-Series Replacement'],
            ['Type AM 416 AM 7 2 AM 138 and AM 15', 'Type AM-4.16, AM-7.2, AM-13.8 and AM-15']],
    description: [['416A rated. ', '']],
    keywords: [['Air Circuit Breakers', MV],
               ['am, 416, 138, 15', 'am, am-4.16, am-7.2, am-13.8, am-15, 4.16 kv, 7.2 kv, 13.8 kv, VR-Series, vacuum replacement breaker'],
               ['air circuit breaker, ACB, ', ''],
               ['low voltage power circuit breaker', 'medium voltage vacuum circuit breaker'],
               ['416A, 416 amp, ', '']],
  },
  5207: {
    src: 'cover: "Instructions for VR-Series Replacement Breakers for Westinghouse Type 50DH-VR-50AXU / 50XU / 75U / 75ARU - 600 / 1200A"; figures: "50DH-VR-50AXU / 75U - 1200A (Front Racking)", "50DH-VR-50XU / 75ARU - 1200A (Rear Racking)" -- the DB read 50 as SO throughout',
    title: [['VR Series Replacement', 'VR-Series Replacement'],
            ['Type SODH VR SOAXU I SOXU 75U 75ARU 600 1200A', 'Type 50DH-VR-50AXU / 50XU / 75U / 75ARU 600/1200A']],
    description: [['75A rated. ', '']],
    keywords: [['Air Circuit Breakers', MV],
               ['sodh, soaxu, soxu,', '50dh-vr, 50axu, 50xu,'],
               ['air circuit breaker, ACB, ', ''],
               ['low voltage power circuit breaker', 'medium voltage vacuum circuit breaker'],
               ['75A, 75 amp, ', 'VR-Series, vacuum replacement breaker, ']],
  },
  4415: {
    src: 'cover: "Cutler-Hammer DST-2VR Vacuum Unit Replacement Of Federal Pacific DST-2, 1200/2000A Utilizing The VCP-WR Element"',
    title: [['Cutler Hammer DST 2VR', 'Cutler-Hammer DST-2VR'],
            ['Federal Pacific DST 2 12002000A', 'Federal Pacific DST-2 1200/2000A'],
            ['the VCP WR Element', 'the VCP-WR Element']],
    description: [['Cutler Hammer DST 2VR', 'Cutler-Hammer DST-2VR'],
                  ['Federal Pacific DST  2 12002000a', 'Federal Pacific DST-2 1200/2000A'],
                  ['the VCP WR Element', 'the VCP-WR Element']],
    keywords: [['dst, 2vr,', 'dst-2vr, dst-2,'],
               ['12002000a, utilizing, vcp, wr,', '1200/2000a, utilizing, vcp-wr,'],
               ['low voltage power circuit breaker', 'medium voltage vacuum circuit breaker'],
               ['12002000A, 12002000 amp, ', '1200A, 2000A, ']],
  },
  4161: {
    src: 'cover: "Instructions for Installation, Operation and Maintenance of Type DHP-VR Vaccum Replacement Circuit Breakers for DHP Switchgear"; DHP-VR 5 kV Rating / 7.5 and 15 kV Ratings. The "Vaccum" misspelling is the source document\'s own.',
    title: [['Type DHP VR Vaccum Replacement', 'Type DHP-VR Vacuum Replacement']],
    description: [['TYPE DHP VR Vaccum Replacement', 'Type DHP-VR Vacuum Replacement']],
    // "vaccum" stays -- it is how the source document spells it.
    keywords: [['dhp, vr, vaccum,', 'dhp-vr, dhp, vr, vacuum, vaccum,'],
               ['low voltage power circuit breaker', 'medium voltage vacuum circuit breaker, 5 kv, 7.5 kv, 15 kv']],
  },
  4392: {
    src: 'cover: RPD32-290 "DHP-VR Vacuum Power Circuit Breakers" -- hyphen lost on import',
    title: [['DHP VR Vacuum', 'DHP-VR Vacuum']],
    keywords: [['dhp, vr, vacuum,', 'dhp-vr, dhp, vr, vacuum,'],
               ['low voltage power circuit breaker', 'medium voltage vacuum circuit breaker']],
  },
};

const COLS = ['title', 'description', 'keywords'];
let planned = 0, failed = 0;

console.log(APPLY ? '=== APPLYING ===\n' : '=== DRY RUN (pass --apply to write) ===\n');

// ---- subcategory pass
console.log('--- subcategory ---');
for (const [id, spec] of Object.entries(SUBCATEGORY)) {
  const row = (await db.execute({ sql: 'select id,title,subcategory from manuals where id=?', args: [id] })).rows[0];
  if (!row) { console.log(`  #${id} MISSING`); failed++; continue; }
  if (row.subcategory === MV) { console.log(`  #${id} already ${MV} -- skip`); continue; }
  if (row.subcategory !== spec.from) {
    console.log(`  #${id} ABORT: expected "${spec.from}", found "${row.subcategory}"`); failed++; continue;
  }
  console.log(`  #${id} "${row.title.slice(0, 58)}"`);
  console.log(`        ${spec.from}  ->  ${MV}`);
  console.log(`        why: ${spec.src}`);
  planned++;
  if (APPLY) await db.execute({ sql: 'update manuals set subcategory=?, updated_at=CURRENT_TIMESTAMP where id=?', args: [MV, id] });
}

// ---- text pass
console.log('\n--- titles / descriptions / keywords ---');
for (const [id, spec] of Object.entries(TEXT)) {
  const row = (await db.execute({ sql: 'select id,title,description,keywords from manuals where id=?', args: [id] })).rows[0];
  if (!row) { console.log(`  #${id} MISSING`); failed++; continue; }

  const next = {};
  let broken = null, alreadyDone = true;
  for (const col of COLS) {
    if (!spec[col]) continue;
    let v = row[col] ?? '';
    for (const [find, repl] of spec[col]) {
      if (v.includes(find)) { v = v.split(find).join(repl); alreadyDone = false; }
      else if (!v.includes(repl) || repl === '') { broken = `${col}: search string not found -> "${find}"`; }
    }
    if (v !== row[col]) next[col] = v;
  }
  if (broken) { console.log(`  #${id} ABORT: ${broken}`); failed++; continue; }
  if (alreadyDone || !Object.keys(next).length) { console.log(`  #${id} already corrected -- skip`); continue; }

  console.log(`\n  #${id}  (${spec.src.slice(0, 96)}...)`);
  for (const col of Object.keys(next)) {
    console.log(`    ${col}:`);
    console.log(`      -  ${String(row[col]).slice(0, 150)}`);
    console.log(`      +  ${String(next[col]).slice(0, 150)}`);
  }
  planned++;
  if (APPLY) {
    const sets = Object.keys(next).map(c => `${c}=?`).join(', ');
    await db.execute({ sql: `update manuals set ${sets}, updated_at=CURRENT_TIMESTAMP where id=?`, args: [...Object.values(next), id] });
  }
}

console.log(`\nrows to change: ${planned}   aborted: ${failed}`);

// manuals_fts is external-content with NO triggers, so a title or keyword edit
// does not reach the search index on its own. Same rebuild every other fix
// script in this folder ends with.
if (APPLY && planned) {
  try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('[FTS] rebuilt.'); }
  catch (e) { console.log('[FTS] rebuild FAILED: ' + e.message); }
}
if (failed) process.exitCode = 1;
