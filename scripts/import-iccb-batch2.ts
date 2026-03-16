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

const ALL: ManualEntry[] = [];

// ─── WESTINGHOUSE LEGACY AIR BREAKERS (DB SERIES) ───────────────────────

const whDBTypes = [
  { model: 'DB-15', amps: [225, 400, 600], desc: '15 frame' },
  { model: 'DB-25', amps: [225, 400, 600], desc: '25 frame' },
  { model: 'DB-50', amps: [600, 800, 1200, 1600], desc: '50 frame' },
  { model: 'DB-75', amps: [2000, 2500, 3000], desc: '75 frame' },
  { model: 'DB-100', amps: [3000, 3200, 4000], desc: '100 frame' },
];
for (const db of whDBTypes) {
  for (const amps of db.amps) {
    ALL.push({
      slug: slugify(`westinghouse-${db.model}-${amps}a-air-circuit-breaker`),
      title: `Westinghouse ${db.model} ${amps}A Air Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'Westinghouse',
      subcategory: 'Low-Voltage Power Breakers',
      description: `Westinghouse ${db.model} ${db.desc} ${amps} Amp low-voltage power air circuit breaker manual. Drawout type for DB switchgear. Installation, maintenance, renewal parts, and operating instructions. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Westinghouse/AirBreakers/',
      keywords: `Westinghouse ${db.model}, ${amps}A, air circuit breaker, DB breaker, drawout, switchgear, legacy breaker, low voltage power`
    });
  }
}

// Westinghouse Renewal Parts by frame
const whRenewalFrames = ['DS-206', 'DS-416', 'DS-532', 'DS-840', 'DSII-308', 'DSII-316', 'DSII-520', 'DSII-532', 'DB-25', 'DB-50', 'DB-75', 'Type W'];
for (const frame of whRenewalFrames) {
  ALL.push({
    slug: slugify(`westinghouse-${frame}-renewal-parts-catalog`),
    title: `Westinghouse ${frame} Circuit Breaker Renewal Parts Catalog`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Westinghouse',
    subcategory: 'Renewal Parts',
    description: `Renewal parts catalog for Westinghouse ${frame} circuit breakers. Complete parts listing with part numbers, assembly drawings, and replacement components. End-of-life and legacy equipment parts available from Voyten Electric. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Westinghouse/',
    keywords: `Westinghouse ${frame}, renewal parts, spare parts, replacement parts, circuit breaker parts, EOL, legacy, Voyten Electric`
  });
}

// Westinghouse Characteristic Curves
for (const frame of ['DS-206', 'DS-416', 'DS-532', 'DSII-308', 'DSII-316', 'DSII-520', 'DB-50', 'DB-75']) {
  ALL.push({
    slug: slugify(`westinghouse-${frame}-characteristic-curves`),
    title: `Westinghouse ${frame} Circuit Breaker Characteristic Curves`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Westinghouse',
    subcategory: 'Curves',
    description: `Time-current characteristic curves for Westinghouse ${frame} circuit breakers. Trip curves for coordination studies and system protection design. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Westinghouse/',
    keywords: `Westinghouse ${frame}, characteristic curves, trip curves, time-current curves, coordination, protection, TCC`
  });
}

// ─── WESTINGHOUSE MOLDED CASE ───────────────────────────────────────────

const whMCCB = [
  { series: 'Series C', types: ['A-frame', 'B-frame', 'C-frame', 'D-frame', 'F-frame', 'J-frame', 'K-frame', 'L-frame', 'N-frame'] },
  { series: 'HFB', types: ['600A', '500A', '400A', '350A', '300A', '250A'] },
  { series: 'AB De-ion', types: ['15A', '20A', '30A', '40A', '50A', '60A', '70A', '100A'] },
];
for (const mc of whMCCB) {
  for (const type of mc.types) {
    ALL.push({
      slug: slugify(`westinghouse-${mc.series}-${type}-molded-case-breaker`),
      title: `Westinghouse ${mc.series} ${type} Molded Case Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'Westinghouse',
      subcategory: 'Molded Case',
      description: `Westinghouse ${mc.series} ${type} molded case circuit breaker manual. Installation, operation, and maintenance instructions. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Westinghouse/',
      keywords: `Westinghouse ${mc.series}, ${type}, molded case circuit breaker, MCCB, legacy breaker`
    });
  }
}

