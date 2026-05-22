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
  title: 'Eaton Type SPB Breakers & Parts — New & Reconditioned | Voyten Manuals',
  description:
    'Voyten Electric provides aftermarket life-extension support for the Eaton, Cutler-Hammer & Westinghouse Type SPB (Systems Pow-R) breaker installed base. Complete breakers new and Eaton-reconditioned, rating plugs, operators, and renewal parts — 800–5000A, 50–150 kA. Backed by Eaton factory warranty and stocked for immediate shipment.',
  keywords: [
    'Eaton SPB breaker', 'Systems Pow-R Breaker', 'SPB circuit breaker', 'SPBR', 'SPBSR', 'SPBHR',
    'Cutler-Hammer SPB', 'Westinghouse SPB', 'insulated case circuit breaker', 'Pow-R Trip 7', 'Digitrip RMS',
    'SPB rating plug', 'SPB renewal parts', 'SPB trip unit', 'SPBN', 'SPBNH', 'non-automatic switch',
    'Voyten Electric', 'SPBBreakers.com', 'reconditioned breaker', 'new surplus breaker',
    'shunt trip', 'auxiliary switch', 'undervoltage release', 'drawout stabs',
  ],
  openGraph: {
    title: 'Eaton Type SPB Breakers — New & Reconditioned from Voyten Electric',
    description:
      'Complete SPB product line: breakers 800–5000A (50–150 kA), Pow-R Trip 7 trip units, rating plugs, and 12 accessory categories. Free manuals + parts available.',
    url: 'https://voytenmanuals.com/products/spb-breakers',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eaton Type SPB Breakers — Voyten Electric',
    description: 'New & reconditioned Eaton/Cutler-Hammer SPB Systems Pow-R breakers, manuals, and parts.',
  },
  alternates: {
    canonical: 'https://voytenmanuals.com/products/spb-breakers',
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

// ── Interrupting / short-time ratings (Table 1) ──

const SPB_RATINGS = [
  { series: 'SPB-50',  frames: '250A, 800A', shortTime: '25 kA',    delay: '18 cycles', v240: '65',  v480: '50',  v600: '25' },
  { series: 'SPB-65',  frames: '1600A',      shortTime: '35 kA',    delay: '18 cycles', v240: '85',  v480: '65',  v600: '65' },
  { series: 'SPB-100', frames: '250–3000A',  shortTime: '35 kA',    delay: '18 cycles', v240: '100', v480: '100', v600: '85' },
  { series: 'SPB-150', frames: '250–3000A',  shortTime: '25–51 kA', delay: '18 cycles', v240: '200', v480: '150', v600: '100' },
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
    url: 'https://voytenmanuals.com/products/spb-breakers',
    numberOfItems: totalCount,
    provider: {
      '@type': 'Organization',
      name: 'Voyten Electric & Electronics, Inc.',
      url: 'https://voytenmanuals.com',
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
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://voytenmanuals.com' },
      { '@type': 'ListItem', position: 2, name: 'Manufacturers', item: 'https://voytenmanuals.com/manufacturers' },
      { '@type': 'ListItem', position: 3, name: 'Eaton', item: 'https://voytenmanuals.com/manufacturers/eaton' },
      { '@type': 'ListItem', position: 4, name: 'SPB Breakers' },
    ],
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

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
                New &amp; Reconditioned · Eaton Warranty
              </div>

              <h1 className="text-3xl lg:text-5xl font-extrabold leading-tight mb-4">
                Eaton Type <span className="text-[#dc2626]">SPB</span> Breakers
                <span className="block text-xl lg:text-2xl font-semibold text-slate-300 mt-2">
                  Systems Pow-R Breakers — 800A to 5000A
                </span>
              </h1>

              <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-xl">
                Voyten Electric provides aftermarket <strong className="text-white">life-extension support</strong> for the
                installed base of Eaton, Cutler-Hammer &amp; Westinghouse Type SPB breakers. Complete breakers — new and
                Eaton-reconditioned — plus rating plugs, operators, and every renewal part, stocked for immediate shipment
                and backed by Eaton&rsquo;s factory warranty.
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
              <p className="text-2xl font-extrabold text-[#dc2626]">12</p>
              <p className="text-sm text-slate-500">Accessory Categories</p>
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
                  New parts and Eaton-reconditioned breakers are backed by Eaton&rsquo;s factory warranty.
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1a1a1a] text-white text-left">
                    <th className="px-4 py-3 font-semibold">Series</th>
                    <th className="px-4 py-3 font-semibold">Frame Cont. Amps</th>
                    <th className="px-4 py-3 font-semibold">Short-Time Rating</th>
                    <th className="px-4 py-3 font-semibold">Max S-T Delay</th>
                    <th className="px-4 py-3 font-semibold text-center" colSpan={3}>Interrupting kA RMS Sym @ Volts</th>
                  </tr>
                  <tr className="bg-slate-100 text-slate-600 text-xs">
                    <th className="px-4 py-2" colSpan={4}></th>
                    <th className="px-4 py-2 text-center font-semibold">240 V</th>
                    <th className="px-4 py-2 text-center font-semibold">480 V</th>
                    <th className="px-4 py-2 text-center font-semibold">600 V</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {SPB_RATINGS.map(r => (
                    <tr key={r.series} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-[#dc2626] whitespace-nowrap">{r.series}</td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{r.frames}</td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{r.shortTime}</td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{r.delay}</td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-900">{r.v240}</td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-900">{r.v480}</td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-900">{r.v600}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 text-xs text-slate-400 border-t border-slate-100 space-y-1">
              <p>Short-Time Rating (RMS symmetrical amps) @ 600 V, 50/60 Hz system with X/R ratio of 6.6.</p>
              <p>All Systems Pow-R breakers equipped with Pow-R Trip 7 trip devices.</p>
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
              Voyten Electric supports the full Eaton/Cutler-Hammer/Westinghouse SPB installed base — new and reconditioned
              breakers, Pow-R Trip 7 trip units, rating plugs, and every renewal part — tested, in stock, and backed by
              Eaton&rsquo;s factory warranty.
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
