import { NextRequest, NextResponse } from 'next/server';
import { createClient, Client } from '@libsql/client';

/**
 * Database-backed rate limiter — persists across serverless cold starts.
 * Uses the existing Turso DB with a rate_limit_entries table.
 * Falls back to allowing requests if the DB is unavailable.
 */

let _db: Client | null = null;
let _tableChecked = false;

function getDb(): Client {
  if (!_db) {
    _db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _db;
}

async function ensureTable(): Promise<void> {
  if (_tableChecked) return;
  try {
    await getDb().execute(`
      CREATE TABLE IF NOT EXISTS rate_limit_entries (
        key TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 1,
        reset_at INTEGER NOT NULL
      )
    `);
    _tableChecked = true;
  } catch {
    // Table may already exist or DB unavailable
    _tableChecked = true;
  }
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string;
}

/**
 * Check rate limit for a request.
 * Returns error response if rate limited, null if allowed.
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  try {
    await ensureTable();

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown';
    const key = `${config.identifier}:${ip}`;
    const now = Date.now();
    const db = getDb();

    // Clean expired entries occasionally (~1% of requests)
    if (Math.random() < 0.01) {
      db.execute({ sql: 'DELETE FROM rate_limit_entries WHERE reset_at < ?', args: [now] }).catch(() => {});
    }

    // Get current entry
    const result = await db.execute({
      sql: 'SELECT count, reset_at FROM rate_limit_entries WHERE key = ?',
      args: [key],
    });

    const row = result.rows[0];
    const entry = row ? { count: Number(row.count), reset_at: Number(row.reset_at) } : undefined;

    if (!entry || now > entry.reset_at) {
      // New window — upsert with count=1
      await db.execute({
        sql: `INSERT INTO rate_limit_entries (key, count, reset_at) VALUES (?, 1, ?)
              ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = ?`,
        args: [key, now + config.windowMs, now + config.windowMs],
      });
      return null;
    }

    // Check if over limit
    if (entry.count >= config.maxRequests) {
      const retryAfter = Math.ceil((entry.reset_at - now) / 1000);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) },
        }
      );
    }

    // Increment counter
    await db.execute({
      sql: 'UPDATE rate_limit_entries SET count = count + 1 WHERE key = ?',
      args: [key],
    });
    return null;
  } catch (error) {
    // If rate limiting fails, allow the request rather than blocking users
    console.error('Rate limit check failed:', error);
    return null;
  }
}

/**
 * Common rate limit configurations
 */
export const RATE_LIMITS = {
  formSubmission: {
    maxRequests: 5,
    windowMs: 60 * 1000,
    identifier: 'form',
  },
  adminAuth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 5 attempts per 15 minutes
    identifier: 'admin-auth',
  },
  adminApi: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 60 requests per minute for authenticated admin
    identifier: 'admin-api',
  },
  searchApi: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 requests per minute for public search
    identifier: 'search',
  },
} as const;
