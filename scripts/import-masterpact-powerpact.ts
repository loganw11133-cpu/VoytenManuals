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
  search_priority: number;
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
// SQUARE D MASTERPACT NW — Low Voltage Air Circuit Breakers
// 800A–6300A, IEC/UL rated, Micrologic trip units
// The #1 requested missing product line on VoytenManuals
// ═══════════════════════════════════════════════════════════════════════

const nwModels = [
  { code: 'NW08', amps: 800 },
  { code: 'NW10', amps: 1000 },
  { code: 'NW12', amps: 1250 },
  { code: 'NW16', amps: 1600 },
  { code: 'NW20', amps: 2000 },
  { code: 'NW25', amps: 2500 },
  { code: 'NW30', amps: 3000 },
  { code: 'NW32', amps: 3200 },
  { code: 'NW40', amps: 4000 },
  { code: 'NW50', amps: 5000 },
  { code: 'NW63', amps: 6300 },
];

const nwTrips = [
  { trip: 'Micrologic 2.0', protection: 'LI', suffix: '2.0' },
  { trip: 'Micrologic 5.0', protection: 'LSI', suffix: '5.0' },
  { trip: 'Micrologic 6.0', protection: 'LSIG', suffix: '6.0' },
  { trip: 'Micrologic 7.0', protection: 'LSIG + Measurement', suffix: '7.0' },
];

// NW base entries (per frame size)
for (const nw of nwModels) {
  ALL.push({
    slug: slugify(`square-d-masterpact-${nw.code}-${nw.amps}a-air-circuit-breaker`),
    title: `Square D Masterpact ${nw.code} ${nw.amps}A Air Circuit Breaker — Manual & Specifications`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Square D',
    subcategory: 'Air Circuit Breakers',
    description: `Complete technical documentation for Square D / Schneider Electric Masterpact ${nw.code} ${nw.amps} Amp low voltage air circuit breaker. Drawout design, ${nw.amps <= 1600 ? '42kA–150kA' : '42kA–100kA'} interrupting capacity at 480V. Compatible with Micrologic 2.0, 5.0, 6.0, and 7.0 electronic trip units. Installation manual, wiring diagrams, maintenance procedures, and renewal parts. Available new, remanufactured, and reconditioned from Voyten Electric.`,
    pdf_url: 'NONE',
    keywords: `Masterpact ${nw.code}, Masterpact NW, ${nw.amps}A, Square D, Schneider Electric, air circuit breaker, ACB, low voltage, drawout, Micrologic, LVCB, buy Masterpact, Masterpact for sale, remanufactured, Voyten Electric, NW ${nw.amps}`,
    search_priority: 100,
  });
}

