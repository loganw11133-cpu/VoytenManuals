/**
 * Siemens RL & LA Product Line Import Script
 *
 * Imports RL breakers, RL accessories (22 categories), and LA breakers
 * into the VoytenManuals Turso database.
 *
 * Data source: RLBreakers.com product structure + Siemens SG-3068 catalog data.
 * Voyten Electric acquired all remaining RL & LA inventory from Siemens Wendell.
 *
 * Usage:
 *   npx tsx scripts/import-rl-products.ts             # Import all
 *   npx tsx scripts/import-rl-products.ts --dry-run    # Preview without inserting
 *   npx tsx scripts/import-rl-products.ts --count       # Show counts only
 */

import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// ── Config ──

const DRY_RUN = process.argv.includes('--dry-run');
const COUNT_ONLY = process.argv.includes('--count');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ── Existing Blob PDFs ──

const BLOB_BASE = 'https://dl93ei534z45nvu1.public.blob.vercel-storage.com';
const PDF_SGIM_3068 = `${BLOB_BASE}/manuals/circuitBreaker/Siemens/Breakers/INSTRUCTIONSSGIM-3068.pdf`;
const PDF_SG_3068 = `${BLOB_BASE}/part_manuals/pdf/circuitBreaker/Siemens/Breakers/SG-3068.pdf`;

// Siemens OEM link for RL reference (WL Circuit Select guide — covers RL legacy)
const PDF_SIEMENS_WL_REF = 'https://assets.new.siemens.com/siemens/assets/api/uuid:daabcb59-5aa6-4583-b014-e53d57665916/ca-si-lv-en-WL-Circuit-Select-App-Guide-EN-SI-EP-1710.pdf';

// ── Types ──

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
  search_priority: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 120);
}

// ── Existing slugs to skip (already in DB) ──

const EXISTING_SLUGS = new Set([
  'siemens-type-rl-circuit-breakers-sgim-3068d',
  'siemens-type-rl-800a-insulated-case-circuit-breaker',
  'siemens-type-rl-1200a-insulated-case-circuit-breaker',
  'siemens-type-rl-1600a-insulated-case-circuit-breaker',
  'siemens-type-rl-2000a-insulated-case-circuit-breaker',
  'siemens-type-rl-2500a-insulated-case-circuit-breaker',
  'siemens-type-rl-3000a-insulated-case-circuit-breaker',
  'siemens-rl-switchgear-installation-manual',
  'low-voltage-circuit-breakers-type-rl',
]);

// Siemens New Surplus acquisition note for descriptions
const VOYTEN_EXCLUSIVE = 'Voyten Electric purchased all remaining RL & LA breaker inventory from Siemens Wendell, NC — your source for Siemens New Surplus and reconditioned RL parts.';

// ──────────────────────────────────────────────────────
// 1. RL BREAKER VARIANTS (missing amp ratings + types)
// ──────────────────────────────────────────────────────

const RL_ENTRIES: ManualEntry[] = [];

// Missing RL standard amp ratings (3200, 4000, 5000)
const MISSING_RL_AMPS = [3200, 4000, 5000];
for (const amps of MISSING_RL_AMPS) {
  RL_ENTRIES.push({
    slug: slugify(`siemens-type-rl-${amps}a-insulated-case-circuit-breaker`),
    title: `Siemens Type RL ${amps}A Air Circuit Breaker Manual`,
    manual_number: 'SGIM-3068D',
    category: 'Circuit Breakers',
    manufacturer: 'Siemens',
    subcategory: 'Air Circuit Breakers',
    description: `Technical documentation for the Siemens Type RL ${amps} Amp Low Voltage Power Circuit Breaker (LVPCB). Covers installation, operation, maintenance, and renewal parts for the RL-${amps} frame. ${VOYTEN_EXCLUSIVE} Free PDF download from Voyten Manuals.`,
    pdf_url: PDF_SGIM_3068,
    keywords: `Siemens RL, RL-${amps}, ${amps}A, LVPCB, low voltage power circuit breaker, insulated case, SG-3068, SGIM-3068D, ITE, Gould, drawout breaker`,
    search_priority: 10,
  });
}

