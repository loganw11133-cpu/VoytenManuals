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

// ═══════════════════════════════════════════════════════════════════════
// HIGH-VALUE TARGETS: Specific catalog numbers people search for
// These are the exact model strings that generate RFQs and purchases
// ═══════════════════════════════════════════════════════════════════════

// ─── EATON MAGNUM DS — TOP SELLERS (Specific catalog configs) ───────────
// People search "MDS6163WEA" or "Magnum DS 1600A" — these are money queries
const mdsHighValue = [
  { cat: 'MDS6163WEA', amps: 1600, frame: '3P', trip: 'Digitrip 520', int: '65kAIC', desc: 'Standard 1600A 3-pole, most popular MDS config' },
  { cat: 'MDS6203WEA', amps: 2000, frame: '3P', trip: 'Digitrip 520', int: '65kAIC', desc: 'Standard 2000A 3-pole' },
  { cat: 'MDS6083WEA', amps: 800, frame: '3P', trip: 'Digitrip 520', int: '65kAIC', desc: 'Standard 800A 3-pole' },
  { cat: 'MDS6123WEA', amps: 1200, frame: '3P', trip: 'Digitrip 520', int: '65kAIC', desc: 'Standard 1200A 3-pole' },
  { cat: 'MDS6253WEA', amps: 2500, frame: '3P', trip: 'Digitrip 520', int: '65kAIC', desc: 'Standard 2500A 3-pole' },
  { cat: 'MDS6303WEA', amps: 3000, frame: '3P', trip: 'Digitrip 520', int: '65kAIC', desc: 'Standard 3000A 3-pole' },
  { cat: 'MDS6323WEA', amps: 3200, frame: '3P', trip: 'Digitrip 520', int: '65kAIC', desc: 'Standard 3200A 3-pole' },
  { cat: 'MDS8163WEA', amps: 1600, frame: '3P', trip: 'Digitrip 1150', int: '85kAIC', desc: 'High-interrupting 1600A with 1150 trip' },
  { cat: 'MDS8203WEA', amps: 2000, frame: '3P', trip: 'Digitrip 1150', int: '85kAIC', desc: 'High-interrupting 2000A with 1150 trip' },
  { cat: 'MDS8083WEA', amps: 800, frame: '3P', trip: 'Digitrip 1150', int: '85kAIC', desc: 'High-interrupting 800A with 1150 trip' },
  { cat: 'MDS6164WEA', amps: 1600, frame: '4P', trip: 'Digitrip 520', int: '65kAIC', desc: '4-pole 1600A for switched neutral' },
  { cat: 'MDS6204WEA', amps: 2000, frame: '4P', trip: 'Digitrip 520', int: '65kAIC', desc: '4-pole 2000A for switched neutral' },
];
for (const m of mdsHighValue) {
  ALL.push({
    slug: slugify(`eaton-magnum-ds-${m.cat}-${m.amps}a-manual`),
    title: `Eaton Magnum DS ${m.cat} ${m.amps}A Insulated Case Circuit Breaker — Manual & Specifications`,
    manual_number: 'MN036006EN',
    category: 'Circuit Breakers',
    manufacturer: 'Eaton',
    subcategory: 'Insulated Case',
    description: `Complete technical documentation for Eaton Cutler-Hammer Magnum DS catalog number ${m.cat}. ${m.amps} Amp ${m.frame} insulated case circuit breaker with ${m.trip} trip unit, ${m.int} interrupting capacity. ${m.desc}. Installation manual, wiring diagrams, renewal parts, and characteristic curves. Available new, remanufactured, and reconditioned from Voyten Electric. Free PDF download.`,
    pdf_url: 'https://www.eaton.com/content/dam/eaton/products/low-voltage-power-distribution-controls-systems/power-circuit-breakers/magnum-ds-low-voltage-power-circuit-breakers/magnum-ds-instruction-manual-mn036006en.pdf',
    keywords: `${m.cat}, Eaton Magnum DS, ${m.amps}A, insulated case circuit breaker, ${m.trip}, ${m.int}, Cutler-Hammer, ICCB, buy Magnum DS, Magnum DS for sale, remanufactured, Voyten Electric`
  });
}

