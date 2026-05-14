# Implementation Plan: Email Subscription with Resend API

## Overview

The Kanaka PAC website already has subscriber collection in place (`/api/subscribe`, `data/subscribers.json`, `SubscribeForm` component, admin subscribers page). What's missing is the **email-sending layer** using Resend, an **unsubscribe flow**, and a **real admin compose UI**.

---

## Prerequisites

- [Resend](https://resend.com) account (free tier: 100 emails/day, 3,000/month)
- Verified sender domain in Resend dashboard (or use `onboarding@resend.dev` for testing)

---

## Step 1: Install Resend SDK

```bash
npm install resend
```

---

## Step 2: Environment Variables

Add to `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=Kanaka PAC <updates@kanakapac.com>
NEXT_PUBLIC_BASE_URL=https://kanakapac.com
```

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | API key from Resend dashboard |
| `RESEND_FROM_EMAIL` | Verified sender address (use `onboarding@resend.dev` for dev) |
| `NEXT_PUBLIC_BASE_URL` | Site URL for constructing unsubscribe links |

---

## Step 3: Create Email Utility — `src/lib/resend.ts`

Initializes the Resend client and provides helper functions for sending emails.

```typescript
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

export { resend };
```

**Design notes:**
- Uses `base64url` encoding of the email for unsubscribe tokens (simple, stateless)
- Sends emails individually to include personalized unsubscribe links per subscriber

---

## Step 4: Create Unsubscribe Endpoint — `src/app/api/unsubscribe/route.ts`

Public endpoint — no auth required. Returns an HTML confirmation page.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { deleteSubscriber } from '@/lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Invalid unsubscribe link' }, { status: 400 });
  }

  try {
    const email = Buffer.from(token, 'base64url').toString('utf-8');

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    await deleteSubscriber(email);

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
      <head><title>Unsubscribed</title><meta charset="utf-8"></head>
      <body style="font-family: sans-serif; text-align: center; padding: 60px 20px;">
        <h1 style="color: #111827;">Unsubscribed Successfully</h1>
        <p style="color: #6b7280;">You have been removed from the Kanaka PAC mailing list.</p>
        <p><a href="/" style="color: #1e40af;">Return to website</a></p>
      </body>
      </html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Unsubscribe failed' }, { status: 500 });
  }
}
```

**Design notes:**
- Uses GET so the unsubscribe link works with a single click from email clients
- Returns rendered HTML rather than JSON so users see a confirmation page

---

## Step 5: Create Send Email Endpoint — `src/app/api/send-email/route.ts`

Admin-protected endpoint to trigger emails to all subscribers.

```typescript
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
    return NextResponse.json(
      { error: 'Subject and type are required' },
      { status: 400 }
    );
  }

  const subscribers = await getSubscribers();
  if (subscribers.length === 0) {
    return NextResponse.json(
      { error: 'No subscribers to send to' },
      { status: 400 }
    );
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
    } catch (err) {
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
```

---

## Step 6: Update Middleware — `src/middleware.ts`

Add `/admin/subscribers/:path*` to the matcher so the admin subscribers page is protected:

```typescript
export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/events/:path*",
    "/admin/minutes/:path*",
    "/admin/announcements/:path*",
    "/admin/subscribers/:path*"   // <-- add this
  ]
};
```

---

## Step 7: Update Admin Subscribers Page — `src/app/admin/subscribers/page.tsx`

Replace the simulated "Send Update" button with a real email composition modal.

**Key changes:**

1. Add a modal with fields: subject, message body (textarea), type selector (announcement/custom)
2. Modal submit calls `POST /api/send-email`
3. Show sending progress and results ("Sent to 23/25 subscribers")

**New state:**

```typescript
const [showEmailModal, setShowEmailModal] = useState(false);
const [emailForm, setEmailForm] = useState({
  subject: '',
  content: '',
  type: 'announcement'
});
const [sending, setSending] = useState(false);
const [sendResult, setSendResult] = useState<{
  sentCount: number;
  totalSubscribers: number
} | null>(null);
```

---

## Step 8 (Optional): Auto-Notify on Publish

In the admin announcements page, after successfully creating a new announcement, prompt:

```typescript
const shouldNotify = confirm(
  'Announcement saved! Would you like to email this to all subscribers?'
);
if (shouldNotify) {
  await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'announcement',
      subject: `${settings.pacName}: ${payload.title}`,
      title: payload.title,
      content: payload.content,
    }),
  });
}
```

Apply the same pattern for events.

---

## Step 9 (Optional): Enhance SubscribeForm Component

Add an unsubscribe notice to `src/components/SubscribeForm.tsx`:

```tsx
<p className="text-xs text-gray-500 mt-2">
  You can unsubscribe at any time via the link in our emails.
</p>
```

---

## File Change Summary

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | **Modify** | Add `resend` dependency |
| `.env.local` | **Modify** | Add `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_BASE_URL` |
| `src/lib/resend.ts` | **Create** | Resend client, email builders, unsubscribe URL generation |
| `src/app/api/unsubscribe/route.ts` | **Create** | Public GET endpoint for one-click unsubscribe |
| `src/app/api/send-email/route.ts` | **Create** | Admin-only endpoint to send emails to all subscribers |
| `src/app/admin/subscribers/page.tsx` | **Modify** | Replace simulated send with real email compose modal |
| `src/middleware.ts` | **Modify** | Add `/admin/subscribers/:path*` to route matcher |
| `src/components/SubscribeForm.tsx` | **Modify** (optional) | Add unsubscribe notice text |
| `src/app/admin/announcements/page.tsx` | **Modify** (optional) | Add "notify subscribers?" prompt after save |

---

## Implementation Sequence

1. Install `resend` package and add environment variables
2. Create `src/lib/resend.ts` (no dependencies on other new files)
3. Create `src/app/api/unsubscribe/route.ts` (depends on existing `src/lib/data.ts`)
4. Create `src/app/api/send-email/route.ts` (depends on `src/lib/resend.ts`)
5. Update `src/middleware.ts` to include subscribers path
6. Update `src/app/admin/subscribers/page.tsx` with real email-sending UI
7. (Optional) Update announcement/event admin pages with notify prompt
8. (Optional) Enhance `SubscribeForm.tsx` with unsubscribe notice

---

## Potential Challenges

| Challenge | Mitigation |
|-----------|------------|
| **Domain verification** | Resend requires DNS records (SPF/DKIM/DMARC). Use `onboarding@resend.dev` during development. |
| **Rate limits** | Free tier is 100 emails/day. Sufficient for a school PAC. Upgrade to paid if the list grows. |
| **Partial send failures** | API returns which emails failed. Admin UI should display these clearly. |
| **Unsubscribe token security** | Base64url is simple but allows unsubscribing others if they know the email. Upgrade to HMAC-signed tokens if needed. |
| **Email deliverability** | Configure SPF/DKIM/DMARC via Resend's domain setup wizard for production sends. |
