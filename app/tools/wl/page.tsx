import type { Metadata } from 'next';
import DecoderFrame from '../_components/DecoderFrame';

const URL = 'https://www.voytenmanuals.com/tools/wl';

export const metadata: Metadata = {
  title: 'Siemens WL / Sentron WL Breaker Decoder | Free Catalog Number Tool',
  description:
    'Free Siemens WL (Sentron WL) low-voltage circuit breaker decoder. Decodes all 15 catalog-number digits under both UL 489 (insulated case) and UL 1066 / ANSI C37 (power circuit breaker) — interrupting class, frame size, mounting, poles, ampere rating, rating plug, ETU745 / ETU776 trip unit and factory accessories. 800A–6,000A.',
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Siemens WL / Sentron WL Catalog Number Decoder',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: URL,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'Voyten Electric & Electronics', url: 'https://www.voyten.com' },
  description:
    'Decode Siemens WL (Sentron WL) catalog numbers — interrupting class, frame size, mounting, poles, frame ampere rating, rating plug, ETU745 / ETU776 trip unit and factory accessories, under both UL 489 and UL 1066 / ANSI C37. 800A–6,000A.',
};

export default function WlDecoderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DecoderFrame src="/tools/wl-decoder.html" title="Siemens WL / Sentron WL Circuit Breaker Decoder" />
    </>
  );
}
