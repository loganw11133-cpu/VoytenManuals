import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { validateAdminAccess } from '@/lib/admin-auth';
import { sendEmailDetailed } from '@/lib/email';
import { buildQuoteEmail } from '@/lib/quote-email';

/**
 * POST /api/admin/resend-lead?id=<lead id>
 *
 * Admin-only. Re-sends a quote lead already stored in Turso to LEAD_NOTIFICATION_EMAIL,
 * for leads whose original forward failed. Reads the row; never writes one, so the
 * lead is not duplicated. The subject is marked as a resend with the original date.
 * Returns Resend's status and message id (or its error text).
 *
 * Usage: curl -X POST -H "Authorization: Bearer $ADMIN_API_KEY" \
 *   "https://www.voytenmanuals.com/api/admin/resend-lead?id=69"
 */
export async function POST(request: NextRequest) {
  const authError = await validateAdminAccess(request);
  if (authError) return authError;

  const id = Number(request.nextUrl.searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, message: 'Pass ?id=<lead id>' }, { status: 400 });
  }

  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!to) {
    return NextResponse.json({ ok: false, message: 'LEAD_NOTIFICATION_EMAIL is not set' }, { status: 503 });
  }

  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const { rows } = await db.execute({ sql: 'SELECT * FROM lead_submissions WHERE id = ?', args: [id] });
  const lead = rows[0];
  if (!lead) {
    return NextResponse.json({ ok: false, message: `No lead #${id}` }, { status: 404 });
  }
  if (lead.type !== 'quote') {
    return NextResponse.json({ ok: false, message: `Lead #${id} is '${lead.type}', not a quote` }, { status: 400 });
  }

  const result = await sendEmailDetailed({
    to,
    ...buildQuoteEmail(
      {
        name: lead.name as string,
        email: lead.email as string,
        phone: lead.phone as string | null,
        company: lead.company as string | null,
        message: lead.message as string | null,
        manual_title: lead.manual_title as string | null,
        source_page: lead.source_page as string | null,
      },
      lead.created_at as string,
    ),
  });

  return NextResponse.json({ ...result, lead: id, to }, { status: result.ok ? 200 : 502 });
}
