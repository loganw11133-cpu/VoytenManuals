import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { sendEmail } from '@/lib/email';
import { buildQuoteEmail } from '@/lib/quote-email';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { validateCsrf } from '@/lib/csrf';
import { checkLeadSpam } from '@/lib/spam-filter';

function getDb() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  // CSRF protection
  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  // Rate limit: 5 submissions per minute per IP
  const rateLimited = await checkRateLimit(request, RATE_LIMITS.formSubmission);
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const { type, name, email, phone, company, message, manual_id, manual_title, source_page } = body;

    if (!name || !email || !type) {
      return NextResponse.json({ error: 'Name, email, and type are required' }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Input length validation — prevent DB bloat from oversized submissions
    const MAX_LENGTHS: Record<string, number> = {
      name: 200, email: 254, phone: 30, company: 200,
      message: 5000, type: 30, manual_title: 500, source_page: 500,
    };

    for (const [field, maxLen] of Object.entries(MAX_LENGTHS)) {
      const val = body[field];
      if (typeof val === 'string' && val.length > maxLen) {
        return NextResponse.json(
          { error: `${field} exceeds maximum length of ${maxLen} characters` },
          { status: 400 }
        );
      }
    }

    const db = getDb();

    // Spam gate. A rejected lead gets the same {success:true} a real one does, so a
    // bot learns nothing; it is kept in lead_spam (not lead_submissions) and never
    // emailed, so a false positive can still be recovered by hand.
    const verdict = checkLeadSpam(body);
    if (verdict.spam) {
      console.warn(`[leads] spam rejected (${verdict.reasons.join(', ')}) email="${email}"`);
      try {
        await db.execute(`CREATE TABLE IF NOT EXISTS lead_spam (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reasons TEXT, score INTEGER, payload TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
        await db.execute({
          sql: 'INSERT INTO lead_spam (reasons, score, payload) VALUES (?, ?, ?)',
          args: [verdict.reasons.join(','), verdict.score, JSON.stringify(body).slice(0, 8000)],
        });
      } catch (err) {
        console.error('[leads] could not log rejected spam:', err);
      }
      return NextResponse.json({ success: true });
    }

    // Store lead — ALL types are persisted to Turso (admin dashboard / analytics).
    const insert = await db.execute({
      sql: `INSERT INTO lead_submissions (type, name, email, phone, company, message, manual_id, manual_title, source_page)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [type, name, email, phone || null, company || null, message || null, manual_id || null, manual_title || null, source_page || null],
    });
    const leadId = insert.lastInsertRowid?.toString() ?? 'unknown';

    // Forward to sales ONLY for RFQ / Quote requests. Other lead types
    // (manual-request, contact) are captured in the DB but do not notify sales.
    if (type === 'quote') {
      // Recipient is env-only — no email address is hardcoded in this public repo
      // (prevents address-harvesting / spam). If unset, the lead is still safely
      // stored in Turso; we log loudly rather than send to a placeholder.
      const to = process.env.LEAD_NOTIFICATION_EMAIL;
      const sent = to ? await sendEmail({
        to,
        ...buildQuoteEmail({ name, email, phone, company, message, manual_title, source_page }),
      }) : false;

      if (!sent) {
        // Lead is safely stored; only the notification failed (or no recipient is
        // configured). Make it visible in the Vercel logs so it can be recovered
        // from the DB / admin dashboard.
        console.error(
          to
            ? `[leads] Quote lead #${leadId} STORED but email forward to recipient FAILED ` +
              `(check RESEND_API_KEY or EMAIL_HOST/EMAIL_USER/EMAIL_PASS in Vercel env). ` +
              `name="${name}" email="${email}"`
            : `[leads] Quote lead #${leadId} STORED but NOT forwarded: ` +
              `LEAD_NOTIFICATION_EMAIL is not set in the Vercel environment. ` +
              `name="${name}" email="${email}"`
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
