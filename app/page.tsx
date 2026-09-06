import Link from 'next/link';
import { Phone, BookOpen, ArrowRight, Cpu } from 'lucide-react';
import Image from 'next/image';
import ManualSearchBar from '@/components/ManualSearchBar';
import SocialLinks from '@/components/SocialLinks';
import { getCategories } from '@/lib/manuals-db';
import YouTubeEmbed from '@/components/YouTubeEmbed';

const CATEGORIES = [
  { name: 'Circuit Breakers', iconSrc: '/icons/circuit-breakers.png', description: 'Air breakers, insulated case, molded case, trip units, retrofit kits' },
  { name: 'Relays and Meters', iconSrc: '/icons/relays-meters.png', description: 'Overcurrent relays, protective relays, metering equipment' },
  { name: 'Motor Controls', iconSrc: '/icons/motor-controls.png', description: 'Motor control centers, starters, contactors, overloads' },
  { name: 'Switches', iconSrc: '/icons/switches.png', description: 'Disconnect switches, transfer switches, safety switches' },
  { name: 'Fuses', iconSrc: '/icons/fuses.png', description: 'Fuse links, fuse holders, fuse catalogs' },
  { name: 'Transformers', iconSrc: '/icons/transformers.png', description: 'Dry-type, oil-filled, pad-mounted, instrument transformers' },
  { name: 'Bus Products', iconSrc: '/icons/bus-products.png', description: 'Bus duct, busway, bus plugs, insulators' },
  { name: 'Miscellaneous', fallbackIcon: BookOpen, description: 'Communications, accessories, field testing, and more' },
] as const;

export const revalidate = 3600;

export default async function Home() {
  const categories = await getCategories();

  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Voyten Electric Capabilities — Facility Tour",
    "description": "Tour of Voyten Electric & Electronics' 200,000 sq ft facility in Polk, PA. Specializing in new, surplus, and reconditioned electrical equipment — circuit breakers, switchgear, motor controls, and more. Family owned since 1953.",
    // This video has no maxresdefault (it was not uploaded at 720p or better),
    // so that URL 404s — sddefault is the largest size YouTube actually serves for it.
    "thumbnailUrl": "https://img.youtube.com/vi/pf5XGcExiM0/sddefault.jpg",
    "uploadDate": "2025-02-25",
    "contentUrl": "https://www.youtube.com/watch?v=pf5XGcExiM0",
    "embedUrl": "https://www.youtube.com/embed/pf5XGcExiM0",
    "publisher": {
      "@type": "Organization",
      "name": "Voyten Electric & Electronics, Inc.",
      "url": "https://www.voytenmanuals.com",
    },
  };

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
      />
      {/* Hero Section */}
      <section className="bg-[#1a1a1a] relative overflow-hidden">
        {/* Aerial facility photo background */}
        <Image
          src="/images/aerial-facility.png"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover opacity-35"
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/70 via-[#1a1a1a]/55 to-[#1a1a1a]/80"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            {/* The red phrase is held together as one unbreakable unit from sm up.
                Without it, mid-range widths are wide enough to pull "Equipment"
                onto the first line and orphan "Manuals" alone on the second.
                Left to wrap naturally below sm, where the phrase on its own line
                would be close to the viewport width. */}
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
              Your Source for Electrical{' '}
              <span className="text-[#dc2626] sm:whitespace-nowrap">Equipment Manuals</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Instruction manuals, renewal parts catalogs, wiring diagrams,
              and technical documentation — including EOL and legacy equipment. Backed by 70+ years of industry expertise.
            </p>

            {/* Search Bar - Primary CTA */}
            <ManualSearchBar size="large" className="max-w-2xl mx-auto" />
          </div>
        </div>
      </section>

      {/* Product Lines — a thin utility strip, kept on slate-50 so the homepage
          still alternates dark / slate-50 / white / dark now that the
          manufacturer chip band is gone. */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm">
            <span className="text-slate-400 font-medium">Your <strong className="text-slate-600">ONLY</strong> Source for New RL &amp; SPB Products:</span>
            <Link href="/products/rl-breakers" className="text-[#dc2626] hover:text-[#b91c1c] font-medium transition-colors">
              RL Breakers — New Surplus
            </Link>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <Link href="/products/spb-breakers" className="text-[#dc2626] hover:text-[#b91c1c] font-medium transition-colors">
              SPB Breakers — New Surplus
            </Link>
          </div>
          <div className="mt-2 text-center">
            <Link
              href="/tools"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#dc2626] transition-colors"
            >
              <Cpu size={13} className="flex-shrink-0" />
              Free Breaker Decoder Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Category Quick Links */}
      <section className="py-14 lg:py-18 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Browse by Category</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Our library covers the full range of electrical equipment documentation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const dbCat = categories.find(c => c.name === cat.name);
              const FallbackIcon = 'fallbackIcon' in cat ? cat.fallbackIcon : null;
              return (
                <Link
                  key={cat.name}
                  href={`/search?category=${encodeURIComponent(cat.name)}`}
                  className="group bg-slate-50 hover:bg-[#1a1a1a] rounded-xl p-5 transition-all hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`rounded-lg flex items-center justify-center overflow-hidden transition-colors ${'iconSrc' in cat ? 'w-[72px] h-[72px] bg-[#1a1a1a]/5 group-hover:bg-white/20' : 'w-10 h-10 bg-[#1a1a1a]/10 group-hover:bg-white/20'}`}>
                      {'iconSrc' in cat ? (
                        <Image src={cat.iconSrc} alt={cat.name} width={72} height={72} className="w-full h-full object-contain" />
                      ) : FallbackIcon ? (
                        <FallbackIcon className="w-5 h-5 text-[#1a1a1a] group-hover:text-white transition-colors" />
                      ) : null}
                    </div>
                    {dbCat && (
                      <span className="text-xs font-medium text-slate-400 group-hover:text-white/50 bg-slate-100 group-hover:bg-white/10 px-2 py-0.5 rounded-full transition-colors">
                        {dbCat.count}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-white mb-1 transition-colors">{cat.name}</h3>
                  <p className="text-slate-500 group-hover:text-white/70 text-sm transition-colors">{cat.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Facility Video + CTA */}
      <section className="py-14 lg:py-20 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Video */}
            <div>
              <YouTubeEmbed
                videoId="pf5XGcExiM0"
                title="Voyten Electric & Electronics Facility Tour — Polk, PA"
                // This video has no maxresdefault — sddefault is the largest YouTube serves for it.
                thumbnailSize="sddefault"
              />
            </div>

            {/* CTA Content */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                We stock the part, not just the manual.
              </h2>
              <p className="text-lg text-slate-300 mb-4">
                Voyten Electric stocks thousands of electrical parts across 200,000 sq. ft. of warehouse space —
                circuit breakers, trip units, motor controls, and more.
              </p>
              <p className="text-slate-400 mb-8">
                Specializing in EOL, legacy, and discontinued equipment replacement. We ship nationwide with same-day options.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="tel:1-800-458-4001"
                  className="flex items-center justify-center gap-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-6 lg:px-8 py-4 rounded-xl font-bold text-lg transition-colors whitespace-nowrap"
                >
                  <Phone size={22} className="flex-shrink-0" />
                  Call: 1-800-458-4001
                </a>
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-medium border border-white/20 transition-colors"
                >
                  Request a Quote
                  <ArrowRight size={18} />
                </Link>
              </div>
              <p className="text-slate-500 text-sm mt-6">
                Voyten Electric & Electronics, Inc. — Family Owned Since 1953 — Polk, PA
              </p>
              <SocialLinks className="mt-5 justify-center lg:justify-start" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
