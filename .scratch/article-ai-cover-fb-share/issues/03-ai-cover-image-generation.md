# 03: AI cover image generation in the admin editor

**What to build:** In the Article editor, an admin can generate a cover image from a title-derived, editable prompt via a new "Generate Cover Image" action — see a loading state, get the result applied as the cover, regenerate up to a capped number of attempts with a remaining-count indicator, and see a friendly error message on failure. Manual upload remains available as an alternative at all times.

**Blocked by:** 01 (needs the shared upload helper)

**Status:** ready-for-agent

- [ ] Admin Article editor has a "Generate Cover Image" action with a prompt field pre-filled from the Article's title, editable before generating.
- [ ] Clicking generate shows a loading state and, on success, sets the generated image as the Article's cover image, using the same field/preview manual upload already uses.
- [ ] New `POST /api/articles/generate-cover-image` route is auth-gated: `401` unauthenticated, `400` on missing/empty prompt, `200` + `{ fileUrl }` on success, `500` with a generic (non-leaking) error message on provider/upload failure.
- [ ] Generated image is produced via OpenAI's image API and normalized to exactly 1200×630 before being uploaded through the shared storage helper (ticket 01).
- [ ] Admin can regenerate the cover image up to a capped number of attempts (e.g. 5) per editing session, with a visible remaining-attempts indicator, and the "Generate" action is disabled once the cap is reached.
- [ ] A failed generation shows a clear, non-technical error message and does not clear or replace an already-set cover image.
- [ ] Manual image upload remains available as an alternative to generation at all times, and can replace a generated image or vice versa.
- [ ] Unit tests cover the new route's status codes/response shapes with the OpenAI client and storage helper mocked, following the pattern in `src/__tests__/unit/api/contact.test.ts`.
- [ ] New `OPENAI_API_KEY` env var is documented in `.env.example`; the pre-existing unused `OPENROUTER_API_KEY` is left untouched and unused.