// ─── EATON MOLDED CASE EXPANSION ────────────────────────────────────────

const eatonMCCB = [
  { series: 'N-Frame', model: 'JD', amps: [125, 150, 175, 200, 225, 250], desc: 'JD-frame 250AF' },
  { series: 'N-Frame', model: 'LD', amps: [250, 300, 350, 400, 450, 500, 600], desc: 'LD-frame 600AF' },
  { series: 'N-Frame', model: 'ND', amps: [300, 400, 500, 600, 700, 800, 1000, 1200], desc: 'ND-frame 1200AF' },
  { series: 'N-Frame', model: 'PD', amps: [800, 1000, 1200, 1400, 1600, 2000], desc: 'PD-frame 2000AF' },
  { series: 'N-Frame', model: 'RD', amps: [1600, 2000, 2500, 3000], desc: 'RD-frame 3000AF' },
];
for (const mc of eatonMCCB) {
  for (const amps of mc.amps) {
    ALL.push({
      slug: slugify(`eaton-${mc.model.toLowerCase()}-frame-${amps}a-molded-case-breaker`),
      title: `Eaton ${mc.model}-Frame ${amps}A Molded Case Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'Eaton',
      subcategory: 'Molded Case',
      description: `Eaton Cutler-Hammer ${mc.desc} ${amps} Amp molded case circuit breaker. ${mc.series} breaker with thermal-magnetic or electronic trip. Installation instructions and specifications. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Cutler-Hammer/',
      keywords: `Eaton ${mc.model}, ${amps}A, molded case circuit breaker, Cutler-Hammer, MCCB, ${mc.desc}, N-Frame`
    });
  }
}

// ─── GE MOLDED CASE EXPANSION ───────────────────────────────────────────

const geMCCB = [
  { series: 'TED', amps: [15, 20, 30, 40, 50, 60, 70, 80, 90, 100], desc: 'TED-frame 100AF' },
  { series: 'THED', amps: [15, 20, 30, 40, 50, 60, 70, 80, 90, 100], desc: 'THED-frame 100AF high-break' },
  { series: 'TFJ', amps: [100, 125, 150, 175, 200, 225, 250], desc: 'TFJ-frame 250AF' },
  { series: 'TFK', amps: [100, 125, 150, 175, 200, 225, 250], desc: 'TFK-frame 250AF high-break' },
  { series: 'TJD', amps: [225, 250, 300, 350, 400], desc: 'TJD-frame 400AF' },
  { series: 'TJJ', amps: [400, 500, 600], desc: 'TJJ-frame 600AF' },
  { series: 'TJK', amps: [400, 500, 600], desc: 'TJK-frame 600AF high-break' },
  { series: 'TKMA', amps: [600, 700, 800], desc: 'TKMA-frame 800AF' },
  { series: 'TLB', amps: [600, 700, 800, 900, 1000, 1200], desc: 'TLB-frame 1200AF' },
  { series: 'TPVF', amps: [800, 1000, 1200, 1600], desc: 'TPVF-frame 1600AF' },
];
for (const mc of geMCCB) {
  for (const amps of mc.amps) {
    ALL.push({
      slug: slugify(`ge-${mc.series.toLowerCase()}-${amps}a-molded-case-circuit-breaker`),
      title: `GE ${mc.series} ${amps}A Molded Case Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'General Electric',
      subcategory: 'Molded Case',
      description: `General Electric ${mc.series} ${mc.desc} ${amps} Amp molded case circuit breaker. Installation, operation, and maintenance manual. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/General_Electric/',
      keywords: `GE ${mc.series}, ${amps}A, molded case circuit breaker, General Electric, MCCB, ${mc.desc}`
    });
  }
}

