'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Phone, FileText } from 'lucide-react';
import LeadCaptureForm from '@/components/LeadCaptureForm';

/**
 * On-demand "Get Quote — Configured to Spec" modal for the decoder tools.
 *
 * The decoders are static HTML in a same-origin iframe; their "Get Quote" button
 * (decoder-quote.js) postMessages the decoded catalog + spec up to this component,
 * which renders a real viewport-centered overlay and reuses the site's existing
 * CSRF-protected LeadCaptureForm — the message body is pre-filled with the spec.
 *
 * Mounted once in app/tools/layout.tsx, so it is live on every /tools/* page.
 */

interface QuotePayload {
  catalog: string;
  decoder: string;
  summary: string;
  path: string;
}

function track(event: string) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event, { event_category: 'decoder_quote' });
  }
}

export default function DecoderQuoteModal() {
  const [payload, setPayload] = useState<QuotePayload | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setPayload(null), []);

  // Listen for the decoder iframe's "openQuote" message (same-origin only).
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data;
      if (!d || d.__voytenDecoder !== true || d.action !== 'openQuote') return;
      setPayload({
        catalog: String(d.catalog || '').slice(0, 200),
        decoder: String(d.decoder || 'Circuit Breaker Decoder').slice(0, 200),
        summary: String(d.summary || '').slice(0, 5000),
        path: String(d.path || '').slice(0, 500),
      });
      track('quote_modal_opened');
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // When open: focus, ESC-to-close, lock body scroll.
  useEffect(() => {
    if (!payload) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [payload, close]);

  if (!payload) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 print:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vm-quote-heading"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 max-h-[90vh] overflow-y-auto">
        <button
          ref={closeRef}
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626]"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-7">
          <div className="flex items-center gap-2 mb-3 text-[#dc2626]">
            <FileText size={18} strokeWidth={2.5} />
            <span className="text-xs font-bold uppercase tracking-wide">Configured to Spec</span>
          </div>

          <h2 id="vm-quote-heading" className="text-xl font-bold text-slate-900 leading-snug">
            Request a quote for this exact build
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            We&apos;ve attached your decoded configuration below. Add your contact info and
            we&apos;ll quote it fast — or call our 24/7 line.
          </p>

          <div className="mt-4 mb-5 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Catalog / Part Number
            </div>
            <div className="font-mono text-sm font-semibold text-slate-800 break-all">
              {payload.catalog}
            </div>
          </div>

          <LeadCaptureForm
            key={payload.catalog}
            type="quote"
            compact
            manualTitle={`${payload.decoder} — ${payload.catalog}`}
            sourcePage={payload.path || 'decoder-quote'}
            initialMessage={payload.summary}
          />

          <p className="text-xs text-slate-500 mt-4 flex items-center justify-center gap-2">
            <Phone size={13} />
            Need it now?{' '}
            <a href="tel:1-800-458-4001" className="font-bold text-slate-700 underline">
              1-800-458-4001
            </a>{' '}
            · 24/7
          </p>
        </div>
      </div>
    </div>
  );
}
