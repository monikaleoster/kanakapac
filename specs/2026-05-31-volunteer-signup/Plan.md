# Plan — Volunteer Sign-up

Implements the Volunteer Sign-up priority feature from the roadmap. Parents can register for named roles on events; admins manage roles, view sign-ups, and export CSV.

---

## Group 0 — Database schema

**Goal:** Supabase tables and typed helpers exist before any UI is built.

1. Add to `supabase/schema.sql`:
   - `volunteer_roles` table (id, event_id FK, name, max_slots nullable, created_at)
   - `volunteer_signups` table (id, role_id FK, name, email, created_at)
   - Cascade deletes: deleting an event removes its roles; deleting a role removes its sign-ups
   - Index on `volunteer_roles(event_id)` and `volunteer_signups(role_id)`
2. Run migration against local/dev Supabase instance; confirm tables appear.

**Files touched:**
- `supabase/schema.sql`

---

## Group 1 — Data access layer

**Goal:** Typed read/write functions for roles and sign-ups, following the patterns in `src/lib/data.ts`.

3. Add to `src/lib/data.ts`:
   - `getVolunteerRolesByEvent(eventId: string): Promise<VolunteerRole[]>` — includes current signup count via a join
   - `createVolunteerRole(data): Promise<VolunteerRole>`
   - `updateVolunteerRole(id, data): Promise<VolunteerRole>`
   - `deleteVolunteerRole(id): Promise<void>`
   - `createVolunteerSignup(data): Promise<VolunteerSignup>`
   - `deleteVolunteerSignup(id): Promise<void>`
   - `getVolunteerSignupsByEvent(eventId: string): Promise<SignupWithRole[]>` — for admin view + export
4. Add TypeScript types `VolunteerRole`, `VolunteerSignup`, `SignupWithRole` to `src/lib/types.ts` (or inline in `data.ts` if that file owns types today).

**Files touched:**
- `src/lib/data.ts`
- `src/lib/types.ts` (or equivalent)

---

## Group 2 — API routes

**Goal:** Public sign-up endpoint and admin-only endpoints are wired up.

5. Create `src/app/api/events/[id]/volunteer-roles/route.ts`
   - `GET`: call `getVolunteerRolesByEvent`, return roles with `signupCount` and `isFull` flag. Public — no auth check.
6. Create `src/app/api/volunteer-signups/route.ts`
   - `POST`: validate `{ roleId, name, email }`. Check slot cap — return 409 if full. Call `createVolunteerSignup`. Fire confirmation email (see Group 3). Return `{ success: true }`.
7. Create `src/app/api/volunteer-signups/[id]/route.ts`
   - `DELETE`: admin-only (check session cookie). Call `deleteVolunteerSignup`. Return 204.
8. Create `src/app/api/events/[id]/volunteers/export/route.ts`
   - `GET`: admin-only. Call `getVolunteerSignupsByEvent`. Build and return a CSV string with headers `Role,Name,Email,SignedUpAt`. Set `Content-Disposition: attachment; filename="volunteers-<eventId>.csv"`.

**Files touched:**
- `src/app/api/events/[id]/volunteer-roles/route.ts` (new)
- `src/app/api/volunteer-signups/route.ts` (new)
- `src/app/api/volunteer-signups/[id]/route.ts` (new)
- `src/app/api/events/[id]/volunteers/export/route.ts` (new)

---

## Group 3 — Confirmation email

**Goal:** Volunteer receives a branded confirmation immediately after signing up.

9. Add `buildVolunteerConfirmationHtml(opts: { eventTitle, eventDate, eventTime, roleName, pacName }): string` to `src/lib/resend.ts`. Matches the existing HTML-only style. Content: thank-you message, event details, role name, "we'll follow up" note.
10. In the `POST /api/volunteer-signups` handler (Group 2, step 6), after `createVolunteerSignup` succeeds, call `sendEmail()` with the confirmation template. Catch errors, log, do not block the response.

**Files touched:**
- `src/lib/resend.ts`
- `src/app/api/volunteer-signups/route.ts`

---

## Group 4 — Admin: event form extended with roles

**Goal:** Admins can add, edit, and remove volunteer roles while creating or editing an event.

11. In the admin event create/edit form, add a "Volunteer Roles" section below the existing fields:
    - List of current roles (name + max slots) with an inline Remove button each
    - "Add role" button that appends a row with a name input and an optional max slots number input
    - On save/update, persist roles via `createVolunteerRole` / `updateVolunteerRole` / `deleteVolunteerRole`
12. When editing an existing event, load current roles from `getVolunteerRolesByEvent` and pre-populate the list.

**Files touched:**
- `src/app/admin/events/new/page.tsx` (or equivalent create page)
- `src/app/admin/events/[id]/edit/page.tsx` (or equivalent edit page)

---

## Group 5 — Admin: volunteer dashboard per event

**Goal:** Admin can see who signed up for each event and export the list.

13. Add a "Volunteers" tab or section to the admin event detail/edit page.
    - Fetch from `GET /api/events/[id]/volunteers/export` on the server (or a client fetch).
    - Display a table: Role | Name | Email | Signed Up At.
    - "Export CSV" button triggers `GET /api/events/[id]/volunteers/export` download.
    - Each row has a Remove button that calls `DELETE /api/volunteer-signups/[id]` and refreshes the list.

**Files touched:**
- `src/app/admin/events/[id]/page.tsx` or edit page (whichever owns event detail)

---

## Group 6 — Public: sign-up UI on event detail page

**Goal:** Parents visiting an event page can see available roles and sign up.

14. On `src/app/events/[id]/page.tsx`, below the event description, add a "Volunteer" section (only rendered if the event has at least one role).
    - Fetch roles from `GET /api/events/[id]/volunteer-roles` (server component fetch at render time, or client fetch).
    - For each role: show name, slots remaining ("3 of 10 remaining" or "Unlimited"), and a "Sign up" button.
    - If `isFull`, show "Full" badge instead of button.
15. Clicking "Sign up" opens an inline form (no modal needed):
    - Name input (required)
    - Email input (required, basic format validation)
    - Submit button with loading state
    - On success: replace form with "Thanks, [name]! Check your email for confirmation."
    - On 409 (slot full): show "Sorry, this role just filled up." and mark it full.
    - On other error: show a generic error message.

**Files touched:**
- `src/app/events/[id]/page.tsx`
- New component `src/components/VolunteerSignupSection.tsx` (client component)

---

## Group 7 — Smoke-test

16. See `Validation.md` for the full manual checklist.

---
