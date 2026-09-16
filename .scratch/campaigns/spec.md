Status: ready-for-agent

# Fundraising Campaigns

## Problem Statement

The PAC has no way to publicize a fundraising drive and show its progress on the website. Money for PAC fundraisers moves through a mix of channels outside the site (a Munch A Lunch ticketed event, cash/cheque collected in person, etc.) that all count toward one shared goal — but there's nowhere for parents to see that goal, how close it is to being hit, or what it's for. Today the only options are an Announcement (no goal/progress concept, no lasting home once it scrolls off the list) or an Article (built for long-form writing, not for a number that needs to be updated repeatedly as money comes in). A specific upcoming fundraiser (a playground-fund-style drive) is what's making this gap concrete right now.

## Solution

Add a new Campaign content type: an admin-authored fundraising hub with a title, rich-text Body, goal amount, and a raised-so-far amount the admin updates by hand as money comes in through whichever channels are actually collecting it. A Campaign moves through Draft → Active → Completed, with Active being the public "still open" state and Completed an explicit, quiet wrap-up (no re-announcement). Multiple Campaigns can be Active at the same time. Published Campaigns get their own listing page (`/fundraising`, Active shown first, Completed listed below as an archive) and detail hub pages, each showing a visual progress bar. The site never processes any payment itself — Campaign is purely informational and tracking, consistent with the site's documented mission boundary of communication and transparency, not fundraising transactions. Launching a Campaign (Draft → Active) offers to notify the existing Subscriber list by email, the same way publishing an Announcement or Article does today; an Active Campaign also gets a homepage banner, similar to the existing urgent-announcements banner.

## User Stories

1. As an admin, I want to create a Campaign with a title, rich-text Body, goal amount, and optional cover image, so that I can describe what a fundraiser is for and how much it's trying to raise.
2. As an admin, I want to save a Campaign as a Draft, so that I can prepare it before it's visible to anyone.
3. As an admin, I want to set an optional deadline on a Campaign, so that I can communicate a target end date when one exists.
4. As an admin, I want to explicitly publish a Draft Campaign (Draft → Active), so that publishing is a deliberate action distinct from saving.
5. As an admin, I want to be prompted to email Subscribers when I publish a Campaign, so that I can reuse the same notification flow Announcements and Articles already have.
6. As an admin, I want to decline the email prompt on publish, so that publishing doesn't force a notification I don't want to send.
7. As an admin, I want to update a Campaign's raised-so-far amount at any time after it's Active, so that the public progress bar reflects reality as money comes in from whichever channel collected it.
8. As an admin, I want those raised-amount updates to go live immediately without re-triggering the publish flow or the notify prompt, so that routine updates stay lightweight.
9. As an admin, I want to explicitly mark an Active Campaign as Completed, so that a finished drive can stop looking like an open ask.
10. As an admin, I want marking a Campaign Completed to be silent (no email prompt), so that wrapping up a campaign doesn't force an unwanted broadcast.
11. As an admin, I want to edit a Completed Campaign's details (e.g. correct a final total), so that the historical record can stay accurate.
12. As an admin, I want to have more than one Campaign Active at the same time, so that overlapping fundraisers can each have their own hub.
13. As an admin, I want to see all Campaigns (Draft, Active, and Completed) with their status visible in the admin list, so that I know what's live, what's finished, and what's still private.
14. As an admin, I want to delete a Campaign in any status, so that I can remove one that shouldn't exist anymore.
15. As an admin, I want the Campaign Body editor to support standard rich-text formatting (bold, italic, headings, lists, links) and inline images, so that I can explain the fundraiser clearly without hand-authoring HTML.
16. As an admin, I want to set a cover image for a Campaign, so that its listing card and hub page have a visual identity.
17. As an admin, I want to reach the Fundraising admin section only when logged in, so that Campaign management is as protected as Events, Minutes, Announcements, and Articles are today.
18. As a site visitor, I want to see a listing of Campaigns at `/fundraising`, Active ones shown first and Completed ones listed below as a past-results archive, so that I can find the current fundraiser or see what's already been accomplished.
19. As a site visitor, I want each Campaign on the listing page to show its title, cover image (if set), and a progress bar (amount raised vs. goal), so that I can gauge progress without opening it.
20. As a site visitor, I want to open a Campaign and read its full title, Body, cover image, goal, raised amount, progress bar, and deadline (if set), so that I understand what it's for and how it's going.
21. As a site visitor, I want a Draft Campaign to never appear anywhere on the public site, so that unfinished or unannounced fundraisers aren't exposed.
22. As a site visitor, I want a Campaign's rich-text Body to render safely, so that I'm not exposed to injected scripts from stored content.
23. As a site visitor receiving a publish-notification email, I want the emailed content to render the same way the live Campaign does (safely, without raw markup leaking through), so that the email is trustworthy and readable.
24. As a site visitor on the homepage, I want to see a banner for any Active Campaign(s) with a progress bar and a link to the full hub, so that I don't have to already know to look for a fundraiser to find out about one.
25. As a developer, I want Campaign's data-access functions to follow the same shape as Events/Announcements/Articles in `data.ts`, so that the codebase stays consistent and predictable.
26. As a developer, I want the goal-vs-raised percentage calculation to be a single, directly-tested pure function, so that the listing card, the hub page, and the homepage banner can't drift into disagreeing with each other about how progress is computed.

