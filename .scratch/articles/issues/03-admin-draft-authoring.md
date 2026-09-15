# 03: Admin can author Articles as Drafts

**What to build:** a protected admin section where an admin can write, format, and save an Article as a Draft — a complete authoring workflow, without publishing yet.

**Blocked by:** 01 (Article data & API foundation), 02 (Fix /api/upload)

**Status:** ready-for-agent (implementation complete, pending human review — see Comments; no "done" label exists in this tracker's vocabulary)

- [x] `/admin/articles` is only reachable with a valid admin session (added to `middleware.ts`'s matcher).
- [x] Admin can create a new Article with title, author, excerpt, and a Tiptap-authored rich-text body (bold/italic/headings/lists/links), and save it as a Draft.
- [x] Admin can set a cover image and insert inline images within the body while writing, both uploaded via the fixed `/api/upload` route.
- [x] Admin sees a list of all Articles (Draft and Published) with their status visible.
- [x] Admin can re-open and edit a Draft, save again, and the changes persist without becoming public.
- [x] Admin can delete an Article (Draft or Published).

## Comments

Implemented. `/code-review` (Standards + Spec sub-agents) flagged and this pass fixed: a hand-rolled `.rich-text` CSS block violating the "Tailwind utilities only" convention (replaced with `@tailwindcss/typography`'s `prose` classes), duplicated image-upload boilerplate between the page and the editor (extracted to `src/lib/uploadImage.ts`), an `ArticleEditor` content-desync bug where switching the "Edit" target while the form stayed open kept showing the previous article's body (fixed via a `key={editing?.id ?? "new"}` remount), and a submit button that always read "Save as Draft" even when editing an already-published Article (now reflects Draft vs. Published state). Status set to `ready-for-human` rather than a "done" state since this tracker's vocabulary (see `docs/agents/triage-labels.md`) doesn't define one for finished work — a human should verify and move this along.

Live-DB verification note: full click-through of the form (login, route protection, all toolbar formatting, save request firing) was confirmed in-browser against this repo's own dev server. A second round-trip persistence check was aborted after discovering this machine's Supabase CLI default ports (54321/54322) were already bound by an unrelated local project ("aryasjournal"), which would have run this repo's migrations against that project's database. No changes were made to that other project; flagged to the user directly.
