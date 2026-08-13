import type { Metadata } from 'next';
import Link from 'next/link';
import { Cpu, ArrowRight, WifiOff } from 'lucide-react';
import { decoders, groupedDecoders as grouped, publicDecoders } from '@/lib/decoders';

const SITE = 'https://www.voytenmanuals.com';

export const metadata: Metadata = {
  title: 'Breaker Decoder Tools',
  description: 'Free circuit breaker catalog number decoders. Decode Eaton, Siemens, GE, and Square D / Schneider model numbers for Siemens RL, Siemens WL (Sentron WL), GE WavePro, Eaton RD (R-Frame), Magnum DS (MDS) / SBS, Magnum MW (IEC), Magnum PXR / Power Defense SB, and Square D MasterPact NT / NW breakers instantly.',
  keywords: [
    'circuit breaker catalog number decoder',
    'breaker nameplate decoder',
    'decode breaker model number',
    'obsolete circuit breaker identification',
    ...decoders.map((d) => `${d.fullName} decoder`),
  ],
  robots: { index: true, follow: true },
  alternates: {
    canonical: `${SITE}/tools`,
  },
  openGraph: {
    type: 'website',
    url: `${SITE}/tools`,
    siteName: 'Voyten Manuals',
    title: 'Free Breaker Catalog Number Decoders',
    description: 'Identify a Siemens, Eaton / Cutler-Hammer, GE or Square D circuit breaker from its catalog number — frame, ampere rating, trip unit, mounting and factory accessories. Free, no login.',
  },
};

// ItemList lets search and AI systems enumerate the tool set from one fetch;
// BreadcrumbList gives the hub its place in the site hierarchy.
const hubJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ItemList',
      '@id': `${SITE}/tools#tools`,
      name: 'Free Breaker Catalog-Number Decoders',
      description:
        'Free web tools that decode circuit breaker catalog and edge-stamped numbers into frame size, ampere rating, interrupting capacity, trip unit, mounting and factory accessories.',
      numberOfItems: publicDecoders.length,
      itemListElement: publicDecoders.map((d, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${d.fullName} Catalog Number Decoder`,
        url: `${SITE}/tools/${d.slug}`,
      })),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${SITE}/tools#breadcrumbs`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Breaker Decoders', item: `${SITE}/tools` },
      ],
    },
  ],
};

