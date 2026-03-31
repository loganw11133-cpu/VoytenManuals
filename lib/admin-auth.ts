import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * Validates admin access for protected API routes.
 * Uses timing-safe comparison to prevent timing attacks.
 * Rate limits authentication attempts to prevent brute force.
 */
export async function validateAdminAccess(request: NextRequest): Promise<NextResponse | null> {
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    console.error('ADMIN_API_KEY not configured');
    return NextResponse.json(
      { error: 'Admin access not configured' },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get('Authorization');
  const providedKey = authHeader?.replace('Bearer ', '');

  if (!providedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit auth attempts before checking the key
  const rateLimited = await checkRateLimit(request, RATE_LIMITS.adminAuth);
  if (rateLimited) return rateLimited;

  // Timing-safe comparison — prevents timing attacks that could leak key length/content
  const isValid = safeCompare(providedKey, adminKey);

  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit authenticated admin API usage
  const apiRateLimited = await checkRateLimit(request, RATE_LIMITS.adminApi);
  if (apiRateLimited) return apiRateLimited;

  return null;
}

/**
 * Timing-safe string comparison.
 * Pads shorter string to match length so comparison time doesn't leak info.
 */
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a.padEnd(64, '\0'));
  const bufB = Buffer.from(b.padEnd(64, '\0'));
  // Lengths must match for timingSafeEqual
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Standard error response that doesn't leak internal details
 */
export function safeErrorResponse(message: string, status: number = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
