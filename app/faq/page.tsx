import Link from 'next/link';
import { Phone, BookOpen, ArrowRight, HelpCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Electrical Equipment Manuals & Parts',
  description: 'Find answers about downloading free electrical equipment manuals, ordering discontinued and obsolete parts, legacy circuit breaker support, EOL switchgear documentation, and how Voyten Electric can help with remanufactured electrical equipment.',
  openGraph: {
    title: 'FAQ — Electrical Equipment Manuals & Parts',
    description: 'Answers about free manual downloads, discontinued parts, legacy breaker support, and EOL equipment documentation.',
    url: 'https://voytenmanuals.com/faq',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ | Voyten Manuals',
    description: 'Answers about free manual downloads, discontinued parts, and legacy equipment support.',
  },
  alternates: {
    canonical: 'https://voytenmanuals.com/faq',
  },
  keywords: [
    'electrical equipment manuals FAQ',
    'free electrical manuals download',
    'discontinued electrical parts',
    'obsolete circuit breaker manuals',
    'legacy switchgear documentation',
    'EOL electrical equipment support',
    'remanufactured circuit breakers',
    'Westinghouse manual download',
    'GE renewal parts catalog',
    'Square D instruction manual',
    'Siemens legacy equipment',
    'Cutler-Hammer replacement parts',
    'electrical equipment end of life',
    'obsolete relay manuals',
    'vintage motor control documentation',
    'out of production electrical parts',
    'Voyten Electric FAQ',
  ],
};

const faqs = [
  {
    question: 'Are the electrical equipment manuals on Voyten Manuals really free?',
    answer: 'Yes — every manual in our library is completely free to view and download. Voyten Manuals is a public resource provided by Voyten Electric & Electronics, Inc. We believe technicians, engineers, and facility managers should have easy access to the documentation they need for maintaining and servicing electrical equipment.',
  },
  {
    question: 'What types of manuals and documents are available?',
    answer: 'Our library includes instruction manuals, renewal parts catalogs, characteristic curves, retrofit kit instructions, field testing procedures, equipment configuration guides, and technical data sheets. We cover circuit breakers, switchgear, motor controls, relays, meters, transformers, fuses, switches, and bus products from major manufacturers.',
  },
  {
    question: 'Which manufacturers are covered in your manual library?',
    answer: 'We carry documentation from Westinghouse, General Electric (GE), Siemens, Square D, ABB, Cutler-Hammer, ITE, Federal Pacific, Allis-Chalmers, and many other manufacturers. Our largest collections are for Westinghouse and GE legacy equipment. If you don\'t see the manufacturer you need, contact us — we may be able to track it down.',
  },
  {
    question: 'Can you help me find a manual that isn\'t in your library?',
    answer: 'Absolutely. Our team at Voyten Electric has over 70 years of experience working with electrical equipment and maintains an extensive archive of technical documentation. If you can\'t find what you need, submit a manual request through our contact page and we\'ll do our best to locate it for you.',
  },
  {
    question: 'I found the manual — can Voyten Electric supply the replacement parts?',
    answer: 'Yes. Voyten Electric & Electronics, Inc. is a full-service supplier of remanufactured and surplus electrical equipment and parts. If you\'ve identified the parts you need from one of our manuals, call us at 1-800-458-4001 or request a quote online. We stock thousands of items including circuit breakers, contactors, relay components, motor starters, and more.',
  },
  {
    question: 'Do you carry parts for discontinued, obsolete, or end-of-life (EOL) electrical equipment?',
    answer: 'This is one of our specialties. Voyten Electric has been supplying hard-to-find parts for legacy and discontinued equipment since 1953. Whether you need a renewal part for a Westinghouse DS circuit breaker, a GE Magne-Blast component, or an obsolete Square D relay, we likely have it in stock or can source it. We maintain one of the largest inventories of remanufactured legacy electrical equipment in the country.',
  },
  {
    question: 'What does "remanufactured" electrical equipment mean?',
    answer: 'Remanufactured equipment has been completely disassembled, cleaned, inspected, and rebuilt to meet or exceed original manufacturer specifications. At Voyten Electric, our skilled technicians test every remanufactured unit before it ships. Remanufactured equipment is a cost-effective and reliable alternative when OEM parts are no longer available or lead times are too long.',
  },
  {
    question: 'Can I get emergency or after-hours support for critical equipment failures?',
    answer: 'Yes — Voyten Electric offers emergency service 24 hours a day, 7 days a week, 365 days a year. If you have a critical equipment failure and need parts or technical support urgently, call us at 1-800-458-4001. We understand that downtime in industrial and utility environments is extremely costly, and we prioritize emergency orders.',
  },
  {
    question: 'Do you ship parts internationally?',
    answer: 'Yes. Voyten Electric serves customers across the United States and internationally. Our sales team handles domestic and international shipping for parts, equipment, and large assemblies. Contact us for a quote that includes shipping to your location.',
  },
  {
    question: 'How do I know which parts I need from a manual?',
    answer: 'Most of our manuals include renewal parts lists with manufacturer part numbers, assembly diagrams, and bill-of-materials tables. Locate the section titled "Renewal Parts" or "Parts List" in the manual for your equipment. If you need help identifying the correct part, call Voyten Electric at 1-800-458-4001 — our team can walk you through it.',
  },
  {
    question: 'What is the difference between Voyten Manuals and Voyten Electric?',
    answer: 'Voyten Manuals (voytenmanuals.com) is a free online library of electrical equipment documentation. Voyten Electric & Electronics, Inc. (voytenelectric.com) is the parent company — a third-generation, family-owned business that sells remanufactured and surplus electrical equipment and parts. The manual library is a resource we provide to help electrical professionals find the documentation they need.',
  },
  {
    question: 'Can I request a quote for multiple parts at once?',
    answer: 'Yes. You can submit a quote request through our contact page or email us at info@voytenelectric.com with a list of part numbers, equipment model numbers, or manual references. Our sales team will respond with pricing and availability, typically within one business day.',
  },
];

// Build JSON-LD FAQPage schema
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function FAQPage() {
  return (
    <div className="bg-white">
      {/* JSON-LD FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[#1a1a1a] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#111111] via-[#1a1a1a] to-[#991b1b]"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-14 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-[#dc2626] font-semibold mb-3 text-sm tracking-wide uppercase">Help & Support</p>
            <h1 className="text-3xl lg:text-5xl font-extrabold mb-4 leading-tight">Frequently Asked Questions</h1>
            <p className="text-lg lg:text-xl text-slate-300 leading-relaxed">
              Common questions about our free manual library, ordering parts for discontinued and legacy electrical equipment, and working with Voyten Electric.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-14 lg:py-18">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start gap-4 p-6">
                  <div className="w-8 h-8 bg-[#dc2626]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4 text-[#dc2626]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-3">{faq.question}</h2>
                    <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-14 lg:py-18 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <HelpCircle className="w-12 h-12 text-[#dc2626] mx-auto mb-4" />
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">Still Have Questions?</h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Our team at Voyten Electric has over 70 years of experience with electrical equipment.
            We&#39;re happy to help with manual requests, part identification, or pricing inquiries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:1-800-458-4001"
              className="flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#111111] transition-colors"
            >
              <Phone size={18} />
              1-800-458-4001
            </a>
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-white transition-colors"
            >
              Contact Us Online
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Lead-Gen CTA */}
      <section className="py-14 lg:py-18 bg-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Find Your Manual or Part?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Browse our library of 5,800+ free manuals — or call us directly for parts, pricing, and expert support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors"
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
        </div>
      </section>
    </div>
  );
}
