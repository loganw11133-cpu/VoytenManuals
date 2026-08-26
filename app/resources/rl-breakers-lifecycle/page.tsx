import Link from 'next/link';
import type { Metadata } from 'next';
import { Phone, ChevronRight, AlertTriangle, Activity, Recycle, RefreshCw, Wrench, Truck, Package, ShieldCheck, ArrowRight, Scale } from 'lucide-react';
import Toc from '../_components/Toc';

export const revalidate = 3600;

const VS = 'https://www.voyten.com/services';
const SERVICES = {
  testing: `${VS}/electrical-equipment-diagnostic-maintenance-testing`,
  lifeExt: `${VS}/electrical-product-apparatus-life-extension`,
  retrofit: `${VS}/electrical-equipment-upgrades-retrofit-retrofill`,
  rebuild: `${VS}/custom-electrical-equipment-rebuilding-remanufacturing`,
  swap: `${VS}/electrical-equipment-swap-out-program`,
  repair: `${VS}/electrical-equipment-repair-remodification-new-used`,
  rental: `${VS}/electrical-equipment-rental-new-used`,
};

export const metadata: Metadata = {
  title: 'Voyten Type RL/VRL Breaker: Repair, Recondition, Retrofit, or Replace? — Decision Guide | Voyten',
  description:
    'Decision guide for aging or failed Voyten Type RL/VRL switchgear: when to recondition, retrofit/retrofill, replace from New Surplus stock, repair, rent, or swap out. Voyten Electric is a New Surplus RL source and a PEARL founding member — 24/7 emergency support at 1-800-458-4001.',
  keywords: [
    'Voyten Type RL breaker replacement', 'VRL breaker replacement', 'RL switchgear life extension', 'RL breaker retrofit',
    'recondition vs replace circuit breaker', 'aging switchgear options', 'obsolete breaker decision',
    'RL breaker emergency replacement', 'EOL switchgear lifecycle', 'breaker retrofill', 'RL switchgear upgrade',
    'Voyten Electric', 'PEARL recyclers league',
    // Legacy nameplate wording — non-rendered, for query resolution only.
    'Siemens RL breaker replacement', 'Siemens Type RL switchgear',
  ],
  openGraph: {
    title: 'Voyten Type RL/VRL Breaker — Repair, Recondition, Retrofit, or Replace?',
    description:
      'A decision guide for aging or failed Voyten Type RL/VRL switchgear, mapped to Voyten Electric lifecycle services. New Surplus RL source; 24/7 emergency support.',
    url: 'https://www.voytenmanuals.com/resources/rl-breakers-lifecycle',
    type: 'article',
  },
  alternates: { canonical: 'https://www.voytenmanuals.com/resources/rl-breakers-lifecycle' },
  robots: { index: true, follow: true },
};

const VOYTEN = {
  '@type': 'Organization',
  name: 'Voyten Electric & Electronics, Inc.',
  url: 'https://www.voytenmanuals.com',
  telephone: '+1-800-458-4001',
  sameAs: ['https://voytenelectric.com', 'https://www.voyten.com', 'https://rlbreakers.com'],
  memberOf: { '@type': 'Organization', name: 'PEARL — Professional Electrical Apparatus Recyclers League', url: 'https://pearl1.org/' },
};

