# 06: The sanitize-on-render invariant is enforced rather than remembered

**What to build:** Article Body is stored as the HTML the editor submitted and
sanitized on the way out, not on the way in. `api/articles/route.ts` does not
sanitize, and neither does `saveArticle`, so the `articles.body` column holds
whatever was posted. Safety comes from each read path calling `sanitizeHtml`
first.

**Both read paths do it correctly today, and this is not a live
vulnerability.** The review searched all of `src/` for raw-HTML render sites and
found exactly one — `src/app/articles/[id]/page.tsx:93` — fed from
`splitArticleBody(sanitizeHtml(article.body))`. The email path at
`src/lib/resend.ts:165` sanitizes as well. Reported accurately: the invariant
holds, and nothing enforces it.

What makes it worth a ticket is that the invariant is held by two call sites and
a convention. `GET /api/articles` returns stored body text unsanitized to its
caller, `articleBody.ts` documents that its input "MUST come from sanitizeHtml"
in a comment rather than in a type, and any future surface that renders an
Article — a preview pane, an excerpt, a feed, an export — is one `sanitizeHtml`
call away from being a stored-XSS hole. The multi-school conversion adds read
paths and admins who are not the operator, which raises the chance of that
happening and the cost when it does.

**Decide which of the two models to commit to, then make it structural.**
Sanitizing on write means the column can be trusted and the current render-time
calls become redundant, but it is lossy and makes widening the allowlist later
impossible for existing rows. Sanitizing on read preserves the original and is
what the code does now; making it structural means a type that only
`sanitizeHtml` can produce, so an unsanitized string will not typecheck where
sanitized HTML is expected. The second fits the existing design and the comment
in `articleBody.ts:19-21` already reaches for it.

This is adjacent to issue #48 (stored XSS in minutes) but not the same finding,
and it is not closed by it.

**Blocked by:** None. Lower priority than tickets 01–03; it hardens something
currently correct rather than fixing something broken.

**Status:** needs-triage

- [ ] A decision is recorded on whether Article Body is sanitized on write, on
      read, or both
- [ ] The chosen model is enforced by types or by a single chokepoint, not by a
      comment
- [ ] `splitArticleBody` cannot be called with a string that has not been
      sanitized
- [ ] Whether `GET /api/articles` should return unsanitized body text to its
      caller is decided explicitly
- [ ] A test asserts a script-bearing body is neutralised on every surface that
      renders an Article
