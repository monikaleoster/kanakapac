# Validation — Email Notification Opt-in

This document defines what "done" looks like and how to verify it before merging.

---

## Automated checks

These must pass before the PR is reviewed:

- [ ] `npm run build` exits with code 0 (no TypeScript compilation errors)
- [ ] `npm run lint` exits with code 0 (no ESLint errors)

---

## Manual verification

### Setup

- A local or staging environment with:
  - Supabase connected (at least one announcement and one event in the DB)
  - At least one subscriber row in the `subscribers` table
  - Resend configured (use `onboarding@resend.dev` as from-address in dev)
  - Admin session active (logged in at `/admin`)

---

### Scenario 1 — Notify subscribers from an announcement

1. Log in to admin.
2. Open an existing announcement in the edit view.
3. Confirm a **"Notify subscribers"** button is visible.
4. Click the button.
5. **Expected:** Button shows a loading state while the request is in flight.
6. **Expected:** On success, UI shows "Sent to N subscribers" (where N ≥ 1).
7. Check the inbox of the subscriber email address.
8. **Expected:** Email received with the announcement's title and content, a readable layout, and a working unsubscribe link.
9. Click the unsubscribe link.
10. **Expected:** Subscriber is removed from the `subscribers` table; confirmation page shown.

---

### Scenario 2 — Notify subscribers from an event

1. Open an existing event in the admin edit view.
2. Click **"Notify subscribers"**.
3. **Expected:** Success feedback showing sent count.
4. Check inbox — email received with event title, date, time, location, description, and unsubscribe link.

---

### Scenario 3 — Zero subscribers

1. Delete all rows from the `subscribers` table (or use a DB with no subscribers).
2. Attempt to send a notification from any announcement or event.
3. **Expected:** No error thrown. UI shows "No subscribers to notify."

---

### Scenario 4 — Unauthenticated request blocked

1. Log out of admin.
2. Send a `POST` request directly to `/api/notify/announcement` with a valid announcement ID.
3. **Expected:** API returns `401 Unauthorized`. No emails sent.

---

### Scenario 5 — Invalid ID

1. Send a `POST` to `/api/notify/announcement` with a non-existent ID (while authenticated).
2. **Expected:** API returns `404`. No emails sent.

---

### Scenario 6 — Resend twice (no guard)

1. Click "Notify subscribers" on the same announcement twice.
2. **Expected:** Both sends succeed. The system does not block resends — this is intentional per requirements.

---

## Merge criteria

All of the following must be true:

- [ ] Automated checks pass (build + lint)
- [ ] Scenarios 1–6 verified manually
- [ ] Both email templates reviewed in a real inbox (desktop and mobile if possible)
- [ ] No console errors in browser dev tools during normal admin flows
- [ ] No new environment variables required (or, if added, documented in `tech-stack.md`)
