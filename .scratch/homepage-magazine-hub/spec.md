Status: ready-for-agent

# Homepage Redesign: Magazine Hub

## Problem Statement

Today's homepage stacks seven sections top to bottom (hero, an overlapping urgent-announcement banner, three Quick Info cards, Upcoming Events, a separate Recent Announcements panel, a thin Latest News list, and a Subscribe box), and urgent notices are shown twice — once in the overlapping banner and again if they'd otherwise appear in Recent Announcements. Parents visiting the homepage have to scroll past a lot of static, low-value chrome (the Quick Info cards mostly restate what's in the header/nav) before reaching Announcements or Articles, and Articles — a growing content type the PAC increasingly relies on to communicate ("a lot of information will be there") — are relegated to a plain text list at the very bottom, with no visual weight at all.

## Solution

Rebuild the homepage around a "Magazine Hub" structure: a minimized hero (the meeting time moves into the hero subtitle, replacing the Quick Info cards entirely), a single bold Announcements rail that shows all active announcements together (urgent ones visually distinguished, no separate overlapping banner), a magazine-style Articles section (one featured story plus a grid of smaller article tiles) that gives Articles real visual prominence, a compact three-across Events strip, and the existing Subscribe form at the bottom. This was one of three structural directions prototyped and compared visually (Feed-first split, Magazine Hub, Unified Updates Feed); Magazine Hub is the one being built.

## User Stories

1. As a parent landing on the homepage, I want a short hero that tells me the PAC name and next meeting time at a glance, so that I don't have to scroll past a large banner to get to real content.
2. As a parent, I want to see all currently active announcements together in one place, so that I don't have to piece together urgency from two separate sections.
3. As a parent, I want urgent announcements to be visually distinct from normal ones (without being shown twice), so that I can tell at a glance what needs my immediate attention.
4. As a parent, I want the announcements area to disappear entirely when there's nothing active to announce, so that the homepage doesn't show an empty or half-filled panel.
5. As a parent, I want a "View all" link from the announcements rail to the full Announcements page, so that I can see older or lower-priority notices if I want to.
6. As a parent, I want the most recent Article to be shown as a large, visually prominent "featured" story, so that the PAC's latest write-up doesn't get lost among smaller items.
7. As a parent, I want to see several more recent Articles in a compact grid below the featured one, so that I can scan a good amount of PAC news without endless scrolling.
8. As a parent, I want each article tile to show a thumbnail, title, and date, so that I can decide what's worth clicking into without reading a full excerpt for every item.
9. As a parent, I want a "View all" link from the Articles section to the full Articles page, so that I can browse everything, not just the homepage's selection.
10. As a parent, when no Articles have been published yet, I want to see a clear "nothing here yet" message instead of a broken-looking empty grid, so that the page still feels intentional.
11. As a parent, I want to see the next few upcoming PAC events in a compact row, so that I can quickly check dates without the events dominating the page.
12. As a parent, I want to still be able to RSVP to an event directly from the homepage's event strip, so that I don't have to click through to the Events page just to say I'm going.
13. As a parent, when there are no upcoming events, I want the strip to say so rather than disappearing without explanation (matching today's "No upcoming events at this time" behavior).
14. As a parent, I want a way to subscribe to email updates near the bottom of the homepage, so that I can stay informed without checking back manually.
15. As a parent browsing on my phone, I want every section (hero, announcements, articles, events, subscribe) to reflow sensibly on a small screen, so that the "decluttered" homepage doesn't become cluttered again on mobile.
16. As a parent, I want the homepage to keep loading fresh content on every visit (no stale caching), so that a newly published urgent announcement shows up immediately — same as today's behavior.
17. As a PAC admin, I want the homepage redesign to require no changes to how I create or edit Events, Announcements, or Articles, so that my existing admin workflow is unaffected.
18. As a PAC admin, I want Article excerpts (not full rich-text Body) to be what's rendered in homepage cards, so that no new HTML-sanitization surface is introduced by this change (per ADR-0001).
19. As a developer, I want the homepage's data-fetching (`getUpcomingEvents`, `getActiveAnnouncements`, `getPublishedArticles`, `getSchoolSettings`) to remain unchanged, so that this is a rendering/composition change only, not a data-layer change.
20. As a developer, I want the new Articles grid tile to be a small, separately testable component, so that the featured-article path (`FeaturedArticleCard`) and the full-listing path (`ArticleListItem` on `/articles`) aren't disturbed by this homepage-only need.

## Implementation Decisions

- **Scope of change**: `src/app/page.tsx` only, plus one new presentational component. `src/lib/data.ts` and its four homepage queries (`getUpcomingEvents`, `getActiveAnnouncements`, `getPublishedArticles`, `getSchoolSettings`) are unchanged. No changes to `/articles`, `/announcements`, `/events` standalone pages, admin routes, `Header`, or `Footer`.
- **Section order** (top to bottom): Hero → Announcements rail → Articles (featured + grid) → Events strip → Subscribe.
- **Hero**: shrinks to a single compact strip. Copy becomes PAC name + `settings.meetingTime` (already available on `SchoolSettings`) as the subtitle, replacing the "Next Meeting" Quick Info card's purpose. The "View Events" / "About PAC" CTAs are retained. The three Quick Info cards (Next Meeting / Get Involved / Stay Connected) are removed entirely; their "Get Involved" and "Stay Connected" messaging is dropped, not relocated (see Out of Scope).
- **Announcements rail**: replaces both the current overlapping urgent banner (`-mt-6 relative z-10` panel) and the separate "Recent Announcements" section. Renders `getActiveAnnouncements()`, sorted urgent-first then by `publishedAt` descending, capped at 4, using the existing `AnnouncementCard` component unmodified, laid out in a responsive grid (1 column mobile, up to 3 columns desktop) inside a distinct section background so it reads as a rail rather than blending into the page. When `getActiveAnnouncements()` returns an empty array, the entire rail section is omitted (no heading, no empty-state box) — an empty announcements panel adds clutter the redesign is meant to remove. A "View all →" link points to `/announcements`.
- **Articles section**: renders `getPublishedArticles()` capped at 5. The first (most recent) article renders via the existing `FeaturedArticleCard` component unmodified. The remaining up to 4 render via a new `ArticleGridCard` component in a responsive grid (2 columns mobile, 4 columns desktop). Section heading stays "Latest News" (unchanged from today) with a "View all →" link to `/articles`, matching the existing pattern. When `getPublishedArticles()` returns empty, show the section's existing empty-state copy, "No news posted yet." (matches current homepage copy; note this differs from `/articles`' own empty copy, "No articles published yet." — left as-is, not reconciled by this spec, see Further Notes).
- **New component — `ArticleGridCard`**: props `{ article: Article }`, matching the signature of `FeaturedArticleCard`/`ArticleListItem`. Renders: cover image (via the existing `ArticleCoverImage` component, so the placeholder-fallback behavior is inherited, not reimplemented), title, `publishedAt` date (via `formatDateTime`), links to `/articles/${article.id}`. Deliberately does not render `author` or `excerpt` — the tile is a scan-and-click target, not a preview; `excerpt` still backs the featured card and `/articles` listing. No new sanitization path: only `excerpt`-free, HTML-free fields are rendered, consistent with ADR-0001's boundary.
- **Events strip**: renders `getUpcomingEvents()` capped at 3 (unchanged from today), using the existing `EventCard` component unmodified — RSVP button and modal stay functional. Layout changes from a stacked list to a responsive grid (1 column mobile, 3 columns desktop) so it reads as a compact strip. Empty state unchanged: "No upcoming events at this time. Check back soon!"
- **Subscribe**: existing `SubscribeForm` component, unmodified, rendered at the bottom of the homepage content (not moved into the global `Footer`, so it stays homepage-scoped rather than appearing site-wide).
- **Responsive behavior**: all grids collapse to fewer columns at mobile widths using standard Tailwind breakpoints (`sm`/`md`), consistent with the rest of the codebase's existing responsive conventions (see current `page.tsx`'s `grid-cols-1 md:grid-cols-3` usage).
- **Caching**: `export const dynamic = "force-dynamic"` stays on the homepage, preserving today's no-stale-cache behavior.

