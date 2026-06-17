import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Phone, ArrowRight, ChevronRight, Wrench, Shield, ExternalLink, BookOpen, Zap } from 'lucide-react';
import ManualCard from '@/components/ManualCard';
import { getSPBProductLine } from '@/lib/manuals-db';

export const revalidate = 3600;

// ── Hero & component images from Voyten's SPB Volusion store (custom domain) ──

const IMG_BASE = 'https://www.spbbreakers.com/v/vspfiles/assets/images';
const IMG_BREAKER_HERO = `${IMG_BASE}/Transparent%20SPB%20100%20Side.gif`;
const IMG_PARTS = `${IMG_BASE}/Charging%20Hub%20Assembly.gif`;

const SPB_STORE = 'https://www.spbbreakers.com/category-s';

// ── SEO Metadata ──

export const metadata: Metadata = {
  title: 'Eaton Type SPB Breakers & Parts — New Surplus Inventory | Voyten Manuals',
  description:
    'Voyten Electric is your New Surplus authorized source for Eaton, Cutler-Hammer & Westinghouse Type SPB (Systems Pow-R) breakers. Complete breakers new and reconditioned, rating plugs, operators, and renewal parts — 800–5000A, 50–150 kA. Backed by 1 year warranty and stocked for immediate shipment.',
  keywords: [
    'Eaton SPB breaker', 'Systems Pow-R Breaker', 'SPB circuit breaker', 'SPBR', 'SPBSR', 'SPBHR',
    'Cutler-Hammer SPB', 'Westinghouse SPB', 'insulated case circuit breaker', 'Pow-R Trip 7', 'Digitrip RMS',
    'SPB rating plug', 'SPB renewal parts', 'SPB trip unit', 'SPBN', 'SPBNH', 'non-automatic switch',
    'Voyten Electric', 'SPBBreakers.com', 'reconditioned breaker', 'new surplus breaker',
    'shunt trip', 'auxiliary switch', 'undervoltage release', 'drawout stabs',
  ],
  openGraph: {
    title: 'Eaton Type SPB Breakers — New Surplus Inventory from Voyten Electric',
    description:
      'New Surplus authorized SPB source: breakers 800–5000A (50–150 kA), Pow-R Trip 7 trip units, rating plugs, and 12 accessory categories. Free manuals + parts available.',
    url: 'https://www.voytenmanuals.com/products/spb-breakers',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eaton Type SPB Breakers — Voyten New Surplus',
    description: 'Your New Surplus authorized source for Eaton/Cutler-Hammer SPB Systems Pow-R breakers, manuals, and parts.',
  },
  alternates: {
    canonical: 'https://www.voytenmanuals.com/products/spb-breakers',
  },
};

// ── SPB breaker models / interrupting tiers (links to SPB store categories) ──

const SPB_MODELS = [
  { name: 'Identify Your SPB Breaker', catId: '261', note: 'Selection & ID helper' },
  { name: 'SPB-100 · SPBR', catId: '265', note: '100 kA interrupting' },
  { name: 'SPB-150 · SPBHR', catId: '266', note: '150 kA interrupting' },
  { name: 'SPB-65 · SPBSR', catId: '273', note: '65 kA interrupting' },
  { name: 'SPB-50 · SPBSR', catId: '272', note: '50 kA interrupting' },
  { name: 'Non-Automatic Switch · SPBN', catId: '269', note: 'Switching duty, no trip' },
  { name: 'Non-Automatic Switch · SPBNH', catId: '270', note: 'High-withstand switch' },
];

// ── SPB accessory categories (12) ──

