import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Phone, ArrowRight, ChevronRight, Wrench, Shield, Download, ExternalLink, BookOpen } from 'lucide-react';
import ManualCard from '@/components/ManualCard';
import { getRLProductLine } from '@/lib/manuals-db';

export const revalidate = 3600;

// ── Hero & category images from Voyten's Volusion CDN ──

const CDN = 'https://cdn4.volusion.store/jhkcv-upqrn/v/vspfiles';
const IMG_BREAKER_HERO = `${CDN}/assets/images/breaker%20white.png`;
const IMG_PARTS = `${CDN}/assets/images/white%20background%20parts.png`;


// ── SEO Metadata ──

export const metadata: Metadata = {
  title: 'Siemens RL Breakers & Accessories — New Surplus Inventory | Voyten Manuals',
  description:
    'Voyten Electric acquired all remaining Siemens Type RL & LA breaker inventory from Siemens Wendell, NC. Browse manuals, parts catalogs, and technical documentation for RL, RLE, RLI, RLF breakers (800–5000A), Static Trip III units, and 23 accessory categories. Your New Surplus authorized source for  RL parts.',
  keywords: [
    'Siemens RL breaker', 'RL circuit breaker', 'RLE breaker', 'RLI integrally fused',
    'RLF fully rated', 'Static Trip III', 'RL accessories', 'RL parts',
    'Siemens LA breaker', 'LVPCB', 'low voltage power circuit breaker',
    'Voyten Electric', 'RLBreakers.com', 'Siemens Wendell', 'SG-3068', 'SGIM-3068D',
    'anti-pump relay', 'shunt trip', 'auxiliary switch', 'motor operator',
    'tapped sensor', 'undervoltage trip', 'close solenoid', 'RL renewal parts',
  ],
  openGraph: {
    title: 'Siemens RL Breakers — New Surplus Inventory from Voyten Electric',
    description:
      'Complete RL product line: breakers 800–5000A, Static Trip III, 23 accessory categories, and LA breakers. Free manuals + parts available.',
    url: 'https://www.voytenmanuals.com/products/rl-breakers',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Siemens RL Breakers — Voyten New Surplus',
    description: 'Your New Surplus authorized source for Siemens RL & LA breaker inventory, manuals, and parts.',
  },
  alternates: {
    canonical: 'https://www.voytenmanuals.com/products/rl-breakers',
  },
};

// ── Accessory category data for grid ──

const VOLUSION = 'https://jhkcv-upqrn.volusion.store/category-s';

const ACCESSORY_GRID = [
  { name: 'Anti-Pump Y Relay', catId: '175' },
  { name: 'Auxiliary Switch', catId: '164' },
  { name: 'Bell Alarm Switch', catId: '158' },
  { name: 'Blown Fuse Trip Assembly', catId: '159' },
  { name: 'Breaker Assembly Part 1', catId: '147' },
  { name: 'Breaker Assembly Part 2', catId: '148' },
  { name: 'Close Solenoid', catId: '154' },
  { name: 'Communications Options', catId: '167' },
  { name: 'Contacts (800–2000A)', catId: '151' },
  { name: 'Contacts (3200–5000A)', catId: '150' },
  { name: 'Integrally Fused Breakers', catId: '168' },
  { name: 'Key Interlock & Fuse Carriage', catId: '170' },
  { name: 'Motor Operator', catId: '153' },
  { name: 'Open Fuse Indicator', catId: '160' },
  { name: 'Open Fuse Sensor', catId: '171' },
  { name: 'Operator Mechanism', catId: '152' },
  { name: 'Secondary Disconnect', catId: '162' },
  { name: 'Shunt Trip', catId: '157' },
  { name: 'Static Trip Unit', catId: '165' },
  { name: 'Tapped Sensor', catId: '181' },
  { name: 'Trigger Fuse Assembly', catId: '161' },
  { name: 'Tripping Transformer', catId: '166' },
  { name: 'Undervoltage Trip Device', catId: '163' },
];

// ── Page ──