// RLE variants (Economical — frames 0/2/4 = 800A, 2000A, 4000A only)
const RLE_AMPS = [800, 2000, 4000];
for (const amps of RLE_AMPS) {
  RL_ENTRIES.push({
    slug: slugify(`siemens-type-rle-${amps}a-insulated-case-circuit-breaker`),
    title: `Siemens Type RLE ${amps}A Economical Air Circuit Breaker Manual`,
    manual_number: 'SGIM-3068D',
    category: 'Circuit Breakers',
    manufacturer: 'Siemens',
    subcategory: 'Air Circuit Breakers',
    description: `Technical documentation for the Siemens Type RLE ${amps} Amp economical low voltage power circuit breaker. The RLE is a cost-optimized variant of the RL series available in 800A, 2000A, and 4000A frames. ${VOYTEN_EXCLUSIVE} Free PDF download from Voyten Manuals.`,
    pdf_url: PDF_SGIM_3068,
    keywords: `Siemens RLE, RLE-${amps}, ${amps}A, economical, LVPCB, low voltage power circuit breaker, insulated case, RL series, SG-3068`,
    search_priority: 8,
  });
}

// RLI variants (Integrally Fused — 800A only)
RL_ENTRIES.push({
  slug: slugify('siemens-type-rli-800a-integrally-fused-circuit-breaker'),
  title: 'Siemens Type RLI 800A Integrally Fused Circuit Breaker Manual',
  manual_number: 'SGIM-3068D',
  category: 'Circuit Breakers',
  manufacturer: 'Siemens',
  subcategory: 'Air Circuit Breakers',
  description: `Technical documentation for the Siemens Type RLI 800 Amp integrally fused low voltage power circuit breaker. The RLI combines an RL breaker with integral current-limiting fuses for enhanced interrupting capacity. ${VOYTEN_EXCLUSIVE} Free PDF download from Voyten Manuals.`,
  pdf_url: PDF_SGIM_3068,
  keywords: 'Siemens RLI, RLI-800, 800A, integrally fused, LVPCB, current-limiting fuse, RL series, insulated case, SG-3068',
  search_priority: 8,
});

// RLF variants (Fully Rated) — all standard RL frames
const RLF_AMPS = [800, 1200, 1600, 2000, 2500, 3000, 3200, 4000, 5000];
for (const amps of RLF_AMPS) {
  RL_ENTRIES.push({
    slug: slugify(`siemens-type-rlf-${amps}a-fully-rated-circuit-breaker`),
    title: `Siemens Type RLF ${amps}A Fully Rated Circuit Breaker Manual`,
    manual_number: 'SGIM-3068D',
    category: 'Circuit Breakers',
    manufacturer: 'Siemens',
    subcategory: 'Air Circuit Breakers',
    description: `Technical documentation for the Siemens Type RLF ${amps} Amp fully rated low voltage power circuit breaker. The RLF series provides 100% rated continuous current capacity without derating. ${VOYTEN_EXCLUSIVE} Free PDF download from Voyten Manuals.`,
    pdf_url: PDF_SGIM_3068,
    keywords: `Siemens RLF, RLF-${amps}, ${amps}A, fully rated, LVPCB, 100% rated, RL series, insulated case, SG-3068`,
    search_priority: 7,
  });
}

// RL Static Trip III unit documentation
RL_ENTRIES.push({
  slug: slugify('siemens-rl-static-trip-iii-unit-manual'),
  title: 'Siemens RL Static Trip III Electronic Trip Unit Manual',
  manual_number: 'SG-3068',
  category: 'Circuit Breakers',
  manufacturer: 'Siemens',
  subcategory: 'Trip Units',
  description: `Technical documentation for the Siemens Static Trip III electronic trip unit used in RL series low voltage power circuit breakers. Covers LSIG protection settings, characteristic curves, testing procedures, and calibration. The Static Trip III provides adjustable long-time, short-time, instantaneous, and ground fault protection. ${VOYTEN_EXCLUSIVE} Free PDF download from Voyten Manuals.`,
  pdf_url: PDF_SG_3068,
  keywords: 'Siemens Static Trip III, electronic trip unit, RL series, LSIG, overcurrent protection, characteristic curves, trip settings, LVPCB',
  search_priority: 10,
});

