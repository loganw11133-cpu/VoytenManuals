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

// ─── EATON / CUTLER-HAMMER / WESTINGHOUSE ───────────────────────────────

const EATON_ICCB: ManualEntry[] = [];

// Magnum DS (MDS) — Insulated Case
const magnumDSAmps = [800, 1200, 1600, 2000, 2500, 3000, 3200, 4000, 5000, 6000];
const magnumDSPoles = [3, 4];
for (const amps of magnumDSAmps) {
  for (const poles of magnumDSPoles) {
    EATON_ICCB.push({
      slug: slugify(`eaton-magnum-ds-${amps}a-${poles}p-insulated-case-circuit-breaker`),
      title: `Eaton Magnum DS ${amps}A ${poles}-Pole Insulated Case Circuit Breaker Manual`,
      manual_number: 'MN036006EN',
      category: 'Circuit Breakers',
      manufacturer: 'Eaton',
      subcategory: 'Insulated Case',
      description: `Technical documentation for the Eaton Cutler-Hammer Magnum DS ${amps} Amp ${poles}-Pole insulated case circuit breaker. Includes installation instructions, wiring diagrams, maintenance procedures, and renewal parts information. Magnum DS breakers feature Power Xpert Release (PXR) and Digitrip trip units with ratings from 800A to 6000A. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.eaton.com/content/dam/eaton/products/low-voltage-power-distribution-controls-systems/power-circuit-breakers/magnum-ds-low-voltage-power-circuit-breakers/magnum-ds-instruction-manual-mn036006en.pdf',
      keywords: `Eaton Magnum DS, MDS, ${amps}A, ${poles}-pole, insulated case circuit breaker, Cutler-Hammer, power circuit breaker, Digitrip, PXR trip unit, low voltage breaker, ICCB, MN036006EN`
    });
  }
}

// Magnum DS trip unit variants
const magnumDSTripUnits = [
  { name: 'Digitrip 520', code: '520', desc: 'Basic LSI protection' },
  { name: 'Digitrip 520M', code: '520M', desc: 'LSI with metering' },
  { name: 'Digitrip 520MC', code: '520MC', desc: 'LSI with communications' },
  { name: 'Digitrip 1150', code: '1150', desc: 'Advanced LSIG protection with metering' },
  { name: 'Digitrip 1150+', code: '1150P', desc: 'Premium LSIG protection with power quality' },
  { name: 'PXR 20', code: 'PXR20', desc: 'Power Xpert Release basic' },
  { name: 'PXR 25', code: 'PXR25', desc: 'Power Xpert Release advanced' },
];
for (const trip of magnumDSTripUnits) {
  EATON_ICCB.push({
    slug: slugify(`eaton-magnum-ds-${trip.code}-trip-unit-manual`),
    title: `Eaton Magnum DS ${trip.name} Trip Unit Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Eaton',
    subcategory: 'Trip Units',
    description: `${trip.name} electronic trip unit manual for Eaton Cutler-Hammer Magnum DS insulated case circuit breakers. ${trip.desc}. Includes programming instructions, setting ranges, characteristic curves, and wiring diagrams. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.eaton.com/content/dam/eaton/products/low-voltage-power-distribution-controls-systems/power-circuit-breakers/magnum-ds-low-voltage-power-circuit-breakers/magnum-ds-instruction-manual-mn036006en.pdf',
    keywords: `${trip.name}, trip unit, Magnum DS, Eaton, Cutler-Hammer, electronic trip, ${trip.desc}, circuit breaker trip unit, LSIG, characteristic curves`
  });
}

// Magnum DS accessories
const magnumDSAccessories = [
  { name: 'Shunt Trip', slug: 'shunt-trip', desc: 'Shunt trip device for remote tripping' },
  { name: 'Undervoltage Release', slug: 'uvr', desc: 'Undervoltage release device' },
  { name: 'Motor Operator', slug: 'motor-operator', desc: 'Electric motor close/open operator' },
  { name: 'Auxiliary Switch', slug: 'auxiliary-switch', desc: 'Auxiliary contact switch assemblies' },
  { name: 'Bell Alarm Switch', slug: 'bell-alarm', desc: 'Bell alarm contact switch' },
  { name: 'Spring Release Device', slug: 'spring-release', desc: 'Spring charging motor release' },
  { name: 'Renewal Parts', slug: 'renewal-parts', desc: 'Renewal and replacement parts catalog' },
  { name: 'Wiring Diagrams', slug: 'wiring-diagrams', desc: 'Control and power wiring diagrams' },
];
for (const acc of magnumDSAccessories) {
  EATON_ICCB.push({
    slug: slugify(`eaton-magnum-ds-${acc.slug}-manual`),
    title: `Eaton Magnum DS ${acc.name} Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Eaton',
    subcategory: 'Insulated Case',
    description: `${acc.name} documentation for Eaton Cutler-Hammer Magnum DS insulated case circuit breakers. ${acc.desc}. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.eaton.com/content/dam/eaton/products/low-voltage-power-distribution-controls-systems/power-circuit-breakers/magnum-ds-low-voltage-power-circuit-breakers/magnum-ds-instruction-manual-mn036006en.pdf',
    keywords: `Magnum DS, ${acc.name}, Eaton, Cutler-Hammer, insulated case breaker, ${acc.desc}, ICCB accessories`
  });
}

// Magnum SB (SBS/SPB) — Insulated Case
const magnumSBAmps = [800, 1200, 1600, 2000, 2500, 3000, 3200];
for (const amps of magnumSBAmps) {
  for (const poles of [3, 4]) {
    EATON_ICCB.push({
      slug: slugify(`eaton-magnum-sb-${amps}a-${poles}p-insulated-case-circuit-breaker`),
      title: `Eaton Magnum SB ${amps}A ${poles}-Pole Insulated Case Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'Eaton',
      subcategory: 'Insulated Case',
      description: `Technical documentation for the Eaton Cutler-Hammer Magnum SB ${amps} Amp ${poles}-Pole insulated case circuit breaker. Includes installation, maintenance, and parts information. Magnum SB breakers (SBS/SPB catalog format) are available with Digitrip and PXR trip units. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Cutler-Hammer/InsulatedCaseBreakers/',
      keywords: `Eaton Magnum SB, SBS, SPB, ${amps}A, ${poles}-pole, insulated case circuit breaker, Cutler-Hammer, ICCB, Digitrip, low voltage power breaker`
    });
  }
}

// Series C (HFC/HFD/HFB) — Insulated Case
const seriesCTypes = [
  { type: 'HFC', maxAmps: 150, desc: 'C-frame' },
  { type: 'HFD', maxAmps: 250, desc: 'D-frame' },
  { type: 'HFB', maxAmps: 600, desc: 'B-frame' },
  { type: 'HMCP', maxAmps: 600, desc: 'Motor circuit protector' },
];
const seriesCAmps = [15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 500, 600];
for (const frame of seriesCTypes) {
  const applicableAmps = seriesCAmps.filter(a => a <= frame.maxAmps);
  for (const amps of applicableAmps) {
    EATON_ICCB.push({
      slug: slugify(`eaton-series-c-${frame.type}-${amps}a-circuit-breaker`),
      title: `Eaton Series C ${frame.type} ${amps}A Circuit Breaker Manual`,
      manual_number: 'TD01203011E',
      category: 'Circuit Breakers',
      manufacturer: 'Eaton',
      subcategory: 'Insulated Case',
      description: `Eaton Cutler-Hammer Series C Type ${frame.type} ${amps} Amp circuit breaker technical documentation. ${frame.desc} insulated case breaker with thermal-magnetic trip. Installation instructions, dimensions, wiring, and specifications. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.eaton.com/content/dam/eaton/products/low-voltage-power-distribution-controls-systems/power-circuit-breakers/series-c-insulated-case-circuit-breaker-catalog-td01203011e.pdf',
      keywords: `Eaton Series C, ${frame.type}, ${amps}A, insulated case, Cutler-Hammer, thermal magnetic, circuit breaker, ICCB, TD01203011E, ${frame.desc}`
    });
  }
}

