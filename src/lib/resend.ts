import { Resend } from 'resend';
import { sanitizeHtml } from './sanitize';

const DEFAULT_FROM_EMAIL = 'Kanaka PAC <onboarding@resend.dev>';
const DEFAULT_REPLY_TO = 'support@vectorlocal.ca';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(apiKey);
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  /**
   * Display name the mail appears to come from. The sending address itself is
   * the platform's one verified address and is not a caller's choice.
   * Omitted, the configured from-address is used exactly as configured.
   */
  fromName?: string;
  replyTo?: string;
}

// Characters that cannot appear in an unquoted RFC 5322 display name.
const DISPLAY_NAME_SPECIALS = /[(),.:;<>@[\]"\\]/;

/**
 * Renders a display name safe to place in a from-header. A display name is
 * admin-entered text, so CR and LF are collapsed to a space — left in, they
 * would let the name inject headers of its own — and a name containing
 * RFC 5322 specials is quoted rather than emitted bare.
 */
function renderDisplayName(fromName: string): string {
  const name = fromName.replace(/[\r\n]+/g, ' ').trim();
  if (!name) return '';
  if (!DISPLAY_NAME_SPECIALS.test(name)) return name;
  return `"${name.replace(/([\\"])/g, '\\$1')}"`;
}

/** Pulls the bare address out of a configured from-value, if it holds one. */
function extractAddress(configured: string): string | undefined {
  const bracketed = configured.match(/<([^>]+)>/)?.[1]?.trim();
  if (bracketed) return bracketed;

  const bare = configured.trim();
  return bare.includes('@') ? bare : undefined;
}

/**
 * Builds the from-header. With no usable display name the configured value is
 * used verbatim, so an address configured with its own display name is
 * untouched. The address is always the platform's configured one; only the
 * display name varies per School.
 */
function buildFromHeader(fromName?: string): string {
  const configured = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
  if (!fromName) return configured;

  const name = renderDisplayName(fromName);
  const address = extractAddress(configured);
  if (!name || !address) return configured;

  return `${name} <${address}>`;
}

export async function sendEmail({ to, subject, html, fromName, replyTo }: SendEmailOptions) {
  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: buildFromHeader(fromName),
    to: Array.isArray(to) ? to : [to],
    replyTo: replyTo ?? DEFAULT_REPLY_TO,
    subject,
    html,
  });

  if (error) {
    console.error('Resend error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}

export function generateUnsubscribeUrl(email: string): string {
  const token = Buffer.from(email).toString('base64url');
  return `${BASE_URL}/api/unsubscribe?token=${token}`;
}

export function buildAnnouncementEmailHtml(
  title: string,
  content: string,
  unsubscribeUrl: string,
  pacName: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="border-bottom: 3px solid #1e40af; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="color: #1e40af; margin: 0;">${pacName}</h1>
      </div>
      <h2 style="color: #111827;">${title}</h2>
      <div style="color: #374151; line-height: 1.6;">
        ${content.replace(/\n/g, '<br>')}
      </div>
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280;">
        You received this email because you subscribed to ${pacName} updates.
        <br><a href="${unsubscribeUrl}" style="color: #6b7280;">Unsubscribe</a>
      </p>
    </body>
    </html>
  `;
}

export function buildEventEmailHtml(
  title: string,
  date: string,
  time: string,
  location: string,
  description: string,
  unsubscribeUrl: string,
  pacName: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="border-bottom: 3px solid #1e40af; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="color: #1e40af; margin: 0;">${pacName}</h1>
      </div>
      <h2 style="color: #111827;">New Event: ${title}</h2>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <p style="margin: 4px 0;"><strong>Date:</strong> ${date}</p>
        <p style="margin: 4px 0;"><strong>Time:</strong> ${time}</p>
        <p style="margin: 4px 0;"><strong>Location:</strong> ${location}</p>
      </div>
      <div style="color: #374151; line-height: 1.6;">
        ${description.replace(/\n/g, '<br>')}
      </div>
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280;">
        You received this email because you subscribed to ${pacName} updates.
        <br><a href="${unsubscribeUrl}" style="color: #6b7280;">Unsubscribe</a>
      </p>
    </body>
    </html>
  `;
}

export function buildArticleEmailHtml(
  title: string,
  author: string,
  body: string,
  unsubscribeUrl: string,
  pacName: string
): string {
  const safeBody = sanitizeHtml(body);
  const safeTitle = escapeHtml(title);
  const safeAuthor = escapeHtml(author);

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="border-bottom: 3px solid #1e40af; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="color: #1e40af; margin: 0;">${pacName}</h1>
      </div>
      <h2 style="color: #111827;">${safeTitle}</h2>
      <p style="color: #6b7280; font-size: 14px; margin-top: -8px;">By ${safeAuthor}</p>
      <div style="color: #374151; line-height: 1.6;">
        ${safeBody}
      </div>
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280;">
        You received this email because you subscribed to ${pacName} updates.
        <br><a href="${unsubscribeUrl}" style="color: #6b7280;">Unsubscribe</a>
      </p>
    </body>
    </html>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildContactEmailHtml(
  name: string,
  email: string,
  subject: string,
  message: string
): string {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="border-bottom: 3px solid #1e40af; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="color: #1e40af; margin: 0;">New Contact Form Submission</h1>
      </div>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <p style="margin: 4px 0;"><strong>Name:</strong> ${safeName}</p>
        <p style="margin: 4px 0;"><strong>Email:</strong> ${safeEmail}</p>
        <p style="margin: 4px 0;"><strong>Subject:</strong> ${safeSubject}</p>
      </div>
      <div style="color: #374151; line-height: 1.6;">
        <p style="margin: 0 0 8px 0;"><strong>Message:</strong></p>
        ${safeMessage}
      </div>
    </body>
    </html>
  `;
}

export function buildContactConfirmationHtml(name: string): string {
  const safeName = escapeHtml(name);

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="border-bottom: 3px solid #1e40af; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="color: #1e40af; margin: 0;">Kanaka PAC</h1>
      </div>
      <div style="color: #374151; line-height: 1.6;">
        <p>Hi ${safeName},</p>
        <p>Thank you for reaching out! We've received your message and our team will be in touch soon.</p>
      </div>
    </body>
    </html>
  `;
}

export function buildWelcomeEmailHtml(unsubscribeUrl: string, pacName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="border-bottom: 3px solid #1e40af; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="color: #1e40af; margin: 0;">${pacName}</h1>
      </div>
      <h2 style="color: #111827;">Welcome to ${pacName}!</h2>
      <div style="color: #374151; line-height: 1.6;">
        <p>Thank you for subscribing to ${pacName} updates. You are now part of our community!</p>
        <p>Here is what you can expect from us:</p>
        <ul>
          <li><strong>Announcements</strong> — Important news and notices from the PAC</li>
          <li><strong>Events</strong> — Upcoming meetings, fundraisers, and school events</li>
          <li><strong>Updates</strong> — News about what the PAC is working on for students and families</li>
        </ul>
        <p>We look forward to keeping you informed and involved.</p>
      </div>
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280;">
        You received this email because you subscribed to ${pacName} updates.
        <br><a href="${unsubscribeUrl}" style="color: #6b7280;">Unsubscribe</a>
      </p>
    </body>
    </html>
  `;
}

