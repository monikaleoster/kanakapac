# Plan — Email Notification Opt-in

Each group is independently shippable. Complete groups in order; each group builds on the previous.

---

## Group 1 — API route: notify subscribers for an announcement

**Goal:** A working server-side endpoint that, given an announcement ID, fetches all subscribers and sends them a formatted email.

1. Review `src/lib/resend.ts` — confirm `buildAnnouncementEmailHtml()` accepts an announcement object and produces a complete HTML email with title, content, and unsubscribe link.
2. Review `src/lib/data.ts` — confirm `getAnnouncements()` (or equivalent) can fetch a single announcement by ID, and `getSubscribers()` returns all active subscribers.
3. Create `src/app/api/notify/announcement/route.ts` — `POST` handler:
   - Validate admin session (use existing NextAuth session check pattern from other admin API routes).
   - Accept `{ id: string }` in request body.
   - Fetch the announcement by ID; return 404 if not found.
   - Fetch all subscribers.
   - Call `sendEmail()` for each subscriber (or batch if Resend supports it), using `buildAnnouncementEmailHtml()`.
   - Return `{ sent: number }` on success, or a structured error.
4. Manual smoke test via `curl` or a REST client with a valid session cookie.

---

## Group 2 — API route: notify subscribers for an event

**Goal:** Same as Group 1 but for events.

1. Confirm `buildEventEmailHtml()` in `src/lib/resend.ts` accepts an event object and produces a complete email with title, date, time, location, description, and unsubscribe link.
2. Create `src/app/api/notify/event/route.ts` — `POST` handler following the same pattern as Group 1.
3. Manual smoke test.

---

## Group 3 — Admin UI: "Notify subscribers" on announcement detail/edit page

**Goal:** Admin can trigger a notification from the announcements admin UI.

1. Identify the announcement edit page (`src/app/admin/dashboard/announcements/[id]/` or equivalent).
2. Add a **"Notify subscribers"** button to the edit page — client component with loading + result state.
3. On click, `POST /api/notify/announcement` with the current announcement ID.
4. Display result: "Sent to N subscribers" on success, or error message on failure.
5. Button is always enabled (no guard against resending — per requirements, that is the admin's responsibility).

---

## Group 4 — Admin UI: "Notify subscribers" on event detail/edit page

**Goal:** Same as Group 3 but for events.

1. Identify the event edit page.
2. Add the same "Notify subscribers" button and result feedback pattern.
3. `POST /api/notify/event` with the current event ID.

---

## Group 5 — Edge cases and polish

1. Sending to zero subscribers: API returns `{ sent: 0 }` without error; UI shows "No subscribers to notify."
2. Confirm unsubscribe links in both email templates resolve correctly (use `NEXT_PUBLIC_BASE_URL`).
3. Review both email templates in a real inbox (send to a test address) — verify formatting, font rendering, and mobile layout.
4. Run `npm run build` — confirm no TypeScript errors.
5. Run `npm run lint` — confirm no lint errors.

---

## Out of scope (do not implement)

- Automatic sends on publish
- Per-category subscriber preferences
- Meeting minutes notifications
- Scheduling or queuing
- Resend deduplication / idempotency keys
