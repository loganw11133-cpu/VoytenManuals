import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

async function setPdf(label: string, slugPattern: string, url: string): Promise<number> {
  const result = await db.execute({
    sql: `UPDATE manuals SET pdf_url = ?, updated_at = CURRENT_TIMESTAMP WHERE slug LIKE ? AND pdf_url = 'NONE'`,
    args: [url, slugPattern],
  });
  const count = result.rowsAffected;
  console.log(`  ${label}: ${count} updated`);
  return count;
}

async function main() {
  let total = 0;

  // ── Schneider Electric Official PDF URLs ──────────────────────────────

  // Masterpact NW — UL/ANSI User Guide (0613IB1204)
  const NW_UL = 'https://download.schneider-electric.com/files?p_Doc_Ref=0613IB1204&p_enDocType=Instruction+sheet&p_File_Name=0613IB1204_Tri+net.pdf';

  // Masterpact NW — IEC User Guide (0613IB1208)
  const NW_IEC = 'https://download.schneider-electric.com/files?p_Doc_Ref=0613IB1208&p_enDocType=Instruction+sheet&p_File_Name=0613IB1208_tri+net.pdf';

  // Masterpact NT/NW — Combined Catalog (0613CT0001) — 44MB comprehensive doc
  const NT_NW_CATALOG = 'https://download.schneider-electric.com/files?p_Doc_Ref=0613CT0001&p_enDocType=Catalog&p_File_Name=0613CT0001.pdf';

  // Masterpact MTZ1 — UL/ANSI User Guide (0614IB1702)
  const MTZ_UL = 'https://download.schneider-electric.com/files?p_Doc_Ref=0614IB1702&p_enDocType=User+guide';

  // PowerPact H/J/L Frame User Guide (48940-313-01)
  const PP_HJL = 'https://download.schneider-electric.com/files?p_Doc_Ref=48940-313-01&p_enDocType=User+guide&p_File_Name=48940-313-01.pdf';

  // PowerPact P-Frame User Guide (48049-148-05)
  const PP_P = 'https://download.schneider-electric.com/files?p_Doc_Ref=48049-148-05&p_enDocType=User+guide';

  // PowerPact R-Frame Installation (48049-243-04)
  const PP_R = 'https://download.schneider-electric.com/files?p_Doc_Ref=48049-243-04&p_enDocType=Instruction+sheet&p_File_Name=48049-243-04+Rev+06.pdf';

  // MicroLogic 2.0/3.0 Trip (covers 0,1,2,3) — 48049-207-06
  const ML_23 = 'https://download.schneider-electric.com/files?p_Doc_Ref=48049-207-06&p_enDocType=Instruction+sheet';

  // MicroLogic 5.0/6.0 — 48049-137-05
  const ML_56 = 'https://download.schneider-electric.com/files?p_Doc_Ref=48049-137-05&p_enDocType=User+guide';

  // MicroLogic 7.0 — use NW UL guide (7.0 is covered in the NW manual)
  const ML_7 = NW_UL;

  // MicroLogic X — DOCA0102EN
  const ML_X = 'https://download.schneider-electric.com/files?p_Doc_Ref=DOCA0102EN&p_enDocType=User+guide';

  // ── Masterpact NW (64 entries) ────────────────────────────────────────

  console.log('\n=== Masterpact NW ===');
  // Base NW entries (11 frame sizes) → NW UL User Guide
  total += await setPdf('NW base frames', 'square-d-masterpact-nw__-%-air-circuit-breaker', NW_UL);
  // Try broader pattern for base entries
  total += await setPdf('NW base frames (broad)', 'square-d-masterpact-nw%-air-circuit-breaker', NW_UL);

  // NW + Micrologic 2.0
  total += await setPdf('NW + Micrologic 2.0', 'square-d-masterpact-nw%-micrologic-2-0', ML_23);
  // NW + Micrologic 5.0
  total += await setPdf('NW + Micrologic 5.0', 'square-d-masterpact-nw%-micrologic-5-0', ML_56);
  // NW + Micrologic 6.0
  total += await setPdf('NW + Micrologic 6.0', 'square-d-masterpact-nw%-micrologic-6-0', ML_56);
  // NW + Micrologic 7.0
  total += await setPdf('NW + Micrologic 7.0', 'square-d-masterpact-nw%-micrologic-7-0', ML_7);

  // NW accessories
  total += await setPdf('NW shunt trip', '%masterpact-nw-shunt-trip%', NW_UL);
  total += await setPdf('NW motor operator', '%masterpact-nw-motor-operator%', NW_UL);
  total += await setPdf('NW aux switch', '%masterpact-nw-auxiliary%', NW_UL);
  total += await setPdf('NW drawout cradle', '%masterpact-nw-drawout%', NW_UL);
  total += await setPdf('NW retrofit guide', '%masterpact-nw-to-mtz%', MTZ_UL);
  total += await setPdf('NW parts catalog', '%masterpact-nw-renewal%', NT_NW_CATALOG);
  total += await setPdf('NW coordination tables', '%masterpact-nw-coordination%', NT_NW_CATALOG);
  total += await setPdf('NW vs Magnum DS', '%masterpact-nw-vs-eaton%', NT_NW_CATALOG);
  total += await setPdf('Schneider NW guide', 'schneider-electric-masterpact-nw-%', NW_UL);

  // ── Masterpact NT (21 entries) ────────────────────────────────────────

  console.log('\n=== Masterpact NT ===');
  // NT base frames → NT/NW catalog (which covers both)
  total += await setPdf('NT base frames', 'square-d-masterpact-nt%-air-circuit-breaker', NT_NW_CATALOG);

  // NT + Micrologic
  total += await setPdf('NT + Micrologic 2.0', 'square-d-masterpact-nt%-micrologic-2-0', ML_23);
  total += await setPdf('NT + Micrologic 5.0', 'square-d-masterpact-nt%-micrologic-5-0', ML_56);
  total += await setPdf('NT + Micrologic 6.0', 'square-d-masterpact-nt%-micrologic-6-0', ML_56);
  total += await setPdf('Schneider NT guide', 'schneider-electric-masterpact-nt-%', NT_NW_CATALOG);

  // ── Masterpact MTZ (21 entries) ───────────────────────────────────────

  console.log('\n=== Masterpact MTZ ===');
  total += await setPdf('MTZ1 all', 'square-d-masterpact-mtz1%', MTZ_UL);
  total += await setPdf('MTZ2 all', 'square-d-masterpact-mtz2%', MTZ_UL);
  total += await setPdf('MTZ3 all', 'square-d-masterpact-mtz3%', MTZ_UL);
  total += await setPdf('Schneider MTZ guide', 'schneider-electric-masterpact-mtz%', MTZ_UL);

  // ── PowerPact (6 entries) ─────────────────────────────────────────────

  console.log('\n=== PowerPact ===');
  total += await setPdf('PowerPact H-Frame', '%powerpact-h-frame%', PP_HJL);
  total += await setPdf('PowerPact J-Frame', '%powerpact-j-frame%', PP_HJL);
  total += await setPdf('PowerPact L-Frame', '%powerpact-l-frame%', PP_HJL);
  total += await setPdf('PowerPact P-Frame', '%powerpact-p-frame%', PP_P);
  total += await setPdf('PowerPact R-Frame', '%powerpact-r-frame%', PP_R);
  total += await setPdf('Schneider PowerPact guide', 'schneider-electric-powerpact%', PP_HJL);

  // ── Micrologic Trip Units (7 entries) ─────────────────────────────────

  console.log('\n=== Micrologic Trip Units ===');
  total += await setPdf('Micrologic 2.0', 'square-d-micrologic-2-0-trip-unit', ML_23);
  total += await setPdf('Micrologic 3.0', 'square-d-micrologic-3-0-trip-unit', ML_23);
  total += await setPdf('Micrologic 5.0', 'square-d-micrologic-5-0-trip-unit', ML_56);
  total += await setPdf('Micrologic 6.0', 'square-d-micrologic-6-0-trip-unit', ML_56);
  total += await setPdf('Micrologic 7.0', 'square-d-micrologic-7-0-trip-unit', ML_7);
  total += await setPdf('MicroLogic X', 'square-d-micrologic-x-trip-unit', ML_X);
  total += await setPdf('Schneider Micrologic guide', 'schneider-electric-micrologic%', ML_56);

  // ── Top-seller SQD entries ────────────────────────────────────────────

  console.log('\n=== Top-seller Square D entries ===');
  total += await setPdf('Top-seller NW16', 'top-seller-square-d-masterpact-nw16%', NW_UL);
  total += await setPdf('Top-seller NW20', 'top-seller-square-d-masterpact-nw20%', NW_UL);
  total += await setPdf('Top-seller NW32', 'top-seller-square-d-masterpact-nw32%', NW_UL);
  total += await setPdf('Top-seller PowerPact R', 'top-seller-square-d-powerpact-r%', PP_R);
  total += await setPdf('Top-seller PowerPact H', 'top-seller-square-d-powerpact-h%', PP_HJL);
  total += await setPdf('Top-seller PowerPact L', 'top-seller-square-d-powerpact-l%', PP_HJL);
  total += await setPdf('Top-seller PowerPact J', 'top-seller-square-d-powerpact-j%', PP_HJL);
  total += await setPdf('Top-seller PowerPact P', 'top-seller-square-d-powerpact-p%', PP_P);

  // ── Summary ───────────────────────────────────────────────────────────

  console.log(`\n=== TOTAL UPDATED: ${total} ===`);

  // Check remaining
  const remaining = await db.execute("SELECT COUNT(*) as c FROM manuals WHERE (manufacturer = 'Square D' OR manufacturer = 'Schneider Electric') AND pdf_url = 'NONE'");
  console.log(`SQD entries still without PDF: ${remaining.rows[0].c}`);

  if (Number(remaining.rows[0].c) > 0) {
    const list = await db.execute("SELECT slug FROM manuals WHERE (manufacturer = 'Square D' OR manufacturer = 'Schneider Electric') AND pdf_url = 'NONE' ORDER BY slug");
    console.log('\nRemaining:');
    list.rows.forEach(r => console.log('  ' + r.slug));
  }
}

main().catch(console.error);
