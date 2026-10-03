Status: ready-for-agent

# Meeting Minutes: Document Upload & View

## Problem Statement

Today, a PAC admin posts meeting minutes by retyping them as Markdown into a textarea in the admin dashboard, and site visitors read a reformatted HTML version of that text. There's no way to post the actual meeting-record document (e.g. the secretary's signed PDF or Word file), and no way for a visitor to view or download the original. This capability existed once before but was removed in May 2026, before Supabase Storage was fully wired up anywhere on the site — that storage-backend uncertainty no longer applies, since Supabase Storage is now a proven pattern used by Policies and Article cover images.

## Solution

Admins post meeting minutes by uploading a document (PDF, DOC, DOCX, or TXT) through the same document-upload flow Policies already uses. The uploaded document becomes the record of that meeting; the free-text Markdown "Content" field is removed from Minutes entirely. Site visitors view a meeting's minutes by opening its document in a new tab via a "View Document" link, the same pattern Policies already uses, rather than reading a converted-to-HTML text block.

## User Stories

1. As a PAC admin, I want to upload a document (PDF, DOC, DOCX, or TXT) when creating a new minutes entry, so that I can post the actual meeting record instead of retyping it as Markdown.
2. As a PAC admin, I want the document upload required before I can submit a new minutes entry, so that every minutes record always has an actual document attached.
3. As a PAC admin, I want to still set a Title and Meeting Date for each minutes entry, so that visitors can find and sort meetings as before.
4. As a PAC admin, I want to see a clear confirmation (the uploaded filename) once my document has uploaded, so that I know the upload succeeded before I submit the form.
5. As a PAC admin, I want a clear, non-technical error message when I pick an unsupported file type, so that I know to pick a different file instead of the form silently failing.
6. As a PAC admin, I want to edit an existing minutes entry's Title or Date without being forced to re-upload its document, so that small corrections don't require finding the original file again.
7. As a PAC admin, I want to replace an existing minutes entry's document with a new upload when editing, so that I can correct a wrong file after the fact.
8. As a PAC admin, I want to delete a minutes entry with a confirmation step, so that I can remove an entry posted by mistake without doing it accidentally.
9. As a PAC admin, I want the Markdown "Content" textarea removed from the minutes form entirely, so that the posting flow isn't confusing about which field is the source of truth.
10. As a PAC admin, I want a "View Document" link next to each minutes entry in the admin list, so that I can verify the correct file was uploaded without having to open the edit form.
11. As a site visitor, I want to browse the Meeting Minutes archive and see each meeting's title and date, so that I can find the meeting I'm looking for.
12. As a site visitor, I want a "View Document" link on each minutes entry, so that I can open the original meeting-record document.
13. As a site visitor, I want the document to open in a new browser tab, so that I don't lose my place in the Minutes archive.
14. As a site visitor, I want a minutes entry that has no document attached yet to clearly indicate that (rather than show a broken or empty link), so that the page doesn't look broken while an admin is mid-transition on re-uploading it.
15. As a PAC admin, I want the two pre-existing minutes entries (January and February 2026, which only have typed content today) to remain visible with their title and date even before I've re-uploaded documents for them, so that the archive doesn't appear to lose history during the transition.
16. As a site owner, I want the Supabase "minutes" storage bucket's public visibility codified in a tracked migration rather than a manual dashboard click, so that uploaded documents are reliably viewable in production — mirroring the earlier fix for the "images" bucket, which broke silently for the same reason.
17. As a developer, I want the `content` column dropped from the `minutes` database table via a migration, so that the schema matches the new document-only model instead of carrying a dead column indefinitely.
18. As a developer, I want the `Minutes` TypeScript type, `lib/data.ts` functions, and the `/api/minutes` route all updated to use `fileUrl` instead of `content`, so that the whole stack is consistent.
19. As a developer, I want `CONTEXT.md`'s domain glossary updated so "Minutes" no longer says it's "stored as plain text" and "Content" is no longer described as shared with Minutes, so that the glossary doesn't mislead future contributors about this entity.
20. As a developer, I want Playwright e2e coverage of the new upload-based minutes flow (successful upload, invalid file type rejected, document view link opens in a new tab, edit-without-re-upload preserves the file), mirroring the existing Policies e2e tests, so that regressions are caught automatically.
21. As a developer, I want unit test coverage at the `/api/minutes` route layer and the `lib/data.ts` Minutes functions, mirroring the existing Events/Articles coverage, so that the data layer is protected by fast tests and not only slow e2e runs.

