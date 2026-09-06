import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Phone, ArrowRight, BookOpen, Tag, ChevronRight } from 'lucide-react';
import ManualCard from '@/components/ManualCard';
import {
  getManufacturerBySlug,
  getManufacturerCategories,
  getManufacturerManuals,
} from '@/lib/manuals-db';

export const revalidate = 3600;

interface ManufacturerPageProps {
  params: Promise<{ slug: string }>;
}

// ── Manufacturer descriptions for SEO-rich content ──
// Top manufacturers get hand-written descriptions. Others get a generated one.
const MANUFACTURER_DESCRIPTIONS: Record<string, string> = {
  'Westinghouse': 'Westinghouse Electric Corporation pioneered AC power distribution and manufactured a wide range of low and medium voltage circuit breakers, switchgear, motor controls, and protective relays. Though the brand has changed hands over the decades, Westinghouse equipment remains in service across thousands of industrial and utility installations worldwide.',
  'General Electric': 'General Electric (GE) has been a cornerstone of the electrical industry for over a century. Their product lines include AKR and AK air circuit breakers, Power Break and Wave Pro insulated case breakers, Multilin protective relays, and a full range of motor controls and switchgear. GE equipment is installed in facilities ranging from data centers to manufacturing plants.',
  'Siemens': 'Siemens is a global leader in electrical power distribution. Their circuit breaker lines include the WL and Sentron series for low voltage applications, along with medium voltage vacuum breakers and a comprehensive range of switchgear, motor controls, and protective relays. Voyten Electric acquired the complete remaining inventory of Type RL and LA low voltage power circuit breakers from the Wendell, NC manufacturing facility — making Voyten your New Surplus authorized source for Voyten Type RL/VRL breakers, Static Trip III units, and all associated accessories and renewal parts. Siemens continues to support legacy ITE and Gould product lines.',
  'Square D': 'Square D, now part of Schneider Electric, is one of the most recognized names in electrical distribution equipment. Their product lines include Masterpact air circuit breakers, PowerPact insulated case and molded case breakers, and extensive motor control and panelboard offerings. Square D equipment is a staple in commercial and industrial facilities.',
  'Cutler-Hammer': 'Cutler-Hammer, now part of Eaton, manufactured a broad range of electrical distribution equipment including SPB, Magnum DS, and DS/DSL air circuit breakers, Series C molded case breakers, and motor control centers. Their legacy equipment remains widely installed and supported through Eaton\'s aftermarket network.',
  'ABB': 'ABB (Asea Brown Boveri) is a global technology leader in electrification and automation. Their circuit breaker portfolio includes SACE Emax and Tmax series, and their protective relay lines (REF, RET, REL) are used in utility and industrial applications worldwide. ABB also acquired the legacy ITE and BBC product lines.',
  'Eaton': 'Eaton is a power management company whose electrical division encompasses the former Cutler-Hammer, Westinghouse, and ITE brands. Their current product lines include Magnum DS air breakers, Power Defense insulated case breakers, and Series C molded case breakers. Eaton provides comprehensive support for legacy and current equipment.',
  'ITE': 'ITE Imperial Corporation was a major manufacturer of circuit breakers and switchgear before being acquired by Siemens. ITE\'s KA/KB air circuit breakers, HK/JK molded case breakers, and switchgear assemblies remain in widespread service. Technical documentation for ITE products is maintained through both Siemens and aftermarket suppliers.',
  'Allis-Chalmers': 'Allis-Chalmers manufactured medium and low voltage switchgear, circuit breakers, and motor controls for industrial and utility applications. Their LA and MA series breakers were widely used in heavy industrial settings. Much of the Allis-Chalmers electrical product line was eventually acquired by Siemens.',
  'Federal Pacific': 'Federal Pacific Electric (FPE) produced panelboards, switchgear, and circuit breakers for commercial and industrial applications. Their Stab-Lok panels and NB/NE series breakers were widely installed. FPE equipment requires careful sourcing of renewal parts and technical documentation.',
};

function getManufacturerDescription(name: string): string {
  if (MANUFACTURER_DESCRIPTIONS[name]) return MANUFACTURER_DESCRIPTIONS[name];
  return `${name} electrical equipment manuals, instruction books, wiring diagrams, and renewal parts catalogs. Browse our complete library of ${name} technical documentation for circuit breakers, switchgear, relays, motor controls, and related equipment.`;
}

// ── Metadata ──

