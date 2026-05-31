# Requirements — Volunteer Sign-up

## Context

Roadmap Phase 6 priority feature. Reduces organizer workload by eliminating back-and-forth emails and centralising volunteer tracking in the admin dashboard.

---

## Scope decisions

### What parents can sign up for
- **Events** — any published event can have volunteer roles attached to it.
- **Named roles/shifts within an event** — e.g. "Setup crew", "Ticket booth", "Bake sale table 3". Each role has an optional slot cap.

Committees and ongoing standing roles are explicitly **out of scope** for this iteration.

### Identity model
- No account required.
- Sign-up form collects **name** and **email** only.
- Email is used solely to send a confirmation; it is not linked to the subscribers table.

### Slot limits
- Each role carries an optional `maxSlots` integer.
- When a role is full, the sign-up button is replaced with "Full" and the form is disabled for that role.
- `null` means unlimited.

### Cancellation
- **Out of scope for this MVP.** Admin removes volunteers manually from the dashboard if needed.

### Confirmation email
- On successful sign-up, send a transactional confirmation email to the volunteer.
- Uses the existing Resend integration (`src/lib/resend.ts`).
- Email includes: event name, date/time, role name, and a note that the PAC will follow up.
- If the email send fails, the sign-up is still saved and the API returns success (same pattern as welcome email in Phase 3).

### Admin capabilities
- View all volunteers grouped by event → role.
- Set/edit role names and slot caps when creating or editing an event.
- Export the volunteer list for an event as CSV (download in browser).
- Remove a volunteer manually.

---

## Data model

New Supabase table: `volunteer_roles`

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| event_id | uuid FK → events.id | cascade delete |
| name | text | e.g. "Setup crew" |
| max_slots | integer nullable | null = unlimited |
| created_at | timestamptz | |

New Supabase table: `volunteer_signups`

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| role_id | uuid FK → volunteer_roles.id | cascade delete |
| name | text | volunteer's display name |
| email | text | for confirmation only |
| created_at | timestamptz | |

---

## API surface

| method | route | purpose |
|---|---|---|
| GET | `/api/events/[id]/volunteer-roles` | public — list roles + current signup counts |
| POST | `/api/volunteer-signups` | public — submit a signup |
| DELETE | `/api/volunteer-signups/[id]` | admin — remove a volunteer |
| GET | `/api/events/[id]/volunteers/export` | admin — CSV download |

Role creation/editing is handled via the existing admin event CRUD (extend the event form).

---

## Out of scope
- Waitlists
- Volunteer cancellation (self-service)
- Committee/ongoing role sign-ups
- Reminder emails
- Public display of who has signed up (names/emails are admin-only)
