import { Phone } from 'lucide-react';

/**
 * Sitewide floating call button — fixed bottom-right circular FAB linking to the
 * 24/7 Voyten hotline. On desktop (lg+) it expands into a "Call Us" pill on hover;
 * on mobile it stays a tap-to-call circle. Icon stays pinned to the corner; the
 * label grows to its left. Pure anchor, no client JS. Hidden on print.
 */
export default function FloatingCallButton() {
  return (
    <a
      href="tel:1-800-458-4001"
      aria-label="Call Voyten — 1-800-458-4001"
      title="Call Voyten — 1-800-458-4001"
      className="group fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex h-14 items-center rounded-full bg-[#dc2626] text-white shadow-lg shadow-black/25 ring-1 ring-black/5 transition-colors duration-150 hover:bg-[#b91c1c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626] focus-visible:ring-offset-2 print:hidden"
    >
      <span className="hidden lg:block max-w-0 overflow-hidden whitespace-nowrap font-semibold tracking-wide transition-all duration-200 ease-out group-hover:max-w-[240px] group-hover:pl-5">
        Call Us&nbsp;&middot;&nbsp;1-800-458-4001
      </span>
      <span className="grid h-14 w-14 shrink-0 place-items-center">
        <Phone size={22} strokeWidth={2.5} />
      </span>
    </a>
  );
}
