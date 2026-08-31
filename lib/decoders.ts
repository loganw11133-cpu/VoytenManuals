/**
 * Single source of truth for the breaker catalog-number decoders.
 *
 * Every decoder surface reads from here: the /tools hub cards, each
 * /tools/<slug> route's metadata + JSON-LD, and the indexable copy rendered
 * beneath the decoder frame. Adding a 9th decoder means adding one object.
 *
 * WHY the on-page copy lives here rather than inside the decoder HTML:
 * `public/tools/<slug>-decoder.html` is loaded in an iframe, so crawlers treat
 * it as a separate document — nothing inside it counts as content on
 * /tools/<slug>. Before this file existed, the decoder routes had no
 * page-specific body text at all beyond their <title>, which is why they never
 * ranked for the catalog-number terms the decoders actually answer.
 */

export type DecoderFaq = { q: string; a: string };

export type Decoder = {
  slug: string;
  /** Short card name, e.g. "RL". Rendered as "<name> Decoder". */
  name: string;
  /** Full product name used in headings, titles and schema. */
  fullName: string;
  manufacturer: 'Voyten Electric' | 'Siemens' | 'Eaton' | 'GE' | 'Square D';
  /** Card/summary description — also the meta description base. */
  description: string;
  frames: string;
  ratings: string;
  /** A real catalog number the decoder parses (matches the tool's own example). */
  example: string;
  /** Other names the same breaker is sold, stamped or searched under. */
  alsoKnownAs: string[];
  /** Fields the decoder resolves — rendered as an indexable list. */
  identifies: string[];
  /** Library search that surfaces this family's manuals. */
  manualSearch: string;
  manualSearchLabel: string;
  /** Product/quote page when Voyten stocks the line. */
  productPage?: { href: string; label: string };
  faq: DecoderFaq[];
  /** Card points at a product page instead of a decoder route. */
  href?: string;
  landing?: boolean;
  /** Spec'd but not built — renders a non-clickable placeholder so it can't 404. */
  comingSoon?: boolean;
};

/* Section headings carry the legacy brand alongside the current one — the people
   searching for these breakers are usually holding a nameplate that says
   Cutler-Hammer or Square D, not Eaton or Schneider. */
export const MANUFACTURER_LABELS: Record<string, string> = {
  Eaton: 'Eaton / Cutler-Hammer',
  Siemens: 'Siemens',
  'Voyten Electric': 'Voyten Electric',
  GE: 'General Electric',
  'Square D': 'Square D / Schneider Electric',
};

const CALL = 'Send the catalog number or a nameplate photo to Voyten Electric at 1-800-458-4001 and our team will identify it.';

