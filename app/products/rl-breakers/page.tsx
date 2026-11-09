import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Phone, ArrowRight, ChevronRight, Wrench, Shield, Download, ExternalLink, BookOpen, Cpu } from 'lucide-react';
import ManualCard from '@/components/ManualCard';
import { getRLProductLine, type Manual } from '@/lib/manuals-db';

export const revalidate = 3600;

// ── Images (self-hosted in public/images) ──

const SITE = 'https://www.voytenmanuals.com';
const PAGE_URL = `${SITE}/products/rl-breakers`;
const ORG_ID = `${SITE}/#organization`; // declared by the Organization block in app/layout.tsx
// Hero: the same breaker photo the page used to hotlink from the Volusion CDN
// ("breaker white.png"), now served locally. Native size 239×195.
const IMG_BREAKER_HERO = '/images/rl-breaker-hero.png';
// Parts overview: an upscale of the original accessories photo, served from public/images.
const IMG_PARTS = '/images/rl-accessories-parts-2026-09.jpg';
// Social card rendered by ./opengraph-image.tsx (Next serves it at this path).
const IMG_OG = `${PAGE_URL}/opengraph-image`;


// ── SEO Metadata ──

// Page title only — app/layout.tsx appends " | Voyten Manuals" via its title template.
const PAGE_TITLE = 'Voyten Type RL/VRL Breakers & Accessories — New Surplus Inventory';
// ~155 chars so Google shows it whole.
const PAGE_DESCRIPTION =
  'New-surplus and reconditioned Voyten Type RL/VRL & LA breakers, 800–5000A, plus Static Trip III units and renewal parts. Free manuals. 24/7: 1-800-458-4001.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    'Voyten Type RL breaker', 'VRL breaker', 'RL circuit breaker', 'RLE breaker',
    'RLI integrally fused', 'RLF fully rated', 'Static Trip III', 'RL accessories', 'RL parts',
    'Type LA breaker', 'LVPCB', 'low voltage power circuit breaker',
    'Voyten Electric', 'RLBreakers.com', 'Wendell NC breakers', 'SG-3068', 'SGIM-3068D',
    // Legacy nameplate wording — non-rendered, for query resolution only.
    'Siemens RL breaker', 'Siemens Type RL', 'Siemens LA breaker', 'Siemens Wendell',
    'anti-pump relay', 'shunt trip', 'auxiliary switch', 'motor operator',
    'tapped sensor', 'undervoltage trip', 'close solenoid', 'RL renewal parts',
  ],
  openGraph: {
    title: 'Voyten Type RL/VRL Breakers — New Surplus Inventory from Voyten Electric',
    description:
      'Complete RL product line: breakers 800–5000A, Static Trip III, 23 accessory categories, and LA breakers. Free manuals + parts available.',
    url: PAGE_URL,
    type: 'website',
    siteName: 'Voyten Manuals',
    locale: 'en_US',
    // The image itself comes from ./opengraph-image.tsx + ./twitter-image.tsx
    // (file-based metadata). Without them this page had NO og:image: a page-level
    // `openGraph` object replaces the root one, so the site card never reached it.
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Voyten Type RL/VRL Breakers — New Surplus',
    description: 'Your New Surplus authorized source for Voyten Type RL/VRL & LA breaker inventory, manuals, and parts.',
  },
  alternates: {
    canonical: 'https://www.voytenmanuals.com/products/rl-breakers',
  },
};

// ── Frames + FAQ (one source for the visible FAQ section AND the FAQPage schema) ──

