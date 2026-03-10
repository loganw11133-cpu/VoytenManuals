import Link from 'next/link';
import { Phone, BookOpen, Shield, Users, Zap, ArrowRight, MapPin, Factory, Award, Globe } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Voyten Manuals & Voyten Electric — Family Owned Since 1953',
  description: 'Voyten Manuals is a free library of 4,800+ electrical equipment manuals powered by Voyten Electric & Electronics, Inc. — a third-generation family business with 200,000 sq. ft. of facilities and 45+ employees. Remanufactured circuit breakers, switchgear, motor controls, and more. Founded 1953 in Pennsylvania.',
  alternates: {
    canonical: 'https://voytenmanuals.com/about',
  },
  keywords: [
    'Voyten Electric',
    'Voyten Manuals',
    'electrical equipment wholesaler',
    'remanufactured electrical equipment',
    'family owned electrical company',
    'circuit breaker supplier',
    'Polk Pennsylvania',
    'electrical parts supplier',
  ],
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-[#1a3a5c] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2840] via-[#1a3a5c] to-[#2a5a8c]"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-14 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-[#c8962e] font-semibold mb-3 text-sm tracking-wide uppercase">Since 1953</p>
            <h1 className="text-3xl lg:text-5xl font-extrabold mb-4 leading-tight">About Voyten Manuals</h1>
            <p className="text-lg lg:text-xl text-slate-300 leading-relaxed">
              A free resource for electrical professionals — powered by Voyten Electric & Electronics, Inc.,
              a third-generation family business with over 70 years of industry expertise.
            </p>
          </div>
        </div>
      </section>

      {/* Why We Built This */}
      <section className="py-14 lg:py-18">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Why We Built This</h2>
          <div className="space-y-4 text-slate-600 text-lg leading-relaxed">
            <p>
              If you&#39;ve ever spent hours searching for a lost instruction manual, a renewal parts catalog,
              or a characteristic curve sheet for a piece of electrical equipment — you know the frustration.
            </p>
            <p>
              We built Voyten Manuals to solve that problem. Our team at Voyten Electric has been working
              with electrical equipment for over 70 years. Over the decades, we&#39;ve accumulated an extensive collection
              of technical documentation that we believe should be freely accessible to anyone who needs it.
            </p>
            <p>
              This library includes instruction manuals, renewal parts catalogs, retrofit kit guides,
              field testing procedures, and more — covering equipment from manufacturers like Westinghouse,
              Square D, General Electric, Siemens, Cutler-Hammer, ITE, ABB, and others.
            </p>
            <p>
              Our library is continually growing. If you can&#39;t find what you need,{' '}
              <Link href="/contact?type=manual-request" className="text-[#1a3a5c] font-medium hover:underline">
                let us know
              </Link>{' '}
              and we&#39;ll do our best to track it down.
            </p>
          </div>
        </div>
      </section>

      {/* Our History */}
      <section className="py-14 lg:py-18 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-[#c8962e] font-semibold mb-2">Our Story</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Three Generations of Electrical Expertise</h2>

          <div className="space-y-12">
            {/* John Voyten */}
            <div className="relative pl-8 border-l-2 border-[#c8962e]/30">
              <div className="absolute -left-2.5 top-0 w-5 h-5 bg-[#c8962e] rounded-full"></div>
              <p className="text-sm font-semibold text-[#c8962e] mb-1">1953 — The Beginning</p>
              <h3 className="text-xl font-bold text-slate-900 mb-3">John Voyten, Founder</h3>
              <div className="space-y-3 text-slate-600 leading-relaxed">
                <p>
                  Voyten Electric & Electronics, Inc. was started by the late John Voyten in 1953. John was born
                  on October 31st, 1926 in Lucerne Mines, PA. At seventeen, he joined the United States Army Air Corps
                  and became part of the 315th Bombardment Wing in World War II.
                </p>
                <p>
                  John&#39;s time in the Army gave him the opportunity to learn about electrical engineering in the Leechburg
                  collieries. He later became certified as a master electrician in the coal mines and received a degree
                  from Michigan Technical Institute in 1949.
                </p>
                <p>
                  After returning from the Army, John established a small motor rewinding shop in Belle Vernon, Pennsylvania.
                  When the construction of PA Highway 51 forced the shop to close, the Voyten family moved to Punxsutawney, Pennsylvania,
                  where John owned two coal mines named after his daughters and wife — Cheryl Ann and Bonnie Kay.
                </p>
                <p>
                  When the mines closed, John moved to the East Cleveland area and opened a shop in Willoughby, Ohio,
                  where he started working with Silicon Controlled Rectifiers. Eventually, John longed to return to his roots
                  in Pennsylvania. He purchased a piece of property along a known trout stream in the Franklin area, and Voyten
                  Electric broke ground at its new location in the early 1970s. John, who was an animal lover, saw the wooded property
                  as not only a picturesque place to raise his family, but also a continuous opportunity for expansion.
                </p>
              </div>
            </div>

            {/* Tom & Bonnie */}
            <div className="relative pl-8 border-l-2 border-[#c8962e]/30">
              <div className="absolute -left-2.5 top-0 w-5 h-5 bg-[#c8962e] rounded-full"></div>
              <p className="text-sm font-semibold text-[#c8962e] mb-1">1970s — Second Generation</p>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Tom & Bonnie Nightingale</h3>
              <div className="space-y-3 text-slate-600 leading-relaxed">
                <p>
                  Tom Nightingale started working for John and dating his daughter Bonnie. Tom and Bonnie were married
                  in 1971, and one year later their son Michael was born while Tom was serving six years in the US Navy.
                </p>
                <p>
                  After completing an associates degree in Electrical Engineering, Tom took on a greater role as John
                  retired to Florida. Tom, Bonnie, and Cheryl kept John&#39;s spirit alive by growing and evolving the business
                  from 7,500 square feet and 3 employees in 1975 to 35,000 square feet and 20 employees by 2000.
                </p>
              </div>
            </div>

            {/* Mike Nightingale */}
            <div className="relative pl-8 border-l-2 border-[#c8962e]/30">
              <div className="absolute -left-2.5 top-0 w-5 h-5 bg-[#c8962e] rounded-full"></div>
              <p className="text-sm font-semibold text-[#c8962e] mb-1">1997 — Third Generation</p>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Mike Nightingale, President</h3>
              <div className="space-y-3 text-slate-600 leading-relaxed">
                <p>
                  Mike grew up around the business and came to work full time after college in 1997. He earned
                  a degree in Electrical Engineering from Ohio Northern University and a Masters of Business Administration
                  from Gannon University. A year later, Mike became President of the business, making Voyten Electric
                  a third-generation family owned company.
                </p>
                <p>
                  Mike follows in his father&#39;s and grandfather&#39;s footsteps by making Voyten Electric and Electronics, Inc.
                  a prominent name in the field of remanufactured electrical equipment.
                </p>
              </div>
            </div>

            {/* Today */}
            <div className="relative pl-8">
              <div className="absolute -left-2.5 top-0 w-5 h-5 bg-[#1a3a5c] rounded-full ring-4 ring-[#1a3a5c]/20"></div>
              <p className="text-sm font-semibold text-[#1a3a5c] mb-1">Today</p>
              <h3 className="text-xl font-bold text-slate-900 mb-3">A Constant in a Changing Industry</h3>
              <div className="space-y-3 text-slate-600 leading-relaxed">
                <p>
                  Today, the two main 200,000-square-foot facilities sit on 440 acres of land in the Allegheny Valley,
                  and the company has acquired two additional locations since the move to Franklin. Voyten Electric has
                  a team of approximately 45 employees, consisting of many seasoned technicians with a broad range of
                  skills and expertise, along with a large and knowledgeable sales force maintaining both domestic
                  and international presence.
                </p>
                <p>
                  Voyten Electric is not a big corporation or a private equity firm — customers can be confident that
                  each inquiry or sale will be handled personally by a member of Voyten Electric&#39;s professional sales staff.
                  Mike and his parents share a common vision for the future, in hopes that one day Voyten will be a
                  fourth-generation family owned business continuing to be a primary source for all your electrical
                  equipment needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* By the Numbers */}
      <section className="py-14 lg:py-18 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { value: '1953', label: 'Founded', icon: Award },
              { value: '200,000', label: 'Sq. Ft. of Facilities', icon: Factory },
              { value: '45+', label: 'Team Members', icon: Users },
              { value: '440', label: 'Acres in Allegheny Valley', icon: MapPin },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="w-12 h-12 bg-[#1a3a5c]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-[#1a3a5c]" />
                </div>
                <p className="text-3xl lg:text-4xl font-extrabold text-[#1a3a5c]">{stat.value}</p>
                <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities + CTA */}
      <section className="py-14 lg:py-18 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">What We Do</h2>
              <div className="space-y-4 mb-8">
                {[
                  { icon: Zap, title: 'Remanufactured Electrical Equipment', desc: 'Circuit breakers, switchgear, motor controls, and more — tested and ready to ship' },
                  { icon: Shield, title: 'Decades of Technical Knowledge', desc: 'Three generations of hands-on expertise with legacy and modern equipment' },
                  { icon: Globe, title: 'Domestic & International Sales', desc: 'Serving customers across the United States and around the world' },
                  { icon: Users, title: 'Personal Service', desc: 'Every inquiry handled by our professional sales staff — not a call center' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#1a3a5c]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-[#1a3a5c]" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-slate-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="tel:1-800-458-4001"
                  className="flex items-center justify-center gap-2 bg-[#1a3a5c] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#0f2840] transition-colors"
                >
                  <Phone size={18} />
                  1-800-458-4001
                </a>
                <a
                  href="https://voytenelectric.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-white transition-colors"
                >
                  Visit VoytenElectric.com
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>

            <div className="bg-[#1a3a5c] rounded-2xl p-8 lg:p-10 text-white">
              <BookOpen className="w-12 h-12 text-[#c8962e] mb-6" />
              <h3 className="text-2xl font-bold mb-4">What You&#39;ll Find Here</h3>
              <ul className="space-y-3 text-slate-300">
                {[
                  'Instruction and installation manuals',
                  'Renewal parts catalogs with part numbers',
                  'Characteristic curves and technical data',
                  'Retrofit kit instructions',
                  'Field testing procedures',
                  'Equipment configuration guides',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[#c8962e] font-bold mt-0.5">-</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/search"
                className="mt-6 inline-flex items-center gap-2 bg-white text-[#1a3a5c] px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors"
              >
                Browse All Manuals
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Lead-Gen CTA */}
      <section className="py-14 lg:py-18 bg-[#1a3a5c]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Find Your Manual or Part?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Browse our library of 4,800+ free manuals — or call us directly for parts, pricing, and expert support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="flex items-center justify-center gap-2 bg-[#c8962e] hover:bg-[#b8862a] text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors"
            >
              <BookOpen size={22} />
              Browse Manuals
            </Link>
            <a
              href="tel:1-800-458-4001"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-medium border border-white/20 transition-colors"
            >
              <Phone size={20} />
              Call: 1-800-458-4001
            </a>
          </div>
          <p className="text-slate-400 text-sm mt-6">
            Voyten Electric & Electronics, Inc. — 173 Voyten Blvd, Polk, PA 16342
          </p>
        </div>
      </section>
    </div>
  );
}
