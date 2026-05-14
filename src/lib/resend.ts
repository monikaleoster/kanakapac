import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Kanaka PAC <onboarding@resend.dev>';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: Array.isArray(to) ? to : [to],
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

export { resend };