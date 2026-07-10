// Part 2 of the Siemens MICROMASTER scan-filename title fix (companion to fix-siemens-micromaster-titles.mjs).
// Covers the "CIB" and "TX9" component batches (the "PB"/Powerblock set was fixed in part 1).
// Verified by reading page 1 of each PDF (2026-07-10). "CIB" = CIB power assembly; "TX9" = Terminal Block X9.
// Data-only: title + category/subcategory. Slugs UNCHANGED. Dry-run by default; --live to write.
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import { writeFileSync } from "node:fs";
dotenv.config({ path: "C:\\Users\\rodol\\Desktop\\DesktopBackup\\Folders\\Voyten-ICCB\\Projects\\Web-Tech Dev\\EPM & VManuals\\Project\\Structural\\VoytenManuals\\.env.local" });
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const LIVE = process.argv.includes("--live");
const CAT = "Motor Controls", SUB = "Drives & Power";

const U = {
  // CIB
  11020: { title: "Siemens MICROMASTER 430 — CIB Maintenance Instructions, Frame Size FX (110–132 kW)" },
  11290: { title: "Siemens MICROMASTER 430 — CIB Maintenance Instructions, Frame Size GX (160–250 kW)" },
  11024: { title: "Siemens MICROMASTER 440 — CIB Maintenance Instructions, Frame Size GX (132–200 kW)" },
  // TX9 = Terminal Block X9
  11023: { title: "Siemens MICROMASTER 440 — Terminal Block X9 Maintenance Instructions, Frame Size FX (90–110 kW)" },
  11293: { title: "Siemens MICROMASTER 440 — Terminal Block X9 Maintenance Instructions, Frame Size GX (132–200 kW)" },
  11984: { title: "Siemens MICROMASTER 430 — Terminal Block X9 Maintenance Instructions, Frame Size FX (110–132 kW)" },
  11994: { title: "Siemens MICROMASTER 430 — Terminal Block X9 Maintenance Instructions, Frame Size GX (160–250 kW)" },
};
const ids = Object.keys(U).map(Number);
const cur = await db.execute(`SELECT id,slug,title,manufacturer,category,subcategory FROM manuals WHERE id IN (${ids.join(",")})`);
const byId = Object.fromEntries(cur.rows.map(r => [r.id, r]));

const frag = /^\s*\d{2,3}\s+[A-Z]{2}\s+[A-Z0-9]{2,3}\s*$/;
const bad = [];
for (const id of ids) {
  const r = byId[id];
  if (!r) { bad.push(`${id}: NOT FOUND`); continue; }
  if (r.manufacturer !== "Siemens") bad.push(`${id}: mfr=${r.manufacturer}`);
  if (!frag.test(r.title)) bad.push(`${id}: title="${r.title}" not a fragment`);
}
if (bad.length) { console.error("PRE-CHECK FAILED:\n" + bad.join("\n")); process.exit(1); }

const bpath = "C:\\Users\\rodol\\Desktop\\memory\\backups\\siemens-micromaster-titles-part2-backup-2026-07-10.json";
writeFileSync(bpath, JSON.stringify(ids.map(id => ({ ...byId[id] })), null, 2));
console.log(`Backup: ${bpath}\n${LIVE ? "APPLYING" : "DRY-RUN"}\n`);
for (const id of ids) {
  const r = byId[id], u = U[id];
  console.log(`id ${id} [${r.slug}]  "${r.title}"  ->  "${u.title}"`);
  if (r.category !== CAT || r.subcategory !== SUB) console.log(`   filing: ${r.category}/${r.subcategory}  ->  ${CAT}/${SUB}`);
}
if (!LIVE) { console.log("\nDry-run only. Re-run with --live."); process.exit(0); }

for (const id of ids) await db.execute({ sql: `UPDATE manuals SET title=?, category=?, subcategory=? WHERE id=?`, args: [U[id].title, CAT, SUB, id] });
// external-content FTS: rebuild so title changes become searchable (repo convention)
try { await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')"); console.log("FTS rebuilt."); }
catch (e) { console.log("FTS rebuild skipped: " + e.message); }
const after = await db.execute(`SELECT id,title FROM manuals WHERE id IN (${ids.join(",")})`);
console.log(`\nApplied ${ids.length}. Remaining fragment titles: ${after.rows.filter(r => frag.test(r.title)).length}`);