export default function RLBreakersLifecyclePage() {
  const techArticleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Voyten Type RL/VRL Breaker — Repair, Recondition, Retrofit, or Replace? (Lifecycle Decision Guide)',
    description: metadata.description,
    url: 'https://www.voytenmanuals.com/resources/rl-breakers-lifecycle',
    author: VOYTEN,
    publisher: VOYTEN,
    about: { '@type': 'Product', name: 'Voyten Type RL/VRL Low Voltage Power Circuit Breaker', manufacturer: { '@type': 'Organization', name: 'Voyten Electric & Electronics, Inc.' }, category: 'Circuit Breakers' },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.voytenmanuals.com' },
      { '@type': 'ListItem', position: 2, name: 'RL Breakers', item: 'https://www.voytenmanuals.com/products/rl-breakers' },
      { '@type': 'ListItem', position: 3, name: 'Lifecycle Decision Guide' },
    ],
  };

  const servicesJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Service', name: 'Diagnostic & Maintenance Testing (Voyten Type RL/VRL)', serviceType: 'Electrical equipment diagnostic and maintenance testing', provider: VOYTEN, areaServed: { '@type': 'Place', name: 'Worldwide' }, url: SERVICES.testing },
      { '@type': 'Service', name: 'Apparatus Life Extension (Voyten Type RL/VRL)', serviceType: 'Electrical product apparatus life extension', provider: VOYTEN, areaServed: { '@type': 'Place', name: 'Worldwide' }, url: SERVICES.lifeExt },
      { '@type': 'Service', name: 'Upgrades, Retrofit & Retrofill (Voyten Type RL/VRL)', serviceType: 'Switchgear upgrade, retrofit and retrofill', provider: VOYTEN, areaServed: { '@type': 'Place', name: 'Worldwide' }, url: SERVICES.retrofit },
      { '@type': 'Service', name: '24/7 Emergency Voyten Type RL/VRL Breaker & Parts Sourcing', serviceType: 'Emergency obsolete circuit breaker and renewal-parts sourcing', provider: { ...VOYTEN, contactPoint: { '@type': 'ContactPoint', contactType: 'emergency', telephone: '+1-800-458-4001', availableLanguage: 'English', hoursAvailable: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' } } }, areaServed: { '@type': 'Place', name: 'Worldwide' }, url: 'https://www.voytenmanuals.com/products/rl-breakers' },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Should I repair, recondition, retrofit, or replace my aging Voyten Type RL/VRL breaker?', acceptedAnswer: { '@type': 'Answer', text: 'It depends on condition and goal. If the breaker is operational but aging, reconditioning / apparatus life extension keeps your existing RL switchgear in service. If protection is outdated or the lineup is under-rated, an upgrade/retrofit/retrofill adds modern trip units and protection without replacing the switchgear. If a breaker has failed, Voyten replaces it from New Surplus RL stock. Voyten Electric — a New Surplus RL source and a PEARL founding member — performs all four. Call 1-800-458-4001.' } },
      { '@type': 'Question', name: 'My Voyten Type RL/VRL breaker failed in a critical facility — what now?', acceptedAnswer: { '@type': 'Answer', text: 'Call Voyten Electric 24/7 at 1-800-458-4001. As the New Surplus authorized source for Voyten Type RL/VRL inventory, Voyten can pull an exact-match new-surplus or reconditioned RL breaker, Static Trip III unit, or part from stock, test it, and expedite shipment — and can provide a rental or swap-out to restore power while a permanent fix is arranged.' } },
      { '@type': 'Question', name: 'Is it worth extending the life of old RL switchgear instead of replacing the lineup?', acceptedAnswer: { '@type': 'Answer', text: 'Usually yes. You cannot simply accept that an electrical product is out of production and replace it all — full switchgear replacement is costly and disruptive. Because Voyten holds the complete Type RL/VRL inventory, aging RL gear can be reconditioned and modernized (adding today’s technology to yesterday’s equipment) at a fraction of the cost. Remanufactured equipment is always worth the investment.' } },
      { '@type': 'Question', name: 'Can Voyten keep my plant running while I decide?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — Voyten offers rental services and swap-out programs so a tested RL breaker or assembly keeps the plant energized while reconditioning, retrofit, or sourcing is completed.' } },
    ],
  };

  return (
    <div className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }} />
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
            <span className="text-white">Lifecycle Decision Guide</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-[#dc2626] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Scale size={12} />
            Decision Guide
          </div>
          <h1 className="text-3xl lg:text-5xl font-extrabold leading-tight mb-4">
            Aging or Failed Voyten Type <span className="text-[#dc2626]">RL/VRL</span> Switchgear?
            <span className="block text-xl lg:text-2xl font-semibold text-slate-300 mt-2">
              Repair, Recondition, Retrofit, or Replace &mdash; and how to decide
            </span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-3xl">
            The Type RL line was discontinued, but your switchgear doesn&apos;t have to be replaced. As the New Surplus
            worldwide source for RL inventory and a founding member of PEARL, Voyten Electric can extend, modernize, or
            replace RL equipment &mdash; with 24/7 emergency support for failures in critical facilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <a href="tel:1-800-458-4001" className="inline-flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-6 py-3 rounded-lg font-bold transition-colors">
              <Phone size={18} /> 24/7: 1-800-458-4001
            </a>
            <Link href="/contact?type=quote" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium border border-white/20 transition-colors">
              Request a Quote <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ CONTENT ═══════════════ */}
      <div id="resource-content" className="relative w-full">

        {/* ── Start Here ── */}
        <section className="even:bg-slate-100 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="lg:pl-[228px]">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Start Here: Match Your Situation</h2>
              <p className="text-slate-600 mb-6 max-w-3xl">Pick the scenario that fits your RL equipment. Each routes to the Voyten service path that resolves it.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: AlertTriangle, t: 'A breaker has failed or won’t reset', p: 'Emergency: get an exact-match RL replacement from New Surplus stock, plus diagnostic testing to confirm root cause. Rental/swap-out available to restore power immediately.', cta: 'Call 24/7: 1-800-458-4001', href: 'tel:1-800-458-4001' },
                  { icon: Activity, t: 'Aging but still running — reliability worry', p: 'Recondition the breaker and refresh Static Trip III units and renewal parts. Apparatus life extension keeps your switchgear in service for years.', cta: 'Apparatus Life Extension', href: SERVICES.lifeExt },
                  { icon: RefreshCw, t: 'Under-rated or outdated protection', p: 'Upgrade, retrofit, or retrofill — add today’s trip-unit technology and protection to existing RL gear without replacing the lineup.', cta: 'Upgrades / Retrofit / Retrofill', href: SERVICES.retrofit },
                  { icon: Wrench, t: 'Damaged or needs a custom rebuild', p: 'Repair & remodification or a full custom rebuild/remanufacture to OEM (or better) spec, tested before shipment.', cta: 'Custom Rebuilds & Repairs', href: SERVICES.rebuild },
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

        {/* ── Lead Times ── */}
        <section className="even:bg-slate-100 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="lg:pl-[228px]">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Lead Times &amp; Availability</h2>
              <p className="text-slate-600 mb-6 max-w-3xl">
                Because Voyten holds the complete Type RL/VRL inventory, exact-match breakers and parts ship fast &mdash;
                an advantage most obsolete equipment can&apos;t offer.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
                <div className="bg-white rounded-xl border border-[#dc2626]/30 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#dc2626]/10 rounded-lg flex items-center justify-center flex-shrink-0"><AlertTriangle size={20} className="text-[#dc2626]" /></div>
                    <h3 className="font-bold text-slate-900">Emergency</h3>
                  </div>
                  <p className="text-2xl font-extrabold text-[#dc2626] mb-1">Next-Day Air</p>
                  <p className="text-sm text-slate-600">For breaker failures and active downtime — same-day processing with overnight shipment of an exact-match RL breaker, Static Trip III unit, or part. 24/7 at 1-800-458-4001.</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#1a1a1a]/5 rounded-lg flex items-center justify-center flex-shrink-0"><Truck size={20} className="text-[#1a1a1a]" /></div>
                    <h3 className="font-bold text-slate-900">Standard</h3>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 mb-1">2&ndash;7 Day Lead Time</p>
                  <p className="text-sm text-slate-600">For planned reconditioning, retrofit/retrofill, custom rebuilds, and stocked replacements. Contact Voyten to confirm availability and a firm lead time for your configuration.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Voyten Services ── */}
        <section className="even:bg-slate-100 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="lg:pl-[228px]">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Voyten RL Lifecycle Services</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: Activity, t: 'Diagnostic & Maintenance Testing', d: 'Verify condition and root-cause a failure before deciding.', href: SERVICES.testing },
                  { icon: Recycle, t: 'Apparatus Life Extension', d: 'Recondition and prolong RL equipment well beyond its original expected life.', href: SERVICES.lifeExt },
                  { icon: RefreshCw, t: 'Upgrades, Retrofit & Retrofill', d: 'Add modern trip units and protection to existing RL switchgear.', href: SERVICES.retrofit },
                  { icon: Wrench, t: 'Custom Rebuilds & Remanufacturing', d: 'Rebuild to OEM-or-better spec, fully tested.', href: SERVICES.rebuild },
                  { icon: Package, t: 'Swap-Out Program', d: 'Exchange a failed unit for a tested replacement fast.', href: SERVICES.swap },
                  { icon: Truck, t: 'Rental Services', d: 'Keep the plant energized while work is completed.', href: SERVICES.rental },
                ].map((s) => (
                  <a key={s.t} href={s.href} target="_blank" rel="noopener noreferrer" className="group block bg-white rounded-xl border border-slate-200 p-5 hover:border-[#dc2626]/40 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-[#1a1a1a]/5 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#dc2626]/10 transition-colors"><s.icon size={20} className="text-[#1a1a1a] group-hover:text-[#dc2626] transition-colors" /></div>
                    <h3 className="font-bold text-slate-900 mb-1 text-sm">{s.t}</h3>
                    <p className="text-sm text-slate-600">{s.d}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Why Extend ── */}
        <section className="even:bg-slate-100 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="lg:pl-[228px]">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Why Extend the Life of RL Switchgear</h2>
              <div className="text-slate-700 leading-relaxed space-y-4 max-w-3xl">
                <p>In current manufacturing industries, you cannot simply accept that an electrical product is out of production and decide you need to change it all. Full switchgear replacement is among the costliest and most disruptive options &mdash; and rarely necessary for RL.</p>
                <p>Voyten Electric adds today&apos;s technology to yesterday&apos;s electrical equipment, giving you the most for your investment. Aging RL substations can be maintained with reliability upgrades, modern trip units, and added circuits &mdash; prolonging the equipment&apos;s life well beyond what was originally expected. <strong>Remanufactured equipment is always worth the investment.</strong></p>
                <p>And because Voyten purchased the entire remaining Type RL/VRL and LA inventory from the Wendell, NC facility, exact-match breakers, Static Trip III units, and renewal parts stay available &mdash; so the recondition, retrofit, and replace options remain open long after other obsolete lines have gone dark.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── PEARL ── */}
        <section className="even:bg-slate-100 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="lg:pl-[228px]">
              <div className="flex items-start gap-4 bg-slate-50 rounded-2xl border border-slate-200 p-6 lg:p-8">
                <div className="w-12 h-12 bg-[#dc2626]/10 rounded-xl flex items-center justify-center flex-shrink-0"><ShieldCheck size={24} className="text-[#dc2626]" /></div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Held to PEARL Standards</h2>
                  <p className="text-slate-700 leading-relaxed">Voyten is a founding member of <strong>PEARL &mdash; the Professional Electrical Apparatus Recyclers League</strong> (est. 1997). Every RL breaker, trip unit, and component Voyten reconditions or remanufactures is held to PEARL&apos;s independently-set technical, safety, and operational standards. <a href="https://pearl1.org/" target="_blank" rel="noopener noreferrer" className="text-[#dc2626] hover:text-[#b91c1c] font-medium">Learn more about PEARL &rarr;</a></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ kept as JSON-LD only (faqJsonLd script above) for SEO; visible section removed per request ── */}

        {/* ── CTA ── */}
        <section className="even:bg-slate-100 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="lg:pl-[228px]">
              <div className="bg-[#dc2626] rounded-2xl p-8 lg:p-10 text-center text-white">
                <h2 className="text-2xl lg:text-3xl font-bold mb-3">Not Sure Which Path Is Right?</h2>
                <p className="text-white/90 mb-6 max-w-2xl mx-auto">Tell us your RL equipment and the problem &mdash; Voyten&apos;s engineers will recommend the most cost-effective path, from a quick recondition to an exact-match replacement. 24/7 for emergencies.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="tel:1-800-458-4001" className="flex items-center justify-center gap-2 bg-white text-[#1a1a1a] px-8 py-3.5 rounded-lg font-bold hover:bg-slate-100 transition-colors"><Phone size={18} /> 1-800-458-4001</a>
                  <Link href="/contact?type=quote" className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-8 py-3.5 rounded-lg font-medium border border-white/30 transition-colors">Request a Quote <ArrowRight size={16} /></Link>
                </div>
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
