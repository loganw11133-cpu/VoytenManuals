import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

interface Mismatch { id: number; slug: string; reason: string; }

async function main() {
  const mismatches: Mismatch[] = [];

  // Helper: query and filter
  async function check(pdfPattern: string, validSlugPatterns: string[], reason: string) {
    const r = await db.execute({
      sql: `SELECT id, slug FROM manuals WHERE pdf_url LIKE ? AND pdf_url != 'NONE'`,
      args: [`%${pdfPattern}%`],
    });
    for (const row of r.rows) {
      const s = String(row.slug);
      const matches = validSlugPatterns.some(p => s.includes(p));
      if (!matches) {
        mismatches.push({ id: Number(row.id), slug: s, reason });
      }
    }
  }

  // 1. GE Spectra RMS (DEH-41304) — only valid for GE molded case / Spectra
  await check('DEH-41304', ['spectra', 'ge-thed', 'ge-ted', 'ge-thfk', 'ge-tfk', 'ge-sgd', 'ge-sgp', 'ge-skh'], 'GE Spectra PDF ≠ product');

  // 2. Siemens 3VL MCCB — only for 3VL or Siemens molded case BQ/ED/FD/HFD/JD/LD/ND/PD
  await check('SENTRON_molded-case', ['3vl', 'siemens-bq', 'siemens-ed', 'siemens-fd', 'siemens-hfd', 'siemens-jd', 'siemens-ld', 'siemens-nd', 'siemens-pd', 'siemens-qj', 'siemens-qp', 'top-seller-siemens-fd'], 'Siemens 3VL PDF ≠ product');

  // 3. ABB Emax (1SDH001366R0001) — for Emax E1-E6 air circuit breakers
  await check('1SDH001366R0001', ['emax', 'abb-e1', 'abb-e2', 'abb-e3', 'abb-e4', 'abb-e6', 'ekip', 'brown-boveri'], 'ABB Emax PDF ≠ product');

  // 4. ABB Tmax (1SDH001316R0002) — for Tmax molded case only
  await check('1SDH001316R0002', ['tmax', 'abb-t', 'abb-xt'], 'ABB Tmax PDF ≠ product');

  // 5. Eaton DS/DSL manual (ib337901) — for Westinghouse/Eaton DS, DSL breakers
  await check('ib337901', ['ds-', '-ds-', 'ds-dsl', 'ds-206', 'ds-416', 'ds-632', 'ds-840', 'dsl-'], 'Eaton DS manual ≠ product');

  // 6. Eaton Magnum DS (ib2c12060) — for Magnum DS/DC/DSX/DSL/MDE
  await check('ib2c12060', ['magnum-ds', 'magnum-dc', 'magnum-dsx', 'magnum-mde', 'mds6', 'top-seller-eaton-magnum-ds'], 'Eaton Magnum DS PDF ≠ product');

  // 7. ITE K-Line — for K-Line, K-600, K-1600, K-3000, Gould
  await check('K-Line', ['k-line', 'kline', 'k-600', 'k-1600', 'k-2000', 'k-3000', 'gould', 'ite-k-', 'digitrip-retrofit'], 'ITE K-Line PDF ≠ product');

  // 8. GE Power Break (GEH-4693D) — for Power Break I/II
  await check('GEH-4693D', ['power-break', 'ge-power-break'], 'GE Power Break PDF ≠ product');

  // 9. GE AKR (GEI-86150) — for AK, AKR, AKRU, AKT breakers
  await check('GEI-86150', ['ak-', 'akr', 'akru', 'akt-', 'top-seller-ge-akr'], 'GE AKR PDF ≠ product');

  // 10. Eaton NRX (mn01301003e) — for NRX, NF, RF frames
  await check('mn01301003e', ['nrx', '-nf-', '-rf-'], 'Eaton NRX PDF ≠ product');

  // 11. Siemens WL (s06-wl) — for WL air circuit breakers
  await check('s06-wl-power', ['-wl-', 'siemens-wl', 'etu-', 'top-seller-siemens-wl'], 'Siemens WL PDF ≠ product');

  // 12. Siemens RL (SGIM-3068D) — for RL and Allis-Chalmers LA/FA
  await check('SGIM-3068D', ['type-rl', '-rl-', 'allis-chalmers'], 'Siemens RL PDF ≠ product');

  // 13. Siemens 3WL (tech-kata-sentron-3wl) — for 3WL and Siemens MV breakers
  await check('tech-kata-sentron-3wl', ['3wl', 'gmsg', '3ah', 'siemens-gmsg', 'siemens-3ah'], 'Siemens 3WL PDF ≠ product');

  // 14. Eaton DS renewal (rb22B01te) — for DS/DSL renewal parts only
  await check('rb22B01te', ['ds-', 'dsl-', 'ds-dsl', 'ds-renewal', 'westinghouse-ds'], 'Eaton DS renewal PDF ≠ product');

  // 15. Digitrip 510 (il29005) — for Digitrip 510 and possibly other Digitrip
  await check('il29005', ['digitrip', 'amptector'], 'Digitrip 510 PDF ≠ product');

  // 16. Eaton NRX catalog (td013001en) — for NRX, VCP-W, vacuum breakers
  await check('td013001en', ['nrx', 'vcp', 'vacuum', '-nf-', '-rf-'], 'Eaton NRX catalog ≠ product');

  // 17. PXR guide (mz013001e) — only for PXR trip units on NRX frames
  await check('mz013001e', ['pxr', 'power-xpert'], 'PXR guide ≠ product');

  // 18. Eaton Magnum SB (ib2c12063h03) — for Magnum SB only
  await check('ib2c12063h03', ['magnum-sb', 'sbs6'], 'Eaton Magnum SB PDF ≠ product');

  // 19. Eaton DSII manual (ib694c694) — for DSII/DSLII
  await check('ib694c694', ['dsii', 'dslii', 'ds-ii', 'ds2'], 'Eaton DSII manual ≠ product');

  // Print results
  console.log(`=== MISMATCHED ENTRIES (${mismatches.length}) ===\n`);

  // Group by reason
  const groups: Record<string, Mismatch[]> = {};
  for (const m of mismatches) {
    if (!groups[m.reason]) groups[m.reason] = [];
    groups[m.reason].push(m);
  }

  for (const [reason, items] of Object.entries(groups).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`--- ${reason} (${items.length}) ---`);
    items.forEach(m => console.log(`  ${m.slug}`));
    console.log('');
  }

  console.log(`Total mismatches: ${mismatches.length}`);
}

main().catch(console.error);
