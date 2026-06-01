import Link from 'next/link';
import type { Metadata } from 'next';
import { Phone, ChevronRight, BookOpen, Zap, Shield, ArrowRight } from 'lucide-react';

export const revalidate = 3600;

// ── SEO Metadata ──

export const metadata: Metadata = {
  title: 'Eaton SPB Systems Pow-R Breaker Guide — Complete Technical Reference | Voyten',
  description:
    'Comprehensive technical guide for Eaton/Cutler-Hammer/Westinghouse Type SPB (Systems Pow-R) circuit breakers. Covers all models (SPB-50, SPB-65, SPB-100, SPB-150), frame sizes 800–5000A, trip units (Digitrip RMS, Pow-R Trip 7), upgrade paths, and renewal parts. From Voyten Electric — your exclusive authorized SPB source.',
  keywords: [
    'SPB breaker guide', 'Systems Pow-R Breaker reference', 'SPB technical guide',
    'SPB-50 vs SPB-100', 'SPB upgrade path', 'SPB breaker specifications',
    'Digitrip RMS trip unit', 'Pow-R Trip 7', 'SPB rating plug',
    'SPB interrupting rating', 'SPB frame sizes', 'SPB renewal parts guide',
    'Eaton SPB', 'Cutler-Hammer SPB', 'Westinghouse SPB',
    'SPBSR', 'SPBR', 'SPBHR', 'SPBN', 'SPBNH',
    'insulated case circuit breaker guide', 'ICCB reference',
    'Voyten Electric', 'SPBBreakers.com',
  ],
  openGraph: {
    title: 'Eaton SPB Systems Pow-R Breaker — Complete Technical Reference',
    description:
      'Definitive guide to Eaton/Cutler-Hammer/Westinghouse SPB breakers: models, specifications, trip units, upgrade paths, and parts sourcing. By Voyten Electric.',
    url: 'https://www.voytenmanuals.com/resources/spb-breakers',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eaton SPB Breaker Guide — Voyten Electric',
    description: 'Complete technical reference for SPB Systems Pow-R breakers: all models, specs, trip units, and parts.',
  },
  alternates: {
    canonical: 'https://www.voytenmanuals.com/resources/spb-breakers',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ── Page ──

export default function SPBBreakersGuide() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Eaton SPB Systems Pow-R Breaker — Complete Technical Reference',
    description: metadata.description,
    url: 'https://www.voytenmanuals.com/resources/spb-breakers',
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
    datePublished: '2026-05-29',
    dateModified: '2026-05-29',
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
      { '@type': 'ListItem', position: 2, name: 'SPB Breakers', item: 'https://www.voytenmanuals.com/products/spb-breakers' },
      { '@type': 'ListItem', position: 3, name: 'Technical Reference Guide' },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the difference between SPB-50, SPB-65, SPB-100, and SPB-150?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The SPB-50 (50 kA), SPB-65 (65 kA), SPB-100 (100 kA), and SPB-150 (150 kA) differ only in interrupting capacity at 480V. The SPB-50, SPB-65, and SPB-100 are electrically and mechanically identical in external dimensions — the higher interrupting capability comes from internal component differences (arc chutes, contacts). The SPB-150 uses a larger frame. This means an SPB-100 is a direct drop-in replacement for an SPB-50 or SPB-65 with no cubicle modifications required.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the SPB breaker catalog number prefixes and what do they mean?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'SPB catalog numbers use prefixes that indicate the breaker configuration: SR/R = standard breaker, MR = motor-operated, HR = high-interrupting (150 kA), WR = wide-frame, WHR = wide high-interrupting, N = non-automatic switch, NH = non-automatic high-withstand. The "M" prefix variants (e.g., MSR) indicate metric construction. The full catalog number encodes frame size, trip unit type, sensor rating, and factory-installed accessories.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is an SPB edge number and how do I read it?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The SPB edge number is a 30-digit code stamped on the breaker frame edge. Positions 1–10 encode the Westinghouse-era style number (e.g., 8702C## for newer Eaton, 7805C## for older Westinghouse). Positions 11–30 are a 20-digit option code covering 13 fields: mounting type, connection method, trip unit, sensor rating, shunt trip voltage, undervoltage release, auxiliary switches, motor operator, and other factory-installed options. The edge number is the definitive identifier for ordering exact replacement parts.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which Digitrip RMS trip units are compatible with SPB breakers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'SPB breakers are compatible with the full Digitrip RMS family: RMS 210 (basic LI protection), RMS 310 (LSI + metering), RMS 510 (LSIG + zone interlocking), RMS 610 (advanced metering + communications), RMS 810 (full protection suite), and RMS 910 (top-tier with power quality monitoring). The current-production equivalent is the Pow-R Trip 7. All trip units require a matching rating plug sized to the breaker frame and sensor. Voyten stocks all models and rating plugs.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I identify my SPB breaker model and order replacement parts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'To identify your SPB breaker: (1) Locate the nameplate on the breaker front — it shows the catalog number, style number, and frame/trip ratings. (2) Check the edge number stamped on the breaker frame for detailed configuration. (3) Note the trip unit model (visible on the trip unit face). With any of these identifiers, contact Voyten Electric at 1-800-458-4001 or visit spbbreakers.com — their team can cross-reference to the exact renewal parts needed.',
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
            <Link href="/products/spb-breakers" className="hover:text-white transition-colors">SPB Breakers</Link>
            <ChevronRight size={14} />
            <span className="text-white">Technical Reference</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-[#dc2626] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <BookOpen size={12} />
            Technical Reference Guide
          </div>

          <h1 className="text-3xl lg:text-5xl font-extrabold leading-tight mb-4">
            Eaton Type <span className="text-[#dc2626]">SPB</span> Systems Pow-R Breaker
            <span className="block text-xl lg:text-2xl font-semibold text-slate-300 mt-2">
              Complete Technical Reference — Models, Specifications &amp; Parts Guide
            </span>
          </h1>

          <p className="text-slate-300 text-lg leading-relaxed max-w-3xl">
            Everything you need to know about the Eaton/Cutler-Hammer/Westinghouse Type SPB insulated case
            circuit breaker — from model identification and specifications to trip unit selection, upgrade paths,
            and parts sourcing.
          </p>
        </div>
      </section>

      {/* ═══════════════ CONTENT ═══════════════ */}
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* ── Overview ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">What Is the SPB Breaker?</h2>
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>
              The <strong>Type SPB (Systems Pow-R Breaker)</strong> is a low voltage insulated case circuit breaker
              (ICCB) manufactured continuously since 1976. It is one of the most widely deployed ICCBs in North American
              industrial, commercial, and utility power distribution systems.
            </p>
            <p>
              The breaker has been produced under three brand names — <strong>Westinghouse</strong> (original manufacturer),
              <strong> Cutler-Hammer</strong> (after Eaton&apos;s acquisition of Westinghouse&apos;s electrical division), and
              <strong> Eaton</strong> (current branding). All three nameplates represent the same product lineage with full
              parts interchangeability.
            </p>
            <p>
              SPB breakers use <strong>drawout construction</strong>, allowing the breaker to be removed from its cubicle
              for maintenance without disconnecting power bus connections. Frame ratings span 800A to 5000A with
              interrupting capacities from 50 kA to 150 kA RMS symmetrical at 480V.
            </p>
          </div>
        </section>

        {/* ── Model Breakdown ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">SPB Model Lineup</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-3 font-bold text-slate-900">Model</th>
                  <th className="text-left p-3 font-bold text-slate-900">Designation</th>
                  <th className="text-left p-3 font-bold text-slate-900">Interrupting (480V)</th>
                  <th className="text-left p-3 font-bold text-slate-900">Frame Range</th>
                  <th className="text-left p-3 font-bold text-slate-900">Notes</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">SPB-50</td>
                  <td className="p-3">SPBSR</td>
                  <td className="p-3">50 kA</td>
                  <td className="p-3">800–3200A</td>
                  <td className="p-3 text-slate-500">Same frame as SPB-65/100</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">SPB-65</td>
                  <td className="p-3">SPBSR</td>
                  <td className="p-3">65 kA</td>
                  <td className="p-3">800–3200A</td>
                  <td className="p-3 text-slate-500">Same frame as SPB-50/100</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">SPB-100</td>
                  <td className="p-3">SPBR</td>
                  <td className="p-3">100 kA</td>
                  <td className="p-3">800–3200A</td>
                  <td className="p-3 text-slate-500">Drop-in for SPB-50/65</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">SPB-150</td>
                  <td className="p-3">SPBHR</td>
                  <td className="p-3">150 kA</td>
                  <td className="p-3">800–5000A</td>
                  <td className="p-3 text-slate-500">Larger frame</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">SPBN</td>
                  <td className="p-3">Non-automatic</td>
                  <td className="p-3">N/A</td>
                  <td className="p-3">800–5000A</td>
                  <td className="p-3 text-slate-500">Switching duty, no trip</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">SPBNH</td>
                  <td className="p-3">Non-automatic</td>
                  <td className="p-3">N/A</td>
                  <td className="p-3">800–5000A</td>
                  <td className="p-3 text-slate-500">High-withstand switch</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Upgrade Path ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">SPB-50/65 to SPB-100 Upgrade Path</h2>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 lg:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-[#dc2626]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap size={24} className="text-[#dc2626]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Drop-In 100 kA Upgrade — No Structural Modifications</h3>
                <p className="text-sm text-slate-500 mt-1">Applicable to all SPB-50 and SPB-65 installations</p>
              </div>
            </div>
            <div className="text-slate-700 leading-relaxed space-y-3">
              <p>
                The SPB-50, SPB-65, and SPB-100 are <strong>electrically and mechanically identical</strong> in external
                dimensions. The difference in interrupting rating is achieved entirely through internal components — different
                arc chutes, moving contacts, and stationary contacts.
              </p>
              <p>
                This means an SPB-100 will <strong>slide directly into an existing SPB-50 or SPB-65 cubicle</strong> with
                zero modifications to the surrounding structure, bus connections, or control wiring. For facilities whose
                available fault current has grown past the original 50 or 65 kA rating, this provides a clean,
                cost-effective upgrade to 100 kA without replacing switchgear.
              </p>
              <p className="text-sm text-slate-500 italic">
                Note: The SPB-150 uses a different (larger) frame and is not a drop-in replacement for SPB-50/65/100 cubicles.
              </p>
            </div>
          </div>
        </section>

        {/* ── Catalog Number Structure ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Catalog Number Prefixes</h2>
          <div className="text-slate-700 leading-relaxed space-y-4 mb-6">
            <p>
              SPB catalog numbers begin with a prefix that encodes the breaker type and configuration:
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-3 font-bold text-slate-900">Prefix</th>
                  <th className="text-left p-3 font-bold text-slate-900">Meaning</th>
                  <th className="text-left p-3 font-bold text-slate-900">Interrupting</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">SR / R</td><td className="p-3">Standard breaker</td><td className="p-3">50/65/100 kA</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">MR</td><td className="p-3">Motor-operated breaker</td><td className="p-3">50/65/100 kA</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">HR</td><td className="p-3">High-interrupting breaker</td><td className="p-3">150 kA</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">WR</td><td className="p-3">Wide-frame breaker</td><td className="p-3">50/65/100 kA</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">WHR</td><td className="p-3">Wide high-interrupting breaker</td><td className="p-3">150 kA</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-mono font-semibold">N</td><td className="p-3">Non-automatic switch</td><td className="p-3">N/A</td></tr>
                <tr><td className="p-3 font-mono font-semibold">NH</td><td className="p-3">Non-automatic high-withstand switch</td><td className="p-3">N/A</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            &ldquo;M&rdquo; prefix variants (MSR, MHR, etc.) indicate metric construction for IEC applications.
          </p>
        </section>

        {/* ── Edge Number ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Understanding the SPB Edge Number</h2>
          <div className="text-slate-700 leading-relaxed space-y-4">
            <p>
              Every SPB breaker has a <strong>30-digit edge number</strong> stamped on the breaker frame. This is the
              definitive identifier for ordering exact replacement parts and is more specific than the catalog number.
            </p>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2">Edge Number Structure</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>Positions 1–10:</strong> Westinghouse/Eaton style number (e.g., 8702C## for newer Eaton production, 7805C## for older Westinghouse production)</li>
                <li><strong>Positions 11–30:</strong> 20-digit option code encoding 13 configuration fields — mounting type, connection method, trip unit, sensor rating, shunt trip voltage, undervoltage release, auxiliary switches, motor operator, and other factory options</li>
              </ul>
            </div>
            <p>
              When contacting Voyten for parts, providing the edge number ensures an exact match to your breaker&apos;s
              specific configuration — including the correct mounting style, connection type, and factory-installed accessories.
            </p>
          </div>
        </section>

        {/* ── Trip Units ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Trip Units &amp; Rating Plugs</h2>
          <div className="text-slate-700 leading-relaxed space-y-4 mb-6">
            <p>
              SPB breakers use interchangeable electronic trip units that provide adjustable overcurrent protection.
              The trip unit mounts to the breaker front and connects via a rating plug sized to the breaker&apos;s sensor.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-3 font-bold text-slate-900">Trip Unit</th>
                  <th className="text-left p-3 font-bold text-slate-900">Protection</th>
                  <th className="text-left p-3 font-bold text-slate-900">Features</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100"><td className="p-3 font-semibold">Pow-R Trip 7</td><td className="p-3">LSIG</td><td className="p-3">Standard legacy trip unit</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-semibold">Digitrip RMS 910</td><td className="p-3">LSIG</td><td className="p-3">Power quality monitoring</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-semibold">Digitrip RMS 810</td><td className="p-3">LSIG</td><td className="p-3">Full protection suite</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-semibold">Digitrip RMS 610</td><td className="p-3">LSIG</td><td className="p-3">Advanced metering, communications</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-semibold">Digitrip RMS 510</td><td className="p-3">LSIG</td><td className="p-3">Ground fault, zone interlocking</td></tr>
                <tr className="border-b border-slate-100"><td className="p-3 font-semibold">Digitrip RMS 310</td><td className="p-3">LSI</td><td className="p-3">Basic metering</td></tr>
                <tr><td className="p-3 font-semibold">Digitrip RMS 210</td><td className="p-3">LI</td><td className="p-3">Basic overcurrent protection</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            L = Long-time, S = Short-time, I = Instantaneous, G = Ground fault. All trip units require a matching rating plug.
          </p>
        </section>

        {/* ── Brand History ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Brand History &amp; Nameplate Cross-Reference</h2>
          <div className="text-slate-700 leading-relaxed space-y-4">
            <p>
              The SPB breaker has been manufactured under three brand names due to corporate acquisitions.
              All three nameplates represent the <strong>same product</strong> with full parts interchangeability:
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Westinghouse</p>
                <p className="text-sm text-slate-500">Original manufacturer (1976–1994)</p>
                <p className="text-xs text-slate-400 mt-2">Style: 7805C##</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Cutler-Hammer</p>
                <p className="text-sm text-slate-500">Eaton acquisition era (1994–~2010)</p>
                <p className="text-xs text-slate-400 mt-2">Style: 8702C##</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Eaton</p>
                <p className="text-sm text-slate-500">Current branding (~2010–present)</p>
                <p className="text-xs text-slate-400 mt-2">Style: 8702C##</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Parts from any era are interchangeable. A Westinghouse-branded SPB-100 uses the same renewal parts
              as an Eaton-branded SPB-100 of the same frame size.
            </p>
          </div>
        </section>

        {/* ── Renewal Parts Categories ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Renewal Parts Categories</h2>
          <div className="text-slate-700 leading-relaxed mb-6">
            <p>
              Voyten Electric stocks the following SPB renewal part categories for immediate shipment:
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              'Trip Units & Rating Plugs',
              'Electrical Attachments',
              'Auxiliary Switches',
              'Electrical Operator Kits',
              'Gear / Motors',
              'Handles / Hub Assemblies',
              'Key Interlock Provisions',
              'Shunt Trip Kits',
              'Spring Release Kits (400–5000A)',
              'Terminals / Drawout Stabs',
              'Undervoltage Release Devices',
              'Breaker Covers',
            ].map(part => (
              <div key={part} className="flex items-center gap-3 bg-slate-50 rounded-lg border border-slate-200 p-3">
                <Shield size={14} className="text-[#dc2626] flex-shrink-0" />
                <p className="text-sm font-medium text-slate-900">{part}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Sourcing ── */}
        <section className="mb-14">
          <div className="bg-[#dc2626] rounded-2xl p-8 lg:p-10 text-center text-white">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Need SPB Parts or Technical Support?</h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Voyten Electric is the exclusive authorized aftermarket source for the complete SPB product line.
              New and reconditioned breakers, trip units, rating plugs, and every renewal part — tested, in stock,
              and backed by 1 year warranty.
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
              Mon–Fri 8:00 AM – 4:30 PM EST | Emergency support available | sales@voyten.com
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