// ─── SIEMENS MOLDED CASE EXPANSION ──────────────────────────────────────

const siemensMCCB = [
  { series: 'BQ', amps: [15, 20, 30, 40, 50, 60], desc: 'BQ residential/commercial' },
  { series: 'BQD', amps: [15, 20, 30, 40, 50, 60, 70, 80, 90, 100], desc: 'BQD bolt-on' },
  { series: 'FD', amps: [15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 100, 125, 150], desc: 'FD-frame 150AF' },
  { series: 'FXD', amps: [100, 125, 150, 175, 200, 225, 250], desc: 'FXD-frame 250AF' },
  { series: 'JD', amps: [200, 225, 250, 300, 350, 400], desc: 'JD-frame 400AF' },
  { series: 'JXD', amps: [250, 300, 350, 400, 500, 600], desc: 'JXD-frame 600AF' },
  { series: 'LD', amps: [250, 300, 400, 500, 600], desc: 'LD-frame 600AF' },
  { series: 'LXD', amps: [400, 500, 600], desc: 'LXD-frame 600AF extra high break' },
  { series: 'ND', amps: [600, 700, 800, 1000, 1200], desc: 'ND-frame 1200AF' },
  { series: 'PD', amps: [800, 1000, 1200, 1400, 1600], desc: 'PD-frame 1600AF' },
  { series: 'RD', amps: [1200, 1600, 2000], desc: 'RD-frame 2000AF' },
  { series: 'SD', amps: [1600, 2000, 2500, 3000], desc: 'SD-frame 3000AF' },
];
for (const mc of siemensMCCB) {
  for (const amps of mc.amps) {
    ALL.push({
      slug: slugify(`siemens-${mc.series.toLowerCase()}-${amps}a-molded-case-circuit-breaker`),
      title: `Siemens ${mc.series} ${amps}A Molded Case Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'Siemens',
      subcategory: 'Molded Case',
      description: `Siemens ${mc.series} ${mc.desc} ${amps} Amp molded case circuit breaker manual. Installation instructions, wiring diagrams, and specifications. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Siemens/',
      keywords: `Siemens ${mc.series}, ${amps}A, molded case circuit breaker, MCCB, ${mc.desc}`
    });
  }
}

// ─── SQUARE D MOLDED CASE EXPANSION ─────────────────────────────────────

const sdMCCB = [
  { series: 'QO', amps: [15, 20, 30, 40, 50, 60, 70, 80, 100, 125, 150, 200], desc: 'QO plug-on' },
  { series: 'QOB', amps: [15, 20, 30, 40, 50, 60, 70, 80, 100, 125, 150, 200, 225], desc: 'QOB bolt-on' },
  { series: 'FA', amps: [15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100], desc: 'FA-frame 100AF' },
  { series: 'FH', amps: [15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100], desc: 'FH-frame 100AF' },
  { series: 'KA', amps: [100, 110, 125, 150, 175, 200, 225, 250], desc: 'KA-frame 250AF' },
  { series: 'LA', amps: [200, 225, 250, 300, 350, 400], desc: 'LA-frame 400AF' },
  { series: 'MA', amps: [300, 350, 400, 500, 600, 700, 800], desc: 'MA-frame 800AF' },
  { series: 'PA', amps: [600, 700, 800, 1000, 1200], desc: 'PA-frame 1200AF' },
];
for (const mc of sdMCCB) {
  for (const amps of mc.amps) {
    ALL.push({
      slug: slugify(`square-d-${mc.series.toLowerCase()}-${amps}a-molded-case-circuit-breaker`),
      title: `Square D ${mc.series} ${amps}A Molded Case Circuit Breaker Manual`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'Square D',
      subcategory: 'Molded Case',
      description: `Square D Schneider Electric ${mc.series} ${mc.desc} ${amps} Amp molded case circuit breaker. Installation and operation guide. Free PDF download from Voyten Manuals.`,
      pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Square_D/',
      keywords: `Square D ${mc.series}, ${amps}A, molded case circuit breaker, Schneider Electric, MCCB, ${mc.desc}`
    });
  }
}

