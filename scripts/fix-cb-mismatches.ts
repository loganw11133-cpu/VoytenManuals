import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

async function update(label: string, slug_pattern: string, url: string): Promise<number> {
  const r = await db.execute({
    sql: `UPDATE manuals SET pdf_url = ? WHERE slug LIKE ? AND pdf_url != 'NONE'`,
    args: [url, `%${slug_pattern}%`],
  });
  if (r.rowsAffected && r.rowsAffected > 0) {
    console.log(`  ${label}: ${r.rowsAffected} updated`);
  }
  return r.rowsAffected || 0;
}

async function setNone(label: string, where: string): Promise<number> {
  const r = await db.execute(`UPDATE manuals SET pdf_url = 'NONE' WHERE ${where} AND pdf_url != 'NONE'`);
  if (r.rowsAffected && r.rowsAffected > 0) {
    console.log(`  ${label}: ${r.rowsAffected} -> NONE`);
  }
  return r.rowsAffected || 0;
}

async function main() {
  let total = 0;

  // === ABB Medium Voltage ===
  console.log('=== ABB Medium Voltage — fix VD4/HD4 ===');

  // VD4 entries -> ABB VD4 manual
  total += await update('ABB VD4', 'abb-vd4',
    'https://library.e.abb.com/public/1119eb5806064d4fa3cd7cf8465ff9bb/1VCD601410.R0000_EDO-D0003080_6_A4V_VD4%2063%20MANUAL.pdf');

  // HD4 entries -> ABB HD4 manual
  total += await update('ABB HD4', 'abb-hd4',
    'https://library.e.abb.com/public/bbaf585ba1cd4829a8b1d963f3dbeb72/MA_HD4(EN)P_1VCD601246-1509.pdf');

  // Any remaining ABB MV entries (UniGear, etc.) -> NONE
  total += await setNone('ABB MV others',
    "slug LIKE '%abb%medium-voltage%' AND pdf_url LIKE '%ITSCE-RH0288002%'");

  // === Siemens Medium Voltage ===
  console.log('\n=== Siemens Medium Voltage — fix 3AH/GMSG ===');

  // 3AH entries -> Siemens 3AH manual
  total += await update('Siemens 3AH', 'siemens-3ah',
    'https://assets.new.siemens.com/siemens/assets/api/uuid:e6b9f515-c4f0-4261-b9a0-fbd98c508d49/e50001-f710-a251-v4-4a00-3ah-3ahc.pdf');

  // GMSG entries -> Siemens GMSG manual
  total += await update('Siemens GMSG', 'siemens-gmsg',
    'https://assets.new.siemens.com/siemens/assets/api/uuid:48a6b5c9-8335-4a07-a498-f8b7bdee1327/ansi-mv-ais-gm-sg-im-en.pdf');

  // === Cutler-Hammer Trip Units — Digitrip 510 used for all ===
  console.log('\n=== Cutler-Hammer Trip Units — clear non-510 entries ===');

  // Keep 510 on the 510 entry, clear others
  total += await setNone('CH Digitrip 1150',
    "slug LIKE '%cutler-hammer-digitrip-1150%' AND pdf_url LIKE '%il29005%'");
  total += await setNone('CH Digitrip 310',
    "slug LIKE '%cutler-hammer-digitrip-310%' AND pdf_url LIKE '%il29005%'");
  total += await setNone('CH Digitrip 520',
    "slug LIKE '%cutler-hammer-digitrip-520%' AND pdf_url LIKE '%il29005%'");
  total += await setNone('CH Digitrip 810',
    "slug LIKE '%cutler-hammer-digitrip-810%' AND pdf_url LIKE '%il29005%'");
  total += await setNone('CH Optim 1050',
    "slug LIKE '%cutler-hammer-optim%' AND pdf_url LIKE '%il29005%'");

  // === GE Wiring Diagrams — AKR manual used for Power Break wiring ===
  console.log('\n=== GE Wiring Diagrams — clear Power Break wiring using AKR manual ===');
  total += await setNone('GE PB II wiring',
    "slug LIKE '%power-break-ii-wiring%' AND pdf_url LIKE '%GEI-86150%'");

  // === ABB Emax Wiring/Curves/Trip units using Emax ACB manual ===
  // These are actually fine — the Emax manual includes wiring diagrams, curves, and Ekip info
  // But Ekip trip units should ideally have their own doc — clear for now
  console.log('\n=== ABB Ekip trip units — Emax manual is a general ACB doc ===');
  // Actually the Ekip documentation IS in the Emax manual, this is acceptable
  // Leave as-is

  // === Westinghouse MV — using NRX catalog for VCP-W ===
  // VCP-W is Eaton heritage, NRX catalog includes VCP-W specs — acceptable

  // === Verify no remaining mismatches in Circuit Breakers ===
  console.log('\n=== Final check ===');
  const mv = await db.execute(
    "SELECT slug, pdf_url FROM manuals WHERE category = 'Circuit Breakers' AND subcategory = 'Medium Voltage Breakers' AND pdf_url != 'NONE' ORDER BY slug"
  );
  console.log(`Medium Voltage entries with PDFs: ${mv.rows.length}`);
  for (const row of mv.rows) {
    const fn = String(row.pdf_url).split('/').pop()!.substring(0, 55);
    console.log(`  ${String(row.slug).padEnd(55)} | ${fn}`);
  }

  console.log(`\nTotal updated: ${total}`);
}

main().catch(console.error);
