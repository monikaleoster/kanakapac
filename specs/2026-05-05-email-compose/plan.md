# Plan — Email Compose (Phase 3 completion)

Completes the three remaining items in Phase 3 of the roadmap:
- Minimal home page (dynamic settings, subscribe form)
- Admin compose UI for sending email blasts
- Welcome email triggered on subscriber sign-up

---

## Group 0 — Minimal home page

**Goal:** The homepage shows the real school/PAC name from settings and gives visitors a direct way to subscribe.

1. In `src/app/page.tsx`, call `getSchoolSettings()` (already imported from `@/lib/data`) and replace the two hardcoded strings:
   - Hero `<h1>` — use `settings.pacName` instead of `"Welcome to Kanaka PAC"`
   - Hero `<p>` tagline — use `settings.schoolName` instead of `"Kanaka Elementary"`
2. Add a `SubscribeForm` section to the page (below Recent Announcements):
   - Import `SubscribeForm` from `@/components/SubscribeForm`
   - Wrap it in a `<section>` with a heading ("Stay Updated") and a one-line description
3. Confirm empty states render correctly: temporarily clear events/announcements in dev and verify the "no upcoming events" and "no announcements" fallback text is visible.

**Files touched:**
- `src/app/page.tsx`

---

## Group 1 — Admin compose UI

**Goal:** An admin can write and send an email blast from the subscribers page without touching the API directly.

4. Read `src/app/admin/subscribers/page.tsx` and identify where to add the compose section.
5. Add a compose form below the subscriber list:
   - `Subject` text input (required)
   - `Message` textarea (required, maps to `content`)
   - `Send to all subscribers` button
   - Disable button + show spinner while request is in flight
6. On submit, `POST /api/send-email` with `{ type: 'announcement', subject, content }`.
7. Display success feedback: `"Sent to N subscribers"`.
8. Display error feedback: list any failed recipient emails returned by the API.

**Files touched:**
- `src/app/admin/subscribers/page.tsx`

---

## Group 2 — Welcome email on subscribe

**Goal:** Every new subscriber receives a branded welcome email immediately after signing up.

9. Add `buildWelcomeEmailHtml(unsubscribeUrl: string, pacName: string): string` to `src/lib/resend.ts`.
   - Content: welcome message, what to expect (announcements, events), unsubscribe link.
   - Matches the existing HTML-only style of `buildAnnouncementEmailHtml`.
10. In `src/app/api/subscribe/route.ts`, after `saveSubscriber()` succeeds, call `sendEmail()` with the welcome template.
    - Use `getSchoolSettings()` to get `pacName`.
    - Do not block the subscribe response if the welcome email fails — catch the error, log it, still return `{ success: true }`.

**Files touched:**
- `src/lib/resend.ts`
- `src/app/api/subscribe/route.ts`

---

## Group 3 — Smoke-test

11. Subscribe via the homepage form with a real email address → confirm welcome email is received in inbox.
12. From the admin subscribers page, compose and send a blast → confirm the subscriber receives it with working unsubscribe link.
13. Click the unsubscribe link → confirm subscriber is removed from the Supabase `subscribers` table.

See `validation.md` for the full checklist.