export default function ToolsPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubJsonLd) }}
      />

      {/* Header */}
      <div className="bg-[#1a1a1a] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Breaker Decoders
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            Enter a catalog or edge-stamped number to instantly decode frame size, ampere rating, trip unit, mounting, and accessories.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Indexable framing for the hub — states what the tools do, who they're
            for, and which nameplate brands they cover, in the words engineers
            actually search. */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-slate-700 leading-relaxed">
            A breaker catalog number encodes everything you need to source a replacement &mdash;
            frame size, ampere rating, interrupting capacity, trip unit, mounting and every
            factory-installed accessory. These {publicDecoders.length} free tools read that number
            and give you the answer in seconds, with a position-by-position map showing which
            character carried which value. No login, no cost.
          </p>
          <p className="text-slate-600 text-sm mt-3">
            Built for engineers, plant and facility managers, electricians and field-service
            technicians identifying obsolete or end-of-life gear during an outage or a planned
            shutdown &mdash; including nameplates still stamped Cutler-Hammer, Westinghouse,
            Siemens-Allis or Square D.
          </p>
        </div>

        {/* Jump to a manufacturer */}
        <nav aria-label="Jump to manufacturer" className="flex flex-wrap justify-center gap-2 mb-10">
          {grouped.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-[#1a1a1a]/40 text-slate-700 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
            >
              {group.label}
              <span className="text-[0.65rem] font-bold text-slate-500 bg-slate-100 rounded-full px-1.5 py-0.5">
                {group.items.length}
              </span>
            </a>
          ))}
        </nav>

        {/* Tool cards, grouped by manufacturer */}
        {grouped.map((group) => (
          <section key={group.id} id={group.id} className="mb-12 scroll-mt-24">
            <div className="flex items-baseline gap-3 mb-5 pb-2 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">{group.label}</h2>
              <span className="text-xs text-slate-500">
                {group.items.length} {group.items.length === 1 ? 'tool' : 'tools'}
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {group.items.map((tool) => {
                const isLanding = tool.landing === true;
                const isComingSoon = tool.comingSoon === true;
                const href = tool.href ?? `/tools/${tool.slug}`;

                const body = (
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isComingSoon ? 'bg-slate-100' : 'bg-[#1a1a1a]/5 group-hover:bg-[#1a1a1a]'}`}>
                      <Cpu className={`w-6 h-6 transition-colors ${isComingSoon ? 'text-slate-400' : 'text-[#1a1a1a] group-hover:text-white'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {/* Arrow sits inside the heading so it trails the last word
                            instead of orphaning onto its own line when a long name
                            wraps (e.g. "Magnum PXR / Power Defense SB Decoder"). */}
                        <h3 className={`text-lg font-bold transition-colors ${isComingSoon ? 'text-slate-500' : 'text-slate-900 group-hover:text-[#dc2626]'}`}>
                          {isLanding ? tool.name : `${tool.name} Decoder`}
                          {!isComingSoon && (
                            <ArrowRight
                              size={16}
                              aria-hidden="true"
                              className="inline-block ml-1.5 -mb-0.5 text-slate-400 group-hover:text-[#dc2626] group-hover:translate-x-1 transition-all"
                            />
                          )}
                        </h3>
                        {isLanding && (
                          <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-[#dc2626]/10 text-[#dc2626] uppercase tracking-wide">
                            Availability &amp; Quote
                          </span>
                        )}
                        {isComingSoon && (
                          <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wide">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mb-3 ${isComingSoon ? 'text-slate-500' : 'text-slate-600'}`}>{tool.description}</p>
                      <div className="flex flex-col gap-1 text-xs text-slate-500">
                        <span><span className="font-semibold text-slate-700">Frames:</span> {tool.frames}</span>
                        <span><span className="font-semibold text-slate-700">Ratings:</span> {tool.ratings}</span>
                      </div>
                    </div>
                  </div>
                );

                // Not yet built — render as a static placeholder so it doesn't 404.
                if (isComingSoon) {
                  return (
                    <div
                      key={tool.slug}
                      className="h-full bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6"
                    >
                      {body}
                    </div>
                  );
                }

                return (
                  <Link
                    key={tool.slug}
                    href={href}
                    className="group h-full bg-white border border-slate-200 rounded-xl p-6 hover:border-[#1a1a1a]/30 hover:shadow-lg transition-all"
                  >
                    {body}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {/* Offline kit — these tools run from a local folder with no connection,
            which matters in a switchgear room or basement with no signal. */}
        <div className="mt-10 bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-[#1a1a1a]/5 flex items-center justify-center flex-shrink-0">
            <WifiOff className="w-6 h-6 text-[#1a1a1a]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-900 mb-1">Working somewhere without a signal?</h2>
            <p className="text-slate-600 text-sm">
              Every decoder above also runs offline from a local folder &mdash; decoding, the position
              map, copy and PDF export all work with no connection.
            </p>
          </div>
          {/* Plain <a>, not next/link — offline.html is a static file in public/,
              not a route, so it needs a real navigation rather than a client-side
              transition the router can't resolve. */}
          <a
            href="/tools/offline.html"
            className="inline-flex items-center justify-center gap-2 flex-shrink-0 border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Open the Offline Kit
            <ArrowRight size={16} />
          </a>
        </div>

        {/* CTA */}
        <div className="mt-5 bg-white border border-slate-200 rounded-xl p-8 text-center">
          <h2 className="font-bold text-slate-900 text-lg mb-2">Need help identifying a breaker?</h2>
          <p className="text-slate-600 text-sm mb-4 max-w-lg mx-auto">
            If you can&#39;t decode your model number with these tools, our team can help. Send us the catalog number or nameplate photo and we&#39;ll identify it for you.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Contact Our Team
          </Link>
        </div>
      </div>
    </div>
  );
}
