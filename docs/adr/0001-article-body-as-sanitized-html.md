# Article body stored as sanitized HTML, not structured JSON

Articles are authored with Tiptap, a ProseMirror-based rich text editor whose native output is a structured JSON document. We chose to store the Article's Body as a sanitized HTML string instead, matching the plain-string convention already used for `content` on Announcement and Minutes in `src/lib/data.ts`. This means the public site renders Body via sanitized `dangerouslySetInnerHTML` rather than a JSON-to-React renderer, and sanitization (e.g. DOMPurify) must run on every render path to stay safe against stored XSS — a safety property Tiptap's native JSON format would have given us by construction.

## Considered Options

- **Structured JSON document** (Tiptap's native format): safer by default, no raw HTML to sanitize, but requires a JSON-to-React renderer on the public site and diverges from how every other content field in this codebase is stored.
- **Sanitized HTML string** (chosen): consistent with the existing `content` string-field convention across Announcement and Minutes; simpler to store and query, at the cost of depending on correct sanitization at every render site.

## Consequences

- Every place that renders Article Body (public detail page, and any future preview/embed) must sanitize before injecting HTML — there is no structural guarantee against stored XSS the way there would be with a JSON renderer.
- Switching to structured JSON later requires a data migration of existing Article rows, not just a code change.
