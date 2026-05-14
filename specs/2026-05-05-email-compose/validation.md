# Validation — Email Compose (Phase 3 completion)

This feature is ready to merge when every item below is checked off by an admin running the site locally (or on a preview deployment) with a real `RESEND_API_KEY` configured.

---

## Prerequisites

- Dev server running (`npm run dev`)
- `.env.local` contains valid `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (can use `onboarding@resend.dev`), `NEXT_PUBLIC_BASE_URL`, and Supabase credentials
- Access to the inbox for the test email address you'll use

---

## Checklist

### Home page

- [ ] Visit `/` — hero title shows the PAC name from settings (not hardcoded "Kanaka PAC")
- [ ] Hero tagline shows the school name from settings (not hardcoded "Kanaka Elementary")
- [ ] A "Stay Updated" section with the subscribe form is visible below the announcements
- [ ] Submit the subscribe form with an invalid email → inline error shown, no request sent
- [ ] With no events in the database, the events section shows the empty-state fallback text
- [ ] With no announcements in the database, the announcements section shows the empty-state fallback text

### Welcome email

- [ ] Go to the homepage subscribe form
- [ ] Enter a real email address and submit
- [ ] Response shows success (no error message shown)
- [ ] Check the inbox — welcome email is received within ~60 seconds
- [ ] Welcome email displays the correct PAC name (from settings, not hardcoded)
- [ ] Welcome email contains a working unsubscribe link
- [ ] Click the unsubscribe link → browser shows confirmation page
- [ ] Check Supabase `subscribers` table — the email row is gone

### Admin compose UI

- [ ] Log in to `/admin` and navigate to the Subscribers page
- [ ] Compose form is visible (subject field + message textarea + send button)
- [ ] Submit the form with an empty subject → validation error shown, no request sent
- [ ] Submit the form with an empty message → validation error shown, no request sent
- [ ] Fill in a subject and message, click send
- [ ] Send button is disabled / shows a loading state while request is in flight
- [ ] On success: `"Sent to N subscribers"` message is displayed
- [ ] Check the inbox — blast email is received with correct subject and body
- [ ] Blast email displays the correct PAC name
- [ ] Blast email contains a working unsubscribe link

### Edge cases

- [ ] Delete all subscribers from the admin page, then attempt to send a blast → API returns an error and the UI shows a clear message (no silent failure)
- [ ] Open DevTools → Network tab, confirm `POST /api/send-email` is only called once per button click (no duplicate sends)
- [ ] Log out of admin, then attempt `POST /api/send-email` directly (e.g. via curl) → receives `401 Unauthorized`

---

## Resend dashboard check (optional but recommended before production)

- [ ] Log in to resend.com → Emails → confirm both the welcome email and blast email show status **Delivered**
- [ ] No emails show **Bounced** or **Failed** for the test address