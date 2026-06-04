import Link from 'next/link';
import type { Metadata } from 'next';
import { Phone, ChevronRight, BookOpen, Zap, Shield, ArrowRight, Info } from 'lucide-react';

export const revalidate = 3600;

// ── SEO Metadata ──

export const metadata: Metadata = {
  title: 'Siemens RL Low Voltage Power Circuit Breaker Guide — Complete Technical Reference | Voyten',
  description:
    'Comprehensive technical guide for the Siemens Type RL low voltage power circuit breaker (LVPCB). Covers all models (RL, RLE, RLI, RLF), frame sizes 800–5000A, Static Trip III trip units, catalog number structure, sensor configurations, interrupting ratings, and the companion Type LA air circuit breaker. From Voyten Electric — your exclusive RL source.',
  keywords: [
    'Siemens RL breaker guide', 'RL LVPCB technical reference', 'RL breaker specifications',
    'RL vs RLE vs RLF', 'RL catalog number structure', 'RL breaker interrupting rating',
    'Static Trip III trip unit', 'RL sensor table', 'RL control voltage codes',
    'RL frame sizes', 'RL breaker discontinued', 'Siemens Wendell NC',
    'RLE economical breaker', 'RLI integrally fused', 'RLF fully rated',
    'Siemens LA breaker', 'RL renewal parts guide',
    'SGIM-3068', 'SG-3068', 'SG-3118', 'SG-3169',
    'Voyten Electric', 'RLBreakers.com',
  ],
  openGraph: {
    title: 'Siemens RL Breaker — Complete Technical Reference',
    description:
      'Definitive guide to the Siemens Type RL LVPCB: all models, specifications, catalog nomenclature, trip units, sensors, and parts sourcing. By Voyten Electric.',
    url: 'https://www.voytenmanuals.com/resources/rl-breakers',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Siemens RL Breaker Guide — Voyten Electric',
    description: 'Complete technical reference for Siemens RL low voltage power circuit breakers: all models, specs, trip units, and parts.',
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
    headline: 'Siemens Type RL Low Voltage Power Circuit Breaker — Complete Technical Reference',
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
          text: 'All four are variants of the Siemens Type RL low voltage power circuit breaker. The RL (standard) is available in all frame sizes from 800A to 5000A with interrupting ratings from 30 to 100 kA. The RLE (economical) offers higher interrupting capacity per frame (42–100 kA) and is available in frames 800A through 4000A. The RLI (integrally fused) is available only at 800A with 85 kA interrupting capacity and includes integral current-limiting fuses. The RLF (fully rated) provides 200 kA interrupting at all frame sizes but is available only in drawout construction. All four variants use the same Static Trip III trip unit and share a common accessory platform.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I read a Siemens RL catalog number?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'An RL catalog number is a 12+ character code following the prefix "RL". Each position encodes a specific configuration: Position 1 = Connection (A=Drawout, B=Stationary), Position 2 = Interrupting Type (S=Standard, E=Economical, I=Integrally Fused, F=Fully Rated), Position 3 = Frame Size (0=800A through 5=5000A), Position 4 = Operation (M=Manual, E=Electric), Positions 5–6 = Tripping Sensor (e.g., AG=800/.5), Position 7 = Current Limiting Fuses, Position 8 = Control Voltage, Position 9 = System Wiring, Positions 10–11 = Trip Unit Code, Position 12 = Additional Auxiliary Contacts. Optional suffix codes after a dash indicate factory-installed accessories such as bell alarms, dual shunt trips, and undervoltage devices.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the Siemens Static Trip III trip unit?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Static Trip III is an electronic trip unit that provides adjustable overcurrent protection for all RL series breakers. It supports up to 8 protection functions: T (Thermal/Long-Time), S (Short-Time), I (Instantaneous), G (Ground Fault), Z (Zone Selective Interlocking), C (Communications), N (Neutral protection), and P (Power Metering). There are 53 distinct Static Trip III configuration codes (04 through 56), each offering a different combination of these features. The AC Pro II (codes 58, 59) is an aftermarket retrofit trip unit manufactured by Utility Relay Company (URC), not original Siemens factory production. The physical hardware comes in variants: III (base), IIIC (communications), IIICP (communications + power metering), and IIICPX (full feature set). All trip units require a matching rating plug sized to the breaker sensor.',
        },
      },
      {
        '@type': 'Question',
        name: 'What replaced the Siemens RL breaker?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Siemens discontinued the RL product line and closed the manufacturing facility in Wendell, NC. For new installations, Siemens offers the WL series air circuit breaker as the current-production successor. However, the WL is not a drop-in replacement for existing RL installations — it uses a different frame geometry, trip unit platform, and cell interface. For facilities with existing RL switchgear, Voyten Electric purchased all remaining RL inventory (breakers, Static Trip III units, and every renewal part) directly from Siemens Wendell, making them the exclusive worldwide source for the RL product line.',
        },
      },
      {
        '@type': 'Question',
        name: 'What sensor do I need for my RL breaker?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'RL breakers use current transformer (CT) sensors rated in amps with a /.5 secondary. There are 15 single-wound sensors from 80A to 5000A and 5 dual-wound sensors from 2500A to 5000A. Sensor availability depends on frame size — for example, an 80A sensor (code AA) fits frames 0–2 (800A–2000A), while a 4000A sensor (code AN) only fits frames 4–5 (4000A–5000A). Dual-wound sensors provide enhanced ground fault sensitivity; the ground fault protection pickup is limited to 1200A maximum per NEC 230.95 for solidly-grounded wye services. The sensor code occupies positions 5–6 of the catalog number. Contact Voyten at 1-800-458-4001 with your catalog or edge number for exact sensor identification.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are RL and LA breaker parts interchangeable across production eras?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The Siemens Type RL was manufactured exclusively under the Siemens name throughout its production life. Unlike SPB breakers (which transitioned across Westinghouse, Cutler-Hammer, and Eaton branding), the RL maintained a single manufacturer identity. All RL parts are interchangeable regardless of production date. The companion Type LA air circuit breaker (600A–3000A) shares the same Siemens origin and parts compatibility across its full production run.',
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
            Siemens Type <span className="text-[#dc2626]">RL</span> Low Voltage Power Circuit Breaker
            <span className="block text-xl lg:text-2xl font-semibold text-slate-300 mt-2">
              Complete Technical Reference &mdash; Models, Specifications &amp; Parts Guide
            </span>
          </h1>

          <p className="text-slate-300 text-lg leading-relaxed max-w-3xl">
            Everything you need to know about the Siemens Type RL low voltage power circuit breaker (LVPCB)
            &mdash; from model identification and catalog number structure to trip unit selection, sensor
            configurations, and parts sourcing.
          </p>
        </div>
      </section>

      {/* ═══════════════ CONTENT ═══════════════ */}
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* ── Overview ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">What Is the RL Breaker?</h2>
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>
              The <strong>Siemens Type RL</strong> is a low voltage power circuit breaker (LVPCB) in drawout
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
              Siemens discontinued the RL product line and closed the Wendell, NC manufacturing facility. In 2023,
              Voyten Electric purchased all remaining RL and LA breaker inventory &mdash; including breakers,
              Static Trip III units, drawings, tooling, and vendor relationships &mdash; directly from Siemens.
              For new installations, Siemens offers the <strong>WL series</strong> air circuit breaker as the
              current-production successor, though the WL uses a different frame geometry and is not a
              drop-in replacement for existing RL switchgear.
            </p>
          </div>
        </section>

        {/* ── Model Lineup ── */}
        <section className="mb-14">
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
        </section>

        {/* ── Interrupting & Short-Time Ratings ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Interrupting &amp; Short-Time Ratings</h2>
          <div className="text-slate-700 leading-relaxed space-y-4 mb-6">
            <p>
              All ratings are in <strong>kA RMS symmetrical</strong> per UL 1066 / IEEE C37.50. The values
              below reflect ratings at maximum design voltage per Siemens SG-3061 / SG-3068.
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
            Sources: Siemens SG-3061 / SG-3068. Consult breaker nameplate for application-specific voltage ratings.
          </p>
        </section>

        {/* ── Catalog Number Structure ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Catalog Number Structure</h2>
          <div className="text-slate-700 leading-relaxed space-y-4 mb-6">
            <p>
              Every RL breaker is identified by a structured catalog number beginning with the <strong>RL</strong> prefix.
              Each position encodes a specific configuration parameter:
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 lg:p-8 mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              RL<span className="text-[#dc2626]">[1]</span><span className="text-blue-600">[2]</span><span className="text-emerald-600">[3]</span><span className="text-amber-600">[4]</span><span className="text-purple-600">[5-6]</span><span className="text-pink-600">[7]</span><span className="text-cyan-600">[8]</span><span className="text-orange-600">[9]</span><span className="text-indigo-600">[10-11]</span><span className="text-rose-600">[12]</span>
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="font-mono font-bold text-[#dc2626] w-10 flex-shrink-0">Pos 1</span>
                <div>
                  <p className="font-semibold text-slate-900">Connection</p>
                  <p className="text-slate-500">A = Drawout, B = Stationary</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono font-bold text-blue-600 w-10 flex-shrink-0">Pos 2</span>
                <div>
                  <p className="font-semibold text-slate-900">Interrupting Type</p>
                  <p className="text-slate-500">S = Standard, E = Economical, I = Integrally Fused, F = Fully Rated</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono font-bold text-emerald-600 w-10 flex-shrink-0">Pos 3</span>
                <div>
                  <p className="font-semibold text-slate-900">Frame Size</p>
                  <p className="text-slate-500">0 = 800A, 1 = 1600A, 2 = 2000A, 3 = 3200A, 4 = 4000A, 5 = 5000A</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono font-bold text-amber-600 w-10 flex-shrink-0">Pos 4</span>
                <div>
                  <p className="font-semibold text-slate-900">Operation</p>
                  <p className="text-slate-500">M = Manual, E = Electric/Manual (60Hz)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono font-bold text-purple-600 w-10 flex-shrink-0">5&ndash;6</span>
                <div>
                  <p className="font-semibold text-slate-900">Tripping Sensor</p>
                  <p className="text-slate-500">2-char code (e.g., AG = 800/.5, AJ = 2000/.5)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono font-bold text-pink-600 w-10 flex-shrink-0">Pos 7</span>
                <div>
                  <p className="font-semibold text-slate-900">Current Limiting Fuses</p>
                  <p className="text-slate-500">A&ndash;N = fuse rating, S = special, X = unfused</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono font-bold text-cyan-600 w-10 flex-shrink-0">Pos 8</span>
                <div>
                  <p className="font-semibold text-slate-900">Control Voltage</p>
                  <p className="text-slate-500">A&ndash;Z = voltage configuration (26 codes)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono font-bold text-orange-600 w-10 flex-shrink-0">Pos 9</span>
                <div>
                  <p className="font-semibold text-slate-900">System Wiring</p>
                  <p className="text-slate-500">A&ndash;J = 3-wire/4-wire configuration</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono font-bold text-indigo-600 w-10 flex-shrink-0">10&ndash;11</span>
                <div>
                  <p className="font-semibold text-slate-900">Trip Unit Code</p>
                  <p className="text-slate-500">04&ndash;56 = Static Trip III, 58/59 = AC Pro II</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono font-bold text-rose-600 w-10 flex-shrink-0">Pos 12</span>
                <div>
                  <p className="font-semibold text-slate-900">Additional Auxiliary Contacts</p>
                  <p className="text-slate-500">A&ndash;E = contact config, X = standard only</p>
                </div>
              </div>
            </div>
          </div>

          {/* Suffix accessories */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
            <h4 className="font-bold text-slate-900 mb-3">Dash-Suffix Accessories</h4>
            <p className="text-sm text-slate-600 mb-3">
              Codes after a dash (&ldquo;-&rdquo;) indicate factory-installed accessories:
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
              <div><span className="font-mono font-semibold text-slate-700">B1–D8</span> <span className="text-slate-500">Bell Alarm contacts (17 variants)</span></div>
              <div><span className="font-mono font-semibold text-slate-700">T1–T6</span> <span className="text-slate-500">Dual Shunt Trip (unfused only)</span></div>
              <div><span className="font-mono font-semibold text-slate-700">U2–U9</span> <span className="text-slate-500">Undervoltage Trip Device</span></div>
              <div><span className="font-mono font-semibold text-slate-700">M1–M3</span> <span className="text-slate-500">Electro-Mechanical Interlock</span></div>
              <div><span className="font-mono font-semibold text-slate-700">W1–W9</span> <span className="text-slate-500">E.O. Breaker Wiring Circuits</span></div>
              <div><span className="font-mono font-semibold text-slate-700">F1–F4</span> <span className="text-slate-500">Special Fuses (Shawmut, etc.)</span></div>
            </div>
          </div>
        </section>

        {/* ── Static Trip III ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Static Trip III Trip Unit</h2>
          <div className="text-slate-700 leading-relaxed space-y-4 mb-6">
            <p>
              All RL breakers use the <strong>Siemens Static Trip III</strong> electronic trip unit for adjustable
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
        </section>

        {/* ── Sensor Configurations ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Sensor Configurations</h2>
          <div className="text-slate-700 leading-relaxed space-y-4 mb-6">
            <p>
              RL breakers use current transformer (CT) sensors with a /.5 secondary output. The sensor code
              occupies positions 5&ndash;6 of the catalog number. Sensor availability is frame-dependent &mdash;
              larger sensors physically require larger frames.
            </p>
          </div>

          {/* Single-wound sensors */}
          <h3 className="text-lg font-bold text-slate-900 mb-3">Single-Wound Sensors</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-3 font-bold text-slate-900">Code</th>
                  <th className="text-left p-3 font-bold text-slate-900">Rating</th>
                  <th className="text-left p-3 font-bold text-slate-900">Compatible Frames</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">AA</td><td className="p-3">80/.5</td><td className="p-3">800A, 1600A, 2000A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">AB</td><td className="p-3">150/.5</td><td className="p-3">800A, 1600A, 2000A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">AC</td><td className="p-3">200/.5</td><td className="p-3">800A, 1600A, 2000A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">AD</td><td className="p-3">300/.5</td><td className="p-3">800A, 1600A, 2000A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">AE</td><td className="p-3">400/.5</td><td className="p-3">800A, 1600A, 2000A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">AF</td><td className="p-3">600/.5</td><td className="p-3">800A, 1600A, 2000A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">AG</td><td className="p-3">800/.5</td><td className="p-3">800A, 1600A, 2000A, 3200A, 4000A, 5000A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">AH</td><td className="p-3">1200/.5</td><td className="p-3">1600A, 2000A, 3200A, 4000A, 5000A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">AI</td><td className="p-3">1600/.5</td><td className="p-3">1600A, 2000A, 3200A, 4000A, 5000A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">AJ</td><td className="p-3">2000/.5</td><td className="p-3">2000A, 3200A, 4000A, 5000A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">AK</td><td className="p-3">2400/.5</td><td className="p-3">3200A, 4000A, 5000A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">AL</td><td className="p-3">3000/.5</td><td className="p-3">3200A, 4000A, 5000A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">AM</td><td className="p-3">3200/.5</td><td className="p-3">3200A, 4000A, 5000A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">AN</td><td className="p-3">4000/.5</td><td className="p-3">4000A, 5000A</td></tr>
                <tr><td className="p-3 font-mono font-semibold">AO</td><td className="p-3">5000/.5</td><td className="p-3">5000A</td></tr>
              </tbody>
            </table>
          </div>

          {/* Dual-wound sensors */}
          <h3 className="text-lg font-bold text-slate-900 mb-3">Dual-Wound Sensors</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-3 font-bold text-slate-900">Code</th>
                  <th className="text-left p-3 font-bold text-slate-900">Rating</th>
                  <th className="text-left p-3 font-bold text-slate-900">Compatible Frames</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">2A</td><td className="p-3">2500/.5 Dual-Wound</td><td className="p-3">3200A, 4000A, 5000A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">2B</td><td className="p-3">3000/.5 Dual-Wound</td><td className="p-3">3200A, 4000A, 5000A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">2C</td><td className="p-3">3200/.5 Dual-Wound</td><td className="p-3">3200A, 4000A, 5000A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">2D</td><td className="p-3">4000/.5 Dual-Wound</td><td className="p-3">4000A, 5000A</td></tr>
                <tr><td className="p-3 font-mono font-semibold">2E</td><td className="p-3">5000/.5 Dual-Wound</td><td className="p-3">5000A</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Dual-wound sensors provide enhanced ground fault sensitivity on large frames. The ground fault
            protection pickup is limited to <strong>1200A maximum per NEC 230.95</strong> for solidly-grounded
            wye services, regardless of the sensor&apos;s primary current rating.
            Sensor code XX = Non-Automatic (no tripping sensor installed).
          </p>
        </section>

        {/* ── Control Voltage ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Control Voltage Options</h2>
          <div className="text-slate-700 leading-relaxed space-y-4 mb-6">
            <p>
              Position 8 of the catalog number specifies the control voltage. Electric-operated (EO) breakers
              use the voltage for motor/close and trip circuits. Manual-operated (MO) breakers use it for
              trip and shunt only. There are <strong>26 voltage codes</strong> (A&ndash;Z).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-3 font-bold text-slate-900">Code</th>
                  <th className="text-left p-3 font-bold text-slate-900">Electric-Operated (EO)</th>
                  <th className="text-left p-3 font-bold text-slate-900">Manual-Operated (MO)</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">A</td><td className="p-3">48VDC Motor/Close, 48VDC Trip/Shunt</td><td className="p-3">48VDC Trip/Shunt</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">B</td><td className="p-3">120VAC Motor/Close, 120VAC Trip/Shunt</td><td className="p-3">120VAC Trip/Shunt</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">C</td><td className="p-3">125VDC Motor/Close, 125VDC Trip/Shunt</td><td className="p-3">125VDC Trip/Shunt</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">D</td><td className="p-3">240VAC Motor/Close, 240VAC Trip/Shunt</td><td className="p-3">240VAC Trip/Shunt</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">E</td><td className="p-3">250VDC Motor/Close, 250VDC Trip/Shunt</td><td className="p-3">250VDC Trip/Shunt</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">F</td><td className="p-3">120VAC Motor/Close, 48VDC Trip</td><td className="p-3 text-slate-400">&mdash;</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">G</td><td className="p-3">120VAC Motor/Close, 125VDC Trip/Shunt</td><td className="p-3 text-slate-400">&mdash;</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">H</td><td className="p-3">240VAC Motor/Close, 48VDC Trip</td><td className="p-3 text-slate-400">&mdash;</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">I</td><td className="p-3">240VAC Motor/Close, 125VDC Trip/Shunt</td><td className="p-3 text-slate-400">&mdash;</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">J</td><td className="p-3">24VDC Motor/Close, 24VDC Trip/Shunt</td><td className="p-3">24VDC Trip/Shunt</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">K</td><td className="p-3">48VDC Motor/Close, 24VDC Trip</td><td className="p-3">24VDC Trip</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">L</td><td className="p-3">120VAC Motor/Close, 24VDC Trip</td><td className="p-3">24VDC Trip, 65VAC/28VDC Shunt</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">M</td><td className="p-3">120VAC Motor/Close, 32VDC Trip</td><td className="p-3">32VDC Trip</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">N</td><td className="p-3">120VAC Motor/Close, 5VAC Trip</td><td className="p-3 text-slate-400">&mdash;</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">O</td><td className="p-3">125VDC Motor/Close, 28VDC Trip</td><td className="p-3 text-slate-400">&mdash;</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">P</td><td className="p-3">125VDC Motor/Close, 28VDC Trip</td><td className="p-3">125VDC Trip, 28VDC Shunt</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">Q</td><td className="p-3">125VDC Motor/Close, 48VDC Trip</td><td className="p-3">125VDC Trip, 48VDC Shunt</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">R</td><td className="p-3">125VDC Motor/Close, 120VAC Trip</td><td className="p-3">125VDC Trip, 120VAC Shunt</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">S</td><td className="p-3">250VDC Motor/Close, 48VDC Trip</td><td className="p-3">250VDC Trip, 48VDC Shunt</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">T</td><td className="p-3">24VDC Motor/Close, 24VDC Trip</td><td className="p-3">24VDC Trip, 24VDC Shunt</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">U</td><td className="p-3">240VAC Motor/Close, 120VAC Trip</td><td className="p-3">240VAC Trip, 120VAC Shunt</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">V</td><td className="p-3">240VAC Motor/Close, 48VDC Trip</td><td className="p-3">240VAC Trip, 48VDC Shunt</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">W</td><td className="p-3">120VAC Motor/Close, 120VAC Trip</td><td className="p-3 text-slate-400">&mdash;</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">Y</td><td className="p-3">120VAC Motor/Close, 125VDC Trip</td><td className="p-3 text-slate-400">&mdash;</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">Z</td><td className="p-3">24VDC Motor/Close, 48VDC Trip</td><td className="p-3">48VDC Trip, 48VDC Shunt</td></tr>
                <tr><td className="p-3 font-mono font-semibold">X</td><td className="p-3 text-slate-400">Not Required</td><td className="p-3 text-slate-400">Not Required</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Codes F, G, H, I, N, O, W, Y are EO-only configurations (no MO equivalent). Most common: B (120VAC), C (125VDC), G (120VAC motor / 125VDC trip).
          </p>
        </section>

        {/* ── System Wiring ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">System Wiring Configurations</h2>
          <div className="text-slate-700 leading-relaxed mb-6">
            <p>
              Position 9 specifies the 3-phase system wiring and ground fault sensing method:
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-3 font-bold text-slate-900">Code</th>
                  <th className="text-left p-3 font-bold text-slate-900">Configuration</th>
                  <th className="text-left p-3 font-bold text-slate-900">Wiring Diagram</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">A</td><td className="p-3">3-Wire</td><td className="p-3">FIG 1A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">B</td><td className="p-3">3-Wire, Ground Fault</td><td className="p-3">FIG 1A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">C</td><td className="p-3">3-Wire, Ground Fault + NEC</td><td className="p-3">FIG 1C</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">D</td><td className="p-3">4-Wire, Residual Ground</td><td className="p-3">&mdash;</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">E</td><td className="p-3">4-Wire, Residual Ground + NEC</td><td className="p-3">FIG 1E</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">F</td><td className="p-3">4-Wire</td><td className="p-3">FIG 1F</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">G</td><td className="p-3">4-Wire, Residual + Neutral</td><td className="p-3">FIG 1B</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">H</td><td className="p-3">4-Wire, Residual + NEC + Neutral</td><td className="p-3">FIG 20A</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">I</td><td className="p-3">4-Wire, Direct Ground + Neutral</td><td className="p-3">FIG 20B</td></tr>
                <tr><td className="p-3 font-mono font-semibold">J</td><td className="p-3">4-Wire</td><td className="p-3">FIG 3A</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Wiring diagram figures reference the Siemens RL Wiring Diagrams &amp; Control Power Manual (SGIM-3068D / SG-3169).
          </p>
        </section>

        {/* ── Variant Restrictions ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Variant Restrictions &amp; Compatibility</h2>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 lg:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-[#dc2626]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap size={24} className="text-[#dc2626]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Key Configuration Constraints</h3>
                <p className="text-sm text-slate-500 mt-1">Per Siemens catalog selection diagram</p>
              </div>
            </div>
            <div className="space-y-4 text-slate-700">
              <div className="flex items-start gap-3">
                <Shield size={16} className="text-[#dc2626] flex-shrink-0 mt-1" />
                <p><strong>RLF (Fully Rated)</strong> &mdash; Available in <strong>drawout (A) connection only</strong>. Not available in stationary (B) mount.</p>
              </div>
              <div className="flex items-start gap-3">
                <Shield size={16} className="text-[#dc2626] flex-shrink-0 mt-1" />
                <p><strong>RLI (Integrally Fused)</strong> &mdash; Available in <strong>800A frame (code 0) only</strong>. Includes integral current-limiting fuses.</p>
              </div>
              <div className="flex items-start gap-3">
                <Shield size={16} className="text-[#dc2626] flex-shrink-0 mt-1" />
                <p><strong>RLE (Economical)</strong> &mdash; Available in frames <strong>800A through 4000A</strong> (codes 0&ndash;4). Not available in the 5000A frame.</p>
              </div>
              <div className="flex items-start gap-3">
                <Shield size={16} className="text-[#dc2626] flex-shrink-0 mt-1" />
                <p><strong>Dual-wound sensors</strong> &mdash; Ground fault protection pickup limited to <strong>1200A maximum per NEC 230.95</strong> for solidly-grounded wye services. Available only in frames 3200A and above (codes 3&ndash;5).</p>
              </div>
              <div className="flex items-start gap-3">
                <Shield size={16} className="text-[#dc2626] flex-shrink-0 mt-1" />
                <p><strong>Dual shunt trip (T1&ndash;T6)</strong> &mdash; Available on <strong>unfused breakers only</strong> (fuse code X).</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Brand History ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Product History &amp; Successor</h2>
          <div className="text-slate-700 leading-relaxed space-y-4">
            <p>
              Unlike the SPB breaker (which transitioned across Westinghouse, Cutler-Hammer, and Eaton branding),
              the Type RL was manufactured exclusively under the <strong>Siemens</strong> name throughout its
              entire production life at the Wendell, NC facility.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Siemens Type RL</p>
                <p className="text-sm text-slate-500">Original &amp; sole manufacturer</p>
                <p className="text-xs text-slate-400 mt-2">Production: Wendell, NC facility</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Siemens WL Series</p>
                <p className="text-sm text-slate-500">Current-production successor</p>
                <p className="text-xs text-slate-400 mt-2">Different frame geometry; not a drop-in replacement</p>
              </div>
            </div>
            <p>
              After Siemens discontinued the RL and closed the Wendell facility, Voyten Electric acquired the
              complete remaining inventory. All RL parts are interchangeable regardless of production date.
              The companion <strong>Type LA</strong> air circuit breaker (600A&ndash;3000A) shares the same
              Siemens origin and parts compatibility across its full production run.
            </p>
          </div>
        </section>

        {/* ── Technical Documentation ── */}
        <section className="mb-14">
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
                  <td className="p-3 font-mono">SG-3169</td>
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
            <Link href="/search?manufacturer=Siemens&subcategory=Insulated+Case+Breakers" className="text-[#dc2626] hover:text-[#b91c1c] font-medium">
              View all Siemens RL manuals &rarr;
            </Link>
          </p>
        </section>

        {/* ── Renewal Parts Categories ── */}
        <section className="mb-14">
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
        </section>

        {/* ── Sourcing CTA ── */}
        <section className="mb-14">
          <div className="bg-[#dc2626] rounded-2xl p-8 lg:p-10 text-center text-white">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Need RL Parts or Technical Support?</h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Voyten Electric is the exclusive worldwide source for the complete Siemens RL product line.
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
              Mon&ndash;Fri 8:00 AM &ndash; 4:30 PM EST | sales@voyten.com
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
