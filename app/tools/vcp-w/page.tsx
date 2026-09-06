import DecoderFrame from '../_components/DecoderFrame';
import DecoderAbout from '../_components/DecoderAbout';
import { requireDecoder } from '@/lib/decoders';
import { decoderMetadata, decoderJsonLd } from '@/lib/decoder-seo';

// Content, metadata and structured data all come from lib/decoders.ts so the
// decoder routes cannot drift apart. DecoderAbout carries the indexable copy —
// the decoder itself is an iframe, so none of its text counts as content here.
// The directory name must stay in step with the registry slug: the hub card
// href, the hub ItemList JSON-LD and the canonical URL are all built from it.
const decoder = requireDecoder('vcp-w');

export const metadata = decoderMetadata(decoder);

export default function VcpWDecoderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(decoderJsonLd(decoder)) }}
      />
      <DecoderFrame src="/tools/vcp-w-decoder.html" title="Eaton VCP-W Medium Voltage Vacuum Circuit Breaker Decoder" />
      <DecoderAbout decoder={decoder} />
    </>
  );
}
