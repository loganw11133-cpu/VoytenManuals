import type { Metadata } from 'next';
import type { Decoder } from '@/lib/decoders';

const SITE = 'https://www.voytenmanuals.com';

/**
 * Metadata + structured data for a decoder route, generated from the decoder
 * config so all eight stay consistent and a ninth needs no new SEO code.
 */
export function decoderMetadata(d: Decoder): Metadata {
  const url = `${SITE}/tools/${d.slug}`;
  const title = `${d.fullName} Breaker Decoder | Free Catalog Number Tool`;
  const description = `${d.description} Free, no login. ${d.ratings}.`;

  return {
    title,
    description,
    keywords: [
      `${d.fullName} catalog number`,
      `${d.fullName} decoder`,
      `${d.manufacturer} breaker catalog number decoder`,
      `${d.name} nameplate`,
      `decode ${d.name} breaker number`,
      `${d.manufacturer} circuit breaker identification`,
      ...d.alsoKnownAs,
      'obsolete circuit breaker identification',
      'legacy breaker catalog number',
    ],
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      siteName: 'Voyten Manuals',
      title,
      description,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

/** SoftwareApplication + BreadcrumbList (+ FAQPage when the decoder has FAQs). */
export function decoderJsonLd(d: Decoder) {
  const url = `${SITE}/tools/${d.slug}`;

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'SoftwareApplication',
      '@id': `${url}#tool`,
      name: `${d.fullName} Catalog Number Decoder`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url,
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: {
        '@type': 'Organization',
        name: 'Voyten Electric & Electronics',
        url: 'https://www.voyten.com',
      },
      description: `${d.description} Covers ${d.frames}, ${d.ratings}.`,
      featureList: d.identifies,
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumbs`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Breaker Decoders', item: `${SITE}/tools` },
        { '@type': 'ListItem', position: 3, name: `${d.fullName} Decoder`, item: url },
      ],
    },
  ];

  if (d.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: d.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}