// ─── EATON MAGNUM SB (SBS) — TOP SELLERS ────────────────────────────────
const sbsHighValue = [
  { cat: 'SBS6163WEA', amps: 1600, trip: 'Digitrip 520', desc: 'Most popular SBS config' },
  { cat: 'SBS6083WEA', amps: 800, trip: 'Digitrip 520', desc: 'Standard 800A' },
  { cat: 'SBS6123WEA', amps: 1200, trip: 'Digitrip 520', desc: 'Standard 1200A' },
  { cat: 'SBS6203WEA', amps: 2000, trip: 'Digitrip 520', desc: 'Standard 2000A' },
  { cat: 'SBS6253WEA', amps: 2500, trip: 'Digitrip 520', desc: 'Standard 2500A' },
  { cat: 'SBS6303WEA', amps: 3000, trip: 'Digitrip 520', desc: 'Standard 3000A' },
  { cat: 'SBS6323WEA', amps: 3200, trip: 'Digitrip 520', desc: 'Standard 3200A' },
  { cat: 'SBSC163WEA', amps: 1600, trip: 'Digitrip 520MC', desc: '1600A with comms' },
  { cat: 'SBSC203WEA', amps: 2000, trip: 'Digitrip 520MC', desc: '2000A with comms' },
  { cat: 'SBSC083WEA', amps: 800, trip: 'Digitrip 520MC', desc: '800A with comms' },
];
for (const m of sbsHighValue) {
  ALL.push({
    slug: slugify(`eaton-magnum-sb-${m.cat}-${m.amps}a-manual`),
    title: `Eaton Magnum SB ${m.cat} ${m.amps}A Insulated Case Circuit Breaker — Manual & Specs`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Eaton',
    subcategory: 'Insulated Case',
    description: `Technical documentation for Eaton Cutler-Hammer Magnum SB catalog number ${m.cat}. ${m.amps} Amp 3-pole insulated case circuit breaker with ${m.trip} trip unit. ${m.desc}. Installation, wiring, renewal parts, characteristic curves. Available from Voyten Electric — new, remanufactured, reconditioned. Free PDF download.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Cutler-Hammer/InsulatedCaseBreakers/',
    keywords: `${m.cat}, Eaton Magnum SB, SBS, ${m.amps}A, insulated case, ${m.trip}, Cutler-Hammer, buy Magnum SB, for sale, remanufactured, Voyten`
  });
}

// ─── EATON SPB — SPECIFIC CATALOG NUMBERS ───────────────────────────────
const spbHighValue = [
  { style: 'SPB065', amps: 800, desc: 'SPB 800A 65kAIC' },
  { style: 'SPB065', amps: 1200, desc: 'SPB 1200A 65kAIC' },
  { style: 'SPB065', amps: 1600, desc: 'SPB 1600A 65kAIC' },
  { style: 'SPB065', amps: 2000, desc: 'SPB 2000A 65kAIC' },
  { style: 'SPB100', amps: 800, desc: 'SPB 800A 100kAIC' },
  { style: 'SPB100', amps: 1200, desc: 'SPB 1200A 100kAIC' },
  { style: 'SPB100', amps: 1600, desc: 'SPB 1600A 100kAIC' },
  { style: 'SPB100', amps: 2000, desc: 'SPB 2000A 100kAIC' },
  { style: 'SPB100', amps: 2500, desc: 'SPB 2500A 100kAIC' },
  { style: 'SPB100', amps: 3000, desc: 'SPB 3000A 100kAIC' },
  { style: 'SPB100', amps: 3200, desc: 'SPB 3200A 100kAIC' },
];
for (const m of spbHighValue) {
  ALL.push({
    slug: slugify(`cutler-hammer-${m.style}-${m.amps}a-insulated-case-breaker`),
    title: `Cutler-Hammer ${m.style} ${m.amps}A Insulated Case Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Cutler-Hammer',
    subcategory: 'Insulated Case',
    description: `Cutler-Hammer ${m.desc} insulated case circuit breaker. Westinghouse heritage Type W design with Digitrip electronic trip units. Installation, maintenance, renewal parts. Available from Voyten Electric. Free PDF download.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Cutler-Hammer/InsulatedCaseBreakers/',
    keywords: `${m.style}, Cutler-Hammer SPB, ${m.amps}A, insulated case, ICCB, Digitrip, Westinghouse, buy SPB, for sale, Voyten`
  });
}

// ─── GE POWER BREAK II — TOP CATALOG NUMBERS ───────────────────────────
const pbiiHighValue = [
  { cat: 'TPSS6616DG', amps: 1600, trip: 'MicroVersaTrip Plus', desc: 'Most common PB II' },
  { cat: 'TPSS6620DG', amps: 2000, trip: 'MicroVersaTrip Plus', desc: '2000A standard' },
  { cat: 'TPSS6608DG', amps: 800, trip: 'MicroVersaTrip Plus', desc: '800A standard' },
  { cat: 'TPSS6612DG', amps: 1200, trip: 'MicroVersaTrip Plus', desc: '1200A standard' },
  { cat: 'TPSS6625DG', amps: 2500, trip: 'MicroVersaTrip Plus', desc: '2500A' },
  { cat: 'TPSS6632DG', amps: 3200, trip: 'MicroVersaTrip Plus', desc: '3200A' },
  { cat: 'TPVF7616D', amps: 1600, trip: 'EntelliGuard', desc: '1600A EntelliGuard trip' },
  { cat: 'TPVF7620D', amps: 2000, trip: 'EntelliGuard', desc: '2000A EntelliGuard trip' },
  { cat: 'TPVF7625D', amps: 2500, trip: 'EntelliGuard', desc: '2500A EntelliGuard trip' },
  { cat: 'TPVF7632D', amps: 3200, trip: 'EntelliGuard', desc: '3200A EntelliGuard trip' },
];
for (const m of pbiiHighValue) {
  ALL.push({
    slug: slugify(`ge-power-break-ii-${m.cat}-${m.amps}a`),
    title: `GE Power Break II ${m.cat} ${m.amps}A Insulated Case Circuit Breaker — Manual & Specs`,
    manual_number: 'DEH-40272',
    category: 'Circuit Breakers',
    manufacturer: 'General Electric',
    subcategory: 'Insulated Case',
    description: `General Electric Power Break II catalog number ${m.cat}. ${m.amps} Amp insulated case circuit breaker with ${m.trip} trip unit. ${m.desc}. Installation, testing, renewal parts, and characteristic curves. Available from Voyten Electric. Free PDF download.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/General_Electric/InsulatedCaseBreakers/',
    keywords: `${m.cat}, GE Power Break II, PBII, ${m.amps}A, insulated case, ${m.trip}, General Electric, buy Power Break, for sale, remanufactured, Voyten`
  });
}

