'use client';

import Link from 'next/link';
import { Phone, Mail, Menu, X, Search, BookOpen, ChevronDown, Zap } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (contactRef.current && !contactRef.current.contains(event.target as Node)) {
        setContactOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Emergency service banner */}
      <div className="bg-[#dc2626] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <a href="tel:1-800-458-4001" className="flex items-center justify-center gap-2 h-8 text-xs sm:text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity">
            <Zap size={13} className="flex-shrink-0" />
            <span>Emergency Service Available 24/7/365</span>
            <span className="hidden sm:inline">—</span>
            <span className="flex items-center gap-1">
              <Phone size={12} className="flex-shrink-0" />
              1-800-458-4001
            </span>
          </a>
        </div>
      </div>

      {/* Top utility bar */}
      <div className="bg-[#1a1a1a] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-9 text-xs sm:text-sm">
            <div className="flex items-center gap-3 sm:gap-5">
              <a href="tel:1-800-458-4001" className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors">
                <Phone size={12} />
                <span className="font-medium">1-800-458-4001</span>
              </a>
              <span className="hidden sm:block w-px h-3.5 bg-white/30"></span>
              <a href="mailto:info@voytenelectric.com" className="hidden sm:flex items-center gap-1.5 text-white/70 hover:text-white transition-colors">
                <Mail size={12} />
                <span>info@voytenelectric.com</span>
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-xs hidden sm:inline">Powered by</span>
              <a
                href="https://voytenelectric.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 hover:text-white font-semibold text-xs"
              >
                Voyten Electric
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-[#1a1a1a] rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1a1a1a] leading-none">
                Voyten<span className="text-[#dc2626]">Manuals</span>
              </span>
              <span className="text-[10px] font-medium tracking-wider uppercase text-slate-400 leading-none mt-0.5">
                Electrical Equipment Library
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            <Link href="/search" className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5">
              <Search size={15} />
              Search Manuals
            </Link>
            <Link href="/categories" className="text-slate-600 hover:text-slate-900 font-medium">Browse Categories</Link>
            <Link href="/manufacturers" className="text-slate-600 hover:text-slate-900 font-medium">Manufacturers</Link>
            <Link href="/about" className="text-slate-600 hover:text-slate-900 font-medium">About</Link>
            <Link href="/contact" className="text-slate-600 hover:text-slate-900 font-medium">Contact</Link>
          </nav>

          {/* CTA area */}
          <div className="flex items-center gap-3">
            {/* Need a Part? CTA - Desktop */}
            <div className="relative hidden sm:block" ref={contactRef}>
              <button
                onClick={() => setContactOpen(!contactOpen)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 font-semibold text-sm
                  transition-all duration-300 relative rounded-lg
                  ${contactOpen
                    ? 'bg-[#1a1a1a] text-white rounded-b-none'
                    : 'bg-[#dc2626] hover:bg-[#b91c1c] text-white'
                  }
                `}
              >
                <span>Need a Part?</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${contactOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {contactOpen && (
                <div className="absolute top-full right-0 w-[320px] bg-white rounded-b-xl shadow-2xl border border-t-0 border-slate-200 overflow-hidden z-50">
                  <div className="bg-[#1a1a1a] text-white px-4 py-3">
                    <p className="font-semibold text-sm">Found the manual you need?</p>
                    <p className="text-white/70 text-xs mt-1">Voyten Electric can supply the parts. Contact us for pricing and availability.</p>
                  </div>
                  <div className="p-3 space-y-1">
                    <a
                      href="tel:1-800-458-4001"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a1a1a]/10 group-hover:bg-[#1a1a1a] transition-colors">
                        <Phone size={18} className="text-[#1a1a1a] group-hover:text-white transition-colors" />
                      </span>
                      <div>
                        <p className="font-bold text-[#1a1a1a]">1-800-458-4001</p>
                        <p className="text-slate-500 text-xs">Talk to an expert now</p>
                      </div>
                    </a>
                    <a
                      href="mailto:info@voytenelectric.com?subject=Parts Inquiry from Voyten Manuals"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a1a1a]/10 group-hover:bg-[#1a1a1a] transition-colors">
                        <Mail size={18} className="text-[#1a1a1a] group-hover:text-white transition-colors" />
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">Email Us</p>
                        <p className="text-slate-500 text-xs">info@voytenelectric.com</p>
                      </div>
                    </a>
                    <Link
                      href="/contact"
                      onClick={() => setContactOpen(false)}
                      className="block text-center text-sm text-[#1a1a1a] font-medium py-2 hover:underline"
                    >
                      Request a Quote Online
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile call button */}
            <a
              href="tel:1-800-458-4001"
              className="sm:hidden flex items-center justify-center w-9 h-9 bg-[#dc2626] text-white rounded-lg"
            >
              <Phone size={16} />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link href="/search" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2.5 text-slate-700 hover:text-slate-900 font-medium">
              <Search size={16} />
              Search Manuals
            </Link>
            <Link href="/categories" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-slate-700 hover:text-slate-900">Browse Categories</Link>
            <Link href="/manufacturers" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-slate-700 hover:text-slate-900">Manufacturers</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-slate-700 hover:text-slate-900">About</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-slate-700 hover:text-slate-900">Contact</Link>

            <div className="pt-4 mt-4 border-t border-slate-200">
              <a
                href="tel:1-800-458-4001"
                className="flex items-center gap-3 bg-[#1a1a1a] text-white p-3 rounded-xl mb-2"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
                  <Phone size={18} />
                </span>
                <div>
                  <p className="font-bold">1-800-458-4001</p>
                  <p className="text-xs text-white/70">Need a part? Call Voyten Electric</p>
                </div>
              </a>
              <a
                href="mailto:info@voytenelectric.com"
                className="flex items-center justify-center gap-2 border-2 border-[#1a1a1a] text-[#1a1a1a] p-3 rounded-xl hover:bg-[#1a1a1a] hover:text-white transition-colors"
              >
                <Mail size={18} />
                <span className="font-semibold">Email Us</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
