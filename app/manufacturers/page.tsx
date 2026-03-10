import Link from 'next/link';
import { Phone, ArrowRight } from 'lucide-react';
import { getManufacturers, getTotalManualCount } from '@/lib/manuals-db';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Manuals by Manufacturer — Westinghouse, GE, Siemens, Square D & More',
  description: 'Browse free electrical equipment manuals by manufacturer. Find PDF documentation from Westinghouse, General Electric, Siemens, Square D, Cutler-Hammer, ITE, ABB, Allis-Chalmers, and dozens more. Powered by Voyten Electric.',
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

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-[#1a3a5c] text-white">
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
              className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-[#1a3a5c]/30 hover:shadow-lg transition-all flex items-center justify-between"
            >
              <div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#1a3a5c] transition-colors">{mfr.name}</h2>
                <p className="text-slate-400 text-sm">{mfr.count.toLocaleString()} manuals</p>
              </div>
              {i < 3 && (
                <span className="text-xs font-semibold text-[#c8962e] bg-[#c8962e]/10 px-2.5 py-1 rounded-full flex-shrink-0">
                  Top {i + 1}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-[#1a3a5c] rounded-2xl p-8 lg:p-10 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Don&#39;t see your manufacturer?</h3>
          <p className="text-slate-300 mb-6 max-w-xl mx-auto">
            Our library is growing every day. Let us know what you need and we&#39;ll track it down — or call us for parts and technical support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:1-800-458-4001"
              className="flex items-center justify-center gap-2 bg-[#c8962e] hover:bg-[#b8862a] text-white px-6 py-3 rounded-lg font-bold transition-colors"
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