## Testing Decisions

Tests should assert observable behavior — what's rendered, what links point where, what shows up under empty/urgent/normal data — not implementation details like specific Tailwind classes or DOM nesting, matching this repo's existing component-test style (e.g. `FeaturedArticleCard.test.tsx`).

- **New unit test — `ArticleGridCard.test.tsx`** (mirrors `FeaturedArticleCard.test.tsx`'s structure): renders title and formatted date; does not render `author` or `excerpt` text; renders the cover image with the article's `coverImageUrl`, or the placeholder image (`/images/article-cover-placeholder.jpg`) when unset; links to `/articles/${article.id}`.
- **`src/app/page.tsx` / homepage**: covered at the e2e layer (`e2etest/tests/public/homepage.spec.ts` via the `HomePage` page object), not unit tests, matching current convention for this file.
  - Existing assertions that must be updated for the new structure: the `announcementsSection` locator (currently matches the heading "Recent Announcements") needs a new heading name once the rail replaces it; `urgentBanner`'s selector (`[class*="bg-red"], [class*="urgent"]`) should still match since `AnnouncementCard` keeps its `bg-red-50` urgent styling, but should be re-verified against the new rail layout rather than the old overlapping-panel markup.
  - New/updated e2e cases: announcements rail shows urgent items ahead of normal ones; rail section is entirely absent when there are no active announcements; featured article renders from the most recent published Article; article grid shows up to 4 further articles with a working "View all" link; "No news posted yet." shown when there are zero published Articles; event strip still supports the existing RSVP flow (reuse of `EventCard` means the existing RSVP e2e coverage in `e2etest/tests/public/rsvp.spec.ts` should not need changes); homepage still serves `no-cache` headers (existing "fresh, no stale cache" test stays valid as-is).
- **No changes needed** to `src/__tests__/unit/lib/data.test.ts` (data layer untouched) or to `AnnouncementCard.test.tsx` / `EventCard.test.tsx` / `SubscribeForm.test.tsx` / `FeaturedArticleCard.test.tsx` (components reused unmodified).

## Out of Scope

- Design A ("Feed-first split") and Design C ("Unified Updates Feed") — explored for comparison, not being built.
- Any admin-side UI or workflow changes (creating/editing Events, Announcements, Articles).
- Changes to `/articles`, `/announcements`, `/events` standalone pages, `Header`, or `Footer`.
- Reconciling the "No news posted yet." (homepage) vs. "No articles published yet." (`/articles`) empty-copy inconsistency — both are kept as they are today.
- Relocating the "Get Involved" / "Stay Connected" messaging that lived in the removed Quick Info cards. If the PAC wants that content preserved somewhere (e.g. in the About page or footer), that's a separate follow-up.
- Any change to `Article`, `Announcement`, `Event`, or `SchoolSettings` schemas — no new fields are needed.
- Any change to the Subscribe API/behavior beyond where the existing form is rendered.

## Further Notes

- This spec was reached by building an interactive visual comparison (three structural concepts, mobile/desktop toggle, an "Articles: Some/None" content toggle to preview the empty state) before the direction was picked — see the "Magazine hub" concept in that comparison for the exact visual reference the numbers/copy above were drawn from.
- The announcements-rail cap (4) and articles cap (5 = 1 featured + 4 grid) are explicit numeric decisions made for this spec; they aren't derived from any existing constant in the codebase, since the current homepage's caps (3 events, 3 non-urgent announcements, 3 articles) were set separately per section without a shared convention.
- `ArticleGridCard` intentionally reuses `ArticleCoverImage` for its image handling rather than reimplementing placeholder-fallback logic, keeping that behavior defined in exactly one place across `FeaturedArticleCard`, `ArticleListItem`, and this new component.