// Series G — Molded Case
const seriesGTypes = [
  { type: 'FD', maxAmps: 250, desc: 'FD-frame molded case' },
  { type: 'FDB', maxAmps: 600, desc: 'FDB-frame molded case' },
  { type: 'GDB', maxAmps: 600, desc: 'GDB-frame molded case with ground fault' },
  { type: 'GHB', maxAmps: 100, desc: 'GHB-frame branch circuit' },
];
for (const frame of seriesGTypes) {
  for (const amps of [15, 20, 30, 40, 50, 60, 70, 80, 100, 125, 150, 200, 225, 250, 300, 350, 400, 500, 600].filter(a => a <= frame.maxAmps)) {
    EATON_ICCB.push({
      slug: slugify(`eaton-series-g-${frame.type}-${amps}a-molded-case-breaker`),
      title: `Eaton Series G Type ${frame.type} ${amps}A Molded Case Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'Eaton',
      subcategory: 'Molded Case',
      description: `Eaton Cutler-Hammer Series G Type ${frame.type} ${amps} Amp molded case circuit breaker. ${frame.desc}. Installation, maintenance, and specifications. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Cutler-Hammer/',
      keywords: `Eaton Series G, ${frame.type}, ${amps}A, molded case circuit breaker, Cutler-Hammer, MCCB, thermal magnetic`
    });
  }
}

// NRX Series — Low-Voltage Power Air Circuit Breakers
const nrxFrames = [
  { frame: 'NF', model: 'IZMX16', range: [630, 800, 1000, 1200, 1250, 1600], desc: 'NF frame (IZMX16)' },
  { frame: 'RF', model: 'IZMX40', range: [800, 1000, 1200, 1600, 2000, 2500, 3000, 3200, 4000], desc: 'RF frame (IZMX40)' },
];
for (const nrx of nrxFrames) {
  for (const amps of nrx.range) {
    for (const poles of [3, 4]) {
      EATON_ICCB.push({
        slug: slugify(`eaton-nrx-${nrx.frame.toLowerCase()}-${amps}a-${poles}p-power-circuit-breaker`),
        title: `Eaton NRX ${nrx.frame} ${amps}A ${poles}-Pole Low-Voltage Power Circuit Breaker Manual`,
        manual_number: 'MN01301003E',
        category: 'Circuit Breakers',
        manufacturer: 'Eaton',
        subcategory: 'Low-Voltage Power Breakers',
        description: `Eaton Series NRX ${nrx.desc} ${amps} Amp ${poles}-pole low-voltage power air circuit breaker. User manual MN01301003E covering installation, operation, maintenance, and renewal parts. Digitrip 520/1150i and PXR trip units. Free PDF download from Voyten Manuals.`,
        pdf_url: 'https://www.eaton.com/content/dam/eaton/products/low-voltage-power-distribution-controls-systems/power-circuit-breakers/series-nrx-low-voltage-power-air-circuit-breakers-user-manual-mn01301003e.pdf',
        keywords: `Eaton NRX, ${nrx.frame}, ${nrx.model}, ${amps}A, ${poles}-pole, power circuit breaker, air circuit breaker, Digitrip, PXR, low voltage, MN01301003E`
      });
    }
  }
}

// Westinghouse DS/DSII — Low-Voltage Power Air Circuit Breakers
const dsTypes = [
  { model: 'DS-206', amps: 800, desc: 'DS-206 frame, 800A' },
  { model: 'DS-206', amps: 600, desc: 'DS-206 frame, 600A' },
  { model: 'DS-416', amps: 1600, desc: 'DS-416 frame, 1600A' },
  { model: 'DS-416', amps: 1200, desc: 'DS-416 frame, 1200A' },
  { model: 'DS-532', amps: 3200, desc: 'DS-532 frame, 3200A' },
  { model: 'DS-532', amps: 2500, desc: 'DS-532 frame, 2500A' },
  { model: 'DS-532', amps: 2000, desc: 'DS-532 frame, 2000A' },
  { model: 'DS-840', amps: 4000, desc: 'DS-840 frame, 4000A' },
  { model: 'DS-840', amps: 3000, desc: 'DS-840 frame, 3000A' },
  { model: 'DSII-308', amps: 800, desc: 'DSII-308 frame, 800A' },
  { model: 'DSII-316', amps: 1600, desc: 'DSII-316 frame, 1600A' },
  { model: 'DSII-520', amps: 2000, desc: 'DSII-520 frame, 2000A' },
  { model: 'DSII-532', amps: 3200, desc: 'DSII-532 frame, 3200A' },
  { model: 'DSII-616', amps: 1600, desc: 'DSII-616 frame, 1600A (high interrupting)' },
  { model: 'DSII-620', amps: 2000, desc: 'DSII-620 frame, 2000A (high interrupting)' },
];
for (const ds of dsTypes) {
  EATON_ICCB.push({
    slug: slugify(`westinghouse-${ds.model}-${ds.amps}a-air-circuit-breaker`),
    title: `Westinghouse ${ds.model} ${ds.amps}A Low-Voltage Power Air Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Westinghouse',
    subcategory: 'Low-Voltage Power Breakers',
    description: `Westinghouse ${ds.desc} low-voltage power air circuit breaker manual. Drawout type power breaker for switchgear applications. Installation, maintenance, renewal parts, and wiring diagrams. Compatible with Digitrip trip units. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Westinghouse/AirBreakers/',
    keywords: `Westinghouse ${ds.model}, ${ds.amps}A, air circuit breaker, DS breaker, power circuit breaker, drawout breaker, switchgear, Digitrip, low voltage`
  });
}

// Westinghouse Type W — Insulated Case
const typeWAmps = [800, 1000, 1200, 1600, 2000, 2500, 3000, 3200];
for (const amps of typeWAmps) {
  EATON_ICCB.push({
    slug: slugify(`westinghouse-type-w-${amps}a-insulated-case-circuit-breaker`),
    title: `Westinghouse Type W ${amps}A Insulated Case Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Westinghouse',
    subcategory: 'Insulated Case',
    description: `Westinghouse Type W ${amps} Amp insulated case circuit breaker technical documentation. Installation instructions, maintenance procedures, renewal parts catalog, and wiring diagrams. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Westinghouse/InsulatedCaseBreakers/',
    keywords: `Westinghouse Type W, ${amps}A, insulated case circuit breaker, ICCB, power breaker, low voltage, Digitrip, renewal parts`
  });
}

