import type { Metadata } from 'next';
import DecoderFrame from '../_components/DecoderFrame';

const URL = 'https://www.voytenmanuals.com/tools/pxr-pdsb';

export const metadata: Metadata = {
  title: 'Eaton Magnum PXR / Power Defense SB Breaker Decoder | Free Catalog Number Tool',
  description:
    'Free decoder for 25-character Eaton Magnum PXR and 15-character Power Defense SB catalog numbers. Identify frame size, ampere rating, trip unit, and accessories. 800A–6,000A.',
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Eaton Magnum PXR / Power Defense SB Catalog Number Decoder',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: URL,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'Voyten Electric & Electronics', url: 'https://www.voyten.com' },
  description:
    'Decode 25-character Eaton Magnum PXR and 15-character Power Defense SB catalog numbers — frame size, ampere rating, trip unit, and accessories.',
};

export default function PxrPdsbDecoderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DecoderFrame src="/tools/pxr-pdsb-decoder.html" title="Eaton Magnum PXR / Power Defense SB Circuit Breaker Decoder" />
    </>
  );
}
