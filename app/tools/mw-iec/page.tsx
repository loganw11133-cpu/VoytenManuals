import type { Metadata } from 'next';
import DecoderFrame from '../_components/DecoderFrame';

const URL = 'https://www.voytenmanuals.com/tools/mw-iec';

export const metadata: Metadata = {
  title: 'Eaton Magnum MW (IEC) Breaker Decoder | Free Catalog Number Tool',
  description:
    'Free Eaton IEC 60947-2 Magnum MW catalog number decoder. Supports 49 ampere ratings with fixed/draw-out mounting and motorized/manual operation. 800A–6,300A.',
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Eaton Magnum MW (IEC) Catalog Number Decoder',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: URL,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'Voyten Electric & Electronics', url: 'https://www.voyten.com' },
  description:
    'Decode Eaton IEC 60947-2 Magnum MW catalog numbers — 49 ampere ratings, fixed/draw-out mounting, motorized/manual operation.',
};

export default function MwIecDecoderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DecoderFrame src="/tools/mw-iec-decoder.html" title="Eaton Magnum MW (IEC) Circuit Breaker Decoder" />
    </>
  );
}