// Cutler-Hammer SPB — Insulated Case (Pow-R-Way)
const spbAmps = [800, 1200, 1600, 2000, 2500, 3000, 3200];
for (const amps of spbAmps) {
  EATON_ICCB.push({
    slug: slugify(`cutler-hammer-spb-${amps}a-insulated-case-circuit-breaker`),
    title: `Cutler-Hammer SPB ${amps}A Insulated Case Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Cutler-Hammer',
    subcategory: 'Insulated Case',
    description: `Cutler-Hammer SPB ${amps} Amp insulated case circuit breaker manual. Westinghouse heritage design with Digitrip electronic trip units. Installation, maintenance, renewal parts, and characteristic curves. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Cutler-Hammer/InsulatedCaseBreakers/',
    keywords: `Cutler-Hammer SPB, ${amps}A, insulated case circuit breaker, ICCB, Digitrip, Westinghouse, Eaton, power breaker`
  });
}

// ─── GENERAL ELECTRIC ───────────────────────────────────────────────────

const GE_ICCB: ManualEntry[] = [];

// Power Break II — Insulated Case
const pbIIAmps = [800, 1200, 1600, 2000, 2500, 3000, 3200];
for (const amps of pbIIAmps) {
  for (const poles of [3, 4]) {
    GE_ICCB.push({
      slug: slugify(`ge-power-break-ii-${amps}a-${poles}p-insulated-case-breaker`),
      title: `GE Power Break II ${amps}A ${poles}-Pole Insulated Case Circuit Breaker Manual`,
      manual_number: 'DEH-40272',
      category: 'Circuit Breakers',
      manufacturer: 'General Electric',
      subcategory: 'Insulated Case',
      description: `General Electric Power Break II ${amps} Amp ${poles}-pole insulated case circuit breaker manual. Includes installation, operation, maintenance, and renewal parts. EntelliGuard and MicroVersaTrip Plus trip units. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/General_Electric/InsulatedCaseBreakers/',
      keywords: `GE Power Break II, PBII, ${amps}A, ${poles}-pole, insulated case, General Electric, EntelliGuard, MicroVersaTrip, ICCB, circuit breaker`
    });
  }
}

// GE EntelliGuard — Low-Voltage Power
const egFrames = [
  { frame: 'E', range: [800, 1200, 1600, 2000], desc: 'E-frame' },
  { frame: 'G', range: [800, 1200, 1600, 2000, 2500, 3000, 3200], desc: 'G-frame' },
  { frame: 'S', range: [3200, 4000, 5000], desc: 'S-frame' },
  { frame: 'T', range: [4000, 5000, 6000], desc: 'T-frame' },
  { frame: 'L', range: [2500, 3000, 3200, 4000], desc: 'L-frame' },
];
for (const eg of egFrames) {
  for (const amps of eg.range) {
    GE_ICCB.push({
      slug: slugify(`ge-entelliguard-${eg.frame.toLowerCase()}-${amps}a-power-circuit-breaker`),
      title: `GE EntelliGuard ${eg.frame} ${amps}A Power Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'General Electric',
      subcategory: 'Low-Voltage Power Breakers',
      description: `General Electric EntelliGuard ${eg.desc} ${amps} Amp low-voltage power circuit breaker documentation. Drawout power breaker with digital trip unit. Installation, maintenance, and technical specifications. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/General_Electric/',
      keywords: `GE EntelliGuard, ${eg.frame}-frame, ${amps}A, power circuit breaker, General Electric, drawout breaker, digital trip, low voltage`
    });
  }
}

// GE AKR — Low-Voltage Power Air
const akrTypes = [
  { model: 'AKR-30', amps: 800, desc: '30-frame 800A' },
  { model: 'AKR-30', amps: 600, desc: '30-frame 600A' },
  { model: 'AKR-50', amps: 1600, desc: '50-frame 1600A' },
  { model: 'AKR-50', amps: 1200, desc: '50-frame 1200A' },
  { model: 'AKR-75', amps: 2000, desc: '75-frame 2000A' },
  { model: 'AKR-75', amps: 3000, desc: '75-frame 3000A' },
  { model: 'AKR-100', amps: 4000, desc: '100-frame 4000A' },
  { model: 'AKR-100', amps: 3200, desc: '100-frame 3200A' },
  { model: 'AK-25', amps: 600, desc: 'AK-25 frame 600A' },
  { model: 'AK-50', amps: 1600, desc: 'AK-50 frame 1600A' },
  { model: 'AK-75', amps: 3000, desc: 'AK-75 frame 3000A' },
  { model: 'AK-100', amps: 4000, desc: 'AK-100 frame 4000A' },
];
for (const akr of akrTypes) {
  GE_ICCB.push({
    slug: slugify(`ge-${akr.model}-${akr.amps}a-air-circuit-breaker`),
    title: `GE ${akr.model} ${akr.amps}A Low-Voltage Power Air Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'General Electric',
    subcategory: 'Low-Voltage Power Breakers',
    description: `General Electric ${akr.model} ${akr.desc} low-voltage power air circuit breaker manual. Drawout type for AK/AKR switchgear. Installation, maintenance, renewal parts, and wiring diagrams. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/General_Electric/AirBreakers/',
    keywords: `GE ${akr.model}, ${akr.amps}A, air circuit breaker, AKR breaker, power breaker, General Electric, drawout, switchgear, low voltage`
  });
}

// GE Wave Pro — Power Breakers
const waveProAmps = [800, 1200, 1600, 2000, 2500, 3000, 3200, 4000, 5000];
for (const amps of waveProAmps) {
  GE_ICCB.push({
    slug: slugify(`ge-wave-pro-${amps}a-power-circuit-breaker`),
    title: `GE WavePro ${amps}A Power Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'General Electric',
    subcategory: 'Low-Voltage Power Breakers',
    description: `General Electric WavePro ${amps} Amp power circuit breaker documentation. Advanced low-voltage power breaker with integrated metering and communications. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/General_Electric/',
    keywords: `GE WavePro, ${amps}A, power circuit breaker, General Electric, low voltage breaker, digital trip, wave pro`
  });
}

// GE Spectra RMS — Molded Case
const spectraFrames = [
  { type: 'SGHA', range: [400, 600], desc: 'A-frame' },
  { type: 'SGHB', range: [400, 600], desc: 'B-frame' },
  { type: 'SGLA', range: [600, 800], desc: 'L-frame' },
  { type: 'SGPA', range: [800, 1200, 1600], desc: 'P-frame' },
  { type: 'SGDA', range: [200, 250, 400], desc: 'D-frame' },
];
for (const frame of spectraFrames) {
  for (const amps of frame.range) {
    GE_ICCB.push({
      slug: slugify(`ge-spectra-rms-${frame.type}-${amps}a-molded-case-breaker`),
      title: `GE Spectra RMS ${frame.type} ${amps}A Molded Case Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'General Electric',
      subcategory: 'Molded Case',
      description: `General Electric Spectra RMS ${frame.type} ${frame.desc} ${amps} Amp molded case circuit breaker. Includes installation, maintenance, and technical specifications. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/General_Electric/',
      keywords: `GE Spectra RMS, ${frame.type}, ${amps}A, molded case circuit breaker, General Electric, MCCB, ${frame.desc}`
    });
  }
}

// ─── SIEMENS ────────────────────────────────────────────────────────────

const SIEMENS_ICCB: ManualEntry[] = [];

// WL Series — Low-Voltage Power
const wlFrames = [
  { frame: 'WLL', range: [800, 1200, 1600], desc: 'WLL frame non-auto' },
  { frame: 'WLF', range: [800, 1200, 1600, 2000, 2500, 3000, 3200, 4000, 5000], desc: 'WLF frame with stored energy' },
];
for (const wl of wlFrames) {
  for (const amps of wl.range) {
    SIEMENS_ICCB.push({
      slug: slugify(`siemens-${wl.frame.toLowerCase()}-${amps}a-power-circuit-breaker`),
      title: `Siemens ${wl.frame} ${amps}A Low-Voltage Power Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'Siemens',
      subcategory: 'Low-Voltage Power Breakers',
      description: `Siemens ${wl.frame} ${wl.desc} ${amps} Amp low-voltage power circuit breaker. Installation, commissioning, maintenance, and renewal parts. ETU electronic trip unit. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Siemens/',
      keywords: `Siemens ${wl.frame}, ${amps}A, power circuit breaker, WL breaker, ETU trip unit, low voltage, drawout breaker`
    });
  }
}

// Sentron 3WL — Power Circuit Breakers
const sentron3WLAmps = [630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6300];
for (const amps of sentron3WLAmps) {
  SIEMENS_ICCB.push({
    slug: slugify(`siemens-sentron-3wl-${amps}a-power-circuit-breaker`),
    title: `Siemens SENTRON 3WL ${amps}A Air Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Siemens',
    subcategory: 'Low-Voltage Power Breakers',
    description: `Siemens SENTRON 3WL ${amps} Amp air circuit breaker. Fixed and drawout mounting. ETU electronic trip unit with LSI/LSIG protection. Installation, commissioning, and maintenance manual. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Siemens/',
    keywords: `Siemens SENTRON 3WL, ${amps}A, air circuit breaker, power breaker, ETU, LSIG, low voltage, IEC breaker`
  });
}

// Siemens VL — Molded Case
const vlTypes = [
  { model: 'VL160X', range: [63, 80, 100, 125, 160], desc: '160A frame' },
  { model: 'VL250', range: [100, 125, 160, 200, 250], desc: '250A frame' },
  { model: 'VL400', range: [250, 315, 400], desc: '400A frame' },
  { model: 'VL630', range: [400, 500, 630], desc: '630A frame' },
  { model: 'VL800', range: [500, 630, 800], desc: '800A frame' },
];
for (const vl of vlTypes) {
  for (const amps of vl.range) {
    SIEMENS_ICCB.push({
      slug: slugify(`siemens-sentron-${vl.model.toLowerCase()}-${amps}a-molded-case-breaker`),
      title: `Siemens SENTRON ${vl.model} ${amps}A Molded Case Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'Siemens',
      subcategory: 'Molded Case',
      description: `Siemens SENTRON ${vl.model} ${vl.desc} ${amps} Amp molded case circuit breaker documentation. Installation, wiring, and maintenance instructions. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Siemens/',
      keywords: `Siemens ${vl.model}, SENTRON, ${amps}A, molded case circuit breaker, MCCB, VL series`
    });
  }
}

// Siemens SB/HB — Insulated Case
const sbAmps = [800, 1200, 1600, 2000, 2500, 3000, 3200];
for (const amps of sbAmps) {
  SIEMENS_ICCB.push({
    slug: slugify(`siemens-sb-${amps}a-insulated-case-circuit-breaker`),
    title: `Siemens SB ${amps}A Insulated Case Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Siemens',
    subcategory: 'Insulated Case',
    description: `Siemens SB ${amps} Amp insulated case circuit breaker documentation. Installation instructions, maintenance procedures, and renewal parts catalog. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Siemens/',
    keywords: `Siemens SB, ${amps}A, insulated case circuit breaker, ICCB, Siemens power breaker`
  });
}
for (const amps of [800, 1200, 1600, 2000]) {
  SIEMENS_ICCB.push({
    slug: slugify(`siemens-hb-${amps}a-insulated-case-circuit-breaker`),
    title: `Siemens HB ${amps}A Insulated Case Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Siemens',
    subcategory: 'Insulated Case',
    description: `Siemens HB ${amps} Amp insulated case circuit breaker manual. High-interrupting capacity breaker for demanding applications. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Siemens/',
    keywords: `Siemens HB, ${amps}A, insulated case circuit breaker, ICCB, high interrupting`
  });
}

// ─── SQUARE D / SCHNEIDER ELECTRIC ──────────────────────────────────────

const SQUARED_ICCB: ManualEntry[] = [];

// Masterpact NT/NW — Low-Voltage Power Air
const masterpactNT = [630, 800, 1000, 1250, 1600];
const masterpactNW = [800, 1000, 1250, 1600, 2000, 2500, 3000, 3200, 4000, 5000, 6300];
for (const amps of masterpactNT) {
  SQUARED_ICCB.push({
    slug: slugify(`square-d-masterpact-nt-${amps}a-air-circuit-breaker`),
    title: `Square D Masterpact NT ${amps}A Air Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Square D',
    subcategory: 'Low-Voltage Power Breakers',
    description: `Square D Schneider Electric Masterpact NT ${amps} Amp low-voltage air circuit breaker. Micrologic trip units with LSI/LSIG protection. Installation, operation, and maintenance manual. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Square_D/',
    keywords: `Square D Masterpact NT, ${amps}A, air circuit breaker, Schneider Electric, Micrologic, power breaker, low voltage`
  });
}
for (const amps of masterpactNW) {
  SQUARED_ICCB.push({
    slug: slugify(`square-d-masterpact-nw-${amps}a-air-circuit-breaker`),
    title: `Square D Masterpact NW ${amps}A Air Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Square D',
    subcategory: 'Low-Voltage Power Breakers',
    description: `Square D Schneider Electric Masterpact NW ${amps} Amp low-voltage air circuit breaker. Micrologic trip units with advanced protection and metering. Drawout and fixed mounting options. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Square_D/',
    keywords: `Square D Masterpact NW, ${amps}A, air circuit breaker, Schneider Electric, Micrologic, power breaker, drawout, low voltage`
  });
}

// Masterpact MTZ — Next-gen
const masterpactMTZ = [
  { model: 'MTZ1', range: [630, 800, 1000, 1250, 1600] },
  { model: 'MTZ2', range: [800, 1000, 1250, 1600, 2000, 2500, 3200] },
  { model: 'MTZ3', range: [2500, 3200, 4000, 5000, 6300] },
];
for (const mtz of masterpactMTZ) {
  for (const amps of mtz.range) {
    SQUARED_ICCB.push({
      slug: slugify(`square-d-${mtz.model.toLowerCase()}-${amps}a-air-circuit-breaker`),
      title: `Square D ${mtz.model} ${amps}A Air Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'Square D',
      subcategory: 'Low-Voltage Power Breakers',
      description: `Square D Schneider Electric ${mtz.model} Masterpact ${amps} Amp air circuit breaker. Next-generation digital power breaker with MicroLogic X control unit. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Square_D/',
      keywords: `Square D ${mtz.model}, Masterpact, ${amps}A, air circuit breaker, Schneider Electric, MicroLogic X, digital breaker`
    });
  }
}

// PowerPact — Molded Case / Insulated Case
const powerPactFrames = [
  { frame: 'H', range: [15, 20, 30, 40, 50, 60, 70, 100, 125, 150], desc: 'H-frame 150AF', sub: 'Molded Case' },
  { frame: 'J', range: [100, 125, 150, 175, 200, 225, 250], desc: 'J-frame 250AF', sub: 'Molded Case' },
  { frame: 'L', range: [125, 150, 175, 200, 225, 250, 300, 350, 400, 500, 600], desc: 'L-frame 600AF', sub: 'Molded Case' },
  { frame: 'P', range: [600, 800, 1000, 1200], desc: 'P-frame 1200AF', sub: 'Insulated Case' },
  { frame: 'R', range: [1200, 1600, 2000, 2500], desc: 'R-frame 2500AF', sub: 'Insulated Case' },
];
for (const pp of powerPactFrames) {
  for (const amps of pp.range) {
    SQUARED_ICCB.push({
      slug: slugify(`square-d-powerpact-${pp.frame.toLowerCase()}-${amps}a-circuit-breaker`),
      title: `Square D PowerPact ${pp.frame}-Frame ${amps}A Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'Square D',
      subcategory: pp.sub,
      description: `Square D Schneider Electric PowerPact ${pp.desc} ${amps} Amp circuit breaker. Micrologic electronic trip unit. Installation, operation, and maintenance. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Square_D/',
      keywords: `Square D PowerPact, ${pp.frame}-frame, ${amps}A, ${pp.sub.toLowerCase()} circuit breaker, Schneider Electric, Micrologic`
    });
  }
}

// Square D Micrologic trip units
const micrologic = [
  { name: 'Micrologic 3.0', desc: 'Basic LSI protection' },
  { name: 'Micrologic 5.0', desc: 'Advanced LSI with metering' },
  { name: 'Micrologic 6.0', desc: 'LSIG with ground fault' },
  { name: 'Micrologic 7.0', desc: 'Premium LSIG with power quality metering' },
  { name: 'Micrologic X', desc: 'Next-gen digital control unit with embedded Ethernet' },
];
for (const ml of micrologic) {
  SQUARED_ICCB.push({
    slug: slugify(`square-d-${ml.name.toLowerCase().replace(/\s+/g, '-')}-trip-unit-manual`),
    title: `Square D ${ml.name} Trip Unit Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Square D',
    subcategory: 'Trip Units',
    description: `Square D Schneider Electric ${ml.name} electronic trip unit for Masterpact and PowerPact circuit breakers. ${ml.desc}. Programming, settings, and characteristic curves. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Square_D/',
    keywords: `${ml.name}, Square D, Schneider Electric, trip unit, Masterpact, PowerPact, ${ml.desc}, electronic trip`
  });
}

// ─── ABB ────────────────────────────────────────────────────────────────

const ABB_ICCB: ManualEntry[] = [];

// Emax — Air Circuit Breakers
const emaxFrames = [
  { model: 'E1', range: [800, 1000, 1250, 1600], desc: 'E1 frame' },
  { model: 'E2', range: [800, 1000, 1250, 1600, 2000], desc: 'E2 frame' },
  { model: 'E3', range: [800, 1000, 1250, 1600, 2000, 2500, 3200], desc: 'E3 frame' },
  { model: 'E4', range: [3200, 4000], desc: 'E4 frame' },
  { model: 'E6', range: [3200, 4000, 5000, 6300], desc: 'E6 frame' },
];
for (const emax of emaxFrames) {
  for (const amps of emax.range) {
    ABB_ICCB.push({
      slug: slugify(`abb-emax-${emax.model.toLowerCase()}-${amps}a-air-circuit-breaker`),
      title: `ABB SACE Emax ${emax.model} ${amps}A Air Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'ABB',
      subcategory: 'Low-Voltage Power Breakers',
      description: `ABB SACE Emax ${emax.desc} ${amps} Amp low-voltage air circuit breaker. Ekip electronic trip unit. Fixed and drawout versions. Installation, commissioning, and maintenance manual. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/ABB/',
      keywords: `ABB Emax, SACE, ${emax.model}, ${amps}A, air circuit breaker, Ekip, power breaker, low voltage, drawout`
    });
  }
}

// Emax2 — Next-gen
const emax2Frames = [
  { model: 'E1.2', range: [630, 800, 1000, 1250, 1600] },
  { model: 'E2.2', range: [800, 1000, 1250, 1600, 2000, 2500] },
  { model: 'E4.2', range: [3200, 4000] },
  { model: 'E6.2', range: [3200, 4000, 5000, 6300] },
];
for (const emax of emax2Frames) {
  for (const amps of emax.range) {
    ABB_ICCB.push({
      slug: slugify(`abb-emax2-${emax.model.toLowerCase().replace('.', '')}-${amps}a-air-circuit-breaker`),
      title: `ABB SACE Emax 2 ${emax.model} ${amps}A Air Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'ABB',
      subcategory: 'Low-Voltage Power Breakers',
      description: `ABB SACE Emax 2 ${emax.model} ${amps} Amp next-generation low-voltage air circuit breaker. Ekip Touch electronic trip unit with built-in metering and connectivity. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/ABB/',
      keywords: `ABB Emax 2, SACE, ${emax.model}, ${amps}A, air circuit breaker, Ekip Touch, next gen, low voltage`
    });
  }
}

// SACE Tmax — Molded Case
const tmaxModels = [
  { model: 'T1', range: [16, 25, 32, 40, 50, 63, 80, 100, 125, 160], desc: 'T1 160AF' },
  { model: 'T2', range: [10, 16, 25, 32, 40, 50, 63, 80, 100, 125, 160], desc: 'T2 160AF' },
  { model: 'T3', range: [15, 20, 30, 40, 50, 70, 100, 125, 150, 175, 200, 225, 250], desc: 'T3 250AF' },
  { model: 'T4', range: [100, 125, 150, 200, 250, 320], desc: 'T4 320AF' },
  { model: 'T5', range: [320, 400, 500, 630], desc: 'T5 630AF' },
  { model: 'T6', range: [630, 800], desc: 'T6 800AF' },
  { model: 'T7', range: [800, 1000, 1250, 1600], desc: 'T7 1600AF' },
];
for (const tmax of tmaxModels) {
  for (const amps of tmax.range) {
    ABB_ICCB.push({
      slug: slugify(`abb-sace-tmax-${tmax.model.toLowerCase()}-${amps}a-molded-case-breaker`),
      title: `ABB SACE Tmax ${tmax.model} ${amps}A Molded Case Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'ABB',
      subcategory: 'Molded Case',
      description: `ABB SACE Tmax ${tmax.desc} ${amps} Amp molded case circuit breaker documentation. Thermal-magnetic and electronic trip options. Installation and maintenance. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/ABB/',
      keywords: `ABB Tmax, SACE, ${tmax.model}, ${amps}A, molded case circuit breaker, MCCB, ${tmax.desc}`
    });
  }
}

// ─── ITE ────────────────────────────────────────────────────────────────

const ITE_ICCB: ManualEntry[] = [];

// K-Line — Insulated Case (ITE heritage, now Siemens)
const klineFrames = [
  { model: 'KA', range: [600, 800], desc: 'KA-frame 800A' },
  { model: 'KB', range: [800, 1200, 1600], desc: 'KB-frame 1600A' },
  { model: 'KC', range: [1600, 2000, 2500, 3000], desc: 'KC-frame 3000A' },
  { model: 'KD', range: [2500, 3000, 3200, 4000], desc: 'KD-frame 4000A' },
];
for (const kl of klineFrames) {
  for (const amps of kl.range) {
    ITE_ICCB.push({
      slug: slugify(`ite-k-line-${kl.model.toLowerCase()}-${amps}a-insulated-case-breaker`),
      title: `ITE K-Line ${kl.model} ${amps}A Insulated Case Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'ITE',
      subcategory: 'Insulated Case',
      description: `ITE K-Line ${kl.desc} ${amps} Amp insulated case circuit breaker manual. Now Siemens heritage. Installation, maintenance, renewal parts, and wiring diagrams. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/ITE/',
      keywords: `ITE K-Line, ${kl.model}, ${amps}A, insulated case circuit breaker, ICCB, Siemens, legacy breaker`
    });
  }
}

// ITE Type F — Power Air Circuit Breakers
const iteFTypes = [
  { model: 'FA', range: [225, 400, 600], desc: 'FA-frame' },
  { model: 'FB', range: [600, 800, 1200], desc: 'FB-frame' },
  { model: 'FC', range: [1200, 1600, 2000], desc: 'FC-frame' },
  { model: 'FD', range: [2000, 2500, 3000, 4000], desc: 'FD-frame' },
];
for (const f of iteFTypes) {
  for (const amps of f.range) {
    ITE_ICCB.push({
      slug: slugify(`ite-type-${f.model.toLowerCase()}-${amps}a-air-circuit-breaker`),
      title: `ITE Type ${f.model} ${amps}A Air Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'ITE',
      subcategory: 'Low-Voltage Power Breakers',
      description: `ITE Imperial Corporation Type ${f.model} ${f.desc} ${amps} Amp air circuit breaker manual. Drawout power breaker for switchgear applications. Installation, maintenance, and renewal parts. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/ITE/',
      keywords: `ITE Type ${f.model}, ${amps}A, air circuit breaker, ITE Imperial, power breaker, drawout, switchgear, legacy`
    });
  }
}

// ─── ALLIS-CHALMERS ─────────────────────────────────────────────────────

const AC_ICCB: ManualEntry[] = [];

const acTypes = [
  { model: 'LA-600', amps: 600, desc: 'LA-600 frame' },
  { model: 'LA-800', amps: 800, desc: 'LA-800 frame' },
  { model: 'LA-1600', amps: 1600, desc: 'LA-1600 frame' },
  { model: 'LA-2000', amps: 2000, desc: 'LA-2000 frame' },
  { model: 'LA-3000', amps: 3000, desc: 'LA-3000 frame' },
  { model: 'FA-350A', amps: 350, desc: 'FA-350A 5kV air magnetic' },
];
for (const ac of acTypes) {
  AC_ICCB.push({
    slug: slugify(`allis-chalmers-${ac.model}-air-circuit-breaker`),
    title: `Allis-Chalmers ${ac.model} ${ac.amps}A Air Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Allis-Chalmers',
    subcategory: 'Low-Voltage Power Breakers',
    description: `Allis-Chalmers ${ac.desc} ${ac.amps} Amp air circuit breaker manual. Legacy power breaker documentation including installation, maintenance, and renewal parts. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Allis-Chamber/',
    keywords: `Allis-Chalmers, ${ac.model}, ${ac.amps}A, air circuit breaker, legacy breaker, power breaker, switchgear`
  });
}

// ─── FEDERAL PACIFIC ────────────────────────────────────────────────────

const FPE_ICCB: ManualEntry[] = [];
const fpeTypes = [
  { model: 'DMB-25', amps: 600, desc: 'DMB-25 frame' },
  { model: 'DMB-50', amps: 1600, desc: 'DMB-50 frame' },
  { model: 'DMB-75', amps: 3000, desc: 'DMB-75 frame' },
  { model: 'DMB-100', amps: 4000, desc: 'DMB-100 frame' },
  { model: 'NB-25', amps: 600, desc: 'NB-25 frame' },
  { model: 'NB-50', amps: 1600, desc: 'NB-50 frame' },
];
for (const fpe of fpeTypes) {
  FPE_ICCB.push({
    slug: slugify(`federal-pacific-${fpe.model}-${fpe.amps}a-air-circuit-breaker`),
    title: `Federal Pacific ${fpe.model} ${fpe.amps}A Air Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Federal Pacific',
    subcategory: 'Low-Voltage Power Breakers',
    description: `Federal Pacific Electric ${fpe.desc} ${fpe.amps} Amp air circuit breaker manual. Legacy FPE power breaker for switchgear applications. Installation, maintenance, and renewal parts. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/',
    keywords: `Federal Pacific, FPE, ${fpe.model}, ${fpe.amps}A, air circuit breaker, legacy breaker, power breaker, switchgear`
  });
}

// ─── MERLIN GERIN / SCHNEIDER ───────────────────────────────────────────

const MG_ICCB: ManualEntry[] = [];
const mgMasterpact = [800, 1200, 1600, 2000, 2500, 3200, 4000];
for (const amps of mgMasterpact) {
  MG_ICCB.push({
    slug: slugify(`merlin-gerin-masterpact-m-${amps}a-air-circuit-breaker`),
    title: `Merlin Gerin Masterpact M ${amps}A Air Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Merlin Gerin',
    subcategory: 'Low-Voltage Power Breakers',
    description: `Merlin Gerin (now Schneider Electric) Masterpact M ${amps} Amp air circuit breaker. Legacy power breaker with Micrologic trip units. Installation, operation, and maintenance manual. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Merlin_Gerin/',
    keywords: `Merlin Gerin, Masterpact, ${amps}A, air circuit breaker, Schneider Electric, Micrologic, legacy breaker, power breaker`
  });
}

// ─── BROWN BOVERI / BBC ─────────────────────────────────────────────────

const BBC_ICCB: ManualEntry[] = [];
const bbcTypes = [
  { model: 'K-600', amps: 600, desc: 'K-600 frame' },
  { model: 'K-1600', amps: 1600, desc: 'K-1600 frame' },
  { model: 'K-3000', amps: 3000, desc: 'K-3000 frame' },
];
for (const bbc of bbcTypes) {
  BBC_ICCB.push({
    slug: slugify(`brown-boveri-${bbc.model}-${bbc.amps}a-air-circuit-breaker`),
    title: `Brown Boveri ${bbc.model} ${bbc.amps}A Air Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Brown Boveri Electric Inc',
    subcategory: 'Low-Voltage Power Breakers',
    description: `BBC Brown Boveri ${bbc.desc} ${bbc.amps} Amp air circuit breaker manual. Legacy power breaker documentation. Now ABB heritage. Installation, maintenance, and renewal parts. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/',
    keywords: `Brown Boveri, BBC, ${bbc.model}, ${bbc.amps}A, air circuit breaker, ABB, legacy breaker, power breaker`
  });
}

// ─── GOULD ──────────────────────────────────────────────────────────────

const GOULD_ICCB: ManualEntry[] = [];
for (const amps of [600, 800, 1600, 2000, 3000, 4000]) {
  GOULD_ICCB.push({
    slug: slugify(`gould-${amps}a-air-circuit-breaker`),
    title: `Gould ${amps}A Air Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Gould',
    subcategory: 'Low-Voltage Power Breakers',
    description: `Gould ${amps} Amp air circuit breaker manual. Legacy Gould/I-T-E power breaker documentation. Installation, maintenance, and renewal parts. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/',
    keywords: `Gould, ${amps}A, air circuit breaker, ITE, legacy breaker, power breaker, switchgear`
  });
}

// ─── RETROFIT KITS & CROSS-REFERENCE ────────────────────────────────────

const RETROFIT: ManualEntry[] = [];
const retrofitPairs = [
  { old: 'Westinghouse DS', new: 'Eaton Magnum DS', oldMfr: 'Westinghouse' },
  { old: 'GE AKR', new: 'GE EntelliGuard', oldMfr: 'General Electric' },
  { old: 'ITE K-Line', new: 'Siemens WL', oldMfr: 'ITE' },
  { old: 'Square D Masterpact', new: 'Square D Masterpact NW', oldMfr: 'Square D' },
  { old: 'ABB Emax', new: 'ABB Emax 2', oldMfr: 'ABB' },
  { old: 'Federal Pacific DMB', new: 'Eaton NRX', oldMfr: 'Federal Pacific' },
  { old: 'Allis-Chalmers LA', new: 'Eaton Magnum DS', oldMfr: 'Allis-Chalmers' },
  { old: 'Westinghouse Type W', new: 'Eaton Magnum SB', oldMfr: 'Westinghouse' },
  { old: 'ITE Type F', new: 'Siemens WL', oldMfr: 'ITE' },
  { old: 'Siemens SB', new: 'Siemens WL', oldMfr: 'Siemens' },
];
for (const r of retrofitPairs) {
  RETROFIT.push({
    slug: slugify(`${r.old}-to-${r.new}-retrofit-kit-instructions`),
    title: `${r.old} to ${r.new} Retrofit Kit Instructions`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: r.oldMfr,
    subcategory: 'Retrofit Kits',
    description: `Retrofit kit instructions for replacing ${r.old} circuit breakers with ${r.new}. Includes mechanical mounting, electrical connections, wiring modifications, and testing procedures. EOL breaker replacement solution. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/',
    keywords: `retrofit kit, ${r.old}, ${r.new}, breaker replacement, EOL, end of life, upgrade, legacy breaker replacement`
  });
}

// ─── ADDITIONAL EATON TRIP UNITS & DIGITRIP ─────────────────────────────

const TRIP_UNITS: ManualEntry[] = [];
const digitripModels = [
  { name: 'Digitrip 310+', desc: 'Basic thermal-magnetic equivalent LSI', mfr: 'Cutler-Hammer' },
  { name: 'Digitrip 510', desc: 'Mid-range LSI protection', mfr: 'Cutler-Hammer' },
  { name: 'Digitrip 520', desc: 'Standard LSI electronic trip', mfr: 'Cutler-Hammer' },
  { name: 'Digitrip 520M', desc: 'LSI with metering capability', mfr: 'Cutler-Hammer' },
  { name: 'Digitrip 520MC', desc: 'LSI with metering and communications', mfr: 'Cutler-Hammer' },
  { name: 'Digitrip 810', desc: 'Advanced LSIG protection', mfr: 'Cutler-Hammer' },
  { name: 'Digitrip 1150', desc: 'Premium LSIG with comprehensive metering', mfr: 'Cutler-Hammer' },
  { name: 'Digitrip 1150+', desc: 'Premium LSIG with power quality and harmonics', mfr: 'Cutler-Hammer' },
  { name: 'Digitrip RMS 310', desc: 'RMS sensing LSI for Westinghouse DS', mfr: 'Westinghouse' },
  { name: 'Digitrip RMS 510', desc: 'RMS sensing LSIG for Westinghouse DS', mfr: 'Westinghouse' },
  { name: 'Digitrip RMS 610', desc: 'RMS sensing advanced LSIG', mfr: 'Westinghouse' },
  { name: 'Digitrip OPTIM 1050', desc: 'Advanced LSIG with energy management', mfr: 'Cutler-Hammer' },
  { name: 'PXR 20', desc: 'Power Xpert Release basic LSI', mfr: 'Eaton' },
  { name: 'PXR 25', desc: 'Power Xpert Release advanced LSIG with metering', mfr: 'Eaton' },
  { name: 'MicroVersaTrip PM', desc: 'GE micro processor trip unit', mfr: 'General Electric' },
  { name: 'MicroVersaTrip Plus', desc: 'GE advanced electronic trip', mfr: 'General Electric' },
  { name: 'EntelliGuard TU', desc: 'GE EntelliGuard trip unit', mfr: 'General Electric' },
  { name: 'ETU 25B', desc: 'Siemens basic electronic trip unit', mfr: 'Siemens' },
  { name: 'ETU 45B', desc: 'Siemens advanced electronic trip unit', mfr: 'Siemens' },
  { name: 'ETU 55B', desc: 'Siemens premium electronic trip unit', mfr: 'Siemens' },
  { name: 'ETU 76B', desc: 'Siemens full-featured electronic trip unit', mfr: 'Siemens' },
  { name: 'Ekip Touch', desc: 'ABB next-gen electronic trip unit', mfr: 'ABB' },
  { name: 'Ekip Dip', desc: 'ABB DIP-switch electronic trip unit', mfr: 'ABB' },
  { name: 'Ekip Hi-Touch', desc: 'ABB premium electronic trip with metering', mfr: 'ABB' },
];
for (const trip of digitripModels) {
  TRIP_UNITS.push({
    slug: slugify(`${trip.mfr}-${trip.name}-electronic-trip-unit-manual`),
    title: `${trip.mfr} ${trip.name} Electronic Trip Unit Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: trip.mfr,
    subcategory: 'Trip Units',
    description: `${trip.mfr} ${trip.name} electronic trip unit technical documentation. ${trip.desc}. Programming instructions, setting ranges, characteristic curves, and wiring diagrams. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/',
    keywords: `${trip.name}, ${trip.mfr}, electronic trip unit, ${trip.desc}, circuit breaker trip, characteristic curves, LSIG`
  });
}

// ─── SWITCHGEAR & MISCELLANEOUS ─────────────────────────────────────────

const SWITCHGEAR: ManualEntry[] = [];

// Switchgear lineups by manufacturer
const switchgearLines = [
  { name: 'DS/DSII Metal-Enclosed Switchgear', mfr: 'Westinghouse', desc: 'Low-voltage metal-enclosed switchgear for DS and DSII power circuit breakers' },
  { name: 'Pow-R-Line Switchgear', mfr: 'Cutler-Hammer', desc: 'Low-voltage switchgear with Magnum DS breakers' },
  { name: 'AKD-8 Switchgear', mfr: 'General Electric', desc: 'Low-voltage metal-clad switchgear for AKR breakers' },
  { name: 'AKD-10 Switchgear', mfr: 'General Electric', desc: 'Low-voltage metal-clad switchgear for EntelliGuard breakers' },
  { name: 'AKD-20 Switchgear', mfr: 'General Electric', desc: 'Advanced low-voltage switchgear' },
  { name: 'GM-SG Switchgear', mfr: 'Siemens', desc: 'Low-voltage switchgear for WL series breakers' },
  { name: 'RL Switchgear', mfr: 'Siemens', desc: 'Low-voltage switchgear for SB/HB insulated case breakers' },
  { name: 'QED-2 Switchboard', mfr: 'Square D', desc: 'Low-voltage power distribution switchboard for Masterpact breakers' },
  { name: 'MNS Switchgear', mfr: 'ABB', desc: 'Low-voltage switchgear for Emax air circuit breakers' },
];
for (const sg of switchgearLines) {
  SWITCHGEAR.push({
    slug: slugify(`${sg.mfr}-${sg.name}-installation-manual`),
    title: `${sg.mfr} ${sg.name} Installation & Maintenance Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: sg.mfr,
    subcategory: 'Switchgear',
    description: `${sg.mfr} ${sg.name} manual. ${sg.desc}. Installation, operation, maintenance, and renewal parts. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/',
    keywords: `${sg.mfr}, ${sg.name}, switchgear, low voltage, power distribution, installation manual`
  });
}

// ─── COMBINE ALL ENTRIES ────────────────────────────────────────────────

const ALL_MANUALS: ManualEntry[] = [
  ...EATON_ICCB,
  ...GE_ICCB,
  ...SIEMENS_ICCB,
  ...SQUARED_ICCB,
  ...ABB_ICCB,
  ...ITE_ICCB,
  ...AC_ICCB,
  ...FPE_ICCB,
  ...MG_ICCB,
  ...BBC_ICCB,
  ...GOULD_ICCB,
  ...RETROFIT,
  ...TRIP_UNITS,
  ...SWITCHGEAR,
];

// ─── IMPORT FUNCTION ───────────────────────────────────────────────────

async function main() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log(`Prepared ${ALL_MANUALS.length} new manual entries`);
  console.log(`  Eaton/CH/WH: ${EATON_ICCB.length}`);
  console.log(`  GE: ${GE_ICCB.length}`);
  console.log(`  Siemens: ${SIEMENS_ICCB.length}`);
  console.log(`  Square D: ${SQUARED_ICCB.length}`);
  console.log(`  ABB: ${ABB_ICCB.length}`);
  console.log(`  ITE: ${ITE_ICCB.length}`);
  console.log(`  Allis-Chalmers: ${AC_ICCB.length}`);
  console.log(`  Federal Pacific: ${FPE_ICCB.length}`);
  console.log(`  Merlin Gerin: ${MG_ICCB.length}`);
  console.log(`  Brown Boveri: ${BBC_ICCB.length}`);
  console.log(`  Gould: ${GOULD_ICCB.length}`);
  console.log(`  Retrofit Kits: ${RETROFIT.length}`);
  console.log(`  Trip Units: ${TRIP_UNITS.length}`);
  console.log(`  Switchgear: ${SWITCHGEAR.length}`);

  // Deduplicate by slug
  const seenSlugs = new Set<string>();
  const uniqueManuals = ALL_MANUALS.filter(m => {
    if (seenSlugs.has(m.slug)) {
      console.log(`  Duplicate slug skipped: ${m.slug}`);
      return false;
    }
    seenSlugs.add(m.slug);
    return true;
  });

  console.log(`\n${uniqueManuals.length} unique entries after dedup`);

  // Check existing count
  const beforeCount = await db.execute('SELECT COUNT(*) as c FROM manuals');
  console.log(`Current DB count: ${beforeCount.rows[0].c}`);

  // Batch insert using INSERT OR IGNORE (won't overwrite existing slugs)
  const BATCH_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < uniqueManuals.length; i += BATCH_SIZE) {
    const batch = uniqueManuals.slice(i, i + BATCH_SIZE);
    const statements = batch.map(manual => ({
      sql: `INSERT OR IGNORE INTO manuals (slug, title, manual_number, category, manufacturer, subcategory, description, pdf_url, keywords)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        manual.slug,
        manual.title,
        manual.manual_number,
        manual.category,
        manual.manufacturer,
        manual.subcategory,
        manual.description,
        manual.pdf_url,
        manual.keywords,
      ],
    }));

    await db.batch(statements, 'write');
    inserted += batch.length;
    const pct = Math.round((inserted / uniqueManuals.length) * 100);
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(uniqueManuals.length / BATCH_SIZE)} — ${inserted}/${uniqueManuals.length} (${pct}%)`);
  }

  // Final stats
  const afterCount = await db.execute('SELECT COUNT(*) as c FROM manuals');
  const newCount = Number(afterCount.rows[0].c) - Number(beforeCount.rows[0].c);
  console.log(`\nDone! Added ${newCount} new manuals.`);
  console.log(`Total manuals in database: ${afterCount.rows[0].c}`);

  // Subcategory breakdown for Circuit Breakers
  const subs = await db.execute("SELECT subcategory, COUNT(*) as c FROM manuals WHERE category='Circuit Breakers' GROUP BY subcategory ORDER BY c DESC");
  console.log('\nCircuit Breaker subcategory breakdown:');
  for (const row of subs.rows) {
    console.log(`  ${row.subcategory || 'NULL'}: ${row.c}`);
  }

  // Manufacturer breakdown
  const mfrs = await db.execute('SELECT manufacturer, COUNT(*) as c FROM manuals GROUP BY manufacturer ORDER BY c DESC LIMIT 15');
  console.log('\nTop 15 manufacturers:');
  for (const row of mfrs.rows) {
    console.log(`  ${row.manufacturer}: ${row.c}`);
  }
}

main().catch(console.error);
