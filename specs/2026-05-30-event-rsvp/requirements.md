# Requirements — Event RSVP & Ticket Link

**Feature:** Families can RSVP to a PAC event and/or be redirected to purchase tickets via an external link.  
**Phase:** Phase 6 (Future enhancements — now being pulled forward)  
**Date:** 2026-05-30

---

## Context

The roadmap listed "Event RSVP / attendance tracking" as a Phase 6 enhancement. This spec brings it forward as a discrete, shippable feature. PAC events vary in nature — some are free (general meetings, movie nights) and require only a headcount; others are ticketed (fundraising dinners, school fairs) and require payment through an external system like School Cash Online or Eventbrite.

The site's mission is **communication and engagement**, not payment processing. This feature stays within those bounds by:
- Capturing RSVP intent internally for free events
- Redirecting to an external URL for ticketed events (no payment handled on this site)

---

## User stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| 1 | Parent | Click "RSVP" on an event and submit my name and email | The PAC knows I am coming |
| 2 | Parent | See a "Buy Tickets" button that takes me to the ticketing site | I can purchase a ticket without hunting for the link |
| 3 | Parent | See my RSVP confirmed immediately after submitting | I know the form worked |
| 4 | Admin | Enable RSVP on an event when creating or editing it | Only relevant events collect RSVPs |
| 5 | Admin | Add a ticket URL to an event | Parents are directed to the right external site |
| 6 | Admin | View the RSVP list for any event | I know how many families plan to attend |

---

## Scope decisions

### In scope

- **RSVP form** — name (required) + email (required) fields, submitted to a new `/api/rsvp` route, stored in Supabase.
- **Ticket URL field** — optional external URL on an event; renders as a "Buy Tickets" button on the public event detail page, opening in a new tab.
- **Admin: RSVP toggle** — per-event checkbox in the admin events form to enable/disable RSVP collection.
- **Admin: ticket URL field** — plain URL input in the admin events form.
- **Admin: RSVP list view** — read-only list of RSVPs per event on the admin event detail page (name, email, timestamp). No export in this iteration.
- **Duplicate prevention** — one RSVP per email per event (enforced by a unique constraint in Supabase; UI shows a friendly message if already registered).

### Out of scope

- Payment processing (tickets are bought externally — this site only links out)
- RSVP cancellation / withdrawal
- Waitlists or capacity limits
- Automated confirmation emails (stretch goal — can be added once RSVP data is in place)
- Calendar / .ics export

---

## Data model changes

### `events` table — two new columns

| Column | Type | Notes |
|--------|------|-------|
| `rsvp_enabled` | `boolean` | Default `false`. When `true`, the RSVP form is shown on the event detail page. |
| `ticket_url` | `text` | Nullable. When set, a "Buy Tickets" button appears on the event detail page. |

### New `rsvps` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `event_id` | `uuid` | Foreign key → `events.id` ON DELETE CASCADE |
| `name` | `text` | Required |
| `email` | `text` | Required |
| `created_at` | `timestamptz` | Default `now()` |

**Unique constraint:** `(event_id, email)` — prevents duplicate RSVPs from the same address for the same event.

### TypeScript type changes

```ts
// src/lib/types.ts
export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  rsvpEnabled: boolean;   // new
  ticketUrl?: string;     // new
  createdAt: string;
}

export interface Rsvp {
  id: string;
  eventId: string;
  name: string;
  email: string;
  createdAt: string;
}
```

---

## UI behaviour

### Public — event detail page (`/events/[id]`)

- If `ticketUrl` is set: show a **"Buy Tickets →"** button (primary style, `target="_blank"`).
- If `rsvpEnabled` is true: show an **RSVP form** (name + email + "RSVP Now" button) below the event details.
- If both are set: show ticket button first, RSVP form below.
- After RSVP submit: replace form with a success message ("You're on the list!"). No page navigation.
- If duplicate email: show inline error ("You've already RSVP'd for this event.").

### Admin — event form (`/admin/events`)

- New **"Enable RSVP"** checkbox in the create/edit form.
- New **"Ticket URL"** text input (optional, placeholder: `https://...`).
- Existing form fields unchanged.

### Admin — RSVP list

- On the admin events list, show an **"RSVPs (N)"** link next to each event that has `rsvpEnabled = true`.
- Clicking it shows a modal or inline panel listing all RSVPs (name, email, date registered).

---

## Constraints & guidance

- Follow the existing server component pattern: public event detail page fetches data server-side.
- The RSVP form must be a `"use client"` component (interactivity needed) — follow the `ContactForm.tsx` pattern.
- The `/api/rsvp` route is **public** (no auth required) for POST. The GET (admin RSVP list) requires `isAuthenticated()`.
- No new npm packages required. All data access goes through `src/lib/data.ts`.
- Tailwind only for styling — no new CSS files.
- Keep the `rsvpEnabled` default as `false` so existing events are unaffected.

---

## Updates — 2026-05-31

The following changes were agreed before implementation began. They supersede the original decisions above where there is a conflict.

### 1. "Going" button on event cards (not just detail page)

The original spec placed the RSVP form only on the event detail page (`/events/[id]`). The updated flow puts a **"Going →"** button directly on every event card so users never need to open the event to RSVP.

**Surfaces that show the button:**
- Events listing page (`/events`) — on each upcoming event card
- Homepage upcoming events section — on each event card
- Event detail page (`/events/[id]`) — replaces the inline RSVP form

The button is only rendered when `rsvpEnabled = true` on the event.

### 2. RSVP count display — only shown when ≥ 1

Each event card and detail page shows how many people have marked "Going" to motivate others. The count is fetched as part of the events data (not a separate request).

**Rule:** The count is **hidden entirely when it is 0**. Showing "0 people going" is demotivating and must not appear. The count only renders when `rsvpCount >= 1`.

### 3. Modal popup for RSVP form

Clicking "Going →" opens a **small modal/popup** over the current page. No navigation occurs. The modal contains the RSVP form (see §4 below). This replaces the inline form that was previously on the detail page.

### 4. Email is now optional

Original spec: `name` required, `email` required.  
Updated spec: `name` required, `email` **optional**.

- The `email` column in the `rsvps` table must be nullable.
- The unique constraint `(event_id, email)` still applies when an email is provided, preventing duplicate registrations from the same address. Multiple anonymous (no-email) RSVPs are allowed.
- The API (`POST /api/rsvp`) validates only that `eventId` and `name` are present. `email` is accepted but not required.
- The form label reads "Email (optional)" with placeholder "For event updates".

### 5. Data model change — `rsvpCount` on events

`GET /api/events` response now includes `rsvpCount: number` per event. This avoids a second per-event request on pages that show multiple cards. The count is derived by joining `rsvps` at query time.

The `Event` TypeScript interface gains:

```ts
rsvpCount: number;   // 0 when no RSVPs; used to conditionally show the count badge
```
