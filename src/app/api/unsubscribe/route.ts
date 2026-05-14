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
  } catch {
    return NextResponse.json({ error: 'Unsubscribe failed' }, { status: 500 });
  }
}