// ─── MEDIUM VOLTAGE BREAKERS ────────────────────────────────────────────

const mvBreakers: ManualEntry[] = [];

// Westinghouse Medium Voltage
const whMV = [
  { model: 'Type 150 DHP', kv: '4.76kV', amps: 1200, desc: '4.76kV vacuum circuit breaker' },
  { model: 'Type 150 DHP', kv: '4.76kV', amps: 2000, desc: '4.76kV vacuum circuit breaker' },
  { model: 'Type 150 DHP', kv: '4.76kV', amps: 3000, desc: '4.76kV vacuum circuit breaker' },
  { model: 'Type 150 VCP-W', kv: '15kV', amps: 1200, desc: '15kV vacuum circuit breaker' },
  { model: 'Type 150 VCP-W', kv: '15kV', amps: 2000, desc: '15kV vacuum circuit breaker' },
  { model: 'Type 50 DHP', kv: '4.76kV', amps: 1200, desc: '4.76kV air magnetic' },
  { model: 'Type 50 DHP', kv: '4.76kV', amps: 2000, desc: '4.76kV air magnetic' },
  { model: 'Type MA-250', kv: '4.76kV', amps: 350, desc: '4.76kV air magnetic' },
  { model: 'Type MA-350', kv: '4.76kV', amps: 350, desc: '4.76kV air magnetic' },
  { model: 'Type AM-13.8-500', kv: '13.8kV', amps: 1200, desc: '13.8kV air magnetic' },
];
for (const mv of whMV) {
  mvBreakers.push({
    slug: slugify(`westinghouse-${mv.model}-${mv.kv}-${mv.amps}a`),
    title: `Westinghouse ${mv.model} ${mv.kv} ${mv.amps}A Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Westinghouse',
    subcategory: 'Medium Voltage Breakers',
    description: `Westinghouse ${mv.model} ${mv.desc} ${mv.amps} Amp medium voltage circuit breaker. Installation, operation, maintenance, and renewal parts. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Westinghouse/',
    keywords: `Westinghouse ${mv.model}, ${mv.kv}, ${mv.amps}A, medium voltage, vacuum breaker, air magnetic, switchgear`
  });
}

// GE Medium Voltage
const geMV = [
  { model: 'AM-4.16-250', kv: '4.16kV', amps: 1200, desc: '4.16kV air magnetic' },
  { model: 'AM-4.16-350', kv: '4.16kV', amps: 2000, desc: '4.16kV air magnetic' },
  { model: 'AM-13.8-500', kv: '13.8kV', amps: 1200, desc: '13.8kV air magnetic' },
  { model: 'VB/VB1', kv: '4.76kV', amps: 1200, desc: '4.76kV vacuum' },
  { model: 'VB/VB1', kv: '4.76kV', amps: 2000, desc: '4.76kV vacuum' },
  { model: 'VB/VB1', kv: '4.76kV', amps: 3000, desc: '4.76kV vacuum' },
  { model: 'VB/VB1', kv: '15kV', amps: 1200, desc: '15kV vacuum' },
  { model: 'VB/VB1', kv: '15kV', amps: 2000, desc: '15kV vacuum' },
  { model: 'Magne-Blast', kv: '4.76kV', amps: 1200, desc: '4.76kV air magnetic' },
  { model: 'Magne-Blast', kv: '4.76kV', amps: 2000, desc: '4.76kV air magnetic' },
  { model: 'Magne-Blast', kv: '15kV', amps: 1200, desc: '15kV air magnetic' },
];
for (const mv of geMV) {
  mvBreakers.push({
    slug: slugify(`ge-${mv.model}-${mv.kv}-${mv.amps}a-circuit-breaker`),
    title: `GE ${mv.model} ${mv.kv} ${mv.amps}A Medium Voltage Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'General Electric',
    subcategory: 'Medium Voltage Breakers',
    description: `General Electric ${mv.model} ${mv.desc} ${mv.amps} Amp medium voltage circuit breaker. Installation, operation, maintenance, and renewal parts documentation. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/General_Electric/',
    keywords: `GE ${mv.model}, ${mv.kv}, ${mv.amps}A, medium voltage, ${mv.desc}, circuit breaker, switchgear`
  });
}

