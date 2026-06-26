import type { Metadata } from 'next';
import DecoderFrame from '../_components/DecoderFrame';

const URL = 'https://www.voytenmanuals.com/tools/rl';

export const metadata: Metadata = {
  title: 'Siemens RL Breaker Decoder | Free Catalog Number Tool',
  description:
    'Free Siemens RL / RLE / RLI / RLF 600V Low Voltage Power Circuit Breaker catalog number decoder. Identify connection, interrupting type, frame, sensors, system wiring, trip unit, and optional devices. 800A–5,000A.',
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Siemens RL Breaker Catalog Number Decoder',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: URL,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'Voyten Electric & Electronics', url: 'https://www.voyten.com' },
  description:
    'Decode Siemens RL 600V Low Voltage Power Circuit Breaker catalog numbers — connection, interrupting type, frame (RL/RLE/RLI/RLF), sensors, system wiring, trip unit, and optional devices.',
};

export default function RlDecoderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DecoderFrame src="/tools/rl-decoder.html" title="Siemens RL LVPCB Circuit Breaker Decoder" />
    </>
  );
}
