import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { sendEmail } from '@/lib/email';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { validateCsrf } from '@/lib/csrf';

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

    // Store lead — ALL types are persisted to Turso (admin dashboard / analytics).
    const db = getDb();
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
        subject: `[Voyten Manuals] New Quote Request (RFQ) from ${name}`,
        html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a1a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 18px;">New Quote Request (RFQ) — Voyten Manuals</h1>
          </div>
          <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Name</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
              ${phone ? `<tr><td style="padding: 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Phone</td><td style="padding: 8px 0;"><a href="tel:${phone}">${phone}</a></td></tr>` : ''}
              ${company ? `<tr><td style="padding: 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Company</td><td style="padding: 8px 0;">${company}</td></tr>` : ''}
              ${manual_title ? `<tr><td style="padding: 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Related Manual</td><td style="padding: 8px 0;">${manual_title}</td></tr>` : ''}
              ${message ? `<tr><td style="padding: 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Message</td><td style="padding: 8px 0;">${message}</td></tr>` : ''}
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Source</td><td style="padding: 8px 0;">${source_page || 'Unknown'}</td></tr>
            </table>
          </div>
        </div>
      `,
        text: `New Quote Request (RFQ) from ${name}\nEmail: ${email}\nPhone: ${phone || '—'}\nCompany: ${company || '—'}\nManual: ${manual_title || '—'}\nMessage: ${message || '—'}\nSource: ${source_page || 'Unknown'}`,
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
