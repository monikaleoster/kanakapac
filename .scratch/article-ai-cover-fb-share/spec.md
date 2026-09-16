Status: ready-for-agent

# AI Cover Image Generation & Facebook Share for Articles

## Problem Statement

Admins publishing an Article today must either source their own cover image or publish without one — there's no way to quickly get a decent visual for a piece of writing. Separately, when a published Article's link is shared on Facebook, the site has no Open Graph metadata at all, so the shared link renders as a bare title-less URL instead of a rich preview card. Both gaps make Articles less visually appealing to publish and less effective to share, which works against the goal of getting PAC writing in front of more parents.

## Solution

Add an AI-assisted "Generate Cover Image" action to the admin Article editor: the admin can generate a cover image from a title-derived, editable prompt, regenerate a bounded number of times, or upload their own image instead — cover image stays optional, falling back to a default placeholder when unset. Separately, add Open Graph metadata and a one-click "Share to Facebook" button to the public Article detail page, so a shared Article link (or its placeholder, if no cover was set) renders as a large-image preview card on Facebook, using the Article's title and Excerpt as the preview text.

## User Stories

1. As a PAC admin, I want to click "Generate Cover Image" while editing an Article, so that I don't have to source or design an image myself.
2. As a PAC admin, I want the image prompt pre-filled from the Article's title, so that I don't have to write a prompt from scratch for the common case.
3. As a PAC admin, I want to edit the pre-filled prompt before generating, so that I can correct or refine it when the title alone would produce an off-topic image.
4. As a PAC admin, I want to see a loading state while the image is generating, so that I know the action is in progress and don't submit twice.
5. As a PAC admin, I want to regenerate the cover image if I don't like the first result, so that I can iterate toward an image I'm happy with.
6. As a PAC admin, I want regeneration to be capped (e.g. 5 attempts per editing session), so that a single Article can't run up unbounded AI API costs.
7. As a PAC admin, I want to see how many regeneration attempts I have left, so that I know when I'm about to hit the cap, and I want the "Generate" action disabled once I hit it.
8. As a PAC admin, I want a clear, non-technical error message if image generation fails, so that I know to retry or fall back to a manual upload instead of seeing a raw provider error.
9. As a PAC admin, I want to still be able to upload my own cover image instead of generating one, so that I can use a real photo when that's more appropriate (e.g. an event recap).
10. As a PAC admin, I want to be able to replace an AI-generated cover with a manual upload (or vice versa) before saving, so that I'm not locked into my first choice.
11. As a PAC admin, I want to publish an Article without setting any cover image at all, so that an optional feature never blocks publishing.
12. As a site visitor, I want an Article that has no cover image set to still show a sensible default image — on its listing card, its detail page, and in link previews — so that it never looks broken or bare.
13. As a site visitor, I want the same cover image to appear on the Article's listing card, at the top of its detail page, and as the preview image when the link is shared, so that the Article looks consistent everywhere.
14. As a PAC admin, I want the generated cover image to end up sized for a large Facebook preview (1200×630), so that shared Articles look good without me doing any manual cropping.
15. As a site visitor reading a published Article, I want a "Share to Facebook" button, so that I can easily share it with other PAC parents.
16. As a site visitor, I want clicking "Share to Facebook" to open Facebook's share dialog pre-populated with the Article's URL, so that I don't have to copy/paste the link myself.
17. As a Facebook user who receives a shared Article link, I want to see a large image, the Article's title, and a short description in the preview card, so that I know what the article is about before clicking through.
18. As a PAC admin, I want the Facebook preview text to be generated from the Article's existing title and Excerpt, so that I don't have to author separate preview copy.
19. As a site visitor, I want a Draft Article's link to never render a public preview or be reachable at all (matching today's not-found behavior), so that unpublished content is never leaked via a shared link or crawler.
20. As a site owner, I want Facebook sharing to work without registering a Facebook App ID or embedding the Facebook SDK, so that there's no extra third-party account or maintenance overhead.
21. As a PAC admin, I want image generation to use a clearly, intentionally provisioned API credential, so that it's obvious which key is powering the feature and it isn't accidentally tied to an unrelated, unused credential already sitting in the environment.

## Implementation Decisions

