# Tech Stack

## Overview

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server components, file-based routing, API routes in one repo |
| Language | TypeScript | Type safety across shared data shapes |
| Styling | Tailwind CSS | Utility-first, no separate CSS files to maintain |
| Data storage | Supabase Postgres | Hosted relational DB; handles concurrent writes, unique constraints, and scales beyond flat files |
| Auth | NextAuth.js (credentials provider) | Single admin password; session cookie managed by NextAuth |
| Email | Resend | Simple HTTP API, generous free tier (3,000 emails/month), reliable deliverability |

---

## Data layer

All data lives in a **Supabase Postgres** database. `src/lib/supabase.ts` initialises the client using the service role key (bypasses Row Level Security — all mutations are server-side only and never exposed to the browser). `src/lib/data.ts` is the single access layer; all reads and writes go through it.

**Tables** (defined in `supabase/schema.sql`):

| Table | Key columns |
|---|---|
| `events` | `id` (UUID), `title`, `date`, `time`, `location`, `description`, `created_at` |
| `minutes` | `id`, `title`, `date`, `content`, `file_url`, `created_at` |
| `announcements` | `id`, `title`, `content`, `priority`, `published_at`, `expires_at` |
| `policies` | `id`, `title`, `description`, `file_url`, `updated_at` |
| `team_members` | `id`, `name`, `role`, `bio`, `email`, `sort_order` |
| `subscribers` | `id`, `email` (UNIQUE), `subscribed_at` |
| `settings` | singleton row (`id = 1`), school/PAC name, address, contact, logo |

Seed data lives in `supabase/seed.sql`. Run the schema and seed against your Supabase project before first use.

**Required environment variables:**

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — server-side only, never expose to the client |

---

## Authentication

- **Provider:** NextAuth.js credentials provider.
- **Secret:** Single `ADMIN_PASSWORD` environment variable compared at sign-in.
- **Session:** JWT session stored in an HttpOnly cookie managed by NextAuth.
- **Protection:** `src/middleware.ts` uses `withAuth` to guard all `/admin/dashboard/*`, `/admin/events/*`, `/admin/minutes/*`, `/admin/announcements/*`, and `/admin/subscribers/*` routes. Unauthenticated requests are redirected to `/admin`.

There is one admin account (no multi-user support). If multi-user access becomes a requirement, extend NextAuth with a database adapter and a users table.

---

## Email (Resend)

- **SDK:** `resend` npm package.
- **Utility:** `src/lib/resend.ts` — initialises the client, exports `sendEmail()`, `generateUnsubscribeUrl()`, `buildAnnouncementEmailHtml()`, and `buildEventEmailHtml()`.
- **API routes:**
  - `POST /api/send-email` — admin-triggered blast to all subscribers.
  - `GET /api/unsubscribe?token=<base64url-email>` — one-click unsubscribe.
- **Subscribers:** stored in the Supabase `subscribers` table; managed via the admin subscribers page.

**Required environment variables:**

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | API key from resend.com dashboard |
| `RESEND_FROM_EMAIL` | Verified sender address (e.g. `Kanaka PAC <updates@kanakapac.com>`) |
| `NEXT_PUBLIC_BASE_URL` | Full site URL used to construct unsubscribe links |

Use `onboarding@resend.dev` as the from-address during development (no domain verification needed). Switch to a verified custom domain before launch.

---

## Hosting & Deployment

**Target platform: Vercel** (zero-config for Next.js, automatic preview deployments per PR).

**Steps to deploy:**
1. Push repo to GitHub (already done).
2. Create a Supabase project; run `supabase/schema.sql` then `supabase/seed.sql` in the SQL editor.
3. Import the repo in Vercel — it auto-detects Next.js.
4. Set all environment variables (see summary below) in Vercel's project settings.
5. Set `NEXTAUTH_SECRET` (random 32-char string) and `NEXTAUTH_URL` (production URL) in Vercel.
6. Verify the sender domain in the Resend dashboard and update `RESEND_FROM_EMAIL`.

**Required env vars for production (summary):**

```
ADMIN_PASSWORD=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://kanakapac.com
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=Kanaka PAC <updates@kanakapac.com>
NEXT_PUBLIC_BASE_URL=https://kanakapac.com
```