// Six frames, per the RL decoder's FRAME table (public/tools/rl-decoder.html).
// 1200A / 2500A are sensor ratings and 3000A is a Type LA / sensor size, not RL frames.
const RL_FRAMES_TEXT = '800A, 1600A, 2000A, 3200A, 4000A, 5000A';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Where can I buy Voyten Type RL/VRL breaker parts?',
    a: 'Voyten Electric & Electronics, Inc. is the New Surplus authorized source for Voyten Type RL/VRL breaker inventory worldwide. Voyten purchased all remaining RL and LA breaker inventory directly from the Wendell, NC manufacturing facility. New-surplus breakers, Static Trip III units, and every renewal part are tested, in stock, and ready to ship. Call 1-800-458-4001 or request a quote at voytenmanuals.com/contact.',
  },
  {
    q: 'What is a Voyten Type RL/VRL breaker?',
    a: 'The Voyten Type RL/VRL is a low voltage power circuit breaker (LVPCB) in drawout construction, built in six frames from 800A to 5000A. It uses the Static Trip III electronic trip unit for LSIG (Long-time, Short-time, Instantaneous, Ground fault) overcurrent protection. Variants include the RL (standard, 800–5000A), RLE (economical, higher interrupting per frame, 800–4000A), RLI (integrally fused, 800A only), and RLF (fully rated 200 kA, 800–5000A, drawout only). The RL product line also includes the companion Type LA air circuit breaker (600–3000A).',
  },
  {
    q: 'What is the Static Trip III trip unit?',
    a: 'The Static Trip III is an electronic trip unit providing adjustable LSIG overcurrent protection for all RL series breakers. L = Long-time delay (adjustable pickup and time band), S = Short-time delay (I²t or flat response), I = Instantaneous (fixed or adjustable pickup), G = Ground fault (adjustable pickup and delay). Voyten stocks new-surplus and reconditioned Static Trip III units with full testing and calibration.',
  },
  {
    q: 'What RL/VRL breaker frame sizes does Voyten stock?',
    a: `Voyten stocks Type RL/VRL breakers and parts for all six frame sizes: ${RL_FRAMES_TEXT}. The RLE covers 800A through 4000A, the RLI is 800A only, and the RLF covers all six frames in drawout construction. The companion Type LA air circuit breaker covers 600A through 3000A. The inventory includes 23 accessory categories covering every component from anti-pump relays and arc chutes to motor operators and undervoltage trip devices.`,
  },
  {
    q: 'Are Type RL/VRL breakers still manufactured?',
    a: 'No. The RL product line was discontinued and the Wendell, NC facility closed. Voyten Electric purchased all remaining inventory, making them the New Surplus authorized source for Voyten Type RL/VRL breakers, LA breakers, Static Trip III units, and all renewal parts. Free technical documentation including instruction manuals (SGIM-3068), renewal parts catalogs (SG-3068), and wiring diagrams (SGIM-3068D) is available at voytenmanuals.com/products/rl-breakers.',
  },
  {
    q: 'My Type RL/VRL breaker failed — who do I call for an emergency replacement?',
    a: 'Call Voyten Electric at 1-800-458-4001 for 24/7 emergency support. As the New Surplus authorized source for Voyten Type RL/VRL inventory, Voyten identifies your breaker from its catalog or edge number, pulls an exact-match new-surplus or reconditioned RL/RLE/RLI/RLF breaker, Static Trip III unit, or renewal part from stock, tests it, and expedites shipment to minimize downtime in plants and critical facilities.',
  },
  {
    q: 'How do I extend the life of aging RL switchgear instead of replacing it?',
    a: 'Because Voyten holds the complete Type RL/VRL inventory, aging RL switchgear can stay in service with genuine new-surplus and reconditioned RL breakers, Static Trip III trip units, and renewal parts — no need to replace the switchgear lineup. Voyten supplies exact-match components across all six frames (800–5000A) so existing cells, bus, and wiring stay intact. Call 1-800-458-4001.',
  },
  {
    q: 'How do I identify my Type RL/VRL breaker to order a replacement?',
    a: 'Provide the catalog number or the edge number stamped on the breaker frame, plus the frame size (800–5000A) and trip-unit model. The free Type RL/VRL catalog decoder at voytenmanuals.com/tools/rl breaks a catalog number into model, frame, interrupting rating, trip unit and accessories. Voyten cross-references these to the exact replacement breaker and parts. Call 1-800-458-4001 or request a quote at voytenmanuals.com/contact.',
  },
];

