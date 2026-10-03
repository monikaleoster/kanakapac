# 01: Admin uploads a document for meeting minutes; visitors view it

**What to build:** An admin creates or edits a meeting-minutes entry by uploading a document (PDF, DOC, DOCX, or TXT) instead of typing Markdown content — required when creating a new entry, optional to replace when editing an existing one. Site visitors see a "View Document" link on each minutes entry (admin list, public archive list, and detail page) that opens the document in a new tab; an entry with no document attached yet (the two pre-existing content-only entries, until manually re-uploaded) shows a clear "no document yet" indicator instead of a broken or empty link. The underlying Supabase `minutes` storage bucket is made public via a tracked migration, so uploaded documents are actually reachable in production, not just locally.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] `Minutes` type gains `fileUrl`; `lib/data.ts`'s `getMinutes`/`getMinutesById`/`saveMinutes` read/write it via the already-existing `file_url` DB column.
- [ ] `/api/minutes` `POST`/`PUT` accept and persist `fileUrl`; response shapes otherwise unchanged (`GET` array, `POST` 201 + record, `PUT` 200 + record, `DELETE` unchanged 400-without-`id` behavior).
- [ ] Admin minutes form: the Markdown content textarea is replaced with a file input (`accept=".pdf,.doc,.docx,.txt"`) wired to the existing `POST /api/upload?context=document`, mirroring `AdminPoliciesPage`'s upload handling — shows the uploaded filename on success, a non-technical error message on failure, and keeps submit disabled/required based on whether a `fileUrl` is set (so editing an entry that already has one doesn't force a re-upload).
- [ ] Admin minutes list: each row gets a "View Document" link (`target="_blank"`) when a `fileUrl` is present.
- [ ] `MinutesCard` and the minutes detail page drop the content excerpt/markdown rendering and instead show a "View Document" link (`target="_blank"`) when `fileUrl` is present, or a "no document yet" message when it isn't.
- [ ] Public minutes list page intro copy no longer says "read the full minutes" (text-reading language); updated to reflect viewing a document.
- [ ] New migration makes the `minutes` Supabase Storage bucket public, following the same pattern and existence guard as `20260922000000_set_images_bucket_public.sql`; `supabase/config.toml` gains a matching `[storage.buckets.minutes]` public entry with a comment pointing at the migration.
- [ ] Unit test: new `src/__tests__/unit/api/minutes.test.ts` (node environment, mocking `isAuthenticated` and `lib/data.ts`) covering `GET` success, 401s on `POST`/`PUT`/`DELETE` when unauthenticated, `POST` passing `fileUrl` through to `saveMinutes`, and `DELETE` 400 without an `id`.
- [ ] Unit test: `src/__tests__/unit/lib/data.test.ts` gains a `Minutes` describe block (mirroring its `Events`/`Articles` pattern) covering the `file_url`-to-`fileUrl` mapping, the not-found case, and the `saveMinutes` upsert payload shape.
- [ ] Unit test: `MinutesCard.test.tsx` updated to a `fileUrl`-based fixture, asserting the "View Document" link's `href`/`target` when present and the fallback message when absent.
- [ ] E2E: `e2etest/tests/admin/minutes.spec.ts` and its `AdminMinutesPage` page object rewritten to mirror `e2etest/tests/admin/policies.spec.ts` — happy-path upload-and-create, submit disabled until uploaded, invalid file type (mocked) leaves submit disabled, edit without re-upload preserves `fileUrl`, edit with new upload replaces it, delete confirm/cancel unchanged.
- [ ] E2E: `e2etest/tests/public/minutes.spec.ts` and its `MinutesPage`/`MinutesDetailPage` page objects rewritten to mirror `e2etest/tests/public/policies.spec.ts` — list cards show title/date, "View Document" link has `target="_blank"` where present, detail page shows the same link, invalid ID still 404s, the now-inapplicable "content preview strips markdown" test removed.

## Comments
