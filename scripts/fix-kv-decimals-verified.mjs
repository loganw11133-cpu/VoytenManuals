// Corrects kV decimal loss on the 44 rows that were AMBIGUOUS to the scanner
// (values like 138/345/69/230/500 are real transmission classes, so only the
// source document settles them). Every row below was verified by reading the
// PDF -- text layer where present, rendered page 1 where the file is a scan.
//
// DRY-RUN by default; --apply to write.
//
// Verified CORRECT and therefore untouched: 4369 (69 Kv), 4705 (14.4-69 kV),
// 4867 + 8300 (15 to 345 kv), 4954 (7.2 to 345 kv), 4961 (230/345), 6632 (69),
// 7637 (230-500), 7649 (69-500), 7676 (230), 7818 (115-345), 7914 (69),
// 7953 + 8157 (115 kv and above), 7971 (115/230), 11940 (69).
//
// 7724 could NOT be verified: its PDF is a Bussmann fuse time-current curve
// chart, not the Westinghouse Type V-3 disconnect instructions the record
// claims. Left alone and reported as a PDF/record mismatch.
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Web-Tech Dev/EPM & VManuals/Project/Structural/VoytenManuals/.env.local' });

const APPLY = process.argv.includes('--apply');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

// id -> [[search, replace], ...] applied to the title, plus evidence quoted
// from the source document.
const FIX = {
  3967:  { edits: [['Insulators 75 69KV', 'Insulators 7.5 69KV']],        src: 'CAP-AND-PIN INSULATORS-7.5-69 KV' },
  10296: { edits: [['Insulators 75 69KV', 'Insulators 7.5 69KV']],        src: 'CAP-AND-PIN INSULATORS-7.5-69 KV (dup of 3967)' },
  4293:  { edits: [['345 KV Class', '34.5 KV Class']],                    src: 'body: 34.5 kV' },
  4308:  { edits: [['Capacity 144 to 345KV', 'Capacity 14.4 to 34.5KV']],  src: '14.4 to 34.5 kv' },
  4318:  { edits: [['Up to 138KV', 'Up to 13.8KV']],                      src: '15.5kV / 13.8kV / 17.5kV' },
  4383:  { edits: [['72 and 138KV', '7.2 and 13.8KV']],                   src: '7.2 and 13.8 kV 500 thru 1000 MVA' },
  4528:  { edits: [['FC 5008 138 KV', 'FC 5008 13.8 KV']],                src: 'FC-5008 13.8-kV' },
  4718:  { edits: [['GO 1A 345KV', 'GO 1A 34.5KV']],                      src: 'Type GO-1A-34.5 Kv.-600 Amp.' },
  4786:  { edits: [['FC 500A1 138 KV', 'FC 500A1 13.8 KV']],              src: 'FC-500A 13.8KV' },
  4812:  { edits: [['FC 500B 138 KV', 'FC 500B 13.8 KV']],                src: 'FC-500B 13.8-kV' },
  4911:  { edits: [['MVA 138 KV', 'MVA 13.8 KV']],                        src: 'A 1,000 MVA, 13.8 KV' },
  4975:  { edits: [['Breakers 75 to 345 KV', 'Breakers 7.5 to 345 KV']],  src: '7.5 to 345 kv - indoor and outdoor' },
  5013:  { edits: [['Insulators 75 345 KV', 'Insulators 7.5 34.5 KV']],   src: 'STATION-POST INSULATORS-7.5-34.5 KV' },
  10502: { edits: [['Insulators 75 345 KV', 'Insulators 7.5 34.5 KV']],   src: 'STATION-POST INSULATORS-7.5-34.5 KV (dup of 5013)' },
  5238:  { edits: [['Through 345 KV', 'Through 34.5 KV']],                src: '14.4 kv through 34.5 kv' },
  5241:  { edits: [['Operated 72 to 69 KV', 'Operated 7.2 to 69 KV']],    src: '7.2 kv / 69.0 Kv' },
  5249:  { edits: [['Fuses 75 to 138KV', 'Fuses 7.5 to 138KV']],          src: 'TYPE DBA FUSES 7.5 to 138 kv' },
  5450:  { edits: [['and 138KV', 'and 13.8KV']],                          src: '600 Ampere 4.16kV and 13.8kV' },
  7728:  { edits: [['Switches 72 Thru', 'Switches 7.2 Thru'], ['Nominal 825 Thru', 'Nominal 8.25 Thru']], src: '7.2 THRU 138 KV NOMINAL / 8.25 THRU 145 KV MAX. DESIGN' },
  7737:  { edits: [['345 KV Class', '34.5 KV Class']],                    src: 'Table 1: 34.5 kV Designation' },
  7756:  { edits: [['345 KV High Voltage', '34.5 KV High Voltage']],      src: '34.5 Kv High Voltage Metal-Clad Switchgear' },
  7761:  { edits: [['Throw 48 72 and 138 KV', 'Throw 4.8 7.2 and 13.8 KV']], src: '4.8, 7.2 AND 13.8 KV (ratings table)' },
  7773:  { edits: [['Switches 75 Through 69 KV', 'Switches 7.5 Through 69 KV']], src: '7.5 through 69 KV' },
  7797:  { edits: [['Switch 72 Through 69 KV', 'Switch 7.2 Through 69 KV']], src: 'TYPE V-2 7.2 through 69KV' },
  7800:  { edits: [['Switches 75 Through 69 KV', 'Switches 7.5 Through 69 KV']], src: '7.5 Through 69 Kv' },
  7828:  { edits: [['Operated 72 Thru 345 KV', 'Operated 7.2 Thru 34.5 KV']], src: '7.2 THRU 34.5 KV' },
  7997:  { edits: [['375 10000 KVA', '37.5 10000 KVA'], ['Thru 345 KV', 'Thru 34.5 KV']], src: '37.5-10000 Kva Thru 34.5 Kv' },
};

