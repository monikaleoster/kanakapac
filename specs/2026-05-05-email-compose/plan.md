# Plan — Email Compose (Phase 3 completion)

Completes the two remaining items in Phase 3 of the roadmap:
- Admin compose UI for sending email blasts
- Welcome email triggered on subscriber sign-up

---

## Group 1 — Admin compose UI

**Goal:** An admin can write and send an email blast from the subscribers page without touching the API directly.

1. Read `src/app/admin/subscribers/page.tsx` and identify where to add the compose section.
2. Add a compose form below the subscriber list:
   - `Subject` text input (required)
   - `Message` textarea (required, maps to `content`)
   - `Send to all subscribers` button
   - Disable button + show spinner while request is in flight
3. On submit, `POST /api/send-email` with `{ type: 'announcement', subject, content }`.
4. Display success feedback: `"Sent to N subscribers"`.
5. Display error feedback: list any failed recipient emails returned by the API.

**Files touched:**
- `src/app/admin/subscribers/page.tsx`

---

## Group 2 — Welcome email on subscribe

**Goal:** Every new subscriber receives a branded welcome email immediately after signing up.

4. Add `buildWelcomeEmailHtml(unsubscribeUrl: string, pacName: string): string` to `src/lib/resend.ts`.
   - Content: welcome message, what to expect (announcements, events), unsubscribe link.
   - Matches the existing HTML-only style of `buildAnnouncementEmailHtml`.
5. In `src/app/api/subscribe/route.ts`, after `saveSubscriber()` succeeds, call `sendEmail()` with the welcome template.
   - Use `getSchoolSettings()` to get `pacName`.
   - Do not block the subscribe response if the welcome email fails — catch the error, log it, still return `{ success: true }`.

**Files touched:**
- `src/lib/resend.ts`
- `src/app/api/subscribe/route.ts`

---

## Group 3 — Smoke-test

6. Subscribe with a real email address → confirm welcome email is received in inbox.
7. From the admin subscribers page, compose and send a blast → confirm the subscriber receives it with working unsubscribe link.
8. Click the unsubscribe link → confirm subscriber is removed from the Supabase `subscribers` table.

See `validation.md` for the full checklist.