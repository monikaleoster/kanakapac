---
name: Data layer is Supabase Postgres, not JSON files
description: CLAUDE.md describes JSON files in /data as the data store, but the codebase has fully migrated to Supabase Postgres. JSON files are stale leftovers.
type: project
---

The data layer is **Supabase Postgres**, not JSON files. `src/lib/data.ts` uses the Supabase client for all reads and writes. `src/lib/supabase.ts` initialises the client with the service role key (server-side only). Schema is in `supabase/schema.sql`; seed data in `supabase/seed.sql`. JSON files in `/data` are legacy artifacts and are no longer read or written.

**Why:** The project was initially scaffolded with JSON files but migrated to Supabase for hosted persistence, unique constraints (subscribers), and concurrent-write safety.

**How to apply:** When suggesting data storage approaches, env vars, or deployment steps for this project, use Supabase — not JSON files. Required env vars: `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.