const ids = Object.keys(FIX).map(Number);
const rows = (await db.execute(
  'SELECT id, title, description FROM manuals WHERE id IN (' + ids.join(',') + ')'
)).rows;

let planned = 0, missed = [];
const writes = [];
for (const r of rows) {
  const id = Number(r.id);
  const spec = FIX[id];
  let t = String(r.title);
  const before = t;
  for (const [a, b] of spec.edits) {
    if (!t.includes(a)) { missed.push(id + ' :: ' + a); continue; }
    t = t.replace(a, b);
  }
  // generated descriptions echo the rating as "NNNkV rated."
  let d = r.description == null ? null : String(r.description);
  if (d) {
    for (const [a, b] of spec.edits) {
      const nA = a.match(/\b(\d{2,5})\b/), nB = b.match(/\b(\d+\.?\d*)\b/);
      if (nA && nB) d = d.replace(new RegExp('\\b' + nA[1] + '(\\s*)kV rated', 'gi'), nB[1] + '$1kV rated');
    }
  }
  if (t !== before || d !== r.description) {
    planned++;
    console.log('id ' + String(id).padEnd(7) + '  [src: ' + spec.src + ']');
    console.log('   - ' + before);
    console.log('   + ' + t);
    if (d !== r.description) console.log('   desc + ' + d.slice(0, 120));
    writes.push({ id, t, d });
  }
}

if (missed.length) { console.log('\n!! pattern not found:'); for (const m of missed) console.log('   ' + m); }
console.log('\n' + (APPLY ? 'APPLYING' : 'DRY RUN') + ' -- ' + planned + ' rows');

if (APPLY) {
  for (const w of writes) {
    await db.execute({
      sql: "UPDATE manuals SET title = ?, description = ?, updated_at = datetime('now') WHERE id = ?",
      args: [w.t, w.d, w.id],
    });
  }
  console.log('wrote ' + writes.length + ' rows');
} else {
  console.log('(no writes -- rerun with --apply)');
}
