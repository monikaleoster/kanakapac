Status: ready-for-agent

# Articles

## Problem Statement

The PAC has no way to publish longer-form written content — news updates, recaps, explainers — on the website. Announcements are built for short, time-sensitive notices (a priority flag, an optional expiry) and Minutes are tied to a specific meeting date; neither fits a piece of writing an admin wants to draft, refine over time, and then make public on its own schedule. Today the only option is to shoehorn long-form writing into an Announcement, which has no draft stage and no room for a cover image or formatted body text.

## Solution

Add a new Article content type with its own Draft/Published lifecycle. An admin authors an Article with a rich-text Body (via a Tiptap editor), an Excerpt for listing teasers, a free-text Author, and an optional cover image, saves it as a Draft as many times as needed, and then explicitly publishes it. Published Articles appear on a new public `/articles` listing page and get their own detail page. Publishing offers to notify the existing Subscriber list by email, the same way publishing an Announcement does today.

## User Stories

1. As an admin, I want to write an Article with a title, author, excerpt, and rich-text body, so that I can publish longer-form content than Announcements allow.
2. As an admin, I want to save an Article as a Draft, so that I can write it over multiple sessions before it's public.
3. As an admin, I want to see which of my Articles are Drafts and which are Published in the admin list, so that I know what's still private.
4. As an admin, I want to edit a Draft Article and save it again without publishing, so that in-progress work never becomes visible by accident.
5. As an admin, I want to edit a Published Article and have my changes go live immediately, so that I can fix typos or update content after publishing.
6. As an admin, I want to explicitly publish a Draft Article, so that publishing is a deliberate action distinct from saving.
7. As an admin, I want to be prompted to email Subscribers when I publish an Article, so that I can reuse the same notification flow Announcements already have.
8. As an admin, I want to decline the email prompt, so that a publish doesn't force a notification I don't want to send.
9. As an admin, I want to set a cover image for an Article, so that its listing card and detail page have a visual identity.
10. As an admin, I want to insert images inline within an Article's body while writing, so that the article can illustrate what it's describing.
11. As an admin, I want to delete an Article (draft or published), so that I can remove content that shouldn't exist anymore.
12. As an admin, I want the Article editor toolbar to support standard rich-text formatting (bold, italic, headings, lists, links), so that I can format writing without hand-authoring HTML.
13. As an admin, I want to reach the Articles admin section only when logged in, so that Article management is as protected as Events, Minutes, and Announcements are today.
14. As a site visitor, I want to see a listing of Published Articles, newest first, so that I can find recent PAC writing.
15. As a site visitor, I want each Article on the listing page to show its title, excerpt, cover image (if set), and author, so that I can decide whether to read further without opening it.
16. As a site visitor, I want to open an Article and read its full formatted body, so that I can get the complete content.
17. As a site visitor, I want Draft Articles to never appear anywhere on the public site, so that unfinished or unreviewed writing isn't exposed.
18. As a site visitor, I want an Article's rich-text body to render safely, so that I'm not exposed to injected scripts from stored content.
19. As a site visitor receiving a publish-notification email, I want the emailed content to render the same way the live Article does (safely, without raw markup leaking through), so that the email is trustworthy and readable.
20. As a developer, I want Article's data-access functions to follow the same shape as Events/Announcements/Minutes in `data.ts`, so that the codebase stays consistent and predictable.
21. As a developer, I want the existing `/api/upload` route's bucket-hardcoding and missing auth check fixed as part of this work, so that Article image uploads (and the route's other existing callers) are correctly scoped and protected.

## Implementation Decisions

**Domain model** (see `CONTEXT.md` for definitions): a new `Article` entity with fields `id`, `title`, `author` (free text), `excerpt` (plain text), `body` (sanitized HTML, distinct from the plain-string `content` field on Announcement/Minutes), `coverImageUrl` (optional), `status` (`draft` | `published`), `publishedAt` (set the moment status transitions to `published`; absent/null while in draft — a different meaning than `Announcement.publishedAt`, which is set at creation, per the earlier domain-modeling decision to reuse the field name across entities with entity-specific meaning), and `createdAt`.

**Storage**: a new `articles` table in Supabase, added via a new timestamped migration under `supabase/migrations/` and mirrored in `supabase/schema.sql`, following the existing table shape used by `announcements` (UUID primary key, snake_case columns, `TEXT`/`TIMESTAMPTZ` types). No `articles.json` file — the project's real data layer is Supabase, not the legacy `/data/*.json` files CLAUDE.md describes.

**Data access (`src/lib/data.ts`)**: add `getArticles`, `getPublishedArticles` (status = published, ordered by `published_at` descending), `getArticleById`, `saveArticle` (single upsert function handling both create and update, matching the existing `saveEvent`/`saveAnnouncement` pattern), and `deleteArticle`. `saveArticle` is responsible for stamping `publishedAt` at the moment `status` changes to `published` (not on every save of an already-published Article) — this transition logic belongs in the data layer, not the API route, so it's covered by the same seam as the rest of the CRUD behavior.

**API routes**: `src/app/api/articles/route.ts` (GET public / POST+PUT+DELETE behind `isAuthenticated()`), matching the Announcements route's shape exactly, including generating the `id` via `uuidv4()` server-side when absent.

**Body sanitization (ADR 0001)**: introduce one shared pure sanitize function (e.g. in `src/lib/`) wrapping a sanitization library (DOMPurify or an equivalent that runs server-side, since Next.js renders on the server). Every render path that injects Article Body HTML — the public detail page and the publish-notification email — calls this same function rather than trusting the stored string directly. This is a new dependency; none of the current `content` fields need it because they're rendered as plain text.

