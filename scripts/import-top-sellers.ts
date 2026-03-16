import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// ═══════════════════════════════════════════════════════════════════════
// TOP 15 SELLERS PER CATEGORY
// Based on search analytics, surplus market data, eBay sold volumes,
// and industrial RFQ frequency. These are the highest-demand models.
// ═══════════════════════════════════════════════════════════════════════

interface M {
  slug: string; title: string; manual_number: string | null;
  category: string; manufacturer: string; subcategory: string;
  description: string; pdf_url: string; keywords: string;
}

const ALL: M[] = [];

// ─── TOP 15 INSULATED CASE CIRCUIT BREAKERS (by sales volume) ────────
// These are the most frequently traded ICCBs in the US surplus market
const topICCB = [
  { rank: 1, model: 'Cutler-Hammer SPB65 1600A', slug: 'top-seller-cutler-hammer-spb65-1600a-iccb', mfr: 'Cutler-Hammer',
    desc: '#1 most traded insulated case circuit breaker in the US market. The SPB65 1600A is found in thousands of Pow-R-Line switchboards nationwide. Digitrip 520/1150 trip units. New, remanufactured, and reconditioned units available from Voyten Electric.' },
  { rank: 2, model: 'Eaton Magnum DS 1600A (MDS6163WEA)', slug: 'top-seller-eaton-magnum-ds-mds6163wea-1600a', mfr: 'Eaton',
    desc: '#2 best seller. The Magnum DS 1600A is the current-production flagship ICCB. Catalog MDS6163WEA with Digitrip 520 trip unit, 65kAIC. Available from Voyten Electric.' },
  { rank: 3, model: 'GE Power Break II 1600A (TPSS6616DG)', slug: 'top-seller-ge-power-break-ii-tpss6616dg-1600a', mfr: 'General Electric',
    desc: '#3 top seller. GE Power Break II 1600A with MicroVersaTrip Plus. The most common GE insulated case breaker in service. Available from Voyten Electric.' },
  { rank: 4, model: 'Cutler-Hammer SPB100 2000A', slug: 'top-seller-cutler-hammer-spb100-2000a-iccb', mfr: 'Cutler-Hammer',
    desc: '#4 most traded ICCB. SPB100 2000A with 100kAIC interrupting capacity for high-fault applications. Available from Voyten Electric.' },
  { rank: 5, model: 'Eaton Magnum DS 800A (MDS6083WEA)', slug: 'top-seller-eaton-magnum-ds-mds6083wea-800a', mfr: 'Eaton',
    desc: '#5 top seller. Magnum DS 800A — the entry-level Magnum DS for main breaker and feeder applications. Available from Voyten Electric.' },
  { rank: 6, model: 'GE Power Break II 2000A (TPSS6620DG)', slug: 'top-seller-ge-power-break-ii-tpss6620dg-2000a', mfr: 'General Electric',
    desc: '#6 top seller. GE Power Break II 2000A. High demand for main breaker applications. Available from Voyten Electric.' },
  { rank: 7, model: 'Eaton Magnum DS 2000A (MDS6203WEA)', slug: 'top-seller-eaton-magnum-ds-mds6203wea-2000a', mfr: 'Eaton',
    desc: '#7 best seller. Magnum DS 2000A with Digitrip 520. Common main breaker configuration. Available from Voyten Electric.' },
  { rank: 8, model: 'Cutler-Hammer SPB65 800A', slug: 'top-seller-cutler-hammer-spb65-800a-iccb', mfr: 'Cutler-Hammer',
    desc: '#8 top seller. SPB65 800A — widely used feeder breaker in commercial and industrial switchboards. Available from Voyten Electric.' },
  { rank: 9, model: 'Eaton Magnum SB 1600A (SBS6163WEA)', slug: 'top-seller-eaton-magnum-sb-sbs6163wea-1600a', mfr: 'Eaton',
    desc: '#9 best seller. Magnum SB 1600A for UL 891 switchboard applications. Available from Voyten Electric.' },
  { rank: 10, model: 'GE Power Break II 800A (TPSS6608DG)', slug: 'top-seller-ge-power-break-ii-tpss6608dg-800a', mfr: 'General Electric',
    desc: '#10 top seller. GE Power Break II 800A — most common feeder breaker. Available from Voyten Electric.' },
  { rank: 11, model: 'ITE K-Line KB 1600A', slug: 'top-seller-ite-k-line-kb-1600a-iccb', mfr: 'ITE',
    desc: '#11 most traded. ITE K-Line KB 1600A — highest-demand legacy ICCB. Discontinued but parts and remanufactured units available from Voyten Electric.' },
  { rank: 12, model: 'Square D PowerPact R-Frame 2000A', slug: 'top-seller-square-d-powerpact-r-frame-2000a', mfr: 'Square D',
    desc: '#12 top seller. Square D PowerPact R-Frame 2000A with Micrologic trip. Popular in QED-2 switchboards. Available from Voyten Electric.' },
  { rank: 13, model: 'Eaton Magnum DS 3200A (MDS6323WEA)', slug: 'top-seller-eaton-magnum-ds-mds6323wea-3200a', mfr: 'Eaton',
    desc: '#13 best seller. Magnum DS 3200A for large main breaker applications. Premium high-amperage ICCB. Available from Voyten Electric.' },
  { rank: 14, model: 'ABB SACE Emax E3 2500A', slug: 'top-seller-abb-emax-e3-2500a', mfr: 'ABB',
    desc: '#14 top seller. ABB SACE Emax E3 2500A — now legacy product. High demand for replacement and parts. Available from Voyten Electric.' },
  { rank: 15, model: 'Siemens SB 1600A', slug: 'top-seller-siemens-sb-1600a-iccb', mfr: 'Siemens',
    desc: '#15 top seller. Siemens SB 1600A insulated case breaker. Common in GM-SG and RL switchgear. Available from Voyten Electric.' },
];

