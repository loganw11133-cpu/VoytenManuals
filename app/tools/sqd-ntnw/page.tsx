import type { Metadata } from 'next';
import DecoderFrame from '../_components/DecoderFrame';

const URL = 'https://www.voytenmanuals.com/tools/sqd-ntnw';

export const metadata: Metadata = {
  title: 'Square D / MasterPact NT-NW Breaker Decoder | Free Catalog Number Tool',
  description:
    'Free Square D / Schneider MasterPact NT and NW universal power circuit breaker decoder. Identify frame construction (T/W/Y), ampere rating, interrupting class, device type, sensor plugs, and Micrologic trip unit. 800A–6,300A.',
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Square D / MasterPact NT-NW Catalog Number Decoder',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: URL,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'Voyten Electric & Electronics', url: 'https://www.voyten.com' },
  description:
    'Decode Square D / Schneider MasterPact NT and NW catalog numbers — frame construction (T/W/Y), ampere rating, interrupting class, device type, sensor plugs, and Micrologic trip unit. 800A–6,300A.',
};

export default function SqdNtNwDecoderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DecoderFrame src="/tools/sqd-ntnw-decoder.html" title="Square D / MasterPact NT-NW Circuit Breaker Decoder" />
    </>
  );
}
