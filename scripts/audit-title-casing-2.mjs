// Title-casing scanner, round 2 (read-only). audit-title-casing.mjs only looked
// at the "Type X" and "X Frame" slots, and the 2026-06-15 fixer only uppercased
// codes in those anchors -- so a bare code straight after the brand name
// ("Siemens Fd 15A Molded Case...", "Siemens Wlf 800A...") was never seen.
//
// Slots scanned here:
//   lead    first token after the manufacturer name / brand alias
//   rating  token directly before a rating or number ("Fd 15A", "Gmsg 4.76kV")
//   digit   title-cased token with digits fused in ("Nw20", "Mtz2")
//   hyphen  hyphenated title-case code ("Gm-sg")
//
// A token counts as a code candidate if it is Title-case and 2-5 letters, and
// not in the stoplist. Evidence column = how many titles sitewide carry the
// ALL-CAPS form as a whole word: strong evidence it is a code, not a word.
//
//   node scripts/audit-title-casing-2.mjs [--json <path>]
import { createClient } from '@libsql/client';
import { writeFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:/Users/rodol/Desktop/DesktopBackup/Folders/Voyten-ICCB/Projects/Web-Tech Dev/EPM & VManuals/Project/Structural/VoytenManuals/.env.local' });

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const rows = (await db.execute('SELECT id, manufacturer, title FROM manuals')).rows;

const ALIASES = ['General Electric', 'GE', 'Square D', 'Cutler-Hammer', 'Cutler Hammer', 'Westinghouse',
  'Siemens-Allis', 'Siemens', 'Eaton', 'ABB', 'ITE', 'I-T-E', 'Federal Pacific', 'FPE', 'Allis-Chalmers',
  'Allis Chalmers', 'Schneider Electric', 'Schneider', 'Merlin Gerin', 'Brown Boveri', 'BBC', 'Basler Electric',
  'Basler', 'Cooper Power Systems', 'Cooper', 'Toshiba', 'Mitsubishi', 'Powell', 'McGraw-Edison', 'S&C', 'Zinsco'];
const aliasRe = new RegExp(`^(?:${ALIASES.map(a => a.replace(/[-&]/g, '\\$&')).join('|')})\\s+`, 'i');

const STOP = new Set(`Type Types Frame Air Low New For And The Oil Gas Arc Box Kit Bus Fuse Power Heavy Metal
Field Stored Drum Group High Open Main Load Test Trip Case Pole Volt Duty Model Models Series Solid State Wall
Door With Cell Auto Line Lite Wide Long Each Both Same Half Full Cord Plug Snap Twin Fast Slow Hand Iron Lead
Time Zone Star Motor Relay Relays Panel Unit Units Meter Meters Switch Molded Parts Part Guide Book Data Sheet
Style Class Size Amp Amps Volts Watt Pump Fan Coil Coils Shunt Spare Rack Base Cover Frame Top Front Rear Side
Left Right Size Step Mini Micro Magne Blast Break Pact Max Plus Pro Smart Safe Sure Tech Trol Visi Wave Guard
Pow Ultra Super Multi Dual Mark Mod Rev Vol Vac Vacuum Bolt Cable Bushing Arm Link Pin Cam Gear Spring Latch
Close Closing Shunt Aux Non All Only One Two Three Four Five Six Seven Eight Nine Ten Old Used Retro Fit Fits
Install Instal How What When Why Kits Unit Diagram Wiring Curve Curves Size Sizes Table Chart Charts Photo
Photos Brush Oiled Dry Wet Hot Cold Hi Lo Kv Kva Hz Rpm Dc Ac Amp Pole Poles Sect Section Special Standard
Deluxe Economy Basic Circuit Breaker Breakers Manual Manuals Bulletin Leaflet Catalog Catalogue Instructions
Instruction Renewal Spare Replacement Operating Operation Maintenance Service Mounting Mounted Plate Plates
Contact Contacts Tip Tips Handle Handles Mech Mechanism Assembly Assy Bracket Brackets Screw Screws Nut Nuts
Lug Lugs Terminal Terminals Block Blocks Connector Connectors Top-Selling Selling Energy Grid Cap Caps`.split(/\s+/));

const tokRe = /^[A-Z][a-z]{1,4}$/;
const allTitles = rows.map(r => String(r.title));
const upperCount = new Map();
function evidence(tok) {
  const U = tok.toUpperCase();
  if (!upperCount.has(U)) {
    const re = new RegExp(`\\b${U.replace(/-/g, '\\-')}\\b`);
    upperCount.set(U, allTitles.filter(t => re.test(t)).length);
  }
  return upperCount.get(U);
}

const hits = new Map();   // key mfr|tok -> { mfr, tok, slot:Set, ids:[], sample }
function add(r, tok, slot) {
  const k = `${r.manufacturer}|${tok}`;
  const h = hits.get(k) || { mfr: r.manufacturer, tok, slots: new Set(), ids: [], sample: String(r.title) };
  h.slots.add(slot);
  if (!h.ids.includes(Number(r.id))) h.ids.push(Number(r.id));
  hits.set(k, h);
}

for (const r of rows) {
  const t = String(r.title);
  const m = t.match(aliasRe);
  if (m) {
    const next = t.slice(m[0].length).split(/\s+/)[0].replace(/[,:;.]$/, '');
    if (tokRe.test(next) && !STOP.has(next)) add(r, next, 'lead');
  }
  for (const mm of t.matchAll(/\b([A-Z][a-z]{1,4})\s+\d[\d.,/-]*\s?(?:A|kA|kV|KV|V|Amp|Amps|HP|Frame)?\b/g)) {
    if (!STOP.has(mm[1])) add(r, mm[1], 'rating');
  }
  for (const mm of t.matchAll(/\b([A-Z][a-z]{1,3}\d[a-z0-9]*)\b/g)) add(r, mm[1], 'digit');
  for (const mm of t.matchAll(/\b([A-Z][a-z]{1,3}-[a-z]{1,3})\b/g)) add(r, mm[1], 'hyphen');
}

const list = [...hits.values()].map(h => ({ ...h, slots: [...h.slots].join('+'), n: h.ids.length, ev: evidence(h.tok) }))
  .sort((a, b) => a.mfr.localeCompare(b.mfr) || b.n - a.n);

const byMfr = {};
for (const h of list) (byMfr[h.mfr] ||= []).push(h);
let totalRows = new Set();
for (const [mfr, hs] of Object.entries(byMfr).sort((a, b) => b[1].reduce((s, h) => s + h.n, 0) - a[1].reduce((s, h) => s + h.n, 0))) {
  const rowsHit = new Set(hs.flatMap(h => h.ids));
  rowsHit.forEach(i => totalRows.add(`${mfr}|${i}`));
  console.log(`\n=== ${mfr}: ${hs.length} tokens, ${rowsHit.size} rows ===`);
  for (const h of hs) console.log(`  ${h.tok.padEnd(9)} n=${String(h.n).padStart(3)} ev=${String(h.ev).padStart(4)} [${h.slots}]  e.g. ${h.sample}`);
}
console.log(`\nTOTAL candidate rows: ${totalRows.size}`);

const jsonAt = process.argv.indexOf('--json');
if (jsonAt > -1) writeFileSync(process.argv[jsonAt + 1], JSON.stringify(list, null, 1));
