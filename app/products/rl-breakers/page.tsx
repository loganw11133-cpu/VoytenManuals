import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Phone, ArrowRight, ChevronRight, Wrench, Shield, Download, Zap, ExternalLink, BookOpen } from 'lucide-react';
import ManualCard from '@/components/ManualCard';
import { getRLProductLine } from '@/lib/manuals-db';

export const revalidate = 3600;

// ── Hero & category images from Voyten's Volusion CDN ──

const CDN = 'https://cdn4.volusion.store/jhkcv-upqrn/v/vspfiles';
const IMG_BREAKER_HERO = `${CDN}/assets/images/breaker%20white.png`;
const IMG_PARTS = `${CDN}/assets/images/white%20background%20parts.png`;
const IMG_STATIC_TRIP = `${CDN}/photos/18-483-905-546-1.png`;

// ── SEO Metadata ──

export const metadata: Metadata = {
  title: 'Siemens RL Breakers & Accessories — Exclusive Inventory | Voyten Manuals',
  description:
    'Voyten Electric acquired all remaining Siemens Type RL & LA breaker inventory from Siemens Wendell, NC. Browse manuals, parts catalogs, and technical documentation for RL, RLE, RLI, RLF breakers (800–5000A), Static Trip III units, and 22 accessory categories. Your exclusive source for new-surplus RL parts.',
  keywords: [
    'Siemens RL breaker', 'RL circuit breaker', 'RLE breaker', 'RLI integrally fused',
    'RLF fully rated', 'Static Trip III', 'RL accessories', 'RL parts',
    'Siemens LA breaker', 'LVPCB', 'low voltage power circuit breaker',
    'Voyten Electric', 'RLBreakers.com', 'Siemens Wendell', 'SG-3068', 'SGIM-3068D',
    'anti-pump relay', 'shunt trip', 'auxiliary switch', 'motor operator',
    'tapped sensor', 'undervoltage trip', 'close solenoid', 'RL renewal parts',
  ],
  openGraph: {
    title: 'Siemens RL Breakers — Exclusive Inventory from Voyten Electric',
    description:
      'Complete RL product line: breakers 800–5000A, Static Trip III, 22 accessory categories, and LA breakers. Free manuals + parts available.',
    url: 'https://voytenmanuals.com/products/rl-breakers',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Siemens RL Breakers — Voyten Exclusive',
    description: 'Your exclusive source for Siemens RL & LA breaker inventory, manuals, and parts.',
  },
  alternates: {
    canonical: 'https://voytenmanuals.com/products/rl-breakers',
  },
};

// ── Accessory category data for grid ──

const VOLUSION = 'https://jhkcv-upqrn.volusion.store/category-s';

const ACCESSORY_GRID = [
  { name: 'Anti-Pump Y Relay', catId: '175', icon: Zap },
  { name: 'Auxiliary Switch', catId: '164', icon: Wrench },
  { name: 'Bell Alarm Switch', catId: '158', icon: Shield },
  { name: 'Blown Fuse Trip Assembly', catId: '159', icon: Zap },
  { name: 'Breaker Assembly Part 1', catId: '147', icon: Wrench },
  { name: 'Breaker Assembly Part 2', catId: '148', icon: Wrench },
  { name: 'Close Solenoid', catId: '154', icon: Zap },
  { name: 'Communications Options', catId: '167', icon: ExternalLink },
  { name: 'Contacts (800–2000A)', catId: '151', icon: Wrench },
  { name: 'Contacts (3200–5000A)', catId: '150', icon: Wrench },
  { name: 'Integrally Fused Breakers', catId: '168', icon: Shield },
  { name: 'Key Interlock & Fuse Carriage', catId: '170', icon: Shield },
  { name: 'Motor Operator', catId: '153', icon: Zap },
  { name: 'Open Fuse Indicator', catId: '160', icon: Zap },
  { name: 'Open Fuse Sensor', catId: '171', icon: Zap },
  { name: 'Operator Mechanism', catId: '152', icon: Wrench },
  { name: 'Secondary Disconnect', catId: '162', icon: Wrench },
  { name: 'Shunt Trip', catId: '157', icon: Zap },
  { name: 'Static Trip Unit', catId: '165', icon: Shield },
  { name: 'Tapped Sensor', catId: '181', icon: Wrench },
  { name: 'Trigger Fuse Assembly', catId: '161', icon: Zap },
  { name: 'Tripping Transformer', catId: '166', icon: Zap },
  { name: 'Undervoltage Trip Device', catId: '163', icon: Shield },
];

