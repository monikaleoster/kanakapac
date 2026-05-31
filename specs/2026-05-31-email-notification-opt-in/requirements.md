# Requirements — Email Notification Opt-in

## Context

Families currently subscribe to the site but only receive emails when an admin manually triggers a blast via the admin subscribers page. There is no connection between publishing new content and notifying subscribers.

This feature closes that gap for the two content types that matter most to families: announcements and events.

---

## Scope decisions (confirmed with product owner, 2026-05-31)

| Question | Decision |
|---|---|
| Which content types trigger notifications? | Announcements and Events only. Meeting minutes are out of scope. |
| Subscriber preferences / categories? | All-or-nothing. One subscription covers all notification types. No per-category preferences. |
| When are notifications sent? | Admin-triggered manually. Admin publishes content first, then decides whether and when to send a notification. |
| Urgent vs normal announcements? | No special handling. Priority is display-only and has no effect on email send behaviour. |

---

## What this feature does

When an admin publishes or edits an announcement or event, a **"Notify subscribers"** button (or send action) becomes available in the admin UI for that item. Clicking it sends a formatted email to all active subscribers about that specific item.

This is distinct from the existing general email blast (which is free-form subject + body). This feature generates structured, content-specific emails automatically from the item's data.

---

## What this feature does NOT do

- No automatic/triggered sends — a human admin always initiates the email.
- No subscriber category preferences or per-type opt-outs.
- No notifications for meeting minutes.
- No scheduling or delayed sends.
- No changes to the subscribe/unsubscribe flow — that is already built.
- No changes to the existing free-form email blast — that remains as-is.

---

## Users affected

| User | Change |
|---|---|
| Subscribers | Receive better-formatted, content-specific notification emails (announcements and events) when admin chooses to send. |
| Admin | New "Notify subscribers" action on announcement and event admin pages. |
| Public / unauthenticated | No change. |

---

## Constraints

- Must use existing Resend integration (`src/lib/resend.ts`) and the existing `subscribers` table.
- All sends are server-side API routes — no Resend keys exposed to the browser.
- Reuse existing `buildAnnouncementEmailHtml()` and `buildEventEmailHtml()` from `src/lib/resend.ts` (or extend them if the templates are insufficient).
- No new environment variables required.
- No database schema changes required (subscribers table is already in place).

---

## Success criteria

1. Admin can open any announcement or event in the admin UI and send a notification email to all subscribers with one action.
2. The email renders correctly with the item's title, content/description, date, and an unsubscribe link.
3. Sending to zero subscribers does not error.
4. The admin receives clear feedback (success count or error message) after sending.
5. Duplicate sends are the admin's responsibility — the system does not block resends.