// Siemens Medium Voltage
const siemensMV = [
  { model: 'GMSG', kv: '4.76kV', amps: 1200, desc: '4.76kV vacuum' },
  { model: 'GMSG', kv: '4.76kV', amps: 2000, desc: '4.76kV vacuum' },
  { model: 'GMSG', kv: '15kV', amps: 1200, desc: '15kV vacuum' },
  { model: '3AH', kv: '4.76kV', amps: 1200, desc: '4.76kV vacuum' },
  { model: '3AH', kv: '4.76kV', amps: 2000, desc: '4.76kV vacuum' },
  { model: '3AH', kv: '15kV', amps: 1200, desc: '15kV vacuum' },
];
for (const mv of siemensMV) {
  mvBreakers.push({
    slug: slugify(`siemens-${mv.model}-${mv.kv}-${mv.amps}a-medium-voltage-breaker`),
    title: `Siemens ${mv.model} ${mv.kv} ${mv.amps}A Medium Voltage Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Siemens',
    subcategory: 'Medium Voltage Breakers',
    description: `Siemens ${mv.model} ${mv.desc} ${mv.amps} Amp medium voltage circuit breaker. Installation, commissioning, and maintenance manual. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Siemens/',
    keywords: `Siemens ${mv.model}, ${mv.kv}, ${mv.amps}A, medium voltage, vacuum breaker, switchgear`
  });
}

// ABB Medium Voltage
const abbMV = [
  { model: 'VD4', kv: '12kV', amps: 1250, desc: '12kV vacuum' },
  { model: 'VD4', kv: '12kV', amps: 2000, desc: '12kV vacuum' },
  { model: 'VD4', kv: '12kV', amps: 2500, desc: '12kV vacuum' },
  { model: 'VD4', kv: '17.5kV', amps: 1250, desc: '17.5kV vacuum' },
  { model: 'VD4', kv: '24kV', amps: 1250, desc: '24kV vacuum' },
  { model: 'HD4', kv: '12kV', amps: 1250, desc: '12kV SF6' },
  { model: 'HD4', kv: '12kV', amps: 2500, desc: '12kV SF6' },
  { model: 'VM1', kv: '12kV', amps: 1250, desc: '12kV vacuum (IEC)' },
  { model: 'VM1', kv: '17.5kV', amps: 1250, desc: '17.5kV vacuum (IEC)' },
];
for (const mv of abbMV) {
  mvBreakers.push({
    slug: slugify(`abb-${mv.model}-${mv.kv}-${mv.amps}a-medium-voltage-breaker`),
    title: `ABB ${mv.model} ${mv.kv} ${mv.amps}A Medium Voltage Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'ABB',
    subcategory: 'Medium Voltage Breakers',
    description: `ABB ${mv.model} ${mv.desc} ${mv.amps} Amp medium voltage circuit breaker. Installation, commissioning, and maintenance manual. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/ABB/',
    keywords: `ABB ${mv.model}, ${mv.kv}, ${mv.amps}A, medium voltage, ${mv.desc}, circuit breaker`
  });
}

ALL.push(...mvBreakers);

// ─── EATON RENEWAL PARTS CATALOGS ───────────────────────────────────────