export const decoders: Decoder[] = [
  {
    slug: 'rl',
    name: 'RL',
    fullName: 'Voyten Type RL/VRL (RLE / RLI / RLF)',
    manufacturer: 'Voyten Electric',
    description:
      'Decode Voyten Type RL/VRL 600V Low Voltage Power Circuit Breaker catalog numbers. Identifies connection, interrupting type, frame, sensors, system wiring, trip unit, and optional devices.',
    frames: 'RL / RLE / RLI / RLF',
    ratings: '800A – 5,000A',
    example: 'RLAS2EAJXCA05X-IJW3D8',
    alsoKnownAs: ['Voyten Type RL', 'VRL', 'RLE', 'RLI', 'RLF', 'Type LA (companion air breaker)'],
    identifies: [
      'Connection type and mounting (drawout or fixed)',
      'Interrupting type and frame class — RL, RLE, RLI, RLF',
      'Frame ampere rating, 800A through 5,000A',
      'Tripping sensor plug, including dual-wound sensors',
      'Control voltage and system wiring',
      'Static Trip III trip unit configuration',
      'Optional and factory-installed devices',
    ],
    manualSearch: '/search?q=RL&manufacturer=Siemens',
    manualSearchLabel: 'Siemens RL manuals and renewal-parts catalogs',
    productPage: { href: '/products/rl-breakers', label: 'Voyten Type RL/VRL breakers, Static Trip III units and renewal parts' },
    faq: [
      {
        q: 'Where is the catalog number on a Voyten Type RL/VRL breaker?',
        a: 'On the breaker nameplate, on the front escutcheon of the drawout element. On a typical RL the catalog number runs together with a suffix after a hyphen, as in RLAS2EAJXCA05X-IJW3D8. If the plate is painted over or illegible, ' + CALL,
      },
      {
        q: 'Is the Voyten Type RL/VRL still in production?',
        a: 'No. The Type RL line was discontinued and there is no current-production drop-in equivalent, so existing RL switchgear is supported through the aftermarket rather than replaced. Voyten Electric purchased the complete remaining RL and Type LA inventory directly from the Wendell, North Carolina facility and holds it as New Surplus.',
      },
      {
        q: 'What trip unit does an RL breaker use?',
        a: 'The Static Trip III is the electronic trip unit for the RL series, providing adjustable long-time, short-time, instantaneous and ground-fault protection. Earlier RL breakers may carry a Static Trip II.',
      },
    ],
  },
  {
    slug: 'wl',
    name: 'WL (Sentron WL)',
    fullName: 'Siemens WL / Sentron WL',
    manufacturer: 'Siemens',
    description:
      'Decode Siemens WL (Sentron WL) catalog numbers under both UL 489 and UL 1066 / ANSI C37. Identifies interrupting class, frame size, mounting, poles, ampere rating, rating plug, ETU745 / ETU776 trip unit, and every factory accessory digit.',
    frames: 'Frame Size 1 / 2 / 3 (UL 489 · UL 1066)',
    ratings: '800A – 6,000A',
    example: 'WLL3F340',
    alsoKnownAs: ['Sentron WL', 'Siemens WL', 'IEC 3WL (adjacent family)', 'Schneider MasterPact (look-alike)'],
    identifies: [
      'Listing standard — UL 489 insulated case or UL 1066 / ANSI C37 power circuit breaker',
      'Interrupting class and frame size 1, 2 or 3',
      'Mounting, pole count and frame ampere rating',
      'Rating plug and sensor',
      'ETU745 and ETU776 trip unit configuration',
      'Non-automatic switch variants',
      'Every factory accessory digit in the 15-character number',
    ],
    manualSearch: '/search?q=WL&manufacturer=Siemens',
    manualSearchLabel: 'Siemens WL and Sentron manuals',
    faq: [
      {
        q: 'Why does the WL decoder ask for a listing standard?',
        a: 'The same 15-digit Siemens WL catalog number is read differently depending on whether the breaker is listed to UL 489 as an insulated-case breaker or to UL 1066 / ANSI C37 as a power circuit breaker. The nameplate states which one. Choosing the wrong standard returns the wrong frame and rating, so the decoder asks up front.',
      },
      {
        q: 'Is a Siemens WL the same as an IEC 3WL?',
        a: 'They are closely related but not interchangeable catalog systems. The ANSI/UL WL and the IEC 3WL use different numbering, so a 3WL number entered into the WL decoder is routed rather than force-decoded.',
      },
      {
        q: 'What replaced the Type RL/VRL?',
        a: 'The WL / Sentron WL family succeeded the RL in that manufacturer\'s low-voltage switchgear. They are not drop-in replacements for one another — an RL cubicle needs a Type RL/VRL breaker or a documented retrofit.',
      },
    ],
  },
  {
    slug: 'wavepro',
    name: 'WavePro',
    fullName: 'GE WavePro',
    manufacturer: 'GE',
    description:
      'Decode GE WavePro low-voltage power air circuit breaker catalog numbers. Identifies equipment usage, interrupting/fuse rating, frame & sensor, MVT / Power+ trip unit, trip function, rating plug, operation voltages, and mounted accessories.',
    frames: 'WavePro (AKD-10 / PowerBreak II)',
    ratings: '800A – 5,000A',
    example: 'WE2DAQDF1XBBXHX',
    alsoKnownAs: ['General Electric WavePro', 'AKD-10 switchgear', 'PowerBreak II', 'GE Wave Pro'],
    identifies: [
      'Equipment usage and application',
      'Interrupting rating and fused variants',
      'Frame size and sensor',
      'MVT and Power+ trip unit type',
      'Trip functions (long-time, short-time, instantaneous, ground fault)',
      'Rating plug',
      'Closing and control operation voltages',
      'Factory-mounted accessories',
    ],
    manualSearch: '/search?q=WavePro&manufacturer=General%20Electric',
    manualSearchLabel: 'GE WavePro manuals and renewal-parts catalogs',
    faq: [
      {
        q: 'What switchgear does a GE WavePro go into?',
        a: 'WavePro breakers are the low-voltage power air circuit breakers used in GE AKD-10 switchgear, and are closely associated with the PowerBreak II line. The catalog number identifies the exact frame, sensor and trip unit needed to match an existing cubicle.',
      },
      {
        q: 'Can I get renewal parts for a GE WavePro?',
        a: 'Yes. WavePro renewal-parts catalogs are in the free manual library, and Voyten Electric supplies renewal parts and reconditioned units for GE low-voltage power breakers. ' + CALL,
      },
    ],
  },
  {
    slug: 'rd',
    name: 'RD (R-Frame)',
    fullName: 'Eaton RD (R-Frame)',
    manufacturer: 'Eaton',
    description:
      'Decode RD-series R-Frame catalog numbers including factory-installed accessories. Parses post-W accessory groups (S/U/T/A/B/Q/N).',
    frames: 'RD / R-Frame',
    ratings: '400A – 2,000A',
    example: 'RD316T56W',
    alsoKnownAs: ['Cutler-Hammer RD', 'Westinghouse R-Frame', 'Series C R-Frame', 'Eaton R-Frame'],
    identifies: [
      'R-Frame designation and frame ampere rating, 400A through 2,000A',
      'Trip unit and rating plug',
      'Pole count and interrupting rating',
      'Factory-installed accessory groups following the W character (S/U/T/A/B/Q/N)',
      'Shunt trips, auxiliary switches and undervoltage releases',
    ],
    manualSearch: '/search?q=R-Frame&manufacturer=Eaton',
    manualSearchLabel: 'Eaton and Cutler-Hammer R-Frame manuals',
    faq: [
      {
        q: 'What does the string after the W in an RD catalog number mean?',
        a: 'Everything after the W character encodes factory-installed accessories, grouped by letter (S, U, T, A, B, Q, N). Two RD breakers with the same frame and rating can carry completely different accessory strings, which is what usually makes a like-for-like replacement fail.',
      },
      {
        q: 'Is an Eaton RD the same as a Westinghouse R-Frame?',
        a: 'They are the same molded-case frame family carried across the Westinghouse, Cutler-Hammer and Eaton eras. A nameplate may read any of the three brands. ' + CALL,
      },
    ],
  },
  {
    slug: 'mds-sbs',
    name: 'Magnum DS (MDS) / SBS',
    fullName: 'Eaton Magnum DS (MDS) / SBS',
    manufacturer: 'Eaton',
    description:
      'Decode Magnum DS (MDS) and SBS-series catalog numbers. Identifies frame, rating, interrupting capacity, trip unit type, and mounting.',
    frames: 'Magnum DS (MDS) · SBS',
    ratings: '800A – 6,000A',
    example: 'MDS6163WEA',
    alsoKnownAs: ['Cutler-Hammer Magnum DS', 'Magnum SB', 'SBS', 'Eaton MDS'],
    identifies: [
      'Magnum DS or SBS family',
      'Frame size and frame ampere rating, 800A through 6,000A',
      'Interrupting capacity',
      'Trip unit type',
      'Fixed or drawout mounting',
      'Pole count and rating plug',
    ],
    manualSearch: '/search?q=Magnum&manufacturer=Eaton',
    manualSearchLabel: 'Eaton Magnum manuals and renewal-parts catalogs',
    faq: [
      {
        q: 'What is the difference between Magnum DS and SBS?',
        a: 'They share a catalog-number grammar, which is why one decoder reads both. The decoder reports which family the number belongs to along with the frame, rating, interrupting capacity, trip unit and mounting.',
      },
      {
        q: 'My Magnum breaker number is longer than the example — will it still decode?',
        a: 'Yes. The decoder accepts both the short frame designation and the full 25-character catalog number, and reports every field it can resolve from what you enter.',
      },
    ],
  },
  {
    slug: 'mw-iec',
    name: 'Magnum MW (IEC)',
    fullName: 'Eaton Magnum MW (IEC 60947-2)',
    manufacturer: 'Eaton',
    description:
      'Decode IEC 60947-2 Magnum MW catalog numbers. Supports 49 ampere ratings with fixed/draw-out mounting and motorized/manual operation.',
    frames: 'Magnum MW (IEC)',
    ratings: '800A – 6,300A',
    example: 'MWI8203LEA',
    alsoKnownAs: ['Cutler-Hammer Magnum MW', 'Magnum IEC', 'Magnum cassette', 'MWI'],
    identifies: [
      'IEC 60947-2 Magnum MW breaker or cassette',
      'Frame ampere rating across 49 supported ratings, 800A through 6,300A',
      'Interrupting and short-time (Icw) ratings',
      'Fixed or draw-out mounting',
      'Motorized or manual operation',
      'Trip unit and accessory configuration',
    ],
    manualSearch: '/search?q=Magnum&manufacturer=Eaton',
    manualSearchLabel: 'Eaton Magnum manuals and renewal-parts catalogs',
    faq: [
      {
        q: 'Does this decoder read the cassette as well as the breaker?',
        a: 'Yes. The Magnum MW decoder is dual-mode — it reads both the breaker catalog number and the draw-out cassette number, and reports the amp range each one covers.',
      },
      {
        q: 'Why does an IEC Magnum use a different number from a Magnum DS?',
        a: 'The IEC 60947-2 Magnum MW is a separate catalog system from the ANSI/UL Magnum DS, with its own ratings structure. Entering an MW number into the Magnum DS decoder, or the reverse, returns the wrong frame.',
      },
    ],
  },
  {
    slug: 'pxr-pdsb',
    name: 'Magnum PXR / Power Defense SB',
    fullName: 'Eaton Magnum PXR / Power Defense SB',
    manufacturer: 'Eaton',
    description:
      'Decode 25-character Magnum PXR and 15-character Power Defense SB catalog numbers. Identifies frame size, ampere rating, trip unit, and accessories.',
    frames: 'Magnum DS (PXR) · Power Defense SB',
    ratings: '800A – 6,000A',
    example: 'MPS8203CEA202AATAAWKPALAX',
    alsoKnownAs: ['Eaton PXR trip unit', 'Magnum PXR', 'Power Defense', 'PD-SB', 'Series NRX'],
    identifies: [
      'Magnum PXR (25-character) or Power Defense SB (15-character) format',
      'Frame size and frame ampere rating',
      'PXR trip unit configuration',
      'Interrupting rating',
      'Mounting and pole count',
      'Factory-installed accessories',
    ],
    manualSearch: '/search?q=Power%20Defense&manufacturer=Eaton',
    manualSearchLabel: 'Eaton Power Defense and Magnum manuals',
    faq: [
      {
        q: 'Can one decoder read both PXR and Power Defense SB numbers?',
        a: 'Yes. The two use different lengths — 25 characters for Magnum PXR and 15 for Power Defense SB — so the decoder detects the format from what you paste and switches automatically.',
      },
      {
        q: 'Is the PXR a retrofit for an older Magnum trip unit?',
        a: 'The PXR is the current-generation Eaton trip unit family. Whether it can be fitted to a given breaker depends on the frame and the existing trip unit. ' + CALL,
      },
    ],
  },
  {
    slug: 'sqd-ntnw',
    name: 'MasterPact NT / NW',
    fullName: 'Square D / Schneider MasterPact NT / NW',
    manufacturer: 'Square D',
    description:
      'Decode Square D / Schneider MasterPact NT and NW catalog numbers. Identifies frame construction (T/W/Y), ampere rating, interrupting class, device type, sensor plugs, and Micrologic trip unit.',
    frames: 'NT (T-frame) · NW (W / Y-frame)',
    ratings: '800A – 6,300A',
    example: 'WA4ECR43A9SXXXWXJA',
    alsoKnownAs: ['Schneider MasterPact', 'MasterPact NT', 'MasterPact NW', 'Square D universal power circuit breaker'],
    identifies: [
      'Frame construction — NT T-frame, NW W-frame or Y-frame',
      'Frame ampere rating, 800A through 6,300A',
      'Interrupting class',
      'Device type — drawout, fixed, or switch-only',
      'Sensor and long-time rating plug',
      'Micrologic trip unit family and feature set',
      'Padlocking and factory accessory positions',
    ],
    manualSearch: '/search?q=MasterPact&manufacturer=Square%20D',
    manualSearchLabel: 'Square D MasterPact manuals and catalogs',
    faq: [
      {
        q: 'Is a Square D MasterPact the same as a Schneider MasterPact?',
        a: 'Yes — Square D is Schneider Electric’s North American brand, so the same MasterPact NT and NW breakers are sold and stamped under both names. One decoder covers both nameplates.',
      },
      {
        q: 'Why is the trip unit ordered separately from the breaker?',
        a: 'MasterPact NT and NW use a modular ordering system: the frame carries its own number and the Micrologic trip unit carries another. That is why the decoder accepts the frame number and the trip unit designation as separate inputs.',
      },
    ],
  },
  {
    slug: 'vcp-w',
    name: 'VCP-W',
    fullName: 'Eaton VCP-W (Cutler-Hammer VCP-W)',
    manufacturer: 'Eaton',
    comingSoon: true,
    description:
      'In development — a decoder for Eaton / Cutler-Hammer VCP-W medium-voltage vacuum circuit breakers. Reads the type designation (voltage class, rating basis, and the ND / C / XC / G / SE variants) and the 10-digit style number, and returns the full ANSI rated-values set.',
    frames: 'VCP-W · WND · WC / WXC · WG · WSE (ANSI + IEC)',
    ratings: '4.76 kV – 27 kV · 1200A – 3000A',
    /* Nothing parses yet, so the fields that feed a live route stay empty —
       `publicDecoders` filters comingSoon out, so no /tools/vcp-w route,
       sitemap entry, llms.txt line or ItemList item is emitted for it. Same
       staging the WL card used before its decoder shipped (04ca580). */
    example: '',
    alsoKnownAs: [
      'Cutler-Hammer VCP-W',
      'Westinghouse VCP-W',
      'VCPW',
      'VCP-WND (narrow design)',
      'VCP-WC / VCP-WXC (extra capability)',
      'VCP-WG (generator)',
      'VCP-WSE (special environment)',
    ],
    identifies: [],
    // Unfiltered on purpose: VCP-W instruction books are filed under
    // Westinghouse, Cutler-Hammer and Eaton, so a manufacturer facet would
    // hide most of the family.
    manualSearch: '/search?q=VCP-W',
    manualSearchLabel: 'VCP-W instruction books and renewal-parts catalogs',
    faq: [],
  },
  {
    slug: 'spb',
    name: 'SPB',
    fullName: 'Eaton SPB (Systems Pow-R)',
    manufacturer: 'Eaton',
    href: '/products/spb-breakers',
    landing: true,
    description:
      'Looking for an Eaton SPB (Systems Pow-R)? Get SPB availability and a quote — our team identifies your SPB-50 / 65 / 100 and sources the new-surplus or reconditioned replacement.',
    frames: 'SPB 50 / SPB 65 / SPB 100',
    ratings: '800A – 4,000A',
    example: '',
    alsoKnownAs: ['Cutler-Hammer SPB', 'Westinghouse Systems Pow-R', 'SPBN', 'SPBNH'],
    identifies: [],
    manualSearch: '/search?q=SPB&manufacturer=Eaton',
    manualSearchLabel: 'Eaton SPB manuals',
    productPage: { href: '/products/spb-breakers', label: 'Eaton SPB breakers, Digitrip trip units and renewal parts' },
    faq: [],
  },
];

