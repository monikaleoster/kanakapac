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

---

## Updates — 2026-05-31

Changes to the implementation plan following the decisions recorded in `requirements.md § Updates`.

### Revised Group 0 — Database & types

- **`rsvps.email`** must be `text` (nullable), not `text NOT NULL`. Migration file: `supabase/migrations/20260531000001_rsvp_email_optional.sql`
  ```sql
  ALTER TABLE rsvps ALTER COLUMN email DROP NOT NULL;
  ```
- **`Event` interface** — add `rsvpCount: number` field.
- **`Rsvp` interface** — change `email: string` → `email?: string`.

### Revised Group 1 — API routes

- `POST /api/rsvp` — remove `email` from the required-field check. Validate only `eventId` and `name`.
- `GET /api/events` (existing route) — update `getEvents()`, `getUpcomingEvents()`, `getPastEvents()` in `data.ts` to LEFT JOIN `rsvps` and return a `rsvpCount` per event.

### Revised Group 4 — Public UI (replaces original Group 4)

**New steps (replace steps 9–10):**

9. Create `src/components/RsvpModal.tsx` (`"use client"`):
   - Props: `eventId: string`, `eventTitle: string`, `isOpen: boolean`, `onClose: () => void`.
   - Fields: `name` (required), `email` (optional — label "Email (optional)", placeholder "For event updates").
   - Submit calls `POST /api/rsvp` with `{ eventId, name, email: email || undefined }`.
   - Success state: "You're going! See you there." — modal stays open showing the message with a close button.
   - Duplicate state: "You've already marked yourself as going."
   - Error state: "Something went wrong. Please try again."

10. Update `src/components/EventCard.tsx` — convert to `"use client"` to hold modal open/close state:
    - Add `rsvpCount` to the props (passed in from the page).
    - If `rsvpEnabled` and `rsvpCount >= 1`: show `"{rsvpCount} people going"` badge above the "Going →" button.
    - If `rsvpEnabled` and `rsvpCount === 0`: show only the "Going →" button, **no count badge**.
    - If `rsvpEnabled` is false: no button, no count.
    - Clicking "Going →" opens `RsvpModal`. The `<Link>` wrapper is kept but the button stops propagation so only the button click triggers the modal (not link navigation).

11. Update `src/app/events/[id]/page.tsx`:
    - Fetch `rsvpCount` alongside event data (already on the `Event` object from `getEventById()`).
    - Render `rsvpCount >= 1` count and "Going →" button at the top of the event card.
    - Remove the `<RsvpForm>` import and inline section — modal is now triggered by the button.
    - Import and render `RsvpModal`.

**Files touched:** `src/components/RsvpModal.tsx` (new), `src/components/EventCard.tsx`, `src/app/events/[id]/page.tsx`  
**Files removed from scope:** `src/components/RsvpForm.tsx` (replaced by `RsvpModal.tsx`)
