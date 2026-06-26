import type { Metadata } from 'next';
import DecoderFrame from '../_components/DecoderFrame';

const URL = 'https://www.voytenmanuals.com/tools/rd';

export const metadata: Metadata = {
  title: 'Eaton RD (R-Frame) Breaker Decoder | Free Catalog Number Tool',
  description:
    'Free Eaton RD-series R-Frame catalog number decoder including factory-installed accessories. Parses post-W accessory groups (S/U/T/A/B/Q/N). 400A–2,000A.',
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Eaton RD (R-Frame) Catalog Number Decoder',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: URL,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'Voyten Electric & Electronics', url: 'https://www.voyten.com' },
  description:
    'Decode Eaton RD-series R-Frame catalog numbers including factory-installed accessories; parses post-W accessory groups (S/U/T/A/B/Q/N).',
};

export default function RdDecoderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DecoderFrame src="/tools/rd-decoder.html" title="Eaton RD (R-Frame) Circuit Breaker Decoder" />
    </>
  );
}
