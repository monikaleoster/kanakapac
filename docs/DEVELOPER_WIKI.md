# Kanaka PAC Website — Developer Wiki

> **Audience:** Junior developers (0–2 years experience) who have never seen this codebase.  
> **Goal:** Enable you to understand, debug, maintain, and build features independently.

---

## Table of Contents

1. [Project Summary](#1-project-summary)
2. [Technology Stack](#2-technology-stack)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Repository Structure](#4-repository-structure)
5. [Data Models](#5-data-models)
6. [Database Schema](#6-database-schema)
7. [Pages & Routes](#7-pages--routes)
8. [API Routes — Complete Reference](#8-api-routes--complete-reference)
9. [Business Workflows](#9-business-workflows)
10. [Request Flow Tracing](#10-request-flow-tracing)
11. [Authentication Deep Dive](#11-authentication-deep-dive)
12. [Email System Deep Dive](#12-email-system-deep-dive)
13. [File Upload Deep Dive](#13-file-upload-deep-dive)
14. [Key Components](#14-key-components)
15. [Configuration & Environment Variables](#15-configuration--environment-variables)
16. [Developer Onboarding — Running Locally](#16-developer-onboarding--running-locally)
17. [Testing Guide](#17-testing-guide)
18. [Bug Investigation Guide](#18-bug-investigation-guide)
19. [Feature Development Guide](#19-feature-development-guide)
20. [Known Quirks & Gotchas](#20-known-quirks--gotchas)
21. [Junior Developer Task Catalog](#21-junior-developer-task-catalog)

---

## 1. Project Summary

### What problem does this solve?

Kanaka Elementary School's Parent Advisory Council (PAC) needed a central website to:
- Keep parents informed about school events and meetings
- Publish time-sensitive announcements
- Archive meeting minutes
- Share governance policies and documents
- Enable parents to subscribe to email updates

Before this site, PAC communication was scattered across emails and newsletters.

### Target users

| User type | What they do |
|-----------|-------------|
| **Public parents/guardians** | Read events, announcements, minutes, policies. Subscribe to emails. RSVP to events. |
| **PAC Admin** | Create/edit/delete all content, send emails to subscribers, manage team profiles. |

### Key capabilities

- Events with optional RSVP (duplicate-prevention included)
- Urgent/normal announcements with optional expiry dates
- Meeting minutes with Markdown rendering
- Policy document uploads (PDF/DOC)
- Executive team profiles
- Newsletter subscription with welcome email and unsubscribe links
- Bulk email to all subscribers (announcements or events)
- Admin area protected by a single shared password

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | ^14.2.0 | Full-stack React framework (App Router) |
| Language | TypeScript | ^5.4.0 | Type safety |
| Styling | Tailwind CSS | ^3.4.0 | Utility-first CSS |
| Database | Supabase (PostgreSQL) | @supabase/supabase-js ^2.97.0 | Persistent data storage |
| Auth | NextAuth.js | ^4.24.13 | Session management (Credentials provider) |
| Email | Resend | ^6.12.2 | Transactional email delivery |
| IDs | uuid | ^9.0.0 | Unique record identifiers |
| Testing | Jest + React Testing Library | ^29.7.0 | Unit tests |
| Node.js | (system) | ≥18 | Runtime |

**No search engine, no message broker, no external queues.** This is a straightforward CRUD application.

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                         │
│   - Server-rendered HTML from Next.js                           │
│   - "use client" components for interactive UI (forms, modals)  │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP / fetch()
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js App (Vercel)                        │
│                                                                  │
│  ┌──────────────────────┐    ┌──────────────────────────────┐  │
│  │   Server Components  │    │       API Route Handlers     │  │
│  │  (src/app/*/page.tsx)│    │   (src/app/api/*/route.ts)   │  │
│  │  - Fetch data        │    │   - CRUD operations          │  │
│  │  - Render HTML       │    │   - Auth check               │  │
│  └──────────┬───────────┘    └──────────────┬───────────────┘  │
│             │                               │                    │
│             └───────────────┬───────────────┘                   │
│                             ▼                                    │
│                   ┌─────────────────┐                           │
│                   │  src/lib/data.ts │                           │
│                   │  (data layer)    │                           │
│                   └────────┬────────┘                           │
│                            │                                     │
│              ┌─────────────┼──────────────┐                     │
│              ▼             ▼              ▼                      │
│       Supabase DB    Supabase Storage   Resend API               │
│       (PostgreSQL)   (file uploads)    (email)                   │
└─────────────────────────────────────────────────────────────────┘
```

### Middleware flow (auth protection)

```
Request → /admin/dashboard
           ↓
      middleware.ts (withAuth)
           ↓
      Has valid NextAuth session?
      YES → allow through
      NO  → redirect to /admin (login page)
```

**Routes protected by middleware** (`src/middleware.ts:9`):
```
/admin/dashboard/**
/admin/events/**
/admin/minutes/**
/admin/announcements/**
/admin/subscribers/**
```

Note: `/admin/policies`, `/admin/team`, `/admin/settings` are **not** in the middleware matcher — they rely on each API route checking `isAuthenticated()` instead.

---

## 4. Repository Structure

```
kanakapac/
├── src/
│   ├── app/                          # Next.js pages & API routes
│   │   ├── layout.tsx                # Root layout (Header, Footer, AuthProvider)
│   │   ├── page.tsx                  # Homepage
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── announcements/page.tsx
│   │   ├── events/
│   │   │   ├── page.tsx              # Event listing
│   │   │   └── [id]/page.tsx         # Event detail + RSVP
│   │   ├── minutes/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx         # Markdown rendering
│   │   ├── policies/page.tsx
│   │   ├── admin/                    # Password-protected admin area
│   │   │   ├── page.tsx              # Login form
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── events/page.tsx
│   │   │   ├── minutes/page.tsx
│   │   │   ├── announcements/page.tsx
│   │   │   ├── policies/page.tsx
│   │   │   ├── team/page.tsx
│   │   │   ├── subscribers/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/                      # REST API endpoints
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── events/route.ts
│   │       ├── announcements/route.ts
│   │       ├── minutes/route.ts
│   │       ├── policies/route.ts
│   │       ├── team/route.ts
│   │       ├── rsvp/route.ts
│   │       ├── subscribe/route.ts
│   │       ├── unsubscribe/route.ts
│   │       ├── send-email/route.ts
│   │       ├── settings/route.ts
│   │       └── upload/route.ts
│   ├── components/                   # Shared UI components
│   │   ├── Header.tsx                # Server component (fetches settings)
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx            # Client component (mobile menu)
│   │   ├── EventCard.tsx             # Client component (opens RSVP modal)
│   │   ├── EventDetailRsvp.tsx
│   │   ├── AnnouncementCard.tsx
│   │   ├── MinutesCard.tsx
│   │   ├── RsvpModal.tsx             # Client component (RSVP form)
│   │   ├── RsvpForm.tsx
│   │   ├── SubscribeForm.tsx         # Client component (email signup)
│   │   ├── ContactForm.tsx           # Client component (UI only, no backend)
│   │   ├── AuthProvider.tsx          # Wraps app in NextAuth SessionProvider
│   │   └── FloatingPromo.tsx
│   ├── lib/                          # Business logic & utilities
│   │   ├── types.ts                  # All TypeScript interfaces
│   │   ├── data.ts                   # All Supabase queries (the data layer)
│   │   ├── format.ts                 # Date/time formatting
│   │   ├── auth.ts                   # isAuthenticated() helper
│   │   ├── auth-options.ts           # NextAuth config
│   │   ├── resend.ts                 # Email sending + HTML templates
│   │   ├── supabase.ts               # Supabase client singleton
│   │   └── init-db.ts
│   ├── middleware.ts                 # Route protection (NextAuth)
│   └── instrumentation.ts
├── supabase/
│   ├── schema.sql                    # Table definitions (source of truth)
│   ├── seed.sql                      # Sample data for development
│   └── migrations/                   # Incremental schema changes
├── src/__tests__/unit/               # Jest unit tests
│   ├── components/
│   └── lib/
├── data/                             # Legacy JSON files (no longer used)
├── package.json
├── next.config.js
├── tailwind.config.ts
├── jest.config.ts
└── CLAUDE.md
```

---

## 5. Data Models

All types are defined in `src/lib/types.ts`.

### Event
```typescript
interface Event {
    id: string;          // UUID
    title: string;
    date: string;        // "YYYY-MM-DD"
    time: string;        // "HH:MM" (24-hour)
    location: string;
    description: string;
    rsvpEnabled: boolean; // if true, RSVP button appears
    ticketUrl?: string;  // optional external link for ticketed events
    rsvpCount: number;   // computed at read time from rsvps table (not stored)
    createdAt: string;   // ISO timestamp
}
```

### RSVP
```typescript
interface Rsvp {
    id: string;
    eventId: string;
    name: string;
    email?: string;  // optional
    createdAt: string;
}
```

### Minutes
```typescript
interface Minutes {
    id: string;
    title: string;
    date: string;       // "YYYY-MM-DD"
    content?: string;   // Markdown text
    createdAt: string;
}
```

### Announcement
```typescript
interface Announcement {
    id: string;
    title: string;
    content: string;
    priority: "normal" | "urgent";
    publishedAt: string;
    expiresAt: string | null;  // null means never expires
}
```

### Policy
```typescript
interface Policy {
    id: string;
    title: string;
    description: string;
    fileUrl: string;    // public URL to file in Supabase Storage
    updatedAt: string;
}
```

### TeamMember
```typescript
interface TeamMember {
    id: string;
    name: string;
    role: string;       // e.g., "President", "Treasurer"
    bio: string;
    email?: string;
    order: number;      // sort_order in DB; controls display order
}
```

### Subscriber
```typescript
interface Subscriber {
    id: string;
    email: string;
    subscribedAt: string;
}
```

### SchoolSettings (singleton)
```typescript
interface SchoolSettings {
    schoolName: string;  // e.g., "Kanaka Elementary School"
    pacName: string;     // e.g., "Kanaka PAC" — appears in header & emails
    address: string;
    city: string;
    email: string;
    logoUrl?: string;    // URL to logo in Supabase Storage
    meetingTime?: string; // e.g., "First Wednesday of each month, 7:00 PM"
}
```

**Important note about `SchoolSettings`:** The `settings` table has a `CONSTRAINT single_row CHECK (id = 1)` — only one row ever exists. It is always read/written with `id = 1`. If the row doesn't exist, `getSchoolSettings()` returns `defaultSettings` (defined in `src/lib/types.ts:72`).

---

## 6. Database Schema

Tables in Supabase (PostgreSQL). Full definition: `supabase/schema.sql`.

### events
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | auto-generated |
| title | TEXT NOT NULL | |
| date | DATE NOT NULL | |
| time | TEXT | stored as "HH:MM" string |
| location | TEXT | |
| description | TEXT | |
| rsvp_enabled | BOOLEAN DEFAULT false | |
| ticket_url | TEXT | nullable |
| created_at | TIMESTAMPTZ DEFAULT NOW() | |

### rsvps
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| event_id | UUID FK → events(id) ON DELETE CASCADE | |
| name | TEXT NOT NULL | |
| email | TEXT | nullable |
| created_at | TIMESTAMPTZ DEFAULT NOW() | |
| | UNIQUE(event_id, email) | prevents duplicates by email |

> **Gotcha:** The unique constraint is on `(event_id, email)` — not `(event_id, name)`. Two people with the same name but different emails can both RSVP. Someone without an email can only RSVP once only because the duplicate check in the API (`saveRsvp`) catches Postgres error code `23505` (`src/lib/data.ts:153`).

### minutes
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| title | TEXT NOT NULL | |
| date | DATE NOT NULL | |
| content | TEXT | Markdown |
| file_url | TEXT | (schema has this column; app doesn't currently use it) |
| created_at | TIMESTAMPTZ DEFAULT NOW() | |

### announcements
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| title | TEXT NOT NULL | |
| content | TEXT NOT NULL | |
| priority | TEXT DEFAULT 'normal' | 'normal' or 'urgent' |
| published_at | TIMESTAMPTZ DEFAULT NOW() | |
| expires_at | TIMESTAMPTZ | nullable |

### policies
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| title | TEXT NOT NULL | |
| description | TEXT | |
| file_url | TEXT | public URL |
| updated_at | TIMESTAMPTZ DEFAULT NOW() | |

### team_members
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | TEXT NOT NULL | |
| role | TEXT NOT NULL | |
| bio | TEXT | |
| email | TEXT | nullable |
| sort_order | INTEGER DEFAULT 0 | controls display order |

### subscribers
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| email | TEXT UNIQUE NOT NULL | |
| subscribed_at | TIMESTAMPTZ DEFAULT NOW() | |

### settings (singleton)
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK DEFAULT 1 | CONSTRAINT single_row CHECK (id = 1) |
| school_name | TEXT NOT NULL | |
| pac_name | TEXT NOT NULL | |
| address | TEXT | |
| city | TEXT | |
| email | TEXT | |
| logo_url | TEXT | |
| meeting_time | TEXT | |

### ER Diagram

```
events ──< rsvps (event_id FK)
           ON DELETE CASCADE: deleting event removes all RSVPs

subscribers (standalone)
settings (singleton, id=1 always)
minutes (standalone)
announcements (standalone)
policies (standalone)
team_members (standalone)
```

---

## 7. Pages & Routes

### Public pages

| URL | File | Server or Client | Data fetched |
|-----|------|-----------------|-------------|
| `/` | `src/app/page.tsx` | Server | `getUpcomingEvents()` (top 3), `getActiveAnnouncements()` (top 3), `getSchoolSettings()` |
| `/events` | `src/app/events/page.tsx` | Server | `getUpcomingEvents()`, `getPastEvents()` |
| `/events/[id]` | `src/app/events/[id]/page.tsx` | Server | `getEventById(id)` |
| `/minutes` | `src/app/minutes/page.tsx` | Server | `getMinutes()` |
| `/minutes/[id]` | `src/app/minutes/[id]/page.tsx` | Server | `getMinutesById(id)` |
| `/announcements` | `src/app/announcements/page.tsx` | Server | `getAnnouncements()` |
| `/policies` | `src/app/policies/page.tsx` | Server | `getPolicies()` |
| `/about` | `src/app/about/page.tsx` | Server | `getTeamMembers()` |
| `/contact` | `src/app/contact/page.tsx` | Server | `getSchoolSettings()` |

> All public pages use `export const dynamic = "force-dynamic"` to opt out of caching. This means every request hits Supabase. For a low-traffic site this is fine.

### Admin pages (require authentication)

| URL | File | Notes |
|-----|------|-------|
| `/admin` | `src/app/admin/page.tsx` | Login form. Client component. |
| `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` | Navigation hub. Protected by middleware. |
| `/admin/events` | `src/app/admin/events/page.tsx` | Full CRUD + RSVP viewer. Client component. |
| `/admin/minutes` | `src/app/admin/minutes/page.tsx` | Full CRUD. Client component. |
| `/admin/announcements` | `src/app/admin/announcements/page.tsx` | Full CRUD + email trigger. Client component. |
| `/admin/policies` | `src/app/admin/policies/page.tsx` | Full CRUD + file upload. Client component. |
| `/admin/team` | `src/app/admin/team/page.tsx` | Full CRUD + reorder. Client component. |
| `/admin/subscribers` | `src/app/admin/subscribers/page.tsx` | View + delete + bulk email. Client component. |
| `/admin/settings` | `src/app/admin/settings/page.tsx` | Edit school info + logo upload. Client component. |

---

## 8. API Routes — Complete Reference

All API routes live in `src/app/api/`. Every mutating endpoint (POST/PUT/DELETE) calls `isAuthenticated()` from `src/lib/auth.ts`, except for `POST /api/rsvp`, `POST /api/subscribe`, and `GET /api/unsubscribe` which are public.

### `GET/POST/PUT/DELETE /api/events`
File: `src/app/api/events/route.ts`

| Method | Auth | Body / Params | Returns |
|--------|------|--------------|---------|
| GET | No | — | `Event[]` |
| POST | Yes | Event fields (JSON) | `Event` (201) |
| PUT | Yes | Full Event object (JSON) | `Event` (200) |
| DELETE | Yes | `?id=<uuid>` | `{success: true}` |

The POST handler auto-generates `id` (uuid) and `createdAt` if not provided.  
The PUT handler uses `saveEvent()` which internally does an **upsert** — so the full event object must be sent.

### `GET/POST /api/rsvp`
File: `src/app/api/rsvp/route.ts`

| Method | Auth | Body / Params | Returns |
|--------|------|--------------|---------|
| POST | No | `{eventId, name, email?}` | `{success: true}` (201) or `{error: "Already registered"}` (409) |
| GET | Yes | `?eventId=<uuid>` | `Rsvp[]` |

### `GET/POST/DELETE /api/subscribe`
File: `src/app/api/subscribe/route.ts`

| Method | Auth | Body / Params | Returns |
|--------|------|--------------|---------|
| GET | Yes | — | `Subscriber[]` |
| POST | No | `{email}` | `{success: true, message}` |
| DELETE | Yes | `?email=<email>` | `{success: true}` |

On successful POST, a welcome email is sent asynchronously (errors are caught and logged, they don't fail the request).

### `GET /api/unsubscribe`
File: `src/app/api/unsubscribe/route.ts`

| Method | Auth | Params | Returns |
|--------|------|--------|---------|
| GET | No | `?token=<base64url-encoded email>` | HTML page (200) or JSON error |

Token is decoded with `Buffer.from(token, 'base64url').toString('utf-8')`.

### `POST /api/send-email`
File: `src/app/api/send-email/route.ts`

| Method | Auth | Body | Returns |
|--------|------|------|---------|
| POST | Yes | `{type: "announcement"|"event", subject, title, content, date?, time?, location?, description?}` | `{success, sentCount, totalSubscribers, errors?}` |

Iterates over all subscribers and sends one email per person. Partial failures are tracked.

### `POST /api/upload`
File: `src/app/api/upload/route.ts`

| Method | Auth | Params | Body | Returns |
|--------|------|--------|------|---------|
| POST | No* | `?context=document\|image` | `multipart/form-data` with `file` field | `{fileUrl: string}` |

> *Note: This endpoint does **not** call `isAuthenticated()`. It relies on the fact that only admin pages trigger uploads, but technically anyone who knows the URL can upload a file. This is a known limitation.

Allowed types:
- `document`: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`
- `image`: `image/png`, `image/jpeg`, `image/jpg`

Files are stored in the Supabase `minutes` bucket with a `{timestamp}-{sanitized-filename}` key.

### `GET/POST/PUT/DELETE /api/announcements`
File: `src/app/api/announcements/route.ts` — Same pattern as events.

### `GET/POST/PUT/DELETE /api/minutes`
File: `src/app/api/minutes/route.ts` — Same pattern as events.

### `GET/POST/PUT/DELETE /api/policies`
File: `src/app/api/policies/route.ts` — Same pattern as events.

### `GET/POST/PUT/DELETE /api/team`
File: `src/app/api/team/route.ts` — Same pattern as events.

### `GET/POST /api/settings`
File: `src/app/api/settings/route.ts`

| Method | Auth | Body | Returns |
|--------|------|------|---------|
| GET | No | — | `SchoolSettings` |
| POST | Yes | `SchoolSettings` (JSON) | `{success: true}` |

---

## 9. Business Workflows

### Workflow 1: Parent RSVPs to an Event

**Business goal:** Let parents signal attendance so the PAC knows how many people to expect.

**User journey:**
1. Parent visits `/events`
2. Sees an event card with an RSVP count and "Going →" button
3. Clicks "Going →" → `RsvpModal` opens
4. Enters name (required) and email (optional) → clicks "RSVP Now"
5. On success: sees "You're going! See you there." message

**Sequence diagram:**
```
Browser          EventCard          RsvpModal       /api/rsvp    Supabase
   │                │                   │               │             │
   │  click "Going" │                   │               │             │
   │─────────────── ▶                   │               │             │
   │                │  setModalOpen(true)│               │             │
   │                │ ──────────────────▶               │             │
   │                │                   │ handleSubmit   │             │
   │                │                   │  POST /api/rsvp│             │
   │                │                   │───────────────▶             │
   │                │                   │                │ INSERT rsvps│
   │                │                   │                │────────────▶│
   │                │                   │                │  201 OK     │
   │                │                   │ ◀──────────────             │
   │                │                   │ status="success"             │
```

**Source code locations:**

| Responsibility | File:line |
|---------------|-----------|
| RSVP button on card | `src/components/EventCard.tsx:84` |
| Modal component | `src/components/RsvpModal.tsx` |
| `handleSubmit` function | `src/components/RsvpModal.tsx:19` |
| API handler | `src/app/api/rsvp/route.ts:5` |
| DB insert | `src/lib/data.ts:143` (`saveRsvp`) |
| Duplicate detection | `src/lib/data.ts:153` (error code `23505`) |

---

### Workflow 2: Admin Posts an Announcement

**Business goal:** Quickly inform all subscribed parents about important news.

**User journey:**
1. Admin navigates to `/admin/announcements`
2. Clicks "+ New Announcement"
3. Fills in title, content, priority (normal/urgent), optional expiry date
4. Clicks "Post Announcement"
5. Browser shows `confirm()` dialog: "Would you like to email this to all subscribers?"
6. If yes → email is sent to every subscriber via Resend

**Sequence diagram:**
```
AdminAnnouncementsPage    /api/announcements    /api/send-email    Resend API    Supabase
         │                        │                    │               │              │
handleSubmit (POST)               │                    │               │              │
         │──────────────────────▶ │                    │               │              │
         │                        │  saveAnnouncement  │               │              │
         │                        │────────────────────│───────────────│─────────────▶│
         │                        │  201 OK            │               │              │
         │ ◀────────────────────  │                    │               │              │
         │ confirm() dialog       │                    │               │              │
         │─────────────────────────────────────────── ▶│               │              │
         │                        │                    │ getSubscribers│              │
         │                        │                    │──────────────────────────── ▶│
         │                        │                    │ ◀────────────────────────────│
         │                        │                    │  for each subscriber:        │
         │                        │                    │─────────────▶│  send email   │
         │                        │                    │ {sentCount}  │               │
         │ ◀──────────────────────────────────────────                │               │
```

**Source code locations:**

| Responsibility | File:line |
|---------------|-----------|
| Form submit | `src/app/admin/announcements/page.tsx:64` |
| Email prompt (confirm dialog) | `src/app/admin/announcements/page.tsx:87` |
| API: save announcement | `src/app/api/announcements/route.ts` |
| API: send email | `src/app/api/send-email/route.ts` |
| Get all subscribers | `src/lib/data.ts:512` |
| Build HTML email | `src/lib/resend.ts:43` (`buildAnnouncementEmailHtml`) |
| Send via Resend | `src/lib/resend.ts:20` (`sendEmail`) |

---

### Workflow 3: Parent Subscribes to Newsletter

**Business goal:** Build a mailing list so the PAC can reach parents directly.

**User journey:**
1. Parent sees "Stay Updated!" section on homepage or events page
2. Enters email → clicks "Subscribe"
3. Receives welcome email immediately
4. Can unsubscribe via the link in any future email

**Source code locations:**

| Responsibility | File |
|---------------|------|
| Subscribe form component | `src/components/SubscribeForm.tsx` |
| API endpoint | `src/app/api/subscribe/route.ts:17` |
| Save to DB | `src/lib/data.ts:531` (`saveSubscriber`) |
| Send welcome email | `src/app/api/subscribe/route.ts:37` |
| Welcome email HTML | `src/lib/resend.ts:107` |
| Unsubscribe endpoint | `src/app/api/unsubscribe/route.ts` |
| Token generation | `src/lib/resend.ts:38` (`generateUnsubscribeUrl`) |
| Token decoding | `src/app/api/unsubscribe/route.ts:14` |

---

### Workflow 4: Admin Manages Events

**Business goal:** Keep the events calendar up to date.

**User journey:**
1. Admin visits `/admin/events`
2. Page loads → `GET /api/events` → list rendered
3. Click "+ New Event" → inline form appears
4. Fill details, optionally enable RSVP → "Create Event" → `POST /api/events`
5. To edit: click "Edit" → form pre-fills → "Update Event" → `PUT /api/events`
6. To delete: click "Delete" → confirmation modal → "Delete" → `DELETE /api/events?id=...`
7. To view RSVPs: click "RSVPs" → modal with RSVP list → `GET /api/rsvp?eventId=...`

---

### Workflow 5: File Upload for Policies

**Business goal:** Give parents downloadable copies of PAC governance documents.

**User journey:**
1. Admin visits `/admin/policies` → clicks "+ New Policy"
2. Fills title and description, selects a PDF file
3. File is uploaded via `POST /api/upload?context=document`
4. Returned `fileUrl` is stored with the policy record
5. Public users see the policy on `/policies` with a download link

---

## 10. Request Flow Tracing

### Example: `GET /events` page

```
Browser requests /events
    ↓
Next.js routes to src/app/events/page.tsx
    ↓
EventsPage() (async server component)
    ↓
getUpcomingEvents()                    ← src/lib/data.ts:57
    ↓
supabase.from("events").select("*")    ← src/lib/supabase.ts (client)
    .gte("date", today)
    .order("date", ascending)
    ↓
getRsvpCountMap(eventIds)              ← src/lib/data.ts:15
    (batches all event IDs in one query to get RSVP counts)
    ↓
Returns Event[] with rsvpCount filled in
    ↓
getPastEvents() (same flow, lt("date", today))
    ↓
Renders <EventCard> for each event
    ↓
HTML sent to browser
```

### Example: `POST /api/events` (create event)

```
Admin fills form → fetch("/api/events", {method:"POST", body: JSON})
    ↓
Next.js routes to src/app/api/events/route.ts → POST handler
    ↓
isAuthenticated()                      ← src/lib/auth.ts:4
    ↓ calls getServerSession(authOptions)
    ↓ authOptions from src/lib/auth-options.ts
    ↓ returns true if valid session, false otherwise
    ↓
(if unauthorized) → 401 response
    ↓
(if authorized) body = await request.json()
    ↓
saveEvent(event)                       ← src/lib/data.ts:108
    ↓
supabase.from("events").upsert({id, ...payload})
    ↓
201 response with event JSON
    ↓
Admin page calls fetchEvents() to refresh list
```

### Example: `POST /api/rsvp` (public — no auth)

```
User submits RSVP form → fetch("/api/rsvp", {method:"POST"})
    ↓
src/app/api/rsvp/route.ts → POST handler
    ↓
Validate: eventId and name must be present (else 400)
    ↓
saveRsvp({eventId, name, email})       ← src/lib/data.ts:143
    ↓
supabase.from("rsvps").insert({...})
    ↓
  if error.code === '23505' (unique constraint)
    → return {error: 'duplicate'}
    → API returns 409
  if other error
    → return {error: 'unknown'}
    → API returns 500
  if success
    → return {}
    → API returns 201
```

---

## 11. Authentication Deep Dive

### How it works

The admin area uses **NextAuth.js** with a **Credentials provider** (single shared password).

**Configuration:** `src/lib/auth-options.ts`

```typescript
// Password is from environment variable, default is "pac-admin-2026"
const adminPassword = process.env.ADMIN_PASSWORD || "pac-admin-2026";

if (credentials?.password === adminPassword) {
  return { id: "1", name: "Admin", email: "admin@kanakapac.com" };
}
return null; // login fails
```

There is no user database. All PAC admins share one password.

### Session lifecycle

1. Admin submits login form (`src/app/admin/page.tsx:29`)
2. `signIn("credentials", {password, redirect: false})` is called
3. NextAuth verifies password, creates a **JWT session token**
4. Token stored in `next-auth.session-token` cookie
5. Middleware reads this cookie to protect routes

### Checking auth in API routes

```typescript
// src/lib/auth.ts
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session;
}
```

Every protected API route does:
```typescript
if (!(await isAuthenticated())) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Middleware protection

`src/middleware.ts` uses `withAuth` from NextAuth, protecting these paths:
```
/admin/dashboard/**
/admin/events/**
/admin/minutes/**
/admin/announcements/**
/admin/subscribers/**
```

If a user hits any of these without a session, they are redirected to `/admin` (the login page).

### Login flow diagram

```
User visits /admin/dashboard (no session)
      ↓
middleware.ts → withAuth sees no token
      ↓
Redirects to /admin (signIn page)
      ↓
User submits password form
      ↓
signIn("credentials", {password}) calls /api/auth/[...nextauth]
      ↓
auth-options.ts: password === ADMIN_PASSWORD?
  YES → return user object → NextAuth creates JWT
  NO  → return null → signIn returns {error: "CredentialsSignin"}
      ↓
On success: router.push("/admin/dashboard")
```

---

## 12. Email System Deep Dive

### Service: Resend

File: `src/lib/resend.ts`

Resend is an email API service. The client is initialized on every request to ensure the API key is present:

```typescript
function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY environment variable is not set');
  return new Resend(apiKey);
}
```

### Sending an email

```typescript
await sendEmail({
  to: "parent@example.com",       // or string[]
  subject: "New Announcement",
  html: "<p>Content here</p>"
});
```

Emails always have `replyTo: 'kcpactreasurer@gmail.com'` hardcoded (`src/lib/resend.ts:26`).

### Email templates

| Function | File:line | Used when |
|----------|-----------|-----------|
| `buildWelcomeEmailHtml` | `src/lib/resend.ts:107` | New subscriber |
| `buildAnnouncementEmailHtml` | `src/lib/resend.ts:43` | Admin sends announcement |
| `buildEventEmailHtml` | `src/lib/resend.ts:71` | Admin sends event notice |

All templates:
- Include `{pacName}` in the header (fetched from settings)
- Include an unsubscribe link at the bottom

### Unsubscribe token

```typescript
// Generate
const token = Buffer.from(email).toString('base64url');
// URL: /api/unsubscribe?token=<token>

// Decode (in /api/unsubscribe)
const email = Buffer.from(token, 'base64url').toString('utf-8');
```

This is a simple encoding, not encryption — the email address is not secret, just URL-safe.

### Bulk email flow

`POST /api/send-email` iterates over subscribers sequentially:
```typescript
for (const subscriber of subscribers) {
  try {
    await sendEmail({ to: subscriber.email, subject, html });
    sentCount++;
  } catch {
    errors.push(subscriber.email);
  }
}
```

Failed sends are tracked in `errors[]` and returned in the response. The loop continues even if individual sends fail.

---

## 13. File Upload Deep Dive

### Flow

```
Admin selects file
      ↓
FormData sent to POST /api/upload?context=document
      ↓
src/app/api/upload/route.ts validates file type
      ↓
supabase.storage.from("minutes").upload(filename, buffer)
      ↓
supabase.storage.from("minutes").getPublicUrl(filename)
      ↓
Returns { fileUrl: "https://..." }
      ↓
Admin page stores fileUrl in the policy/settings record
```

### File naming

Files are stored as: `{Date.now()}-{sanitized-original-name}`

Sanitization: `file.name.replace(/[^a-zA-Z0-9.-]/g, "")` — removes all characters except letters, numbers, dots, and hyphens.

### Supabase Storage bucket

All uploads go into the `minutes` bucket (regardless of `context`). This is a naming quirk — the bucket is used for all file types (policies, logos, etc.).

### Auth note

The upload endpoint does **not** check authentication. This was noted above as a known limitation.

---

## 14. Key Components

### `Header.tsx` (Server Component)
**File:** `src/components/Header.tsx`

Fetches `SchoolSettings` on every render to display the current PAC name and logo. Because it's a server component, there's no client-side JS for the logo/name — it's baked into the HTML.

```typescript
// Renders logo from settings.logoUrl or a "P" placeholder
// Renders settings.pacName as the site title
```

### `Navigation.tsx` (Client Component)
**File:** `src/components/Navigation.tsx`

Manages mobile hamburger menu state with `useState`. Uses `usePathname()` to highlight the current route. The nav links array is hardcoded (`src/components/Navigation.tsx:7`).

### `EventCard.tsx` (Client Component)
**File:** `src/components/EventCard.tsx`

Has two interactive behaviors:
1. The whole card is a `<Link>` to `/events/[id]`
2. The "Going →" button opens `RsvpModal` (manages `modalOpen` state)

### `RsvpModal.tsx` (Client Component)
**File:** `src/components/RsvpModal.tsx`

State machine with 5 states: `idle | submitting | success | duplicate | error`

The modal renders `null` when `isOpen` is false (no DOM at all), keeping memory clean.

### `SubscribeForm.tsx` (Client Component)
**File:** `src/components/SubscribeForm.tsx`

State: `idle | loading | success | error`. Shows a simple confirmation text on success — the form itself is replaced by the message.

### `ContactForm.tsx` (Client Component)
**File:** `src/components/ContactForm.tsx`

> **Important known issue:** This form does **not** send any data anywhere. It shows a success message when submitted but the message is never delivered. There is no backend handler. This is a stub that needs to be connected to a real email endpoint.

### `AuthProvider.tsx`
**File:** `src/components/AuthProvider.tsx`

Wraps the entire app in NextAuth's `SessionProvider` so any client component can call `useSession()`. Defined in `src/app/layout.tsx:5`.

### `FloatingPromo.tsx` (Client Component)
**File:** `src/components/FloatingPromo.tsx`

Floating button in the bottom-right corner that toggles a tooltip. Exists for promotional purposes ("Built by Vector Local").

---

## 15. Configuration & Environment Variables

File: `.env.local` (never committed to git)

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `RESEND_API_KEY` | Yes (for email) | Resend API key | `re_xxx...` |
| `RESEND_FROM_EMAIL` | No | From address in emails | `Kanaka PAC <onboarding@resend.dev>` |
| `NEXT_PUBLIC_BASE_URL` | No | Used in unsubscribe URLs | `https://kanakapac.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | `http://127.0.0.1:54321` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase admin key (server-side only) | `sb_secret_...` |
| `DATABASE_URL` | No | Direct Postgres URL (unused in app code) | `postgresql://...` |
| `NEXTAUTH_SECRET` | Yes | Signs JWT tokens | random 32-byte base64 string |
| `NEXTAUTH_URL` | Yes* | Tells NextAuth the site URL | `http://localhost:3000` |
| `ADMIN_PASSWORD` | No | Admin login password | `pac-admin-2026` |

> `*` `NEXTAUTH_URL` is auto-set in `src/lib/auth-options.ts:7` if missing: it uses `VERCEL_URL` (set by Vercel automatically) or falls back to `http://localhost:3000`.

### How `NEXT_PUBLIC_` variables work

Variables prefixed with `NEXT_PUBLIC_` are embedded into the client-side JavaScript bundle at build time. **Never put secrets in `NEXT_PUBLIC_` variables** — they are visible to anyone who views page source.

`SUPABASE_SERVICE_ROLE_KEY` is intentionally **not** prefixed with `NEXT_PUBLIC_` — it is only used in server-side code and API routes.

---

## 16. Developer Onboarding — Running Locally

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Supabase CLI (for local DB): `brew install supabase/tap/supabase`
- A Resend account (for email testing) or use `console.log` mocking

### Step-by-step setup

**1. Clone and install:**
```bash
git clone <repo-url>
cd kanakapac
npm install
```

**2. Start local Supabase:**
```bash
supabase start
# This starts a local PostgreSQL instance + Supabase Studio
# Note the output — it will show your local URL and keys
```

**3. Apply the database schema:**
```bash
supabase db reset
# This runs supabase/schema.sql and supabase/seed.sql
```
Or manually run `supabase/schema.sql` in Supabase Studio at `http://localhost:54323`.

**4. Create `.env.local`:**
```bash
cp .env.example .env.local   # if .env.example exists, otherwise create manually
```

Fill in with values from `supabase start` output:
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<service role key from supabase start>
NEXTAUTH_SECRET=any-random-32-char-string
NEXTAUTH_URL=http://localhost:3000
ADMIN_PASSWORD=pac-admin-2026
RESEND_API_KEY=<your resend key or leave blank>
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**5. Start the dev server:**
```bash
npm run dev
# App available at http://localhost:3000
```

**6. Verify:**
- Visit `http://localhost:3000` — see homepage
- Visit `http://localhost:3000/admin` — enter password `pac-admin-2026`
- Create a test event at `/admin/events`
- Verify it appears on `/events`

### Common setup errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Supabase URL or Service Role Key is missing` | Missing env vars | Check `.env.local` |
| `NEXTAUTH_SECRET is not set` | Missing env var | Add any 32-char string |
| Login page shows "Invalid password" | Wrong `ADMIN_PASSWORD` | Default is `pac-admin-2026` |
| Events page shows empty | Supabase not running or schema not applied | Run `supabase start && supabase db reset` |
| Email not sending | `RESEND_API_KEY` missing | Expected in development — check console logs |

---

## 17. Testing Guide

### Test framework

- **Jest** — test runner
- **React Testing Library** — renders components and queries DOM
- **@testing-library/user-event** — simulates user interactions
- **jest-environment-jsdom** — simulates a browser DOM in Node.js

### Test files location

```
src/__tests__/unit/
├── components/
│   ├── AnnouncementCard.test.tsx
│   ├── EventCard.test.tsx
│   ├── MinutesCard.test.tsx
│   └── SubscribeForm.test.tsx
└── lib/
    ├── data.test.ts
    └── format.test.ts
```

### Running tests

```bash
npm test          # run all tests once
npm run test:watch  # re-run on file changes (development)
```

### What is tested

**`format.test.ts`** — Pure function tests (no mocks needed):
```typescript
expect(formatDate('2026-02-22')).toBe('February 22, 2026');
expect(formatTime('14:45')).toBe('2:45 PM');
```

**`EventCard.test.tsx`** — Component rendering:
```typescript
render(<EventCard event={mockEvent} />);
expect(screen.getByText('Spring Fair')).toBeInTheDocument();
```

### Writing a new test

1. Create file at `src/__tests__/unit/<area>/<name>.test.tsx`
2. Import from `@testing-library/react` and `@testing-library/jest-dom`
3. Use `render()` to mount components, `screen.getByText()` to query them

Example:
```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

test('renders correctly', () => {
  render(<MyComponent title="Hello" />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Mocking API calls in tests

For components that call `fetch()`, mock it globally:
```typescript
global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
) as jest.Mock;
```

---

## 18. Bug Investigation Guide

### Step 1: Identify the entry point

Ask yourself: is this a **page rendering issue**, **API issue**, or **UI interaction issue**?

| Symptom | Start here |
|---------|-----------|
| Page shows wrong data | `src/app/<page>/page.tsx` → data fetching functions in `src/lib/data.ts` |
| API returns wrong status code | `src/app/api/<resource>/route.ts` |
| Form submit doesn't work | The client component (e.g., `src/app/admin/events/page.tsx`) |
| RSVP modal misbehaves | `src/components/RsvpModal.tsx` |
| Email not sending | `src/lib/resend.ts` and `src/app/api/send-email/route.ts` |
| Admin can't log in | `src/lib/auth-options.ts`, check `ADMIN_PASSWORD` env var |
| Settings not showing in header | `src/components/Header.tsx` → `getSchoolSettings()` in `src/lib/data.ts:554` |
| File upload fails | `src/app/api/upload/route.ts` |

### Step 2: Check the data layer

All Supabase calls go through `src/lib/data.ts`. Every function logs errors:
```typescript
if (error) {
  console.error("Error fetching events:", error);
  return [];  // returns empty array, not null
}
```

Check the **server console** (not browser console) for these error messages.

### Step 3: Trace a specific API request

1. Open browser DevTools → Network tab
2. Reproduce the bug
3. Find the failing request (look for 4xx or 5xx)
4. Note the URL and request body
5. Open the corresponding `src/app/api/<resource>/route.ts`
6. Add `console.log` statements to trace execution

### Step 4: Check the database directly

Use Supabase Studio:
- Local: `http://localhost:54323`
- Production: Supabase dashboard

Run a query to check if data is present:
```sql
SELECT * FROM events ORDER BY created_at DESC LIMIT 10;
```

### Common bugs and their investigation paths

| Problem | Where to look |
|---------|--------------|
| Event not appearing on homepage | `src/app/page.tsx:10` — `getUpcomingEvents()` only returns events with `date >= today`. Check the event's date in DB. |
| RSVP count shows 0 | `src/lib/data.ts:15` — `getRsvpCountMap()`. Check `rsvps` table in DB. |
| Announcement showing after expiry | `src/lib/data.ts:282` — `getActiveAnnouncements()` filters with `expires_at.gt.now`. Check `expires_at` in DB. |
| Admin redirect loop | `src/middleware.ts` — check if `NEXTAUTH_SECRET` is set and consistent |
| Email has wrong "from" name | `src/lib/resend.ts:3` — `RESEND_FROM_EMAIL` env var |
| Unsubscribe link broken | `src/lib/resend.ts:38` — `generateUnsubscribeUrl()`. The `NEXT_PUBLIC_BASE_URL` must be set correctly. |
| Logo not showing | `src/components/Header.tsx:14` — `settings.logoUrl`. Check `settings` table row in DB. |
| Contact form message never arrives | `src/components/ContactForm.tsx:8` — form has no backend. `handleSubmit` just shows success UI. This is a known stub. |

### Step 5: Reading Next.js error messages

When a server component crashes, Next.js shows an error page in development. The full stack trace is in the **terminal** where you ran `npm run dev`. Check there first.

---

## 19. Feature Development Guide

### How to add a new CRUD resource (e.g., "Volunteer Sign-ups")

Follow the exact same pattern used for events, announcements, and minutes.

**Files to create/modify:**

1. **Add the TypeScript type** — `src/lib/types.ts`
   ```typescript
   export interface VolunteerSignup {
     id: string;
     name: string;
     eventId: string;
     // ...
   }
   ```

2. **Add the database table** — create `supabase/migrations/YYYYMMDD_add_volunteers.sql`
   ```sql
   CREATE TABLE volunteer_signups (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     event_id UUID REFERENCES events(id),
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```
   Apply with: `supabase db push` (or via Supabase Studio)

3. **Add data layer functions** — `src/lib/data.ts`
   ```typescript
   export async function getVolunteers(): Promise<VolunteerSignup[]> {
     noStore();
     const { data, error } = await supabase.from("volunteer_signups").select("*");
     if (error) { console.error(...); return []; }
     return (data || []).map(item => ({ id: item.id, ... }));
   }
   export async function saveVolunteer(v: VolunteerSignup): Promise<void> { ... }
   export async function deleteVolunteer(id: string): Promise<void> { ... }
   ```

4. **Create the API route** — `src/app/api/volunteers/route.ts`
   ```typescript
   export async function GET() { ... }
   export async function POST(request: NextRequest) {
     if (!(await isAuthenticated())) return NextResponse.json({error:"Unauthorized"},{status:401});
     // ...
   }
   ```

5. **Create public page** — `src/app/volunteers/page.tsx` (server component)

6. **Create admin page** — `src/app/admin/volunteers/page.tsx` (client component, same pattern as events)

7. **Add nav link** — `src/components/Navigation.tsx:7` (add to `navLinks` array)

8. **Add dashboard card** — `src/app/admin/dashboard/page.tsx` (add new `<Link>` card)

9. **Write tests** — `src/__tests__/unit/components/VolunteerCard.test.tsx`

---

### How to add a new field to an existing resource (e.g., add "capacity" to events)

1. **Update the type** — `src/lib/types.ts:1`
   ```typescript
   export interface Event {
     // ...
     capacity?: number; // add this
   }
   ```

2. **Add the column** — migration SQL:
   ```sql
   ALTER TABLE events ADD COLUMN capacity INTEGER;
   ```

3. **Update `mapEvent`** — `src/lib/data.ts:25`
   ```typescript
   function mapEvent(item, rsvpCount = 0): Event {
     return {
       // ...
       capacity: item.capacity as number | undefined,
     };
   }
   ```

4. **Update `saveEvent` payload** — `src/lib/data.ts:109`
   ```typescript
   const payload = {
     // ...
     capacity: event.capacity || null,
   };
   ```

5. **Update admin form** — `src/app/admin/events/page.tsx` (add input field)

6. **Update display** — wherever you want to show capacity (e.g., `EventCard.tsx`)

---

### How to change the admin login to support multiple users

Currently `src/lib/auth-options.ts:21` checks one password. To support multiple users:

1. Create a `users` table in Supabase with hashed passwords
2. In `auth-options.ts`, query the users table instead of comparing to env var
3. Use `bcrypt` to compare hashed passwords

---

### How to add a real backend to ContactForm

`src/components/ContactForm.tsx` currently shows a fake success state. To wire it up:

1. Create `src/app/api/contact/route.ts`
2. In the handler, call `sendEmail()` to forward the message to `settings.email`
3. Update `ContactForm.tsx` to `fetch("/api/contact", {...})` and handle the response

---

## 20. Known Quirks & Gotchas

### 1. `formatDate` appends `T00:00:00` to avoid timezone shift

`src/lib/format.ts:2`: `new Date(dateStr + "T00:00:00")`

Without `T00:00:00`, `new Date("2026-06-15")` is parsed as midnight UTC, which shifts to the previous day in timezones behind UTC. This fix forces local midnight parsing.

### 2. RSVP uniqueness is by email, not name

`supabase/schema.sql:23`: `UNIQUE (event_id, email)` — Two people named "Jane Smith" can both RSVP if they have different emails. Two submits from the same person without an email will fail on the second attempt (Postgres will reject it as a duplicate because both `email` values are `NULL` and PostgreSQL does not consider two `NULL` values equal for unique constraints). 

Actually, `UNIQUE` with two NULLs: PostgreSQL treats NULL as unknown, so **two NULLs do not violate a unique constraint**. This means multiple people can RSVP without providing an email. This is the intended behavior for the "name only" RSVP path.

### 3. All files upload to the "minutes" bucket

`src/app/api/upload/route.ts:34`: `supabase.storage.from("minutes")` — regardless of whether `?context=document` or `?context=image` is passed, all files land in the `minutes` bucket. The `context` param only affects file type validation.

### 4. Upload route has no auth check

`src/app/api/upload/route.ts` — anyone who knows the endpoint can upload arbitrary files. This is acceptable for a low-traffic internal site but should be fixed if the site becomes public-facing.

### 5. ContactForm is a UI stub

`src/components/ContactForm.tsx:8` — `handleSubmit` immediately shows "success" without sending any data. Messages entered into the contact form are **not delivered** anywhere.

### 6. Markdown is rendered by a custom regex, not a real parser

`src/app/minutes/[id]/page.tsx:13` — `renderMarkdown()` uses simple `.replace()` calls. It handles headings and list items but not nested lists, bold, italic, links, or tables. For complex minutes content, this may not render correctly.

### 7. `noStore()` on every read function

All `get*` functions in `src/lib/data.ts` call `noStore()` — this disables Next.js's built-in cache for each call, ensuring fresh data on every request. This is correct behavior but means no edge caching. For a small site it's fine.

### 8. The `data/` JSON files are not used

The `/data/` directory contains legacy JSON files (`events.json`, etc.) from an earlier version of the project that used file-based storage. The app now uses Supabase exclusively. These files are safe to ignore or delete.

---

## 21. Junior Developer Task Catalog

### Beginner tasks (1–3 hours each)

| Task | Files to modify | Skills learned |
|------|----------------|---------------|
| Fix the contact form to actually send an email | `src/components/ContactForm.tsx`, create `src/app/api/contact/route.ts`, `src/lib/resend.ts` | API routes, email integration |
| Add "copy to clipboard" button on minutes detail page | `src/app/minutes/[id]/page.tsx` | Client components, browser clipboard API |
| Add a character counter to announcement content textarea | `src/app/admin/announcements/page.tsx` | React state, controlled inputs |
| Make the navigation highlight sub-pages (e.g., `/admin/events` should highlight "Admin") | `src/components/Navigation.tsx:60` | `usePathname()`, string matching |
| Add event count badge to admin dashboard | `src/app/admin/dashboard/page.tsx`, `src/app/api/events/route.ts` | Server components vs client components |
| Show "No RSVPs yet" more prominently in admin events | `src/app/admin/events/page.tsx:186` | JSX, conditional rendering |

### Intermediate tasks (half day to 1 day each)

| Task | Files to modify | Skills learned |
|------|----------------|---------------|
| Add search/filter to events listing | `src/app/events/page.tsx`, `src/components/EventCard.tsx` | Client-side filtering, `useState` |
| Add pagination to announcements | `src/app/announcements/page.tsx`, `src/app/api/announcements/route.ts` | Pagination, URL query params |
| Add "Copy unsubscribe link" button to subscriber list | `src/app/admin/subscribers/page.tsx` | Clipboard API in admin |
| Add a "minutes file upload" option alongside markdown editor | `src/app/admin/minutes/page.tsx`, `src/app/api/upload/route.ts`, `src/lib/data.ts` | File upload flow end-to-end |
| Add auth check to the upload endpoint | `src/app/api/upload/route.ts` | `isAuthenticated()`, API security |
| Write tests for `RsvpModal` | `src/__tests__/unit/components/RsvpModal.test.tsx` | React Testing Library, `fetch` mocking |
| Add event capacity field | `src/lib/types.ts`, DB migration, `src/lib/data.ts`, admin form, event detail page | Full-stack feature from DB to UI |

### Advanced tasks (multiple days)

| Task | Files to modify | Skills learned |
|------|----------------|---------------|
| Add a real markdown editor (e.g., `@uiw/react-md-editor`) to the minutes admin | `src/app/admin/minutes/page.tsx`, `package.json` | Third-party component integration |
| Replace the single shared password with per-user accounts | `src/lib/auth-options.ts`, new `users` DB table, admin UI | Authentication design, bcrypt hashing |
| Add a real Markdown parser (e.g., `marked` or `remark`) to minutes rendering | `src/app/minutes/[id]/page.tsx`, `package.json` | Library integration, XSS safety |
| Add image optimization with Next.js `<Image>` | `src/components/Header.tsx:15`, anywhere `<img>` is used | Next.js Image component, performance |
| Add automated email test using Resend's sandbox mode | Test setup, environment config | Integration testing, Resend SDK |

---

## Appendix: Quick Reference — Function Call Chains

### Reading data

```
Page (server component)
  → src/lib/data.ts: get*() function
    → src/lib/supabase.ts: supabase client
      → Supabase (PostgreSQL)
```

### Writing data (from admin UI)

```
Admin page (client component, "use client")
  → fetch("/api/<resource>", {method: "POST/PUT/DELETE"})
    → src/app/api/<resource>/route.ts
      → isAuthenticated() → src/lib/auth.ts → getServerSession()
      → src/lib/data.ts: save*() / delete*() function
        → supabase.from(...).upsert() / .delete()
```

### Sending email

```
Admin action (subscribe or send-email endpoint)
  → src/lib/resend.ts: sendEmail()
    → src/lib/resend.ts: build*EmailHtml() template function
    → new Resend(apiKey).emails.send()
      → Resend API → subscriber inbox
```

---

*This wiki was generated from source code as of June 2026. If you find something that doesn't match the code, the code is always the source of truth — please update this document.*