export async function generateMetadata({ params }: ManufacturerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const manufacturer = await getManufacturerBySlug(slug);
  if (!manufacturer) return { title: 'Manufacturer Not Found' };

  const categories = await getManufacturerCategories(manufacturer.name);
  const topCategories = categories.slice(0, 3).map(c => c.category).join(', ');

  const title = `${manufacturer.name} Manuals — ${manufacturer.count.toLocaleString()} Free PDFs`;
  const description = `Download ${manufacturer.count.toLocaleString()} free ${manufacturer.name} manuals — ${topCategories}, and more. Instruction books, wiring diagrams, and technical documentation.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.voytenmanuals.com/manufacturers/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${manufacturer.name} Manuals | Voyten Manuals`,
      description,
    },
    alternates: {
      canonical: `https://www.voytenmanuals.com/manufacturers/${slug}`,
    },
  };
}

// ── Page ──

export default async function ManufacturerDetailPage({ params }: ManufacturerPageProps) {
  const { slug } = await params;
  const manufacturer = await getManufacturerBySlug(slug);
  if (!manufacturer) notFound();

  const [categories, featuredManuals] = await Promise.all([
    getManufacturerCategories(manufacturer.name),
    getManufacturerManuals(manufacturer.name, 12),
  ]);

  const description = getManufacturerDescription(manufacturer.name);

  // JSON-LD: CollectionPage + ItemList
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': `${manufacturer.name} Electrical Equipment Manuals`,
    'description': description,
    'url': `https://www.voytenmanuals.com/manufacturers/${slug}`,
    'numberOfItems': manufacturer.count,
    'provider': {
      '@type': 'Organization',
      'name': 'Voyten Electric & Electronics, Inc.',
      'url': 'https://www.voytenmanuals.com',
    },
    'about': {
      '@type': 'Organization',
      'name': manufacturer.name,
    },
    'mainEntity': {
      '@type': 'ItemList',
      'name': `${manufacturer.name} Manuals`,
      'numberOfItems': manufacturer.count,
      'itemListElement': featuredManuals.map((m, i) => ({
        '@type': 'ListItem',
        'position': i + 1,
        'name': m.title,
        'url': `https://www.voytenmanuals.com/manual/${m.slug}`,
      })),
    },
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.voytenmanuals.com' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Manufacturers', 'item': 'https://www.voytenmanuals.com/manufacturers' },
      { '@type': 'ListItem', 'position': 3, 'name': manufacturer.name },
    ],
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Header */}
      <div className="bg-[#1a1a1a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/manufacturers" className="hover:text-white transition-colors">Manufacturers</Link>
            <ChevronRight size={14} />
            <span className="text-white">{manufacturer.name}</span>
          </nav>

          <h1 className="text-3xl lg:text-4xl font-bold mb-3">
            {manufacturer.name} <span className="text-[#dc2626]">Manuals</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-3xl">
            {manufacturer.count.toLocaleString()} free manuals — instruction books, wiring diagrams, renewal parts catalogs, and technical documentation.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* About + Category Breakdown */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Description */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                About {manufacturer.name} Equipment
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen size={18} />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <Link
                    key={cat.category}
                    href={`/search?category=${encodeURIComponent(cat.category)}&manufacturer=${encodeURIComponent(manufacturer.name)}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <span className="flex items-center gap-2 text-sm text-slate-700 group-hover:text-[#1a1a1a]">
                      <Tag size={14} className="text-slate-400" />
                      {cat.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {cat.count.toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-[#dc2626]">{manufacturer.count.toLocaleString()} manuals</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Manuals */}
        {featuredManuals.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Popular {manufacturer.name} Manuals
              </h2>
              <Link
                href={`/search?manufacturer=${encodeURIComponent(manufacturer.name)}`}
                className="text-sm text-[#dc2626] hover:text-[#b91c1c] font-medium flex items-center gap-1 transition-colors"
              >
                View all {manufacturer.count.toLocaleString()}
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredManuals.map(manual => (
                <ManualCard key={manual.id} manual={manual} />
              ))}
            </div>
          </section>
        )}

        {/* Browse by Category */}
        {categories.length > 1 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Browse {manufacturer.name} by Category
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map(cat => (
                <Link
                  key={cat.category}
                  href={`/search?category=${encodeURIComponent(cat.category)}&manufacturer=${encodeURIComponent(manufacturer.name)}`}
                  className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-[#1a1a1a]/30 hover:shadow-lg transition-all"
                >
                  <h3 className="font-bold text-slate-900 group-hover:text-[#dc2626] transition-colors mb-1">
                    {cat.category}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {cat.count.toLocaleString()} manual{cat.count !== 1 ? 's' : ''}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="bg-[#1a1a1a] rounded-2xl p-8 lg:p-10 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Need a {manufacturer.name} Part or Manual?</h3>
          <p className="text-slate-300 mb-6 max-w-xl mx-auto">
            Voyten Electric stocks thousands of {manufacturer.name} parts — circuit breakers, trip units, motor controls, and more. Call us for availability and pricing.
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
              href="/contact?type=quote"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium border border-white/20 transition-colors"
            >
              Request a Quote
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