// NW + trip unit combinations (high-value specific configs)
for (const nw of nwModels) {
  for (const t of nwTrips) {
    ALL.push({
      slug: slugify(`square-d-masterpact-${nw.code}-${nw.amps}a-micrologic-${t.suffix}`),
      title: `Square D Masterpact ${nw.code} ${nw.amps}A with ${t.trip} (${t.protection}) — Specifications`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'Square D',
      subcategory: 'Air Circuit Breakers',
      description: `Square D / Schneider Electric Masterpact ${nw.code} ${nw.amps}A air circuit breaker configured with ${t.trip} electronic trip unit providing ${t.protection} protection. Drawout mounting, UL/IEC dual rated. Includes protection settings, coordination curves, wiring diagrams, and maintenance guide. Available from Voyten Electric — new, remanufactured, and reconditioned.`,
      pdf_url: 'NONE',
      keywords: `Masterpact ${nw.code}, ${nw.code} ${t.trip}, ${nw.amps}A ${t.protection}, Square D, Schneider Electric, Micrologic, air circuit breaker, ${t.trip}, Masterpact NW, buy Masterpact ${nw.code}, Voyten Electric`,
      search_priority: 95,
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SQUARE D MASTERPACT NT — Compact Air Circuit Breakers
// 630A–1600A
// ═══════════════════════════════════════════════════════════════════════

const ntModels = [
  { code: 'NT06', amps: 630 },
  { code: 'NT08', amps: 800 },
  { code: 'NT10', amps: 1000 },
  { code: 'NT12', amps: 1250 },
  { code: 'NT16', amps: 1600 },
];

for (const nt of ntModels) {
  ALL.push({
    slug: slugify(`square-d-masterpact-${nt.code}-${nt.amps}a-air-circuit-breaker`),
    title: `Square D Masterpact ${nt.code} ${nt.amps}A Compact Air Circuit Breaker — Manual & Specifications`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Square D',
    subcategory: 'Air Circuit Breakers',
    description: `Complete technical documentation for Square D / Schneider Electric Masterpact ${nt.code} ${nt.amps}A compact air circuit breaker. Narrow-body design for space-constrained applications, up to 150kA at 480V. Compatible with Micrologic 2.0, 5.0, 6.0 trip units. Installation, wiring, and maintenance documentation. Available from Voyten Electric.`,
    pdf_url: 'NONE',
    keywords: `Masterpact ${nt.code}, Masterpact NT, ${nt.amps}A, Square D, Schneider Electric, compact air circuit breaker, ACB, Micrologic, buy Masterpact NT, Voyten Electric, NW, NT`,
    search_priority: 95,
  });
}

// NT + trip combinations
for (const nt of ntModels) {
  for (const t of nwTrips.slice(0, 3)) { // NT uses 2.0, 5.0, 6.0 (not 7.0)
    ALL.push({
      slug: slugify(`square-d-masterpact-${nt.code}-${nt.amps}a-micrologic-${t.suffix}`),
      title: `Square D Masterpact ${nt.code} ${nt.amps}A with ${t.trip} (${t.protection}) — Specifications`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'Square D',
      subcategory: 'Air Circuit Breakers',
      description: `Square D / Schneider Electric Masterpact ${nt.code} ${nt.amps}A compact ACB with ${t.trip} trip unit, ${t.protection} protection. UL/IEC dual rated. Wiring diagrams, protection settings, and maintenance guide. Available from Voyten Electric.`,
      pdf_url: 'NONE',
      keywords: `Masterpact ${nt.code}, ${nt.amps}A, ${t.trip}, ${t.protection}, Square D, Schneider Electric, Masterpact NT, Voyten Electric`,
      search_priority: 90,
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SQUARE D MASTERPACT MTZ — Next-Generation (Replacement for NW/NT)
// ═══════════════════════════════════════════════════════════════════════

const mtzModels = [
  { series: 'MTZ1', range: '630–1600A', amps: [630, 800, 1000, 1250, 1600], replaces: 'NT' },
  { series: 'MTZ2', range: '800–3200A', amps: [800, 1000, 1250, 1600, 2000, 2500, 3200], replaces: 'NW08–NW32' },
  { series: 'MTZ3', range: '2500–6300A', amps: [2500, 3200, 4000, 5000, 6300], replaces: 'NW25–NW63' },
];

for (const mtz of mtzModels) {
  ALL.push({
    slug: slugify(`square-d-masterpact-${mtz.series.toLowerCase()}-air-circuit-breaker`),
    title: `Square D Masterpact ${mtz.series} ${mtz.range} Air Circuit Breaker — Manual & Specifications`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Square D',
    subcategory: 'Air Circuit Breakers',
    description: `Complete technical documentation for the Schneider Electric Masterpact ${mtz.series} next-generation air circuit breaker, covering ${mtz.range}. Replaces legacy Masterpact ${mtz.replaces}. Features MicroLogic X control unit with embedded Ethernet, power metering, and cybersecurity. UL 1066 and IEC 60947-2 rated. Available from Voyten Electric.`,
    pdf_url: 'NONE',
    keywords: `Masterpact ${mtz.series}, ${mtz.range}, Square D, Schneider Electric, next-gen ACB, MicroLogic X, replaces Masterpact ${mtz.replaces}, air circuit breaker, Voyten Electric`,
    search_priority: 95,
  });

  // Individual amp entries for each MTZ series
  for (const amps of mtz.amps) {
    ALL.push({
      slug: slugify(`square-d-masterpact-${mtz.series.toLowerCase()}-${amps}a`),
      title: `Square D Masterpact ${mtz.series} ${amps}A Air Circuit Breaker — Specifications`,
      manual_number: null,
      category: 'Circuit Breakers',
      manufacturer: 'Square D',
      subcategory: 'Air Circuit Breakers',
      description: `Schneider Electric Masterpact ${mtz.series} ${amps}A air circuit breaker. Next-generation replacement for Masterpact ${mtz.replaces}. MicroLogic X control unit, embedded power metering, IEC/UL dual rated. Installation, wiring, and commissioning documentation. Available from Voyten Electric.`,
      pdf_url: 'NONE',
      keywords: `Masterpact ${mtz.series}, ${amps}A, Square D, Schneider Electric, MicroLogic X, air circuit breaker, Voyten Electric, buy ${mtz.series}`,
      search_priority: 90,
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SQUARE D POWERPACT — Molded Case / Insulated Case Circuit Breakers
// H through R frames, 15A–2500A
// ═══════════════════════════════════════════════════════════════════════

const powerPactFrames = [
  { frame: 'H-Frame', range: '15–150A', trip: 'Thermal-Magnetic / Micrologic', sub: 'Molded Case' },
  { frame: 'J-Frame', range: '150–250A', trip: 'Thermal-Magnetic / Micrologic', sub: 'Molded Case' },
  { frame: 'L-Frame', range: '125–600A', trip: 'Thermal-Magnetic / Micrologic', sub: 'Molded Case' },
  { frame: 'P-Frame', range: '600–1200A', trip: 'Micrologic 3.0 / 5.0 / 6.0', sub: 'Insulated Case' },
  { frame: 'R-Frame', range: '1200–2500A', trip: 'Micrologic 3.0 / 5.0 / 6.0', sub: 'Insulated Case' },
];

for (const pp of powerPactFrames) {
  ALL.push({
    slug: slugify(`square-d-powerpact-${pp.frame.toLowerCase().replace(' ', '-')}-${pp.range}-circuit-breaker`),
    title: `Square D PowerPact ${pp.frame} ${pp.range} Circuit Breaker — Manual & Specifications`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Square D',
    subcategory: pp.sub,
    description: `Complete technical documentation for Square D / Schneider Electric PowerPact ${pp.frame} circuit breakers covering ${pp.range}. ${pp.trip} trip options. UL 489 listed. Installation manual, wiring diagrams, trip curves, and accessories catalog. Available new, remanufactured, and reconditioned from Voyten Electric.`,
    pdf_url: 'NONE',
    keywords: `PowerPact, ${pp.frame}, ${pp.range}, Square D, Schneider Electric, circuit breaker, ${pp.trip}, Micrologic, buy PowerPact, Voyten Electric, MCCB, ICCB`,
    search_priority: pp.sub === 'Insulated Case' ? 90 : 80,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// MICROLOGIC TRIP UNITS — Standalone entries
// High search volume for trip unit replacements/upgrades
// ═══════════════════════════════════════════════════════════════════════

const micrologic = [
  { model: 'Micrologic 2.0', prot: 'LI', desc: 'Long-time and Instantaneous protection. Basic overcurrent for Masterpact NW/NT.' },
  { model: 'Micrologic 5.0', prot: 'LSI', desc: 'Long-time, Short-time, and Instantaneous protection. Standard for most applications.' },
  { model: 'Micrologic 6.0', prot: 'LSIG', desc: 'Full LSI + Ground Fault protection. Required for service entrance and NEC 230.95 compliance.' },
  { model: 'Micrologic 7.0', prot: 'LSIG + Measurement', desc: 'Full protection with integrated power metering (V, A, W, VAR, PF, kWh).' },
  { model: 'Micrologic 3.0', prot: 'LSI', desc: 'Electronic trip for PowerPact P/R frame circuit breakers.' },
  { model: 'MicroLogic X', prot: 'LSIG + Metering + Ethernet', desc: 'Next-gen control unit for Masterpact MTZ with embedded communications and cybersecurity.' },
];

for (const m of micrologic) {
  ALL.push({
    slug: slugify(`square-d-${m.model.toLowerCase().replace(/\s/g, '-')}-trip-unit`),
    title: `Square D ${m.model} Electronic Trip Unit (${m.prot}) — Manual & Settings Guide`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Square D',
    subcategory: 'Trip Units',
    description: `${m.desc} Compatible with Masterpact NW, NT, and/or MTZ air circuit breakers. Includes protection setting tables, coordination curves, wiring diagrams, and commissioning procedures. Available from Voyten Electric.`,
    pdf_url: 'NONE',
    keywords: `${m.model}, ${m.prot}, Square D, Schneider Electric, trip unit, electronic trip, Masterpact, protection settings, buy ${m.model}, Voyten Electric`,
    search_priority: 85,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// MASTERPACT NW ACCESSORIES & CROSS-REFERENCES
// ═══════════════════════════════════════════════════════════════════════

const nwAccessories = [
  { title: 'Square D Masterpact NW Shunt Trip / Undervoltage Release — Installation & Wiring', kw: 'shunt trip, UVR, undervoltage release, MX, MN, Masterpact NW' },
  { title: 'Square D Masterpact NW Motor Operator (MCH) — Installation Manual', kw: 'motor operator, MCH, motorized close, Masterpact NW, remote operation' },
  { title: 'Square D Masterpact NW Auxiliary Switch & Contacts — Wiring Guide', kw: 'auxiliary switch, OF, SDE, SDV, auxiliary contacts, Masterpact NW' },
  { title: 'Square D Masterpact NW Drawout Cradle & Chassis — Installation Manual', kw: 'drawout cradle, chassis, racking, Masterpact NW, switchgear' },
  { title: 'Square D Masterpact NW to MTZ Retrofit / Upgrade Guide', kw: 'retrofit, upgrade, NW to MTZ, Masterpact replacement, migration guide' },
  { title: 'Square D Masterpact NW Renewal Parts & Accessories Catalog', kw: 'renewal parts, spare parts, accessories, Masterpact NW, replacement parts' },
  { title: 'Square D Masterpact NW Coordination & Selectivity Tables', kw: 'coordination, selectivity, time-current curves, TCC, Masterpact NW, protective coordination' },
  { title: 'Square D Masterpact NW vs Eaton Magnum DS — Cross-Reference Guide', kw: 'cross-reference, Masterpact NW vs Magnum DS, competitive comparison, interchangeability' },
];

for (const acc of nwAccessories) {
  ALL.push({
    slug: slugify(acc.title),
    title: acc.title,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Square D',
    subcategory: 'Air Circuit Breakers',
    description: `${acc.title}. Technical documentation for Square D / Schneider Electric Masterpact NW air circuit breaker accessories and reference materials. Available from Voyten Electric.`,
    pdf_url: 'NONE',
    keywords: `${acc.kw}, Square D, Schneider Electric, air circuit breaker, Voyten Electric`,
    search_priority: 80,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SCHNEIDER ELECTRIC DUPLICATE ENTRIES
// Many customers search "Schneider" instead of "Square D"
// ═══════════════════════════════════════════════════════════════════════

const schneiderKeyEntries = [
  { title: 'Schneider Electric Masterpact NW Low Voltage Air Circuit Breakers 800–6300A — Product Guide', kw: 'Schneider Electric, Masterpact NW, 800A, 1000A, 1250A, 1600A, 2000A, 2500A, 3200A, 4000A, 5000A, 6300A, ACB, air circuit breaker' },
  { title: 'Schneider Electric Masterpact NT Compact Air Circuit Breakers 630–1600A — Product Guide', kw: 'Schneider Electric, Masterpact NT, 630A, 800A, 1000A, 1250A, 1600A, compact ACB' },
  { title: 'Schneider Electric Masterpact MTZ Next-Generation Air Circuit Breakers — Product Guide', kw: 'Schneider Electric, Masterpact MTZ, MTZ1, MTZ2, MTZ3, MicroLogic X, next-generation ACB' },
  { title: 'Schneider Electric PowerPact Molded Case & Insulated Case Circuit Breakers — Product Guide', kw: 'Schneider Electric, PowerPact, H-Frame, J-Frame, L-Frame, P-Frame, R-Frame, MCCB, ICCB' },
  { title: 'Schneider Electric Micrologic Trip Units for Masterpact — Selection & Settings Guide', kw: 'Schneider Electric, Micrologic, 2.0, 5.0, 6.0, 7.0, trip unit, protection settings, Masterpact' },
];

for (const s of schneiderKeyEntries) {
  ALL.push({
    slug: slugify(s.title),
    title: s.title,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Schneider Electric',
    subcategory: 'Air Circuit Breakers',
    description: `${s.title}. Documentation for Schneider Electric (Square D) low voltage power circuit breakers. Available from Voyten Electric — buy new, remanufactured, and reconditioned.`,
    pdf_url: 'NONE',
    keywords: `${s.kw}, Square D, buy Masterpact, Voyten Electric`,
    search_priority: 90,
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

  console.log(`Prepared ${ALL.length} entries for import`);

  let inserted = 0;
  let skipped = 0;

  for (const entry of ALL) {
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
      if (msg.includes('UNIQUE') || msg.includes('unique')) {
        skipped++;
      } else {
        console.error(`Error inserting ${entry.slug}:`, msg);
      }
    }
  }

  console.log(`Done: ${inserted} inserted, ${skipped} skipped (duplicate slugs)`);

  // Verify
  const count = await db.execute('SELECT COUNT(*) as c FROM manuals');
  console.log(`Total manuals in database: ${(count.rows[0] as unknown as { c: number }).c}`);
}

main().catch(console.error);
