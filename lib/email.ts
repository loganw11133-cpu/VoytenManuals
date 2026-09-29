import nodemailer from 'nodemailer';

// Configure based on environment variables
// For Gmail: set EMAIL_HOST=smtp.gmail.com, EMAIL_USER=your@gmail.com, EMAIL_PASS=app-password
// For Resend: set RESEND_API_KEY and use their API directly

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendResult {
  ok: boolean;
  transport: 'resend' | 'smtp' | 'none';
  status?: number;
  id?: string;
  error?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  return (await sendEmailDetailed(options)).ok;
}

/** Like sendEmail, but reports Resend's status, message id and error text. */
export async function sendEmailDetailed(options: EmailOptions): Promise<SendResult> {
  try {
    if (process.env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Voyten Manuals <noreply@voytenmanuals.com>',
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        // Resend's error text (e.g. invalid key, unverified domain) — without it the
        // Vercel logs only say the forward failed, not why.
        const error = body?.message || body?.name || response.statusText;
        console.error(`[email] Resend rejected the send: HTTP ${response.status} — ${error}`);
        return { ok: false, transport: 'resend', status: response.status, error };
      }
      return { ok: true, transport: 'resend', status: response.status, id: body?.id };
    }

    const sent = await sendViaSmtp(options);
    return { ok: sent, transport: process.env.EMAIL_HOST ? 'smtp' : 'none' };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { ok: false, transport: process.env.RESEND_API_KEY ? 'resend' : 'smtp', error: String(error) };
  }
}

async function sendViaSmtp(options: EmailOptions): Promise<boolean> {
  try {
    // Fall back to SMTP (Gmail or other)
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    }

    console.warn('No email configuration found. Email not sent.');
    return false;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