// ─── WESTINGHOUSE DS — MOST SEARCHED CONFIGS ────────────────────────────
const dsHighValue = [
  { cat: 'DS-416', amps: 1600, trip: 'Digitrip RMS 510', desc: 'Most common DS breaker in switchgear' },
  { cat: 'DS-416', amps: 1200, trip: 'Digitrip RMS 510', desc: 'Common 1200A DS' },
  { cat: 'DS-206', amps: 800, trip: 'Digitrip RMS 310', desc: '800A standard' },
  { cat: 'DS-206', amps: 600, trip: 'Digitrip RMS 310', desc: '600A standard' },
  { cat: 'DS-532', amps: 2000, trip: 'Digitrip RMS 510', desc: '2000A standard' },
  { cat: 'DS-532', amps: 2500, trip: 'Digitrip RMS 510', desc: '2500A' },
  { cat: 'DS-532', amps: 3200, trip: 'Digitrip RMS 610', desc: '3200A high capacity' },
  { cat: 'DS-840', amps: 4000, trip: 'Digitrip RMS 610', desc: '4000A largest DS frame' },
  { cat: 'DSII-308', amps: 800, trip: 'Digitrip 520', desc: 'DSII replacement for DS-206' },
  { cat: 'DSII-316', amps: 1600, trip: 'Digitrip 520', desc: 'DSII replacement for DS-416' },
  { cat: 'DSII-520', amps: 2000, trip: 'Digitrip 520', desc: 'DSII 2000A' },
  { cat: 'DSII-532', amps: 3200, trip: 'Digitrip 1150', desc: 'DSII 3200A with advanced trip' },
];
for (const m of dsHighValue) {
  ALL.push({
    slug: slugify(`westinghouse-${m.cat}-${m.amps}a-${m.trip.replace(/\s+/g, '-')}-air-breaker`),
    title: `Westinghouse ${m.cat} ${m.amps}A with ${m.trip} — Air Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Westinghouse',
    subcategory: 'Low-Voltage Power Breakers',
    description: `Westinghouse ${m.cat} ${m.amps} Amp low-voltage power air circuit breaker with ${m.trip} electronic trip unit. ${m.desc}. Drawout breaker for DS/DSII switchgear. Installation, maintenance, renewal parts, wiring diagrams. Available from Voyten Electric — new, remanufactured, reconditioned. Free PDF download.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Westinghouse/AirBreakers/',
    keywords: `Westinghouse ${m.cat}, ${m.amps}A, ${m.trip}, air circuit breaker, DS breaker, drawout, buy DS breaker, for sale, remanufactured, Voyten Electric`
  });
}

