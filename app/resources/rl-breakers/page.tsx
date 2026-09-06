import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Phone, ChevronRight, BookOpen, Shield, ArrowRight, Info, Hash, Tag, Wrench, AlertTriangle, Download, Check } from 'lucide-react';
import ObfuscatedEmail from '@/components/ObfuscatedEmail';
import Toc from '../_components/Toc';

export const revalidate = 3600;

// ── RL/LA offering, mirrored from the printed RL marketing flyer ──
// Photos are cropped from that flyer, so its resolution is their ceiling. All
// four are pre-normalised to one 640x360 canvas so the cards align under the
// `w-full h-auto` image convention used across the RL pages.

const RL_OFFERINGS = [
  {
    title: 'RL Breaker',
    img: '/images/rl-offer-breaker.jpg',
    alt: 'Voyten Type RL/VRL low voltage power circuit breaker',
    copy: 'Low voltage power circuit breakers, 800A to 5000A.',
  },
  {
    title: 'E/O Parts',
    img: '/images/rl-offer-eo-parts.jpg',
    alt: 'Voyten Type RL/VRL motor operator, undervoltage release, and shunt trip assemblies',
    copy: 'Motor operators, UVR, shunt trips, contacts, and parts.',
  },
  {
    title: 'Non-Electric Parts',
    img: '/images/rl-offer-non-electric.jpg',
    alt: 'Voyten Type RL/VRL operator mechanisms and arc chute barriers',
    copy: 'Operator mechanisms, arc chute barriers, and parts.',
  },
  {
    title: 'Static Trip',
    img: '/images/rl-offer-static-trip.jpg',
    alt: 'Static Trip III trip unit with current sensors',
    copy: 'Static Trip III with adjustable LSIG. Fully tested in shop.',
  },
];

const RL_SERVICES = [
  'Apparatus life extension services',
  'Upgrades and retrofit',
  'Custom rebuilds',
  'Swap-out programs',
  'Rental services',
  'Full specialty builds and equipment fabrication',
];

// ── SEO Metadata ──

