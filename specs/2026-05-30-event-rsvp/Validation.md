# Validation — Event RSVP & Ticket Link

This document defines the criteria that must all pass before this feature is considered complete and safe to merge into the main branch.

---

## Automated checks

Run these from the `e2etest` directory against the local dev server before opening a PR.

```bash
# 1. Type-check the whole project — must pass with zero errors
cd /Users/monikaarora/code/kanakapac
npx tsc --noEmit

# 2. Run the full E2E suite
cd e2etest
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test --project=chromium
```

### Required pass rate

| Suite | Minimum |
|-------|---------|
| New RSVP tests (`rsvp.spec.ts`) | 4 / 4 |
| Updated admin events tests | All existing tests pass + 2 new pass |
| Full suite regression | No previously-passing test newly fails |

---

## Manual verification checklist

Work through this checklist on the **local dev server** (`npm run dev`) before merging.

### Group 0 — Database

- [ ] Supabase SQL editor shows `events` table has `rsvp_enabled` (boolean, default false) and `ticket_url` (text, nullable) columns
- [ ] Supabase SQL editor shows `rsvps` table exists with the correct columns and the `UNIQUE (event_id, email)` constraint
- [ ] Existing events in the database still load on `/events` with no errors (new columns default correctly)

### Group 1 — API routes

- [ ] `POST /api/rsvp` with valid `{ eventId, name, email }` returns `201` and a row appears in Supabase `rsvps`
- [ ] `POST /api/rsvp` with the same email for the same event returns `409`
- [ ] `POST /api/rsvp` with missing fields returns `400`
- [ ] `GET /api/rsvp?eventId=<id>` without admin session returns `401`
- [ ] `GET /api/rsvp?eventId=<id>` with admin session returns the RSVP array

### Group 2 — Admin event form

- [ ] Navigate to `/admin/events` → click **+ New Event**
- [ ] "Enable RSVP" checkbox is visible and unchecked by default
- [ ] "Ticket URL" input is visible and empty by default
- [ ] Create an event with RSVP enabled and a ticket URL → save → the event appears in the list
- [ ] Click **Edit** on that event → form pre-fills with the correct RSVP checkbox state and ticket URL
- [ ] Create an event without RSVP enabled → ticket URL left blank → save → no RSVP or ticket button on the detail page

### Group 3 — Admin RSVP list

- [ ] On the admin events list, events with `rsvpEnabled = true` show an **"RSVPs"** button
- [ ] Events with `rsvpEnabled = false` do NOT show an "RSVPs" button
- [ ] Clicking "RSVPs" on an event with no RSVPs shows an empty state (not an error)
- [ ] After submitting a public RSVP (see Group 4), clicking "RSVPs" in admin shows the submitted name, email, and timestamp

### Group 4 — Public event detail page

- [ ] Navigate to `/events/<id>` for an event with `ticketUrl` set
  - [ ] "Buy Tickets →" button is visible
  - [ ] Clicking it opens the external URL in a **new tab**
  - [ ] The current page URL does not change
- [ ] Navigate to `/events/<id>` for an event with `rsvpEnabled = true`
  - [ ] RSVP form (name + email + button) is visible below event details
  - [ ] Submit the form with a valid name and email
  - [ ] Success message "You're on the list!" appears — form is replaced
  - [ ] No page navigation occurs
- [ ] Submit the same email again for the same event
  - [ ] Error message "You've already RSVP'd for this event." appears
- [ ] Navigate to `/events/<id>` for an event with `rsvpEnabled = false`
  - [ ] No RSVP form is shown
- [ ] Navigate to `/events/<id>` for an event with both `rsvpEnabled = true` and `ticketUrl` set
  - [ ] Both the ticket button and RSVP form are visible
  - [ ] Ticket button appears above the RSVP form

### Group 5 — Regression

- [ ] `/events` listing page loads without errors
- [ ] `/events/<id>` for an existing event (before schema change) loads without errors — no missing field crashes
- [ ] Admin events CRUD (create, edit, delete) still works for events without RSVP or ticket URL
- [ ] Homepage still loads and displays upcoming events correctly
- [ ] No TypeScript errors (`npx tsc --noEmit` passes)

---

## Merge criteria

The feature is ready to merge when **all** of the following are true:

1. `npx tsc --noEmit` passes with zero errors
2. All 4 new RSVP E2E tests pass
3. All previously-passing admin event tests still pass
4. Every item in the manual verification checklist above is checked
5. The PR diff does not include unrelated changes (no leftover debug code, no `.env` files, no migration of other features)

> **Reviewer note:** Pay particular attention to the `saveEvent()` function in `data.ts` — confirm `rsvpEnabled` defaults to `false` in the Supabase upsert so existing events without the field are not accidentally set to enabled.

---

## Updates — 2026-05-31

Additional validation criteria for the changes recorded in `requirements.md § Updates`. All items below are **required** in addition to the original checklist.

### Group 0 — Database (revised)

- [ ] `rsvps.email` column is nullable — confirm in Supabase SQL editor: `\d rsvps` shows `email text` (no `NOT NULL`)
- [ ] Migration `20260531000001_rsvp_email_optional.sql` applied cleanly

### Group 1 — API (revised)

- [ ] `POST /api/rsvp` with `{ eventId, name }` (no email) returns `201` and row appears in `rsvps` with `email = null`
- [ ] `POST /api/rsvp` with `{ eventId, name, email }` still returns `201` (email still accepted when provided)
- [ ] `POST /api/rsvp` with missing `name` (but email present) returns `400`
- [ ] `GET /api/events` response includes `rsvpCount` field on each event object

### Group 4 — Public UI (revised)

- [ ] On `/events`, an RSVP-enabled event card shows a **"Going →"** button
- [ ] Clicking "Going →" opens a modal — **page does not navigate**
- [ ] Modal has `name` field (required) and `email` field labelled "Email (optional)"
- [ ] Submitting with only a name (no email) succeeds and shows "You're going! See you there."
- [ ] Submitting same email twice for same event shows "You've already marked yourself as going."
- [ ] After RSVP, the card count badge increments (on next page load or if count is live-updated)
- [ ] **Count badge is hidden when rsvpCount = 0** — no "0 people going" text appears anywhere
- [ ] When rsvpCount ≥ 1, the count badge shows correctly on: event card (listing), event card (homepage), event detail page
- [ ] Event cards without `rsvpEnabled` show no "Going" button and no count badge
- [ ] Clicking anywhere else on the event card (not the button) still navigates to `/events/[id]`