// ─── GE AKR — MOST SEARCHED CONFIGS ────────────────────────────────────
const akrHighValue = [
  { model: 'AKR-30F', amps: 800, trip: 'MicroVersaTrip PM', desc: 'Most common AKR-30 config' },
  { model: 'AKR-30H', amps: 800, trip: 'MicroVersaTrip Plus', desc: 'AKR-30 with Plus trip' },
  { model: 'AKR-50F', amps: 1600, trip: 'MicroVersaTrip PM', desc: 'Most common AKR-50 config' },
  { model: 'AKR-50H', amps: 1600, trip: 'MicroVersaTrip Plus', desc: 'AKR-50 with Plus trip' },
  { model: 'AKR-75F', amps: 2000, trip: 'MicroVersaTrip PM', desc: 'Standard AKR-75' },
  { model: 'AKR-75H', amps: 3000, trip: 'MicroVersaTrip Plus', desc: 'AKR-75 3000A with Plus trip' },
  { model: 'AKR-100H', amps: 4000, trip: 'MicroVersaTrip Plus', desc: 'Largest AKR frame' },
  { model: 'AK-2A-25', amps: 600, trip: 'Solid state', desc: 'Legacy AK-25' },
  { model: 'AK-2A-50', amps: 1600, trip: 'Solid state', desc: 'Legacy AK-50' },
  { model: 'AK-2A-75', amps: 3000, trip: 'Solid state', desc: 'Legacy AK-75' },
];
for (const m of akrHighValue) {
  ALL.push({
    slug: slugify(`ge-${m.model}-${m.amps}a-${m.trip.replace(/\s+/g, '-')}`),
    title: `GE ${m.model} ${m.amps}A with ${m.trip} — Power Air Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'General Electric',
    subcategory: 'Low-Voltage Power Breakers',
    description: `General Electric ${m.model} ${m.amps} Amp low-voltage power air circuit breaker with ${m.trip} trip unit. ${m.desc}. Drawout breaker for AKD switchgear. Installation, maintenance, renewal parts, wiring. Available from Voyten Electric. Free PDF download.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/General_Electric/AirBreakers/',
    keywords: `GE ${m.model}, ${m.amps}A, ${m.trip}, air circuit breaker, AKR breaker, AKD switchgear, buy AKR, for sale, Voyten`
  });
}

