# 01: Article data & API foundation

**What to build:** the end-to-end backend capability for Articles to exist with a Draft/Published lifecycle: schema, data-access, and the API route — verifiable directly via the API and unit tests, without any UI yet.

**Blocked by:** None (can start immediately)

**Status:** ready-for-human

- [x] A new `articles` table exists in Supabase (new timestamped migration under `supabase/migrations/`, mirrored in `supabase/schema.sql`), with columns for id, title, author, excerpt, body, cover image url, status, publishedAt, createdAt, matching the shape described in `CONTEXT.md` and `.scratch/articles/spec.md`.
- [x] `data.ts` exposes `getArticles`, `getPublishedArticles` (status = published, ordered by `publishedAt` descending), `getArticleById`, `saveArticle`, `deleteArticle`, following the same shape as the existing Events/Announcements functions.
- [x] `saveArticle` stamps `publishedAt` at the moment `status` transitions from draft to published, and leaves `publishedAt` untouched on subsequent saves of an already-published Article.
- [x] A shared pure sanitize function exists that strips unsafe HTML (e.g. script tags, event handler attributes) while preserving safe formatting.
- [x] `/api/articles` supports GET (public), POST/PUT/DELETE (behind `isAuthenticated()`), matching the Announcements route's shape, including server-side `uuidv4()` id generation.
- [x] Unit tests cover the `data.ts` Article functions (mocked Supabase client) and the sanitize helper (a safe fixture passes through with formatting intact, an unsafe fixture is stripped), per the Testing Decisions in `.scratch/articles/spec.md`.

## Comments

Implemented in commit fc65521. Status set to `ready-for-human` per this tracker's vocabulary (no "done" state) — a human should verify and move this along.
