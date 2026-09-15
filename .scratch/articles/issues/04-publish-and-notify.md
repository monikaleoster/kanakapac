# 04: Admin can publish an Article and notify subscribers

**What to build:** the explicit publish action that makes a Draft public, with the option to notify the existing Subscriber list — mirroring the Announcements publish-and-notify flow.

**Blocked by:** 03 (Admin can author Articles as Drafts)

**Status:** ready-for-human

- [x] Admin has an explicit "Publish" action on a Draft Article that transitions it to Published and stamps `publishedAt`.
- [x] Editing and saving an already-Published Article updates it live without re-triggering the publish transition or re-stamping `publishedAt`.
- [x] On publish, admin is prompted to email all Subscribers, matching the existing Announcements `confirm()`-prompt UX.
- [x] Declining the prompt publishes the Article without sending any email.
- [x] Accepting the prompt sends an email to every Subscriber via `/api/send-email` using a new `type: "article"`, with the Article's body passed through the shared sanitize function before being interpolated into the email HTML.

## Comments

Implemented in commit 39555de. `/code-review` (Standards + Spec sub-agents, diffed since ticket 03) found no missing requirements or scope creep, but flagged two follow-ups that this pass fixed:

- The in-form "Publish" button was `type="button"` with a manual `onClick`, bypassing the form's HTML5 `required`-field validation and silently persisting whatever was currently typed in the form as part of publishing. Fixed by making it a real `type="submit"` button (`name="intent" value="publish"`) so it goes through the same validated submit path as Save, with `handleSubmit` branching on the clicked submitter to decide whether to stamp `status: "published"` and fire the notify prompt.
- `buildArticleEmailHtml` interpolated `title`/`author` into the email HTML unescaped (inconsistent with `buildContactEmailHtml`'s equivalent fields). Fixed by running both through the existing `escapeHtml` helper, with a new test covering it.

Status set to `ready-for-human` per this tracker's vocabulary (no "done" state) — a human should verify and move this along.
