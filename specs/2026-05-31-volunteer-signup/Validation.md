# Validation — Volunteer Sign-up

This feature is ready to merge when all items below are checked off.

---

## Automated checks

- [ ] `npm run build` completes with no type errors and no ESLint errors
- [ ] No TypeScript `any` types introduced in new files
- [ ] All new API routes return correct HTTP status codes (200/201/204/400/401/409)

---

## Manual verification

Work through these steps in the running dev server (`npm run dev`) against a local or staging Supabase instance.

### Setup
- [ ] Applied `supabase/schema.sql` migration; `volunteer_roles` and `volunteer_signups` tables exist in Supabase dashboard
- [ ] At least one published event exists in the database

### Admin — create roles on an event
- [ ] Navigate to Admin → Events → create or edit an event
- [ ] "Volunteer Roles" section is visible below the main form fields
- [ ] Add a role "Setup crew" with max slots = 2 → save → role appears in the database
- [ ] Add a second role "Ticket booth" with no slot limit (unlimited) → save → role appears
- [ ] Edit "Setup crew" name to "Setup & teardown" → save → change persists
- [ ] Remove "Ticket booth" → save → role is deleted from database

### Public — sign-up flow
- [ ] Navigate to the public event detail page (`/events/[id]`)
- [ ] "Volunteer" section is visible with "Setup & teardown (2 slots remaining)" listed
- [ ] Click "Sign up" → inline form appears with Name and Email fields
- [ ] Submit with empty fields → form shows validation errors, no API call made
- [ ] Submit with valid name and email → loading spinner shown → success message "Thanks, [name]! Check your email for confirmation." displayed
- [ ] Confirmation email arrives in the submitted inbox; contains event name, date/time, role name
- [ ] Sign up a second person → slots remaining drops to 1
- [ ] Sign up a third person → slot cap hit → "Full" badge shown, sign-up button gone
- [ ] Attempt to POST directly to `/api/volunteer-signups` for a full role → API returns 409

### Public — unlimited role
- [ ] Re-add "Ticket booth" with no slot limit → sign up 3 different people → "Unlimited" label remains, no "Full" state

### Admin — view and manage volunteers
- [ ] Navigate to Admin → Events → event detail/edit → Volunteers section
- [ ] All sign-ups from the public flow appear in the table with correct Role, Name, Email, Signed Up At columns
- [ ] Click Remove on one volunteer → row disappears → database record deleted
- [ ] Attempting to access the volunteer management page while not logged in redirects to `/admin`

### Admin — CSV export
- [ ] Click "Export CSV" → browser downloads `volunteers-<eventId>.csv`
- [ ] Open CSV: headers are `Role,Name,Email,SignedUpAt`; all remaining sign-ups are present; removed volunteer is absent
- [ ] Attempting to `GET /api/events/[id]/volunteers/export` while unauthenticated returns 401

### Cascade deletes
- [ ] Delete the event from Admin → Events → confirm `volunteer_roles` and `volunteer_signups` rows for that event are removed from the database

### Edge cases
- [ ] Event with no roles: Volunteer section is not rendered on the public event detail page
- [ ] Confirmation email send failure (e.g. bad Resend key in env): sign-up still saves successfully and API returns `{ success: true }`; error is logged to console

---

## Definition of done

All manual verification items are checked. Build passes. Feature is reviewed by at least one other person (or self-reviewed against this checklist) before merge.