## Implementation Decisions

- **`src/lib/types.ts`**: `Minutes` interface drops `content?: string` and gains `fileUrl: string`.
- **`src/lib/data.ts`**: `getMinutes`, `getMinutesById`, and `saveMinutes` map the DB's `file_url` column to/from `fileUrl` instead of mapping `content`. `deleteMinutes` is unchanged.
- **`src/app/api/minutes/route.ts`**: `POST`/`PUT` pass `fileUrl` through to `saveMinutes` instead of `content`. `GET`/`DELETE` and their response shapes are otherwise unchanged (`GET` returns the array; `POST` returns 201 + the created record; `PUT` returns 200 + the updated record; `DELETE` returns `{ success: true }` and still 400s without an `id`).
- **`src/app/admin/minutes/page.tsx`**: the Markdown content textarea is replaced with a file input (`accept=".pdf,.doc,.docx,.txt"`) wired to `POST /api/upload?context=document`, mirroring `AdminPoliciesPage`'s `handleFileChange` exactly — on success, store the returned `fileUrl` in form state and show the uploaded filename; on failure, show a non-technical `uploadError` message. The submit button is `disabled`/`required` based on `!form.fileUrl`, matching Policies' `required={!form.fileUrl}` convention (so editing an entry that already has a `fileUrl` doesn't force a re-upload). Each row in the admin list gains a "View Document" link (`target="_blank"`) when a `fileUrl` is present.
- **`src/components/MinutesCard.tsx`**: the content excerpt paragraph is replaced with a "View Document" link (`target="_blank"`, same visual treatment as `PoliciesPage`'s download link) when `fileUrl` is present, and a plain "No document yet" (or equivalent) text when it isn't — this covers the two legacy rows until they're re-uploaded.
- **`src/app/minutes/[id]/page.tsx`**: the `renderMarkdown` helper and its `dangerouslySetInnerHTML` block are removed entirely; the page renders a "View Document" link to `minutes.fileUrl` when present, and the same "No document yet" fallback otherwise.
- **`src/app/minutes/page.tsx`**: the intro copy ("Click on any meeting to read the full minutes") is updated to reflect viewing a document rather than reading inline text.
- **New DB migration** (`supabase/migrations/`): drops the `content` column from `minutes` (`ALTER TABLE minutes DROP COLUMN IF EXISTS content;`). No `NOT NULL` constraint is added to `file_url` — enforcement stays at the application/form layer only, so the two pre-existing rows (which will have neither `content` nor `file_url` right after this ships) don't break the migration. They get a `file_url` once an admin edits and re-uploads for them manually.
- **New DB migration** (`supabase/migrations/`): makes the `minutes` Supabase Storage bucket public, following `20260922000000_set_images_bucket_public.sql`'s exact pattern (same `information_schema.tables` existence guard) but for `('minutes', 'minutes', true)`.
- **`supabase/config.toml`**: add a `[storage.buckets.minutes]` public entry alongside the existing `[storage.buckets.images]` one, with a comment pointing at the new migration, matching the existing comment convention for the images bucket.
- **`CONTEXT.md`**: the **Minutes** glossary entry is reworded to describe it as backed by an uploaded document rather than "stored as plain text." The **Content** glossary entry's "reserved for the plain-string field on Announcement and Minutes" is narrowed to Announcement only.
- **No changes** to `/api/upload/route.ts`, `src/lib/storage.ts`, or `src/lib/uploadImage.ts` — the document-upload context, its `minutes`-bucket default, and its pdf/doc/docx/txt validation already exist today and are reused as-is.
- **Client upload mechanics** are identical to Policies: `POST` a `FormData` to `/api/upload?context=document`, read `{ fileUrl }` from the JSON response, store it in local form state before the main form submit — no new upload code path is introduced.

## Testing Decisions

Tests target external, observable behavior — HTTP status codes and response shapes for API routes, rendered DOM/links for components, and real browser interactions (file chooser, visible text, link attributes) for e2e — not internal implementation details like call ordering beyond what's needed to assert the right table/bucket was touched.

- **Unit — API route** (new `src/__tests__/unit/api/minutes.test.ts`, following `upload.test.ts`'s and `contact.test.ts`'s `@jest-environment node` + `NextRequest` pattern, mocking `isAuthenticated` and `src/lib/data.ts`): `GET` returns the array from `getMinutes()` with 200; `POST`/`PUT`/`DELETE` return 401 when `isAuthenticated()` resolves false; `POST` passes `fileUrl` (not `content`) through to `saveMinutes`; `DELETE` 400s without an `id` query param.
- **Unit — data layer** (extend `src/__tests__/unit/lib/data.test.ts` with a `Minutes` describe block, following its existing `Events`/`Articles` pattern): `getMinutes` maps `file_url` to `fileUrl` and returns `[]` on a Supabase error; `getMinutesById` returns `undefined` when not found; `saveMinutes` calls `upsert` with a payload keyed by `file_url`, not `content`.
- **Unit — component** (update the existing `src/__tests__/unit/components/MinutesCard.test.tsx`): the mock `Minutes` fixture gets `fileUrl` instead of `content`; assert the "View Document" link renders with the right `href`/`target` when `fileUrl` is set, and assert the no-document fallback renders when it's absent.
- **E2E — admin** (rewrite `e2etest/tests/admin/minutes.spec.ts` and `e2etest/tests/pages/admin/AdminMinutesPage.ts`, directly mirroring `e2etest/tests/admin/policies.spec.ts`'s structure): happy-path create with a mocked `/api/upload` response and `waitForEvent('filechooser')`; submit button disabled until a file is uploaded; invalid file type (mocked 400 from `/api/upload`) leaves submit disabled; edit without re-uploading preserves the existing `fileUrl`; edit with a new upload replaces it; delete with confirm/cancel (structurally unchanged from today, since delete isn't file-related).
- **E2E — public** (rewrite `e2etest/tests/public/minutes.spec.ts` and the `MinutesPage`/`MinutesDetailPage` page objects, mirroring `e2etest/tests/public/policies.spec.ts`): list page shows title/date per card; "View Document" link (where present) has `target="_blank"`; detail page shows the same "View Document" link; invalid ID still 404s (unchanged); the now-inapplicable "content preview strips markdown" test is dropped.
- Prior art: `src/__tests__/unit/api/upload.test.ts` and `contact.test.ts` for the node-environment API-route pattern; `src/__tests__/unit/lib/data.test.ts`'s `Events`/`Articles` blocks for the data-layer pattern; `e2etest/tests/admin/policies.spec.ts` and `e2etest/tests/public/policies.spec.ts` for the full upload-and-view e2e pattern — these exist today for the near-identical Policies feature, and this spec reuses that pattern almost verbatim.
- Out of automated-test scope: the actual manual re-upload of documents for the Jan/Feb 2026 legacy entries is a manual follow-up action post-deploy, not something to seed or test; only the "no document yet" rendering fallback itself is covered, via the MinutesCard unit test.

## Out of Scope

- Backfilling or migrating the two pre-existing minutes entries' data — the admin will manually re-upload via the edit form after this ships.
- An embedded/inline PDF viewer — documents open in a new browser tab via a plain link, identical to Policies.
- Restricting upload to PDF only — doc/docx/txt remain accepted, identical to the existing `/api/upload` document context and to Policies.
- Any change to `/api/upload`, `src/lib/storage.ts`, or the Policies feature itself.
- A database-level `NOT NULL` constraint on `minutes.file_url`.
- Multiple documents per minutes entry — one `file_url` per entry, matching the existing single-column schema.
- File size limits or malware/content scanning on uploaded documents (no such checks exist for Policies either).
- Any change to how Announcements use the `Content` glossary term.

## Further Notes

- This feature previously existed and was removed in May 2026 (commits `a9d2942`, `02a8429`, `025d6f2`) before Supabase Storage was fully wired up site-wide. That storage-backend uncertainty no longer applies — Supabase Storage is now a proven, working pattern via Policies and Article cover images.
- The `minutes` bucket's public-visibility migration should land in the same deploy as the admin-facing upload UI, so the first real upload doesn't repeat the private-bucket class of bug already seen once with the `images` bucket (see `20260922000000_set_images_bucket_public.sql`).
- `data/minutes.json`, a static fixture file in the repo, is not read by the live data layer (which talks to Supabase directly) and only contains stale leftover data, including an old local `/uploads/minutes/...` `fileUrl` from before Supabase Storage existed. It's left untouched by this spec.
