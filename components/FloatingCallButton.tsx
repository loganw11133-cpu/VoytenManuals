import { Phone } from 'lucide-react';

/**
 * Sitewide floating call button — fixed bottom-right circular FAB linking to the
 * 24/7 Voyten hotline. Keeps the emergency line one tap away on every page
 * (especially mobile). Pure anchor, no client JS. Hidden on print.
 */
export default function FloatingCallButton() {
  return (
    <a
      href="tel:1-800-458-4001"
      aria-label="Call Voyten — 1-800-458-4001"
      title="Call Voyten — 1-800-458-4001"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#dc2626] text-white shadow-lg shadow-black/25 ring-1 ring-black/5 transition-transform duration-150 hover:scale-110 hover:bg-[#b91c1c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626] focus-visible:ring-offset-2 print:hidden"
    >
      <Phone size={22} strokeWidth={2.5} />
    </a>
  );
}
