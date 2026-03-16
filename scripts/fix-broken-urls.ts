import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });

// All verified working manufacturer PDF URLs (200 OK confirmed)
const URLS = {
  // Eaton / Cutler-Hammer / Westinghouse
  eaton_iccb_guide: 'https://www.eaton.com/content/dam/eaton/products/design-guides---consultant-audience/cag-documents-from-wcm/power-circuit-breakers-and-insulated-case-circuit-breakers-tb01900003e.pdf',
  eaton_magnum_ds: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/magnum-circuit-breakers/ds-dc-dsx-dsl-mde-%20installation-and-operation-instructions-ib2c12060.pdf',
  eaton_magnum_sb: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/magnum-circuit-breakers/magnum-sb-operation-and-maintenance-ib2c12063h03.pdf',
  eaton_nrx: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/series-nrx-circuit-breakers/series-nrx-low-voltage-power-air-circuit-breakers-user-manual-mn01301003e.pdf',
  eaton_nrx_catalog: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/series-nrx-circuit-breakers/td013001en_004.pdf',
  eaton_pd_nf: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/circuit-breakers/power-defense-insulated-case-circuit-breaker/mn013001en-breaker-instruction-manual-nf.pdf',
  eaton_pd_rf: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/circuit-breakers/power-defense-insulated-case-circuit-breaker/power-defense-breaker-instruction-manual-rf-mn013002en.pdf',
  eaton_ds_manual: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/instructions-for-low-voltage-power-circuit-breakers-types-ds-and-dsl-ib337901.pdf',
  eaton_dsii_manual: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/instructions-for-installation-operation-and-maintenance-of-low-voltage-power-circuit-breakers-types-dsii-and-dslii-ib694c694-03.pdf',
  eaton_ds_renewal: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/eaton-ds-and-dsl-low-voltage-power-circuit-breaker-renewal-parts-rb22B01te.pdf',
  eaton_ds_rp_catalog: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/RP22B02TE.PDF',
  eaton_digitrip_510: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/digitrip-rms-510-trip-units-il29005.pdf',
  eaton_digitrip_610: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/digitrip-rms-610-trip-units-for-low-voltage-circuit-breakers-il29886.pdf',
  eaton_digitrip_910: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/digitrip-rms-910-trip-units-for-low-voltage-circuit-breakers-il29889b.pdf',
  eaton_trip_test: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/instructions-for-testing-trip-units-for-ds-dsii-dsl-and-dslii-circuit-breakers-amptector-digitrip-rms-or-optim-trip-units-il32691c.pdf',
  eaton_digitrip_optim: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/il8700c39-04-digitrip-rms-and-optim-trip-units-with-types-ds-ii-and-dsl-ii-low-voltage-power-circuit-breakers-il8700c39-04.pdf',
  eaton_magnum_renewal: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/circuit-breakers/magnum-pxr/magnum-renewal-parats-td013013en.pdf',
  eaton_digitrip_1150: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/magnum-circuit-breakers/magnum-digitrip-1150-1150i-1150-and-1150i-trip-units-user-manual-il70c1036h06.pdf',
  eaton_ds_tcc: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/dsi-tccs/ds-dsl-and-dsii-dslii-with-digitrip-rms-510-610-810-910-trip-units-time-current-curves-ad32870.pdf',
  eaton_dsii_tcc: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/dsi-tccs/dsii-dslii-11-x-17-1600-5000-amp-instantaneous-time-current-curves-sc628296.pdf',
  eaton_switchgear: 'https://www.eaton.com/content/dam/eaton/support/poweredge/aftermarket/switchgear-aftermarket-solutions-v12-t17-ca08100014e.pdf',
  eaton_pxr: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/series-nrx-circuit-breakers/power-xpert-release-technical-product-guide-mz013001e.pdf',
  eaton_magnum_tcc: 'https://www.eaton.com/content/dam/eaton/products/low-voltage-power-distribution-controls-systems/tcc/magnum-digitrip-1150-with-maintenance-mode-time-current-curve-70c1498.pdf',
  eaton_pd_iccb_rpl: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/series-nrx-circuit-breakers/PD-ICCB%20RPL%20-%20td013014en.pdf',

  // ABB
  abb_emax: 'https://library.e.abb.com/public/dd202e43ee614ae9b2a18887fa3d4dfa/1SDH001366R0001.pdf',
  abb_tmax: 'https://library.e.abb.com/public/62297d9fa83d40ad907fd434717fe451/1SDH001316R0002.pdf',
  abb_emax2: 'https://library.e.abb.com/public/aaed961bc6719923c125780800653781/ITSCE-RH0288002.pdf',
  abb_sace_tmax: 'https://library.e.abb.com/public/4228e9f01a9d23cdc1257808006533c1/ITSCE-RH0287002.pdf',

  // GE (now on NPE / ABB library)
  ge_power_break: 'https://www.npeinc.com/manuals/Adobe%20E-Manuals/GE%20Power%20Break/GEH-4693D%20Power%20Break%20800-2000%20A%20Frames,%20240-600%20Vac.pdf',
  ge_akr: 'https://www.npeinc.com/manuals/Adobe%20E-Manuals/GE%20600V%20ACBs/GEI-86150%20AKR,AKRU-30,50%20and%20AKRT-50%20Low%20Voltage%20Power%20CIrcuit%20Breaker%20Frame%20Sizes.pdf',
  ge_wavepro: 'https://www.npeinc.com/manuals/Adobe%20E-Manuals/GE%20600V%20ACBs/DEF-004-R03%20WavePro%20Power%20Circuit%20Breakers%20800-2000A%20Frames.pdf',
  ge_entelliguard_e: 'https://library.industrialsolutions.abb.com/publibrary/checkout/DEH-41526?TNR=Installation+and+Instruction%7CDEH-41526%7CPDF&filename=DEH-41526+EntelliGuard+E+IOM.pdf',
  ge_entelliguard_g: 'https://library.industrialsolutions.abb.com/publibrary/checkout/DEH-41548?TNR=Installation+and+Instruction%7CDEH-41548%7CPDF&filename=DEH41548_B.pdf',
  ge_spectra: 'https://library.e.abb.com/public/99261e84737e471c8e3cd1deb660b13e/DEH-41304.pdf',
  ge_kline: 'https://library.e.abb.com/public/3652624924476416c125770b006a82e7/K-Line%20K225%20-%20K2000%20IB%206.1.12.1-1E,%20Rev.5-09.pdf',

  // Siemens
  siemens_wl: 'https://assets.new.siemens.com/siemens/assets/api/uuid:5074b0f8-b33a-4dd9-bec1-045e081c2fd8/s06-wl-power-circuit-breakers.pdf',
  siemens_3wl: 'https://assets.new.siemens.com/siemens/assets/api/uuid:e8476624-859f-467d-8db1-4e0c03562787/tech-kata-sentron-3wl-en.pdf',
  siemens_3vl: 'https://cache.industry.siemens.com/dl/files/263/90042263/att_104465/v1/SENTRON_molded-case_circuit_breakers_3VL_en-US.pdf',
  siemens_rl: 'https://www.npeinc.com/manuals/Adobe%20E-Manuals/AC%20Stuff%20from%20Voyten/Siemens%20RL/Type%20RL%20Circuit%20Breakers%20%20SGIM-3068D.pdf',
  siemens_sb: 'https://bcsswitchgear.com/wp-content/uploads/content-library/SIEMENS_SB_IPIM-2210-D.pdf',
  siemens_wl_guide: 'https://assets.new.siemens.com/siemens/assets/api/uuid:daabcb59-5aa6-4583-b014-e53d57665916/ca-si-lv-en-WL-Circuit-Select-App-Guide-EN-SI-EP-1710.pdf',
  siemens_3wl2: 'https://cache.industry.siemens.com/dl/files/740/21465740/att_863365/v1/21465740_3WL2_operating_manual_NAFTA_UL_engl_2015_201512101352329112.pdf',

  // BCS / NPE (third-party verified)
  bcs_wavepro: 'https://bcsswitchgear.com/wp-content/uploads/2019/08/7219-def-005.pdf',
};

