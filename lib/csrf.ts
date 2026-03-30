import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHmac } from 'crypto';

const CSRF_COOKIE_NAME = '__csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_SECRET = process.env.CSRF_SECRET || randomBytes(32).toString('hex');
const TOKEN_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Generate a signed CSRF token: timestamp.signature
 */
function generateToken(): string {
  const timestamp = Date.now().toString(36);
  const nonce = randomBytes(8).toString('hex');
  const payload = `${timestamp}.${nonce}`;
  const sig = createHmac('sha256', CSRF_SECRET).update(payload).digest('hex').slice(0, 16);
  return `${payload}.${sig}`;
}

/**
 * Verify a CSRF token's signature and expiry
 */
function verifyToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [timestamp, nonce, sig] = parts;
  const payload = `${timestamp}.${nonce}`;
  const expectedSig = createHmac('sha256', CSRF_SECRET).update(payload).digest('hex').slice(0, 16);

  if (sig !== expectedSig) return false;

  // Check expiry
  const created = parseInt(timestamp, 36);
  if (isNaN(created) || Date.now() - created > TOKEN_TTL_MS) return false;

  return true;
}

/**
 * Validate CSRF token on a POST request.
 * Compares the cookie value against the header value (double-submit pattern).
 * Returns an error response if invalid, null if valid.
 */
export function validateCsrf(request: NextRequest): NextResponse | null {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return NextResponse.json(
      { error: 'Missing security token. Please refresh the page and try again.' },
      { status: 403 }
    );
  }

  if (cookieToken !== headerToken) {
    return NextResponse.json(
      { error: 'Invalid security token. Please refresh the page and try again.' },
      { status: 403 }
    );
  }

  if (!verifyToken(cookieToken)) {
    return NextResponse.json(
      { error: 'Expired security token. Please refresh the page and try again.' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * API route handler: GET /api/csrf — sets a CSRF cookie and returns the token.
 * The client reads the token and sends it back as a header on POST requests.
 */
export function generateCsrfResponse(): NextResponse {
  const token = generateToken();
  const res = NextResponse.json({ csrfToken: token });

  res.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Client JS needs to read it
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: TOKEN_TTL_MS / 1000,
  });

  return res;
}
