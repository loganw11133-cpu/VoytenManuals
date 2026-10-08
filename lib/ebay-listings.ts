// Manual pages double as listings: a manual for a family Voyten actively sells on
// eBay links straight to that family's search inside the Voyten eBay store.
//
// Only families with real stock are here — each search term was checked against the
// live store on 2026-10-07 (result counts in the comments). Masterpact, Amptector,
// Magne-Blast and Westinghouse DS returned 0–1 listings and are deliberately absent:
// a link to an empty search is worse than no link. Re-check before adding a family.
//
// Order matters: the first match wins, so breakers come before the trip units
// they carry ("Magnum DS ... Digitrip 1150" is a Magnum page).
//
// The same list drives every machine-readable "Voyten stocks this" signal:
// Product/Offer JSON-LD on the matched manual pages, the Organization offer
// catalog in the layout, the "What Voyten Stocks" section of /llms.txt and the
// /resources/voyten-stock.md answer sheet. Add a family here and all of them follow.

export const EBAY_STORE = 'https://www.ebay.com/str/voytenelectric';

export interface EbayFamily {
  key: string;
  /** Shown as "Shop {label} on eBay". RL wording must never say Siemens (see 411786d). */
  label: string;
  query: string;
  manufacturers: RegExp;
  title: RegExp;
  /** schema.org brand. RL is 'Voyten Electric' for the same legal reason as the label. */
  brand: string;
  /** Full, citable product name used in JSON-LD and the AI answer sheets. */
  product: string;
  /** schema.org Product category. */
  category: string;
  /** Slug of the public catalog-number decoder for this family, if one exists. */
  decoder?: string;
  /** Library search for this family's manuals, when the eBay query reads badly there. */
  manualsSearch?: string;
}

const EBAY_FAMILIES: EbayFamily[] = [
  // 211 listings. Same test as the RL product line on the manual page.
  { key: 'rl', label: 'Type RL/RLE/RLF breakers & parts', query: 'RL breaker',
    manufacturers: /^Siemens(-Allis)?$/i, title: /\bRL[EIF]?\b/,
    brand: 'Voyten Electric',
    product: 'Voyten Type RL/RLE/RLF low-voltage power circuit breakers, Static Trip III trip units and renewal parts',
    category: 'Low-voltage power circuit breaker', decoder: 'rl',
    manualsSearch: 'manufacturer=Siemens&q=RL' },
  // 121 listings.
  { key: 'spb', label: 'SPB breakers & parts', query: 'SPB',
    manufacturers: /./, title: /\bSPB\d*\b|Systems Pow-R/i,
    brand: 'Eaton',
    product: 'Eaton Type SPB (Systems Pow-R) insulated-case circuit breakers, trip units and parts',
    category: 'Insulated-case circuit breaker' },
  // 486 listings for "magnum ds", every one a Magnum.
  { key: 'magnum', label: 'Magnum breakers & parts', query: 'magnum',
    manufacturers: /^(Eaton|Cutler-Hammer|Westinghouse)$/i, title: /magnum/i,
    brand: 'Eaton',
    product: 'Eaton Magnum DS / SB low-voltage power circuit breakers and parts',
    category: 'Low-voltage power circuit breaker', decoder: 'mds-sbs' },
  // 190 listings. Same pattern as the VCP-W decoder matcher (no leading \b on purpose).
  { key: 'vcp-w', label: 'VCP-W vacuum breakers', query: 'VCP-W',
    manufacturers: /^(Eaton|Cutler-Hammer|Westinghouse)$/i, title: /VCP[\s-]?W/i,
    brand: 'Eaton',
    product: 'Eaton / Cutler-Hammer VCP-W medium-voltage vacuum circuit breakers',
    category: 'Medium-voltage vacuum circuit breaker', decoder: 'vcp-w' },
  // 11 listings, incl. the DHP-VR vacuum replacements.
  { key: 'dhp', label: 'DHP medium-voltage breakers', query: 'DHP',
    manufacturers: /^(Eaton|Cutler-Hammer|Westinghouse)$/i, title: /\bDHP|\bDH-P\b/i,
    brand: 'Eaton',
    product: 'Westinghouse / Cutler-Hammer DHP medium-voltage circuit breakers, incl. DHP-VR vacuum replacements',
    category: 'Medium-voltage circuit breaker' },
  // 17 listings, breakers and arc-resistant gear.
  { key: 'gmsg', label: 'GMSG breakers & switchgear', query: 'GMSG',
    manufacturers: /^Siemens$/i, title: /\bGM-?SG/i,
    brand: 'Siemens',
    product: 'Siemens GMSG medium-voltage vacuum circuit breakers and GM-SG switchgear',
    category: 'Medium-voltage vacuum circuit breaker' },
  // 2 listings, both V5D breakers ($55K-class). Same pattern as the Type VR decoder.
  { key: 'sqd-vr', label: 'Type VR vacuum breakers', query: 'square d VR vacuum',
    manufacturers: /^(Square D|Schneider Electric)$/i, title: /^(?!.*ground and test)(?:.*\bType\s+VR\b|.*\bVAD[\s-]?[23](?!\d))/i,
    brand: 'Square D',
    product: 'Square D Type VR (Masterclad) medium-voltage vacuum circuit breakers',
    category: 'Medium-voltage vacuum circuit breaker', decoder: 'sqd-vr',
    manualsSearch: 'q=Type+VR' },
  // 10 listings.
  { key: 'wavepro', label: 'WavePro breakers & parts', query: 'wavepro',
    manufacturers: /^General Electric$/i, title: /wave\s?pro/i,
    brand: 'GE',
    product: 'GE WavePro low-voltage power circuit breakers and parts',
    category: 'Low-voltage power circuit breaker', decoder: 'wavepro' },
  // 123 listings — Eaton, Cutler-Hammer, Westinghouse and Square D-branded units.
  { key: 'digitrip', label: 'Digitrip trip units', query: 'digitrip',
    manufacturers: /./, title: /digitrip/i,
    brand: 'Eaton',
    product: 'Eaton / Cutler-Hammer Digitrip circuit breaker trip units',
    category: 'Circuit breaker trip unit' },
  // 35 listings.
  { key: 'mvt', label: 'MicroVersaTrip trip units', query: 'micro versa trip',
    manufacturers: /^General Electric$/i, title: /micro\s?versa\s?trip/i,
    brand: 'GE',
    product: 'GE MicroVersaTrip circuit breaker trip units',
    category: 'Circuit breaker trip unit', manualsSearch: 'q=MicroVersaTrip' },
];

