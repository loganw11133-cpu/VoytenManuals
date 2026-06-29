import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAccess } from '@/lib/admin-auth';
import { sendEmail } from '@/lib/email';

/**
 * GET /api/admin/test-email
 *
 * Admin-only diagnostic. Verifies the email transport that powers RFQ/Quote
 * forwarding is configured and can actually deliver to the configured recipient
 * (LEAD_NOTIFICATION_EMAIL). Reports which transport is detected WITHOUT exposing
 * any secrets. No recipient address is hardcoded here (public repo).
 *
 * Usage: curl -H "Authorization: Bearer $ADMIN_API_KEY" \
 *   https://www.voytenmanuals.com/api/admin/test-email
 */
export async function GET(request: NextRequest) {
  const authError = await validateAdminAccess(request);
  if (authError) return authError;

  const transport = process.env.RESEND_API_KEY
    ? 'resend'
    : process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS
      ? 'smtp'
      : 'none';

  const to = process.env.LEAD_NOTIFICATION_EMAIL;

  if (!to) {
    return NextResponse.json(
      {
        ok: false,
        transport,
        to: null,
        message:
          'LEAD_NOTIFICATION_EMAIL is not set in the Vercel project environment. ' +
          'Quote/RFQ leads are stored in Turso but will NOT be forwarded until it is set.',
      },
      { status: 503 }
    );
  }

  if (transport === 'none') {
    return NextResponse.json(
      {
        ok: false,
        transport,
        to,
        message:
          'No email transport configured. Set RESEND_API_KEY, or EMAIL_HOST/EMAIL_USER/EMAIL_PASS (and optionally EMAIL_FROM / LEAD_NOTIFICATION_EMAIL), in the Vercel project environment.',
      },
      { status: 503 }
    );
  }

  const sent = await sendEmail({
    to,
    subject: '[Voyten Manuals] Email delivery test',
    html: `<p>This is a delivery test from the Voyten Manuals lead-forwarding system.</p>
           <p>If you received this, RFQ/Quote forwarding to <strong>${to}</strong> via <strong>${transport}</strong> is working.</p>`,
    text: `Delivery test from Voyten Manuals lead forwarding. If you received this, RFQ/Quote forwarding to ${to} via ${transport} is working.`,
  });

  return NextResponse.json(
    {
      ok: sent,
      transport,
      to,
      message: sent
        ? `Test email dispatched via ${transport} to ${to}. Check the inbox to confirm receipt.`
        : `Transport '${transport}' is configured but the send failed — verify the credentials and that the sender domain/address (EMAIL_FROM) is authorized.`,
    },
    { status: sent ? 200 : 502 }
  );
}
