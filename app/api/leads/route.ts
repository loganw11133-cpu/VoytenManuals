import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { sendEmail } from '@/lib/email';

function getDb() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, email, phone, company, message, manual_id, manual_title, source_page } = body;

    if (!name || !email || !type) {
      return NextResponse.json({ error: 'Name, email, and type are required' }, { status: 400 });
    }

    // Store lead
    const db = getDb();
    await db.execute({
      sql: `INSERT INTO lead_submissions (type, name, email, phone, company, message, manual_id, manual_title, source_page)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [type, name, email, phone || null, company || null, message || null, manual_id || null, manual_title || null, source_page || null],
    });

    // Send notification email
    const typeLabels: Record<string, string> = {
      'quote': 'Quote Request',
      'manual-request': 'Manual Request',
      'contact': 'Contact Form',
    };

    await sendEmail({
      to: process.env.LEAD_NOTIFICATION_EMAIL || 'info@voytenelectric.com',
      subject: `[Voyten Manuals] New ${typeLabels[type] || 'Lead'} from ${name}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a1a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 18px;">New ${typeLabels[type] || 'Lead'} — Voyten Manuals</h1>
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
      text: `New ${typeLabels[type]} from ${name}\nEmail: ${email}\nPhone: ${phone}\nCompany: ${company}\nManual: ${manual_title}\nMessage: ${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
