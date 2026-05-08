// Vercel serverless function — receives form POST, sends email via Resend
// Requires environment variable: RESEND_API_KEY

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Where registration emails are delivered. Update once your domain is verified in Resend.
const DESTINATION = process.env.REGISTRATION_EMAIL || 'hello@codepet.academy';

// Resend requires a verified sender domain. Until you verify codepet.academy,
// you can use Resend's onboarding sandbox sender (which only delivers to your verified email).
const SENDER = process.env.REGISTRATION_SENDER || 'Codepet Academy <onboarding@resend.dev>';

export default async function handler(req, res) {
  // CORS for safety (tightens to same-origin in production via Vercel routing)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  // Basic email shape check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: SENDER,
      to: [DESTINATION],
      reply_to: email,
      subject: `New Codepet Academy registration: ${name}`,
      html: `
        <div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
          <h2 style="margin: 0 0 16px; color: #9538CF;">New cohort registration</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 100px;"><strong>Name</strong></td>
              <td style="padding: 8px 0;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Email</strong></td>
              <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Submitted</strong></td>
              <td style="padding: 8px 0; color: #666;">${new Date().toUTCString()}</td>
            </tr>
          </table>
          <p style="margin: 24px 0 0; padding: 16px; background: #FCFAED; border-radius: 8px; font-size: 13px; color: #555;">
            Reply directly to this email to respond to ${escapeHtml(name)}.
          </p>
        </div>
      `,
      text: `New Codepet Academy registration\n\nName: ${name}\nEmail: ${email}\nSubmitted: ${new Date().toUTCString()}`,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: error.message || 'Email delivery failed.' });
    }

    // Log to Google Sheet (non-fatal — registration succeeds even if sheet write fails)
    logToSheet({
      name,
      email,
      source: req.headers['referer'] || 'codepet-academy',
      userAgent: req.headers['user-agent'] || ''
    }).catch((e) => console.error('Sheet logging failed (non-fatal):', e));

    return res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Unhandled error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

async function logToSheet({ name, email, source, userAgent }) {
  const url = process.env.SHEET_WEBHOOK_URL;
  const secret = process.env.SHEET_WEBHOOK_SECRET;
  if (!url || !secret) return; // skip if not configured

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, name, email, source, userAgent }),
    redirect: 'follow'
  });
  if (!response.ok) {
    throw new Error(`Sheet webhook returned ${response.status}`);
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
