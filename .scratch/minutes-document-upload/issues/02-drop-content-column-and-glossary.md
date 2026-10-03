# 02: Drop the unused `content` column and update the domain glossary

**What to build:** Once Minutes is fully document-based (Ticket 01 shipped), remove the now-dead `content` column from the `minutes` table, and correct the project's domain glossary so it stops describing Minutes as plain text.

**Blocked by:** 01 (Admin uploads a document for meeting minutes; visitors view it) — the app must stop reading/writing `content` before the column can safely be dropped.

**Status:** ready-for-agent

- [ ] New migration drops the `content` column from `minutes` (e.g. `ALTER TABLE minutes DROP COLUMN IF EXISTS content;`). No `NOT NULL` constraint is added to `file_url` — enforcement stays at the application/form layer only.
- [ ] Confirm no remaining code path reads or writes `content` on a Minutes record (search the codebase after Ticket 01 lands).
- [ ] `CONTEXT.md`'s **Minutes** glossary entry is reworded to describe it as backed by an uploaded document rather than "stored as plain text."
- [ ] `CONTEXT.md`'s **Content** glossary entry's "reserved for the plain-string field on Announcement and Minutes" is narrowed to Announcement only.
- [ ] App boots and existing test suites (unit + e2e from Ticket 01) still pass after the column is dropped.

## Comments