## Implementation Decisions

**Domain model**: a new `Campaign` entity with fields `id`, `title`, `body` (sanitized HTML, rich text — the same concept as Article's Body, reusing that term rather than inventing a synonym), `coverImageUrl` (optional), `goalAmount` (numeric, dollars), `raisedAmount` (numeric, dollars, admin-updated by hand — there is no payment integration to source it from), `deadline` (optional date), `status` (`draft` | `active` | `completed`), `publishedAt` (set the moment status transitions from `draft` to `active` — reusing the existing `publishedAt` field name per the established cross-entity convention noted in `CONTEXT.md`, with Campaign's own entity-specific meaning: Draft → Active, not Draft → Published), `completedAt` (set the moment status transitions from `active` to `completed`; a new field, since no existing entity has a third lifecycle state to reuse a name from), and `createdAt`. There is no separate Excerpt field — CampaignCard is driven by title, cover image, and the progress bar, not a text teaser, so Article's Body/Excerpt split doesn't carry over.

**Storage**: a new `campaigns` table in Supabase, added via a new timestamped migration under `supabase/migrations/` and mirrored in `supabase/schema.sql`, following the existing table shape used by `articles` (UUID primary key, snake_case columns, `TEXT`/`NUMERIC`/`DATE`/`TIMESTAMPTZ` types as appropriate).

**Data access (`src/lib/data.ts`)**: add `getCampaigns` (all statuses, admin use only), `getActiveCampaigns` (status = `active`, ordered by `published_at` descending) and `getCompletedCampaigns` (status = `completed`, ordered by `completed_at` descending) — two separate functions for the two public listing sections, mirroring the existing `getUpcomingEvents`/`getPastEvents` split rather than one function with in-memory grouping. Add `getCampaignById`, `saveCampaign` (single upsert function handling create and update, matching `saveArticle`), and `deleteCampaign`. `saveCampaign` stamps `publishedAt` at the moment `status` changes to `active` (not on every subsequent save of an Active campaign) and stamps `completedAt` at the moment `status` changes to `completed` (not re-stamped afterward) — this transition logic belongs in the data layer, matching `saveArticle`'s existing, tested pattern exactly.

**API routes**: `src/app/api/campaigns/route.ts` — POST/PUT/DELETE behind `isAuthenticated()`. GET is also behind `isAuthenticated()` and returns all statuses via `getCampaigns()`; its only legitimate caller is the authenticated admin list. Public pages call `getActiveCampaigns()` / `getCompletedCampaigns()` / `getCampaignById()` directly as server components, never through this route — this sidesteps the Draft-leak class of bug found in the Articles code review, where an unauthenticated `GET /api/articles` returned Draft content because the route's shape was copied from Announcements (which has no Draft concept) without accounting for Campaign/Article's confidentiality boundary. `getCampaignById` on the public detail page refuses/404s when `status === "draft"`.