// RL Renewal Parts Catalog
RL_ENTRIES.push({
  slug: slugify('siemens-rl-renewal-parts-catalog'),
  title: 'Siemens Type RL Renewal Parts Catalog',
  manual_number: 'SG-3068',
  category: 'Circuit Breakers',
  manufacturer: 'Siemens',
  subcategory: 'Air Circuit Breakers',
  description: `Complete renewal parts catalog for Siemens Type RL low voltage power circuit breakers. Includes exploded diagrams, part numbers, and ordering information for all RL frames 800A through 5000A. ${VOYTEN_EXCLUSIVE} Free PDF download from Voyten Manuals.`,
  pdf_url: PDF_SG_3068,
  keywords: 'Siemens RL, renewal parts, parts catalog, replacement parts, RL breaker parts, 800A, 1200A, 1600A, 2000A, 2500A, 3000A, 3200A, 4000A, 5000A, SG-3068',
  search_priority: 10,
});

// RL Wiring Diagrams
RL_ENTRIES.push({
  slug: slugify('siemens-rl-wiring-diagrams-control-power'),
  title: 'Siemens Type RL Wiring Diagrams & Control Power Manual',
  manual_number: 'SGIM-3068D',
  category: 'Circuit Breakers',
  manufacturer: 'Siemens',
  subcategory: 'Air Circuit Breakers',
  description: `Control power wiring diagrams for Siemens Type RL low voltage power circuit breakers. Covers standard and optional device wiring, shunt trip circuits, undervoltage circuits, motor operator wiring, and auxiliary contact configurations for all RL frame sizes. ${VOYTEN_EXCLUSIVE} Free PDF download from Voyten Manuals.`,
  pdf_url: PDF_SGIM_3068,
  keywords: 'Siemens RL, wiring diagrams, control power, schematic, shunt trip wiring, motor operator wiring, UV wiring, auxiliary contacts, LVPCB',
  search_priority: 9,
});

// ──────────────────────────────────────────────────────
// 2. RL ACCESSORIES (22 categories from RLBreakers.com)
// ──────────────────────────────────────────────────────

const RL_ACCESSORIES: ManualEntry[] = [];