/** Public decoder routes only — excludes the SPB card, which points at a product page. */
export const publicDecoders = decoders.filter((d) => !d.landing && !d.comingSoon);

export function getDecoder(slug: string): Decoder | undefined {
  return decoders.find((d) => d.slug === slug);
}

/**
 * Look up a decoder that must exist. Throws at build time rather than at
 * request time if a route's slug drifts out of sync with this file.
 */
export function requireDecoder(slug: string): Decoder {
  const decoder = getDecoder(slug);
  if (!decoder) throw new Error(`No decoder configured for slug "${slug}" (see lib/decoders.ts)`);
  return decoder;
}

/**
 * Match a manual to the decoder that reads its breaker family, so the manual
 * page can offer "decode your catalog number".
 *
 * Manual pages carry effectively all of the site's traffic, and the decoders
 * carry almost none — this is the internal link between the two. Patterns are
 * deliberately conservative: a wrong decoder is worse than no link, because it
 * sends someone to a tool that will mis-parse their number.
 */
const MANUAL_MATCHERS: { slug: string; manufacturers: RegExp; title: RegExp }[] = [
  { slug: 'rl', manufacturers: /^Siemens(-Allis)?$/i, title: /\bRL[EIF]?\b/ },
  // "Sentron" alone is far too broad — Siemens also sells Sentron busway and the
  // ITE-derived Sentron molded-case series, neither of which this decoder reads.
  { slug: 'wl', manufacturers: /^Siemens$/i, title: /\bWL\b|\b3WL\b|sentron\s*wl/i },
  { slug: 'wavepro', manufacturers: /^General Electric$/i, title: /wave\s?pro/i },
  // Magnum splits three ways — require the distinguishing token, never bare "Magnum".
  { slug: 'mw-iec', manufacturers: /^(Eaton|Cutler-Hammer)$/i, title: /\bMWI?\b|magnum.*\biec\b|\biec\b.*magnum/i },
  { slug: 'pxr-pdsb', manufacturers: /^(Eaton|Cutler-Hammer)$/i, title: /\bPXR\b|power\s?defense|\bNRX\b/i },
  { slug: 'mds-sbs', manufacturers: /^(Eaton|Cutler-Hammer)$/i, title: /\bMDS\b|\bSBS\b|magnum\s?ds\b/i },
  // Library titles write this family as "RD-Frame", "R Frame" and "RD/RDC".
  // Deliberately NOT a bare "Type RD" — that also matches the Westinghouse Type
  // RD Line Drop Compensator, which is not a breaker.
  { slug: 'rd', manufacturers: /^(Eaton|Cutler-Hammer|Westinghouse)$/i, title: /\bRDC?[\s-]?frame\b|\bR[\s-]frame\b|\bRD\s*\/\s*RDC\b/i },
  // Bare "MasterPact" is not enough: MasterPact MP and MasterPact MTZ are
  // different generations with different catalog grammar, and this decoder would
  // mis-parse both. Require an explicit NT/NW.
  { slug: 'sqd-ntnw', manufacturers: /^(Square D|Schneider Electric|Merlin Gerin)$/i, title: /master\s?pact\s*N[TW]\b|\bN[TW]\d{2}\b/i },
];