const ACCESSORY_GRID = [
  { name: 'Trip Units & Rating Plugs', catId: '126' },
  { name: 'Electrical Attachments', catId: '129' },
  { name: 'Auxiliary Switches', catId: '158' },
  { name: 'Electrical Operator Kits', catId: '167' },
  { name: 'Gear / Motors', catId: '169' },
  { name: 'Handles / Hub', catId: '148' },
  { name: 'Key Interlock Provisions', catId: '170' },
  { name: 'Shunt Trip Kits', catId: '191' },
  { name: 'Spring Release Kits', catId: '202' },
  { name: 'Terminals / Drawout Stabs', catId: '219' },
  { name: 'Undervoltage Release', catId: '221' },
  { name: 'Breaker Cover', catId: '187' },
];

// ── Page ──

export default async function SPBBreakersPage() {
  const { breakers, docs } = await getSPBProductLine();
  const allDocs = [...breakers, ...docs];
  const totalCount = allDocs.length;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Eaton Type SPB Systems Pow-R Low Voltage Insulated Case Circuit Breakers',
    description: metadata.description,
    url: 'https://www.voytenmanuals.com/products/spb-breakers',
    numberOfItems: totalCount,
    provider: {
      '@type': 'Organization',
      name: 'Voyten Electric & Electronics, Inc.',
      url: 'https://www.voytenmanuals.com',
      telephone: '+1-800-458-4001',
    },
    about: {
      '@type': 'Product',
      name: 'Eaton Type SPB Systems Pow-R Breaker',
      manufacturer: { '@type': 'Organization', name: 'Eaton' },
      category: 'Circuit Breakers',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.voytenmanuals.com' },
      { '@type': 'ListItem', position: 2, name: 'Manufacturers', item: 'https://www.voytenmanuals.com/manufacturers' },
      { '@type': 'ListItem', position: 3, name: 'Eaton', item: 'https://www.voytenmanuals.com/manufacturers/eaton' },
      { '@type': 'ListItem', position: 4, name: 'SPB Breakers' },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Where can I buy Eaton SPB breaker parts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Voyten Electric & Electronics, Inc. is the New Surplus authorized aftermarket source for Eaton/Cutler-Hammer/Westinghouse Type SPB (Systems Pow-R) breaker parts. They stock complete breakers (new and reconditioned), rating plugs, trip units, operators, and every renewal part across all frame sizes from 800A to 5000A. All reconditioned breakers carry a 1-year warranty. Call 1-800-458-4001 or visit spbbreakers.com.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is an Eaton Type SPB breaker?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Eaton Type SPB (Systems Pow-R Breaker) is a low voltage insulated case circuit breaker (ICCB) in drawout construction, manufactured since 1976. It is one of the most widely deployed ICCBs in North American industrial and utility applications. The SPB family includes the SPB-50 (50 kA), SPB-65 (65 kA), SPB-100 (100 kA), and SPB-150 (150 kA) models, plus SPBN and SPBNH non-automatic switches. Frame ratings range from 800A to 5000A. The breaker has been manufactured under the Westinghouse, Cutler-Hammer, and Eaton brand names — all the same product lineage.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can an SPB-100 replace an SPB-50 or SPB-65?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The SPB-50, SPB-65, and SPB-100 are electrically and mechanically identical except for their interrupting rating. The 100 kA capability is achieved through different arc chutes, moving contacts, and stationary contacts — internal modifications that have no effect on breaker dimensions. An SPB-100 slides directly into an existing SPB-50 or SPB-65 cubicle with no structural modifications, providing a clean upgrade path for facilities whose available fault current has grown past the original 50 or 65 kA rating.',
        },
      },
      {
        '@type': 'Question',
        name: 'What trip units work with SPB breakers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'SPB breakers use the Pow-R Trip 7 (current production) and Digitrip RMS series trip units. The Digitrip RMS family includes the 210, 310, 510, 610, 810, and 910 models with progressively advanced protection and metering capabilities. Voyten stocks new and reconditioned trip units with rating plugs for all SPB frame sizes. Free technical documentation for all trip unit models is available at voytenmanuals.com/products/spb-breakers.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Voyten offer a warranty on reconditioned SPB breakers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. All reconditioned SPB breakers from Voyten Electric carry a 1-year warranty. Reconditioned breakers are completely disassembled, cleaned, inspected, and rebuilt to meet or exceed original manufacturer specifications, then fully tested before shipment. Voyten also stocks new SPB breakers and all renewal parts for immediate shipment.',
        },
      },
      {
        '@type': 'Question',
        name: 'My SPB breaker failed — who do I call for an emergency replacement?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Call Voyten Electric at 1-800-458-4001 for 24/7 emergency support. As the New Surplus authorized SPB source, Voyten identifies your breaker from its nameplate catalog number or 30-digit edge number, pulls an exact-match new or reconditioned SPB breaker, Digitrip RMS trip unit, rating plug, or renewal part from stock, tests it, and expedites shipment to minimize downtime.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I upgrade an aging SPB-50 or SPB-65 without replacing the switchgear?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The SPB-50, SPB-65, and SPB-100 share identical external dimensions, so an SPB-100 drops directly into an existing SPB-50 or SPB-65 cubicle with no structural, bus, or control-wiring changes — a clean 100 kA upgrade when the available fault current at a site has grown past the original rating. Voyten supplies the drop-in SPB-100 and all renewal parts. Call 1-800-458-4001.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I identify my SPB breaker to order a replacement?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Provide the nameplate catalog number, the 30-digit edge number stamped on the breaker frame, and the trip-unit model. Voyten cross-references these to the exact replacement breaker and parts across all frames (800–5000A). Call 1-800-458-4001 or request a quote at voytenmanuals.com/contact.',
        },
      },
    ],
  };

  const offerJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Eaton Type SPB (Systems Pow-R) Insulated Case Circuit Breaker',
    category: 'Insulated Case Circuit Breakers',
    description: 'New and reconditioned Eaton/Cutler-Hammer/Westinghouse Type SPB breakers (800–5000A, 50–150 kA), Digitrip RMS trip units, rating plugs, and renewal parts — from Voyten Electric, the New Surplus authorized SPB source. 1-year warranty on reconditioned units.',
    brand: { '@type': 'Brand', name: 'Eaton' },
    manufacturer: { '@type': 'Organization', name: 'Eaton' },
    url: 'https://www.voytenmanuals.com/products/spb-breakers',
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/RefurbishedCondition',
      priceCurrency: 'USD',
      url: 'https://www.voytenmanuals.com/products/spb-breakers',
      areaServed: { '@type': 'Place', name: 'Worldwide' },
      warranty: { '@type': 'WarrantyPromise', durationOfWarranty: { '@type': 'QuantitativeValue', value: 1, unitCode: 'ANN' } },
      seller: {
        '@type': 'Organization',
        name: 'Voyten Electric & Electronics, Inc.',
        url: 'https://www.voytenmanuals.com',
        telephone: '+1-800-458-4001',
      },
    },
  };

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '24/7 Emergency Eaton SPB Breaker & Parts Sourcing',
    serviceType: 'Emergency insulated-case circuit breaker and renewal-parts sourcing',
    description: 'Emergency sourcing, testing, and expedited shipment of exact-match Eaton/Cutler-Hammer/Westinghouse Type SPB breakers, Digitrip RMS trip units, rating plugs, and renewal parts for failed or aging SPB switchgear — including the drop-in SPB-100 upgrade for under-rated SPB-50/65 cubicles. Voyten is the New Surplus authorized SPB source.',
    areaServed: { '@type': 'Place', name: 'Worldwide' },
    provider: {
      '@type': 'Organization',
      name: 'Voyten Electric & Electronics, Inc.',
      url: 'https://www.voytenmanuals.com',
      telephone: '+1-800-458-4001',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'emergency',
        telephone: '+1-800-458-4001',
        availableLanguage: 'English',
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00',
          closes: '23:59',
        },
      },
    },
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="bg-[#1a1a1a] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#111111] via-[#1a1a1a] to-[#991b1b]/20" />
        <div className="max-w-7xl mx-auto px-4 py-14 lg:py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <ChevronRight size={14} />
                <Link href="/manufacturers/eaton" className="hover:text-white transition-colors">Eaton</Link>
                <ChevronRight size={14} />
                <span className="text-white">SPB Breakers</span>
              </nav>

              <div className="inline-flex items-center gap-2 bg-[#dc2626] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                <Shield size={12} />
                New Surplus Inventory
              </div>

              <h1 className="text-3xl lg:text-5xl font-extrabold leading-tight mb-4">
                Eaton Type <span className="text-[#dc2626]">SPB</span> Breakers
                <span className="block text-xl lg:text-2xl font-semibold text-slate-300 mt-2">
                  Systems Pow-R Breakers — 800A to 5000A
                </span>
              </h1>

              <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-xl">
                Voyten Electric is your <strong className="text-white">New Surplus authorized source</strong> for
                Cutler-Hammer/Eaton Type SPB breakers. Complete breakers — new and
                reconditioned — plus rating plugs, operators, and every renewal part, backed by 1 year warranty
                and stocked for immediate shipment.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="tel:1-800-458-4001"
                  className="flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-6 py-3.5 rounded-lg font-bold transition-colors"
                >
                  <Phone size={18} />
                  1-800-458-4001
                </a>
                <Link
                  href="/contact?type=quote"
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-lg font-medium border border-white/20 transition-colors"
                >
                  <BookOpen size={16} />
                  Request a Quote
                </Link>
              </div>
            </div>

            {/* Hero image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                  <Image
                    src={IMG_BREAKER_HERO}
                    alt="Eaton Type SPB Systems Pow-R low voltage insulated case circuit breaker — drawout construction with Pow-R Trip 7 trip unit"
                    width={480}
                    height={360}
                    className="w-full h-auto rounded-lg"
                    unoptimized
                    priority
                  />
                  <p className="text-center text-sm text-slate-400 mt-3">
                    Eaton Type SPB-100 Systems Pow-R Breaker
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS BAR ═══════════════ */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-extrabold text-[#1a1a1a]">{totalCount}+</p>
              <p className="text-sm text-slate-500">Technical Documents</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#1a1a1a]">800–5000A</p>
              <p className="text-sm text-slate-500">Frame Range</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#1a1a1a]">50–150 kA</p>
              <p className="text-sm text-slate-500">Interrupting Ratings</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#dc2626]">New Surplus</p>
              <p className="text-sm text-slate-500">Voyten Inventory</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* ═══════════════ SPB ACCESSORIES (12 categories) — FIRST ═══════════════ */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">SPB Accessories &amp; Renewal Parts</h2>
            <p className="text-slate-500 mt-1">
              12 accessory categories — trip units &amp; rating plugs, operators, shunt trips, auxiliary switches, and every
              renewal part for the SPB product line.
            </p>
          </div>

          {/* Parts overview image */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
            <div className="grid lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-1 flex justify-center">
                <Image
                  src={IMG_PARTS}
                  alt="Eaton SPB Systems Pow-R breaker charging hub assembly — renewal part technical drawing"
                  width={400}
                  height={300}
                  className="w-full max-w-sm h-auto rounded-lg"
                  unoptimized
                />
              </div>
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Complete Parts Availability</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Voyten stocks high-demand SPB components for immediate shipment — from rating plugs, Pow-R Trip 7 trip
                  units, and electrical operators to spring release kits, drawout stabs, and complete breaker covers.
                  New parts and reconditioned breakers are backed by 1 year warranty.
                </p>
                <div className="flex gap-3">
                  <a
                    href="tel:1-800-458-4001"
                    className="inline-flex items-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
                  >
                    <Phone size={16} />
                    Call for Parts
                  </a>
                  <Link
                    href="/contact?type=quote"
                    className="inline-flex items-center gap-2 border border-slate-300 hover:border-slate-400 text-slate-700 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
                  >
                    Request Quote
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 12 accessory category grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {ACCESSORY_GRID.map(acc => (
              <a
                key={acc.catId}
                href={`${SPB_STORE}/${acc.catId}.htm`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 hover:border-[#dc2626]/30 hover:shadow-md transition-all"
              >
                <div className="w-9 h-9 bg-slate-100 group-hover:bg-[#dc2626]/10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                  <Wrench size={16} className="text-slate-500 group-hover:text-[#dc2626] transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-[#dc2626] transition-colors truncate">
                    {acc.name}
                  </p>
                  <p className="text-xs text-slate-400">View Parts &amp; Inventory</p>
                </div>
                <ExternalLink size={14} className="text-slate-300 group-hover:text-[#dc2626] flex-shrink-0 ml-auto transition-colors" />
              </a>
            ))}
          </div>
        </section>

        {/* ═══════════════ SPB-50/65 → SPB-100 UPGRADE PATH ═══════════════ */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">SPB-50 / SPB-65 &rarr; SPB-100 Upgrade Path</h2>
            <p className="text-slate-500 mt-1">
              How to step up from 50 or 65 kA to 100 kA without modifying the existing cubicle.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="grid lg:grid-cols-[auto_1fr] gap-6 p-6 lg:p-8">
              <div className="flex lg:flex-col items-center gap-4 lg:gap-3 lg:pr-6 lg:border-r lg:border-slate-200">
                <div className="w-14 h-14 bg-[#dc2626]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap size={28} className="text-[#dc2626]" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Drop-in</p>
                  <p className="text-2xl font-extrabold text-slate-900">100 kA</p>
                  <p className="text-xs text-slate-500">No structural mods</p>
                </div>
              </div>
              <div>
                <p className="text-slate-700 leading-relaxed mb-3">
                  The SPB-50, SPB-65, and SPB-100 are{' '}
                  <strong className="text-slate-900">electrically and mechanically identical</strong> except for the interrupting
                  rating. The 100 kA capability is achieved through different arc chutes, moving contacts, and stationary contacts &mdash;
                  internal modifications that have{' '}
                  <strong className="text-slate-900">no effect on breaker dimensions or electrical performance</strong>.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Because the SPB-100 and SPB-65 share identical dimensions, an SPB-100 will slide directly into an existing SPB-50 or
                  SPB-65 cubicle with no modifications to the surrounding structure &mdash; a clean upgrade path for facilities whose
                  available fault current has grown past their original 50 or 65 kA rating.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ TECHNICAL REFERENCE LINK ═══════════════ */}
        <section className="mb-16">
          <Link
            href="/resources/spb-breakers"
            className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-6 hover:border-[#dc2626]/30 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-[#dc2626]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen size={24} className="text-[#dc2626]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-slate-900 group-hover:text-[#dc2626] transition-colors">
                SPB Complete Technical Reference Guide
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                Catalog number decoding, edge number structure, trip unit compatibility matrix, brand cross-reference, and detailed specifications
              </p>
            </div>
            <ArrowRight size={20} className="text-slate-300 group-hover:text-[#dc2626] flex-shrink-0 transition-colors" />
          </Link>
          <Link
            href="/resources/spb-breakers-lifecycle"
            className="group mt-4 flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-6 hover:border-[#dc2626]/30 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-[#dc2626]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen size={24} className="text-[#dc2626]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-slate-900 group-hover:text-[#dc2626] transition-colors">
                Repair, Recondition, Upgrade, or Replace? &mdash; SPB Lifecycle Decision Guide
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                Match your situation &mdash; aging, failed, or under-rated &mdash; to the right path: reconditioning, the drop-in SPB-100 upgrade, exact-match replacement, repair, rental, or swap-out.
              </p>
            </div>
            <ArrowRight size={20} className="text-slate-300 group-hover:text-[#dc2626] flex-shrink-0 transition-colors" />
          </Link>
        </section>

        {/* ═══════════════ SPB BREAKER MODELS ═══════════════ */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">SPB Breaker Models</h2>
            <p className="text-slate-500 mt-1">
              The Systems Pow-R family spans 50–150 kA interrupting — SPBSR, SPBR, and SPBHR ratings — plus SPBN/SPBNH
              non-automatic switches. Browse current inventory by model.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SPB_MODELS.map(m => (
              <a
                key={m.catId}
                href={`${SPB_STORE}/${m.catId}.htm`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 hover:border-[#dc2626]/30 hover:shadow-md transition-all"
              >
                <div className="w-9 h-9 bg-slate-100 group-hover:bg-[#dc2626]/10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                  <Zap size={16} className="text-slate-500 group-hover:text-[#dc2626] transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-[#dc2626] transition-colors truncate">
                    {m.name}
                  </p>
                  <p className="text-xs text-slate-400">{m.note}</p>
                </div>
                <ExternalLink size={14} className="text-slate-300 group-hover:text-[#dc2626] flex-shrink-0 ml-auto transition-colors" />
              </a>
            ))}
          </div>
        </section>

        {/* ═══════════════ INTERRUPTING / SHORT-TIME RATINGS (Table 1) ═══════════════ */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Interrupting &amp; Short-Time Ratings</h2>
            <p className="text-slate-500 mt-1">
              Table 1 — interrupting capacity (kA RMS symmetrical) by series and system voltage.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-6">
              <Image
                src="/images/spb-table.png"
                alt="Table 1: Interrupting and Short-Time Ratings for Eaton SPB-50, SPB-65, SPB-100, and SPB-150 series Systems Pow-R breakers — frame continuous ampere ratings (250A–3000A), short-time ratings (25–51 kA), max short-time delay (18 cycles), and interrupting capacity in kA RMS symmetrical at 240 V, 480 V, and 600 V system voltages."
                width={2195}
                height={889}
                className="w-full h-auto rounded-lg"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>
          </div>
        </section>

        {/* ═══════════════ SPB TECHNICAL DOCUMENTATION ═══════════════ */}
        {totalCount > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">SPB Technical Documentation</h2>
                <p className="text-slate-500 mt-1">Installation guides, renewal parts catalogs, wiring diagrams, and trip unit manuals</p>
              </div>
              <Link
                href="/search?q=SPB"
                className="hidden sm:flex items-center gap-1 text-sm text-[#dc2626] hover:text-[#b91c1c] font-medium"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDocs.slice(0, 12).map(manual => (
                <ManualCard key={manual.id} manual={manual} />
              ))}
            </div>
            {totalCount > 12 && (
              <div className="mt-4 text-center">
                <Link href="/search?q=SPB" className="text-sm text-[#dc2626] hover:text-[#b91c1c] font-medium">
                  View all {totalCount} SPB manuals
                </Link>
              </div>
            )}
          </section>
        )}

        {/* ═══════════════ BOTTOM CTA ═══════════════ */}
        <section>
          <div className="bg-[#dc2626] rounded-2xl p-8 lg:p-10 text-center text-white">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Need an SPB Part?</h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Voyten Electric is your New Surplus authorized source for the full Eaton/Cutler-Hammer/Westinghouse SPB
              product line — new and reconditioned breakers, Pow-R Trip 7 trip units, rating plugs, and every renewal
              part — tested, in stock, and backed by 1 year warranty.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:1-800-458-4001"
                className="flex items-center justify-center gap-2 bg-white text-[#1a1a1a] px-8 py-3.5 rounded-lg font-bold hover:bg-slate-100 transition-colors"
              >
                <Phone size={18} />
                1-800-458-4001
              </a>
              <Link
                href="/contact?type=quote"
                className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-8 py-3.5 rounded-lg font-medium border border-white/30 transition-colors"
              >
                Request a Quote
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
