# Migrate Data Persistence from JSON Files to Supabase

The app currently stores all data in 7 local JSON files under `/data`. This works locally but **data is lost on each Vercel deployment** since the filesystem is ephemeral. This migration moves everything to a Supabase PostgreSQL database and uses Supabase Storage for file uploads.

## User Review Required

> [!IMPORTANT]
> **You need a Supabase project.** Go to [supabase.com](https://supabase.com), create a free project, and have these ready:
> - **Project URL** (e.g. `https://xxxx.supabase.co`)
> - **Anon Key** (public API key)
> - **Service Role Key** (for server-side operations)

> [!WARNING]
> All `data.ts` functions become `async`. This means every page/component that calls them must also become `async` or use `await`. This is a wide-reaching change touching **16 files**.

---

## Proposed Changes

### Supabase Setup

#### [NEW] [supabase.ts](file:///Users/monikaarora/code/aismart/kanakapac/src/lib/supabase.ts)
- Create a Supabase client using `@supabase/supabase-js`
- Reads `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from env

#### [NEW] [schema.sql](file:///Users/monikaarora/code/aismart/kanakapac/supabase/schema.sql)
- SQL migration to create all 7 tables:

| Table | Columns | Notes |
|---|---|---|
| `events` | id (uuid PK), title, date, time, location, description, created_at | |
| `minutes` | id (uuid PK), title, date, content, file_url, created_at | `content` and `file_url` nullable |
| `announcements` | id (uuid PK), title, content, priority, published_at, expires_at | `expires_at` nullable |
| `policies` | id (uuid PK), title, description, file_url, updated_at | |
| `team_members` | id (uuid PK), name, role, bio, email, sort_order | `email` nullable |
| `subscribers` | id (uuid PK), email (unique), subscribed_at | |
| `settings` | id (int PK default 1), school_name, pac_name, address, city, email, logo_url, meeting_time | Singleton row |

#### [NEW] [seed.sql](file:///Users/monikaarora/code/aismart/kanakapac/supabase/seed.sql)
- INSERT statements for all existing data from the 7 JSON files

---

### Data Layer Rewrite

#### [MODIFY] [data.ts](file:///Users/monikaarora/code/aismart/kanakapac/src/lib/data.ts)
- Remove all `fs`/`path` imports and `readJsonFile`/`writeJsonFile` helpers
- Import Supabase client from `supabase.ts`
- Make **all functions `async`**, returning `Promise<T>`
- Each function becomes a Supabase query, e.g.:
  ```diff
  -export function getEvents(): Event[] {
  -  return readJsonFile<Event>("events.json").sort(...)
  -}
  +export async function getEvents(): Promise<Event[]> {
  +  const { data } = await supabase
  +    .from("events")
  +    .select("*")
  +    .order("date", { ascending: true });
  +  return data ?? [];
  +}
  ```
- Same pattern for all CRUD functions across events, minutes, announcements, policies, team, subscribers, and settings

---

### File Upload Migration

#### [MODIFY] [route.ts](file:///Users/monikaarora/code/aismart/kanakapac/src/app/api/upload/route.ts)
- Replace local `fs.writeFileSync` with Supabase Storage upload
- Upload to a `minutes` bucket
- Return the public URL from Supabase Storage

---

### Consumer Updates (async handling)

All consumers of `data.ts` need `await` since functions are now async.

#### API Routes (already `async` — just add `await`)
- [MODIFY] [events/route.ts](file:///Users/monikaarora/code/aismart/kanakapac/src/app/api/events/route.ts)
- [MODIFY] [minutes/route.ts](file:///Users/monikaarora/code/aismart/kanakapac/src/app/api/minutes/route.ts)
- [MODIFY] [announcements/route.ts](file:///Users/monikaarora/code/aismart/kanakapac/src/app/api/announcements/route.ts)
- [MODIFY] [policies/route.ts](file:///Users/monikaarora/code/aismart/kanakapac/src/app/api/policies/route.ts)
- [MODIFY] [team/route.ts](file:///Users/monikaarora/code/aismart/kanakapac/src/app/api/team/route.ts)
- [MODIFY] [subscribe/route.ts](file:///Users/monikaarora/code/aismart/kanakapac/src/app/api/subscribe/route.ts)
- [MODIFY] [settings/route.ts](file:///Users/monikaarora/code/aismart/kanakapac/src/app/api/settings/route.ts)

#### Page Components (make `async` + add `await`)
- [MODIFY] [page.tsx](file:///Users/monikaarora/code/aismart/kanakapac/src/app/page.tsx) — home page
- [MODIFY] [events/page.tsx](file:///Users/monikaarora/code/aismart/kanakapac/src/app/events/page.tsx)
- [MODIFY] [minutes/page.tsx](file:///Users/monikaarora/code/aismart/kanakapac/src/app/minutes/page.tsx)
- [MODIFY] [minutes/[id]/page.tsx](file:///Users/monikaarora/code/aismart/kanakapac/src/app/minutes/%5Bid%5D/page.tsx)
- [MODIFY] [announcements/page.tsx](file:///Users/monikaarora/code/aismart/kanakapac/src/app/announcements/page.tsx)
- [MODIFY] [policies/page.tsx](file:///Users/monikaarora/code/aismart/kanakapac/src/app/policies/page.tsx)
- [MODIFY] [about/page.tsx](file:///Users/monikaarora/code/aismart/kanakapac/src/app/about/page.tsx)
- [MODIFY] [contact/page.tsx](file:///Users/monikaarora/code/aismart/kanakapac/src/app/contact/page.tsx)

#### Layout Components (convert to async server components)
- [MODIFY] [Header.tsx](file:///Users/monikaarora/code/aismart/kanakapac/src/components/Header.tsx) — add `await` to `getSchoolSettings()`
- [MODIFY] [Footer.tsx](file:///Users/monikaarora/code/aismart/kanakapac/src/components/Footer.tsx) — add `await` to `getSchoolSettings()`

---

### Environment Variables

#### [MODIFY] [.env.local](file:///Users/monikaarora/code/aismart/kanakapac/.env.local)
Add:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
These same variables must also be added in **Vercel dashboard → Settings → Environment Variables**.

---

## Verification Plan

### Automated Tests
- Run `npm run build` — must compile with zero errors
- No existing test suite to run

### Manual Verification
After running `schema.sql` and `seed.sql` in the Supabase SQL editor and starting the dev server:

1. **Home page** — Verify upcoming events and announcements load
2. **Events page** — Verify event list renders
3. **Minutes page** — Verify minutes list renders, click one to see detail
4. **About page** — Verify team members render
5. **Contact page** — Verify school settings (name, address) render
6. **Policies page** — Verify policy list renders
7. **Admin login** → go to `/admin`, sign in with password
8. **Admin CRUD** — Create, edit, delete an event from admin dashboard. Refresh to confirm persistence
9. **File upload** — Upload a minutes PDF from admin, confirm download link works
10. **Subscribe** — Enter email in subscribe form, verify it appears in admin subscribers list
11. **Settings** — Update school name in admin settings, confirm Header/Footer update