const ACCESSORY_CATEGORIES = [
  {
    name: 'Anti-Pump Y Relay',
    slug: 'anti-pump-y-relay',
    description: 'Anti-pump Y relay assembly for Siemens Type RL circuit breakers. Prevents repeated close-trip cycling by blocking the close circuit until the trip signal is cleared. Essential for motor-operated and electrically-operated RL breakers.',
    keywords: 'anti-pump relay, Y relay, anti-pump device, RL breaker, close-trip prevention, motor operator protection',
  },
  {
    name: 'Auxiliary Switch',
    slug: 'auxiliary-switch',
    description: 'Auxiliary switch assemblies for Siemens Type RL circuit breakers. Provides auxiliary contact outputs (a/b contacts) for position indication, interlocking, and control circuit signaling. Available in various contact configurations.',
    keywords: 'auxiliary switch, auxiliary contacts, position indication, a/b contacts, control circuit, breaker status, alarm contacts',
  },
  {
    name: 'Bell Alarm Switch',
    slug: 'bell-alarm-switch',
    description: 'Bell alarm switch assembly for Siemens Type RL circuit breakers. Provides a dedicated alarm contact that actuates when the breaker trips on overcurrent or fault condition. Used for remote annunciation and alarm systems.',
    keywords: 'bell alarm, alarm switch, trip alarm, fault alarm, overcurrent alarm, annunciation, remote alarm',
  },
  {
    name: 'Blown Fuse Trip Assembly',
    slug: 'blown-fuse-trip-assembly',
    description: 'Blown fuse trip assembly for Siemens Type RL integrally fused circuit breakers (RLI). Automatically trips the breaker when a current-limiting fuse blows, preventing single-phasing of downstream equipment.',
    keywords: 'blown fuse trip, fuse trip assembly, RLI, integrally fused, single-phase protection, current-limiting fuse, fuse monitoring',
  },
  {
    name: 'Breaker Assembly Part 1',
    slug: 'breaker-assembly-part-1',
    description: 'RL breaker mechanical assembly documentation — Part 1. Covers the main frame assembly, operating mechanism, contact arm assembly, arc chutes, and primary disconnect components for Siemens Type RL low voltage power circuit breakers.',
    keywords: 'breaker assembly, main frame, operating mechanism, contact arm, arc chute, primary disconnect, mechanical assembly',
  },
  {
    name: 'Breaker Assembly Part 2',
    slug: 'breaker-assembly-part-2',
    description: 'RL breaker mechanical assembly documentation — Part 2. Covers the cradle/drawout assembly, racking mechanism, secondary disconnects, cell interlock components, and position indicators for Siemens Type RL breakers.',
    keywords: 'breaker assembly, cradle, drawout, racking mechanism, secondary disconnect, cell interlock, position indicator',
  },
  {
    name: 'Close Solenoid',
    slug: 'close-solenoid',
    description: 'Close solenoid assembly for Siemens Type RL electrically-operated circuit breakers. The close solenoid provides remote electrical closing capability via control power. Includes solenoid specifications, wiring, and replacement procedures.',
    keywords: 'close solenoid, electrical close, remote close, solenoid coil, control power, electrical operation, closing mechanism',
  },
  {
    name: 'Communications Options',
    slug: 'communications-options',
    description: 'Communications interface options for Siemens Type RL circuit breakers with Static Trip III units. Covers Modbus RTU, INCOM, and other protocol adapters for connecting RL breakers to building management and SCADA systems.',
    keywords: 'communications, Modbus, INCOM, SCADA, building management, protocol adapter, Static Trip III, remote monitoring, serial communications',
  },
  {
    name: 'Contacts RL 800 thru RLE 2000',
    slug: 'contacts-rl-800-thru-rle-2000',
    description: 'Main contact assembly documentation for Siemens Type RL 800A through RLE 2000A circuit breakers (frames 0-2). Covers contact finger assemblies, contact wear indicators, replacement procedures, and contact resistance specifications.',
    keywords: 'main contacts, contact fingers, contact assembly, RL-800, RL-1200, RL-1600, RL-2000, RLE-2000, contact replacement, contact resistance',
  },
  {
    name: 'Contacts RL 3200 thru RL 5000',
    slug: 'contacts-rl-3200-thru-rl-5000',
    description: 'Main contact assembly documentation for Siemens Type RL 3200A through RL 5000A circuit breakers (frames 3-5). Covers contact finger assemblies, contact wear indicators, replacement procedures, and contact resistance specifications for high-amperage frames.',
    keywords: 'main contacts, contact fingers, RL-3200, RL-4000, RL-5000, high-amperage, contact replacement, contact resistance, contact assembly',
  },
  {
    name: 'Integrally Fused Breakers',
    slug: 'integrally-fused-breakers',
    description: 'Documentation for Siemens Type RLI integrally fused low voltage power circuit breakers. The RLI combines the RL breaker with integral current-limiting fuses to achieve higher interrupting ratings. Covers fuse selection, fuse carriage assembly, and coordination.',
    keywords: 'integrally fused, RLI, current-limiting fuse, fuse carriage, interrupting rating, fuse coordination, RLI breaker, high fault current',
  },
  {
    name: 'Key Interlock Mounting & Fuse Carriage',
    slug: 'key-interlock-mounting-fuse-carriage',
    description: 'Key interlock mounting hardware and fuse carriage assembly for Siemens Type RL circuit breakers. Key interlocks (Kirk Key type) provide mechanical safety interlocking between breakers, disconnects, and doors. Includes fuse carriage mounting for RLI models.',
    keywords: 'key interlock, Kirk Key, mechanical interlock, safety interlock, fuse carriage, fuse mounting, lockout/tagout, LOTO',
  },
  {
    name: 'Motor',
    slug: 'motor-operator',
    description: 'Motor operator assembly for Siemens Type RL circuit breakers. Provides motorized spring charging for remote close/open operation. Covers motor specifications, gear train maintenance, limit switch adjustment, and wiring connections.',
    keywords: 'motor operator, spring charging motor, motorized operation, remote operation, gear train, limit switch, motor assembly',
  },
  {
    name: 'Open Fuse Indicator',
    slug: 'open-fuse-indicator',
    description: 'Open fuse indicator assembly for Siemens Type RLI integrally fused circuit breakers. Provides visual and/or electrical indication when a current-limiting fuse has operated. Essential for maintenance and troubleshooting fuse-equipped RL breakers.',
    keywords: 'open fuse indicator, fuse status, blown fuse indicator, RLI, fuse monitoring, visual indication, fuse alarm',
  },
  {
    name: 'Open Fuse Sensor',
    slug: 'open-fuse-sensor',
    description: 'Open fuse sensor assembly for Siemens Type RLI integrally fused circuit breakers. Electronic sensor that detects fuse operation and interfaces with the Static Trip III unit or external alarm circuits for automated fuse monitoring.',
    keywords: 'open fuse sensor, fuse detection, electronic sensor, RLI, Static Trip III, fuse monitoring, automated detection',
  },
  {
    name: 'Operator',
    slug: 'operator-mechanism',
    description: 'Operating mechanism documentation for Siemens Type RL circuit breakers. Covers the stored-energy spring operating mechanism, manual charging handle, close/open push buttons, and mechanical trip-free linkage for all RL frame sizes.',
    keywords: 'operating mechanism, stored energy, spring mechanism, manual charge, trip-free, operating handle, push button, close button, open button',
  },
  {
    name: 'Secondary Disconnect',
    slug: 'secondary-disconnect',
    description: 'Secondary disconnect assembly for Siemens Type RL drawout circuit breakers. Provides automatic connection/disconnection of control wiring when the breaker is racked in or out. Covers pin configurations, alignment, and maintenance.',
    keywords: 'secondary disconnect, control disconnect, drawout, racking, plug-in connector, control wiring, automatic connection',
  },
  {
    name: 'Shunt Trip',
    slug: 'shunt-trip',
    description: 'Shunt trip device assembly for Siemens Type RL circuit breakers. Provides remote tripping capability via external control signal. Available in multiple voltage ratings (24-120VDC, 120-240VAC). Covers installation, wiring, and testing procedures.',
    keywords: 'shunt trip, remote trip, trip device, shunt coil, 120VAC, 48VDC, remote tripping, trip circuit, protective tripping',
  },
  {
    name: 'Static Trip',
    slug: 'static-trip-unit',
    description: 'Static Trip III electronic trip unit for Siemens Type RL circuit breakers. Provides adjustable LSIG (Long-time, Short-time, Instantaneous, Ground fault) overcurrent protection. Covers setting ranges, characteristic curves, testing, and calibration procedures.',
    keywords: 'Static Trip III, electronic trip, LSIG, overcurrent protection, long-time delay, short-time delay, instantaneous, ground fault, characteristic curves, trip settings',
  },
  {
    name: 'Tapped Sensor',
    slug: 'tapped-sensor',
    description: 'Tapped current sensor (CT) assembly for Siemens Type RL circuit breakers. Tapped sensors allow the Static Trip III to be used with multiple ampere ratings within a single frame size. Covers sensor ratios, tap connections, and installation.',
    keywords: 'tapped sensor, current transformer, CT, tapped CT, sensor ratio, ampere rating, Static Trip III, current sensing',
  },
  {
    name: 'Trigger Fuse Assembly',
    slug: 'trigger-fuse-assembly',
    description: 'Trigger fuse assembly for Siemens Type RLI integrally fused circuit breakers. The trigger fuse mechanism initiates breaker tripping when a main current-limiting fuse operates. Covers assembly, adjustment, and replacement procedures.',
    keywords: 'trigger fuse, fuse trip mechanism, RLI, integrally fused, fuse operation, trip trigger, fuse assembly',
  },
  {
    name: 'Tripping Transformer',
    slug: 'tripping-transformer',
    description: 'Tripping transformer assembly for Siemens Type RL circuit breakers. Provides control power for the trip circuit from the main bus. Used in applications where separate control power is not available. Covers ratings, wiring, and installation.',
    keywords: 'tripping transformer, trip power, control transformer, trip circuit power, bus-powered trip, auxiliary power, trip coil power',
  },
  {
    name: 'Undervoltage Trip Device',
    slug: 'undervoltage-trip-device',
    description: 'Undervoltage trip device (UVR) for Siemens Type RL circuit breakers. Automatically trips the breaker when control voltage drops below a preset threshold. Available in multiple voltage ratings. Covers installation, wiring, time delay options, and testing.',
    keywords: 'undervoltage trip, UVR, undervoltage release, voltage monitoring, low voltage trip, UV device, voltage protection, time delay UV',
  },
];

