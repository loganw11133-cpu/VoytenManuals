import DecoderFrame from '../_components/DecoderFrame';
import DecoderAbout from '../_components/DecoderAbout';
import { requireDecoder } from '@/lib/decoders';
import { decoderMetadata, decoderJsonLd } from '@/lib/decoder-seo';

// Content, metadata and structured data all come from lib/decoders.ts so the
// decoder routes cannot drift apart. DecoderAbout carries the indexable copy —
// the decoder itself is an iframe, so none of its text counts as content here.
// The directory name must stay in step with the registry slug: the hub card
// href, the hub ItemList JSON-LD and the canonical URL are all built from it.
// While the registry entry is comingSoon this route is noindex and unlinked.
const decoder = requireDecoder('pd-mccb');

export const metadata = decoderMetadata(decoder);

export default function PdMccbDecoderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(decoderJsonLd(decoder)) }}
      />
      <DecoderFrame src="/tools/pd-mccb-decoder.html" title="Eaton Power Defense Molded Case Circuit Breaker Decoder" />
      <DecoderAbout decoder={decoder} />
    </>
  );
}