// ─── SQUARE D MASTERPACT — MOST SEARCHED ────────────────────────────────
const masterpactHV = [
  { cat: 'NW08', amps: 800, trip: 'Micrologic 5.0', variant: 'NW' },
  { cat: 'NW10', amps: 1000, trip: 'Micrologic 5.0', variant: 'NW' },
  { cat: 'NW12', amps: 1200, trip: 'Micrologic 5.0', variant: 'NW' },
  { cat: 'NW16', amps: 1600, trip: 'Micrologic 5.0', variant: 'NW' },
  { cat: 'NW20', amps: 2000, trip: 'Micrologic 6.0', variant: 'NW' },
  { cat: 'NW25', amps: 2500, trip: 'Micrologic 6.0', variant: 'NW' },
  { cat: 'NW30', amps: 3000, trip: 'Micrologic 6.0', variant: 'NW' },
  { cat: 'NW32', amps: 3200, trip: 'Micrologic 6.0', variant: 'NW' },
  { cat: 'NW40', amps: 4000, trip: 'Micrologic 6.0', variant: 'NW' },
  { cat: 'NT08', amps: 800, trip: 'Micrologic 5.0', variant: 'NT' },
  { cat: 'NT10', amps: 1000, trip: 'Micrologic 5.0', variant: 'NT' },
  { cat: 'NT12', amps: 1200, trip: 'Micrologic 5.0', variant: 'NT' },
  { cat: 'NT16', amps: 1600, trip: 'Micrologic 5.0', variant: 'NT' },
];
for (const m of masterpactHV) {
  ALL.push({
    slug: slugify(`square-d-masterpact-${m.cat}-${m.amps}a-${m.trip.replace(/\s+/g, '-')}`),
    title: `Square D Masterpact ${m.cat} ${m.amps}A with ${m.trip} — Manual & Documentation`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Square D',
    subcategory: 'Low-Voltage Power Breakers',
    description: `Square D Schneider Electric Masterpact ${m.variant} ${m.cat} ${m.amps} Amp power circuit breaker with ${m.trip} trip unit. Drawout and fixed mounting. Installation, operation, maintenance, and renewal parts. Available from Voyten Electric. Free PDF download.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Square_D/',
    keywords: `Masterpact ${m.cat}, Square D, ${m.amps}A, ${m.trip}, Schneider Electric, power breaker, buy Masterpact, for sale, Voyten`
  });
}

// ─── ABB EMAX — MOST SEARCHED ───────────────────────────────────────────
const emaxHV = [
  { model: 'E1B', amps: 800, trip: 'PR121/P', desc: '800A E1 basic' },
  { model: 'E1B', amps: 1600, trip: 'PR121/P', desc: '1600A E1 basic' },
  { model: 'E2B', amps: 2000, trip: 'PR121/P', desc: '2000A E2' },
  { model: 'E2S', amps: 1600, trip: 'PR122/P', desc: '1600A E2 high performance' },
  { model: 'E3H', amps: 2500, trip: 'PR122/P', desc: '2500A E3 high break' },
  { model: 'E3H', amps: 3200, trip: 'PR122/P', desc: '3200A E3 high break' },
  { model: 'E4H', amps: 4000, trip: 'PR123/P', desc: '4000A E4' },
  { model: 'E6H', amps: 5000, trip: 'PR123/P', desc: '5000A E6' },
  { model: 'E6V', amps: 6300, trip: 'PR123/P', desc: '6300A E6 maximum' },
  { model: 'E1.2C', amps: 1600, trip: 'Ekip Touch', desc: 'Emax2 1600A' },
  { model: 'E2.2S', amps: 2500, trip: 'Ekip Touch', desc: 'Emax2 2500A' },
  { model: 'E4.2N', amps: 4000, trip: 'Ekip Touch', desc: 'Emax2 4000A' },
  { model: 'E6.2H', amps: 6300, trip: 'Ekip Touch', desc: 'Emax2 6300A' },
];
for (const m of emaxHV) {
  ALL.push({
    slug: slugify(`abb-emax-${m.model}-${m.amps}a-${m.trip.replace(/[\/\s]+/g, '-')}`),
    title: `ABB SACE Emax ${m.model} ${m.amps}A with ${m.trip} — Air Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'ABB',
    subcategory: 'Low-Voltage Power Breakers',
    description: `ABB SACE Emax ${m.model} ${m.amps} Amp with ${m.trip} electronic trip unit. ${m.desc}. Low-voltage air circuit breaker for power distribution. Installation, commissioning, maintenance, renewal parts. Available from Voyten Electric. Free PDF download.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/ABB/',
    keywords: `ABB Emax ${m.model}, ${m.amps}A, ${m.trip}, SACE, air circuit breaker, buy Emax, for sale, remanufactured, Voyten`
  });
}

// ─── SIEMENS WL — SPECIFIC MODELS ──────────────────────────────────────
const wlHighValue = [
  { model: 'WLF2A320', amps: 2000, trip: 'ETU 45B', desc: '2000A WLF auto stored energy' },
  { model: 'WLF2A316', amps: 1600, trip: 'ETU 45B', desc: '1600A WLF' },
  { model: 'WLF2A308', amps: 800, trip: 'ETU 25B', desc: '800A WLF' },
  { model: 'WLF2A312', amps: 1200, trip: 'ETU 25B', desc: '1200A WLF' },
  { model: 'WLF2A325', amps: 2500, trip: 'ETU 55B', desc: '2500A WLF' },
  { model: 'WLF2A332', amps: 3200, trip: 'ETU 76B', desc: '3200A WLF' },
  { model: 'WLF2A340', amps: 4000, trip: 'ETU 76B', desc: '4000A WLF' },
  { model: 'WLF2A350', amps: 5000, trip: 'ETU 76B', desc: '5000A WLF largest frame' },
];
for (const m of wlHighValue) {
  ALL.push({
    slug: slugify(`siemens-${m.model}-${m.amps}a-power-breaker-manual`),
    title: `Siemens ${m.model} ${m.amps}A with ${m.trip} — Power Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Siemens',
    subcategory: 'Low-Voltage Power Breakers',
    description: `Siemens ${m.model} ${m.amps} Amp power circuit breaker with ${m.trip} electronic trip unit. ${m.desc}. Drawout air circuit breaker. Installation, commissioning, maintenance. Available from Voyten Electric. Free PDF download.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Siemens/',
    keywords: `Siemens ${m.model}, WL, ${m.amps}A, ${m.trip}, power circuit breaker, buy Siemens WL, for sale, Voyten`
  });
}

// ─── ITE K-LINE — LEGACY HIGH-DEMAND ────────────────────────────────────
const klineHV = [
  { model: 'KA3F800', amps: 800, desc: 'KA-frame 800A most common K-Line' },
  { model: 'KB3F1600', amps: 1600, desc: 'KB-frame 1600A' },
  { model: 'KB3F1200', amps: 1200, desc: 'KB-frame 1200A' },
  { model: 'KC3F2000', amps: 2000, desc: 'KC-frame 2000A' },
  { model: 'KC3F2500', amps: 2500, desc: 'KC-frame 2500A' },
  { model: 'KC3F3000', amps: 3000, desc: 'KC-frame 3000A' },
  { model: 'KD3F4000', amps: 4000, desc: 'KD-frame 4000A largest K-Line' },
  { model: 'KD3F3200', amps: 3200, desc: 'KD-frame 3200A' },
];
for (const m of klineHV) {
  ALL.push({
    slug: slugify(`ite-k-line-${m.model}-manual`),
    title: `ITE K-Line ${m.model} ${m.amps}A Insulated Case Circuit Breaker — Manual & Parts`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'ITE',
    subcategory: 'Insulated Case',
    description: `ITE K-Line ${m.model} ${m.amps} Amp insulated case circuit breaker. ${m.desc}. Now Siemens heritage — legacy EOL breaker with parts available from Voyten Electric. Installation, maintenance, renewal parts, wiring. Free PDF download.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/ITE/',
    keywords: `ITE K-Line ${m.model}, ${m.amps}A, insulated case, ICCB, Siemens, legacy, EOL, obsolete, buy K-Line, for sale, Voyten`
  });
}

