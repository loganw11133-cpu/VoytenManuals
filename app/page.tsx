import Link from 'next/link';
import { Phone, ChevronRight, BookOpen, Search, Download, Users, Shield, Zap, FileText, Building2, ArrowRight, Clock, Truck } from 'lucide-react';
import ManualSearchBar from '@/components/ManualSearchBar';
import { getTotalManualCount, getCategories, getManufacturers } from '@/lib/manuals-db';

const CATEGORIES = [
  { name: 'Circuit Breakers', icon: Zap, description: 'Air breakers, insulated case, molded case, trip units, retrofit kits' },
  { name: 'Relays and Meters', icon: Shield, description: 'Overcurrent relays, protective relays, metering equipment' },
  { name: 'Motor Controls', icon: Building2, description: 'Motor control centers, starters, contactors, overloads' },
  { name: 'Switches', icon: FileText, description: 'Disconnect switches, transfer switches, safety switches' },
  { name: 'Fuses', icon: Zap, description: 'Fuse links, fuse holders, fuse catalogs' },
  { name: 'Transformers', icon: Building2, description: 'Dry-type, oil-filled, pad-mounted, instrument transformers' },
  { name: 'Bus Products', icon: FileText, description: 'Bus duct, busway, bus plugs, insulators' },
  { name: 'Miscellaneous', icon: BookOpen, description: 'Communications, accessories, field testing, and more' },
];

export const revalidate = 3600;

export default async function Home() {
  const [totalCount, categories, manufacturers] = await Promise.all([
    getTotalManualCount(),
    getCategories(),
    getManufacturers(),
  ]);

  // Top manufacturers by manual count
  const topManufacturers = manufacturers.slice(0, 10);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#111111] via-[#1a1a1a] to-[#991b1b]"></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm text-white/80 mb-6">
              <BookOpen size={16} />
              {totalCount.toLocaleString()} Free Electrical Equipment Manuals
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
              Find the Electrical Manual
              <span className="text-[#dc2626]"> You Need</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Searchable library of instruction manuals, renewal parts catalogs, characteristic curves,
              and technical documentation — including EOL and legacy equipment. Backed by 70+ years of industry expertise.
            </p>

            {/* Search Bar - Primary CTA */}
            <ManualSearchBar size="large" className="max-w-2xl mx-auto mb-6" />

            <p className="text-slate-400 text-sm">
              Search by title, part number, manufacturer, or keyword
            </p>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: BookOpen, text: `${totalCount.toLocaleString()} Manuals` },
              { icon: Download, text: 'Free PDF Downloads' },
              { icon: Clock, text: 'Serving Since 1953' },
              { icon: Truck, text: 'Parts Available' },
            ].map(item => (
              <div key={item.text} className="flex items-center justify-center gap-2 text-sm text-slate-600">
                <item.icon size={16} className="text-[#dc2626] flex-shrink-0" />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
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
              const Icon = cat.icon;
              const dbCat = categories.find(c => c.name === cat.name);
              return (
                <Link
                  key={cat.name}
                  href={`/search?category=${encodeURIComponent(cat.name)}`}
                  className="group bg-slate-50 hover:bg-[#1a1a1a] rounded-xl p-5 transition-all hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-[#1a1a1a]/10 group-hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5 text-[#1a1a1a] group-hover:text-white transition-colors" />
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

      {/* Manufacturer Links */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Manufacturers We Cover</h2>
            <p className="text-slate-500 text-sm">Documentation from the industry&#39;s leading electrical equipment manufacturers</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {topManufacturers.map((mfr) => (
              <Link
                key={mfr.name}
                href={`/search?manufacturer=${encodeURIComponent(mfr.name)}`}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium text-sm hover:border-[#1a1a1a] hover:text-[#1a1a1a] hover:shadow-sm transition-all"
              >
                {mfr.name}
                <span className="text-slate-400 ml-1.5 text-xs">({mfr.count})</span>
              </Link>
            ))}
            <Link
              href="/manufacturers"
              className="px-5 py-2.5 border border-dashed border-slate-300 rounded-lg text-slate-500 text-sm hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-all flex items-center gap-1"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-14 lg:py-18 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Why Voyten Manuals?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Built by a third-generation family business that understands this equipment inside and out.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Easy to Search</h3>
              <p className="text-slate-500 text-sm">
                Find manuals by title, part number, manufacturer, category, or keyword.
                Filter and browse {totalCount.toLocaleString()} documents instantly.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Download className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Free PDF Downloads</h3>
              <p className="text-slate-500 text-sm">
                Every manual is available as a free downloadable PDF.
                Print it, save it, share it with your team — no login required.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">EOL &amp; Legacy Expert Support</h3>
              <p className="text-slate-500 text-sm">
                Backed by Voyten Electric — 45 employees with decades of hands-on experience.
                We specialize in discontinued and end-of-life equipment. Need a part? We stock it, test it, and ship it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Gen CTA - Parts */}
      <section className="py-14 lg:py-18 bg-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Found the Manual? Need the Part?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Voyten Electric stocks thousands of electrical parts across 200,000 sq. ft. of warehouse space —
            circuit breakers, trip units, motor controls, and more. Specializing in EOL, legacy, and discontinued equipment replacement. We ship nationwide with same-day options.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:1-800-458-4001"
              className="flex items-center justify-center gap-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors"
            >
              <Phone size={22} />
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
          <p className="text-slate-400 text-sm mt-6">
            Voyten Electric & Electronics, Inc. — Family Owned Since 1953 — 173 Voyten Blvd, Polk, PA 16342
          </p>
        </div>
      </section>

      {/* Can't Find Section */}
      <section className="py-14 lg:py-18 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Can&#39;t Find the Manual You Need?
          </h2>
          <p className="text-slate-500 mb-6">
            Our library is continually growing. If you can&#39;t find a specific manual,
            let us know and we&#39;ll do our best to track it down for you.
          </p>
          <Link
            href="/contact?type=manual-request"
            className="inline-flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#111111] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Request a Manual
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
