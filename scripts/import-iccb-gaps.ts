import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

interface M { slug: string; title: string; manual_number: string | null; category: string; manufacturer: string; subcategory: string; description: string; pdf_url: string; keywords: string; }

const ALL: M[] = [
  // GE Power Break I (original) — fully obsolete, parts-only market
  ...([800, 1200, 1600, 2000, 2500, 3200] as const).map(a => ({
    slug: `ge-power-break-i-${a}a-insulated-case-circuit-breaker`,
    title: `GE Power Break I ${a}A Insulated Case Circuit Breaker Manual`,
    manual_number: 'GEH-4693',
    category: 'Circuit Breakers',
    manufacturer: 'General Electric',
    subcategory: 'Insulated Case',
    description: `General Electric Power Break I (original) ${a}A insulated case circuit breaker manual. Fully discontinued — parts and remanufactured units available from Voyten Electric at 1-800-458-4001. Free PDF download from Voyten Manuals.`,
    pdf_url: 'https://apps.geindustrial.com/publibrary/checkout/GEH-4693?TNR=Installation+and+Instruction%7CGEH-4693%7CPDF&filename=GEH-4693D.pdf',
    keywords: `GE Power Break I, ${a}A, insulated case, obsolete, discontinued, replacement, parts, remanufactured, Voyten`
  })),

  // Cutler-Hammer SPB50 (50kAIC)
  ...([800, 1200, 1600] as const).map(a => ({
    slug: `cutler-hammer-spb50-${a}a-insulated-case-breaker`,
    title: `Cutler-Hammer SPB50 ${a}A Insulated Case Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Cutler-Hammer',
    subcategory: 'Insulated Case',
    description: `Cutler-Hammer SPB50 ${a}A insulated case circuit breaker (50kAIC). Westinghouse Type W heritage. Digitrip trip units. Available from Voyten Electric at 1-800-458-4001. Free PDF.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Cutler-Hammer/InsulatedCaseBreakers/',
    keywords: `Cutler-Hammer SPB50, ${a}A, 50kAIC, insulated case, ICCB, Digitrip, Type W, buy SPB50, Voyten`
  })),

  // Cutler-Hammer SPB65 (65kAIC) — most popular
  ...([800, 1200, 1600, 2000, 2500, 3000, 3200] as const).map(a => ({
    slug: `cutler-hammer-spb65-${a}a-insulated-case-breaker`,
    title: `Cutler-Hammer SPB65 ${a}A Insulated Case Circuit Breaker Manual`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Cutler-Hammer',
    subcategory: 'Insulated Case',
    description: `Cutler-Hammer SPB65 ${a}A insulated case circuit breaker (65kAIC). Most popular SPB frame. Digitrip electronic trip units. Available from Voyten Electric at 1-800-458-4001. Free PDF.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Cutler-Hammer/InsulatedCaseBreakers/',
    keywords: `Cutler-Hammer SPB65, ${a}A, 65kAIC, insulated case, ICCB, Digitrip, most popular, buy SPB65, Voyten`
  })),

  // Digitrip RMS 510 with REAL Eaton PDF
  {
    slug: 'eaton-digitrip-rms-510-trip-unit-il29005',
    title: 'Eaton Digitrip RMS 510 Trip Unit Instruction Manual — IL29005',
    manual_number: 'IL29005',
    category: 'Circuit Breakers',
    manufacturer: 'Eaton',
    subcategory: 'Trip Units',
    description: 'Eaton Digitrip RMS 510 electronic trip unit instruction manual IL29005. For DS, DSII, and Magnum power circuit breakers. Programming, settings, and characteristic curves. Free PDF download from Voyten Manuals.',
    pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/digitrip-rms-510-trip-units-il29005.pdf',
    keywords: 'Digitrip RMS 510, IL29005, Eaton, Westinghouse, DS, DSII, trip unit manual, electronic trip, programming'
  },

  // Digitrip RMS 910 with REAL Eaton PDF
  {
    slug: 'eaton-digitrip-rms-910-trip-unit-il29889b',
    title: 'Eaton Digitrip RMS 910 Trip Unit Instruction Manual — IL29889B',
    manual_number: 'IL29889B',
    category: 'Circuit Breakers',
    manufacturer: 'Eaton',
    subcategory: 'Trip Units',
    description: 'Eaton Digitrip RMS 910 electronic trip unit instruction manual. Advanced LSIG protection with POWERLOGIC communications for DS and DSII breakers. Free PDF download.',
    pdf_url: 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/low-voltage-air-circuit-breakers/ds-dsii-circuit-breakers/digitrip-rms-910-trip-units-for-low-voltage-circuit-breakers-il29889b.pdf',
    keywords: 'Digitrip RMS 910, IL29889B, Eaton, Westinghouse, DS, DSII, trip unit, LSIG, communications, POWERLOGIC'
  },

  // Westinghouse Amptector trip units (predecessor to Digitrip)
  {
    slug: 'westinghouse-amptector-i-a-trip-unit-manual',
    title: 'Westinghouse Amptector I-A Trip Unit Manual',
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Westinghouse',
    subcategory: 'Trip Units',
    description: 'Westinghouse Amptector I-A electronic trip unit for DS low-voltage power circuit breakers. Predecessor to Digitrip RMS. Legacy trip unit — replacements available from Voyten Electric at 1-800-458-4001. Free PDF.',
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Westinghouse/TripUnits/',
    keywords: 'Westinghouse Amptector, I-A, trip unit, DS breaker, legacy, Digitrip predecessor, obsolete, replacement, Voyten'
  },
  {
    slug: 'westinghouse-amptector-ii-a-trip-unit-manual',
    title: 'Westinghouse Amptector II-A Trip Unit Manual',
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: 'Westinghouse',
    subcategory: 'Trip Units',
    description: 'Westinghouse Amptector II-A electronic trip unit for DS and DSII power circuit breakers. Legacy trip unit with LSIG protection. Upgrade to Digitrip RMS available. Contact Voyten Electric at 1-800-458-4001. Free PDF.',
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/Westinghouse/TripUnits/',
    keywords: 'Westinghouse Amptector, II-A, trip unit, DS, DSII, LSIG, legacy, replacement, upgrade to Digitrip, Voyten'
  },

  // Siemens Type RL — high legacy demand from search analytics
  ...([800, 1200, 1600, 2000, 2500, 3000] as const).map(a => ({
    slug: `siemens-type-rl-${a}a-insulated-case-circuit-breaker`,
    title: `Siemens Type RL ${a}A Insulated Case Circuit Breaker Manual`,
    manual_number: 'SGIM-3068D',
    category: 'Circuit Breakers',
    manufacturer: 'Siemens',
    subcategory: 'Insulated Case',
    description: `Siemens Type RL ${a}A insulated case circuit breaker. Legacy Siemens/Allis-Chalmers power breaker — discontinued. Replacement options and remanufactured units from Voyten Electric at 1-800-458-4001. Free PDF.`,
    pdf_url: 'https://www.npeinc.com/manuals/Adobe%20E-Manuals/AC%20Stuff%20from%20Voyten/Siemens%20RL/Type%20RL%20Circuit%20Breakers%20%20SGIM-3068D.pdf',
    keywords: `Siemens RL, ${a}A, insulated case, ICCB, legacy, obsolete, Allis-Chalmers, replacement, remanufactured, Voyten`
  })),
];

async function main() {
  const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });
  const before = await db.execute('SELECT COUNT(*) as c FROM manuals');
  console.log(`Before: ${before.rows[0].c}`);

  const stmts = ALL.map(m => ({
    sql: `INSERT OR IGNORE INTO manuals (slug, title, manual_number, category, manufacturer, subcategory, description, pdf_url, keywords) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [m.slug, m.title, m.manual_number, m.category, m.manufacturer, m.subcategory, m.description, m.pdf_url, m.keywords],
  }));
  await db.batch(stmts, 'write');

  const after = await db.execute('SELECT COUNT(*) as c FROM manuals');
  console.log(`Added: ${Number(after.rows[0].c) - Number(before.rows[0].c)}`);
  console.log(`FINAL TOTAL: ${after.rows[0].c}`);
}
main().catch(console.error);