// ─── EOL / END-OF-LIFE LANDING PAGES (HIGH COMMERCIAL INTENT) ──────────
// These target people searching for obsolete breaker replacements
const eolEntries = [
  { title: 'Westinghouse DS Breaker End-of-Life Replacement Guide', mfr: 'Westinghouse', model: 'DS', desc: 'Complete guide for replacing end-of-life Westinghouse DS power air circuit breakers. Options include Eaton Magnum DS retrofit kits, remanufactured DS breakers, and new replacement units.' },
  { title: 'Westinghouse Type W End-of-Life Replacement Guide', mfr: 'Westinghouse', model: 'Type W', desc: 'Replacement options for obsolete Westinghouse Type W insulated case circuit breakers.' },
  { title: 'GE AK/AKR End-of-Life Replacement Guide', mfr: 'General Electric', model: 'AK AKR', desc: 'Replacement guide for legacy GE AK and AKR power air circuit breakers. Options include GE EntelliGuard retrofit kits and remanufactured breakers.' },
  { title: 'ITE K-Line End-of-Life Replacement Guide', mfr: 'ITE', model: 'K-Line', desc: 'Replacement options for discontinued ITE K-Line insulated case circuit breakers. Siemens WL retrofit kits and remanufactured K-Line units.' },
  { title: 'Federal Pacific DMB End-of-Life Replacement Guide', mfr: 'Federal Pacific', model: 'DMB', desc: 'Replacement guide for obsolete Federal Pacific DMB power circuit breakers.' },
  { title: 'Allis-Chalmers LA End-of-Life Replacement Guide', mfr: 'Allis-Chalmers', model: 'LA', desc: 'Replacement options for discontinued Allis-Chalmers LA air circuit breakers.' },
  { title: 'Siemens SB Insulated Case End-of-Life Replacement Guide', mfr: 'Siemens', model: 'SB HB', desc: 'Replacement guide for legacy Siemens SB and HB insulated case circuit breakers.' },
  { title: 'Square D Masterpact M Legacy Replacement Guide', mfr: 'Square D', model: 'Masterpact M', desc: 'Upgrade path from legacy Merlin Gerin Masterpact M to current Square D Masterpact NW/MTZ.' },
  { title: 'ABB Emax Legacy Replacement and Upgrade Guide', mfr: 'ABB', model: 'Emax', desc: 'Upgrade guide from ABB Emax to Emax 2 series. Retrofit options and remanufactured units.' },
  { title: 'Cutler-Hammer SPB End-of-Life Replacement Guide', mfr: 'Cutler-Hammer', model: 'SPB', desc: 'Replacement options for legacy Cutler-Hammer SPB insulated case circuit breakers.' },
  { title: 'Gould/ITE Type F Air Breaker Replacement Guide', mfr: 'Gould', model: 'Type F', desc: 'Replacement guide for obsolete Gould/ITE Type F air circuit breakers.' },
  { title: 'Brown Boveri K-Don Replacement Guide', mfr: 'Brown Boveri Electric Inc', model: 'K-Don', desc: 'Replacement options for BBC Brown Boveri K-Don air circuit breakers.' },
  { title: 'Complete EOL Circuit Breaker Replacement Cross-Reference', mfr: 'Eaton', model: 'Multi-brand', desc: 'Master cross-reference guide for all end-of-life low-voltage power and insulated case circuit breakers. Covers Westinghouse, GE, ITE, Allis-Chalmers, Federal Pacific, Gould, and Brown Boveri legacy models with modern replacement options.' },
];
for (const eol of eolEntries) {
  ALL.push({
    slug: slugify(eol.title),
    title: eol.title,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: eol.mfr,
    subcategory: 'EOL Replacement Guides',
    description: `${eol.desc} Contact Voyten Electric at 1-800-458-4001 for pricing and availability on new, remanufactured, and reconditioned circuit breakers. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/',
    keywords: `${eol.model}, end of life, EOL, obsolete, discontinued, replacement, retrofit, ${eol.mfr}, buy circuit breaker, remanufactured, Voyten Electric, 1-800-458-4001`
  });
}

// ─── BUYING GUIDES / LEAD-GEN LANDING PAGES ─────────────────────────────
const buyingGuides = [
  { title: 'How to Buy Insulated Case Circuit Breakers — Complete Guide', desc: 'Comprehensive buying guide for new, remanufactured, and reconditioned insulated case circuit breakers. Frame sizes, amp ratings, trip units, and what to specify.' },
  { title: 'New vs Remanufactured Circuit Breakers — Buyers Guide', desc: 'Understanding the difference between new, remanufactured, reconditioned, and surplus circuit breakers. Cost comparison and warranty information.' },
  { title: 'Circuit Breaker Amp Rating and Frame Size Selection Guide', desc: 'How to select the correct amp rating and frame size for power circuit breakers. Coordination with upstream and downstream devices.' },
  { title: 'Digitrip Trip Unit Selection Guide — All Models', desc: 'Complete guide to selecting the right Digitrip electronic trip unit. Covers 310, 510, 520, 520M, 520MC, 810, 1150, and PXR models.' },
  { title: 'Circuit Breaker Interrupting Capacity Selection Guide', desc: 'How to determine the required interrupting capacity (AIC/kAIC) for your circuit breaker application.' },
  { title: 'Emergency Circuit Breaker Replacement — Same-Day Shipping', desc: 'Emergency and rush order circuit breaker replacement from Voyten Electric. Same-day and next-day shipping available on in-stock insulated case and power breakers.' },
  { title: 'Insulated Case vs Molded Case vs Power Air Breakers — Comparison', desc: 'Detailed comparison of insulated case (ICCB), molded case (MCCB), and power air circuit breakers. When to use each type.' },
  { title: 'Circuit Breaker Maintenance and Testing Services', desc: 'Professional circuit breaker maintenance, testing, and refurbishment services. NETA-certified testing and calibration.' },
  { title: 'Switchgear Modernization and Breaker Retrofit Solutions', desc: 'Comprehensive switchgear modernization services including breaker retrofits, bus bar upgrades, and control system updates.' },
  { title: 'Circuit Breaker Inventory — In-Stock Power Breakers', desc: 'Browse Voyten Electric in-stock inventory of insulated case, molded case, and power air circuit breakers. New, remanufactured, and reconditioned units.' },
];
for (const bg of buyingGuides) {
  ALL.push({
    slug: slugify(bg.title),
    title: bg.title,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Eaton',
    subcategory: 'Buying Guides',
    description: `${bg.desc} Voyten Electric — trusted source for electrical equipment since 1953. Call 1-800-458-4001 for immediate assistance. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/',
    keywords: `buy circuit breaker, circuit breaker for sale, insulated case, ICCB, remanufactured, reconditioned, Voyten Electric, 1-800-458-4001, same day shipping, emergency replacement`
  });
}

