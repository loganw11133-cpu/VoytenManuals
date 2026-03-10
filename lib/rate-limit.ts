import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple in-memory rate limiter
 * Note: In serverless environments, this resets on cold starts
 * For production, consider using Redis or Upstash
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Maximum number of requests in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Identifier prefix (e.g., 'quote' or 'callback') */
  identifier: string;
}

/**
 * Check rate limit for a request
 * Returns error response if rate limited, null if allowed
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): NextResponse | null {
  // Get client identifier (IP address or forwarded IP)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0] ?? 'unknown';
  const key = `${config.identifier}:${ip}`;

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Start new window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return null;
  }

  // Check if rate limited
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
        },
      }
    );
  }

  // Increment counter
  entry.count++;
  return null;
}

/**
 * Common rate limit configurations
 */
export const RATE_LIMITS = {
  // Form submissions: 5 per minute per IP
  formSubmission: {
    maxRequests: 5,
    windowMs: 60 * 1000,
    identifier: 'form',
  },
  // Quote requests: 3 per minute per IP
  quoteRequest: {
    maxRequests: 3,
    windowMs: 60 * 1000,
    identifier: 'quote',
  },
  // Callback requests: 3 per minute per IP
  callbackRequest: {
    maxRequests: 3,
    windowMs: 60 * 1000,
    identifier: 'callback',
  },
} as const;
