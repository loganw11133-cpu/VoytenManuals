import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge middleware — runs BEFORE serverless functions.
 * Rate limits aggressive bot traffic to protect /manual/[slug] routes.
 * Runs at Vercel's edge (~0ms overhead for normal users).
 */

// In-memory sliding window rate limiter (per edge region)
const hits = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 10_000; // 10 second window
const MAX_HITS = 30;      // 30 requests per 10s per IP (normal users do 1-3)
const BLOCK_DURATION = 60_000; // Block for 60s after exceeding
const blocked = new Map<string, number>();

// Clean up periodically to prevent memory growth
let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 30_000) return;
  lastCleanup = now;
  for (const [key, time] of blocked) {
    if (now > time) blocked.delete(key);
  }
  for (const [key, entry] of hits) {
    if (now - entry.windowStart > WINDOW_MS * 2) hits.delete(key);
  }
}

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();

  cleanup();

  // Check if currently blocked
  const blockedUntil = blocked.get(ip);
  if (blockedUntil && now < blockedUntil) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': '60' },
    });
  }

  // Sliding window counter
  const entry = hits.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now });
  } else {
    entry.count++;
    if (entry.count > MAX_HITS) {
      blocked.set(ip, now + BLOCK_DURATION);
      hits.delete(ip);
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': '60' },
      });
    }
  }

  return NextResponse.next();
}

// Only apply to manual pages and search — not static assets, API, or tools
export const config = {
  matcher: ['/manual/:path*', '/search'],
};