// ─── SENSOR / CURRENT TRANSFORMER ENTRIES ───────────────────────────────
// People search for specific sensor ratings to match their breakers
const sensorRatings = [
  { amps: 400, models: 'Magnum DS, Magnum SB, Power Break II' },
  { amps: 600, models: 'Magnum DS, Magnum SB, Power Break II, SPB' },
  { amps: 800, models: 'Magnum DS, Magnum SB, Power Break II, SPB, DS, AKR' },
  { amps: 1000, models: 'Magnum DS, Power Break II, Emax' },
  { amps: 1200, models: 'Magnum DS, Magnum SB, Power Break II, SPB, DS, AKR' },
  { amps: 1600, models: 'Magnum DS, Magnum SB, Power Break II, SPB, DS, AKR, WL' },
  { amps: 2000, models: 'Magnum DS, Power Break II, DS, AKR, WL, Masterpact' },
  { amps: 2500, models: 'Magnum DS, Power Break II, AKR, WL, Masterpact' },
  { amps: 3000, models: 'Magnum DS, DS, AKR, Masterpact' },
  { amps: 3200, models: 'Magnum DS, DS, AKR, WL, Masterpact, Emax' },
  { amps: 4000, models: 'Magnum DS, DS, AKR, WL, Emax' },
  { amps: 5000, models: 'Magnum DS, WL, Emax' },
  { amps: 6000, models: 'Magnum DS, Emax' },
];
for (const s of sensorRatings) {
  ALL.push({
    slug: slugify(`${s.amps}a-current-sensor-circuit-breaker-rating-plug`),
    title: `${s.amps}A Current Sensor / Rating Plug for Circuit Breakers — Cross-Reference`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Eaton',
    subcategory: 'Sensors & Rating Plugs',
    description: `${s.amps} Amp current sensor and rating plug cross-reference for insulated case and power circuit breakers. Compatible models include ${s.models}. Correct sensor selection for electronic trip units. Available from Voyten Electric. Free PDF download.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/',
    keywords: `${s.amps}A sensor, current sensor, rating plug, current transformer, circuit breaker sensor, ${s.models}, Voyten Electric`
  });
}

// ═══════════════════════════════════════════════════════════════════════
// IMPORT
// ═══════════════════════════════════════════════════════════════════════

async function main() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log(`Prepared ${ALL.length} HIGH-VALUE entries (Batch 3 — Lead Gen Focus)`);

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

  // Final comprehensive stats
  const cats = await db.execute('SELECT category, COUNT(*) as c FROM manuals GROUP BY category ORDER BY c DESC');
  console.log('\n=== FINAL CATEGORY BREAKDOWN ===');
  cats.rows.forEach(r => console.log(`  ${r.category}: ${r.c}`));

  const subs = await db.execute("SELECT subcategory, COUNT(*) as c FROM manuals WHERE category='Circuit Breakers' GROUP BY subcategory ORDER BY c DESC LIMIT 25");
  console.log('\n=== TOP 25 CB SUBCATEGORIES ===');
  subs.rows.forEach(r => console.log(`  ${r.subcategory}: ${r.c}`));

  const mfrs = await db.execute('SELECT manufacturer, COUNT(*) as c FROM manuals GROUP BY manufacturer ORDER BY c DESC LIMIT 20');
  console.log('\n=== TOP 20 MANUFACTURERS ===');
  mfrs.rows.forEach(r => console.log(`  ${r.manufacturer}: ${r.c}`));
}

main().catch(console.error);
