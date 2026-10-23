import DecoderFrame from '../_components/DecoderFrame';
import DecoderAbout from '../_components/DecoderAbout';
import { requireDecoder } from '@/lib/decoders';
import { decoderMetadata, decoderJsonLd } from '@/lib/decoder-seo';
import { decoderStockMeta, getDecoderStock } from '@/lib/decoder-stock';

// Content, metadata and structured data all come from lib/decoders.ts so the
// eight decoder routes cannot drift apart. DecoderAbout carries the indexable
// copy — the decoder itself is an iframe, so none of its text counts as content
// on this page.
const decoder = requireDecoder('mds-sbs');

// Voyten lists this family on eBay, so the route doubles as a listing (lib/decoder-stock.ts).
export const revalidate = 3600;

export const metadata = decoderMetadata(decoder, decoderStockMeta(decoder.slug));

export default async function MdsSbsDecoderPage() {
  const stock = await getDecoderStock(decoder.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(decoderJsonLd(decoder, stock)) }}
      />
      <DecoderFrame src="/tools/mds-sbs-decoder.html" title="Eaton Magnum DS (MDS) / SBS Circuit Breaker Decoder" />
      <DecoderAbout decoder={decoder} stock={stock} />
    </>
  );
}
