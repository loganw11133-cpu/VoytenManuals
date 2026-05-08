/**
 * Title Cleanup + Description Enrichment + Keyword Generation Script
 *
 * 1. Fixes garbled HTML encoding in titles (acirc, atilde, middot, quot, etc.)
 * 2. Normalizes ALL CAPS words to title case (preserving model numbers, acronyms)
 * 3. Generates enriched descriptions for manuals with only boilerplate text
 * 4. Generates SEO keywords for ALL manuals (populates `keywords` column)
 *
 * Run: npx tsx scripts/cleanup-titles-descriptions.ts [--dry-run]
 */

import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const DRY_RUN = process.argv.includes('--dry-run');

// ─── TITLE CLEANUP ──────────────────────────────────────────────────

// Garbled HTML entity patterns → proper characters
const ENCODING_FIXES: [RegExp, string | ((...args: string[]) => string)][] = [
  // Specific brand patterns first (order matters)
  [/Quotde Ionquot/gi, 'De-Ion'],
  [/Quotde ION Gridquot/gi, 'De-Ion Grid'],
  [/Quotpneu Draulicquot/gi, 'Pneu-Draulic'],
  [/DE ION GRID/g, 'De-Ion Grid'],
  [/DE ION/g, 'De-Ion'],
  [/Ionatildeacircreg/gi, 'Ion®'],
  [/Ionacircreg/gi, 'Ion®'],
  [/De Ionacircreg/gi, 'De-Ion®'],
  [/De Ion®/g, 'De-Ion®'],
  [/Lineatildeacircreg/gi, 'Lineá®'],
  [/Fluarcacircreg/gi, 'Fluarc®'],
  [/Fluaracircreg/gi, 'Fluarc®'],
  [/Microversatripacircreg/gi, 'MicroVersaTrip®'],
  [/Avibv Line[a-z®á]*(?:\u00AE)?/gi, 'I-Line®'],
  // &quot; encoding: "Ampquotdhampquot" → Type DH
  [/TYPE Ampquot([a-zA-Z]+)ampquot/gi, (_m: string, c: string) => `Type ${c.toUpperCase()}`],
  [/Ampquot([a-zA-Z]+)ampquot/gi, (_m: string, c: string) => `Type ${c.toUpperCase()}`],
  [/TYPE Quot([a-zA-Z])quot/gi, (_m: string, c: string) => `Type ${c.toUpperCase()}`],
  [/TYPE Quot([a-zA-Z]{2,})quot/gi, (_m: string, c: string) => `Type ${c.toUpperCase()}`],
  [/Quot([a-zA-Z])quot/gi, (_m: string, c: string) => `Type ${c.toUpperCase()}`],
  [/Quot([a-zA-Z]{2,})quot/gi, (_m: string, c: string) => `Type ${c.toUpperCase()}`],
  // Fractional inches
  [/(\d+)\s+38quot/g, '$1-3/8"'],
  [/(\d+)\s+12quot/g, '$1-1/2"'],
  [/(\d+)\s+14quot/g, '$1-1/4"'],
  [/(\d+)\s+34quot/g, '$1-3/4"'],
  [/(\d+)quot/g, '$1"'],
  // Garbled concatenation
  [/Sooaacircmiddotfcacircmiddot/gi, 'SOO/FC-'],
  [/acircmiddot/gi, '-'],
  [/acirccent/gi, ''],
  [/acircreg/gi, '®'],
  [/spacirccent/gi, ''],
  [/atildeacircreg/gi, '®'],
  [/atildeacirc/gi, ''],
  [/atilde/gi, ''],
  [/acirc/gi, ''],
  // Clean up resulting issues
  [/  +/g, ' '],
  [/- -/g, '-'],
  [/\( /g, '('],
  [/ \)/g, ')'],
];