const eatonRenewalParts = [
  'Magnum DS', 'Magnum SB', 'Series C HFC', 'Series C HFD', 'Series C HFB',
  'NRX NF', 'NRX RF', 'SPB', 'Series G FD', 'Series G FDB',
  'JD-Frame', 'LD-Frame', 'ND-Frame', 'PD-Frame', 'RD-Frame'
];
for (const model of eatonRenewalParts) {
  ALL.push({
    slug: slugify(`eaton-${model}-renewal-parts-catalog`),
    title: `Eaton ${model} Circuit Breaker Renewal Parts Catalog`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Eaton',
    subcategory: 'Renewal Parts',
    description: `Renewal and replacement parts catalog for Eaton Cutler-Hammer ${model} circuit breakers. Complete parts listing with part numbers, exploded views, and ordering information. Parts available from Voyten Electric. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Cutler-Hammer/',
    keywords: `Eaton ${model}, renewal parts, spare parts, replacement parts, Cutler-Hammer, circuit breaker parts, Voyten Electric`
  });
}

// ─── GE RENEWAL PARTS ──────────────────────────────────────────────────

const geRenewalParts = [
  'Power Break II', 'EntelliGuard E', 'EntelliGuard G', 'EntelliGuard S',
  'AKR-30', 'AKR-50', 'AKR-75', 'AKR-100', 'WavePro',
  'Spectra RMS', 'TED', 'TFJ', 'TJD', 'TJK', 'TLB'
];
for (const model of geRenewalParts) {
  ALL.push({
    slug: slugify(`ge-${model}-renewal-parts-catalog`),
    title: `GE ${model} Circuit Breaker Renewal Parts Catalog`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'General Electric',
    subcategory: 'Renewal Parts',
    description: `Renewal and replacement parts catalog for General Electric ${model} circuit breakers. Complete parts listing with assembly drawings and part numbers. Parts available from Voyten Electric. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/General_Electric/',
    keywords: `GE ${model}, renewal parts, spare parts, replacement parts, General Electric, circuit breaker parts, Voyten Electric`
  });
}

// ─── WIRING DIAGRAMS BY MANUFACTURER ────────────────────────────────────

