# 05: Public Articles site

**What to build:** the public-facing listing and detail pages for Published Articles.

**Blocked by:** 01 (Article data & API foundation)

**Status:** ready-for-human

- [x] `/articles` lists all Published Articles, newest first, each showing title, excerpt, cover image (if set), and author via an `ArticleCard` component.
- [x] `/articles/[id]` renders a single Article's full title, author, cover image, and sanitized rich-text body.
- [x] A Draft Article's detail URL does not render its content publicly (404s or otherwise refuses).
- [x] `ArticleCard` has unit tests mirroring `AnnouncementCard.test.tsx`, asserting the excerpt (not raw body HTML) is what's shown.

## Comments

Implemented in commit 39555de, alongside ticket 04. `/code-review` found no gaps against this checklist — draft articles 404 via `getArticleById` + a `status !== "published"` guard, and `ArticleCard` renders `article.excerpt` rather than `article.body`. Status set to `ready-for-human` per this tracker's vocabulary (no "done" state) — a human should verify and move this along.
