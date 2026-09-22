Status: ready-for-agent

# External AI Cover Image Prompt Specification for Articles

## Problem Statement

Admins editing an Article already have two ways to get a cover image: upload their own file, or click "Generate Cover Image" to have OpenAI generate one in-app. The in-app option costs API usage and depends on a provisioned `OPENAI_API_KEY`. Some admins would rather generate an image for free using an AI tool they already have access to (ChatGPT, Gemini, Midjourney, Copilot, etc.) and then upload the result manually — but today there's no guidance in the admin UI on what to ask that external tool for, so the result may come back the wrong shape, include unwanted text, or (given this is a school-community site) depict a real, identifiable child or family without consent.

## Solution

Add a collapsible "Generate with an external AI tool (free)" section to the admin Article editor, next to the existing cover-image controls. Collapsed by default, it expands to show a specification block — dynamically templated with the current Article's title — describing the target image dimensions, format, and composition/content constraints an admin should paste into any external LLM or image-generation tool. A "Copy to clipboard" button copies the full templated text in one click. The admin then generates the image externally and uses the existing manual upload button to add it to the Article, same as today. No new API integration, dependency, or backend route is introduced. The existing in-app OpenAI button is kept, relabeled for clarity alongside the new section.

## User Stories

1. As a PAC admin, I want a "Generate with an external AI tool (free)" section in the Article editor, so that I can get cover-image guidance without paying for or depending on the in-app OpenAI integration.
2. As a PAC admin, I want that section collapsed by default, so that the editor form isn't cluttered for admins who already have an image ready to upload.
3. As a PAC admin, I want the specification text to already include my Article's title, so that I can copy it straight into an external AI tool without editing it first.
4. As a PAC admin, I want a "Copy to clipboard" button on the specification block, so that I don't have to manually select and copy the text.
5. As a PAC admin, I want the specification to state the target dimensions/aspect ratio (1200×630, matching the site's existing cover-image size), so that the image I generate externally doesn't need cropping to look right once uploaded.
6. As a PAC admin, I want the specification to tell the external tool not to render any text/words into the image, so that the result doesn't come back with garbled or unwanted embedded text (a known failure mode of AI image generation).
7. As a PAC admin, I want the specification to instruct against depicting real, identifiable people or children, so that a generated cover image never implies a photo of an actual PAC family without their consent.
8. As a PAC admin, once I've generated an image externally, I want to use the same manual upload button that already exists on this form, so that there's only one upload path to learn, not two.
9. As a PAC admin, I want the existing in-app "Generate Cover Image" (OpenAI) button to keep working exactly as it does today, so that this change doesn't take away an option I already rely on.
10. As a PAC admin, I want the two AI-related options clearly labeled (e.g. "Generate with OpenAI (in-app)" vs. "Generate with an external AI tool (free)"), so that I understand which one uses the site's paid API and which one is free and manual.

## Implementation Decisions

- **Location**: `src/app/admin/articles/page.tsx`, in the same form region as the existing cover-image controls (manual upload input, `coverPrompt` textarea, and "Generate/Regenerate Cover Image" button).
- **Relabeling**: the existing "Generate/Regenerate Cover Image" button and its surrounding copy are relabeled to make clear it's the in-app, API-backed option (e.g. "Generate with OpenAI (in-app)"). No behavioral change to that button, its `handleGenerateCoverImage` handler, `MAX_COVER_GENERATIONS` cap, or the `/api/articles/generate-cover-image` route.
- **New collapsible section**: a new client-side component (e.g. `src/components/ExternalCoverImageSpec.tsx`), rendered inside the admin Articles form, collapsed by default (simple local `useState` toggle, not persisted). Heading: "Generate with an external AI tool (free)".
- **Templated spec text**: built from a plain template function (e.g. `buildExternalCoverImageSpec(title: string): string`), interpolating the form's current `title` field the same way `coverPrompt` is already seeded from title today. Falls back to a generic placeholder phrase (e.g. "your article") if the title is empty.
- **Spec content** (technical only, no brand/style guidance since none is documented in the repo today):
  - Target output: 1200×630 pixels (or as close as the tool allows — matches the site's existing cover-image dimensions used by the OpenAI path and the default placeholder).
  - Format: JPG or PNG.
  - No embedded text, words, letters, or logos anywhere in the image.
  - A single clear focal subject, landscape orientation, suitable as a website banner/header image.
  - Content must be safe for a general school-community audience.
  - Must not depict real, identifiable people, children, or families — use illustrative, abstract, or generic stock-style imagery instead.
  - A line naming the Article's title as the subject to illustrate (the dynamic part).
- **Copy to clipboard**: a button using the standard `navigator.clipboard.writeText()` API, with a brief inline confirmation (e.g. "Copied!") on success and a visible fallback (e.g. showing the text is already selectable) if the clipboard API throws/is unavailable — no new dependency needed.
- **No storage/backend/API changes**: this is a UI-only, static-content addition. It reuses the existing manual-upload path (`uploadImage` → `POST /api/upload?context=image`) unchanged; no new columns, routes, or environment variables.
- **Scope boundary**: Articles only. Events, Minutes, and Announcements have no cover-image field or upload UI today and are untouched by this work.

## Testing Decisions

- **Unit test** (Jest + React Testing Library) for the new component, following the pattern of existing component tests (e.g. `src/__tests__/unit/components/ArticleCoverImage.test.tsx`): assert the section is collapsed by default and expands on toggle; assert the rendered spec text includes the current title, the 1200×630 dimension, and the "no embedded text" / "no real identifiable people" constraints; assert clicking "Copy to clipboard" calls `navigator.clipboard.writeText` with the full templated text (clipboard API mocked).
- Out of automated-test scope: whether any given external AI tool actually honors the pasted instructions — this spec only controls what text is offered to the admin, not third-party tool behavior.
- No changes needed to existing tests for the OpenAI-backed button or `/api/articles/generate-cover-image` — that code path is unmodified apart from label text.

## Out of Scope

- Any change to Events, Minutes, or Announcements (no cover-image field exists for these types; adding one is a separate effort).
- Removing, replacing, or modifying the existing in-app OpenAI "Generate Cover Image" integration or its API route.
- Any new AI API integration, dependency, or environment variable.
- Brand-specific style/color guidance in the specification text (no PAC brand palette is documented in the repo today; can be layered on later if one is defined).
- Persisting the collapsed/expanded state of the new section across sessions.
- Validating, at upload time, that a manually-uploaded image actually matches the specification (dimensions, content safety, etc.) — this remains an honor-system guideline, same as today's manual upload path has no such validation.

## Further Notes

- This spec deliberately keeps the two cover-image-generation paths (in-app OpenAI vs. external/free) side by side rather than replacing one with the other, per explicit product decision — some admins will prefer the one-click in-app option despite its API cost, others will prefer the free external option.
- If a PAC brand style guide (colors, tone, imagery conventions) is documented in the future, the spec template in `buildExternalCoverImageSpec` is the natural place to extend with that guidance.
