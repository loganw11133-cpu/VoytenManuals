import Link from 'next/link';
import { Phone, ArrowRight, FileText, WifiOff } from 'lucide-react';
import type { Decoder } from '@/lib/decoders';

/**
 * Server-rendered, indexable copy for a decoder route.
 *
 * The decoder itself is an iframe, so crawlers see none of its content as part
 * of this page. Everything a search engine or AI assistant can read about
 * /tools/<slug> is rendered here.
 */
export default function DecoderAbout({ decoder }: { decoder: Decoder }) {
  const { fullName, manufacturer, frames, ratings, example, alsoKnownAs, identifies, faq } = decoder;

  return (
    <section className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
          {fullName} Catalog Number Decoder
        </h1>
        <p className="text-slate-700 leading-relaxed mb-6">
          {decoder.description} The decoder is free, needs no login, and runs entirely in your
          browser &mdash; paste a catalog number such as{' '}
          {example ? <code className="font-mono text-sm bg-white border border-slate-200 px-1.5 py-0.5 rounded">{example}</code> : 'the number from the nameplate'}{' '}
          and it returns every field it can resolve, plus a position-by-position map showing which
          character carried which value.
        </p>

        <dl className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Manufacturer</dt>
            <dd className="text-slate-900 font-medium">{manufacturer}</dd>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Frames</dt>
            <dd className="text-slate-900 font-medium">{frames}</dd>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Ratings</dt>
            <dd className="text-slate-900 font-medium">{ratings}</dd>
          </div>
        </dl>

        {identifies.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              What this decoder identifies
            </h2>
            <ul className="mb-10 grid sm:grid-cols-2 gap-x-8 gap-y-2">
              {identifies.map((item) => (
                <li key={item} className="text-slate-700 text-sm flex gap-2">
                  <span className="text-[#dc2626] font-bold flex-shrink-0" aria-hidden="true">&bull;</span>
                  {item}
                </li>
              ))}
            </ul>
          </>
        )}

        {alsoKnownAs.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Also sold or stamped as</h2>
            <p className="text-slate-700 mb-2">
              The same breaker family appears under several names depending on the era of the
              nameplate. This decoder covers numbers labelled:
            </p>
            <ul className="flex flex-wrap gap-2 mb-10">
              {alsoKnownAs.map((alias) => (
                <li
                  key={alias}
                  className="text-sm bg-white border border-slate-200 rounded-full px-3 py-1 text-slate-700"
                >
                  {alias}
                </li>
              ))}
            </ul>
          </>
        )}

        {faq.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {fullName} &mdash; common questions
            </h2>
            <div className="space-y-5 mb-10">
              {faq.map((item) => (
                <div key={item.q} className="bg-white border border-slate-200 rounded-lg p-5">
                  <h3 className="font-bold text-slate-900 mb-1.5">{item.q}</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <h2 className="text-xl font-bold text-slate-900 mb-4">Related resources</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <Link
            href={decoder.manualSearch}
            className="group bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-400 transition-colors"
          >
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-[#1a1a1a] flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-[#dc2626] transition-colors mb-1">
                  Free manuals for this equipment
                </h3>
                <p className="text-slate-600 text-sm">{decoder.manualSearchLabel}</p>
              </div>
            </div>
          </Link>

          {decoder.productPage ? (
            <Link
              href={decoder.productPage.href}
              className="group bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-400 transition-colors"
            >
              <div className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-[#1a1a1a] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-[#dc2626] transition-colors mb-1">
                    Buy or quote this breaker
                  </h3>
                  <p className="text-slate-600 text-sm">{decoder.productPage.label}</p>
                </div>
              </div>
            </Link>
          ) : (
            <Link
              href="/tools"
              className="group bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-400 transition-colors"
            >
              <div className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-[#1a1a1a] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-[#dc2626] transition-colors mb-1">
                    All breaker decoders
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Siemens, Eaton / Cutler-Hammer, GE and Square D catalog-number tools
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <WifiOff className="w-5 h-5 text-slate-500 flex-shrink-0" aria-hidden="true" />
          <p className="text-slate-700 text-sm flex-1">
            Working in a switchgear room with no signal? Every decoder also runs offline from a local
            folder.
          </p>
          <a
            href="/tools/offline.html"
            className="text-sm font-medium text-[#1a1a1a] underline underline-offset-2 hover:text-[#dc2626] flex-shrink-0"
          >
            Open the Offline Kit
          </a>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-6 text-white">
          <h2 className="font-bold text-lg mb-2">Can&#39;t read the nameplate?</h2>
          <p className="text-slate-300 text-sm mb-4">
            If the plate is painted over, corroded or missing digits, send us what you can read or a
            photo &mdash; our team identifies legacy and obsolete breakers every day, and sources the
            new-surplus or reconditioned replacement.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:1-800-458-4001"
              className="inline-flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
            >
              <Phone size={16} aria-hidden="true" />
              1-800-458-4001
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
            >
              Contact our team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
