import Link from 'next/link';
import { Zap, Shield, Settings, ToggleLeft, Flame, Building2, Cable, BookOpen, Phone, ArrowRight } from 'lucide-react';
import { getCategories, getTotalManualCount } from '@/lib/manuals-db';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Manual Categories — Breakers, Relays & More',
  description: 'Browse 8,400+ free electrical manuals by category — circuit breakers, relays, motor controls, switches, fuses, transformers, and bus products. Download PDFs instantly.',
  openGraph: {
    title: 'Browse Manual Categories — Breakers, Relays & More',
    description: 'Browse 8,400+ free electrical equipment manuals by category. Circuit breakers, relays, motor controls, switches, fuses, transformers, and bus products.',
    url: 'https://voytenmanuals.com/categories',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Manual Categories | Voyten Manuals',
    description: 'Browse 8,400+ free electrical equipment manuals by category. Circuit breakers, relays, motor controls, and more.',
  },
  alternates: {
    canonical: 'https://voytenmanuals.com/categories',
  },
};

const CATEGORY_META: Record<string, { icon: typeof Zap; longDesc: string }> = {
  'Circuit Breakers': { icon: Zap, longDesc: 'Air breakers, insulated case breakers, molded case breakers, trip units, retrofit kits, vacuum interrupters, renewal parts, and accessories.' },
  'Relays and Meters': { icon: Shield, longDesc: 'Overcurrent relays, protective relays, metering equipment, and related documentation.' },
  'Motor Controls': { icon: Settings, longDesc: 'Motor control centers, starters, contactors, overloads, and MCC bucket replacement guides.' },
  'Switches': { icon: ToggleLeft, longDesc: 'Disconnect switches, transfer switches, safety switches, and operating manuals.' },
  'Fuses': { icon: Flame, longDesc: 'Fuse links, fuse holders, fuse catalogs, and rating documentation.' },
  'Transformers': { icon: Building2, longDesc: 'Dry-type transformers, oil-filled transformers, pad-mounted, and instrument transformers.' },
  'Bus Products': { icon: Cable, longDesc: 'Bus duct, busway systems, bus plugs, insulators, and installation manuals.' },
  'Miscellaneous': { icon: BookOpen, longDesc: 'Communications modules, accessories, field testing documentation, and other equipment.' },
};

export const revalidate = 3600;

export default async function CategoriesPage() {
  const [categories, totalCount] = await Promise.all([
    getCategories(),
    getTotalManualCount(),
  ]);

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Electrical Equipment Manual Categories',
    description: `Browse ${totalCount.toLocaleString()} free electrical equipment manuals organized by category.`,
    numberOfItems: categories.length,
    itemListElement: categories.map((cat, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: cat.name,
      url: `https://voytenmanuals.com/search?category=${encodeURIComponent(cat.name)}`,
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
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">Browse by Category</h1>
          <p className="text-slate-300 text-lg max-w-2xl">
            {totalCount.toLocaleString()} electrical equipment manuals organized by equipment type — all free to download as PDFs.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat.name] || { icon: BookOpen, longDesc: '' };
            const Icon = meta.icon;
            return (
              <Link
                key={cat.name}
                href={`/search?category=${encodeURIComponent(cat.name)}`}
                className="group bg-white rounded-xl border border-slate-200 p-6 hover:border-[#1a1a1a]/30 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#1a1a1a]/10 group-hover:bg-[#1a1a1a] rounded-xl flex items-center justify-center transition-colors">
                    <Icon className="w-6 h-6 text-[#1a1a1a] group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm font-semibold text-[#1a1a1a] bg-[#1a1a1a]/5 px-3 py-1 rounded-full">
                    {cat.count.toLocaleString()} manuals
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#1a1a1a] transition-colors">{cat.name}</h2>
                <p className="text-slate-500 text-sm">{meta.longDesc}</p>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-[#1a1a1a] rounded-2xl p-8 lg:p-10 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Need help finding a manual or part?</h3>
          <p className="text-slate-300 mb-6 max-w-xl mx-auto">
            Our team of 45+ experts has decades of hands-on experience with this equipment. Call us or submit a request.
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