// ── Interrupting ratings table ──

const RATINGS_TABLE = [
  { frame: '800A', rl: '42', rle: '42', rlf: '65', rli: '100+' },
  { frame: '1200A', rl: '42', rle: '—', rlf: '65', rli: '—' },
  { frame: '1600A', rl: '42', rle: '—', rlf: '65', rli: '—' },
  { frame: '2000A', rl: '42', rle: '42', rlf: '65', rli: '—' },
  { frame: '2500A', rl: '42', rle: '—', rlf: '65', rli: '—' },
  { frame: '3000A', rl: '42', rle: '—', rlf: '65', rli: '—' },
  { frame: '3200A', rl: '50', rle: '—', rlf: '65', rli: '—' },
  { frame: '4000A', rl: '65', rle: '65', rlf: '65', rli: '—' },
  { frame: '5000A', rl: '65', rle: '—', rlf: '65', rli: '—' },
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
    url: 'https://voytenmanuals.com/products/rl-breakers',
    numberOfItems: totalCount,
    provider: {
      '@type': 'Organization',
      name: 'Voyten Electric & Electronics, Inc.',
      url: 'https://voytenmanuals.com',
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
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://voytenmanuals.com' },
      { '@type': 'ListItem', position: 2, name: 'Manufacturers', item: 'https://voytenmanuals.com/manufacturers' },
      { '@type': 'ListItem', position: 3, name: 'Siemens', item: 'https://voytenmanuals.com/manufacturers/siemens' },
      { '@type': 'ListItem', position: 4, name: 'RL Breakers' },
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
                <Link href="/manufacturers/siemens" className="hover:text-white transition-colors">Siemens</Link>
                <ChevronRight size={14} />
                <span className="text-white">RL Breakers</span>
              </nav>

              <div className="inline-flex items-center gap-2 bg-[#dc2626] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                <Shield size={12} />
                Exclusive Voyten Inventory
              </div>

              <h1 className="text-3xl lg:text-5xl font-extrabold leading-tight mb-4">
                Siemens Type <span className="text-[#dc2626]">RL</span> Breakers
                <span className="block text-xl lg:text-2xl font-semibold text-slate-300 mt-2">
                  Low Voltage Power Circuit Breakers — 800A to 5000A
                </span>
              </h1>

              <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-xl">
                Voyten Electric purchased <strong className="text-white">all remaining RL &amp; LA breaker inventory</strong> from
                the Siemens Wendell, NC facility. We are your exclusive source for new-surplus breakers, Static Trip III units,
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
              <p className="text-2xl font-extrabold text-[#1a1a1a]">22</p>
              <p className="text-sm text-slate-500">Accessory Categories</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#dc2626]">Exclusive</p>
              <p className="text-sm text-slate-500">Voyten Inventory</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* ═══════════════ RL ACCESSORIES (22 categories) ═══════════════ */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">RL Accessories &amp; Renewal Parts</h2>
            <p className="text-slate-500 mt-1">
              22 accessory categories — every component for the RL product line, from anti-pump relays to undervoltage trip devices.
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
            {ACCESSORY_GRID.map(acc => {
              const Icon = acc.icon;
              return (
                <a
                  key={acc.catId}
                  href={`${VOLUSION}/${acc.catId}.htm`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 hover:border-[#dc2626]/30 hover:shadow-md transition-all"
                >
                  <div className="w-9 h-9 bg-slate-100 group-hover:bg-[#dc2626]/10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                    <Icon size={16} className="text-slate-500 group-hover:text-[#dc2626] transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-[#dc2626] transition-colors truncate">
                      {acc.name}
                    </p>
                    <p className="text-xs text-slate-400">View Parts &amp; Inventory</p>
                  </div>
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-[#dc2626] flex-shrink-0 ml-auto transition-colors" />
                </a>
              );
            })}
          </div>
        </section>

        {/* ═══════════════ RL BREAKER VARIANTS ═══════════════ */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">RL Breaker Manuals</h2>
              <p className="text-slate-500 mt-1">RL, RLE, RLI, and RLF variants — installation, maintenance, and renewal parts</p>
            </div>
            <Link
              href="/search?manufacturer=Siemens&subcategory=Insulated+Case+Breakers"
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
                href="/search?manufacturer=Siemens&subcategory=Insulated+Case+Breakers"
                className="text-sm text-[#dc2626] hover:text-[#b91c1c] font-medium"
              >
                View all {breakers.length} breaker manuals
              </Link>
            </div>
          )}
        </section>

        {/* ═══════════════ INTERRUPTING RATINGS TABLE ═══════════════ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Interrupting Ratings</h2>
          <p className="text-slate-500 mb-6">kA RMS Symmetrical at 480V — per Siemens SG-3068</p>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1a1a1a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">Frame</th>
                    <th className="px-4 py-3 text-center font-semibold">RL (Standard)</th>
                    <th className="px-4 py-3 text-center font-semibold">RLE (Economical)</th>
                    <th className="px-4 py-3 text-center font-semibold">RLF (Fully Rated)</th>
                    <th className="px-4 py-3 text-center font-semibold">RLI (Integrally Fused)</th>
                  </tr>
                </thead>
                <tbody>
                  {RATINGS_TABLE.map((row, i) => (
                    <tr key={row.frame} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{row.frame}</td>
                      <td className="px-4 py-2.5 text-center text-slate-700">{row.rl} kA</td>
                      <td className="px-4 py-2.5 text-center text-slate-700">{row.rle === '—' ? <span className="text-slate-300">—</span> : `${row.rle} kA`}</td>
                      <td className="px-4 py-2.5 text-center text-slate-700">{row.rlf} kA</td>
                      <td className="px-4 py-2.5 text-center text-slate-700">{row.rli === '—' ? <span className="text-slate-300">—</span> : `${row.rli} kA`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
                    href="/manual/siemens-rl-static-trip-iii-unit-manual"
                    className="inline-flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#111111] text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                  >
                    <Download size={16} />
                    Download Manual
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-2 bg-slate-50 flex items-center justify-center p-8">
                <Image
                  src={IMG_STATIC_TRIP}
                  alt="Siemens Static Trip III electronic trip unit for RL circuit breakers — front panel showing LSIG adjustment dials"
                  width={300}
                  height={300}
                  className="w-full max-w-[280px] h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ LA BREAKERS ═══════════════ */}
        {laBreakers.length > 0 && (
          <section className="mb-16">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">LA Breaker &amp; Accessories</h2>
              <p className="text-slate-500 mt-1">
                Originally manufactured by Allis-Chalmers, now supported by Siemens. Voyten stocks LA breakers and renewal parts.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...laBreakers, ...laAccessories].slice(0, 9).map(manual => (
                <ManualCard key={manual.id} manual={manual} />
              ))}
            </div>
            {(laBreakers.length + laAccessories.length) > 9 && (
              <div className="mt-4 text-center">
                <Link
                  href="/search?manufacturer=Siemens&q=LA+breaker"
                  className="text-sm text-[#dc2626] hover:text-[#b91c1c] font-medium"
                >
                  View all {laBreakers.length + laAccessories.length} LA documents
                </Link>
              </div>
            )}
          </section>
        )}

        {/* ═══════════════ ALL RL MANUALS GRID ═══════════════ */}
        {accessories.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">All RL Accessory Manuals</h2>
              <Link
                href="/search?manufacturer=Siemens&subcategory=RL+Accessories"
                className="hidden sm:flex items-center gap-1 text-sm text-[#dc2626] hover:text-[#b91c1c] font-medium"
              >
                Search all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {accessories.map(manual => (
                <ManualCard key={manual.id} manual={manual} />
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════ BOTTOM CTA ═══════════════ */}
        <section>
          <div className="bg-[#dc2626] rounded-2xl p-8 lg:p-10 text-center text-white">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Need an RL Part?</h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Voyten Electric is your exclusive source for Siemens RL &amp; LA breaker inventory. New-surplus breakers, Static Trip III
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
