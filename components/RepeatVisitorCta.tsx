'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Phone, Wrench } from 'lucide-react';
import LeadCaptureForm from '@/components/LeadCaptureForm';

/**
 * Repeat-visitor CTA pop-up for the decoder/tools section.
 *
 * Behaviour (all client-side, no backend, no cookies):
 *  - Counts ONE "visit" per browser session that lands on any /tools/* page
 *    (sessionStorage guard prevents a page refresh or in-tab navigation from
 *    inflating the count; localStorage persists the running total across sessions).
 *  - On the Nth qualifying visit (VISIT_THRESHOLD) it surfaces a quote-request
 *    modal after a short engagement delay — never on first paint, so it stays
 *    clear of Google's intrusive-interstitial rules.
 *  - Once shown, it records a dismissal timestamp and stays quiet for
 *    COOLDOWN_DAYS so it never nags.
 *  - Fires GA4 events (popup_shown / popup_dismissed) for conversion tracking.
 *
 * Trade-off: localStorage is per-device and resets in incognito / on storage
 * clear. That is acceptable — this is a soft engagement nudge, not billing.
 */

const VISIT_KEY = 'vm_tool_visits';        // localStorage: running visit count
const SESSION_KEY = 'vm_tool_counted';     // sessionStorage: counted this session?
const DISMISS_KEY = 'vm_cta_dismissed_at'; // localStorage: last dismissal (ms)

const VISIT_THRESHOLD = 3;   // show on the 3rd qualifying visit
const SHOW_DELAY_MS = 12_000; // wait for engagement before surfacing
const COOLDOWN_DAYS = 30;     // don't re-show within this window after dismissal

function track(event: string) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event, { event_category: 'repeat_visitor_cta' });
  }
}

export default function RepeatVisitorCta() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* storage unavailable — ignore */
    }
    track('popup_dismissed');
  }, []);

  // Count the visit and decide whether to schedule the pop-up.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    try {
      // 1. Count at most once per browser session.
      if (!sessionStorage.getItem(SESSION_KEY)) {
        const next = (parseInt(localStorage.getItem(VISIT_KEY) || '0', 10) || 0) + 1;
        localStorage.setItem(VISIT_KEY, String(next));
        sessionStorage.setItem(SESSION_KEY, '1');
      }

      const visits = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10) || 0;

      // 2. Respect the dismissal cooldown.
      const dismissedAt = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10) || 0;
      const cooldownActive =
        dismissedAt > 0 && Date.now() - dismissedAt < COOLDOWN_DAYS * 86_400_000;

      // 3. Schedule the pop-up if the visitor qualifies.
      if (visits >= VISIT_THRESHOLD && !cooldownActive) {
        timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
      }
    } catch {
      /* storage blocked (e.g. hardened privacy mode) — no pop-up, no error */
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  // When open: fire the impression event, focus the modal, wire ESC-to-close.
  useEffect(() => {
    if (!open) return;
    track('popup_shown');
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
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 print:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vm-cta-heading"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Card */}
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
            <Wrench size={18} strokeWidth={2.5} />
            <span className="text-xs font-bold uppercase tracking-wide">
              Need the actual part?
            </span>
          </div>

          <h2 id="vm-cta-heading" className="text-xl font-bold text-slate-900 leading-snug">
            Decoding is step one — Voyten stocks the breaker.
          </h2>
          <p className="text-sm text-slate-500 mt-2 mb-5">
            You&apos;ve been through our decoders a few times. If you&apos;re
            sourcing an obsolete or hard-to-find breaker, send the details and
            we&apos;ll quote it fast — or call our 24/7 line.
          </p>

          <LeadCaptureForm type="quote" sourcePage="repeat-visitor-cta" compact />

          <p className="text-xs text-slate-500 mt-4 flex items-center justify-center gap-2">
            <Phone size={13} />
            Emergency?{' '}
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
