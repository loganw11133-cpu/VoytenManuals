// Fix 24 GE manuals whose title is a meaningless scan-batch filename ("NN BL" / "NN CC" / "NN BL TC").
// These are sections of two GE Rev.1/08 catalogs:
//   "BL" = GE BuyLog Catalog (pub GEP-1100)   "CC" = GE Control Catalog (pub GEP-1260)
// Content identified by reading page 1-2 of each PDF (2026-07-10). Data-only: title + manual_number
// (+ 3 clear subcategory corrections). Slugs UNCHANGED -> no redirect / FK work needed.
// Dry-run by default; pass --live to write. Backs up prior rows first.
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import { writeFileSync } from "node:fs";
dotenv.config({ path: "C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local" });
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const LIVE = process.argv.includes("--live");

const BL = "GEP-1100"; // GE BuyLog Catalog
const CC = "GEP-1260"; // GE Control Catalog

// id -> {title, num, sub?}  (sub only when correcting a clear misfiling)
const U = {
  // ---- BuyLog (BL) ----
  11000: { title: "GE BuyLog Catalog — Quick Index & Master Table of Contents", num: BL },
  10405: { title: "GE BuyLog Catalog — Residential Load Centers & Q-Line Breakers (PowerMark, Meter Mod)", num: BL },
  10417: { title: "GE BuyLog Catalog — Molded-Case Circuit Breakers, How to Order (Q-Line, E150, F225, J600, K1200, Spectra RMS)", num: BL },
  10420: { title: "GE BuyLog Catalog — Circuit Breaker Enclosures (NEMA Type 1/3R/12/4-4X)", num: BL },
  10416: { title: "GE BuyLog Catalog — Power Break II Insulated-Case Circuit Breakers (MicroVersaTrip, 800–4000A)", num: BL },
  10424: { title: "GE BuyLog Catalog — Panelboards (A-Series & Spectra Series, Interiors/Renewal Parts)", num: BL },
  10287: { title: "GE BuyLog Catalog — Busway (Spectra Series/RMS, LowAmp, Flex-A-Power, Armor-Clad)", num: BL },
  11006: { title: "GE BuyLog Catalog — Power Quality Products (Digital Energy UPS, TRANQUELL TVSS, ATS)", num: BL },
  11002: { title: "GE BuyLog Catalog — Telecommunication Hardware (Fiber Splice Sleeves/Trays, Closures)", num: BL },
  11003: { title: "GE BuyLog Catalog — Multilin Protection, Control, Metering & Communication (UR/SR Relays, EPM Meters)", num: BL, sub: "Relays" },
  11940: { title: "GE BuyLog Catalog — Meters & Instrument Transformers (KV2C, I-210, 600V–69kV CTs/PTs)", num: BL },
  10421: { title: "GE BuyLog Catalog — Time-Current Curves & Outline Drawings (Q-Line, Spectra RMS, PowerBreak, Record Plus)", num: BL },
  // ---- Control Catalog (CC) ----
  11235: { title: "GE Control Catalog — Introduction & Product Overview", num: CC, sub: "Other" },
  11236: { title: "GE Control Catalog — NEMA Full-Voltage Starters & Contactors (CR305–CR494)", num: CC },
  11237: { title: "GE Control Catalog — Reduced-Voltage Starters (ASTAT SD/IBP/CD, Autotransformer, Wye-Delta)", num: CC },
  11238: { title: "GE Control Catalog — Lighting Contactors (CR460, CR463, CR360L, CR160, CR360ML)", num: CC },
  11239: { title: "GE Control Catalog — Definite-Purpose Contactors & Starters (CR453/CR353/CR455/CR354)", num: CC },
  11240: { title: "GE Control Catalog — IEC Power Devices (C-2000 Contactors, Starters, Overload/Control Relays)", num: CC },
  11243: { title: "GE Control Catalog — IEC Manual Motor Starters (Surion GPS1/GPS2, 45/55mm)", num: CC },
  10406: { title: "GE Control Catalog — Miniature Circuit Breakers (E2000, EP60/EP100 DIN-Rail)", num: CC, sub: "Molded Case Breakers" },
  10425: { title: "GE Control Catalog — Pilot & Signaling Devices (CR104P 30.5mm & C-2000 Push Buttons)", num: CC },
  11948: { title: "GE Control Catalog — Logic Control Relays (CR420 Plug-In, CR120B, IEC Timers/Relays)", num: CC },
  11244: { title: "GE Control Catalog — Specialty Control Devices (CR9500 Solenoids, CR127 Pressure/CR115 Limit Switches)", num: CC },
  11001: { title: "GE Control Catalog — Enclosures (NEMA Types 1/3R/4/4X/12, Vynckier Non-Metallic)", num: CC },
};