// ── Surface cards ──

// This page is a product surface, so its document cards drop the "Siemens" mark
// from the library title and show the product line instead of the manufacturer
// (see the RL de-tag rule). The /manual/[slug] pages they link to are the library
// layer and keep their records untouched — this only changes what the card shows.
function surfaceCard(manual: Manual, line: string): Manual {
  return {
    ...manual,
    title: manual.title.replace(/\bSiemens(\s*\/\s*Allis[- ]Chalmers)?\s+/gi, '').trim(),
    manufacturer: line,
  };
}

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
  // The DB layer already retries transient Turso failures. This is the last line
  // of defense: if Turso is fully down during a build/prerender, degrade to the
  // static page (hero, phone, CTAs, accessory grid) rather than failing the whole
  // emergency-funnel deploy. ISR (revalidate) self-heals once the DB is reachable.
  let breakers: Manual[] = [];
  let accessories: Manual[] = [];
  let laBreakers: Manual[] = [];
  let laAccessories: Manual[] = [];
  try {
    ({ breakers, accessories, laBreakers, laAccessories } = await getRLProductLine());
  } catch (err) {
    console.error('[rl-breakers] getRLProductLine failed; rendering static fallback:', err);
  }

  // Documents actually rendered below (12 RL breaker/trip docs + every RL
  // accessory, LA breaker and LA accessory doc), so the stat bar and
  // CollectionPage.numberOfItems match what a visitor can see.
  const shownBreakers = breakers.slice(0, 12);
  const shownCount = shownBreakers.length + accessories.length + laBreakers.length + laAccessories.length;

  // JSON-LD — one connected @graph. The Organization is referenced by @id
  // (declared once, sitewide, in app/layout.tsx) instead of being restated.
  // No price on the offers: RL is sold by quote, so a price would be invented.
  const sellerRef = { '@id': ORG_ID };
  const productId = `${PAGE_URL}#product`;
  const offer = (condition: 'New' | 'Refurbished', name: string, description: string) => ({
    '@type': 'Offer',
    '@id': `${PAGE_URL}#offer-${condition.toLowerCase()}`,
    name,
    description,
    itemCondition: `https://schema.org/${condition}Condition`,
    availability: 'https://schema.org/InStock',
    businessFunction: 'http://purl.org/goodrelations/v1#Sell',
    url: `${SITE}/contact?type=quote`,
    areaServed: { '@type': 'Place', name: 'Worldwide' },
    seller: sellerRef,
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: 'Voyten Type RL/VRL & LA Low Voltage Power Circuit Breakers',
        description: PAGE_DESCRIPTION,
        isPartOf: { '@id': `${SITE}/#website` },
        primaryImageOfPage: { '@type': 'ImageObject', url: IMG_OG, width: 1200, height: 630 },
        breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
        about: { '@id': productId },
        mainEntity: { '@id': productId },
        publisher: sellerRef,
        numberOfItems: shownCount,
        relatedLink: `${SITE}/tools/rl`,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Voyten Type RL/VRL Breakers', item: PAGE_URL },
        ],
      },
      {
        // OfferCatalog, not Product: this page covers the whole RL/VRL line, and
        // Google only gives product rich results to a page about one specific
        // product, so a line-level Product is an invalid item in GSC. The specs that
        // sat in Product.additionalProperty are in the description (and on the page).
        '@type': 'OfferCatalog',
        '@id': productId,
        name: 'Voyten Type RL/VRL Low Voltage Power Circuit Breaker',
        alternateName: ['Type RL breaker', 'VRL breaker', 'RLE', 'RLI', 'RLF'],
        category: 'Low Voltage Power Circuit Breakers',
        description:
          `New-surplus and reconditioned Voyten Type RL/VRL, RLE, RLI and RLF low voltage power circuit breakers, Static Trip III trip units and renewal parts, plus the companion Type LA air circuit breaker — from Voyten Electric, the New Surplus authorized source for the discontinued RL line. Frames: ${RL_FRAMES_TEXT}. Maximum rated voltage 635V AC. Drawout construction (RLF drawout only). Static Trip III (LSIG) trip unit. Interrupting rating 30–200 kA RMS symmetrical, by model and frame.`,
        image: [`${SITE}${IMG_BREAKER_HERO}`, `${SITE}${IMG_PARTS}`, IMG_OG],
        url: PAGE_URL,
        mainEntityOfPage: { '@id': `${PAGE_URL}#webpage` },
        itemListElement: [
          offer(
            'New',
            'New-surplus Type RL/VRL breakers and parts',
            'Unused Type RL/VRL and LA breakers, Static Trip III units and renewal parts from the inventory Voyten purchased from the Wendell, NC manufacturing facility.',
          ),
          offer(
            'Refurbished',
            'Reconditioned Type RL/VRL breakers and parts',
            'Reconditioned and tested Type RL/VRL breakers, Static Trip III units and renewal parts.',
          ),
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${PAGE_URL}#faq`,
        isPartOf: { '@id': `${PAGE_URL}#webpage` },
        mainEntity: FAQS.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'Service',
        '@id': `${PAGE_URL}#emergency-service`,
        name: '24/7 Emergency Voyten Type RL/VRL Breaker & Parts Sourcing',
        serviceType: 'Emergency obsolete circuit breaker and renewal-parts sourcing',
        description:
          'Emergency sourcing, testing, and expedited shipment of exact-match Voyten Type RL/VRL breakers, Static Trip III trip units, and renewal parts for failed or aging RL switchgear. Voyten holds New Surplus RL inventory acquired from the Wendell, NC facility.',
        areaServed: { '@type': 'Place', name: 'Worldwide' },
        hasOfferCatalog: { '@id': productId },
        provider: {
          '@id': ORG_ID,
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
      },
    ],
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
                <span className="text-white">Voyten Type RL/VRL Breakers</span>
              </nav>

              <div className="inline-flex items-center gap-2 bg-[#dc2626] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                <Shield size={12} />
                New Surplus Inventory
              </div>

              <h1 className="text-3xl lg:text-5xl font-extrabold leading-tight mb-4">
                Voyten Type <span className="text-[#dc2626]">RL/VRL</span> Breakers
                <span className="block text-xl lg:text-2xl font-semibold text-slate-300 mt-2">
                  Low Voltage Power Circuit Breakers — 800A to 5000A
                </span>
              </h1>

              <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-xl">
                Voyten Electric is your <strong className="text-white">New Surplus authorized source</strong> for
                Voyten Type RL/VRL &amp; LA breakers, acquired directly from the Wendell, NC manufacturing facility. Complete
                breakers — new and reconditioned — plus Static Trip III units, rating plugs, and every renewal part
                in the RL/VRL product line, stocked for immediate shipment.
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
              <p className="mt-4 text-sm text-slate-400">
                Not sure which RL you have?{' '}
                <Link href="/tools/rl" className="text-white underline underline-offset-2 hover:text-[#fca5a5]">
                  Decode the catalog number
                </Link>{' '}
                from the nameplate first.
              </p>
            </div>

            {/* Hero image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                  <Image
                    src={IMG_BREAKER_HERO}
                    alt="Voyten Type RL/VRL low voltage power circuit breaker — drawout power air circuit breaker with Static Trip III electronic trip unit"
                    width={239}
                    height={195}
                    className="w-full h-auto rounded-lg"
                    priority
                  />
                  <p className="text-center text-sm text-slate-400 mt-3">
                    Voyten Type RL/VRL LVPCB with Static Trip III
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
              <p className="text-2xl font-extrabold text-[#1a1a1a]">{shownCount}{breakers.length > shownBreakers.length ? '+' : ''}</p>
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
              23 accessory categories — every component for the RL/VRL product line, from anti-pump relays to undervoltage trip devices.
            </p>
          </div>

          {/* Parts overview image */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
            <div className="grid lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-1 flex justify-center">
                <Image
                  src={IMG_PARTS}
                  alt="Voyten Type RL/VRL breaker accessories and renewal parts — trip devices, current sensors, arc chute barriers and control components"
                  width={400}
                  height={223}
                  className="w-full max-w-sm h-auto rounded-lg"
                />
              </div>
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Complete Parts Availability</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Voyten maintains the largest available inventory of Type RL/VRL renewal parts. From contact finger kits and
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
            href="/tools/rl"
            className="group mb-4 flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-6 hover:border-[#dc2626]/30 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-[#dc2626]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Cpu size={24} className="text-[#dc2626]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-slate-900 group-hover:text-[#dc2626] transition-colors">
                Identify Your Breaker &mdash; Type RL/VRL Catalog Decoder
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                Enter the catalog number from the nameplate to get model, frame, interrupting rating, trip unit and accessories &mdash; then request a quote with the decoded spec attached.
              </p>
            </div>
            <ArrowRight size={20} className="text-slate-300 group-hover:text-[#dc2626] flex-shrink-0 transition-colors" />
          </Link>
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
            {shownBreakers.map(manual => (
              <ManualCard key={manual.id} manual={surfaceCard(manual, 'Type RL/VRL')} />
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

        {/* ═══════════════ RL ACCESSORY DOCUMENTATION ═══════════════ */}
        {accessories.length > 0 && (
          <section className="mb-16">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">RL Accessory Parts Documentation</h2>
              <p className="text-slate-500 mt-1">
                Parts and technical sheets for each of the {accessories.length} RL/VRL accessory categories — part numbers, exploded views and fit-up by frame.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {accessories.map(manual => (
                <ManualCard key={manual.id} manual={surfaceCard(manual, 'Type RL/VRL')} />
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════ TYPE LA ═══════════════ */}
        {(laBreakers.length > 0 || laAccessories.length > 0) && (
          <section className="mb-16" id="type-la">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Type LA Air Circuit Breakers (600–3000A)</h2>
              <p className="text-slate-500 mt-1">
                The companion Type LA air circuit breaker came from the same Wendell, NC inventory. Voyten stocks LA breakers and
                renewal parts alongside the RL/VRL line — call 1-800-458-4001 or request a quote.
              </p>
            </div>
            {laBreakers.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">LA Breaker Documentation</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {laBreakers.map(manual => (
                    <ManualCard key={manual.id} manual={surfaceCard(manual, 'Type LA')} />
                  ))}
                </div>
              </>
            )}
            {laAccessories.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">LA Accessory &amp; Renewal Parts Documentation</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {laAccessories.map(manual => (
                    <ManualCard key={manual.id} manual={surfaceCard(manual, 'Type LA')} />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

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
                  alt="Static Trip III power flow diagram — TSIG/CP unit with forward and reverse kW/kVAR metering"
                  width={400}
                  height={260}
                  className="w-full max-w-[360px] h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ FAQ (visible copy of the FAQPage schema — same FAQS array) ═══════════════ */}
        <section className="mb-16" id="faq">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Type RL/VRL Questions &amp; Answers</h2>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-200">
            {FAQS.map(f => (
              <details key={f.q} className="group p-5">
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden font-semibold text-slate-900 hover:text-[#dc2626] transition-colors">
                  <h3 className="text-base">{f.q}</h3>
                  <ChevronRight size={18} className="flex-shrink-0 mt-0.5 text-slate-400 transition-transform group-open:rotate-90" aria-hidden="true" />
                </summary>
                <p className="mt-3 text-slate-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ═══════════════ BOTTOM CTA ═══════════════ */}
        <section>
          <div className="bg-[#dc2626] rounded-2xl p-8 lg:p-10 text-center text-white">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Need an RL Part?</h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Voyten Electric is your New Surplus authorized source for Voyten Type RL/VRL &amp; LA breaker inventory. New-surplus breakers, Static Trip III
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
