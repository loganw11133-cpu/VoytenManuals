import Link from 'next/link';
import { Phone, ArrowRight } from 'lucide-react';
import { getManufacturers, getTotalManualCount } from '@/lib/manuals-db';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse by Manufacturer — Westinghouse, GE & More',
  description: 'Browse free electrical manuals from 130+ manufacturers — Westinghouse, GE, Siemens, Square D, Cutler-Hammer, ABB, ITE, and more. Download PDFs instantly.',
  openGraph: {
    title: 'Browse by Manufacturer — Westinghouse, GE & More',
    description: 'Browse free electrical equipment manuals by manufacturer. Westinghouse, GE, Siemens, Square D, Cutler-Hammer, ABB, and 120+ more.',
    url: 'https://voytenmanuals.com/manufacturers',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse by Manufacturer | Voyten Manuals',
    description: 'Free electrical equipment manuals from 130+ manufacturers. Westinghouse, GE, Siemens, Square D, and more.',
  },
  alternates: {
    canonical: 'https://voytenmanuals.com/manufacturers',
  },
};

export const revalidate = 3600;

export default async function ManufacturersPage() {
  const [manufacturers, totalCount] = await Promise.all([
    getManufacturers(),
    getTotalManualCount(),
  ]);

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Electrical Equipment Manual Manufacturers',
    description: `Browse ${totalCount.toLocaleString()} manuals from ${manufacturers.length} electrical equipment manufacturers.`,
    numberOfItems: manufacturers.length,
    itemListElement: manufacturers.map((mfr, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: mfr.name,
      url: `https://voytenmanuals.com/search?manufacturer=${encodeURIComponent(mfr.name)}`,
    })),
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div className="bg-[#1a1a1a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">Browse by Manufacturer</h1>
          <p className="text-slate-300 text-lg max-w-2xl">
            {totalCount.toLocaleString()} manuals from {manufacturers.length} electrical equipment manufacturers — sorted by library size.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {manufacturers.map((mfr, i) => (
            <Link
              key={mfr.name}
              href={`/search?manufacturer=${encodeURIComponent(mfr.name)}`}
              className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-[#1a1a1a]/30 hover:shadow-lg transition-all flex items-center justify-between"
            >
              <div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#1a1a1a] transition-colors">{mfr.name}</h2>
                <p className="text-slate-400 text-sm">{mfr.count.toLocaleString()} manuals</p>
              </div>
              {i < 3 && (
                <span className="text-xs font-semibold text-[#dc2626] bg-[#dc2626]/10 px-2.5 py-1 rounded-full flex-shrink-0">
                  Top {i + 1}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-[#1a1a1a] rounded-2xl p-8 lg:p-10 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Don&#39;t see your manufacturer?</h3>
          <p className="text-slate-300 mb-6 max-w-xl mx-auto">
            Our library is growing every day. Let us know what you need and we&#39;ll track it down — or call us for parts and technical support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:1-800-458-4001"
              className="flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              <Phone size={18} />
              1-800-458-4001
            </a>
            <Link
              href="/contact?type=manual-request"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium border border-white/20 transition-colors"
            >
              Request a Manual
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
