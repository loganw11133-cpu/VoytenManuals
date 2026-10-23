import type { Metadata } from 'next';
import type { Decoder } from '@/lib/decoders';
import { stockedOffers, type EbayFamily } from '@/lib/ebay-listings';

const SITE = 'https://www.voytenmanuals.com';

/** A library manual linked from a decoder route. */
export interface LibraryDoc {
  slug: string;
  title: string;
}

/**
 * What a decoder route sells and links to when it doubles as a listing: the
 * stocked eBay family the decoder identifies, and the library's manuals for it.
 */
export interface DecoderStock {
  family: EbayFamily & { url: string };
  library: LibraryDoc[];
}

/**
 * Metadata + structured data for a decoder route, generated from the decoder
 * config so all eight stay consistent and a ninth needs no new SEO code.
 */
export function decoderMetadata(d: Decoder, stock?: DecoderStock): Metadata {
  const url = `${SITE}/tools/${d.slug}`;
  const title = `${d.fullName} Breaker Decoder | Free Catalog Number Tool`;
  // A stocked family's decoder is also a listing, so its snippet says so, the
  // same way the family's manual pages do.
  const description = stock
    ? `${d.description} Free, no login. ${d.ratings}. Voyten Electric stocks ${stock.family.label} — buy on eBay or request a quote, 24/7: 1-800-458-4001.`
    : `${d.description} Free, no login. ${d.ratings}.`;

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
    // A route can exist while its hub card is still "Coming Soon" (built,
    // not yet announced). Keep it out of the index until the card goes live.
    robots: d.comingSoon ? { index: false, follow: true } : { index: true, follow: true },
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

/**
 * SoftwareApplication + BreadcrumbList (+ FAQPage when the decoder has FAQs).
 * With `stock`, the route is also a CollectionPage: the stocked Product with its
 * eBay and quote Offers, and an ItemList of the library's manuals for the family.
 */
export function decoderJsonLd(d: Decoder, stock?: DecoderStock) {
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

  if (stock) {
    const { family, library } = stock;
    graph.push(
      {
        '@type': 'Product',
        '@id': `${url}#stock`,
        name: family.product,
        category: family.category,
        brand: { '@type': 'Brand', name: family.brand },
        description: `${family.product}, stocked by Voyten Electric — buy from the Voyten eBay store or request a quote. Identify the exact unit first with the free decoder on this page. 24/7 emergency: 1-800-458-4001.`,
        subjectOf: { '@id': `${url}#tool` },
        offers: stockedOffers(family),
      },
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        url,
        name: `${d.fullName} — decoder, manuals and stock`,
        about: { '@id': `${url}#stock` },
        hasPart: { '@id': `${url}#tool` },
        breadcrumb: { '@id': `${url}#breadcrumbs` },
        ...(library.length > 0 && {
          mainEntity: {
            '@type': 'ItemList',
            name: `${d.fullName} manuals`,
            numberOfItems: library.length,
            itemListElement: library.map((m, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: m.title,
              url: `${SITE}/manual/${m.slug}`,
            })),
          },
        }),
      },
    );
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}