**Editor**: Tiptap, added as a new dependency, used only in the admin create/edit form (`"use client"`); its HTML output becomes the `body` field on save.

**Images**: cover image and inline body images both go through a generalized `/api/upload` route. Fix two existing issues on that route as part of this work: (1) the destination Supabase Storage bucket is currently hardcoded to `"minutes"` regardless of the `context` query param — make it context-aware (e.g. an `images` bucket for `context=image`, keeping the current bucket for `context=document`); (2) the route currently has no `isAuthenticated()` check at all — add one, matching every other mutating route. This fix also corrects the existing PAC-logo upload in `admin/settings`, which currently lands in the `"minutes"` bucket under the same bug.

**Public pages**: `src/app/articles/page.tsx` (listing, `getPublishedArticles`, `force-dynamic` like the Announcements page) and `src/app/articles/[id]/page.tsx` (detail, `getArticleById`, 404s or redirects if the Article is a Draft or doesn't exist). URLs use the raw `id` (UUID), matching every other detail route in the app — no slugs.

**Admin UI**: `src/app/admin/articles/page.tsx`, a single client component following the Announcements admin page's shape (inline create/edit form, `confirm()`-based delete, list view showing status). Publishing (the Draft→Published transition specifically, not every save) triggers the existing "email subscribers?" `confirm()` prompt and, on acceptance, POSTs to `/api/send-email` with a new `type: "article"`. That new type needs a branch in `send-email/route.ts`'s HTML-building logic — reuse `buildAnnouncementEmailHtml`-style templating, but run the Article's `body` through the shared sanitize function before interpolating it into the email HTML (the existing announcement path interpolates `content` directly, which is safe today only because that field is plain text; Article's `body` is HTML and must not skip sanitization here).

**Auth/routing**: add `/admin/articles/:path*` to the `matcher` array in `src/middleware.ts`, alongside the existing protected admin routes.

**Categorization**: none. No tags/category field, no filtering UI.

**Scheduling**: none. Publishing is always an immediate, manual admin action — no future-dated auto-publish.

**Comments**: none. Articles are read-only on the public site, consistent with every other content type.

**SEO metadata**: out of scope — no custom `generateMetadata` for Article detail pages.

## Testing Decisions

Good tests here assert observable behavior (what a caller gets back, what renders), not internal implementation. Prior art: `src/__tests__/unit/lib/data.test.ts` mocks the Supabase client and asserts on the mapped return values and the exact payload passed to `upsert`/`delete`; `src/__tests__/unit/components/AnnouncementCard.test.tsx` renders the component with a fixture prop and asserts on what's in the DOM.

- **`data.ts` Article functions**: extend `data.test.ts` with an `Articles` describe block mirroring the existing `Events`/`Announcements` blocks — mocked Supabase responses, asserting mapped-array shape on read, `[]`/`undefined` on error, and the exact payload shape passed to `upsert` on save. Specifically cover: `getPublishedArticles` only returns `status: 'published'` rows ordered by `publishedAt` descending; `saveArticle` sets `publishedAt` when a Draft transitions to Published, and leaves an already-published Article's `publishedAt` untouched on a subsequent save.
- **`ArticleCard` component**: mirror `AnnouncementCard.test.tsx` — render with a fixture Article, assert title/excerpt/author/cover-image render; assert the excerpt (not the raw body HTML) is what's shown.
- **Sanitize helper**: direct unit tests against the pure function — a known-safe HTML fixture passes through with formatting intact, a fixture containing a `<script>`/`onerror` payload comes out stripped. This is the one piece of new logic dense enough, and security-sensitive enough, to deserve dedicated isolated tests beyond what the CRUD and component tests already cover.
- Out of scope for new tests: the admin Articles page and the `/api/articles`, `/api/upload`, `/api/send-email` routes — consistent with the fact that none of their Announcements/Events equivalents are tested today either.

## Out of Scope

- Categories or tags on Articles.
- Scheduled/future-dated publishing.
- Public comments or reactions on Articles.
- Per-article SEO metadata (`generateMetadata`).
- Slug-based URLs (uses UUID, matching every other detail route).
- Multiple/named admin authors tied to login identity (Author stays free text; auth remains the single shared `ADMIN_PASSWORD`/NextAuth session).
- Tests for the admin Articles page or any of the new/touched API routes, matching current repo convention.
- A general CLAUDE.md correction (Supabase vs. the documented `/data/*.json` file storage) — noted as a pre-existing doc/reality mismatch, not part of this feature.

## Further Notes

- This feature's design decisions (Article vs. Announcement/Minutes boundary, Draft/Published lifecycle, Body vs. content naming, the `publishedAt` semantic split) are recorded in `CONTEXT.md`. The Body-storage trade-off (sanitized HTML string vs. structured JSON) is recorded in `docs/adr/0001-article-body-as-sanitized-html.md` — read it before touching how Body is rendered or sanitized.
- The `/api/upload` fix is a real behavior change for an existing caller (`admin/settings` logo upload), not just new code for Articles. Call this out in the PR description so it isn't mistaken for scope creep — it's a bug fix this feature happens to force.
- No `docs/adr` entry is needed for the `/api/upload` bucket/auth fix itself: it's a straightforward bug fix (the hardcoded bucket and missing auth check were clearly unintentional), not a deliberate trade-off between real alternatives.