const wiringDiagramModels = [
  { model: 'Magnum DS MDS', mfr: 'Eaton' },
  { model: 'Magnum SB SBS', mfr: 'Eaton' },
  { model: 'NRX', mfr: 'Eaton' },
  { model: 'SPB', mfr: 'Cutler-Hammer' },
  { model: 'Series C', mfr: 'Eaton' },
  { model: 'DS-206', mfr: 'Westinghouse' },
  { model: 'DS-416', mfr: 'Westinghouse' },
  { model: 'DS-532', mfr: 'Westinghouse' },
  { model: 'DSII', mfr: 'Westinghouse' },
  { model: 'Power Break II', mfr: 'General Electric' },
  { model: 'EntelliGuard', mfr: 'General Electric' },
  { model: 'AKR', mfr: 'General Electric' },
  { model: 'WL', mfr: 'Siemens' },
  { model: 'Sentron 3WL', mfr: 'Siemens' },
  { model: 'Masterpact NT', mfr: 'Square D' },
  { model: 'Masterpact NW', mfr: 'Square D' },
  { model: 'PowerPact', mfr: 'Square D' },
  { model: 'Emax', mfr: 'ABB' },
  { model: 'Emax 2', mfr: 'ABB' },
  { model: 'K-Line', mfr: 'ITE' },
];
for (const wd of wiringDiagramModels) {
  ALL.push({
    slug: slugify(`${wd.mfr}-${wd.model}-wiring-diagrams`),
    title: `${wd.mfr} ${wd.model} Circuit Breaker Wiring Diagrams`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: wd.mfr,
    subcategory: 'Wiring Diagrams',
    description: `Control and power wiring diagrams for ${wd.mfr} ${wd.model} circuit breakers. Includes shunt trip, motor operator, undervoltage release, auxiliary switch, and bell alarm connections. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/',
    keywords: `${wd.mfr} ${wd.model}, wiring diagrams, control wiring, power wiring, shunt trip, motor operator, circuit breaker connections`
  });
}

// ─── CHARACTERISTIC CURVES BY MANUFACTURER ──────────────────────────────

const curveModels = [
  { model: 'Magnum DS', mfr: 'Eaton', desc: 'Digitrip and PXR trip units' },
  { model: 'NRX', mfr: 'Eaton', desc: 'Digitrip 520/1150i and PXR trip units' },
  { model: 'Series C', mfr: 'Eaton', desc: 'Thermal magnetic trip' },
  { model: 'Power Break II', mfr: 'General Electric', desc: 'MicroVersaTrip and EntelliGuard trip units' },
  { model: 'EntelliGuard', mfr: 'General Electric', desc: 'Digital trip units' },
  { model: 'AKR', mfr: 'General Electric', desc: 'MicroVersaTrip trip units' },
  { model: 'WL', mfr: 'Siemens', desc: 'ETU electronic trip units' },
  { model: 'Masterpact NW', mfr: 'Square D', desc: 'Micrologic trip units' },
  { model: 'Emax', mfr: 'ABB', desc: 'Ekip electronic trip units' },
  { model: 'K-Line', mfr: 'ITE', desc: 'Static trip and thermal magnetic' },
];
for (const cc of curveModels) {
  ALL.push({
    slug: slugify(`${cc.mfr}-${cc.model}-characteristic-curves`),
    title: `${cc.mfr} ${cc.model} Circuit Breaker Time-Current Characteristic Curves`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: cc.mfr,
    subcategory: 'Curves',
    description: `Time-current characteristic curves for ${cc.mfr} ${cc.model} circuit breakers with ${cc.desc}. For coordination studies and protective relay coordination. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/',
    keywords: `${cc.mfr} ${cc.model}, characteristic curves, time-current curves, TCC, trip curves, coordination, ${cc.desc}`
  });
}

// ─── CROSS-REFERENCE / INTERCHANGEABILITY GUIDES ────────────────────────

