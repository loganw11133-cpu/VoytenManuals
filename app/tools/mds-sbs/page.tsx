import type { Metadata } from 'next';
import DecoderFrame from '../_components/DecoderFrame';

const URL = 'https://www.voytenmanuals.com/tools/mds-sbs';

export const metadata: Metadata = {
  title: 'Eaton Magnum DS (MDS) / SBS Breaker Decoder | Free Catalog Number Tool',
  description:
    'Free Eaton Magnum DS (MDS) and SBS-series catalog number decoder. Identify frame, rating, interrupting capacity, trip unit type, and mounting. 800A–6,000A.',
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Eaton Magnum DS (MDS) / SBS Catalog Number Decoder',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: URL,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'Voyten Electric & Electronics', url: 'https://www.voyten.com' },
  description:
    'Decode Eaton Magnum DS (MDS) and SBS-series catalog numbers — frame, rating, interrupting capacity, trip unit type, and mounting.',
};

export default function MdsSbsDecoderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DecoderFrame src="/tools/mds-sbs-decoder.html" title="Eaton Magnum DS (MDS) / SBS Circuit Breaker Decoder" />
    </>
  );
}