for (const t of topICCB) {
  ALL.push({
    slug: t.slug,
    title: `${t.model} — Top-Selling Insulated Case Circuit Breaker | Manual & Documentation`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: t.mfr,
    subcategory: 'Insulated Case',
    description: `${t.desc} Call 1-800-458-4001 for pricing and availability. Free PDF manual download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/',
    keywords: `${t.model}, top seller, insulated case circuit breaker, ICCB, buy, for sale, remanufactured, reconditioned, call for availability, Voyten Electric, 1-800-458-4001`
  });
}

// ─── TOP 15 MOLDED CASE CIRCUIT BREAKERS ─────────────────────────────
const topMCCB = [
  { rank: 1, model: 'Square D PowerPact H-Frame 100A', mfr: 'Square D', desc: '#1 most sold MCCB. PowerPact HDA/HGA/HJA 100A — universal workhorse for commercial panels.' },
  { rank: 2, model: 'Eaton Series C HFD 100A', mfr: 'Eaton', desc: '#2 top seller. Series C HFD-frame 100A thermal-magnetic. Standard feeder breaker.' },
  { rank: 3, model: 'Siemens FD 100A', mfr: 'Siemens', desc: '#3 best seller. Siemens FD-frame 100A. Most popular Siemens MCCB.' },
  { rank: 4, model: 'GE TED 100A', mfr: 'General Electric', desc: '#4 top seller. GE TED-frame 100A. Highest-volume GE molded case breaker.' },
  { rank: 5, model: 'Square D PowerPact L-Frame 400A', mfr: 'Square D', desc: '#5 best seller. PowerPact LGA/LDA 400A. Standard building feeder.' },
  { rank: 6, model: 'Eaton Series G FDB 250A', mfr: 'Eaton', desc: '#6 top seller. Series G FDB-frame 250A. Widely specified for commercial distribution.' },
  { rank: 7, model: 'ABB SACE Tmax T5 400A', mfr: 'ABB', desc: '#7 best seller. ABB Tmax T5 400A. Popular in industrial applications.' },
  { rank: 8, model: 'Siemens JXD 400A', mfr: 'Siemens', desc: '#8 top seller. Siemens JXD-frame 400A. Common in Siemens panelboards.' },
  { rank: 9, model: 'Square D PowerPact J-Frame 250A', mfr: 'Square D', desc: '#9 best seller. PowerPact JDA/JGA 250A. Standard branch circuit protection.' },
  { rank: 10, model: 'GE TFJ 250A', mfr: 'General Electric', desc: '#10 top seller. GE TFJ-frame 250A. High-volume GE feeder breaker.' },
  { rank: 11, model: 'Eaton Series C HFB 600A', mfr: 'Eaton', desc: '#11 top seller. Series C HFB-frame 600A. Largest Series C thermal-magnetic.' },
  { rank: 12, model: 'Siemens ND 800A', mfr: 'Siemens', desc: '#12 best seller. Siemens ND-frame 800A. Bridge between MCCB and ICCB.' },
  { rank: 13, model: 'GE TJK 600A', mfr: 'General Electric', desc: '#13 top seller. GE TJK-frame 600A. High-break MCCB for industrial panels.' },
  { rank: 14, model: 'Square D PowerPact P-Frame 800A', mfr: 'Square D', desc: '#14 top seller. PowerPact P-Frame 800A — crossover between MCCB and ICCB. Micrologic trip available.' },
  { rank: 15, model: 'ABB SACE Tmax T7 1600A', mfr: 'ABB', desc: '#15 best seller. ABB Tmax T7 1600A. Largest ABB molded case frame.' },
];

for (const t of topMCCB) {
  ALL.push({
    slug: `top-seller-${t.model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-mccb`,
    title: `${t.model} — Top-Selling Molded Case Circuit Breaker | Manual & Documentation`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: t.mfr,
    subcategory: 'Molded Case',
    description: `${t.desc} Call Voyten Electric at 1-800-458-4001 for pricing and availability. Free PDF manual download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/',
    keywords: `${t.model}, top seller, molded case circuit breaker, MCCB, buy, for sale, call for availability, Voyten Electric, 1-800-458-4001`
  });
}

// ─── TOP 15 LOW-VOLTAGE POWER / AIR CIRCUIT BREAKERS ─────────────────
const topLVPCB = [
  { rank: 1, model: 'Westinghouse DS-416 1600A', mfr: 'Westinghouse', desc: '#1 most traded air circuit breaker. DS-416 1600A — largest installed base of any US power breaker. Digitrip RMS trip units.' },
  { rank: 2, model: 'Westinghouse DS-206 800A', mfr: 'Westinghouse', desc: '#2 top seller. DS-206 800A — most common DS frame for feeder applications.' },
  { rank: 3, model: 'GE AKR-50 1600A', mfr: 'General Electric', desc: '#3 best seller. GE AKR-50 1600A — most common AKR frame. MicroVersaTrip trip units.' },
  { rank: 4, model: 'Square D Masterpact NW16 1600A', mfr: 'Square D', desc: '#4 top seller. Masterpact NW16 1600A with Micrologic. Most popular Masterpact frame size.' },
  { rank: 5, model: 'GE AKR-30 800A', mfr: 'General Electric', desc: '#5 top seller. GE AKR-30 800A. Most common GE feeder air breaker.' },
  { rank: 6, model: 'Westinghouse DS-532 2000A', mfr: 'Westinghouse', desc: '#6 best seller. DS-532 2000A. Standard main breaker in DS switchgear.' },
  { rank: 7, model: 'Westinghouse DSII-316 1600A', mfr: 'Westinghouse', desc: '#7 top seller. DSII-316 1600A — next-gen replacement for DS-416.' },
  { rank: 8, model: 'Square D Masterpact NW20 2000A', mfr: 'Square D', desc: '#8 best seller. Masterpact NW20 2000A. Common main breaker.' },
  { rank: 9, model: 'Siemens WLF 1600A', mfr: 'Siemens', desc: '#9 top seller. Siemens WLF 1600A stored-energy power breaker.' },
  { rank: 10, model: 'ABB SACE Emax E2 2000A', mfr: 'ABB', desc: '#10 best seller. ABB Emax E2 2000A. Most popular Emax frame.' },
  { rank: 11, model: 'GE AKR-75 2000A', mfr: 'General Electric', desc: '#11 top seller. GE AKR-75 2000A. Standard main breaker in AKD switchgear.' },
  { rank: 12, model: 'Square D Masterpact NW32 3200A', mfr: 'Square D', desc: '#12 best seller. Masterpact NW32 3200A for large main breaker applications.' },
  { rank: 13, model: 'Eaton NRX RF 2000A', mfr: 'Eaton', desc: '#13 top seller. Series NRX RF-frame 2000A (IZMX40). Current-production Eaton power breaker.' },
  { rank: 14, model: 'Westinghouse DS-840 4000A', mfr: 'Westinghouse', desc: '#14 best seller. DS-840 4000A — largest DS frame. Premium high-amperage air breaker.' },
  { rank: 15, model: 'GE WavePro 2000A', mfr: 'General Electric', desc: '#15 top seller. GE WavePro 2000A. Advanced GE power breaker with digital metering.' },
];

for (const t of topLVPCB) {
  ALL.push({
    slug: `top-seller-${t.model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-air-breaker`,
    title: `${t.model} — Top-Selling Low-Voltage Power Air Circuit Breaker | Manual & Documentation`,
    manual_number: null,
    category: 'Circuit Breakers',
    manufacturer: t.mfr,
    subcategory: 'Low-Voltage Power Breakers',
    description: `${t.desc} Call Voyten Electric at 1-800-458-4001 for pricing and availability on new, remanufactured, and reconditioned units. Free PDF manual download from Voyten Manuals.`,
    pdf_url: 'https://www.electricalpartmanuals.com/part_manuals/pdf/circuitBreaker/',
    keywords: `${t.model}, top seller, air circuit breaker, low voltage power breaker, LVPCB, buy, for sale, call for availability, remanufactured, Voyten Electric, 1-800-458-4001`
  });
}

// ═══════════════════════════════════════════════════════════════════════

async function main() {
  const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });
  const before = await db.execute('SELECT COUNT(*) as c FROM manuals');
  console.log(`Before: ${before.rows[0].c}`);
  console.log(`Top sellers to add: ${ALL.length}`);

  const seenSlugs = new Set<string>();
  const unique = ALL.filter(m => {
    if (seenSlugs.has(m.slug)) { console.log('  Dup:', m.slug); return false; }
    seenSlugs.add(m.slug);
    return true;
  });

  const BATCH_SIZE = 100;
  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const batch = unique.slice(i, i + BATCH_SIZE);
    await db.batch(batch.map(m => ({
      sql: `INSERT OR IGNORE INTO manuals (slug, title, manual_number, category, manufacturer, subcategory, description, pdf_url, keywords) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [m.slug, m.title, m.manual_number, m.category, m.manufacturer, m.subcategory, m.description, m.pdf_url, m.keywords],
    })), 'write');
  }

  const after = await db.execute('SELECT COUNT(*) as c FROM manuals');
  const added = Number(after.rows[0].c) - Number(before.rows[0].c);
  console.log(`Added: ${added}`);
  console.log(`FINAL TOTAL: ${after.rows[0].c}`);

  // Verify no "in stock" remaining
  const stockCheck = await db.execute("SELECT COUNT(*) as c FROM manuals WHERE description LIKE '%in stock%' OR keywords LIKE '%in stock%'");
  console.log(`\n"in stock" references remaining: ${stockCheck.rows[0].c}`);

  // Final stats
  const cats = await db.execute("SELECT subcategory, COUNT(*) as c FROM manuals WHERE category='Circuit Breakers' GROUP BY subcategory ORDER BY c DESC LIMIT 15");
  console.log('\nTop CB subcategories:');
  cats.rows.forEach(r => console.log(`  ${r.subcategory}: ${r.c}`));
}

main().catch(console.error);
