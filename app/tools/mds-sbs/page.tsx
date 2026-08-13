import DecoderFrame from '../_components/DecoderFrame';
import DecoderAbout from '../_components/DecoderAbout';
import { requireDecoder } from '@/lib/decoders';
import { decoderMetadata, decoderJsonLd } from '@/lib/decoder-seo';

// Content, metadata and structured data all come from lib/decoders.ts so the
// eight decoder routes cannot drift apart. DecoderAbout carries the indexable
// copy — the decoder itself is an iframe, so none of its text counts as content
// on this page.
const decoder = requireDecoder('mds-sbs');

export const metadata = decoderMetadata(decoder);

export default function MdsSbsDecoderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(decoderJsonLd(decoder)) }}
      />
      <DecoderFrame src="/tools/mds-sbs-decoder.html" title="Eaton Magnum DS (MDS) / SBS Circuit Breaker Decoder" />
      <DecoderAbout decoder={decoder} />
    </>
  );
}
