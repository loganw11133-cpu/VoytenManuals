// Fix 4 Siemens manuals titled from scan filenames ("430 GX PB" etc.) — same defect class as the GE
// BuyLog/Control fix. Verified by reading page 1 of each PDF (2026-07-10): they are Siemens MICROMASTER
// 430/440 VFD "Powerblock" (power-module) Maintenance Instructions, frame sizes FX/GX, Edition 12/02.
// "PB" = Powerblock. Data-only: title + category/subcategory normalization. Slugs UNCHANGED.
// Dry-run by default; pass --live to write.
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import { writeFileSync } from "node:fs";
dotenv.config({ path: "C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local" });
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const LIVE = process.argv.includes("--live");

const CAT = "Motor Controls", SUB = "Drives & Power"; // VFD drives
const U = {
  11021: { title: "Siemens MICROMASTER 430 — Powerblock Maintenance Instructions, Frame Size GX (160–250 kW)" },
  11288: { title: "Siemens MICROMASTER 430 — Powerblock Maintenance Instructions, Frame Size FX (110–132 kW)" },
  11022: { title: "Siemens MICROMASTER 440 — Powerblock Maintenance Instructions, Frame Size FX (132–200 kW)" },
  11292: { title: "Siemens MICROMASTER 440 — Powerblock Maintenance Instructions, Frame Size GX (132–200 kW)" },
};
const ids = Object.keys(U).map(Number);
const cur = await db.execute(`SELECT id,slug,title,manual_number,manufacturer,category,subcategory FROM manuals WHERE id IN (${ids.join(",")})`);
const byId = Object.fromEntries(cur.rows.map(r => [r.id, r]));

const frag = /^\s*\d{2,3}\s+[A-Z]{2}\s+[A-Z]{2}\s*$/;
const bad = [];
for (const id of ids) {
  const r = byId[id];
  if (!r) { bad.push(`${id}: NOT FOUND`); continue; }
  if (r.manufacturer !== "Siemens") bad.push(`${id}: mfr=${r.manufacturer}`);
  if (!frag.test(r.title)) bad.push(`${id}: title="${r.title}" not a fragment — skipping guard`);
}
if (bad.length) { console.error("PRE-CHECK FAILED:\n" + bad.join("\n")); process.exit(1); }

const backup = ids.map(id => ({ ...byId[id] }));
const bpath = "C:\\Users\\rodol\\Desktop\\memory\\backups\\siemens-micromaster-titles-backup-2026-07-10.json";
writeFileSync(bpath, JSON.stringify(backup, null, 2));
console.log(`Backup: ${bpath} (${backup.length} rows)\n${LIVE ? "APPLYING" : "DRY-RUN"}\n`);

for (const id of ids) {
  const r = byId[id], u = U[id];
  console.log(`id ${id} [${r.slug}]`);
  console.log(`   title: "${r.title}"  ->  "${u.title}"`);
  if (r.category !== CAT) console.log(`   category: "${r.category}"  ->  "${CAT}"`);
  if (r.subcategory !== SUB) console.log(`   subcat: "${r.subcategory}"  ->  "${SUB}"`);
  console.log();
}
if (!LIVE) { console.log("Dry-run only. Re-run with --live."); process.exit(0); }

let n = 0;
for (const id of ids) {
  await db.execute({ sql: `UPDATE manuals SET title=?, category=?, subcategory=? WHERE id=?`, args: [U[id].title, CAT, SUB, id] });
  n++;
}
// external-content FTS: rebuild so title changes become searchable (repo convention)
try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log("FTS rebuilt."); }
catch (e) { console.log("FTS rebuild skipped: " + e.message); }
const after = await db.execute(`SELECT id,title,category,subcategory FROM manuals WHERE id IN (${ids.join(",")}) ORDER BY id`);
console.log(`Applied ${n}. Remaining fragment titles: ${after.rows.filter(r => frag.test(r.title)).length}`);
for (const r of after.rows) console.log(`  ${r.id}: "${r.title}" [${r.category}/${r.subcategory}]`);
