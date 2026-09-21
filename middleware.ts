import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { record, dueForFlush, flush } from '@/lib/request-log';

/**
 * Edge middleware — runs BEFORE serverless functions.
 * Rate limits aggressive bot traffic to protect /manual/[slug] routes, and
 * keeps the site's own record of what traffic actually arrived.
 * Runs at Vercel's edge (~0ms overhead for normal users).
 *
 * The limiter used to allow 30 requests per 10s and then blackhole the IP with
 * a 429 for a full minute. That fires at three requests per second, which sits
 * inside normal Googlebot behaviour for a library this size (8,300+ manual
 * pages), so the crawlers robots.txt explicitly invites were being throttled on
 * the routes that matter. A Semrush audit on 10 Sep 2026 reported 147 "broken
 * link" errors across 100 crawled pages; every one of them was this middleware
 * answering 429, not a broken link. Two changes fix that without giving up the
 * abuse protection:
 *
 *   1. Search and AI crawlers get their own, much larger budget. They are still
 *      counted — a user agent is trivially spoofed, so an impostor stays capped
 *      — but the ceiling is far above any real crawl rate.
 *   2. Exceeding the budget now costs you the rest of the current window with a
 *      Retry-After, instead of a sticky 60-second block. A crawler that briefly
 *      bursts slows down; it no longer loses the next minute of URLs.
 */

// In-memory sliding window rate limiter (per edge region)
const hits = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 10_000; // 10 second window
const MAX_HITS = 90;      // 90 requests per 10s per IP (normal users do 1-3)
// Crawler budget — ~15 req/s. Still far above any real crawl rate for this
// library, but half the old 300. The test below is the user-agent STRING only,
// with no reverse-DNS check, so this number is also what an impostor claiming
// to be Googlebot receives. Keep it comfortably above honest crawlers and
// comfortably below anything that would hurt to serve.
const MAX_HITS_CRAWLER = 150;

/**
 * Search and AI crawlers. Kept in step with the agents named in app/robots.ts,
 * plus the classic search bots that robots.txt covers under `User-Agent: *`.
 */
const CRAWLER_UA =
  /(googlebot|google-inspectiontool|storebot-google|google-extended|googleother|bingbot|bingpreview|slurp|duckduckbot|baiduspider|yandex(bot)?|applebot|gptbot|chatgpt-user|oai-searchbot|claudebot|anthropic-ai|perplexitybot|xai-grok|facebookbot|meta-externalagent|cohere-ai|amazonbot|bytespider)/i;

// Clean up periodically to prevent memory growth
let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 30_000) return;
  lastCleanup = now;
  for (const [key, entry] of hits) {
    if (now - entry.windowStart > WINDOW_MS * 2) hits.delete(key);
  }
}

function tooMany(retryAfterMs: number) {
  return new NextResponse('Too Many Requests', {
    status: 429,
    headers: { 'Retry-After': String(Math.max(1, Math.ceil(retryAfterMs / 1000))) },
  });
}

/**
 * The matcher below is wide, so that the traffic record sees the whole site.
 * Rate limiting is NOT: it still applies only to /manual/* and /search, exactly
 * as before. Widening the matcher must never widen the throttle — the decoders
 * under /tools in particular are hand-carried into the field and must not meet
 * a 429.
 */
function isRateLimited(pathname: string): boolean {
  return pathname.startsWith('/manual/') || pathname === '/search';
}

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent');

  // Counters only — no IP, no UA string, no full URL. See lib/request-log.ts.
  record(pathname, userAgent, request.headers.get('x-vercel-ip-country'));
  if (dueForFlush()) event.waitUntil(flush());

  if (!isRateLimited(pathname)) return NextResponse.next();

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();

  cleanup();

  const limit = CRAWLER_UA.test(userAgent ?? '')
    ? MAX_HITS_CRAWLER
    : MAX_HITS;

  // Sliding window counter
  const entry = hits.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now });
  } else {
    entry.count++;
    if (entry.count > limit) {
      // Throttle for the remainder of this window only — the next window opens
      // normally, so a burst costs a pause rather than a minute of lost URLs.
      return tooMany(entry.windowStart + WINDOW_MS - now);
    }
  }

  return NextResponse.next();
}

/**
 * Every HTML route, so the traffic record is complete. Excluded: API routes,
 * Next internals, and anything with a file extension — those are assets, and
 * counting them would drown the signal without adding any.
 *
 * Remember that reaching the middleware is not the same as being throttled;
 * isRateLimited() above decides that, and still names only /manual/* and
 * /search.
 */
export const config = {
  matcher: [
    '/((?!api/|_next/|_vercel/|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2|ttf|eot|css|js|mjs|map)$).*)',
  ],
};
