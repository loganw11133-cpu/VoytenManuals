import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

async function clearMismatched(pdfPattern: string, validSlugPatterns: string[], reason: string): Promise<number> {
  const r = await db.execute({
    sql: `SELECT id, slug FROM manuals WHERE pdf_url LIKE ? AND pdf_url != 'NONE'`,
    args: [`%${pdfPattern}%`],
  });
  const toFix: number[] = [];
  for (const row of r.rows) {
    const s = String(row.slug);
    const matches = validSlugPatterns.some(p => s.includes(p));
    if (!matches) {
      toFix.push(Number(row.id));
    }
  }
  if (toFix.length === 0) return 0;

  // Batch update in chunks of 50
  for (let i = 0; i < toFix.length; i += 50) {
    const chunk = toFix.slice(i, i + 50);
    const placeholders = chunk.map(() => '?').join(',');
    await db.execute({
      sql: `UPDATE manuals SET pdf_url = 'NONE' WHERE id IN (${placeholders})`,
      args: chunk,
    });
  }
  console.log(`${reason}: ${toFix.length} cleared`);
  return toFix.length;
}

async function main() {
  const before = await db.execute("SELECT COUNT(*) as c FROM manuals WHERE pdf_url = 'NONE'");
  console.log(`Before: ${before.rows[0].c} entries with NONE\n`);

  let total = 0;

  // GE Spectra (DEH-41304) — only for Spectra/THED/TED/THFK/TFK/SGD/SGP/SKH
  total += await clearMismatched('DEH-41304', ['spectra', 'ge-thed', 'ge-ted', 'ge-thfk', 'ge-tfk', 'ge-sgd', 'ge-sgp', 'ge-skh'], 'GE Spectra');

  // ABB Emax (1SDH001366R0001) — only for Emax E1-E6, Ekip, Brown Boveri
  total += await clearMismatched('1SDH001366R0001', ['emax', 'abb-e1', 'abb-e2', 'abb-e3', 'abb-e4', 'abb-e6', 'ekip', 'brown-boveri'], 'ABB Emax');

  // Siemens 3VL — only for 3VL or standard Siemens MCCB frames
  total += await clearMismatched('SENTRON_molded-case', ['3vl', 'siemens-bq', 'siemens-ed', 'siemens-fd', 'siemens-hfd', 'siemens-jd', 'siemens-ld', 'siemens-nd', 'siemens-pd', 'siemens-qj', 'siemens-qp', 'top-seller-siemens-fd'], 'Siemens 3VL');

  // ABB Tmax (1SDH001316R0002) — only for Tmax
  total += await clearMismatched('1SDH001316R0002', ['tmax', 'abb-t', 'abb-xt'], 'ABB Tmax');

  // Eaton DS manual (ib337901) — only for DS/DSL
  total += await clearMismatched('ib337901', ['ds-', '-ds-', 'ds-dsl', 'ds-206', 'ds-416', 'ds-632', 'ds-840', 'dsl-'], 'Eaton DS manual');

  // Eaton Magnum DS (ib2c12060) — only for Magnum DS/DC/DSX/MDE
  total += await clearMismatched('ib2c12060', ['magnum-ds', 'magnum-dc', 'magnum-dsx', 'magnum-mde', 'mds6', 'top-seller-eaton-magnum-ds'], 'Eaton Magnum DS');

  // ITE K-Line — only for K-Line, Gould, digitrip-retrofit
  total += await clearMismatched('K-Line', ['k-line', 'kline', 'k-600', 'k-1600', 'k-2000', 'k-3000', 'gould', 'ite-k-', 'digitrip-retrofit'], 'ITE K-Line');

  // GE Power Break (GEH-4693D) — only for Power Break
  total += await clearMismatched('GEH-4693D', ['power-break', 'ge-power-break'], 'GE Power Break');

  // GE AKR (GEI-86150) — only for AK/AKR/AKRU/AKT
  total += await clearMismatched('GEI-86150', ['ak-', 'akr', 'akru', 'akt-', 'top-seller-ge-akr'], 'GE AKR');

  // Eaton NRX (mn01301003e) — only for NRX/NF/RF
  total += await clearMismatched('mn01301003e', ['nrx', '-nf-', '-rf-'], 'Eaton NRX manual');

  // Siemens WL (s06-wl) — only for WL, ETU
  total += await clearMismatched('s06-wl-power', ['-wl-', 'siemens-wl', 'etu-', 'top-seller-siemens-wl'], 'Siemens WL');

  // Siemens RL (SGIM-3068D) — only for RL, Allis-Chalmers
  total += await clearMismatched('SGIM-3068D', ['type-rl', '-rl-', 'allis-chalmers'], 'Siemens RL');

  // Siemens 3WL — only for 3WL, GMSG, 3AH
  total += await clearMismatched('tech-kata-sentron-3wl', ['3wl', 'gmsg', '3ah', 'siemens-gmsg', 'siemens-3ah'], 'Siemens 3WL');

  // Eaton DS renewal (rb22B01te) — only for DS/DSL renewal
  total += await clearMismatched('rb22B01te', ['ds-', 'dsl-', 'ds-dsl', 'ds-renewal', 'westinghouse-ds'], 'Eaton DS renewal');

  // Digitrip 510 (il29005) — only for Digitrip/Amptector
  total += await clearMismatched('il29005', ['digitrip', 'amptector'], 'Digitrip 510');

  // Eaton NRX catalog (td013001en) — only for NRX/VCP-W/vacuum
  total += await clearMismatched('td013001en', ['nrx', 'vcp', 'vacuum', '-nf-', '-rf-'], 'Eaton NRX catalog');

  // PXR guide (mz013001e) — only for PXR
  total += await clearMismatched('mz013001e', ['pxr', 'power-xpert'], 'PXR guide');

  // Eaton Magnum SB (ib2c12063h03) — only for Magnum SB
  total += await clearMismatched('ib2c12063h03', ['magnum-sb', 'sbs6'], 'Eaton Magnum SB');

  // Eaton DSII manual (ib694c694) — only for DSII/DSLII
  total += await clearMismatched('ib694c694', ['dsii', 'dslii', 'ds-ii', 'ds2'], 'Eaton DSII');

  // Eaton switchgear aftermarket — only for switchgear entries
  total += await clearMismatched('ca08100014e', ['switchgear'], 'Eaton switchgear');

  // Eaton DS TCC — only for curve/tcc entries
  total += await clearMismatched('ad32870', ['curve', 'tcc', 'time-current'], 'Eaton DS TCC');
  total += await clearMismatched('sc628296', ['curve', 'tcc', 'time-current'], 'Eaton DSII TCC');

  // Eaton Magnum TCC — only for curve entries
  total += await clearMismatched('70c1498', ['curve', 'tcc', 'digitrip-1150'], 'Eaton Magnum TCC');

  const after = await db.execute("SELECT COUNT(*) as c FROM manuals WHERE pdf_url = 'NONE'");
  const withPdf = await db.execute("SELECT COUNT(*) as c FROM manuals WHERE pdf_url != 'NONE'");
  const totalManuals = await db.execute('SELECT COUNT(*) as c FROM manuals');

  console.log(`\n=== RESULT ===`);
  console.log(`Cleared: ${total} mismatched PDFs`);
  console.log(`Total entries: ${totalManuals.rows[0].c}`);
  console.log(`  With valid PDF: ${withPdf.rows[0].c}`);
  console.log(`  No PDF (CTA only): ${after.rows[0].c}`);
}

main().catch(console.error);
