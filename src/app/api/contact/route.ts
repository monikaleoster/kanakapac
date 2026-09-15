import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, buildContactEmailHtml, buildContactConfirmationHtml } from '@/lib/resend';

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { name, email, subject, message } = body;

  const fields = { name, email, subject, message };
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value !== 'string' || value.trim() === '') {
      return NextResponse.json(
        { error: `${key} is required` },
        { status: 400 }
      );
    }
  }

  const recipient = process.env.CONTACT_EMAIL ?? 'kcpactreasurer@gmail.com';

  try {
    await Promise.all([
      sendEmail({
        to: recipient,
        replyTo: email,
        subject: `[Contact Form] ${subject}`,
        html: buildContactEmailHtml(name, email, subject, message),
      }),
      sendEmail({
        to: email,
        subject: 'We received your message — Kanaka PAC',
        html: buildContactConfirmationHtml(name),
      }),
    ]);
  } catch (err) {
    console.error('Failed to send contact form emails:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
