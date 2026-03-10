import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates admin access for protected API routes
 * Requires ADMIN_API_KEY environment variable
 *
 * Usage in API routes:
 * ```
 * const authError = validateAdminAccess(request);
 * if (authError) return authError;
 * ```
 */
export function validateAdminAccess(request: NextRequest): NextResponse | null {
  const adminKey = process.env.ADMIN_API_KEY;

  // If no admin key is configured, deny access
  if (!adminKey) {
    console.error('ADMIN_API_KEY not configured');
    return NextResponse.json(
      { error: 'Admin access not configured' },
      { status: 503 }
    );
  }

  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  const providedKey = authHeader?.replace('Bearer ', '');

  if (!providedKey || providedKey !== adminKey) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return null; // No error, access granted
}

/**
 * Standard error response that doesn't leak internal details
 */
export function safeErrorResponse(message: string, status: number = 500): NextResponse {
  return NextResponse.json(
    { error: message },
    { status }
  );
}