const ALWAYS_UPPER = new Set([
  'AC', 'DC', 'KV', 'KVA', 'MVA', 'AMP', 'RMS', 'SF6', 'UL', 'IEC', 'ANSI',
  'IEEE', 'NEMA', 'CSP', 'RTD', 'CT', 'PT', 'VT', 'LED', 'LCD', 'HV', 'LV', 'MV',
  'MCC', 'UVR', 'LSIG', 'LSI', 'LI', 'ETU', 'MCB', 'MCCB', 'ACB', 'VCB', 'RC',
  'DS', 'DB', 'DH', 'DM', 'LA', 'HLA', 'KL', 'FA', 'FG', 'FZ', 'RL',
  'SPB', 'MDS', 'SBS', 'NRX', 'PRX', 'PXR', 'BD', 'XL', 'GM', 'GO',
  'SA', 'AA', 'FO', 'FB', 'FC', 'FR', 'MC', 'MA', 'QA',
  'IQ', 'II', 'III', 'IV', 'EHV', 'ASA', 'OIL', 'MTZ', 'MCH', 'OCR',
  'IL', 'IB', 'IS', 'IG', 'TM', 'RPD',
  'GEF', 'GED', 'GEH', 'GEI', 'GEK', 'GES', 'GET', 'SIL',
  'HP', 'RPM', 'KW', 'MW', 'VA',
  'ABB', 'GE', 'ITE', 'USA',
  'DPU', 'BE1', 'BE3', 'DM2F', 'DMD', 'BZO',
]);

const ALWAYS_LOWER = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'into', 'per', 'vs',
]);

const BRAND_CASING: Record<string, string> = {
  'de-ion': 'De-Ion',
  'deion': 'De-Ion',
  'de ion': 'De-Ion',
  'digitrip': 'Digitrip',
  'microversatrip': 'MicroVersaTrip',
  'magnum': 'Magnum',
  'masterpact': 'Masterpact',
  'vacarc': 'VacArc',
  'pow-r': 'Pow-R',
  'pow r': 'Pow-R',
  'powr': 'Pow-R',
  'magne blast': 'Magne-Blast',
  'ruptair': 'Ruptair',
  'fluarc': 'Fluarc',
  'porcel line': 'Porcel-Line',
  'life line': 'Life-Line',
  'lifeline': 'Life-Line',
  'ionatron': 'Ionatron',
  'sentron': 'SENTRON',
  'siprotec': 'SIPROTEC',
  'precipitron': 'Precipitron',
  'switchgear': 'Switchgear',
  'switchboard': 'Switchboard',
};

function fixEncoding(title: string): string {
  let result = title;
  for (const [pattern, replacement] of ENCODING_FIXES) {
    result = result.replace(pattern, replacement as any);
  }
  return result.trim();
}

function isModelNumber(word: string): boolean {
  if (/\d/.test(word) && /[a-zA-Z]/.test(word)) return true;
  if (/^\d+[aA]?$/.test(word)) return true;
  return false;
}

