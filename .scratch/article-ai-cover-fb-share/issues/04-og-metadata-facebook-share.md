# 04: Open Graph metadata + Facebook Share button

**What to build:** A published Article's detail page emits Open Graph meta tags (title, description, image, type) so sharing its link renders a large-image preview card, and shows a "Share to Facebook" button that opens Facebook's share dialog pre-populated with the Article's URL. Draft/nonexistent Articles never produce a public preview.

**Blocked by:** 02 (needs the placeholder fallback so every published Article always resolves to some image URL)

**Status:** ready-for-agent

- [ ] Article detail page exports `generateMetadata`, producing `openGraph: { title, description, images, type: "article" }` for published Articles, using the Article's title, Excerpt, and cover image (or placeholder, per ticket 02) as an absolute URL built from the existing `NEXT_PUBLIC_BASE_URL` convention.
- [ ] Draft or nonexistent Articles produce no public preview/metadata, consistent with the page's existing not-found behavior.
- [ ] Article detail page shows a "Share to Facebook" button/link that opens `https://www.facebook.com/sharer/sharer.php?u=<url-encoded absolute Article URL>` — no Facebook App ID or SDK involved.
- [ ] The share button appears on the Article detail page only, not on listing cards.
- [ ] New Playwright e2e spec (`e2etest/tests/public/articles.spec.ts`) asserts the `og:title`/`og:description`/`og:image`/`og:type` meta tags on a published Article, asserts the share link's target URL, and asserts the placeholder image appears in `og:image` for an Article with no cover image set.