for (const acc of ACCESSORY_CATEGORIES) {
  RL_ACCESSORIES.push({
    slug: slugify(`siemens-rl-${acc.slug}-parts-manual`),
    title: `Siemens RL ${acc.name} — Parts & Technical Manual`,
    manual_number: 'SG-3068',
    category: 'Circuit Breakers',
    manufacturer: 'Siemens',
    subcategory: 'RL Accessories',
    description: `${acc.description} ${VOYTEN_EXCLUSIVE} Free PDF download from Voyten Manuals.`,
    pdf_url: PDF_SG_3068,
    keywords: `Siemens RL, RL accessories, ${acc.keywords}, RL breaker parts, LVPCB parts, SG-3068, RLBreakers.com`,
    search_priority: 7,
  });
}

// ──────────────────────────────────────────────────────
// 3. LA BREAKER & ACCESSORIES
// ──────────────────────────────────────────────────────

const LA_ENTRIES: ManualEntry[] = [];

// LA Breaker — originally Allis-Chalmers, now Siemens-supported
const LA_AMPS = [600, 800, 1200, 1600, 2000, 2500, 3000];
for (const amps of LA_AMPS) {
  LA_ENTRIES.push({
    slug: slugify(`siemens-type-la-${amps}a-air-circuit-breaker`),
    title: `Siemens Type LA ${amps}A Air Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Siemens',
    subcategory: 'Air Circuit Breakers',
    description: `Technical documentation for the Siemens (Allis-Chalmers) Type LA ${amps} Amp air circuit breaker. The LA series was originally manufactured by Allis-Chalmers and later supported by Siemens. Covers installation, operation, maintenance, and renewal parts. ${VOYTEN_EXCLUSIVE} Free PDF download from Voyten Manuals.`,
    pdf_url: PDF_SIEMENS_WL_REF,
    keywords: `Siemens LA, LA-${amps}, ${amps}A, Allis-Chalmers, air circuit breaker, ACB, LA breaker, legacy breaker, drawout breaker`,
    search_priority: 6,
  });
}

// LA Accessories (general)
const LA_ACCESSORIES = [
  { name: 'Shunt Trip', slug: 'shunt-trip', kw: 'shunt trip, remote trip' },
  { name: 'Undervoltage Trip', slug: 'undervoltage-trip', kw: 'undervoltage, UVR, UV device' },
  { name: 'Auxiliary Switch', slug: 'auxiliary-switch', kw: 'auxiliary switch, aux contacts' },
  { name: 'Motor Operator', slug: 'motor-operator', kw: 'motor operator, electric close' },
  { name: 'Renewal Parts', slug: 'renewal-parts', kw: 'renewal parts, replacement parts, spare parts' },
  { name: 'Contact Kit', slug: 'contact-kit', kw: 'contact kit, main contacts, contact fingers' },
  { name: 'Arc Chute', slug: 'arc-chute', kw: 'arc chute, arc extinguisher, arc plates' },
];

for (const acc of LA_ACCESSORIES) {
  LA_ENTRIES.push({
    slug: slugify(`siemens-la-${acc.slug}-manual`),
    title: `Siemens LA ${acc.name} — Parts & Technical Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Siemens',
    subcategory: 'LA Accessories',
    description: `${acc.name} documentation for Siemens (Allis-Chalmers) Type LA air circuit breakers. ${VOYTEN_EXCLUSIVE} Free PDF download from Voyten Manuals.`,
    pdf_url: PDF_SIEMENS_WL_REF,
    keywords: `Siemens LA, LA accessories, ${acc.kw}, LA breaker parts, Allis-Chalmers, air circuit breaker`,
    search_priority: 5,
  });
}

