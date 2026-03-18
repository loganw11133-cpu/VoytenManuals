import Link from 'next/link';
import { Phone, Mail, MapPin, BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white">
      {/* CTA Banner */}
      <div className="bg-[#dc2626]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white">Found the manual? Need the part?</h3>
              <p className="text-white/80">Voyten Electric stocks thousands of electrical parts ready to ship.</p>
            </div>
            <div className="flex gap-3">
              <a
                href="tel:1-800-458-4001"
                className="flex items-center gap-2 bg-white text-[#1a1a1a] px-6 py-2.5 rounded-lg font-bold hover:bg-slate-100 transition-colors"
              >
                <Phone size={18} />
                1-800-458-4001
              </a>
              <Link
                href="/contact"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#dc2626]" />
              </div>
              <span className="text-lg font-bold">Voyten<span className="text-[#dc2626]">Manuals</span></span>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              A free resource by Voyten Electric. Searchable library of electrical equipment manuals, instruction guides, and technical documentation.
            </p>
            <a
              href="https://voytenelectric.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#dc2626] hover:text-[#ef4444] text-sm font-medium"
            >
              Visit VoytenElectric.com
            </a>
          </div>

          {/* Manual Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Manual Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search?category=Circuit+Breakers" className="text-slate-400 hover:text-white">Circuit Breakers</Link></li>
              <li><Link href="/search?category=Relays+and+Meters" className="text-slate-400 hover:text-white">Relays & Meters</Link></li>
              <li><Link href="/search?category=Motor+Controls" className="text-slate-400 hover:text-white">Motor Controls</Link></li>
              <li><Link href="/search?category=Switches" className="text-slate-400 hover:text-white">Switches</Link></li>
              <li><Link href="/search?category=Fuses" className="text-slate-400 hover:text-white">Fuses</Link></li>
              <li><Link href="/search?category=Transformers" className="text-slate-400 hover:text-white">Transformers</Link></li>
              <li><Link href="/search?category=Bus+Products" className="text-slate-400 hover:text-white">Bus Products</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search" className="text-slate-400 hover:text-white">Search Manuals</Link></li>
              <li><Link href="/manufacturers" className="text-slate-400 hover:text-white">By Manufacturer</Link></li>
              <li><Link href="/about" className="text-slate-400 hover:text-white">About Voyten Manuals</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-white">Contact / Request a Part</Link></li>
              <li><a href="https://voytenelectric.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">Voyten Electric</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Contact Voyten Electric</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="tel:1-800-458-4001" className="text-slate-400 hover:text-white flex items-center gap-2">
                  <Phone size={14} />
                  1-800-458-4001
                </a>
              </li>
              <li>
                <a href="tel:814-432-5893" className="text-slate-400 hover:text-white flex items-center gap-2 text-xs">
                  <Phone size={12} />
                  Local: (814) 432-5893
                </a>
              </li>
              <li>
                <a href="mailto:info@voytenelectric.com" className="text-slate-400 hover:text-white flex items-center gap-2">
                  <Mail size={14} />
                  info@voytenelectric.com
                </a>
              </li>
              <li>
                <span className="text-slate-400 flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                  <span>173 Voyten Blvd, Polk, PA 16342</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
          <p className="text-xs text-slate-500 text-center">
            All trademarks, brand names, and product names are the property of their respective owners. Voyten Manuals is an independent resource and is not affiliated with or endorsed by any manufacturer listed.
          </p>
          <p className="text-sm text-slate-500 text-center">
            &copy; {new Date().getFullYear()} Voyten Electric & Electronics, Inc. All rights reserved.
          </p>
          <p className="text-xs text-slate-600 text-center">
            CAGE: 0GEF5 &nbsp;|&nbsp; DUNS: 070449368
          </p>
        </div>
      </div>
    </footer>
  );
}
