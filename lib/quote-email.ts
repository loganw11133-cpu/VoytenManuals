// The RFQ notification sent to sales. Shared by the live form (/api/leads) and the
// admin resend of a stored lead, so both deliver the identical message.

export interface QuoteLead {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message?: string | null;
  manual_title?: string | null;
  source_page?: string | null;
}

// Every field is customer-entered, so escape it before it goes into the HTML body.
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const LABEL = 'padding: 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase;';

function row(label: string, value: string, extraStyle = ''): string {
  return `<tr><td style="${LABEL}">${label}</td><td style="padding: 8px 0;${extraStyle}">${value}</td></tr>`;
}

/** `submittedAt` is set only on a resend, so sales can see the lead is not new. */
export function buildQuoteEmail(lead: QuoteLead, submittedAt?: string) {
  const { name, email, phone, company, message, manual_title, source_page } = lead;
  const resent = submittedAt ? ` (resent — originally submitted ${submittedAt} UTC)` : '';

  const html = `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a1a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 18px;">New Quote Request (RFQ) — Voyten Manuals</h1>
            ${submittedAt ? `<p style="margin: 8px 0 0; font-size: 13px; color: #fca5a5;">Resent — originally submitted ${esc(submittedAt)} UTC</p>` : ''}
          </div>
          <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: 0;">
            <table style="width: 100%; border-collapse: collapse;">
              ${row('Name', esc(name), ' font-weight: 600;')}
              ${row('Email', `<a href="mailto:${esc(email)}">${esc(email)}</a>`)}
              ${phone ? row('Phone', `<a href="tel:${esc(phone)}">${esc(phone)}</a>`) : ''}
              ${company ? row('Company', esc(company)) : ''}
              ${manual_title ? row('Related Manual', esc(manual_title)) : ''}
              ${message ? row('Message', esc(message).replace(/\n/g, '<br>')) : ''}
              ${row('Source', esc(source_page || 'Unknown'))}
            </table>
          </div>
        </div>
      `;

  return {
    subject: `[Voyten Manuals] New Quote Request (RFQ) from ${name}${resent}`,
    html,
    text: `New Quote Request (RFQ) from ${name}${resent}\nEmail: ${email}\nPhone: ${phone || '—'}\nCompany: ${company || '—'}\nManual: ${manual_title || '—'}\nMessage: ${message || '—'}\nSource: ${source_page || 'Unknown'}`,
  };
}
