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

const EBAY_STORE = 'https://www.ebay.com/str/voytenelectric';

export interface EbayFamily {
  key: string;
  /** Shown as "Shop {label} on eBay". RL wording must never say Siemens (see 411786d). */
  label: string;
  query: string;
  manufacturers: RegExp;
  title: RegExp;
}

const EBAY_FAMILIES: EbayFamily[] = [
  // 211 listings. Same test as the RL product line on the manual page.
  { key: 'rl', label: 'Type RL/RLE/RLF breakers & parts', query: 'RL breaker',
    manufacturers: /^Siemens(-Allis)?$/i, title: /\bRL[EIF]?\b/ },
  // 121 listings.
  { key: 'spb', label: 'SPB breakers & parts', query: 'SPB',
    manufacturers: /./, title: /\bSPB\d*\b|Systems Pow-R/i },
  // 486 listings for "magnum ds", every one a Magnum.
  { key: 'magnum', label: 'Magnum breakers & parts', query: 'magnum',
    manufacturers: /^(Eaton|Cutler-Hammer|Westinghouse)$/i, title: /magnum/i },
  // 190 listings. Same pattern as the VCP-W decoder matcher (no leading \b on purpose).
  { key: 'vcp-w', label: 'VCP-W vacuum breakers', query: 'VCP-W',
    manufacturers: /^(Eaton|Cutler-Hammer|Westinghouse)$/i, title: /VCP[\s-]?W/i },
  // 11 listings, incl. the DHP-VR vacuum replacements.
  { key: 'dhp', label: 'DHP medium-voltage breakers', query: 'DHP',
    manufacturers: /^(Eaton|Cutler-Hammer|Westinghouse)$/i, title: /\bDHP|\bDH-P\b/i },
  // 17 listings, breakers and arc-resistant gear.
  { key: 'gmsg', label: 'GMSG breakers & switchgear', query: 'GMSG',
    manufacturers: /^Siemens$/i, title: /\bGM-?SG/i },
  // 2 listings, both V5D breakers ($55K-class). Same pattern as the Type VR decoder.
  { key: 'sqd-vr', label: 'Type VR vacuum breakers', query: 'square d VR vacuum',
    manufacturers: /^(Square D|Schneider Electric)$/i, title: /^(?!.*ground and test)(?:.*\bType\s+VR\b|.*\bVAD[\s-]?[23](?!\d))/i },
  // 10 listings.
  { key: 'wavepro', label: 'WavePro breakers & parts', query: 'wavepro',
    manufacturers: /^General Electric$/i, title: /wave\s?pro/i },
  // 123 listings — Eaton, Cutler-Hammer, Westinghouse and Square D-branded units.
  { key: 'digitrip', label: 'Digitrip trip units', query: 'digitrip',
    manufacturers: /./, title: /digitrip/i },
  // 35 listings.
  { key: 'mvt', label: 'MicroVersaTrip trip units', query: 'micro versa trip',
    manufacturers: /^General Electric$/i, title: /micro\s?versa\s?trip/i },
];

export function matchEbayFamily(manufacturer: string, title: string): (EbayFamily & { url: string }) | null {
  if (!manufacturer || !title) return null;
  const f = EBAY_FAMILIES.find((x) => x.manufacturers.test(manufacturer) && x.title.test(title));
  return f ? { ...f, url: `${EBAY_STORE}?_nkw=${encodeURIComponent(f.query).replace(/%20/g, '+')}` } : null;
}

export { EBAY_FAMILIES };
