// TIER A: humanize the ~1,900 rows whose title === the raw PDF filename (a bare doc number / part code).
// Deterministic, metadata-only (NO pdf reads). Prepends "<Mfr> <Family> — <DocTypeLabel>" and keeps the
// original number verbatim (SEO). Skips rows whose title already contains real words / OCR-garble.
// Slugs UNCHANGED. Dry-run by default; --live to write (backup + FTS rebuild included).
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import { writeFileSync } from "node:fs";
dotenv.config({ path: "C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local" });
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const LIVE = process.argv.includes("--live");

const MFR = m => m === "General Electric" ? "GE" : m;

const SUBCAT_FAMILY = {
  "Relays": "Protective Relay",
  "Turbines & Generators": "Turbine / Generator",
  "Contactors & Starters": "Contactor / Starter",
  "Trip Units & Accessories": "Trip Unit",
  "Motors & Brakes": "Motor / Brake",
  "Meters": "Meter",
  "Motor Controllers": "Motor Controller",
  "Power Conditioning": "Power Conditioning Equipment",
  "Air Circuit Breakers": "Air Circuit Breaker",
  "Insulated Case Breakers": "Insulated-Case Circuit Breaker",
  "Fuses": "Fuse",
  "Drives & Power": "Adjustable-Frequency Drive",
  "Switchgear & Parts": "Switchgear",
  "Medium & High Voltage Breakers": "Medium/High-Voltage Circuit Breaker",
  "Molded Case Breakers": "Molded-Case Circuit Breaker",
  "High Voltage Fuses": "High-Voltage Fuse",
  "Busway": "Busway",
  "Control Switches": "Control Switch",
};
const CAT_FAMILY = { "Circuit Breakers": "Circuit Breaker", "Fuses": "Fuse", "Bus Products": "Busway" };

const DOC_LABEL = {
  IL: "Instruction Leaflet", IB: "Instruction Book", IS: "Instruction Sheet",
  IN: "Instructions", DB: "Descriptive Bulletin", RPD: "Renewal Parts Data", RP: "Renewal Parts List",
  AD: "Technical Document", TD: "Technical Document", SA: "Technical Document", DES: "Technical Document",
  GEI: "Technical Publication", GEH: "Technical Publication", GEK: "Technical Publication",
  GEA: "Technical Publication", GEF: "Technical Publication", GET: "Technical Publication",
  GED: "Technical Publication", GEZ: "Technical Publication", GEN: "Technical Publication", DEH: "Technical Publication",
};
const prefixOf = t => {
  const m = (t||'').trim().match(/^(I\.?\s?L\.?|I\.?\s?B\.?|I\.?\s?S\.?|I\.?\s?N\.?|D\.?\s?B\.?|R\.?\s?P\.?\s?D\.?|R\.?\s?P\.?|A\.?\s?D\.?|T\.?\s?D\.?|S\.?\s?A\.?|DES|GE[A-Z]|DEH)/i);
  return m ? m[1].toUpperCase().replace(/[.\s]/g,'') : null;
};
// bare code = no lowercase letters, <=2 alpha runs, has a digit, short — a part/catalog number, not prose
const isBareCode = t => {
  const s = (t||'').trim();
  if (/[a-z]/.test(s)) return false;
  if (!/[0-9]/.test(s)) return false;
  if (s.length > 22) return false;
  const alphaRuns = (s.match(/[A-Z]{2,}/g) || []);
  return alphaRuns.length <= 2;
};

const all = await db.execute(`SELECT id,title,manual_number,manufacturer,category,subcategory,pdf_url FROM manuals WHERE pdf_url IS NOT NULL AND pdf_url NOT IN ('','NONE')`);
const norm = s => (s||'').trim().toLowerCase();
const set = all.rows.filter(r => {
  const base = decodeURIComponent((r.pdf_url||'').split('/').pop()||'').replace(/\.pdf$/i,'').trim();
  return base && norm(r.title) === norm(base);
});

const updates = [], skipped = [];
for (const r of set) {
  const pfx = prefixOf(r.title);
  const label = pfx ? DOC_LABEL[pfx] : null;
  const bare = isBareCode(r.title);
  if (!label && !bare) { skipped.push({ ...r, why: "title has words / OCR-garble" }); continue; }
  const fam = SUBCAT_FAMILY[r.subcategory] || CAT_FAMILY[r.category] || "";
  if (r.manufacturer === "Other Manufacturers" && !fam && !label) { skipped.push({ ...r, why: "no informative head (Other Manufacturers, no family)" }); continue; }
  const head = [MFR(r.manufacturer), fam].filter(Boolean).join(" ");
  const orig = r.title.trim();
  let title;
  if (label) title = `${head} — ${label} (${orig})`;
  else       title = `${head} — ${orig}`;
  title = title.replace(/\s+/g, " ").trim();
  if (title === orig || title.length > 160) { skipped.push({ ...r, why: "no gain / too long" }); continue; }
  updates.push({ id: r.id, from: orig, to: title, mfr: r.manufacturer });
}

console.log(`SET (title===filename): ${set.length}`);
console.log(`  -> transform: ${updates.length}`);
console.log(`  -> skip:      ${skipped.length}`);
const noFam = updates.filter(u => !/ — /.test(u.to) ? false : /^(GE|[^—]+?) —/.test(u.to) && !u.to.includes(" ")).length;
const dupTitles = (() => { const m={}; for (const u of updates) m[u.to]=(m[u.to]||0)+1; return Object.values(m).filter(c=>c>1).length; })();
console.log(`  exact-duplicate resulting titles: ${dupTitles} (should be 0 — original number preserved)`);

// skip reasons + a few samples
const skipReasons = {}; for (const s of skipped) skipReasons[s.why]=(skipReasons[s.why]||0)+1;
console.log("  skip reasons:", JSON.stringify(skipReasons));
console.log("  sample SKIPPED:", skipped.slice(0,6).map(s=>`"${s.title}"`).join("  "));

console.log("\n--- sample transforms (spread across mfrs) ---");
const seen=new Set();
for (const u of updates) { if (seen.has(u.mfr)) continue; seen.add(u.mfr); console.log(`  [${u.mfr}] "${u.from}"\n            -> "${u.to}"`); }
console.log("\n--- 8 more Westinghouse samples ---");
for (const u of updates.filter(u=>u.mfr==='Westinghouse').slice(0,8)) console.log(`  "${u.from}"  ->  "${u.to}"`);

if (!LIVE) { console.log(`\nDRY-RUN. ${updates.length} would change. Re-run with --live.`); process.exit(0); }

// backup (full set incl skipped, for full reversibility)
const bpath = "C:\\Users\\rodol\\Desktop\\memory\\backups\\tierA-docnumber-titles-backup-2026-07-10.json";
writeFileSync(bpath, JSON.stringify(set.map(r=>({id:r.id,title:r.title,manufacturer:r.manufacturer})), null, 2));
console.log(`\nBackup: ${bpath}`);
let n=0;
for (const u of updates) { await db.execute({ sql: `UPDATE manuals SET title=? WHERE id=?`, args: [u.to, u.id] }); n++; }
try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log("FTS rebuilt."); }
catch (e) { console.log("FTS rebuild skipped: " + e.message); }
console.log(`Applied ${n} title updates.`);
