// Makes the Square D Type VR / VAD-3 catalog numbers resolve in site search.
//
// Before this, none of the strings a customer actually reads off the nameplate
// -- VR-15050-12, VR-27040-12, VAD-3-05025-12 -- existed anywhere in the 8,367
// row library, so the #6 most-downloaded manual could not be found by its own
// product's catalog number.
//
// Keywords are scoped to WHAT EACH DOCUMENT COVERS, not to every number that
// exists. 6055-31 is the 4.76/8.25/15 kV 1200 and 2000 A instruction bulletin,
// so it gets the -12 and -20 numbers and not the 3000/4000 A or 27 kV ones.
// Verified transcription lives in the project folder as SQD-VR/vr-data.json.
//
// DRY-RUN by default; --apply to write.
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const APPLY = process.argv.includes('--apply');
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const types5_15 = ['05025', '05035', '08050', '15050', '15075', '15100'];
const cat = (t, a) => `VR-${t}-${a}`;
// 6055-31 covers 1200 and 2000 A only (its own subtitle).
const IB_6055_31 = types5_15.flatMap(t => ['12', '20'].map(a => cat(t, a)));
// The 1994 brochure's chart runs all three currents; the 3000 A rows are
// starred "availability to be announced", so they are listed but not claimed.
const BROCHURE = types5_15.flatMap(t => ['12', '20', '30'].map(a => cat(t, a)));
const VAD3 = ['05025-12', '05025-20', '05035-12', '05035-20', '08050-12', '08050-20',
              '15050-12', '15050-20', '15075-12', '15075-20', '15100-12', '15100-20']
              .map(s => `VAD-3-${s}`);

const COMMON = ['Type VR', 'Square D Type VR', 'Class 6055', 'Masterclad', 'medium voltage vacuum circuit breaker'];

const PLAN = {
  4334: { add: [...COMMON, ...IB_6055_31, '4.76 kV', '8.25 kV', '15 kV', '1200A', '2000A', '6055-31'],
          why: 'Type VR IB 6055-31 - the 77-download page; 1200/2000 A numbers only' },
  4756: { add: [...COMMON, ...BROCHURE, 'Breaker Identification', 'VR-05025-12', '6055BR9402'],
          why: 'Masterclad brochure 6055BR9402 - carries the Breaker Identification diagram and the 18-row chart' },
  7668: { add: [...COMMON, 'Series 5', '6055-30', 'metal clad switchgear'],
          why: 'Masterclad Series 5 switchgear bulletin - names Type VR but publishes no catalog chart' },
  4529: { add: ['Type VAD-3', 'VAD-3', 'Class 6055', ...VAD3, 'medium voltage vacuum circuit breaker'],
          why: 'VAD-3 instruction bulletin 6055-11' },
  4631: { add: ['Type VAD-3', 'VAD-3', 'E-52100', ...VAD3, 'V3D31', 'V3D32', 'V3D51', 'V3D52', 'V3D61', 'V3D62', 'V3D71', 'V3D72',
                'medium voltage vacuum circuit breaker'],
          why: 'E-52100 technical data - the only source carrying the internal V3Dxx catalog cross-reference' },
  4104: { add: ['Type VAD-2', 'VAD-2', 'Class 6055', 'Series 2', 'medium voltage vacuum circuit breaker'],
          why: 'VAD-2 Series 2 instruction bulletin 6055-3' },
};

console.log(APPLY ? '=== APPLYING ===\n' : '=== DRY RUN (pass --apply to write) ===\n');
let planned = 0;

for (const [id, spec] of Object.entries(PLAN)) {
  const row = (await db.execute({ sql: 'select id,title,keywords from manuals where id=?', args: [id] })).rows[0];
  if (!row) { console.log(`  #${id} MISSING`); continue; }
  const have = new Set(String(row.keywords || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
  const fresh = spec.add.filter(k => !have.has(k.toLowerCase()));
  if (!fresh.length) { console.log(`  #${id} nothing new -- skip`); continue; }
  const next = [String(row.keywords || '').replace(/,\s*$/, ''), ...fresh].filter(Boolean).join(', ');
  console.log(`  #${id} ${row.title.slice(0, 60)}`);
  console.log(`      ${spec.why}`);
  console.log(`      +${fresh.length} keywords: ${fresh.slice(0, 8).join(', ')}${fresh.length > 8 ? ` ... (+${fresh.length - 8})` : ''}`);
  planned++;
  if (APPLY) await db.execute({ sql: 'update manuals set keywords=?, updated_at=CURRENT_TIMESTAMP where id=?', args: [next, id] });
}

console.log(`\nrows to change: ${planned}`);
if (APPLY && planned) {
  try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log('[FTS] rebuilt.'); }
  catch (e) { console.log('[FTS] rebuild FAILED: ' + e.message); }
}
