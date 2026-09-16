# 01: Prefactor: extract shared Supabase Storage upload helper

**What to build:** `/api/upload`'s inline Supabase Storage logic is pulled out into a reusable helper that any route can call to upload a buffer and get back a public URL. No user-visible behavior changes — this exists purely to make the AI cover-image generation route (ticket 03) an easy addition instead of a duplicated one.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A shared upload helper function exists (e.g. in `src/lib/storage.ts`) taking a bucket, filename, buffer, and content type, and returning the resulting public URL.
- [ ] `/api/upload/route.ts` calls the shared helper instead of inlining Supabase Storage calls; existing behavior (bucket selection by context, content-type validation, auth gate, error responses) is unchanged.
- [ ] Existing manual cover-image upload and minutes-document upload flows continue to work exactly as before.
- [ ] No new user-facing behavior — this ticket is purely internal restructuring, verified by existing tests/flows still passing.