**Body sanitization (ADR 0001, extended to Campaign)**: Campaign's Body reuses the existing shared sanitize function introduced for Articles. Every render path that injects Campaign Body HTML — the public hub page and the publish-notification email — calls that same function, per the ADR 0001 precedent.

**Editor**: reuse the existing Tiptap-based `ArticleEditor` component (or a shared generalization of it) for Campaign Body authoring, in the admin create/edit form (`"use client"`); its HTML output becomes the `body` field on save, same as Article.

**Images**: cover image goes through the existing, already-fixed `/api/upload?context=image` route (context-aware bucket, authenticated) — no changes needed to that route for this feature.

**Public pages**: `src/app/fundraising/page.tsx` (listing — `getActiveCampaigns()` rendered first, `getCompletedCampaigns()` rendered below as an archive section, `force-dynamic` like the Announcements/Articles listing pages) and `src/app/fundraising/[id]/page.tsx` (hub detail — `getCampaignById`, refuses/404s if the Campaign is a Draft or doesn't exist). URLs use the raw `id` (UUID), matching every other detail route in the app.

**Progress calculation**: a single pure function, e.g. `calculateProgress(raised: number, goal: number): number`, returning a percentage clamped to `[0, 100]` and returning `0` when `goal <= 0` rather than dividing by zero. `CampaignCard`, the hub detail page, and the homepage banner all call this one function rather than each computing the percentage themselves, so the three surfaces can't drift out of agreement.

**Admin UI**: `src/app/admin/campaigns/page.tsx` (route matches the "Fundraising" nav label at the UX layer, but mirrors `admin/articles/page.tsx`'s shape internally — inline create/edit form, `confirm()`-based delete, list view showing status and progress). Two distinct status-changing actions, both separate from the plain Save action: "Publish" (Draft → Active, triggers the existing "email subscribers?" `confirm()` prompt on acceptance, matching Article's now-fixed submit-button pattern of being a real validated form submission rather than a bypassing `onClick`) and "Mark Completed" (Active → Completed, no notify prompt — silent per the grilling decision). Editing any field (including `raisedAmount`) on an Active or Completed Campaign and saving updates it live immediately without re-triggering either transition or the notify prompt.

**Notify on publish**: on Draft → Active, admin is prompted to email all Subscribers, POSTing to `/api/send-email` with a new `type: "campaign"` and a `body` field (not `content` — `content` is reserved by `CONTEXT.md` for the plain-string field on Announcement/Minutes; this is specified correctly from the start rather than fixed after the fact, per the naming bug found and fixed during Article's code review). `send-email/route.ts` gets a new branch calling a new `buildCampaignEmailHtml` in `resend.ts`, running the Campaign's `body` through the shared sanitize function before interpolating it into the email HTML, mirroring `buildArticleEmailHtml`.

**Homepage banner**: `src/app/page.tsx` gains a new banner/widget section, shown when at least one Campaign is Active, mirroring the existing "Urgent Announcements Banner" section's shape (a mapped list, one entry per Active campaign) — each entry shows the Campaign's title and progress bar and links to its hub page.

**Navigation**: add a "Fundraising" item to `Navigation.tsx` pointing at `/fundraising`.

**Auth/routing**: add `/admin/campaigns/:path*` to the `matcher` array in `src/middleware.ts`, alongside the existing protected admin routes.

**Categorization, scheduling, comments, SEO metadata**: none — matching the Article precedent (no tags/category field, no future-dated auto-activation, no public comments, no `generateMetadata`).

**Currency**: dollar amounts only (no multi-currency), stored as numeric values that may include cents, displayed with a `$` prefix and thousands separator.

## Testing Decisions

Good tests here assert observable behavior (what a caller gets back, what renders), not internal implementation. Prior art: `src/__tests__/unit/lib/data.test.ts`'s `Articles` describe block (mocked Supabase client, asserting mapped return values and the exact payload passed to `upsert`); `src/__tests__/unit/components/ArticleCard.test.tsx` (renders with a fixture prop, asserts on the DOM); `src/__tests__/unit/lib/sanitize.test.ts` (a pure function dense and security-sensitive enough to deserve direct, isolated tests).

- **`data.ts` Campaign functions**: extend `data.test.ts` with a `Campaigns` describe block mirroring the existing `Events`/`Articles` blocks — mocked Supabase responses, asserting mapped-array shape on read, `[]`/`undefined` on error, and the exact payload shape passed to `upsert` on save. Specifically cover: `getActiveCampaigns` only returns `status: 'active'` rows ordered by `publishedAt` descending; `getCompletedCampaigns` only returns `status: 'completed'` rows ordered by `completedAt` descending; `saveCampaign` sets `publishedAt` when a Draft transitions to Active and leaves it untouched on later saves; `saveCampaign` sets `completedAt` when an Active campaign transitions to Completed and leaves it untouched on later saves.
- **`calculateProgress` pure function**: direct unit tests, dense/important enough to deserve isolated coverage beyond the CRUD and component tests — `goal <= 0` returns `0` (no divide-by-zero), `raised > goal` clamps to `100`, a typical fractional case rounds sensibly, `raised === 0` returns `0`.
- **`CampaignCard` component**: mirrors `ArticleCard.test.tsx` — render with a fixture Campaign, assert title/cover-image/progress-bar render, assert the progress bar reflects `calculateProgress`'s output for the fixture's raised/goal values.
- Out of scope for new tests: the admin Campaigns page, the `/api/campaigns`, `/api/send-email` route additions, and the homepage banner — consistent with the fact that none of their Announcements/Events/Articles equivalents are tested today either.

## Out of Scope

- A structural link from a Campaign to a specific Event (e.g. tying a fundraiser to the ticketed dinner that supports it) — stays as prose in the Body for this version.
- Any on-site payment processing or collection — money always moves through external channels (Munch A Lunch, cash/cheque, etc.); the site is purely informational and tracking, consistent with the site's documented mission boundary.
- Email notification on the Active → Completed transition (silent, by design).
- Auto-completion based on a deadline passing or the goal being reached — status changes are always an explicit admin action.
- Multi-currency support.
- A separate Excerpt/short-teaser field distinct from Body (cards are driven by title, image, and the progress bar, not a text preview).
- Tests for the admin Campaigns page or any of the new/touched API routes, matching current repo convention.

## Further Notes

- This feature originated from a specific, real upcoming fundraiser (a playground-fund-style drive with mixed collection channels converging on one shared goal), surfaced via `/grill-me`. Because `/grill-me` is stateless, this session left no `CONTEXT.md`/ADR trail the way the Article feature's `/grill-with-docs` session did — if a domain decision needs recording during implementation, capture it via `/domain-modeling` at that point.
- `CONTEXT.md`'s current entry for **Draft / Published (Article status)** states "This lifecycle belongs to Article alone." That becomes inaccurate once this ships: Campaign introduces its own, three-state (Draft/Active/Completed) lifecycle. Flagging this as a follow-up for `/domain-modeling` — updating `CONTEXT.md` is out of this spec's own scope.
- Design decisions here intentionally mirror the Article feature's shape wherever nothing forced a divergence (CRUD/data-layer pattern, sanitize-on-every-render-path per ADR 0001, shared Subscriber list, Tiptap reuse, cover-image-via-`/api/upload` reuse) — see `.scratch/articles/spec.md` for the sibling precedent, including the code-review findings this spec deliberately designs around from the start (the unauthenticated-Draft-leak shape, and the `content`-vs-domain-term wire-naming bug).
