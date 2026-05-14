import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getSubscribers, getSchoolSettings } from '@/lib/data';
import {
  sendEmail,
  generateUnsubscribeUrl,
  buildAnnouncementEmailHtml,
  buildEventEmailHtml,
} from '@/lib/resend';

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { type, subject, title, content, date, time, location, description } = body;

  if (!subject || !type) {
    return NextResponse.json({ error: 'Subject and type are required' }, { status: 400 });
  }

  const subscribers = await getSubscribers();
  if (subscribers.length === 0) {
    return NextResponse.json({ error: 'No subscribers to send to' }, { status: 400 });
  }

  const settings = await getSchoolSettings();
  let sentCount = 0;
  const errors: string[] = [];

  for (const subscriber of subscribers) {
    const unsubscribeUrl = generateUnsubscribeUrl(subscriber.email);

    let html: string;
    if (type === 'event') {
      html = buildEventEmailHtml(
        title, date, time, location, description, unsubscribeUrl, settings.pacName
      );
    } else {
      html = buildAnnouncementEmailHtml(
        title || subject, content, unsubscribeUrl, settings.pacName
      );
    }

    try {
      await sendEmail({ to: subscriber.email, subject, html });
      sentCount++;
    } catch {
      errors.push(subscriber.email);
    }
  }

  return NextResponse.json({
    success: true,
    sentCount,
    totalSubscribers: subscribers.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}