export function matchDecoderForManual(manufacturer: string, title: string): Decoder | null {
  if (!manufacturer || !title) return null;
  for (const m of MANUAL_MATCHERS) {
    if (m.manufacturers.test(manufacturer) && m.title.test(title)) {
      const decoder = getDecoder(m.slug);
      // Never link a decoder that isn't a live route (SPB is a product page).
      if (decoder && !decoder.landing && !decoder.comingSoon) return decoder;
    }
  }
  return null;
}

/**
 * Neutral cross-section pointers, keyed by the manufacturer whose section shows them.
 *
 * Someone hunting a Type RL/VRL is usually reading a nameplate from the Wendell
 * facility and will look under Siemens first, but the RL is grouped under Voyten
 * Electric. This names the destination by its legal product name only — it does
 * NOT put a Siemens heading over an RL product card, which commit 411786d
 * deliberately removed. Keep it that way: the text here must never brand the RL
 * as Siemens. See the RL de-tag constraint before editing.
 */
export const SECTION_CROSS_REFS: Record<string, { question: string; href: string; linkLabel: string }> = {
  Siemens: {
    question: 'Looking for a Type RL/VRL?',
    href: '#voyten-electric',
    linkLabel: 'It’s listed under Voyten Electric',
  },
};

/** Grouped by manufacturer, fullest ranges first, derived from the data. */
export const groupedDecoders = Array.from(
  decoders.reduce((map, tool) => {
    const list = map.get(tool.manufacturer) ?? [];
    list.push(tool);
    map.set(tool.manufacturer, list);
    return map;
  }, new Map<string, Decoder[]>())
)
  .map(([manufacturer, items]) => ({
    manufacturer,
    label: MANUFACTURER_LABELS[manufacturer] ?? manufacturer,
    id: manufacturer.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    items: [...items].sort((a, b) => a.name.localeCompare(b.name)),
  }))
  .sort((a, b) => b.items.length - a.items.length || a.manufacturer.localeCompare(b.manufacturer));