export const metadata: Metadata = {
  title: 'Voyten Type RL/VRL Low Voltage Power Circuit Breaker Guide — Complete Technical Reference | Voyten',
  description:
    'Comprehensive technical guide for the Voyten Type RL/VRL low voltage power circuit breaker (LVPCB). Covers all models (RL, RLE, RLI, RLF), frame sizes 800–5000A, Static Trip III trip units, catalog number structure, interrupting ratings, and the companion Type LA air circuit breaker. From Voyten Electric — your New Surplus RL/VRL source.',
  keywords: [
    'Voyten Type RL breaker guide', 'VRL breaker guide', 'RL LVPCB technical reference',
    'RL breaker specifications', 'RL vs RLE vs RLF', 'RL catalog number structure',
    'RL breaker interrupting rating', 'Static Trip III trip unit',
    'RL frame sizes', 'RL breaker discontinued', 'Wendell NC breakers',
    'RLE economical breaker', 'RLI integrally fused', 'RLF fully rated',
    'Type LA breaker', 'RL renewal parts guide',
    'SGIM-3068', 'SG-3068', 'SG-3118', 'SG-3169',
    'Voyten Electric', 'RLBreakers.com',
    // Legacy nameplate wording — non-rendered, for query resolution only.
    'Siemens RL breaker guide', 'Siemens Type RL', 'Siemens Wendell NC', 'Siemens LA breaker',
  ],
  openGraph: {
    title: 'Voyten Type RL/VRL Breaker — Complete Technical Reference',
    description:
      'Definitive guide to the Voyten Type RL/VRL LVPCB: all models, specifications, catalog nomenclature, trip units, and parts sourcing. By Voyten Electric.',
    url: 'https://www.voytenmanuals.com/resources/rl-breakers',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Voyten Type RL/VRL Breaker Guide — Voyten Electric',
    description: 'Complete technical reference for Voyten Type RL/VRL low voltage power circuit breakers: all models, specs, trip units, and parts.',
  },
  alternates: {
    canonical: 'https://www.voytenmanuals.com/resources/rl-breakers',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ── Page ──

export default function RLBreakersGuide() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Voyten Type RL/VRL Low Voltage Power Circuit Breaker — Complete Technical Reference',
    description: metadata.description,
    url: 'https://www.voytenmanuals.com/resources/rl-breakers',
    author: {
      '@type': 'Organization',
      name: 'Voyten Electric & Electronics, Inc.',
      url: 'https://www.voytenmanuals.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Voyten Electric & Electronics, Inc.',
      url: 'https://www.voytenmanuals.com',
      telephone: '+1-800-458-4001',
    },
    datePublished: '2026-06-03',
    dateModified: '2026-06-04',
    about: {
      '@type': 'Product',
      name: 'Voyten Type RL/VRL Low Voltage Power Circuit Breaker',
      manufacturer: { '@type': 'Organization', name: 'Voyten Electric & Electronics, Inc.' },
      category: 'Circuit Breakers',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.voytenmanuals.com' },
      { '@type': 'ListItem', position: 2, name: 'RL Breakers', item: 'https://www.voytenmanuals.com/products/rl-breakers' },
      { '@type': 'ListItem', position: 3, name: 'Technical Reference Guide' },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the difference between RL, RLE, RLI, and RLF breakers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All four are variants of the Voyten Type RL/VRL low voltage power circuit breaker. The RL (standard) is available in all frame sizes from 800A to 5000A with interrupting ratings from 30 to 100 kA. The RLE (economical) offers higher interrupting capacity per frame (42–100 kA) and is available in frames 800A through 4000A. The RLI (integrally fused) is available only at 800A with 85 kA interrupting capacity and includes integral current-limiting fuses. The RLF (fully rated) provides 200 kA interrupting at all frame sizes but is available only in drawout construction. All four variants use the same Static Trip III trip unit and share a common accessory platform.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I read a Voyten Type RL/VRL catalog number?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'An RL catalog number is a 12+ character code following the prefix "RL". Each position encodes a specific configuration: Position 1 = Connection (A=Drawout, B=Stationary), Position 2 = Interrupting Type (S=Standard, E=Economical, I=Integrally Fused, F=Fully Rated), Position 3 = Frame Size (0=800A through 5=5000A), Position 4 = Operation (M=Manual, E=Electric), Positions 5–6 = Tripping Sensor (e.g., AG=800/.5), Position 7 = Current Limiting Fuses, Position 8 = Control Voltage, Position 9 = System Wiring, Positions 10–11 = Trip Unit Code, Position 12 = Additional Auxiliary Contacts. Optional suffix codes after a dash indicate factory-installed accessories such as bell alarms, dual shunt trips, and undervoltage devices.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the Static Trip III trip unit?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Static Trip III is an electronic trip unit that provides adjustable overcurrent protection for all RL series breakers. It supports up to 8 protection functions: T (Thermal/Long-Time), S (Short-Time), I (Instantaneous), G (Ground Fault), Z (Zone Selective Interlocking), C (Communications), N (Neutral protection), and P (Power Metering). There are 53 distinct Static Trip III configuration codes (04 through 56), each offering a different combination of these features. The AC Pro II (codes 58, 59) is an aftermarket retrofit trip unit manufactured by Utility Relay Company (URC), not original factory production. The physical hardware comes in variants: III (base), IIIC (communications), IIICP (communications + power metering), and IIICPX (full feature set). All trip units require a matching rating plug sized to the breaker sensor.',
        },
      },
      {
        '@type': 'Question',
        name: 'What replaced the Voyten Type RL/VRL breaker?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The RL product line was discontinued when its Wendell, NC manufacturing facility closed. For existing RL switchgear, nothing needs to "replace" the RL — Voyten Electric purchased all remaining RL inventory (breakers, Static Trip III units, drawings, tooling, and every renewal part) directly from the Wendell plant, making Voyten the New Surplus authorized source for genuine Voyten Type RL/VRL breakers and parts. Existing installations are fully supported with original factory-produced equipment, with no need to modify or replace the switchgear. Current-production air circuit breakers from other manufacturers are not drop-in compatible with RL cells — they use a different frame geometry, trip unit platform, and cell interface — so any retrofit would require all-new switchgear. That is why facilities with installed RL equipment source genuine Type RL/VRL replacements and renewal parts from Voyten.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are RL and LA breaker parts interchangeable across production eras?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The Type RL was built by a single manufacturer at one plant — Wendell, NC — throughout its production life. Unlike SPB breakers (which transitioned across Westinghouse, Cutler-Hammer, and Eaton branding), the RL never changed hands or branding mid-production. All RL parts are interchangeable regardless of production date. The companion Type LA air circuit breaker (600A–3000A) shares the same origin and parts compatibility across its full production run.',
        },
      },
    ],
  };

  return (
    <div className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ═══════════════ HEADER ═══════════════ */}
      <section className="bg-[#1a1a1a] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#111111] via-[#1a1a1a] to-[#991b1b]/20" />
        <div className="max-w-4xl mx-auto px-4 py-14 lg:py-20 relative z-10">
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/products/rl-breakers" className="hover:text-white transition-colors">RL Breakers</Link>
            <ChevronRight size={14} />
            <span className="text-white">Technical Reference</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-[#dc2626] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <BookOpen size={12} />
            Technical Reference Guide
          </div>

          <h1 className="text-3xl lg:text-5xl font-extrabold leading-tight mb-4">
            Voyten Type <span className="text-[#dc2626]">RL/VRL</span> Low Voltage Power Circuit Breaker
            <span className="block text-xl lg:text-2xl font-semibold text-slate-300 mt-2">
              Complete Technical Reference &mdash; Models, Specifications &amp; Parts Guide
            </span>
          </h1>

          <p className="text-slate-300 text-lg leading-relaxed max-w-3xl">
            Everything you need to know about the Voyten Type RL/VRL low voltage power circuit breaker (LVPCB)
            &mdash; from model identification and catalog number structure to trip unit selection, sensor
            configurations, and parts sourcing.
          </p>
        </div>
      </section>

      {/* ═══════════════ CONTENT ═══════════════ */}
      {/* Hybrid layout: full-bleed alternating bands + sticky TOC rail (desktop) */}
      <div id="resource-content" className="relative w-full">

        {/* ── Overview ── */}
        <section className="even:bg-slate-100 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="lg:pl-[228px]">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">What Is the RL Breaker?</h2>
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>
              The <strong>Voyten Type RL/VRL</strong> is a low voltage power circuit breaker (LVPCB) in drawout
              construction, designed for power distribution systems rated up to <strong>635V AC</strong>. Frame
              sizes range from <strong>800A to 5000A</strong>, with interrupting capacities from <strong>30 kA
              to 200 kA RMS symmetrical</strong> depending on variant.
            </p>
            <p>
              The RL uses the <strong>Static Trip III</strong> electronic trip unit for adjustable LSIG
              (Long-time, Short-time, Instantaneous, Ground fault) overcurrent protection. Four breaker variants
              serve different application requirements: the <strong>RL</strong> (standard), <strong>RLE</strong> (economical
              with higher interrupting per frame), <strong>RLI</strong> (integrally fused), and <strong>RLF</strong> (fully
              rated at 200 kA). The companion <strong>Type LA</strong> air circuit breaker covers 600A&ndash;3000A
              ratings within the same product family.
            </p>
            <p>
              The RL product line was discontinued and the Wendell, NC manufacturing facility closed. In 2023,
              Voyten Electric acquired all remaining RL and LA inventory directly from that facility &mdash; the
              complete stock of breakers, Static Trip III units, renewal parts, drawings, and tooling &mdash;
              establishing Voyten as the New Surplus authorized source for the Type RL/VRL product line.
            </p>
          </div>
            </div>
          </div>
        </section>

        {/* ── Model Lineup ── */}
        <section className="even:bg-slate-100 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="lg:pl-[228px]">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">RL Model Lineup</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-3 font-bold text-slate-900">Model</th>
                  <th className="text-left p-3 font-bold text-slate-900">Designation</th>
                  <th className="text-left p-3 font-bold text-slate-900">Interrupting (635V)</th>
                  <th className="text-left p-3 font-bold text-slate-900">Frame Range</th>
                  <th className="text-left p-3 font-bold text-slate-900">Notes</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">RL</td>
                  <td className="p-3">Standard</td>
                  <td className="p-3">30&ndash;100 kA</td>
                  <td className="p-3">800&ndash;5000A</td>
                  <td className="p-3 text-slate-500">All 6 frame sizes; drawout or stationary</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">RLE</td>
                  <td className="p-3">Economical</td>
                  <td className="p-3">42&ndash;100 kA</td>
                  <td className="p-3">800&ndash;4000A</td>
                  <td className="p-3 text-slate-500">Higher interrupting per frame than RL</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">RLI</td>
                  <td className="p-3">Integrally Fused</td>
                  <td className="p-3">85 kA</td>
                  <td className="p-3">800A only</td>
                  <td className="p-3 text-slate-500">Integral current-limiting fuses</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">RLF</td>
                  <td className="p-3">Fully Rated</td>
                  <td className="p-3">200 kA</td>
                  <td className="p-3">800&ndash;5000A</td>
                  <td className="p-3 text-slate-500">Drawout only; highest interrupting</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">LA</td>
                  <td className="p-3">Air Circuit Breaker</td>
                  <td className="p-3">&mdash;</td>
                  <td className="p-3">600&ndash;3000A</td>
                  <td className="p-3 text-slate-500">Companion product line</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Frame codes: 0 = 800A, 1 = 1600A, 2 = 2000A, 3 = 3200A, 4 = 4000A, 5 = 5000A.
          </p>
            </div>
          </div>
        </section>

        {/* ── Renewal Parts Categories ── */}
        <section className="even:bg-slate-100 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="lg:pl-[228px]">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Renewal Parts Categories</h2>
          <div className="text-slate-700 leading-relaxed mb-6">
            <p>
              Voyten Electric stocks the following RL renewal part categories for immediate shipment:
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              'Anti-Pump Y Relay',
              'Auxiliary Switch',
              'Bell Alarm Switch',
              'Blown Fuse Trip Assembly',
              'Breaker Assemblies',
              'Close Solenoid',
              'Communications Options',
              'Contacts (800–2000A)',
              'Contacts (3200–5000A)',
              'Integrally Fused Breakers',
              'Key Interlock & Fuse Carriage',
              'Motor Operator',
              'Open Fuse Indicator',
              'Open Fuse Sensor',
              'Operator Mechanism',
              'Secondary Disconnect',
              'Shunt Trip',
              'Static Trip III Unit',
              'Tapped Sensor',
              'Trigger Fuse Assembly',
              'Tripping Transformer',
              'Undervoltage Trip Device',
            ].map(part => (
              <div key={part} className="flex items-center gap-3 bg-slate-50 rounded-lg border border-slate-200 p-3">
                <Shield size={14} className="text-[#dc2626] flex-shrink-0" />
                <p className="text-sm font-medium text-slate-900">{part}</p>
              </div>
            ))}
          </div>
            </div>
          </div>
        </section>

        {/* ── Interrupting & Short-Time Ratings ── */}
        <section className="even:bg-slate-100 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="lg:pl-[228px]">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Interrupting &amp; Short-Time Ratings</h2>
          <div className="text-slate-700 leading-relaxed space-y-4 mb-6">
            <p>
              All ratings are in <strong>kA RMS symmetrical</strong> per UL 1066 / IEEE C37.50. The values
              below reflect ratings at maximum design voltage per SG-3061 / SG-3068.
              Always consult the breaker nameplate for voltage-specific ratings in your application.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-3 font-bold text-slate-900">Model</th>
                  <th className="text-left p-3 font-bold text-slate-900">Frame</th>
                  <th className="text-center p-3 font-bold text-slate-900">Interrupting (kA)</th>
                  <th className="text-center p-3 font-bold text-slate-900">Short-Time (kA)</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {/* RL Standard */}
                <tr className="border-b border-slate-100 bg-slate-50/50"><td colSpan={4} className="p-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">RL Standard</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3">RL</td><td className="p-3">800A</td><td className="p-3 text-center">30</td><td className="p-3 text-center">30</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3">RL</td><td className="p-3">1600A</td><td className="p-3 text-center">65</td><td className="p-3 text-center">50</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3">RL</td><td className="p-3">2000A</td><td className="p-3 text-center">65</td><td className="p-3 text-center">65</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3">RL</td><td className="p-3">3200A</td><td className="p-3 text-center">65</td><td className="p-3 text-center">65</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3">RL</td><td className="p-3">4000A</td><td className="p-3 text-center">85</td><td className="p-3 text-center">85</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3">RL</td><td className="p-3">5000A</td><td className="p-3 text-center">100</td><td className="p-3 text-center">100</td></tr>
                {/* RLE Economical */}
                <tr className="border-b border-slate-100 bg-slate-50/50"><td colSpan={4} className="p-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">RLE Economical</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3">RLE</td><td className="p-3">800A</td><td className="p-3 text-center">42</td><td className="p-3 text-center">42</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3">RLE</td><td className="p-3">1600A</td><td className="p-3 text-center">65</td><td className="p-3 text-center">65</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3">RLE</td><td className="p-3">2000A</td><td className="p-3 text-center">85</td><td className="p-3 text-center">85</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3">RLE</td><td className="p-3">3200A</td><td className="p-3 text-center">100</td><td className="p-3 text-center">85</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3">RLE</td><td className="p-3">4000A</td><td className="p-3 text-center">100</td><td className="p-3 text-center">85</td></tr>
                {/* RLI */}
                <tr className="border-b border-slate-100 bg-slate-50/50"><td colSpan={4} className="p-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">RLI Integrally Fused</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3">RLI</td><td className="p-3">800A</td><td className="p-3 text-center">85</td><td className="p-3 text-center">65</td></tr>
                {/* RLF */}
                <tr className="border-b border-slate-100 bg-slate-50/50"><td colSpan={4} className="p-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">RLF Fully Rated</td></tr>
                <tr><td className="p-3">RLF</td><td className="p-3">All (800&ndash;5000A)</td><td className="p-3 text-center">200</td><td className="p-3 text-center">200</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Sources: SG-3061 / SG-3068. Consult breaker nameplate for application-specific voltage ratings.
          </p>
            </div>
          </div>
        </section>

        {/* ── Identify Your RL Breaker (decode CTA — decoders are internal-only) ── */}
        <section className="even:bg-slate-100 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="lg:pl-[228px]">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Identify Your RL Breaker</h2>
          <div className="text-slate-700 leading-relaxed space-y-4 mb-6 max-w-3xl">
            <p>
              Every RL breaker is identified by a structured catalog (edge) number that encodes its exact
              frame size, interrupting type, operation, tripping sensor, current-limiting fuses, control
              voltage, system wiring, Static Trip III code, and accessories. Reading it correctly is what
              guarantees an <strong>exact-match replacement</strong> &mdash; so rather than risk a mis-decode
              on an emergency part, send us the number and our team will decode it for you, fast.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Hash, t: 'Decode a catalog number', p: 'Send us the full RL catalog/edge number and our team decodes the exact frame, trip unit, sensor, fuse, and accessory configuration.', cta: 'Contact for Decode', href: '/contact?type=quote' },
              { icon: Tag, t: 'Read the nameplate', p: 'Not sure which RL variant you have? Send a photo of the breaker nameplate and we’ll identify it for an exact-match replacement.', cta: 'Contact Us', href: '/contact?type=quote' },
              { icon: Wrench, t: 'Find the right renewal parts', p: 'Match the exact frame, Static Trip III, tripping sensor, and accessories to in-stock New Surplus inventory.', cta: 'Shop RLBreakers.com', href: 'https://rlbreakers.com' },
              { icon: AlertTriangle, t: 'Emergency identification', p: 'Breaker down right now? Our team identifies and sources the correct RL part 24/7 to get you back online fast.', cta: 'Call 1-800-458-4001', href: 'tel:1-800-458-4001' },
            ].map((c) => (
              <a key={c.t} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined} className="group block bg-white rounded-xl border border-slate-200 p-5 hover:border-[#dc2626]/40 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#dc2626]/10 rounded-lg flex items-center justify-center flex-shrink-0"><c.icon size={20} className="text-[#dc2626]" /></div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{c.t}</h3>
                    <p className="text-sm text-slate-600 mb-2">{c.p}</p>
                    <span className="text-sm font-semibold text-[#dc2626] inline-flex items-center gap-1">{c.cta} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" /></span>
                  </div>
                </div>
              </a>
            ))}
          </div>
            </div>
          </div>
        </section>

        {/* ── Static Trip III ── */}
        <section className="even:bg-slate-100 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="lg:pl-[228px]">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Static Trip III Trip Unit</h2>
          <div className="text-slate-700 leading-relaxed space-y-4 mb-6">
            <p>
              All RL/VRL breakers use the <strong>Static Trip III</strong> electronic trip unit for adjustable
              overcurrent protection. The trip unit mounts to the breaker front and connects via a rating plug
              sized to the breaker&apos;s sensor. There are <strong>53 distinct configuration codes</strong> (positions
              10&ndash;11 of the catalog number), each offering a different combination of protection functions.
            </p>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-3 font-bold text-slate-900">Code</th>
                  <th className="text-left p-3 font-bold text-slate-900">Feature</th>
                  <th className="text-left p-3 font-bold text-slate-900">Function</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100"><td className="p-3 font-semibold text-[#dc2626]">T</td><td className="p-3">Thermal</td><td className="p-3">Long-time delay &mdash; adjustable pickup and time band</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-semibold text-[#dc2626]">S</td><td className="p-3">Short-Time</td><td className="p-3">Short-time delay &mdash; I&sup2;t or flat response</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-semibold text-[#dc2626]">I</td><td className="p-3">Instantaneous</td><td className="p-3">Instantaneous pickup &mdash; fixed or adjustable</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-semibold text-[#dc2626]">G</td><td className="p-3">Ground Fault</td><td className="p-3">Ground fault &mdash; adjustable pickup and delay</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-semibold text-[#dc2626]">Z</td><td className="p-3">Zone Selective</td><td className="p-3">Zone selective interlocking (upstream/downstream coordination)</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-semibold text-[#dc2626]">C</td><td className="p-3">Communications</td><td className="p-3">Remote communications interface</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-semibold text-[#dc2626]">N</td><td className="p-3">Neutral</td><td className="p-3">Neutral current protection</td></tr>
                <tr><td className="p-3 font-semibold text-[#dc2626]">P</td><td className="p-3">Power Metering</td><td className="p-3">Onboard power quality monitoring</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mb-6">
            <h4 className="font-bold text-slate-900 mb-3">Common Trip Unit Configurations</h4>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div><span className="font-mono font-semibold text-slate-700">04</span> <span className="text-slate-500">T (thermal only)</span></div>
              <div><span className="font-mono font-semibold text-slate-700">06</span> <span className="text-slate-500">T, S, I</span></div>
              <div><span className="font-mono font-semibold text-slate-700">07</span> <span className="text-slate-500">T, I, G</span></div>
              <div><span className="font-mono font-semibold text-slate-700">09</span> <span className="text-slate-500">T, S, I, G, Z</span></div>
              <div><span className="font-mono font-semibold text-slate-700">13</span> <span className="text-slate-500">T, S, I, G, Z, C</span></div>
              <div><span className="font-mono font-semibold text-slate-700">15</span> <span className="text-slate-500">T, S, I, G, Z, C, N</span></div>
              <div><span className="font-mono font-semibold text-slate-700">46</span> <span className="text-slate-500">T, S, I, G, Z, C, N, P (full suite)</span></div>
              <div><span className="font-mono font-semibold text-slate-700">58</span> <span className="text-slate-500">AC Pro II (aftermarket retrofit by Utility Relay Co.)</span></div>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              53 Static Trip III codes (04&ndash;56) plus 2 AC Pro II codes (58, 59). Code XX = non-automatic (no trip unit).
              The physical trip unit hardware varies by feature set: <strong>Static Trip III</strong> (base),
              <strong>IIIC</strong> (with communications), <strong>IIICP</strong> (communications + power metering),
              and <strong>IIICPX</strong> (full feature set). Higher codes require the corresponding hardware variant.
            </p>
          </div>

          <div className="flex items-start gap-4 bg-amber-50 rounded-xl border border-amber-200 p-5">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info size={20} className="text-amber-600" />
            </div>
            <div className="text-sm text-slate-700">
              <p className="font-semibold text-slate-900 mb-1">Rating Plug Requirement</p>
              <p>
                All Static Trip III and AC Pro II trip units require a <strong>matching rating plug</strong> sized
                to the breaker&apos;s sensor. The rating plug sets the long-time pickup range and must match
                the installed CT sensor. When replacing a trip unit, always verify the rating plug compatibility.
              </p>
            </div>
          </div>
            </div>
          </div>
        </section>

        {/* ── Brand History ── */}
        <section className="even:bg-slate-100 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="lg:pl-[228px]">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Product History</h2>
          <div className="text-slate-700 leading-relaxed space-y-4">
            <p>
              Unlike the SPB breaker (which transitioned across Westinghouse, Cutler-Hammer, and Eaton branding),
              the Type RL was built by a <strong>single manufacturer at one plant</strong> &mdash; Wendell, NC
              &mdash; throughout its entire production life, with no mid-production rebranding.
            </p>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Voyten Type RL/VRL</p>
                <p className="text-sm text-slate-500">Single-source production, one plant</p>
                <p className="text-xs text-slate-400 mt-2">Production: Wendell, NC facility</p>
              </div>
            </div>
            <p>
              After the RL was discontinued and the Wendell facility closed, Voyten Electric acquired the
              complete remaining inventory. All RL parts are interchangeable regardless of production date.
              The companion <strong>Type LA</strong> air circuit breaker (600A&ndash;3000A) shares the same
              origin and parts compatibility across its full production run.
            </p>
          </div>
            </div>
          </div>
        </section>

        {/* ── Technical Documentation ── */}
        <section className="even:bg-slate-100 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="lg:pl-[228px]">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Technical Documentation</h2>
          <div className="text-slate-700 leading-relaxed mb-6">
            <p>
              The following Siemens instruction leaflets and catalogs cover the RL product line. All are available
              as free PDF downloads from Voyten Manuals.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-3 font-bold text-slate-900">Document</th>
                  <th className="text-left p-3 font-bold text-slate-900">Number</th>
                  <th className="text-left p-3 font-bold text-slate-900">Content</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">RL Installation Manual</td>
                  <td className="p-3 font-mono">SGIM-3068</td>
                  <td className="p-3">Complete installation, operation, and maintenance instructions</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">RL Installation Manual (Extended)</td>
                  <td className="p-3 font-mono">SGIM-3068E</td>
                  <td className="p-3">Extended edition with additional wiring details</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">RL Renewal Parts Catalog</td>
                  <td className="p-3 font-mono">SG-3068</td>
                  <td className="p-3">Complete renewal parts list with exploded diagrams</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">Static Trip III Info &amp; Instruction Guide</td>
                  <td className="p-3 font-mono">SG-3118</td>
                  <td className="p-3">Trip unit configuration, settings, and calibration</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">Static Trip III Guide (Updated)</td>
                  <td className="p-3 font-mono">SG-3118-01</td>
                  <td className="p-3">Revised edition of SG-3118</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">Wiring Diagrams &amp; Control Power</td>
                  <td className="p-3 font-mono">SGIM-3068D</td>
                  <td className="p-3">System wiring diagrams (FIG 1A through FIG 20B)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Static Trip II Reference</td>
                  <td className="p-3 font-mono">SG3098-01</td>
                  <td className="p-3">Legacy trip unit documentation (predecessor to Static Trip III)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            <Link href="/search?manufacturer=Siemens&q=RL" className="text-[#dc2626] hover:text-[#b91c1c] font-medium">
              View all Siemens RL manuals &rarr;
            </Link>
          </p>
            </div>
          </div>
        </section>

        {/* ── What We Offer (mirrors the printed RL marketing flyer) ── */}
        <section className="even:bg-slate-100 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="lg:pl-[228px]">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">What We Offer for RL &amp; LA</h2>
          <div className="text-slate-700 leading-relaxed mb-6">
            <p>
              Voyten Electric stocks new Voyten Type RL/VRL and LA breakers, renewal parts, and accessories,
              and supports the full apparatus lifecycle &mdash; retrofit, replacement, rebuild, and
              rental. Family owned since 1953, with 70+ years of switchgear experience providing the
              right, timely solutions for your electrical lifecycle needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {RL_OFFERINGS.map(item => (
              <div
                key={item.title}
                className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
              >
                <Image
                  src={item.img}
                  alt={item.alt}
                  width={640}
                  height={360}
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="w-full h-auto bg-white"
                />
                <div className="p-4">
                  <p className="font-bold text-slate-900 mb-1">{item.title}</p>
                  <p className="text-sm text-slate-600">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-slate-50 rounded-xl border border-slate-200 p-5">
            <p className="font-bold text-slate-900 mb-3">Services</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {RL_SERVICES.map(s => (
                <li key={s} className="flex items-start gap-2 text-sm text-slate-700">
                  <Check size={16} className="text-[#dc2626] shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href="/rl-breaker-flyer.pdf"
              target="_blank"
              rel="noopener"
              className="flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors"
            >
              <Download size={18} />
              Download the RL flyer (PDF)
            </a>
            <a
              href="https://www.rlbreakers.com"
              target="_blank"
              rel="noopener"
              className="flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-medium border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Visit RLBreakers.com
              <ArrowRight size={16} />
            </a>
          </div>
            </div>
          </div>
        </section>

        {/* ── Sourcing CTA ── */}
        <section className="even:bg-slate-100 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="lg:pl-[228px]">
          <div className="bg-[#dc2626] rounded-2xl p-8 lg:p-10 text-center text-white">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Need RL Parts or Technical Support?</h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Voyten Electric is the New Surplus authorized source for the complete Voyten Type RL/VRL product line.
              New-surplus breakers, Static Trip III units, sensors, and every renewal part &mdash; tested,
              in stock, and ready to ship.
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
            <p className="text-white/60 text-sm mt-4">
              Mon&ndash;Fri 8:00 AM &ndash; 4:30 PM EST |{' '}
              <ObfuscatedEmail encoded="c2FsZXNAdm95dGVuLmNvbQ==" className="underline hover:text-white" />
            </p>
          </div>
            </div>
          </div>
        </section>

        {/* Sticky TOC rail — desktop only; placed last so it doesn't shift band parity */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <div className="mx-auto h-full max-w-7xl px-4">
            <div className="pointer-events-auto sticky top-24 w-[200px] pt-10">
              <Toc />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
