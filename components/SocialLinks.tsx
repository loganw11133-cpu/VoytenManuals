/**
 * Voyten company link buttons — Google Business Profile, LinkedIn, eBay store.
 * White pill buttons with inline-SVG brand marks; readable on light or dark
 * backgrounds. Used on the homepage CTA card, the About page, and mirrored
 * (as static HTML) inside each /tools decoder.
 */

const GBP = 'https://share.google/8zeiyPVd68OB1smJW';
const LINKEDIN = 'https://www.linkedin.com/in/voyten-electric-sales-team/';
const EBAY = 'https://www.ebay.com/str/voytenelectric';

const pill =
  'inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 ' +
  'text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626]';

export default function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <nav
      aria-label="Connect with Voyten Electric"
      className={`flex flex-wrap items-center gap-2.5 ${className}`}
    >
      <a href={GBP} target="_blank" rel="noopener noreferrer" title="Voyten Electric on Google Business Profile" className={pill}>
        <svg viewBox="0 0 24 24" className="h-[18px] w-auto" aria-hidden="true">
          <rect x="4" y="11" width="16" height="9" rx="1" fill="#4989F5" />
          <path d="M3 11 L4.5 5 H19.5 L21 11 Z" fill="#3367D6" />
          <path d="M8 5 L7.2 11 H10 L10.3 5 Z" fill="#5B9BFF" />
          <path d="M14 5 L14 11 H16.8 L16 5 Z" fill="#5B9BFF" />
          <rect x="10" y="14" width="4" height="6" rx="0.5" fill="#ffffff" />
        </svg>
        Google Business
      </a>
      <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" title="Voyten Electric on LinkedIn" className={pill}>
        <svg viewBox="0 0 24 24" className="h-[18px] w-auto" aria-hidden="true">
          <rect width="24" height="24" rx="4" fill="#0A66C2" />
          <path fill="#ffffff" d="M8.34 18.34H5.67V9.75h2.67v8.59zM7 8.58a1.55 1.55 0 1 1 0-3.1 1.55 1.55 0 0 1 0 3.1zM18.34 18.34h-2.67v-4.18c0-1-.02-2.28-1.39-2.28-1.39 0-1.6 1.09-1.6 2.21v4.25h-2.67V9.75h2.56v1.17h.04c.36-.68 1.23-1.39 2.53-1.39 2.7 0 3.2 1.78 3.2 4.09v4.72z" />
        </svg>
        LinkedIn
      </a>
      <a href={EBAY} target="_blank" rel="noopener noreferrer" title="Voyten Electric eBay Store" className={pill}>
        <svg viewBox="0 0 84 34" className="h-[18px] w-auto" aria-hidden="true">
          <text x="0" y="27" fontFamily="Arial, Helvetica, sans-serif" fontSize="30" fontWeight="700" letterSpacing="-1.5">
            <tspan fill="#E53238">e</tspan><tspan fill="#0064D2">b</tspan><tspan fill="#F5AF02">a</tspan><tspan fill="#86B817">y</tspan>
          </text>
        </svg>
        Store
      </a>
    </nav>
  );
}
