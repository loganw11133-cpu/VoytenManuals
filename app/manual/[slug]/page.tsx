import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FileText, ChevronRight, Phone, Building2, Tag, BookOpen, ArrowLeft, Layers, Download, Shield, Wrench } from 'lucide-react';
import { getManualBySlug, getRelatedManuals, formatFileSize } from '@/lib/manuals-db';
import ManualCard from '@/components/ManualCard';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import DownloadButton from '@/components/DownloadButton';
import type { Metadata } from 'next';

interface ManualPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ManualPageProps): Promise<Metadata> {
  const { slug } = await params;
  const manual = await getManualBySlug(slug);
  if (!manual) return { title: 'Manual Not Found' };

  const partNum = manual.manual_number ? ` (${manual.manual_number})` : '';
  const subcatStr = manual.subcategory ? ` — ${manual.subcategory}` : '';
  const title = `${manual.title}${partNum} | ${manual.manufacturer} ${manual.category} Manual`;
  const description = `Download free PDF: ${manual.title}${partNum} by ${manual.manufacturer}. ${manual.category}${subcatStr} documentation including instruction guides, renewal parts lists, wiring diagrams, and technical data. EOL and legacy equipment support available. Replacement parts from Voyten Electric — call 1-800-458-4001.`;

  const keywords = [
    manual.title,
    manual.manufacturer,
    manual.category,
    manual.manual_number,
    manual.subcategory,
    `${manual.manufacturer} manual`,
    `${manual.manufacturer} ${manual.category} manual`,
    `${manual.manufacturer} parts`,
    `${manual.title} PDF`,
    manual.manual_number ? `${manual.manual_number} manual` : null,
    manual.manual_number ? `${manual.manual_number} PDF` : null,
    manual.manual_number ? `${manual.manual_number} parts list` : null,
    `${manual.manufacturer} EOL`,
    `${manual.manufacturer} legacy support`,
    `${manual.manufacturer} discontinued`,
    `${manual.manufacturer} replacement parts`,
  ].filter(Boolean) as string[];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: `${manual.title}${partNum} — Free PDF Download`,
      description: `Free ${manual.manufacturer} ${manual.category} manual: ${manual.title}. Download PDF with instruction guides, renewal parts, and technical data. EOL and legacy equipment replacement parts available.`,
      type: 'article',
      url: `https://voytenmanuals.com/manual/${manual.slug}`,
    },
    twitter: {
      card: 'summary',
      title: `${manual.title}${partNum} | Voyten Manuals`,
      description: `Free PDF download: ${manual.title} by ${manual.manufacturer}. ${manual.category} documentation.`,
    },
    alternates: {
      canonical: `https://voytenmanuals.com/manual/${manual.slug}`,
    },
    robots: { index: true, follow: true },
  };
}

export const revalidate = 3600;