- **New API route** `POST /api/articles/generate-cover-image`, auth-gated with the same `isAuthenticated()` check used by `/api/articles` and `/api/upload`. Request body: `{ prompt: string }`. Response on success: `{ fileUrl: string }` (same shape as `/api/upload`'s response), `400` if `prompt` is missing/empty, `401` if unauthenticated, `500` with a generic, non-leaking error message if generation or upload fails.
- **Provider**: OpenAI's image generation API, via a new `OPENAI_API_KEY` environment variable (added to `.env.example`). The pre-existing, unreferenced `OPENROUTER_API_KEY` in `.env.local` is left untouched and is not used by this feature.
- **Image sizing**: OpenAI's image API only returns a fixed set of preset dimensions, not arbitrary sizes — the route generates at the provider's closest supported landscape preset, then center-crops server-side (a lightweight image-processing step, e.g. via `sharp`, a new dependency) to exactly 1200×630 before upload, so the stored asset's dimensions don't drift if the provider's presets change.
- **Storage**: Supabase Storage upload logic currently inlined in `/api/upload/route.ts` is extracted into a shared helper (e.g. `src/lib/storage.ts`, `uploadBuffer(bucket, filename, buffer, contentType) -> publicUrl`), reused by both `/api/upload/route.ts` (refactored to call it) and the new generate-cover-image route. Generated images upload to the same `images` bucket manual cover uploads already use. No new database column is needed — `articles.cover_image_url` already exists and is set the same way regardless of whether the image was generated or manually uploaded.
- **Regeneration cap**: tracked client-side as per-editing-session component state in the admin Article editor (not persisted to the database or across page reloads) — a lightweight cost guardrail, not a security control, consistent with the single shared admin login this site already has.
- **Default placeholder**: a static placeholder image asset (1200×630) checked into the repo (e.g. under `public/`). Anywhere `article.coverImageUrl` is currently rendered or read — the admin form, the listing card, the detail-page hero, and the new Open Graph image — falls back to this placeholder's URL when `coverImageUrl` is unset.
- **Open Graph metadata**: `src/app/articles/[id]/page.tsx` gains a `generateMetadata` export building `openGraph: { title, description, images, type: "article" }` from the Article's `title`, `excerpt`, and `coverImageUrl` (or the placeholder). Image and canonical URLs are built as absolute URLs using the existing `NEXT_PUBLIC_BASE_URL` convention (already used the same way in `src/lib/resend.ts`). For an Article that is missing, or not `published`, metadata generation follows the same not-found behavior as the page body (Story 19) — no preview is generated for Draft or nonexistent content.
- **Facebook share button**: a new component (e.g. `src/components/FacebookShareButton.tsx`) rendered only on the Article detail page (not on listing cards), linking to `https://www.facebook.com/sharer/sharer.php?u=<url-encoded absolute Article URL>`. No Facebook App ID, SDK script, or domain verification is introduced.
- **Scope boundary vs. today's Articles feature**: this work only touches cover-image sourcing and the detail page's metadata/share affordance — Article's Draft/Published lifecycle, Body storage (ADR-0001), and Excerpt/Author fields are unchanged.

## Testing Decisions

- Tests target external, observable behavior — HTTP status codes and response shapes for the new API route, and rendered meta tags / link targets for the page — not internal implementation details like the exact shape of the OpenAI SDK call.
- **Unit test** (Jest, `node` environment) for `POST /api/articles/generate-cover-image`, following the pattern in `src/__tests__/unit/api/contact.test.ts`: mock the OpenAI client and the new `src/lib/storage.ts` upload helper. Assert: `401` when unauthenticated, `400` on missing/empty prompt, `200` + `{ fileUrl }` on success with the correct bucket/content-type passed to the storage helper, `500` with a generic error message (not the raw provider error text) when the OpenAI call or storage upload throws.
- **E2E test** (Playwright) at `e2etest/tests/public/articles.spec.ts` (new file): navigate to a published Article's detail page and assert `<meta property="og:title">`, `og:description`, `og:image` (an absolute URL), and `og:type="article"` are present with correct values; assert the Facebook share element's target points at `https://www.facebook.com/sharer/sharer.php?u=` followed by the correctly URL-encoded absolute Article URL; assert an Article with no `coverImageUrl` renders the placeholder image in both `og:image` and the on-page hero.
- Prior art: `src/__tests__/unit/api/contact.test.ts` for the API-route unit-test pattern (`jest.mock` of an external service, asserting status codes and non-leaking error messages); `e2etest/tests/public/*.spec.ts` for the rendered-page Playwright pattern.
- Out of automated-test scope: the admin-side "Generate Cover Image" button's interaction with a real AI provider (would require live API calls/cost) — its client-side behavior (loading state, prompt pre-fill, regenerate-cap UI) is left to manual QA or a component-level unit test with the API mocked, not e2e.

## Out of Scope

- Twitter/X Card meta tags.
- Sitewide default Open Graph tags on non-Article pages (Home, Events, Announcements, etc.) — a possible separate follow-up.
- The official Facebook SDK share widget or registering a Facebook App ID.
- Sharing to any platform other than Facebook.
- An abstraction layer for swapping AI image providers — this spec hard-codes OpenAI.
- Automated end-to-end testing against the live AI image generation API.
- Garbage-collecting previously generated images left in Supabase Storage from discarded regeneration attempts.
- Persisting the regeneration-attempt count across page reloads, browser sessions, or per-admin (the site has one shared admin login, so there's no per-user account to key it to anyway).

## Further Notes

- The unused `OPENROUTER_API_KEY` found in `.env.local` is unrelated to this work and is left as-is; it's worth the team separately confirming whether it's a stale credential that should be rotated/removed.
- No conflict with ADR-0001 (Article Body stored as sanitized HTML) — this work touches Cover image and page metadata only, not Body storage or rendering.
- Exact OpenAI image-preset sizes available at implementation time should be confirmed against current API docs, since providers periodically change their supported presets; the 1200×630 crop step is what keeps the stored asset's dimensions stable regardless.