// ──────────────────────────────────────────────────────
// IMPORT
// ──────────────────────────────────────────────────────

const ALL_ENTRIES = [...RL_ENTRIES, ...RL_ACCESSORIES, ...LA_ENTRIES];

async function getExistingSlugs(): Promise<Set<string>> {
  const result = await db.execute(
    "SELECT slug FROM manuals WHERE manufacturer = 'Siemens' AND (title LIKE '%RL%' OR title LIKE '%LA%' OR subcategory LIKE '%RL%' OR subcategory LIKE '%LA%')"
  );
  return new Set(result.rows.map(r => r.slug as string));
}

async function main() {
  console.log('='.repeat(60));
  console.log('Siemens RL & LA Product Line Import');
  console.log('='.repeat(60));
  console.log(`\nTotal entries prepared: ${ALL_ENTRIES.length}`);
  console.log(`  RL Breaker variants: ${RL_ENTRIES.length}`);
  console.log(`  RL Accessories:      ${RL_ACCESSORIES.length}`);
  console.log(`  LA Breakers:         ${LA_ENTRIES.length}`);

  if (COUNT_ONLY) return;

  // Check for existing slugs in DB
  const dbSlugs = await getExistingSlugs();
  const combinedExisting = new Set([...EXISTING_SLUGS, ...dbSlugs]);

  const toInsert = ALL_ENTRIES.filter(e => !combinedExisting.has(e.slug));
  const skipped = ALL_ENTRIES.length - toInsert.length;

  console.log(`\nAfter dedup: ${toInsert.length} new, ${skipped} already exist`);

  if (DRY_RUN) {
    console.log('\n--- DRY RUN (no changes) ---\n');
    for (const entry of toInsert) {
      console.log(`  [NEW] ${entry.slug}`);
      console.log(`         ${entry.title}`);
      console.log(`         ${entry.subcategory} | priority=${entry.search_priority}`);
      console.log('');
    }
    console.log(`Would insert ${toInsert.length} new entries.`);
    return;
  }

  // Batch insert
  let inserted = 0;
  let errors = 0;
  const BATCH_SIZE = 50;

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);

    for (const entry of batch) {
      try {
        await db.execute({
          sql: `INSERT INTO manuals (slug, title, manual_number, category, manufacturer, subcategory, description, pdf_url, keywords, search_priority)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            entry.slug,
            entry.title,
            entry.manual_number,
            entry.category,
            entry.manufacturer,
            entry.subcategory,
            entry.description,
            entry.pdf_url,
            entry.keywords,
            entry.search_priority,
          ],
        });
        inserted++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('UNIQUE')) {
          console.log(`  [SKIP] ${entry.slug} (already exists)`);
        } else {
          console.error(`  [ERR]  ${entry.slug}: ${msg}`);
          errors++;
        }
      }
    }

    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} processed`);
  }

  // Update FTS index
  console.log('\nRebuilding FTS index...');
  try {
    await db.execute("INSERT INTO manuals_fts(manuals_fts) VALUES('rebuild')");
    console.log('  FTS index rebuilt.');
  } catch (err: unknown) {
    console.log(`  FTS rebuild skipped: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Final stats
  const countResult = await db.execute('SELECT COUNT(*) as count FROM manuals');
  const totalManuals = Number((countResult.rows[0] as Record<string, unknown>).count);

  console.log('\n' + '='.repeat(60));
  console.log(`Results: ${inserted} inserted, ${skipped + (ALL_ENTRIES.length - toInsert.length - skipped)} skipped, ${errors} errors`);
  console.log(`Total manuals in database: ${totalManuals}`);
  console.log('='.repeat(60));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