export default async function ManualPage({ params }: ManualPageProps) {
  const { slug } = await params;
  const manual = await getManualBySlug(slug);
  if (!manual) notFound();

  const relatedManuals = await getRelatedManuals(manual, 4);

  // Rich JSON-LD: TechArticle with part numbers, manufacturer, category
  const techArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "name": manual.title,
    "headline": manual.title,
    "description": manual.description || `${manual.manufacturer} ${manual.category} manual: ${manual.title}`,
    "author": { "@type": "Organization", "name": manual.manufacturer },
    "publisher": {
      "@type": "Organization",
      "name": "Voyten Electric & Electronics, Inc.",
      "url": "https://voytenmanuals.com",
      "logo": "https://voytenmanuals.com/images/voyten-logo.png",
    },
    "url": `https://voytenmanuals.com/manual/${manual.slug}`,
    "mainEntityOfPage": `https://voytenmanuals.com/manual/${manual.slug}`,
    "encodingFormat": "application/pdf",
    "articleSection": manual.category,
    ...(manual.manual_number && { "identifier": manual.manual_number }),
    ...(manual.manual_number && { "productID": manual.manual_number }),
    ...(manual.page_count && { "numberOfPages": manual.page_count }),
    "about": {
      "@type": "Product",
      "name": manual.title,
      "manufacturer": { "@type": "Organization", "name": manual.manufacturer },
      "category": manual.category,
      ...(manual.manual_number && { "mpn": manual.manual_number }),
      ...(manual.manual_number && { "sku": manual.manual_number }),
      "description": `${manual.manufacturer} ${manual.category}${manual.subcategory ? ' — ' + manual.subcategory : ''}. EOL and legacy replacement parts available from Voyten Electric.`,
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "Voyten Electric & Electronics, Inc.",
          "telephone": "+1-800-458-4001",
        },
        "description": "Replacement parts available — call for pricing and availability",
      },
    },
    "keywords": [
      manual.manufacturer,
      manual.category,
      manual.subcategory,
      manual.manual_number,
      "EOL",
      "legacy equipment",
      "replacement parts",
      "free PDF manual",
    ].filter(Boolean).join(", "),
  };

  // BreadcrumbList for rich snippets in Google
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://voytenmanuals.com" },
      { "@type": "ListItem", "position": 2, "name": "Manuals", "item": "https://voytenmanuals.com/search" },
      { "@type": "ListItem", "position": 3, "name": manual.category, "item": `https://voytenmanuals.com/search?category=${encodeURIComponent(manual.category)}` },
      { "@type": "ListItem", "position": 4, "name": manual.manufacturer, "item": `https://voytenmanuals.com/search?manufacturer=${encodeURIComponent(manual.manufacturer)}` },
      { "@type": "ListItem", "position": 5, "name": manual.title },
    ],
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-700">Home</Link>
            <ChevronRight size={14} />
            <Link href="/search" className="hover:text-slate-700">Manuals</Link>
            <ChevronRight size={14} />
            <Link href={`/search?category=${encodeURIComponent(manual.category)}`} className="hover:text-slate-700">
              {manual.category}
            </Link>
            <ChevronRight size={14} />
            <span className="text-slate-900 font-medium truncate">{manual.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <Link href="/search" className="inline-flex items-center gap-1 text-sm text-[#1a1a1a] hover:underline mb-4">
              <ArrowLeft size={14} />
              Back to Search
            </Link>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Manual Header */}
              <div className="p-6 lg:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#1a1a1a] rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-7 h-7 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">{manual.title}</h1>
                    {manual.manual_number && (
                      <p className="text-sm text-slate-500">
                        <span className="font-mono font-medium text-slate-700">Part/Manual #: {manual.manual_number}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <Link
                    href={`/search?manufacturer=${encodeURIComponent(manual.manufacturer)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-[#1a1a1a]/10 rounded-lg text-sm text-slate-700 transition-colors"
                  >
                    <Building2 size={14} aria-hidden="true" />
                    {manual.manufacturer}
                  </Link>
                  <Link
                    href={`/search?category=${encodeURIComponent(manual.category)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-[#1a1a1a]/10 rounded-lg text-sm text-slate-700 transition-colors"
                  >
                    <Tag size={14} aria-hidden="true" />
                    {manual.category}
                  </Link>
                  {manual.subcategory && (
                    <Link
                      href={`/search?subcategory=${encodeURIComponent(manual.subcategory)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-[#1a1a1a]/10 rounded-lg text-sm text-slate-700 transition-colors"
                    >
                      <Layers size={14} aria-hidden="true" />
                      {manual.subcategory}
                    </Link>
                  )}
                  {manual.page_count && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-700">
                      <BookOpen size={14} aria-hidden="true" />
                      {manual.page_count} pages
                    </span>
                  )}
                  {manual.file_size_bytes && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-700">
                      <Download size={14} aria-hidden="true" />
                      {formatFileSize(manual.file_size_bytes)}
                    </span>
                  )}
                </div>

                {manual.description && (
                  <p className="text-slate-600 mb-8 leading-relaxed">{manual.description}</p>
                )}

                {/* Download Button - Primary CTA with tracking */}
                <DownloadButton
                  pdfUrl={manual.pdf_url}
                  manualId={manual.id}
                  fileSize={manual.file_size_bytes ? formatFileSize(manual.file_size_bytes) : 'PDF'}
                  pageCount={manual.page_count}
                />
              </div>

              {/* Conversion CTA - Below download */}
              <div className="bg-[#dc2626]/10 border-t border-[#dc2626]/20 p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900">Need the replacement part?</h3>
                    <p className="text-slate-600 text-sm">
                      Voyten Electric stocks parts for this equipment — including EOL and discontinued models.
                    </p>
                  </div>
                  <a
                    href="tel:1-800-458-4001"
                    className="flex items-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-6 py-3 rounded-lg font-bold transition-colors flex-shrink-0"
                  >
                    <Phone size={18} aria-hidden="true" />
                    1-800-458-4001
                  </a>
                </div>
              </div>
            </div>

            {/* EOL / Legacy Equipment Banner */}
            <div className="mt-6 bg-[#1a1a1a] rounded-xl p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#dc2626]" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">EOL &amp; Legacy Equipment Support</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Is your {manual.manufacturer} equipment discontinued or end-of-life? Voyten Electric specializes in
                    sourcing, testing, and shipping replacement parts for legacy electrical equipment. We stock circuit breakers,
                    trip units, motor controls, and accessories for models no longer manufactured.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <a href="tel:1-800-458-4001" className="flex items-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors">
                      <Phone size={16} aria-hidden="true" />
                      Call for Parts
                    </a>
                    <Link href="/contact?type=quote" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg font-medium text-sm border border-white/20 transition-colors">
                      <Wrench size={16} aria-hidden="true" />
                      Request Quote
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Manuals */}
            {relatedManuals.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Related {manual.manufacturer} Manuals</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {relatedManuals.map((related) => (
                    <ManualCard key={related.id} manual={related} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80 flex-shrink-0 space-y-6">
            {/* Quote Request Form */}
            <LeadCaptureForm
              type="quote"
              manualTitle={manual.title}
              manualId={manual.id}
              sourcePage={`/manual/${manual.slug}`}
            />

            {/* Browse more */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-slate-900 mb-3">Browse More</h3>
              <div className="space-y-2">
                <Link
                  href={`/search?manufacturer=${encodeURIComponent(manual.manufacturer)}`}
                  className="block text-sm text-[#1a1a1a] hover:underline"
                >
                  All {manual.manufacturer} manuals
                </Link>
                <Link
                  href={`/search?category=${encodeURIComponent(manual.category)}`}
                  className="block text-sm text-[#1a1a1a] hover:underline"
                >
                  All {manual.category} manuals
                </Link>
                {manual.subcategory && (
                  <Link
                    href={`/search?subcategory=${encodeURIComponent(manual.subcategory)}`}
                    className="block text-sm text-[#1a1a1a] hover:underline"
                  >
                    More {manual.subcategory}
                  </Link>
                )}
                <Link
                  href={`/search?manufacturer=${encodeURIComponent(manual.manufacturer)}&category=${encodeURIComponent(manual.category)}`}
                  className="block text-sm text-[#1a1a1a] hover:underline"
                >
                  {manual.manufacturer} {manual.category}
                </Link>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="bg-[#1a1a1a] rounded-xl p-5 text-white">
              <h3 className="font-bold text-lg mb-2">Need Expert Help?</h3>
              <p className="text-slate-300 text-sm mb-4">
                Our team can help identify parts, source discontinued equipment, or answer technical questions about legacy {manual.manufacturer} products.
              </p>
              <a
                href="tel:1-800-458-4001"
                className="flex items-center justify-center gap-2 bg-white text-[#1a1a1a] py-3 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors mb-2"
              >
                <Phone size={16} aria-hidden="true" />
                1-800-458-4001
              </a>
              <a
                href="tel:814-432-5893"
                className="block text-center text-white/60 text-xs hover:text-white/80 transition-colors"
              >
                Local: (814) 432-5893
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