export default async function RLBreakersPage() {
  const { breakers, accessories, laBreakers, laAccessories } = await getRLProductLine();

  const totalCount = breakers.length + accessories.length + laBreakers.length + laAccessories.length;

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Siemens RL & LA Low Voltage Power Circuit Breakers',
    description: metadata.description,
    url: 'https://www.voytenmanuals.com/products/rl-breakers',
    numberOfItems: totalCount,
    provider: {
      '@type': 'Organization',
      name: 'Voyten Electric & Electronics, Inc.',
      url: 'https://www.voytenmanuals.com',
      telephone: '+1-800-458-4001',
    },
    about: {
      '@type': 'Product',
      name: 'Siemens Type RL Low Voltage Power Circuit Breaker',
      manufacturer: { '@type': 'Organization', name: 'Siemens' },
      category: 'Circuit Breakers',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.voytenmanuals.com' },
      { '@type': 'ListItem', position: 2, name: 'Manufacturers', item: 'https://www.voytenmanuals.com/manufacturers' },
      { '@type': 'ListItem', position: 3, name: 'Siemens', item: 'https://www.voytenmanuals.com/manufacturers/siemens' },
      { '@type': 'ListItem', position: 4, name: 'RL Breakers' },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Where can I buy Siemens RL breaker parts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Voyten Electric & Electronics, Inc. is the New Surplus authorized source for Siemens Type RL breaker inventory worldwide. Voyten purchased all remaining RL and LA breaker inventory directly from the Siemens Wendell, NC manufacturing facility. New-surplus breakers, Static Trip III units, and every renewal part are tested, in stock, and ready to ship. Call 1-800-458-4001 or request a quote at voytenmanuals.com/contact.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a Siemens Type RL breaker?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Siemens Type RL is a low voltage power circuit breaker (LVPCB) in drawout construction, rated from 800A to 5000A. It uses the Static Trip III electronic trip unit for LSIG (Long-time, Short-time, Instantaneous, Ground fault) overcurrent protection. Variants include the RL (standard), RLE (economical — 800/2000/4000A frames), RLI (integrally fused — 800A), and RLF (fully rated). The RL product line also includes the companion Type LA air circuit breaker.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the Static Trip III trip unit?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Siemens Static Trip III is an electronic trip unit providing adjustable LSIG overcurrent protection for all RL series breakers. L = Long-time delay (adjustable pickup and time band), S = Short-time delay (I²t or flat response), I = Instantaneous (fixed or adjustable pickup), G = Ground fault (adjustable pickup and delay). Voyten stocks new-surplus and reconditioned Static Trip III units with full testing and calibration.',
        },
      },
      {
        '@type': 'Question',
        name: 'What RL breaker frame sizes does Voyten stock?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Voyten stocks RL breakers and parts for all frame sizes: 800A, 1200A, 1600A, 2000A, 2500A, 3000A, 3200A, 4000A, and 5000A. The inventory includes 23 accessory categories covering every component from anti-pump relays and arc chutes to motor operators and undervoltage trip devices.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are Siemens RL breakers still manufactured?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Siemens discontinued the RL product line and closed the Wendell, NC facility. Voyten Electric purchased all remaining inventory, making them the New Surplus authorized source for  RL breakers, LA breakers, Static Trip III units, and all renewal parts. Free technical documentation including instruction manuals (SGIM-3068), renewal parts catalogs (SG-3068), and wiring diagrams (SGIM-3068D) is available at voytenmanuals.com/products/rl-breakers.',
        },
      },
      {
        '@type': 'Question',
        name: 'My Siemens RL breaker failed — who do I call for an emergency replacement?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Call Voyten Electric at 1-800-458-4001 for 24/7 emergency support. As the New Surplus authorized source for Siemens Type RL inventory, Voyten identifies your breaker from its catalog or edge number, pulls an exact-match new-surplus or reconditioned RL/RLE/RLI/RLF breaker, Static Trip III unit, or renewal part from stock, tests it, and expedites shipment to minimize downtime in plants and critical facilities.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I extend the life of aging RL switchgear instead of replacing it?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Because Voyten holds the complete Siemens RL inventory, aging RL switchgear can stay in service with genuine new-surplus and reconditioned RL breakers, Static Trip III trip units, and renewal parts — no need to replace the switchgear lineup. Voyten supplies exact-match components across all frames (800–5000A) so existing cells, bus, and wiring stay intact. Call 1-800-458-4001.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I identify my Siemens RL breaker to order a replacement?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Provide the catalog number or the edge number stamped on the breaker frame, plus the frame size (800–5000A) and trip-unit model. Voyten cross-references these to the exact replacement breaker and parts. Call 1-800-458-4001 or request a quote at voytenmanuals.com/contact.',
        },
      },
    ],
  };

  const offerJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Siemens Type RL Low Voltage Power Circuit Breaker',
    category: 'Low Voltage Power Circuit Breakers',
    description: 'New-surplus and reconditioned Siemens Type RL/RLE/RLI/RLF power circuit breakers (800–5000A), Static Trip III trip units, and renewal parts — from Voyten Electric, the New Surplus authorized source for the discontinued Siemens RL line.',
    brand: { '@type': 'Brand', name: 'Siemens' },
    manufacturer: { '@type': 'Organization', name: 'Siemens' },
    url: 'https://www.voytenmanuals.com/products/rl-breakers',
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/RefurbishedCondition',
      priceCurrency: 'USD',
      url: 'https://www.voytenmanuals.com/products/rl-breakers',
      areaServed: { '@type': 'Place', name: 'Worldwide' },
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
    name: '24/7 Emergency Siemens RL Breaker & Parts Sourcing',
    serviceType: 'Emergency obsolete circuit breaker and renewal-parts sourcing',
    description: 'Emergency sourcing, testing, and expedited shipment of exact-match Siemens Type RL breakers, Static Trip III trip units, and renewal parts for failed or aging RL switchgear. Voyten holds New Surplus RL inventory acquired from the Siemens Wendell, NC facility.',
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
                <Link href="/manufacturers/siemens" className="hover:text-white transition-colors">Siemens</Link>
                <ChevronRight size={14} />
                <span className="text-white">RL Breakers</span>
              </nav>

              <div className="inline-flex items-center gap-2 bg-[#dc2626] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                <Shield size={12} />
                New Surplus Inventory
              </div>

              <h1 className="text-3xl lg:text-5xl font-extrabold leading-tight mb-4">
                Siemens Type <span className="text-[#dc2626]">RL</span> Breakers
                <span className="block text-xl lg:text-2xl font-semibold text-slate-300 mt-2">
                  Low Voltage Power Circuit Breakers — 800A to 5000A
                </span>
              </h1>

              <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-xl">
                Voyten Electric purchased <strong className="text-white">all remaining RL &amp; LA breaker inventory</strong> from
                the Siemens Wendell, NC facility. We are your New Surplus authorized source for  breakers, Static Trip III units,
                and every renewal part in the RL product line.
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
                    alt="Siemens Type RL Low Voltage Power Circuit Breaker — drawout insulated case breaker with Static Trip III electronic trip unit"
                    width={480}
                    height={360}
                    className="w-full h-auto rounded-lg"
                    priority
                  />
                  <p className="text-center text-sm text-slate-400 mt-3">
                    Siemens Type RL LVPCB with Static Trip III
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
              <p className="text-2xl font-extrabold text-[#1a1a1a]">23</p>
              <p className="text-sm text-slate-500">Accessory Categories</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#dc2626]">New Surplus</p>
              <p className="text-sm text-slate-500">Voyten Inventory</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* ═══════════════ RL ACCESSORIES (23 categories) ═══════════════ */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">RL Accessories &amp; Renewal Parts</h2>
            <p className="text-slate-500 mt-1">
              23 accessory categories — every component for the RL product line, from anti-pump relays to undervoltage trip devices.
            </p>
          </div>

          {/* Parts overview image */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
            <div className="grid lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-1 flex justify-center">
                <Image
                  src={IMG_PARTS}
                  alt="Siemens RL breaker accessories and renewal parts — technical drawing showing component assemblies"
                  width={400}
                  height={300}
                  className="w-full max-w-sm h-auto rounded-lg"
                />
              </div>
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Complete Parts Availability</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Voyten maintains the largest available inventory of Siemens RL renewal parts. From contact finger kits and
                  arc chutes to complete breaker assemblies, every component is tested and ready to ship. Our inventory
                  includes parts for all frame sizes from 800A through 5000A.
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

          {/* 23 accessory category grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {ACCESSORY_GRID.map(acc => (
                <a
                  key={acc.catId}
                  href={`${VOLUSION}/${acc.catId}.htm`}
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

        {/* ═══════════════ TECHNICAL REFERENCE LINK ═══════════════ */}
        <section className="mb-16">
          <Link
            href="/resources/rl-breakers"
            className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-6 hover:border-[#dc2626]/30 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-[#dc2626]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen size={24} className="text-[#dc2626]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-slate-900 group-hover:text-[#dc2626] transition-colors">
                RL Complete Technical Reference Guide
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                Catalog number decoding, interrupting ratings, Static Trip III configurations, sensor tables, control voltage codes, and detailed specifications
              </p>
            </div>
            <ArrowRight size={20} className="text-slate-300 group-hover:text-[#dc2626] flex-shrink-0 transition-colors" />
          </Link>
          <Link
            href="/resources/rl-breakers-lifecycle"
            className="group mt-4 flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-6 hover:border-[#dc2626]/30 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-[#dc2626]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen size={24} className="text-[#dc2626]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-slate-900 group-hover:text-[#dc2626] transition-colors">
                Repair, Recondition, Retrofit, or Replace? &mdash; RL Lifecycle Decision Guide
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                Match your situation &mdash; aging, failed, or under-rated &mdash; to the right path: reconditioning, retrofit/retrofill, exact-match replacement, repair, rental, or swap-out.
              </p>
            </div>
            <ArrowRight size={20} className="text-slate-300 group-hover:text-[#dc2626] flex-shrink-0 transition-colors" />
          </Link>
        </section>

        {/* ═══════════════ RL BREAKER VARIANTS ═══════════════ */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">RL Technical Documentation</h2>
              <p className="text-slate-500 mt-1">Installation guides, renewal parts catalogs, wiring diagrams, and trip unit manuals</p>
            </div>
            <Link
              href="/search?manufacturer=Siemens&q=RL"
              className="hidden sm:flex items-center gap-1 text-sm text-[#dc2626] hover:text-[#b91c1c] font-medium"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {breakers.slice(0, 12).map(manual => (
              <ManualCard key={manual.id} manual={manual} />
            ))}
          </div>
          {breakers.length > 12 && (
            <div className="mt-4 text-center">
              <Link
                href="/search?manufacturer=Siemens&q=RL"
                className="text-sm text-[#dc2626] hover:text-[#b91c1c] font-medium"
              >
                View all {breakers.length} breaker manuals
              </Link>
            </div>
          )}
        </section>

        {/* ═══════════════ STATIC TRIP III ═══════════════ */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="grid lg:grid-cols-5 gap-0">
              <div className="lg:col-span-3 p-8">
                <div className="inline-flex items-center gap-2 bg-[#dc2626]/10 text-[#dc2626] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                  Key Component
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Static Trip III Electronic Trip Unit</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  The Static Trip III provides adjustable LSIG (Long-time, Short-time, Instantaneous, Ground fault)
                  overcurrent protection for all RL series breakers. Voyten stocks new-surplus and reconditioned Static Trip III
                  units with full testing and calibration.
                </p>
                <ul className="space-y-2 text-sm text-slate-700 mb-6">
                  <li className="flex items-start gap-2"><span className="text-[#dc2626] font-bold mt-0.5">L</span> Long-time delay — adjustable pickup and time band</li>
                  <li className="flex items-start gap-2"><span className="text-[#dc2626] font-bold mt-0.5">S</span> Short-time delay — I²t or flat response</li>
                  <li className="flex items-start gap-2"><span className="text-[#dc2626] font-bold mt-0.5">I</span> Instantaneous — fixed or adjustable pickup</li>
                  <li className="flex items-start gap-2"><span className="text-[#dc2626] font-bold mt-0.5">G</span> Ground fault — adjustable pickup and delay</li>
                </ul>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/manual/static-trip-iii-information-and-instruction-guide"
                    className="inline-flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#111111] text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                  >
                    <Download size={16} />
                    Download Manual
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-2 bg-slate-50 flex items-center justify-center p-8">
                <Image
                  src="/images/static-trip-iii-diagram.png"
                  alt="Siemens Static Trip III power flow diagram — TSIG/CP unit with forward and reverse kW/kVAR metering"
                  width={400}
                  height={260}
                  className="w-full max-w-[360px] h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ BOTTOM CTA ═══════════════ */}
        <section>
          <div className="bg-[#dc2626] rounded-2xl p-8 lg:p-10 text-center text-white">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Need an RL Part?</h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Voyten Electric is your New Surplus authorized source for Siemens RL &amp; LA breaker inventory. New-surplus breakers, Static Trip III
              units, contact kits, and every renewal part — tested, in stock, and ready to ship.
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