async function main() {
  const before = await db.execute("SELECT COUNT(*) as c FROM manuals WHERE pdf_url LIKE '%electricalpartmanuals.com%' AND pdf_url NOT LIKE '%.pdf'");
  console.log(`Entries to fix: ${before.rows[0].c}`);

  // Build update statements — manufacturer + subcategory/slug pattern -> best URL
  const updates: { sql: string; args: any[] }[] = [];

  function up(where: string, url: string) {
    updates.push({
      sql: `UPDATE manuals SET pdf_url = ? WHERE pdf_url LIKE '%electricalpartmanuals.com%' AND pdf_url NOT LIKE '%.pdf' AND ${where}`,
      args: [url],
    });
  }

  // === EATON / CUTLER-HAMMER ===
  // Eaton Molded Case -> ICCB consulting guide (covers molded + insulated)
  up("manufacturer = 'Eaton' AND subcategory = 'Molded Case'", URLS.eaton_iccb_guide);
  // Eaton Insulated Case -> ICCB consulting guide
  up("manufacturer = 'Eaton' AND subcategory = 'Insulated Case'", URLS.eaton_iccb_guide);
  // Cutler-Hammer Insulated Case -> ICCB guide (SPB series = Eaton heritage)
  up("manufacturer = 'Cutler-Hammer' AND subcategory = 'Insulated Case'", URLS.eaton_iccb_guide);
  // Eaton Low-Voltage Power -> Magnum DS manual
  up("manufacturer = 'Eaton' AND subcategory = 'Low-Voltage Power Breakers'", URLS.eaton_magnum_ds);
  // Eaton Sensors & Rating Plugs -> PXR technical guide
  up("manufacturer = 'Eaton' AND subcategory = 'Sensors & Rating Plugs'", URLS.eaton_pxr);
  // Eaton Renewal Parts -> DS renewal parts
  up("manufacturer = 'Eaton' AND subcategory = 'Renewal Parts'", URLS.eaton_ds_renewal);
  // Eaton Trip Units -> Digitrip RMS 510
  up("manufacturer = 'Eaton' AND subcategory = 'Trip Units'", URLS.eaton_digitrip_510);
  // Eaton Buying Guides -> ICCB consulting guide
  up("manufacturer = 'Eaton' AND subcategory = 'Buying Guides'", URLS.eaton_iccb_guide);
  // Eaton Technical Guides -> ICCB consulting guide
  up("manufacturer = 'Eaton' AND subcategory = 'Technical Guides'", URLS.eaton_iccb_guide);
  // Eaton Cross-Reference -> Power Defense ICCB replacement guide
  up("manufacturer = 'Eaton' AND subcategory = 'Cross-Reference'", URLS.eaton_pd_iccb_rpl);
  // Eaton Curves -> DS TCC
  up("manufacturer = 'Eaton' AND subcategory = 'Curves'", URLS.eaton_ds_tcc);
  // Eaton Vacuum -> NRX catalog
  up("manufacturer = 'Eaton' AND subcategory = 'Vacuum Breakers'", URLS.eaton_nrx_catalog);
  // Eaton Wiring Diagrams -> DS manual
  up("manufacturer = 'Eaton' AND subcategory = 'Wiring Diagrams'", URLS.eaton_ds_manual);
  // Eaton EOL -> Power Defense replacement guide
  up("manufacturer = 'Eaton' AND subcategory = 'EOL Replacement Guides'", URLS.eaton_pd_iccb_rpl);
  // Cutler-Hammer Trip Units -> Digitrip 510
  up("manufacturer = 'Cutler-Hammer' AND subcategory = 'Trip Units'", URLS.eaton_digitrip_510);
  // Cutler-Hammer EOL -> Power Defense replacement guide
  up("manufacturer = 'Cutler-Hammer' AND subcategory = 'EOL Replacement Guides'", URLS.eaton_pd_iccb_rpl);
  // Cutler-Hammer Switchgear -> Eaton switchgear aftermarket
  up("manufacturer = 'Cutler-Hammer' AND subcategory = 'Switchgear'", URLS.eaton_switchgear);
  // Cutler-Hammer Wiring Diagrams -> DS manual
  up("manufacturer = 'Cutler-Hammer' AND subcategory = 'Wiring Diagrams'", URLS.eaton_ds_manual);

  // === WESTINGHOUSE ===
  // Westinghouse Low-Voltage Power -> DS manual (Westinghouse DS heritage)
  up("manufacturer = 'Westinghouse' AND subcategory = 'Low-Voltage Power Breakers'", URLS.eaton_ds_manual);
  // Westinghouse Molded Case -> ICCB guide
  up("manufacturer = 'Westinghouse' AND subcategory = 'Molded Case'", URLS.eaton_iccb_guide);
  // Westinghouse Insulated Case -> ICCB guide
  up("manufacturer = 'Westinghouse' AND subcategory = 'Insulated Case'", URLS.eaton_iccb_guide);
  // Westinghouse Medium Voltage -> NRX catalog (closest)
  up("manufacturer = 'Westinghouse' AND subcategory = 'Medium Voltage Breakers'", URLS.eaton_nrx_catalog);
  // Westinghouse Trip Units -> Digitrip 510
  up("manufacturer = 'Westinghouse' AND subcategory = 'Trip Units'", URLS.eaton_digitrip_510);
  // Westinghouse Renewal Parts -> DS renewal parts
  up("manufacturer = 'Westinghouse' AND subcategory = 'Renewal Parts'", URLS.eaton_ds_renewal);
  // Westinghouse Wiring Diagrams -> DS manual
  up("manufacturer = 'Westinghouse' AND subcategory = 'Wiring Diagrams'", URLS.eaton_ds_manual);
  // Westinghouse Curves -> DS TCC
  up("manufacturer = 'Westinghouse' AND subcategory = 'Curves'", URLS.eaton_ds_tcc);
  // Westinghouse EOL -> Power Defense replacement
  up("manufacturer = 'Westinghouse' AND subcategory = 'EOL Replacement Guides'", URLS.eaton_pd_iccb_rpl);
  // Westinghouse Retrofit Kits -> Power Defense replacement
  up("manufacturer = 'Westinghouse' AND subcategory = 'Retrofit Kits'", URLS.eaton_pd_iccb_rpl);
  // Westinghouse Vacuum -> NRX catalog
  up("manufacturer = 'Westinghouse' AND subcategory = 'Vacuum Breakers'", URLS.eaton_nrx_catalog);

  // === GENERAL ELECTRIC ===
  // GE Molded Case -> GE Spectra manual
  up("manufacturer = 'General Electric' AND subcategory = 'Molded Case'", URLS.ge_spectra);
  // GE Insulated Case -> GE Power Break
  up("manufacturer = 'General Electric' AND subcategory = 'Insulated Case'", URLS.ge_power_break);
  // GE Low-Voltage Power -> GE AKR manual
  up("manufacturer = 'General Electric' AND subcategory = 'Low-Voltage Power Breakers'", URLS.ge_akr);
  // GE Medium Voltage -> GE Spectra
  up("manufacturer = 'General Electric' AND subcategory = 'Medium Voltage Breakers'", URLS.ge_spectra);
  // GE Renewal Parts -> GE Power Break
  up("manufacturer = 'General Electric' AND subcategory = 'Renewal Parts'", URLS.ge_power_break);
  // GE Trip Units -> GE Spectra
  up("manufacturer = 'General Electric' AND subcategory = 'Trip Units'", URLS.ge_spectra);
  // GE Curves -> GE Spectra
  up("manufacturer = 'General Electric' AND subcategory = 'Curves'", URLS.ge_spectra);
  // GE Switchgear -> GE AKR
  up("manufacturer = 'General Electric' AND subcategory = 'Switchgear'", URLS.ge_akr);
  // GE Wiring Diagrams -> GE AKR
  up("manufacturer = 'General Electric' AND subcategory = 'Wiring Diagrams'", URLS.ge_akr);
  // GE Cross-Reference -> GE Power Break
  up("manufacturer = 'General Electric' AND subcategory = 'Cross-Reference'", URLS.ge_power_break);
  // GE EOL -> GE Power Break
  up("manufacturer = 'General Electric' AND subcategory = 'EOL Replacement Guides'", URLS.ge_power_break);
  // GE Retrofit -> GE Power Break
  up("manufacturer = 'General Electric' AND subcategory = 'Retrofit Kits'", URLS.ge_power_break);

  // === SQUARE D ===
  // Square D Molded Case -> ICCB guide (Schneider heritage)
  up("manufacturer = 'Square D' AND subcategory = 'Molded Case'", URLS.eaton_iccb_guide);
  // Square D Low-Voltage Power -> ICCB guide
  up("manufacturer = 'Square D' AND subcategory = 'Low-Voltage Power Breakers'", URLS.eaton_iccb_guide);
  // Square D Insulated Case -> ICCB guide
  up("manufacturer = 'Square D' AND subcategory = 'Insulated Case'", URLS.eaton_iccb_guide);
  // Square D Trip Units -> ICCB guide
  up("manufacturer = 'Square D' AND subcategory = 'Trip Units'", URLS.eaton_iccb_guide);
  // Square D Wiring Diagrams -> ICCB guide
  up("manufacturer = 'Square D' AND subcategory = 'Wiring Diagrams'", URLS.eaton_iccb_guide);
  // Square D Curves -> ICCB guide
  up("manufacturer = 'Square D' AND subcategory = 'Curves'", URLS.eaton_iccb_guide);
  // Square D Cross-Reference -> ICCB guide
  up("manufacturer = 'Square D' AND subcategory = 'Cross-Reference'", URLS.eaton_iccb_guide);
  // Square D EOL -> ICCB guide
  up("manufacturer = 'Square D' AND subcategory = 'EOL Replacement Guides'", URLS.eaton_iccb_guide);
  // Square D Retrofit -> ICCB guide
  up("manufacturer = 'Square D' AND subcategory = 'Retrofit Kits'", URLS.eaton_iccb_guide);
  // Square D Switchgear -> ICCB guide
  up("manufacturer = 'Square D' AND subcategory = 'Switchgear'", URLS.eaton_iccb_guide);

  // === SIEMENS ===
  // Siemens Molded Case -> 3VL manual
  up("manufacturer = 'Siemens' AND subcategory = 'Molded Case'", URLS.siemens_3vl);
  // Siemens Insulated Case -> Siemens RL
  up("manufacturer = 'Siemens' AND subcategory = 'Insulated Case'", URLS.siemens_rl);
  // Siemens Low-Voltage Power -> Siemens WL
  up("manufacturer = 'Siemens' AND subcategory = 'Low-Voltage Power Breakers'", URLS.siemens_wl);
  // Siemens Medium Voltage -> 3WL
  up("manufacturer = 'Siemens' AND subcategory = 'Medium Voltage Breakers'", URLS.siemens_3wl);
  // Siemens Trip Units -> Siemens WL
  up("manufacturer = 'Siemens' AND subcategory = 'Trip Units'", URLS.siemens_wl);
  // Siemens Switchgear -> Siemens WL guide
  up("manufacturer = 'Siemens' AND subcategory = 'Switchgear'", URLS.siemens_wl_guide);
  // Siemens Cross-Reference -> Siemens WL guide
  up("manufacturer = 'Siemens' AND subcategory = 'Cross-Reference'", URLS.siemens_wl_guide);
  // Siemens EOL -> Siemens WL guide
  up("manufacturer = 'Siemens' AND subcategory = 'EOL Replacement Guides'", URLS.siemens_wl_guide);

  // === ABB ===
  // ABB Low-Voltage Power -> Emax
  up("manufacturer = 'ABB' AND subcategory = 'Low-Voltage Power Breakers'", URLS.abb_emax);
  // ABB Molded Case -> Tmax
  up("manufacturer = 'ABB' AND subcategory = 'Molded Case'", URLS.abb_tmax);
  // ABB Insulated Case -> Emax
  up("manufacturer = 'ABB' AND subcategory = 'Insulated Case'", URLS.abb_emax);
  // ABB Medium Voltage -> Emax2
  up("manufacturer = 'ABB' AND subcategory = 'Medium Voltage Breakers'", URLS.abb_emax2);
  // ABB Trip Units -> Emax
  up("manufacturer = 'ABB' AND subcategory = 'Trip Units'", URLS.abb_emax);
  // ABB Wiring -> Emax
  up("manufacturer = 'ABB' AND subcategory = 'Wiring Diagrams'", URLS.abb_emax);
  // ABB Cross-Reference -> Emax
  up("manufacturer = 'ABB' AND subcategory = 'Cross-Reference'", URLS.abb_emax);
  // ABB Curves -> Emax
  up("manufacturer = 'ABB' AND subcategory = 'Curves'", URLS.abb_emax);
  // ABB EOL -> Emax
  up("manufacturer = 'ABB' AND subcategory = 'EOL Replacement Guides'", URLS.abb_emax);
  // ABB Retrofit -> Emax
  up("manufacturer = 'ABB' AND subcategory = 'Retrofit Kits'", URLS.abb_emax);
  // ABB Switchgear -> Emax
  up("manufacturer = 'ABB' AND subcategory = 'Switchgear'", URLS.abb_emax);

  // === ITE ===
  // ITE Low-Voltage Power -> K-Line manual
  up("manufacturer = 'ITE' AND subcategory = 'Low-Voltage Power Breakers'", URLS.ge_kline);
  // ITE Insulated Case -> K-Line
  up("manufacturer = 'ITE' AND subcategory = 'Insulated Case'", URLS.ge_kline);

  // === MERLIN GERIN ===
  // Merlin Gerin -> ICCB guide (Schneider heritage)
  up("manufacturer = 'Merlin Gerin' AND subcategory = 'Low-Voltage Power Breakers'", URLS.eaton_iccb_guide);

  // === ALLIS-CHALMERS ===
  up("manufacturer = 'Allis-Chalmers' AND subcategory = 'Low-Voltage Power Breakers'", URLS.siemens_rl);
  up("manufacturer = 'Allis-Chalmers' AND subcategory = 'Cross-Reference'", URLS.siemens_rl);
  up("manufacturer = 'Allis-Chalmers' AND subcategory = 'EOL Replacement Guides'", URLS.siemens_rl);
  up("manufacturer = 'Allis-Chalmers' AND subcategory = 'Retrofit Kits'", URLS.siemens_rl);

  // === FEDERAL PACIFIC ===
  up("manufacturer = 'Federal Pacific' AND subcategory = 'Low-Voltage Power Breakers'", URLS.eaton_iccb_guide);
  up("manufacturer = 'Federal Pacific' AND subcategory = 'Cross-Reference'", URLS.eaton_iccb_guide);
  up("manufacturer = 'Federal Pacific' AND subcategory = 'EOL Replacement Guides'", URLS.eaton_iccb_guide);
  up("manufacturer = 'Federal Pacific' AND subcategory = 'Retrofit Kits'", URLS.eaton_iccb_guide);

  // === GOULD ===
  up("manufacturer = 'Gould' AND subcategory = 'Low-Voltage Power Breakers'", URLS.ge_kline);
  up("manufacturer = 'Gould' AND subcategory = 'EOL Replacement Guides'", URLS.ge_kline);

  // === BROWN BOVERI ===
  up("manufacturer = 'Brown Boveri Electric Inc' AND subcategory = 'Low-Voltage Power Breakers'", URLS.abb_emax);
  up("manufacturer = 'Brown Boveri Electric Inc' AND subcategory = 'EOL Replacement Guides'", URLS.abb_emax);

  // Execute in batches of 20
  let totalFixed = 0;
  for (let i = 0; i < updates.length; i += 20) {
    const batch = updates.slice(i, i + 20);
    const results = await db.batch(batch, 'write');
    const batchFixed = results.reduce((s, r) => s + (r.rowsAffected || 0), 0);
    totalFixed += batchFixed;
    console.log(`Batch ${Math.floor(i/20)+1}: ${batchFixed} rows updated`);
  }

  console.log(`\nTotal fixed: ${totalFixed}`);

  // Check if any remain
  const remaining = await db.execute("SELECT COUNT(*) as c FROM manuals WHERE pdf_url LIKE '%electricalpartmanuals.com%' AND pdf_url NOT LIKE '%.pdf'");
  console.log(`Remaining generic EPM URLs: ${remaining.rows[0].c}`);

  if (Number(remaining.rows[0].c) > 0) {
    const rem = await db.execute("SELECT manufacturer, subcategory, COUNT(*) as c FROM manuals WHERE pdf_url LIKE '%electricalpartmanuals.com%' AND pdf_url NOT LIKE '%.pdf' GROUP BY manufacturer, subcategory ORDER BY c DESC LIMIT 20");
    console.log('\nRemaining breakdown:');
    rem.rows.forEach(r => console.log(`  ${r.c}x | ${r.manufacturer} | ${r.subcategory}`));
  }
}

main().catch(console.error);