function normalizeTitle(title: string): string {
  let cleaned = fixEncoding(title);

  if (!cleaned.includes(' ') && cleaned.length > 10) {
    return cleaned;
  }
  const spaceWords = cleaned.split(/\s+/);
  const blobWords = spaceWords.filter(w => !w.includes(' ') && w.length > 15 && w === w.toUpperCase());
  if (blobWords.length > 0 && blobWords.length >= spaceWords.length / 2) {
    return cleaned;
  }

  for (const [pattern, replacement] of Object.entries(BRAND_CASING)) {
    const regex = new RegExp(`(?<=^|[\\s("])${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[\\s)".,:;!?])`, 'gi');
    cleaned = cleaned.replace(regex, replacement);
  }

  const words = cleaned.split(/\s+/);
  const result = words.map((word, i) => {
    const leadPunct = word.match(/^([("']+)/)?.[1] || '';
    const trailPunct = word.match(/([)"'.,;:!?]+)$/)?.[1] || '';
    const core = word.slice(leadPunct.length, word.length - (trailPunct.length || 0)) || word;

    const upper = core.toUpperCase();
    const lower = core.toLowerCase();

    if (core !== upper && core !== lower && core[0] === core[0].toUpperCase()) {
      return word;
    }

    if (core.length >= 20 && core === core.toUpperCase()) {
      return word;
    }

    if (core.includes('-') && core === core.toUpperCase() && /[A-Z]/.test(core)) {
      return word;
    }

    if (ALWAYS_UPPER.has(upper)) return leadPunct + upper + trailPunct;
    const undotted = upper.replace(/\./g, '');
    if (undotted !== upper && ALWAYS_UPPER.has(undotted)) return word.toUpperCase();

    if (isModelNumber(core)) return leadPunct + core.toUpperCase() + trailPunct;

    if (core === upper && core.length <= 3 && /^[A-Z]+$/.test(core)) {
      return word;
    }

    const prevWord = i > 0 ? words[i - 1] : '';
    const afterDash = prevWord.endsWith('—') || prevWord.endsWith('–');
    if (i > 0 && !afterDash && ALWAYS_LOWER.has(lower)) return leadPunct + lower + trailPunct;

    if (core === upper && core.length > 1) {
      return leadPunct + core[0] + core.slice(1).toLowerCase() + trailPunct;
    }

    return word;
  });

  return result.join(' ').trim();
}

// ─── DESCRIPTION ENRICHMENT ─────────────────────────────────────────

const CATEGORY_CONTEXT: Record<string, string> = {
  'Circuit Breakers': 'circuit breaker',
  'Relays and Meters': 'relay and metering equipment',
  'Motor Controls': 'motor control',
  'Switches': 'switch',
  'Fuses': 'fuse',
  'Transformers': 'transformer',
  'Bus Products': 'bus duct and busway',
  'Miscellaneous': 'electrical equipment',
};

const SUBCATEGORY_DESC: Record<string, string> = {
  'Air Circuit Breakers': 'air circuit breaker (ACB)',
  'Insulated Case': 'insulated case circuit breaker (ICCB)',
  'Molded Case': 'molded case circuit breaker (MCCB)',
  'Trip Units': 'electronic trip unit',
  'Vacuum Interrupters': 'vacuum interrupter',
  'Retrofit Kits': 'retrofit kit',
  'Renewal Parts': 'renewal parts and accessories',
  'Overcurrent Relays': 'overcurrent relay',
  'Protective Relays': 'protective relay',
  'Motor Starters': 'motor starter',
  'Contactors': 'contactor',
  'Disconnect Switches': 'disconnect switch',
  'Transfer Switches': 'transfer switch',
  'Safety Switches': 'safety switch',
  'Pad Mounted': 'pad-mounted transformer',
  'Dry Type': 'dry-type transformer',
};

const MANUFACTURER_CONTEXT: Record<string, string> = {
  'Westinghouse': 'Westinghouse Electric',
  'General Electric': 'General Electric (GE)',
  'Square D': 'Square D / Schneider Electric',
  'Cutler-Hammer': 'Cutler-Hammer / Eaton',
  'Eaton': 'Eaton',
  'Siemens': 'Siemens',
  'ABB': 'ABB',
  'ITE': 'ITE / ABB',
  'Allis-Chalmers': 'Allis-Chalmers',
  'Merlin Gerin': 'Merlin Gerin / Schneider Electric',
};

// Manufacturer acquisition/brand lineage for SEO keyword expansion
const MANUFACTURER_ALIASES: Record<string, string[]> = {
  'Westinghouse': ['Westinghouse Electric', 'Westinghouse breaker', 'Cutler-Hammer Westinghouse'],
  'General Electric': ['GE', 'GE breaker', 'General Electric breaker'],
  'Square D': ['Schneider Electric', 'Square D Schneider', 'Square D breaker'],
  'Cutler-Hammer': ['Eaton Cutler-Hammer', 'Eaton', 'Cutler Hammer'],
  'Eaton': ['Eaton Cutler-Hammer', 'Cutler-Hammer'],
  'Siemens': ['Siemens breaker', 'Siemens ITE'],
  'ABB': ['ABB breaker', 'ABB ITE', 'Asea Brown Boveri'],
  'ITE': ['ITE Imperial', 'ITE breaker', 'ITE ABB', 'Siemens ITE'],
  'Allis-Chalmers': ['Allis Chalmers', 'AC breaker'],
  'Merlin Gerin': ['Schneider Electric', 'Merlin Gerin Schneider'],
  'Federal Pacific': ['FPE', 'Federal Pacific Electric'],
  'Mitsubishi': ['Mitsubishi Electric'],
};

function detectDocType(titleLower: string): { docType: string; docTypeShort: string } {
  if (titleLower.includes('instruction') || titleLower.includes('installation'))
    return { docType: 'instruction and installation manual', docTypeShort: 'instruction manual' };
  if (titleLower.includes('renewal parts') || titleLower.includes('parts catalog') || titleLower.includes('parts list'))
    return { docType: 'renewal parts catalog with part numbers and assembly diagrams', docTypeShort: 'parts catalog' };
  if (titleLower.includes('characteristic') || titleLower.includes('curve'))
    return { docType: 'characteristic curves and coordination data', docTypeShort: 'characteristic curves' };
  if (titleLower.includes('retrofit'))
    return { docType: 'retrofit kit installation guide', docTypeShort: 'retrofit guide' };
  if (titleLower.includes('wiring') || titleLower.includes('diagram'))
    return { docType: 'wiring diagrams and connection details', docTypeShort: 'wiring diagram' };
  if (titleLower.includes('bulletin') || titleLower.includes('product'))
    return { docType: 'product bulletin with specifications and ordering information', docTypeShort: 'product bulletin' };
  if (titleLower.includes('test'))
    return { docType: 'testing and commissioning procedures', docTypeShort: 'testing procedures' };
  if (titleLower.includes('maintenance') || titleLower.includes('service'))
    return { docType: 'maintenance and service manual', docTypeShort: 'service manual' };
  if (titleLower.includes('application') || titleLower.includes('guide'))
    return { docType: 'application guide', docTypeShort: 'application guide' };
  if (titleLower.includes('catalog') || titleLower.includes('selection'))
    return { docType: 'selection and ordering catalog', docTypeShort: 'catalog' };
  if (titleLower.includes('cross reference') || titleLower.includes('cross-reference'))
    return { docType: 'cross-reference guide', docTypeShort: 'cross-reference' };
  return { docType: 'technical documentation', docTypeShort: 'technical manual' };
}

function generateDescription(manual: {
  title: string;
  manufacturer: string;
  category: string;
  subcategory: string | null;
  manual_number: string | null;
}): string {
  const mfrFull = MANUFACTURER_CONTEXT[manual.manufacturer] || manual.manufacturer;
  const catContext = CATEGORY_CONTEXT[manual.category] || manual.category.toLowerCase();
  const subDesc = manual.subcategory && manual.subcategory.toLowerCase() !== 'other'
    ? SUBCATEGORY_DESC[manual.subcategory] || manual.subcategory.toLowerCase()
    : null;

  const partNum = manual.manual_number ? ` (${manual.manual_number})` : '';
  const equipType = subDesc || catContext;

  const ampMatch = manual.title.match(/(\d+)\s*[Aa](?:mp(?:s|ere)?)?/);
  const kvMatch = manual.title.match(/(\d+(?:\.\d+)?)\s*[Kk][Vv]/);
  const specs: string[] = [];
  if (ampMatch) specs.push(`${ampMatch[1]}A`);
  if (kvMatch) specs.push(`${kvMatch[1]}kV`);
  const specStr = specs.length > 0 ? ` ${specs.join(', ')} rated.` : '';

  const { docType } = detectDocType(manual.title.toLowerCase());

  const sentences: string[] = [];
  sentences.push(`${mfrFull} ${equipType} ${docType}${partNum}.${specStr}`);

  if (docType === 'renewal parts catalog with part numbers and assembly diagrams') {
    sentences.push(`Includes exploded views, part numbers, and ordering information for replacement components.`);
  } else if (docType === 'instruction and installation manual') {
    sentences.push(`Covers installation, operation, and maintenance procedures.`);
  } else if (docType === 'retrofit kit installation guide') {
    sentences.push(`Step-by-step retrofit installation instructions with wiring details and compatibility information.`);
  } else if (docType === 'characteristic curves and coordination data') {
    sentences.push(`Includes time-current curves for protection coordination and selectivity studies.`);
  } else if (docType === 'wiring diagrams and connection details') {
    sentences.push(`Includes schematic diagrams, terminal connections, and control wiring details.`);
  } else if (docType === 'testing and commissioning procedures') {
    sentences.push(`Covers field testing procedures, test equipment requirements, and acceptance criteria.`);
  } else {
    sentences.push(`Technical reference for ${manual.manufacturer} ${manual.category.toLowerCase()} equipment.`);
  }

  sentences.push(`Free PDF download from Voyten Manuals — replacement parts and expert support available from Voyten Electric at 1-800-458-4001.`);

  return sentences.join(' ');
}

// ─── KEYWORD GENERATION ─────────────────────────────────────────────

function generateKeywords(manual: {
  title: string;
  manufacturer: string;
  category: string;
  subcategory: string | null;
  manual_number: string | null;
}): string {
  const kw = new Set<string>();
  const titleLower = manual.title.toLowerCase();

  // 1. Core identifiers
  kw.add(manual.manufacturer);
  kw.add(manual.category);
  if (manual.subcategory && manual.subcategory.toLowerCase() !== 'other') {
    kw.add(manual.subcategory);
  }
  if (manual.manual_number) {
    kw.add(manual.manual_number);
  }

  // 2. Manufacturer aliases (brand lineage for cross-search)
  const aliases = MANUFACTURER_ALIASES[manual.manufacturer];
  if (aliases) {
    for (const alias of aliases) kw.add(alias);
  }

  // 3. Title-derived keywords — extract meaningful words (skip noise)
  const NOISE = new Set(['the', 'a', 'an', 'and', 'or', 'for', 'of', 'to', 'in', 'on', 'at', 'by',
    'with', 'from', 'as', 'is', 'it', 'no', 'not', 'be', 'are', 'was', 'this', 'that',
    'type', 'style', 'series', 'model', 'page', 'pages', 'rev', 'revision']);
  const titleWords = manual.title.replace(/[®™©()[\]{}""'']/g, '').split(/[\s,;:—–\-\/]+/);
  for (const w of titleWords) {
    const clean = w.trim().toLowerCase();
    if (clean.length >= 2 && !NOISE.has(clean)) {
      kw.add(clean);
    }
  }

  // 4. Document type keywords
  const { docTypeShort } = detectDocType(titleLower);
  kw.add(docTypeShort);
  kw.add('manual');
  kw.add('PDF');
  kw.add('free download');

  // 5. Composite long-tail keywords (high SEO value)
  kw.add(`${manual.manufacturer} manual`);
  kw.add(`${manual.manufacturer} ${manual.category.toLowerCase()} manual`);
  kw.add(`${manual.manufacturer} ${docTypeShort}`);
  if (manual.manual_number) {
    kw.add(`${manual.manual_number} manual`);
    kw.add(`${manual.manual_number} PDF`);
  }

  // 6. Category-specific SEO terms
  const catLower = manual.category.toLowerCase();
  if (catLower.includes('circuit breaker')) {
    kw.add('circuit breaker manual');
    kw.add('breaker parts');
    kw.add('trip unit');
    kw.add('low voltage power circuit breaker');
    if (manual.subcategory) {
      const sub = manual.subcategory.toLowerCase();
      if (sub.includes('air')) { kw.add('air circuit breaker'); kw.add('ACB'); }
      if (sub.includes('insulated')) { kw.add('insulated case circuit breaker'); kw.add('ICCB'); }
      if (sub.includes('molded')) { kw.add('molded case circuit breaker'); kw.add('MCCB'); }
      if (sub.includes('trip')) { kw.add('electronic trip unit'); kw.add('trip unit manual'); }
      if (sub.includes('retrofit')) { kw.add('breaker retrofit'); kw.add('retrofit kit'); }
      if (sub.includes('vacuum')) { kw.add('vacuum circuit breaker'); kw.add('VCB'); kw.add('vacuum interrupter'); }
      if (sub.includes('renewal') || sub.includes('parts')) { kw.add('renewal parts'); kw.add('replacement parts'); kw.add('spare parts'); }
    }
  }
  if (catLower.includes('relay') || catLower.includes('meter')) {
    kw.add('protective relay');
    kw.add('overcurrent relay');
    kw.add('relay manual');
  }
  if (catLower.includes('motor')) {
    kw.add('motor starter');
    kw.add('motor control center');
    kw.add('MCC');
    kw.add('contactor');
  }
  if (catLower.includes('switch')) {
    kw.add('disconnect switch');
    kw.add('transfer switch');
    kw.add('safety switch');
  }
  if (catLower.includes('transformer')) {
    kw.add('transformer manual');
    kw.add('dry type transformer');
    kw.add('pad mounted transformer');
  }
  if (catLower.includes('fuse')) {
    kw.add('fuse manual');
    kw.add('fuse catalog');
  }
  if (catLower.includes('bus')) {
    kw.add('bus duct');
    kw.add('busway');
    kw.add('bus plug');
  }

  // 7. Specs extracted from title
  const ampMatch = manual.title.match(/(\d+)\s*[Aa](?:mp)?/);
  const kvMatch = manual.title.match(/(\d+(?:\.\d+)?)\s*[Kk][Vv]/);
  if (ampMatch) { kw.add(`${ampMatch[1]}A`); kw.add(`${ampMatch[1]} amp`); }
  if (kvMatch) { kw.add(`${kvMatch[1]}kV`); kw.add(`${kvMatch[1]} kV`); }

  // 8. EOL / legacy / discontinued (high-intent commercial keywords)
  kw.add('EOL');
  kw.add('legacy equipment');
  kw.add('discontinued');
  kw.add('replacement parts');
  kw.add(`${manual.manufacturer} EOL`);
  kw.add(`${manual.manufacturer} replacement parts`);

  // 9. Known product line names extracted from title
  const PRODUCT_LINES: [RegExp, string[]][] = [
    [/masterpact/i, ['Masterpact', 'Masterpact NW', 'Masterpact NT']],
    [/magnum/i, ['Magnum', 'Magnum DS']],
    [/pow.?r/i, ['Pow-R', 'Pow-R-Way', 'Pow-R breaker']],
    [/de.?ion/i, ['De-Ion', 'De-Ion Grid']],
    [/microversatrip/i, ['MicroVersaTrip', 'MicroVersaTrip Plus']],
    [/digitrip/i, ['Digitrip', 'Digitrip RMS']],
    [/magne.?blast/i, ['Magne-Blast']],
    [/fluarc/i, ['Fluarc', 'Fluarc SF6']],
    [/sentron/i, ['SENTRON', 'Siemens SENTRON']],
    [/power ?break/i, ['Power Break', 'Power Break II']],
    [/power ?xpert|pxr/i, ['Power Xpert', 'PXR']],
    [/ak-?(?:25|50|75|100)/i, ['AK breaker', 'AK-25', 'AK-50', 'AK-75']],
    [/akr/i, ['AKR', 'AKR breaker', 'AKR-50', 'AKR-75']],
    [/ds-?(?:206|416|632|840)/i, ['DS breaker', 'Magnum DS']],
    [/seltronic/i, ['Seltronic']],
    [/micrologic/i, ['Micrologic', 'Micrologic 2.0', 'Micrologic 5.0', 'Micrologic 6.0']],
    [/amptector/i, ['Amptector']],
    [/static trip/i, ['Static Trip', 'Static Trip III']],
    [/i-?line/i, ['I-Line']],
  ];

  for (const [regex, terms] of PRODUCT_LINES) {
    if (regex.test(manual.title)) {
      for (const t of terms) kw.add(t);
    }
  }

  // Dedupe and join — comma-separated for DB storage, picked up by meta keywords tag
  return [...kw].join(', ');
}

// ─── MAIN ───────────────────────────────────────────────────────────

async function main() {
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE — writing to database'}\n`);

  const result = await db.execute('SELECT id, title, description, manufacturer, category, subcategory, manual_number, keywords FROM manuals ORDER BY id');
  const manuals = result.rows as unknown as Array<{
    id: number;
    title: string;
    description: string | null;
    manufacturer: string;
    category: string;
    subcategory: string | null;
    manual_number: string | null;
    keywords: string | null;
  }>;

  console.log(`Total manuals: ${manuals.length}\n`);

  const titleUpdates: { id: number; oldTitle: string; newTitle: string }[] = [];
  const descUpdates: { id: number; title: string; newDesc: string }[] = [];
  const keywordUpdates: { id: number; title: string; newKw: string }[] = [];

  const boilerplateSuffix = 'documentation. Free PDF download from Voyten Manuals.';

  for (const manual of manuals) {
    // --- Title cleanup ---
    const newTitle = normalizeTitle(manual.title);
    if (newTitle !== manual.title) {
      titleUpdates.push({ id: manual.id, oldTitle: manual.title, newTitle });
    }

    // --- Description enrichment ---
    const desc = manual.description || '';
    const isBoilerplate = desc.endsWith(boilerplateSuffix) && desc.length < 200;
    const isThin = desc.length < 50;

    if (isBoilerplate || isThin) {
      const useTitle = newTitle !== manual.title ? newTitle : manual.title;
      const newDesc = generateDescription({ ...manual, title: useTitle });
      descUpdates.push({ id: manual.id, title: useTitle, newDesc });
    }

    // --- Keyword generation (for ALL manuals — enriched long-tail SEO keywords) ---
    {
      const useTitle = newTitle !== manual.title ? newTitle : manual.title;
      const newKw = generateKeywords({ ...manual, title: useTitle });
      keywordUpdates.push({ id: manual.id, title: useTitle, newKw });
    }
  }

  // Show samples
  console.log('=== TITLE CLEANUP SAMPLES ===');
  for (const t of titleUpdates.slice(0, 15)) {
    console.log(`  [${t.id}] BEFORE: ${t.oldTitle}`);
    console.log(`  [${t.id}] AFTER:  ${t.newTitle}\n`);
  }
  console.log(`Total titles to fix: ${titleUpdates.length}\n`);

  console.log('=== DESCRIPTION ENRICHMENT SAMPLES ===');
  for (const d of descUpdates.slice(0, 5)) {
    console.log(`  [${d.id}] ${d.title}`);
    console.log(`  DESC: ${d.newDesc}\n`);
  }
  console.log(`Total descriptions to enrich: ${descUpdates.length}\n`);

  console.log('=== KEYWORD GENERATION SAMPLES ===');
  for (const k of keywordUpdates.slice(0, 5)) {
    console.log(`  [${k.id}] ${k.title}`);
    console.log(`  KW: ${k.newKw}\n`);
  }
  console.log(`Total keywords to generate: ${keywordUpdates.length}\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — no changes written. Remove --dry-run to apply.');
    return;
  }

  const BATCH_SIZE = 50;

  // Apply title updates
  if (titleUpdates.length > 0) {
    console.log('Applying title updates...');
    for (let i = 0; i < titleUpdates.length; i += BATCH_SIZE) {
      const batch = titleUpdates.slice(i, i + BATCH_SIZE);
      await db.batch(
        batch.map(t => ({
          sql: 'UPDATE manuals SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          args: [t.newTitle, t.id],
        })),
        'write'
      );
      process.stdout.write(`  Titles: ${Math.min(i + BATCH_SIZE, titleUpdates.length)}/${titleUpdates.length}\r`);
    }
    console.log(`\nTitle updates complete: ${titleUpdates.length} rows`);
  }

  // Apply description updates
  if (descUpdates.length > 0) {
    console.log('Applying description updates...');
    for (let i = 0; i < descUpdates.length; i += BATCH_SIZE) {
      const batch = descUpdates.slice(i, i + BATCH_SIZE);
      await db.batch(
        batch.map(d => ({
          sql: 'UPDATE manuals SET description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          args: [d.newDesc, d.id],
        })),
        'write'
      );
      process.stdout.write(`  Descriptions: ${Math.min(i + BATCH_SIZE, descUpdates.length)}/${descUpdates.length}\r`);
    }
    console.log(`\nDescription updates complete: ${descUpdates.length} rows`);
  }

  // Apply keyword updates
  if (keywordUpdates.length > 0) {
    console.log('Applying keyword updates...');
    for (let i = 0; i < keywordUpdates.length; i += BATCH_SIZE) {
      const batch = keywordUpdates.slice(i, i + BATCH_SIZE);
      await db.batch(
        batch.map(k => ({
          sql: 'UPDATE manuals SET keywords = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          args: [k.newKw, k.id],
        })),
        'write'
      );
      process.stdout.write(`  Keywords: ${Math.min(i + BATCH_SIZE, keywordUpdates.length)}/${keywordUpdates.length}\r`);
    }
    console.log(`\nKeyword updates complete: ${keywordUpdates.length} rows`);
  }

  console.log('\nDone!');
}

main().catch(console.error);
