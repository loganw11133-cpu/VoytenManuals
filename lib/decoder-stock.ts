import { matchDecoderForManual } from '@/lib/decoders';
import { stockedFamilyForDecoder } from '@/lib/ebay-listings';
import { searchManuals } from '@/lib/manuals-db';
import type { DecoderStock, LibraryDoc } from '@/lib/decoder-seo';

// A decoder whose family Voyten lists on eBay doubles as a listing: an in-stock
// card, Product + Offer JSON-LD, and (optionally) the library's manuals for the
// family, each linking to its manual page — which already links back here.

const LIBRARY_LIMIT = 12;

/**
 * RL lists no manual titles: library titles say "Siemens Type RL…", and the decoder
 * page is a front-facing RL surface that must never carry Siemens (see 411786d).
 * The in-stock card and the Voyten Electric-branded Product are fine.
 */
const NO_LIBRARY_LIST = new Set(['rl']);

/** The family's manuals, filtered to the ones whose pages link to this decoder. */
async function libraryFor(slug: string, search: string): Promise<LibraryDoc[]> {
  const params = new URLSearchParams(search);
  try {
    const { manuals } = await searchManuals({
      query: params.get('q') ?? undefined,
      manufacturer: params.get('manufacturer') ?? undefined,
      limit: 50,
    });
    return manuals
      .filter((m) => matchDecoderForManual(m.manufacturer, m.title || '')?.slug === slug)
      .slice(0, LIBRARY_LIMIT)
      .map((m) => ({ slug: m.slug, title: m.title }));
  } catch {
    // The decoder must render even if the library is unreachable.
    return [];
  }
}

/** Metadata needs only the family; the library is fetched at render time. */
export function decoderStockMeta(slug: string): DecoderStock | undefined {
  const family = stockedFamilyForDecoder(slug);
  return family ? { family, library: [] } : undefined;
}

export async function getDecoderStock(slug: string): Promise<DecoderStock | undefined> {
  const family = stockedFamilyForDecoder(slug);
  if (!family) return undefined;
  const library = NO_LIBRARY_LIST.has(slug)
    ? []
    : await libraryFor(slug, family.manualsSearch ?? `q=${encodeURIComponent(family.query)}`);
  return { family, library };
}
