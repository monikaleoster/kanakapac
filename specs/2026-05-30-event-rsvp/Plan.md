# Plan — Event RSVP & Ticket Link

Each group is independently shippable. Complete groups in order — later groups depend on earlier ones.

---

## Group 0 — Database & types

**Goal:** Schema and TypeScript types updated before any UI is touched.

1. Add two columns to the `events` table in Supabase SQL editor:
   ```sql
   ALTER TABLE events
     ADD COLUMN rsvp_enabled boolean NOT NULL DEFAULT false,
     ADD COLUMN ticket_url text;
   ```

2. Create the `rsvps` table:
   ```sql
   CREATE TABLE rsvps (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
     name text NOT NULL,
     email text NOT NULL,
     created_at timestamptz NOT NULL DEFAULT now(),
     UNIQUE (event_id, email)
   );
   ```

3. Update `src/lib/types.ts`:
   - Add `rsvpEnabled: boolean` and `ticketUrl?: string` to the `Event` interface.
   - Add a new `Rsvp` interface (`id`, `eventId`, `name`, `email`, `createdAt`).

4. Update `src/lib/data.ts` — event mappers:
   - In `getEvents()` and `getEventById()` map `rsvp_enabled → rsvpEnabled` and `ticket_url → ticketUrl`.
   - In `saveEvent()` include `rsvp_enabled` and `ticket_url` in the Supabase upsert payload.

5. Add two new data functions to `src/lib/data.ts`:
   - `saveRsvp(rsvp: Omit<Rsvp, 'id' | 'createdAt'>): Promise<{ error?: string }>` — inserts a row; returns `{ error: 'duplicate' }` on unique-constraint violation.
   - `getRsvpsByEvent(eventId: string): Promise<Rsvp[]>` — fetches all RSVPs for an event (admin only).

**Files touched:** `supabase/schema.sql`, `src/lib/types.ts`, `src/lib/data.ts`

---

## Group 1 — API routes

**Goal:** Server endpoints exist and handle RSVP submission and retrieval.

6. Create `src/app/api/rsvp/route.ts`:
   - `POST /api/rsvp` — public, no auth. Body: `{ eventId, name, email }`. Calls `saveRsvp()`. Returns `201` on success, `409` if duplicate, `400` if fields missing.
   - `GET /api/rsvp?eventId=<id>` — requires `isAuthenticated()`. Calls `getRsvpsByEvent()`. Returns RSVP array.

**Files touched:** `src/app/api/rsvp/route.ts` (new file)

---

## Group 2 — Admin event form

**Goal:** Admins can set RSVP enabled and ticket URL when creating or editing an event.

7. In `src/app/admin/events/page.tsx`:
   - Add `rsvpEnabled: false` and `ticketUrl: ''` to the `emptyEvent` object and the `EventData` interface.
   - In `handleEdit()` map the new fields from the existing event.
   - Add to the form:
     - A checkbox input for "Enable RSVP" (`id="event-rsvp"`, `htmlFor="event-rsvp"`).
     - A URL text input for "Ticket URL" (`id="event-ticket-url"`, `htmlFor="event-ticket-url"`, placeholder `https://...`).
   - In `handleSubmit()` include `rsvpEnabled` and `ticketUrl` in the POST/PUT body.

**Files touched:** `src/app/admin/events/page.tsx`

---

## Group 3 — Admin RSVP list

**Goal:** Admins can see who has RSVP'd for each event.

8. In `src/app/admin/events/page.tsx`, for each event in the list where `rsvpEnabled` is true:
   - Show an **"RSVPs"** button next to the Edit/Delete buttons.
   - Clicking it sets `rsvpEventId` state and fetches `GET /api/rsvp?eventId=<id>`.
   - Display the RSVP list in the existing delete-confirmation modal pattern: a modal showing a table of (name, email, date registered).
   - Include a close button to dismiss.

**Files touched:** `src/app/admin/events/page.tsx`

---

## Group 4 — Public event detail page

**Goal:** Parents see RSVP form and/or ticket button on event detail pages.

9. Update `src/app/events/[id]/page.tsx`:
   - If `event.ticketUrl` is set, render a **"Buy Tickets →"** `<a>` button (`target="_blank" rel="noopener noreferrer"`).
   - If `event.rsvpEnabled` is true, render `<RsvpForm eventId={event.id} />`.

10. Create `src/components/RsvpForm.tsx` (`"use client"`):
    - Props: `eventId: string`.
    - State: `name`, `email`, `status: 'idle' | 'submitting' | 'success' | 'duplicate' | 'error'`.
    - On submit: `POST /api/rsvp` with `{ eventId, name, email }`.
    - On `201`: show success message "You're on the list! We'll see you there."
    - On `409`: show inline error "You've already RSVP'd for this event."
    - On other error: show "Something went wrong. Please try again."
    - Follow the `ContactForm.tsx` pattern (no page navigation, inline state transitions).

**Files touched:** `src/app/events/[id]/page.tsx`, `src/components/RsvpForm.tsx` (new file)

---

## Group 5 — E2E tests

**Goal:** Automated coverage for the new public and admin flows.

11. Create `e2etest/tests/pages/RsvpPage.ts` page object:
    - Locators: `nameInput`, `emailInput`, `submitBtn`, `successMsg`, `duplicateMsg`.

12. Update `e2etest/tests/pages/admin/AdminEventsPage.ts`:
    - Add locators: `rsvpCheckbox`, `ticketUrlInput`, `getRsvpBtns()`, `rsvpModal`.

13. Create `e2etest/tests/public/rsvp.spec.ts`:
    - `happy path — RSVP form submits and shows success`
    - `edge case — duplicate email shows already-registered message`
    - `happy path — ticket URL button present and has correct href`
    - `edge case — RSVP form not shown when rsvpEnabled is false`

14. Add to `e2etest/tests/admin/events.spec.ts`:
    - `happy path — create event with RSVP enabled and ticket URL`
    - `happy path — admin can view RSVP list for event`

**Files touched:** `e2etest/tests/pages/RsvpPage.ts` (new), `e2etest/tests/pages/admin/AdminEventsPage.ts`, `e2etest/tests/public/rsvp.spec.ts` (new), `e2etest/tests/admin/events.spec.ts`

---

## Group 6 — Schema file & seed update

**Goal:** The schema and seed files stay in sync with the live database so a fresh setup works.

15. Update `supabase/schema.sql` to include the two new `events` columns and the `rsvps` table definition.
16. Optionally add a sample RSVP row to `supabase/seed.sql` for the existing seed event.

**Files touched:** `supabase/schema.sql`, `supabase/seed.sql`