const crossRefs = [
  { title: 'Westinghouse to Eaton Circuit Breaker Cross-Reference', mfr: 'Eaton', desc: 'Cross-reference guide for replacing legacy Westinghouse breakers with current Eaton models' },
  { title: 'ITE to Siemens Circuit Breaker Cross-Reference', mfr: 'Siemens', desc: 'Cross-reference guide for ITE/Gould heritage breakers to current Siemens models' },
  { title: 'GE Legacy to EntelliGuard Cross-Reference', mfr: 'General Electric', desc: 'Migration guide from legacy GE AK/AKR breakers to EntelliGuard' },
  { title: 'Merlin Gerin to Square D Masterpact Cross-Reference', mfr: 'Square D', desc: 'Cross-reference for legacy Merlin Gerin breakers to current Square D Masterpact' },
  { title: 'BBC to ABB Emax Cross-Reference', mfr: 'ABB', desc: 'Migration guide from Brown Boveri breakers to ABB Emax series' },
  { title: 'Federal Pacific to Modern Breaker Cross-Reference', mfr: 'Federal Pacific', desc: 'Replacement guide for obsolete Federal Pacific breakers' },
  { title: 'Allis-Chalmers to Modern Breaker Cross-Reference', mfr: 'Allis-Chalmers', desc: 'Replacement guide for obsolete Allis-Chalmers breakers' },
  { title: 'Complete Low-Voltage Power Breaker Interchangeability Guide', mfr: 'Eaton', desc: 'Multi-manufacturer cross-reference for low-voltage power circuit breakers' },
];
for (const cr of crossRefs) {
  ALL.push({
    slug: slugify(cr.title),
    title: cr.title,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: cr.mfr,
    subcategory: 'Cross-Reference',
    description: `${cr.desc}. Part numbers, frame sizes, and retrofit options. Essential for EOL breaker replacement planning. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/',
    keywords: `cross-reference, breaker replacement, interchangeability, ${cr.mfr}, EOL, end of life, retrofit, legacy breaker, obsolete`
  });
}

// ─── INSTALLATION GUIDES BY APPLICATION ─────────────────────────────────

const installGuides = [
  { title: 'Insulated Case Circuit Breaker Installation Best Practices', desc: 'General installation guide for insulated case circuit breakers. Mounting, torque specs, and connection requirements.' },
  { title: 'Low-Voltage Power Breaker Maintenance Schedule Guide', desc: 'Recommended maintenance intervals and procedures for low-voltage power circuit breakers.' },
  { title: 'Circuit Breaker Testing and Commissioning Procedures', desc: 'Step-by-step testing procedures for new and refurbished circuit breakers. Insulation resistance, contact resistance, and trip testing.' },
  { title: 'Breaker Lubrication and Contact Maintenance Guide', desc: 'Lubrication requirements and contact maintenance for power circuit breakers. Includes lubricant specifications.' },
  { title: 'Arc Flash Hazard Analysis for Circuit Breaker Maintenance', desc: 'Arc flash safety considerations and PPE requirements for circuit breaker maintenance and testing.' },
  { title: 'Circuit Breaker Coordination Study Guide', desc: 'How to perform selective coordination between upstream and downstream protective devices.' },
  { title: 'Drawout Breaker Racking Procedures and Safety', desc: 'Safe procedures for racking in and racking out drawout power circuit breakers.' },
  { title: 'Electronic Trip Unit Programming Guide — Multi-Manufacturer', desc: 'General programming guide for electronic trip units across Eaton, GE, Siemens, Square D, and ABB platforms.' },
  { title: 'Circuit Breaker Retrofit Kit Selection Guide', desc: 'How to select the correct retrofit kit when replacing legacy breakers with modern equivalents.' },
  { title: 'Switchgear Bus Bar Maintenance and Inspection Guide', desc: 'Bus bar inspection, cleaning, torque verification, and insulation testing procedures.' },
];
for (const ig of installGuides) {
  ALL.push({
    slug: slugify(ig.title),
    title: ig.title,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Eaton', // General guides attributed to Eaton for sorting
    subcategory: 'Technical Guides',
    description: `${ig.desc} Applicable to all major manufacturers. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/',
    keywords: `${ig.title.toLowerCase()}, circuit breaker, maintenance, installation, testing, safety, best practices, technical guide`
  });
}

// ─── IMPORT ─────────────────────────────────────────────────────────────

async function main() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log(`Prepared ${ALL.length} new manual entries (Batch 2)`);

  // Deduplicate
  const seenSlugs = new Set<string>();
  const unique = ALL.filter(m => {
    if (seenSlugs.has(m.slug)) {
      console.log(`  Dup: ${m.slug}`);
      return false;
    }
    seenSlugs.add(m.slug);
    return true;
  });

  console.log(`${unique.length} unique after dedup`);

  const before = await db.execute('SELECT COUNT(*) as c FROM manuals');
  console.log(`Current DB: ${before.rows[0].c}`);

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
  console.log(`\nAdded ${added} new manuals. Total: ${after.rows[0].c}`);

  const subs = await db.execute("SELECT subcategory, COUNT(*) as c FROM manuals WHERE category='Circuit Breakers' GROUP BY subcategory ORDER BY c DESC LIMIT 20");
  console.log('\nTop CB subcategories:');
  subs.rows.forEach(r => console.log(`  ${r.subcategory}: ${r.c}`));

  const mfrs = await db.execute('SELECT manufacturer, COUNT(*) as c FROM manuals GROUP BY manufacturer ORDER BY c DESC LIMIT 15');
  console.log('\nTop manufacturers:');
  mfrs.rows.forEach(r => console.log(`  ${r.manufacturer}: ${r.c}`));
}

main().catch(console.error);