const ids = Object.keys(U).map(Number);
const cur = await db.execute(`SELECT id,slug,title,manual_number,manufacturer,subcategory FROM manuals WHERE id IN (${ids.join(",")})`);
const byId = Object.fromEntries(cur.rows.map(r => [r.id, r]));

// safety: confirm every target exists, is GE, and still carries a fragment title
const frag = /^\s*\d{1,3}\s+[A-Z]{2}(\s+[A-Z]{2})?\s*$/;
const bad = [];
for (const id of ids) {
  const r = byId[id];
  if (!r) { bad.push(`${id}: NOT FOUND`); continue; }
  if (r.manufacturer !== "General Electric") bad.push(`${id}: mfr=${r.manufacturer} (expected GE)`);
  if (!frag.test(r.title)) bad.push(`${id}: title="${r.title}" no longer a fragment — already changed? skipping-guard`);
}
if (bad.length) { console.error("PRE-CHECK FAILED:\n" + bad.join("\n")); process.exit(1); }

// backup
const backup = ids.map(id => ({ ...byId[id] }));
const bpath = "C:\\Users\\rodol\\Desktop\\memory\\backups\\ge-buylog-control-titles-backup-2026-07-10.json";
writeFileSync(bpath, JSON.stringify(backup, null, 2));
console.log(`Backup written: ${bpath}  (${backup.length} rows)\n`);

// plan
console.log(`${LIVE ? "APPLYING" : "DRY-RUN"} — ${ids.length} rows\n`);
for (const id of ids) {
  const r = byId[id], u = U[id];
  console.log(`id ${id}  [${r.slug}]`);
  console.log(`   title: "${r.title}"  ->  "${u.title}"`);
  console.log(`   num:   ${r.manual_number}  ->  ${u.num}`);
  if (u.sub && u.sub !== r.subcategory) console.log(`   subcat: "${r.subcategory}"  ->  "${u.sub}"`);
  console.log();
}

if (!LIVE) { console.log("Dry-run only. Re-run with --live to apply."); process.exit(0); }

let n = 0;
for (const id of ids) {
  const u = U[id];
  if (u.sub) {
    await db.execute({ sql: `UPDATE manuals SET title=?, manual_number=?, subcategory=? WHERE id=?`, args: [u.title, u.num, u.sub, id] });
  } else {
    await db.execute({ sql: `UPDATE manuals SET title=?, manual_number=? WHERE id=?`, args: [u.title, u.num, id] });
  }
  n++;
}
console.log(`\nApplied ${n} updates.`);

// FTS is external-content (content='manuals') with NO triggers -> title changes don't propagate to
// search until the index is rebuilt. Repo convention: rebuild after every data change.
try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log("FTS rebuilt."); }
catch (e) { console.log("FTS rebuild skipped: " + e.message); }

// verify
const after = await db.execute(`SELECT id,title,manual_number,subcategory FROM manuals WHERE id IN (${ids.join(",")}) ORDER BY id`);
const stillFrag = after.rows.filter(r => frag.test(r.title));
console.log(`Verify: ${after.rows.length} rows updated; remaining fragment titles: ${stillFrag.length}`);
if (stillFrag.length) console.log(stillFrag.map(r => `  ${r.id}: ${r.title}`).join("\n"));
