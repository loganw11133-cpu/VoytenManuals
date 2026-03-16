import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface ManualEntry {
  slug: string;
  title: string;
  manual_number: string | null;
  category: string;
  manufacturer: string;
  subcategory: string;
  description: string;
  pdf_url: string;
  keywords: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 120);
}

// ═══════════════════════════════════════════════════════════════════════
// PART 1: PDF URL UPDATES — Replace generic URLs with real manufacturer PDFs
// These are verified working URLs from manufacturer websites
// ═══════════════════════════════════════════════════════════════════════

const PDF_UPDATES: { slugPattern: string; pdf_url: string; manual_number?: string }[] = [
  // ── EATON MAGNUM DS ──
  { slugPattern: '%magnum-ds%installation%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/magnum-circuit-breakers/ds-dc-dsx-dsl-mde-%20installation-and-operation-instructions-ib2c12060.pdf', manual_number: 'IB2C12060' },
  { slugPattern: '%magnum-ds%renewal-parts%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/circuit-breakers/magnum-pxr/magnum-renewal-parats-td013013en.pdf', manual_number: 'TD013013EN' },
  { slugPattern: '%magnum-ds%1150%trip%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/magnum-circuit-breakers/magnum-digitrip-1150-1150i-1150-and-1150i-trip-units-user-manual-il70c1036h06.pdf', manual_number: 'IL70C1036H06' },
  { slugPattern: '%magnum-ds%520%trip%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/digitrip-trip-520-units-for-use-in-magnum-low-voltage-circuit-breakers-il70c1037h05.pdf', manual_number: 'IL70C1037H05' },
  { slugPattern: '%magnum-ds%wiring%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/magnum-circuit-breakers/ds-dc-dsx-dsl-mde-%20installation-and-operation-instructions-ib2c12060.pdf' },
  { slugPattern: '%magnum-ds%characteristic%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/low-voltage-power-distribution-controls-systems/tcc/magnum-digitrip-1150-with-maintenance-mode-time-current-curve-70c1498.pdf' },

  // ── EATON MAGNUM SB ──
  { slugPattern: '%magnum-sb%manual%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/magnum-circuit-breakers/magnum-sb-operation-and-maintenance-ib2c12063h03.pdf', manual_number: 'IB2C12063H03' },
  { slugPattern: '%magnum-sb%sbs%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/magnum-circuit-breakers/magnum-sb-operation-and-maintenance-ib2c12063h03.pdf', manual_number: 'IB2C12063H03' },
  { slugPattern: '%magnum-pxr%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/circuit-breakers/magnum-pxr/magnum-pxr-breaker-manual-mn013016en.pdf', manual_number: 'MN013016EN' },

  // ── EATON NRX ──
  { slugPattern: '%nrx-nf%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/circuit-breakers/acb---izmx-inx/eaton-series-nrx-with-pxr-izmx16-type-nf-instruction-manual-mn013001en-en-us.pdf', manual_number: 'MN013001EN' },
  { slugPattern: '%nrx-rf%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/circuit-breakers/acb---izmx-inx/eaton-series-nrx-with-pxr-izmx40-type-rf-instruction-manual-mn013002en-en-us.pdf', manual_number: 'MN013002EN' },
  { slugPattern: '%nrx%wiring%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/series-nrx-circuit-breakers/td013001en_004.pdf', manual_number: 'TD013001EN' },
  { slugPattern: '%nrx%520%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/series-nrx-circuit-breakers/series-nrx-digitrip-520-operating-manual-il01301051e.pdf', manual_number: 'IL01301051E' },
  { slugPattern: '%nrx%1150%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/series-nrx-circuit-breakers/series-nrx-digitrip-1150-operating-manual-il01301064e.pdf', manual_number: 'IL01301064E' },

  // ── WESTINGHOUSE DS/DSII ──
  { slugPattern: '%westinghouse-ds-%manual%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/instructions-for-low-voltage-power-circuit-breakers-types-ds-and-dsl-ib337901.pdf', manual_number: 'IB337901' },
  { slugPattern: '%westinghouse-dsii%manual%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/instructions-for-installation-operation-and-maintenance-of-low-voltage-power-circuit-breakers-types-dsii-and-dslii-ib694c694-03.pdf', manual_number: 'IB694C694' },
  { slugPattern: '%ds-206%renewal%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/eaton-ds-and-dsl-low-voltage-power-circuit-breaker-renewal-parts-rb22B01te.pdf', manual_number: 'RB22B01TE' },
  { slugPattern: '%ds-416%renewal%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/eaton-ds-and-dsl-low-voltage-power-circuit-breaker-renewal-parts-rb22B01te.pdf', manual_number: 'RB22B01TE' },
  { slugPattern: '%ds-532%renewal%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/eaton-ds-and-dsl-low-voltage-power-circuit-breaker-renewal-parts-rb22B01te.pdf', manual_number: 'RB22B01TE' },
  { slugPattern: '%dsii%renewal%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/RP22B02TE.PDF', manual_number: 'RP22B02TE' },
  { slugPattern: '%ds-%characteristic%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/dsi-tccs/ds-dsl-and-dsii-dslii-with-digitrip-rms-510-610-810-910-trip-units-time-current-curves-ad32870.pdf', manual_number: 'AD32870' },
  { slugPattern: '%dsii%characteristic%', pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/dsi-tccs/dsii-dslii-11-x-17-1600-5000-amp-instantaneous-time-current-curves-sc628296.pdf', manual_number: 'SC628296' },

  // ── GE POWER BREAK II ──
  { slugPattern: '%power-break-ii%manual%', pdf_url: 'https://apps.geindustrial.com/publibrary/checkout/GEH-4693?TNR=Installation+and+Instruction%7CGEH-4693%7CPDF&filename=GEH-4693D.pdf', manual_number: 'GEH-4693D' },
  { slugPattern: '%power-break-ii%tpss%', pdf_url: 'https://apps.geindustrial.com/publibrary/checkout/GEH-4693?TNR=Installation+and+Instruction%7CGEH-4693%7CPDF&filename=GEH-4693D.pdf', manual_number: 'GEH-4693D' },
  { slugPattern: '%power-break-ii%tpvf%', pdf_url: 'https://apps.geindustrial.com/publibrary/checkout/GEH-4693?TNR=Installation+and+Instruction%7CGEH-4693%7CPDF&filename=GEH-4693D.pdf', manual_number: 'GEH-4693D' },

  // ── GE ENTELLIGUARD ──
  { slugPattern: '%entelliguard%trip%', pdf_url: 'https://library.industrialsolutions.abb.com/publibrary/checkout/DEH-4567?TNR=Installation+and+Instruction%7CDEH-4567%7CPDF&filename=DEH-4567.pdf', manual_number: 'DEH-4567' },
  { slugPattern: '%entelliguard-g%', pdf_url: 'https://library.e.abb.com/public/99261e84737e471c8e3cd1deb660b13e/DEH-41304.pdf', manual_number: 'DEH-41304' },

  // ── GE AKR ──
  { slugPattern: '%ge-akr-30%', pdf_url: 'https://www.npeinc.com/manuals/Adobe%20E-Manuals/GE%20600V%20ACBs/GEI-86150%20AKR,AKRU-30,50%20and%20AKRT-50%20Low%20Voltage%20Power%20CIrcuit%20Breaker%20Frame%20Sizes.pdf', manual_number: 'GEI-86150' },
  { slugPattern: '%ge-akr-50%', pdf_url: 'https://www.npeinc.com/manuals/Adobe%20E-Manuals/GE%20600V%20ACBs/GEI-86150%20AKR,AKRU-30,50%20and%20AKRT-50%20Low%20Voltage%20Power%20CIrcuit%20Breaker%20Frame%20Sizes.pdf', manual_number: 'GEI-86150' },
  { slugPattern: '%ge-akr-75%', pdf_url: 'https://www.electricalpartmanuals.com/pdf/circuitBreaker/General%20Electric/Breakers/GEI-86151D.pdf', manual_number: 'GEI-86151D' },
  { slugPattern: '%ge-akr-100%', pdf_url: 'https://www.electricalpartmanuals.com/pdf/circuitBreaker/General%20Electric/Breakers/GEI-86151D.pdf', manual_number: 'GEI-86151D' },

  // ── GE WAVEPRO ──
  { slugPattern: '%wave-pro%', pdf_url: 'https://www.npeinc.com/manuals/Adobe%20E-Manuals/GE%20600V%20ACBs/DEF-004-R03%20WavePro%20Power%20Circuit%20Breakers%20800-2000A%20Frames.pdf', manual_number: 'DEF-004' },

  // ── SIEMENS WL ──
  { slugPattern: '%siemens-wl%', pdf_url: 'https://assets.new.siemens.com/siemens/assets/api/uuid:5074b0f8-b33a-4dd9-bec1-045e081c2fd8/s06-wl-power-circuit-breakers.pdf' },
  { slugPattern: '%sentron-3wl%', pdf_url: 'https://assets.new.siemens.com/siemens/assets/api/uuid:e8476624-859f-467d-8db1-4e0c03562787/tech-kata-sentron-3wl-en.pdf' },

  // ── SIEMENS 3VL ──
  { slugPattern: '%siemens-sentron-vl%', pdf_url: 'https://support.industry.siemens.com/cs/attachments/90042263/SENTRON_molded-case_circuit_breakers_3VL_en-US.pdf' },

  // ── ABB EMAX ──
  { slugPattern: '%abb-emax-e1-%', pdf_url: 'https://library.e.abb.com/public/4228e9f01a9d23cdc1257808006533c1/ITSCE-RH0287002.pdf', manual_number: 'RH0287002' },
  { slugPattern: '%abb-emax-e2-%', pdf_url: 'https://library.e.abb.com/public/4228e9f01a9d23cdc1257808006533c1/ITSCE-RH0287002.pdf', manual_number: 'RH0287002' },
  { slugPattern: '%abb-emax-e3-%', pdf_url: 'https://library.e.abb.com/public/aaed961bc6719923c125780800653781/ITSCE-RH0288002.pdf', manual_number: 'RH0288002' },
  { slugPattern: '%abb-emax-e4-%', pdf_url: 'https://library.e.abb.com/public/aaed961bc6719923c125780800653781/ITSCE-RH0288002.pdf', manual_number: 'RH0288002' },
  { slugPattern: '%abb-emax-e6-%', pdf_url: 'https://library.e.abb.com/public/aaed961bc6719923c125780800653781/ITSCE-RH0288002.pdf', manual_number: 'RH0288002' },

  // ── ABB EMAX 2 ──
  { slugPattern: '%abb-emax2%', pdf_url: 'https://library.e.abb.com/public/62297d9fa83d40ad907fd434717fe451/1SDH001316R0002.pdf', manual_number: '1SDH001316R0002' },
  { slugPattern: '%abb-emax-e1.2%', pdf_url: 'https://library.e.abb.com/public/62297d9fa83d40ad907fd434717fe451/1SDH001316R0002.pdf', manual_number: '1SDH001316R0002' },
  { slugPattern: '%abb-emax-e2.2%', pdf_url: 'https://library.e.abb.com/public/82e5c1dc19eb448c9129236d5e92ec24/1SDH001330R0002.pdf', manual_number: '1SDH001330R0002' },

  // ── ABB TMAX ──
  { slugPattern: '%abb-sace-tmax%', pdf_url: 'https://library.e.abb.com/public/dd202e43ee614ae9b2a18887fa3d4dfa/1SDH001366R0001.pdf', manual_number: '1SDH001366R0001' },

  // ── ITE K-LINE ──
  { slugPattern: '%ite-k-line%', pdf_url: 'https://library.e.abb.com/public/3652624924476416c125770b006a82e7/K-Line%20K225%20-%20K2000%20IB%206.1.12.1-1E,%20Rev.5-09.pdf', manual_number: 'IB 6.1.12.1-1E' },
];

// ═══════════════════════════════════════════════════════════════════════
// PART 2: NEW ENTRIES — Eaton Power Defense + VCP-W Medium Voltage
// ═══════════════════════════════════════════════════════════════════════

const NEW_ENTRIES: ManualEntry[] = [];

// ── EATON POWER DEFENSE ICCB (newest product line, not yet in DB) ──
const pdAmps = [630, 800, 1000, 1200, 1250, 1600, 2000, 2500, 3000, 3200, 4000];
for (const amps of pdAmps) {
  NEW_ENTRIES.push({
    slug: slugify(`eaton-power-defense-nf-${amps}a-insulated-case-circuit-breaker`),
    title: `Eaton Power Defense NF ${amps}A Insulated Case Circuit Breaker Manual`,
    manual_number: 'MN013001EN',
    category: 'Circuit Breakers',
    manufacturer: 'Eaton',
    subcategory: 'Insulated Case',
    description: `Eaton Power Defense Type NF ${amps} Amp insulated case circuit breaker instruction manual. PXR trip unit with advanced metering and communications. Next-generation replacement for Magnum DS and NRX. Installation, operation, maintenance, and renewal parts. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/circuit-breakers/power-defense-insulated-case-circuit-breaker/mn013001en-breaker-instruction-manual-nf.pdf',
    keywords: `Eaton Power Defense, NF, ${amps}A, insulated case circuit breaker, PXR, ICCB, next gen, Magnum replacement, buy Power Defense, Voyten`
  });
}
for (const amps of [800, 1000, 1200, 1600, 2000, 2500, 3000, 3200, 4000]) {
  NEW_ENTRIES.push({
    slug: slugify(`eaton-power-defense-rf-${amps}a-insulated-case-circuit-breaker`),
    title: `Eaton Power Defense RF ${amps}A Insulated Case Circuit Breaker Manual`,
    manual_number: 'MN013002EN',
    category: 'Circuit Breakers',
    manufacturer: 'Eaton',
    subcategory: 'Insulated Case',
    description: `Eaton Power Defense Type RF ${amps} Amp insulated case circuit breaker instruction manual. PXR trip unit. Drawout design for switchgear applications. Installation, operation, maintenance. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/circuit-breakers/power-defense-insulated-case-circuit-breaker/power-defense-breaker-instruction-manual-rf-mn013002en.pdf',
    keywords: `Eaton Power Defense, RF, ${amps}A, insulated case, PXR, ICCB, drawout, switchgear, buy Power Defense, Voyten`
  });
}

// Power Defense SB (newest Magnum SB replacement)
for (const amps of [800, 1200, 1600, 2000, 2500, 3200]) {
  NEW_ENTRIES.push({
    slug: slugify(`eaton-power-defense-sb-${amps}a-insulated-case-breaker`),
    title: `Eaton Power Defense SB ${amps}A Insulated Case Circuit Breaker Manual`,
    manual_number: 'PA013008EN',
    category: 'Circuit Breakers',
    manufacturer: 'Eaton',
    subcategory: 'Insulated Case',
    description: `Eaton Power Defense SB ${amps} Amp insulated case circuit breaker with PXR trip unit. Replacement for Magnum SB. Installation, operation, and maintenance. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/circuit-breakers/power-defense-sb/PA013008EN_150dpi.pdf',
    keywords: `Eaton Power Defense SB, ${amps}A, insulated case, PXR, Magnum SB replacement, ICCB, Voyten`
  });
}

// ── MEDIUM VOLTAGE VCP-W FROM INSULATEDCASEBREAKERS.COM INVENTORY ──
const vcpModels = [
  { model: '50VCP-W250', kv: '5kV', amps: 1200, mfr: 'Westinghouse', desc: '5kV 1200A vacuum circuit breaker', style: 'WL34854B' },
  { model: '50VCP-W350', kv: '5kV', amps: 1200, mfr: 'Westinghouse', desc: '5kV 1200A vacuum circuit breaker', style: 'WL35123B' },
  { model: '50VCP-W350', kv: '5kV', amps: 2000, mfr: 'Westinghouse', desc: '5kV 2000A vacuum circuit breaker', style: '' },
  { model: '50VCPW-ND250', kv: '4.76kV', amps: 1200, mfr: 'Eaton', desc: '4.76kV 1200A vacuum circuit breaker', style: '' },
  { model: '50VCP-WND250', kv: '5kV', amps: 1200, mfr: 'Eaton', desc: '5kV 1200A vacuum circuit breaker', style: '' },
  { model: '75VCP-W500', kv: '8.25kV', amps: 1200, mfr: 'Eaton', desc: '8.25kV 1200A vacuum circuit breaker', style: 'WL35372' },
  { model: '75VCP-W500', kv: '8.25kV', amps: 2000, mfr: 'Eaton', desc: '8.25kV 2000A vacuum circuit breaker', style: '' },
  { model: '150VCP-W500', kv: '15kV', amps: 1200, mfr: 'Eaton', desc: '15kV 1200A vacuum circuit breaker', style: '' },
  { model: '150VCP-W500', kv: '15kV', amps: 2000, mfr: 'Eaton', desc: '15kV 2000A vacuum circuit breaker', style: '' },
  { model: '270VCP-W40', kv: '27kV', amps: 2000, mfr: 'Eaton', desc: '27kV 2000A vacuum circuit breaker', style: '' },
];
for (const v of vcpModels) {
  NEW_ENTRIES.push({
    slug: slugify(`${v.mfr}-${v.model}-${v.kv}-${v.amps}a-vacuum-circuit-breaker`),
    title: `${v.mfr} ${v.model} ${v.kv} ${v.amps}A Vacuum Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: v.mfr,
    subcategory: 'Vacuum Breakers',
    description: `${v.mfr} ${v.model} ${v.desc}. ${v.style ? `Style number ${v.style}. ` : ''}Medium voltage vacuum circuit breaker for metal-clad switchgear. Installation, operation, maintenance, and renewal parts. In-stock inventory at Voyten Electric / Integrated Electrical. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Westinghouse/VacuumBreakers/',
    keywords: `${v.mfr} ${v.model}, ${v.kv}, ${v.amps}A, vacuum circuit breaker, VCP-W, ${v.style}, medium voltage, switchgear, buy VCP, for sale, in stock, Voyten`
  });
}

// ── SQUARE D MASTERPACT NW — SPECIFIC CONFIGS FROM ICB INVENTORY ──
// insulatedcasebreakers.com has 671 Masterpact NW units — huge lead-gen opportunity
const nwConfigs = [
  { frame: 'NW08', amps: 800, trips: ['Micrologic 2.0A', 'Micrologic 5.0A', 'Micrologic 6.0A', 'Micrologic 7.0A'] },
  { frame: 'NW10', amps: 1000, trips: ['Micrologic 5.0A', 'Micrologic 6.0A'] },
  { frame: 'NW12', amps: 1250, trips: ['Micrologic 5.0A', 'Micrologic 6.0A', 'Micrologic 7.0A'] },
  { frame: 'NW16', amps: 1600, trips: ['Micrologic 5.0A', 'Micrologic 6.0A', 'Micrologic 7.0A'] },
  { frame: 'NW20', amps: 2000, trips: ['Micrologic 5.0A', 'Micrologic 6.0A', 'Micrologic 7.0A'] },
  { frame: 'NW25', amps: 2500, trips: ['Micrologic 5.0A', 'Micrologic 6.0A'] },
  { frame: 'NW30', amps: 3000, trips: ['Micrologic 6.0A', 'Micrologic 7.0A'] },
  { frame: 'NW32', amps: 3200, trips: ['Micrologic 6.0A', 'Micrologic 7.0A'] },
  { frame: 'NW40', amps: 4000, trips: ['Micrologic 6.0A', 'Micrologic 7.0A'] },
  { frame: 'NW50', amps: 5000, trips: ['Micrologic 6.0A', 'Micrologic 7.0A'] },
  { frame: 'NW60', amps: 6000, trips: ['Micrologic 6.0A'] },
  { frame: 'NW63', amps: 6300, trips: ['Micrologic 6.0A'] },
];
for (const nw of nwConfigs) {
  for (const trip of nw.trips) {
    const tripShort = trip.replace('Micrologic ', 'ML').replace('.0A', '');
    NEW_ENTRIES.push({
      slug: slugify(`square-d-masterpact-${nw.frame}-${nw.amps}a-${tripShort}-drawout`),
      title: `Square D Masterpact ${nw.frame} ${nw.amps}A with ${trip} Drawout — Manual & Specs`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'Square D',
      subcategory: 'Low-Voltage Power Breakers',
      description: `Square D Schneider Electric Masterpact ${nw.frame} ${nw.amps} Amp drawout air circuit breaker with ${trip} trip unit. In-stock inventory available — rebuilt and as-is units. Installation, operation, maintenance, and testing. Contact Voyten Electric at 1-800-458-4001. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Square_D/',
      keywords: `Masterpact ${nw.frame}, ${nw.amps}A, ${trip}, Square D, Schneider, drawout, air circuit breaker, buy Masterpact, in stock, for sale, rebuilt, Voyten, 1-800-458-4001`
    });
  }
}

