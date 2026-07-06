import type { Metadata } from 'next';
import DecoderFrame from '../_components/DecoderFrame';

const URL = 'https://www.voytenmanuals.com/tools/wavepro';

export const metadata: Metadata = {
  title: 'GE WavePro Breaker Decoder | Free Catalog Number Tool',
  description:
    'Free GE WavePro low-voltage power air circuit breaker catalog number decoder. Identify equipment usage, interrupting/fuse rating, frame & sensor, MVT / Power+ trip unit, trip function, rating plug, operation voltages, and mounted accessories. 800A–5,000A (AKD-10 / PowerBreak II / AV-3).',
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'GE WavePro Catalog Number Decoder',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: URL,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'Voyten Electric & Electronics', url: 'https://www.voyten.com' },
  description:
    'Decode GE WavePro low-voltage power air circuit breaker catalog numbers — equipment usage, interrupting/fuse rating, frame & sensor, MVT / Power+ trip unit, trip function, rating plug, operation voltages, and mounted accessories. 800A–5,000A.',
};

export default function WaveProDecoderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DecoderFrame src="/tools/wavepro-decoder.html" title="GE WavePro Circuit Breaker Decoder" />
    </>
  );
}