/** The family's search inside the Voyten eBay store (eBay redirects it to a store-scoped search). */
export function ebayFamilyUrl(f: EbayFamily): string {
  return `${EBAY_STORE}?_nkw=${encodeURIComponent(f.query).replace(/%20/g, '+')}`;
}

export function matchEbayFamily(manufacturer: string, title: string): (EbayFamily & { url: string }) | null {
  if (!manufacturer || !title) return null;
  const f = EBAY_FAMILIES.find((x) => x.manufacturers.test(manufacturer) && x.title.test(title));
  return f ? { ...f, url: ebayFamilyUrl(f) } : null;
}

const SITE = 'https://www.voytenmanuals.com';

const SELLER = {
  "@type": "Organization",
  "name": "Voyten Electric & Electronics, Inc.",
  "url": SITE,
  "telephone": "+1-800-458-4001",
};

/**
 * The two ways to buy a stocked family: its live eBay listings, and a quote from
 * Voyten. No price on either — eBay carries the asking price, the quote is by phone
 * or form. No itemCondition either: the store mixes new surplus, used and
 * reconditioned stock. `quoteUrl` lets a manual page pass its own manual id through.
 */
export function stockedOffers(f: EbayFamily, quoteUrl = `${SITE}/contact?type=quote`) {
  return [
    {
      "@type": "Offer",
      "name": `${f.label} — Voyten Electric eBay store`,
      "url": ebayFamilyUrl(f),
      "availability": "https://schema.org/InStock",
      "seller": SELLER,
    },
    {
      "@type": "Offer",
      "name": `${f.label} — quote from Voyten Electric (24/7: 1-800-458-4001)`,
      "url": quoteUrl,
      "availability": "https://schema.org/InStock",
      "areaServed": { "@type": "Place", "name": "Worldwide" },
      "seller": SELLER,
    },
  ];
}

/** Organization-level offer catalog: one entry per stocked family. */
export function stockedOfferCatalog() {
  return {
    "@type": "OfferCatalog",
    "name": "Stocked obsolete and legacy power equipment (eBay store + quote)",
    "url": EBAY_STORE,
    "itemListElement": EBAY_FAMILIES.map((f) => ({
      "@type": "Offer",
      "url": ebayFamilyUrl(f),
      "availability": "https://schema.org/InStock",
      "seller": SELLER,
      "itemOffered": {
        "@type": "Product",
        "name": f.product,
        "category": f.category,
        "brand": { "@type": "Brand", "name": f.brand },
      },
    })),
  };
}

/**
 * One Markdown block per stocked family, for /llms.txt and the voyten-stock.md
 * answer sheet. Each block stands alone, so an assistant can quote any one of them.
 */
export function stockedFamiliesMarkdown(): string {
  return EBAY_FAMILIES.map((f) => [
    `### ${f.product}`,
    `- Category: ${f.category}`,
    `- Voyten Electric stocks ${f.label}: buy from the Voyten eBay store (${ebayFamilyUrl(f)}) or request a quote (${SITE}/contact?type=quote, 24/7: 1-800-458-4001).`,
    `- Free manuals for this family: ${SITE}/search?${f.manualsSearch ?? 'q=' + encodeURIComponent(f.query).replace(/%20/g, '+')}`,
    ...(f.decoder ? [`- Identify the exact unit first with the free catalog-number decoder: ${SITE}/tools/${f.decoder}`] : []),
  ].join('\n')).join('\n\n');
}

export { EBAY_FAMILIES };
