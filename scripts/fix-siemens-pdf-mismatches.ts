/**
 * Fix Siemens Download-PDF mismatches — audit & remediation 2026-05-22.
 *
 * Audit (via public /api/manuals?manufacturer=Siemens) found all 164 OEM-hosted
 * Siemens manuals were served by just 7 generic PDFs, several pointing at the WRONG
 * product family. Applied to production 2026-05-22. See also scripts/cleanup-mismatched.ts.
 *
 * Actions:
 *   DELETE  Siemens SB insulated-case (8)  — obsolete, no PDF
 *   DELETE  Siemens HB insulated-case (4)  — were wrongly linked to the 3WL2 manual
 *   SWAP    MCCB FD/JD/LD/ND/PD/SD frames (61)  3VL(EU) -> official US Sentron MCCB doc
 *   SWAP    GM-SG switchgear I&M (1)            WL guide -> official GM-SG I&M doc
 *   SWAP    Type LA breakers + accessories (14) WL guide -> RL Volusion store category
 *   SWAP    RL switchgear I&M (1)               WL guide -> rlbreakers.com
 *   SWAP    BQ/BQD branch breakers (16)         3VL(EU) -> official Siemens BQD/CQD guide
 *   CLEAR   ETU trip units (4)                  WL brochure -> 'NONE' ("PDF Not Available")
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

const S05  = 'https://assets.new.siemens.com/siemens/assets/api/uuid:6459265a-346c-47b1-969f-66aaa0f55b12/version:1670424508/s05moldedcasecircuitbreakers.pdf';
const GMSG = 'https://assets.new.siemens.com/siemens/assets/api/uuid:48a6b5c9-8335-4a07-a498-f8b7bdee1327/ansi-mv-ais-gm-sg-im-en.pdf';
const VOL  = 'https://jhkcv-upqrn.volusion.store/category-s/173.htm';
const RLB  = 'https://rlbreakers.com';
const BQD  = 'https://cache.industry.siemens.com/dl/files/549/109792549/att_1160270/v1/Siemens-Molded-Case-Circuit-Breakers-GenApp-Catalog-BQD_CQD_Product_Guide.pdf';

const SBW = "manufacturer='Siemens' AND title LIKE 'Siemens Sb %' AND title LIKE '%Insulated Case%'";
const HBW = "manufacturer='Siemens' AND title LIKE 'Siemens Hb %' AND title LIKE '%Insulated Case%'";
const MCW = "manufacturer='Siemens' AND pdf_url LIKE '%SENTRON_molded-case_circuit_breakers_3VL%' AND title NOT LIKE '%Sentron VL%' AND title NOT LIKE 'Siemens Bq%'";
const GMW = "manufacturer='Siemens' AND title='Siemens Gm-sg Switchgear Installation & Maintenance Manual' AND pdf_url LIKE '%WL-Circuit-Select%'";
const LAW = "manufacturer='Siemens' AND pdf_url LIKE '%WL-Circuit-Select%' AND (title LIKE '%Type LA %' OR title LIKE 'Siemens LA %')";
const RLW = "manufacturer='Siemens' AND title='Siemens RL Switchgear Installation & Maintenance Manual'";
const BQW = "manufacturer='Siemens' AND title LIKE 'Siemens Bq%'";
const ETW = "manufacturer='Siemens' AND title LIKE 'Siemens ETU %'";

async function del(where: string, label: string) {
  const ids = (await db.execute(`SELECT id FROM manuals WHERE ${where}`)).rows.map(r => r.id);
  if (!ids.length) { console.log(`${label}: 0`); return; }
  const list = ids.join(',');
  await db.execute(`DELETE FROM download_events WHERE manual_id IN (${list})`);
  await db.execute(`DELETE FROM lead_submissions WHERE manual_id IN (${list})`);
  const r = await db.execute(`DELETE FROM manuals WHERE id IN (${list})`);
  console.log(`${label}: ${r.rowsAffected} deleted`);
}
async function swap(where: string, url: string, label: string) {
  const r = await db.execute({ sql: `UPDATE manuals SET pdf_url=? WHERE ${where}`, args: [url] });
  console.log(`${label}: ${r.rowsAffected} updated`);
}

async function main() {
  await del(SBW, 'DELETE SB');
  await del(HBW, 'DELETE HB');
  await swap(MCW, S05, 'SWAP MCCB -> s05');
  await swap(GMW, GMSG, 'SWAP GM-SG -> official');
  await swap(LAW, VOL, 'SWAP Type LA -> Volusion store');
  await swap(RLW, RLB, 'SWAP RL switchgear -> rlbreakers.com');
  await swap(BQW, BQD, 'SWAP BQ/BQD -> BQD/CQD guide');
  await swap(ETW, 'NONE', "CLEAR ETU -> 'NONE'");
  const c = (await db.execute("SELECT COUNT(*) c FROM manuals WHERE manufacturer='Siemens'")).rows[0].c;
  console.log(`Siemens total now: ${c}`);
}
main().catch(console.error);
