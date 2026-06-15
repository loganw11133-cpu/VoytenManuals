// Cross-manufacturer title-casing scanner (read-only, refined precision).
// Detects the ITE-class defect: frame/type part-codes title-cased instead of
// all-caps. High-signal slots only: "Type X" and "X Frame". A code = 2-4 letters.
// UPPER = correct (reveals convention); Title = the bug. Heavy stoplist to drop
// real words. Also dumps the distinct code vocabulary for named mfrs.
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local' });
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const rows = (await db.execute('SELECT title, manufacturer FROM manuals')).rows;

const SLOTS = [
  { name: 'Type X',  re: /\bType\s+([A-Za-z]{2,4})\b/g },
  { name: 'X Frame', re: /\b([A-Za-z]{2,4})\s+Frame\b/g },
];
// Real words that legitimately sit in these slots — never codes.
const STOP = new Set(['Type','Frame','Air','Low','New','For','And','The','Oil','Gas','Arc','Box','Kit','Bus','Fuse','Power','Heavy','Metal','Field','Stored','Drum','Group','High','Open','Main','Load','Test','Trip','Case','Pole','Volt','Duty','Models','Model','Series','Solid','State','Wall','Door','With','Cell','Auto','Line','Lite','Wide','Long','Each','Both','Same','Half','Full','Drum','Cord','Plug','Snap','Twin','Fast','Slow','Hand','Iron','Lead','Time','Zone','Star','Half','Same']);

const byMfr = {};
for (const r of rows) {
  const t = String(r.title); const m = r.manufacturer;
  const M = (byMfr[m] ||= { upper:0, title:0, tok:{} });
  for (const s of SLOTS) {
    s.re.lastIndex = 0; let mm;
    while ((mm = s.re.exec(t))) {
      const tok = mm[1];
      if (STOP.has(tok)) continue;
      if (/^[A-Z]{2,4}$/.test(tok)) M.upper++;
      else if (/^[A-Z][a-z]+$/.test(tok)) { M.title++; M.tok[tok]=(M.tok[tok]||0)+1; }
    }
  }
}
const order = Object.entries(byMfr).sort((a,b)=>b[1].title-a[1].title);
console.log('mfr                      | Title(bug) | Upper(ok) | convention | top title-cased code tokens');
console.log('-'.repeat(115));
let totBug=0;
for (const [m,d] of order) {
  totBug += d.title;
  if (d.title===0) continue;
  const toks = Object.entries(d.tok).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([k,v])=>`${k}×${v}`).join(' ');
  const conv = d.upper>0 ? `${Math.round(100*d.upper/(d.upper+d.title))}% UC` : 'n/a';
  console.log(`${m.padEnd(24)} | ${String(d.title).padStart(9)} | ${String(d.upper).padStart(8)} | ${conv.padStart(9)} | ${toks}`);
}
console.log(`\nTotal title-cased code hits (Type X / X Frame slots): ${totBug}`);

for (const target of ['Westinghouse','Eaton']) {
  const d = byMfr[target]; if (!d) continue;
  const all = Object.entries(d.tok).sort((a,b)=>b[1]-a[1]);
  console.log(`\n=== ${target}: ${all.length} distinct title-cased code tokens (all) ===`);
  console.log('  '+all.map(([k,v])=>`${k}×${v}`).join('  '));
}