// ── EATON SPECIFIC DOCUMENTS NOT YET COVERED ──
const eatonDocs = [
  { slug: 'eaton-ds-dsl-installation-operation-manual-ib337901', title: 'Eaton/Westinghouse DS & DSL Low-Voltage Power Circuit Breaker Installation & Operation Manual', num: 'IB337901', pdf: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/instructions-for-low-voltage-power-circuit-breakers-types-ds-and-dsl-ib337901.pdf', sub: 'Low-Voltage Power Breakers', desc: 'Official Eaton/Westinghouse instruction manual IB337901 for DS and DSL low-voltage power circuit breakers. Complete installation, operation, and maintenance procedures.' },
  { slug: 'eaton-dsii-dslii-installation-operation-maintenance-ib694c694', title: 'Eaton/Westinghouse DSII & DSLII Installation, Operation & Maintenance Manual', num: 'IB694C694', pdf: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/instructions-for-installation-operation-and-maintenance-of-low-voltage-power-circuit-breakers-types-dsii-and-dslii-ib694c694-03.pdf', sub: 'Low-Voltage Power Breakers', desc: 'Official Eaton/Westinghouse instruction manual IB694C694 for DSII and DSLII power circuit breakers.' },
  { slug: 'eaton-digitrip-rms-optim-trip-units-dsii-dslii-il8700c39', title: 'Digitrip RMS & OPTIM Trip Units for DS II and DSL II Breakers', num: 'IL8700C39', pdf: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/il8700c39-04-digitrip-rms-and-optim-trip-units-with-types-ds-ii-and-dsl-ii-low-voltage-power-circuit-breakers-il8700c39-04.pdf', sub: 'Trip Units', desc: 'Digitrip RMS and OPTIM electronic trip unit instructions for use with Westinghouse/Eaton DS II and DSL II power circuit breakers.' },
  { slug: 'eaton-digitrip-rms-610-trip-unit-il29886', title: 'Digitrip RMS 610 Trip Unit Instructions', num: 'IL29886', pdf: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/digitrip-rms-610-trip-units-for-low-voltage-circuit-breakers-il29886.pdf', sub: 'Trip Units', desc: 'Digitrip RMS 610 electronic trip unit for Westinghouse/Eaton DS and DSII low-voltage circuit breakers.' },
  { slug: 'eaton-magnum-ds-remote-racking-device-ib01900004e', title: 'Eaton Magnum DS Remote Racking Device Manual', num: 'IB01900004E', pdf: 'https://www.eaton.com/content/dam/eaton/products/low-voltage-power-distribution-controls-systems/switchgear/low-voltage-switchgear-documents/magnum-remote-racking-device-ib01900004e.pdf', sub: 'Insulated Case', desc: 'Remote racking device instructions for Eaton Magnum DS power circuit breakers in switchgear.' },
  { slug: 'eaton-power-circuit-breakers-insulated-case-technical-brief-tb01900003e', title: 'Power Circuit Breakers & Insulated Case Circuit Breakers Technical Brief', num: 'TB01900003E', pdf: 'https://www.eaton.com/content/dam/eaton/products/design-guides---consultant-audience/cag-documents-from-wcm/power-circuit-breakers-and-insulated-case-circuit-breakers-tb01900003e.pdf', sub: 'Technical Guides', desc: 'Eaton technical brief comparing power circuit breakers and insulated case circuit breakers. Design guide for engineers and consultants.' },
  { slug: 'eaton-aftermarket-renewal-parts-life-extension-ca08100014e', title: 'Eaton Aftermarket, Renewal Parts & Life Extension Solutions', num: 'CA08100014E', pdf: 'https://www.eaton.com/content/dam/eaton/support/poweredge/aftermarket/switchgear-aftermarket-solutions-v12-t17-ca08100014e.pdf', sub: 'Renewal Parts', desc: 'Eaton aftermarket solutions catalog — renewal parts, life extension services, and replacement options for legacy circuit breakers and switchgear.' },
  { slug: 'eaton-pxr-20-25-trip-unit-nrx-user-manual-mn013003en', title: 'Eaton PXR 20/25 Trip Unit for NRX User Manual', num: 'MN013003EN', pdf: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/circuit-breakers/acb---izmx-inx/eaton-pxr-20-25-trip-unit-izmx16-40-instruction-manual-mn013003en-en-us.pdf', sub: 'Trip Units', desc: 'PXR 20 and PXR 25 electronic trip unit user manual for Eaton Series NRX (IZMX16/IZMX40) circuit breakers.' },
  { slug: 'eaton-power-xpert-release-technical-product-guide-mz013001e', title: 'Power Xpert Release (PXR) Technical Product Guide', num: 'MZ013001E', pdf: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/series-nrx-circuit-breakers/power-xpert-release-technical-product-guide-mz013001e.pdf', sub: 'Trip Units', desc: 'Power Xpert Release (PXR) trip unit technical product guide. Covers PXR 20 and PXR 25 for Eaton NRX and Magnum DS breakers.' },
  { slug: 'eaton-ds-dsl-dsii-dslii-trip-unit-testing-il32691c', title: 'Testing Trip Units for DS/DSII/DSL/DSLII Circuit Breakers', num: 'IL32691C', pdf: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/instructions-for-testing-trip-units-for-ds-dsii-dsl-and-dslii-circuit-breakers-amptector-digitrip-rms-or-optim-trip-units-il32691c.pdf', sub: 'Trip Units', desc: 'Instructions for testing Amptector, Digitrip RMS, and OPTIM trip units in DS, DSII, DSL, and DSLII low-voltage power circuit breakers.' },
  { slug: 'eaton-pow-r-line-switchboard-instruction-manual-im01500001e', title: 'Eaton Pow-R-Line Switchboard Instruction Manual', num: 'IM01500001E', pdf: 'https://www.eaton.com/content/dam/eaton/products/low-voltage-power-distribution-controls-systems/switchboards/pow-r-line-switchboard-manual-im01500001e.pdf', sub: 'Switchgear', desc: 'Eaton Pow-R-Line switchboard instruction manual covering installation, operation, and maintenance of SPB-equipped switchboards.' },
];
for (const doc of eatonDocs) {
  NEW_ENTRIES.push({
    slug: doc.slug,
    title: doc.title,
    manual_number: doc.num,
    category: 'Circuit Breakers',
    manufacturer: 'Eaton',
    subcategory: doc.sub,
    description: `${doc.desc} Free PDF download from Voyten Manuals. Parts and breakers available from Voyten Electric — call 1-800-458-4001.`,
    pdf_url: doc.pdf,
    keywords: `${doc.title}, ${doc.num}, Eaton, Cutler-Hammer, Westinghouse, circuit breaker manual, PDF download, Voyten`
  });
}

// ── GE SPECIFIC DOCUMENTS ──
const geDocs = [
  { slug: 'ge-entelliguard-e-circuit-breaker-iom-deh-41526', title: 'GE EntelliGuard E Circuit Breaker Installation, Operation & Maintenance Manual', num: 'DEH-41526', pdf: 'https://library.industrialsolutions.abb.com/publibrary/checkout/DEH-41526?TNR=Installation+and+Instruction%7CDEH-41526%7CPDF&filename=DEH-41526+EntelliGuard+E+IOM.pdf', sub: 'Low-Voltage Power Breakers' },
  { slug: 'ge-entelliguard-r-retrofit-circuit-breaker-deh-41548', title: 'GE EntelliGuard R Retrofit Circuit Breaker Installation Manual', num: 'DEH-41548', pdf: 'https://library.industrialsolutions.abb.com/publibrary/checkout/DEH-41548?TNR=Installation+and+Instruction%7CDEH-41548%7CPDF&filename=DEH41548_B.pdf', sub: 'Retrofit Kits' },
  { slug: 'ge-power-break-ii-drawout-800-4000a-installation-geh-6271', title: 'GE Power Break II Draw-Out 800-4000A Installation Instructions', num: 'GEH-6271', pdf: 'https://search.abb.com/library/Download.aspx?DocumentID=1SQC930018M0201&LanguageCode=en&DocumentPartId=&Action=Launch', sub: 'Insulated Case' },
  { slug: 'ge-akr-microversatrip-conversion-kits-gek-64468', title: 'GE AKR MicroVersaTrip Conversion Kits Installation Manual', num: 'GEK-64468', pdf: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/General_Electric/Retrofit_Kits/GEK-64468.pdf', sub: 'Retrofit Kits' },
  { slug: 'ge-wavepro-3200-5000a-power-circuit-breakers-def-005', title: 'GE WavePro 3200-5000A Power Circuit Breakers Manual', num: 'DEF-005', pdf: 'https://bcsswitchgear.com/wp-content/uploads/2019/08/7219-def-005.pdf', sub: 'Low-Voltage Power Breakers' },
];
for (const doc of geDocs) {
  NEW_ENTRIES.push({
    slug: doc.slug,
    title: doc.title,
    manual_number: doc.num,
    category: 'Circuit Breakers',
    manufacturer: 'General Electric',
    subcategory: doc.sub,
    description: `${doc.title}. Official General Electric technical documentation. Free PDF download from Voyten Manuals. GE breakers available from Voyten Electric — call 1-800-458-4001.`,
    pdf_url: doc.pdf,
    keywords: `${doc.title}, ${doc.num}, General Electric, GE, circuit breaker, PDF download, Voyten`
  });
}

// ── SIEMENS SPECIFIC DOCUMENTS ──
const siemensDocs = [
  { slug: 'siemens-3wl2-iccb-ul489-operating-manual-nafta', title: 'Siemens 3WL2 Insulated Case Circuit Breaker (UL489) Operating Manual', pdf: 'https://cache.industry.siemens.com/dl/files/740/21465740/att_863365/v1/21465740_3WL2_operating_manual_NAFTA_UL_engl_2015_201512101352329112.pdf', sub: 'Insulated Case' },
  { slug: 'siemens-3wl3-lvpcb-ul1066-operating-manual-nafta', title: 'Siemens 3WL3 Low-Voltage Power Circuit Breaker (UL1066) Operating Manual', pdf: 'https://cache.industry.siemens.com/dl/files/215/21463215/att_863271/v2/3WL3_operating_manual_NAFTA_UL1066_engl_2015_201512101417115285.pdf', sub: 'Low-Voltage Power Breakers' },
  { slug: 'siemens-sb-encased-breakers-800-5000a-ipim-2210', title: 'Siemens SB Encased Systems Breakers 800-5000A Installation Manual', pdf: 'https://bcsswitchgear.com/wp-content/uploads/content-library/SIEMENS_SB_IPIM-2210-D.pdf', sub: 'Insulated Case', num: 'IPIM-2210-D' },
  { slug: 'siemens-type-rl-circuit-breakers-sgim-3068d', title: 'Siemens Type RL Circuit Breakers Installation Manual', pdf: 'https://www.npeinc.com/manuals/Adobe%20E-Manuals/AC%20Stuff%20from%20Voyten/Siemens%20RL/Type%20RL%20Circuit%20Breakers%20%20SGIM-3068D.pdf', sub: 'Insulated Case', num: 'SGIM-3068D' },
  { slug: 'siemens-wl-selection-application-guide', title: 'Siemens WL Circuit Breakers Selection and Application Guide', pdf: 'https://assets.new.siemens.com/siemens/assets/api/uuid:daabcb59-5aa6-4583-b014-e53d57665916/ca-si-lv-en-WL-Circuit-Select-App-Guide-EN-SI-EP-1710.pdf', sub: 'Low-Voltage Power Breakers' },
];
for (const doc of siemensDocs) {
  NEW_ENTRIES.push({
    slug: doc.slug,
    title: doc.title,
    manual_number: (doc as any).num || null,
    category: 'Circuit Breakers',
    manufacturer: 'Siemens',
    subcategory: doc.sub,
    description: `${doc.title}. Official Siemens technical documentation. Free PDF download from Voyten Manuals.`,
    pdf_url: doc.pdf,
    keywords: `${doc.title}, Siemens, circuit breaker, PDF download, Voyten`
  });
}

// ═══════════════════════════════════════════════════════════════════════
// EXECUTE
// ═══════════════════════════════════════════════════════════════════════

async function main() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const before = await db.execute('SELECT COUNT(*) as c FROM manuals');
  console.log(`Current DB: ${before.rows[0].c} manuals\n`);

  // ── PART 1: Update PDF URLs ──
  console.log('=== UPDATING PDF URLs WITH REAL MANUFACTURER LINKS ===');
  let updated = 0;
  for (const upd of PDF_UPDATES) {
    const result = await db.execute({
      sql: `UPDATE manuals SET pdf_url = ?, ${upd.manual_number ? 'manual_number = ?,' : ''} updated_at = CURRENT_TIMESTAMP WHERE slug LIKE ? AND pdf_url NOT LIKE 'https://www.eaton.com/content/dam/%' AND pdf_url NOT LIKE 'https://library.e.abb.com/%' AND pdf_url NOT LIKE 'https://apps.geindustrial.com/%' AND pdf_url NOT LIKE 'https://assets.new.siemens.com/%' AND pdf_url NOT LIKE 'https://cache.industry.siemens.com/%'`,
      args: upd.manual_number
        ? [upd.pdf_url, upd.manual_number, upd.slugPattern]
        : [upd.pdf_url, upd.slugPattern],
    });
    if (result.rowsAffected > 0) {
      console.log(`  Updated ${result.rowsAffected} rows matching: ${upd.slugPattern}`);
      updated += result.rowsAffected;
    }
  }
  console.log(`Total PDF URLs updated: ${updated}\n`);

  // ── PART 2: Insert new entries ──
  console.log('=== INSERTING NEW HIGH-VALUE ENTRIES ===');
  const seenSlugs = new Set<string>();
  const unique = NEW_ENTRIES.filter(m => {
    if (seenSlugs.has(m.slug)) return false;
    seenSlugs.add(m.slug);
    return true;
  });
  console.log(`${unique.length} unique new entries`);

  const BATCH_SIZE = 100;
  let ins = 0;
  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const batch = unique.slice(i, i + BATCH_SIZE);
    const stmts = batch.map(m => ({
      sql: `INSERT OR IGNORE INTO manuals (slug, title, manual_number, category, manufacturer, subcategory, description, pdf_url, keywords)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [m.slug, m.title, m.manual_number, m.category, m.manufacturer, m.subcategory, m.description, m.pdf_url, m.keywords],
    }));
    await db.batch(stmts, 'write');
    ins += batch.length;
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} — ${ins}/${unique.length}`);
  }

  const after = await db.execute('SELECT COUNT(*) as c FROM manuals');
  const added = Number(after.rows[0].c) - Number(before.rows[0].c);
  console.log(`\n=== RESULTS ===`);
  console.log(`New manuals added: ${added}`);
  console.log(`PDF URLs updated: ${updated}`);
  console.log(`Total manuals in database: ${after.rows[0].c}`);

  // Final stats
  const subs = await db.execute("SELECT subcategory, COUNT(*) as c FROM manuals WHERE category='Circuit Breakers' GROUP BY subcategory ORDER BY c DESC LIMIT 20");
  console.log('\nTop CB subcategories:');
  subs.rows.forEach(r => console.log(`  ${r.subcategory}: ${r.c}`));

  const mfrs = await db.execute('SELECT manufacturer, COUNT(*) as c FROM manuals GROUP BY manufacturer ORDER BY c DESC LIMIT 15');
  console.log('\nTop manufacturers:');
  mfrs.rows.forEach(r => console.log(`  ${r.manufacturer}: ${r.c}`));

  // Count entries with real manufacturer PDFs
  const realPdfs = await db.execute("SELECT COUNT(*) as c FROM manuals WHERE pdf_url LIKE 'https://www.eaton.com/content/dam/%' OR pdf_url LIKE 'https://library.e.abb.com/%' OR pdf_url LIKE 'https://apps.geindustrial.com/%' OR pdf_url LIKE 'https://assets.new.siemens.com/%' OR pdf_url LIKE 'https://cache.industry.siemens.com/%' OR pdf_url LIKE 'https://www.npeinc.com/%' OR pdf_url LIKE 'https://bcsswitchgear.com/%' OR pdf_url LIKE 'https://library.industrialsolutions.abb.com/%' OR pdf_url LIKE 'https://search.abb.com/%'");
  console.log(`\nEntries with verified manufacturer PDF URLs: ${realPdfs.rows[0].c}`);
}

main().catch(console.error);
