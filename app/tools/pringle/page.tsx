import DecoderFrame from '../_components/DecoderFrame';
import DecoderAbout from '../_components/DecoderAbout';
import { requireDecoder } from '@/lib/decoders';
import { decoderMetadata, decoderJsonLd } from '@/lib/decoder-seo';
import { decoderStockMeta, getDecoderStock } from '@/lib/decoder-stock';

// Content, metadata and structured data all come from lib/decoders.ts so the
// decoder routes cannot drift apart. DecoderAbout carries the indexable copy —
// the decoder itself is an iframe, so none of its text counts as content here.
// The directory name must stay in step with the registry slug: the hub card
// href, the hub ItemList JSON-LD and the canonical URL are all built from it.
// While the registry entry is comingSoon this route is noindex and unlinked.
const decoder = requireDecoder('pringle');

// Voyten lists this family on eBay, so the route doubles as a listing (lib/decoder-stock.ts).
// Its manual list refreshes every 60 days (and on every deploy); it changes rarely.
export const revalidate = 5184000;

export const metadata = decoderMetadata(decoder, decoderStockMeta(decoder.slug));

export default async function PringleDecoderPage() {
  const stock = await getDecoderStock(decoder.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(decoderJsonLd(decoder, stock)) }}
      />
      <DecoderFrame src="/tools/pringle-decoder.html" title="Eaton Pringle Bolted Pressure Switch Decoder" />
      <DecoderAbout decoder={decoder} stock={stock} />
    </>
  );
}
