Status: ready-for-agent

# Inline PDF viewer for Minutes and Articles

## Problem Statement

Parents who visit a Minutes page or read an Article that references a PDF have to click away to a new tab to see it. On Minutes the document is only a "View Document" link. Articles cannot include a PDF at all, since the editor only supports images. Visitors on phones find this especially clumsy, and admins have no way to put a PDF in the middle of an Article.

## Solution

PDFs display inline, on the page, in a scrollable viewer. The Minutes detail page shows the viewer when the uploaded document is a PDF. Admins can insert a PDF into an Article Body from the editor, and the public Article page shows it in the same viewer. Every viewer has "Open in new tab" and "Download" links as a fallback. Non-PDF Minutes documents (DOC, DOCX, TXT) keep their current link. Subscriber emails and any page where the viewer cannot load show a plain link to the PDF.

## User Stories

1. As a parent, I want to read the minutes of a meeting directly on the Minutes page, so that I do not have to open a separate tab.
2. As a parent on a phone, I want the PDF to render in the page rather than a browser-specific viewer, so that I can read every page and not only the first.
3. As a parent, I want to scroll through all pages of a PDF in one continuous view, so that reading feels like reading a normal page.
4. As a parent, I want the PDF to fit the width of my screen, so that I do not have to scroll sideways.
5. As a parent, I want an "Open in new tab" link above the viewer, so that I can view the document full screen if I prefer.
6. As a parent, I want a "Download" link above the viewer, so that I can keep a copy of the minutes.
7. As a parent with a slow connection, I want pages to render as I scroll to them, so that a long PDF does not make the page feel stuck.
8. As a parent, I want a clear message and a working link if the viewer fails to load, so that I can still reach the document.
9. As a parent viewing minutes that are a Word document or a text file, I want the existing "View Document" link, so that I can still open them.
10. As a parent viewing minutes with no document, I want to still see the "No document yet" message, so that I understand nothing is missing due to an error.
11. As a parent, I want older minutes that are already PDFs to display inline without anyone re-uploading them, so that the whole archive is consistent.
12. As a parent reading an Article, I want PDFs embedded in the Article to display inline where the author placed them, so that the Article reads in context.
13. As a parent reading an Article, I want an embedded PDF to have the same fallback links as on Minutes, so that behaviour is predictable.
14. As a parent who reads Article notifications by email, I want a plain link to the PDF in the email, so that it works in my mail client.
15. As an admin editing an Article, I want an "Insert PDF" button next to "Insert Image", so that I can add a PDF without leaving the editor.
16. As an admin, I want the inserted PDF to appear in the editor as a labelled link chip, so that I can see and move it without a heavy preview.
17. As an admin, I want to choose the link text of the inserted PDF, or have it default to the file name, so that readers see a meaningful label.
18. As an admin, I want a clear error if I upload a file that is not a PDF, so that I know why it was rejected.
19. As an admin, I want a clear error if the PDF is larger than 4MB, so that I know to compress it rather than seeing an opaque failure.
20. As an admin, I want the 4MB limit to apply to Minutes PDF uploads as well, so that uploads behave the same in production and are not silently rejected by the host.
21. As an admin uploading Minutes, I want DOC, DOCX and TXT uploads to keep working unchanged, so that my existing workflow is not broken.
22. As an admin, I want only authenticated admins to be able to upload PDFs, so that the site cannot be used to host arbitrary files.
23. As an admin, I want a saved Article to keep its PDF links after sanitizing, so that my embed is not silently stripped on save.
24. As a site maintainer, I want the Article sanitizer to still strip iframes, scripts, and event handlers, so that adding PDFs does not weaken ADR 0001.
25. As a site maintainer, I want the PDF viewer library to load only on pages that actually have a PDF, so that other pages stay fast.
26. As a site maintainer, I want no schema change for Minutes, so that rollout needs no migration.
27. As a site maintainer, I want no new storage bucket, so that no new infrastructure is needed in each environment.
28. As a screen-reader user, I want the viewer to have an accessible label and the fallback links to be real links, so that I can reach the document without the canvas.
29. As a parent with JavaScript disabled, I want the plain link to the PDF to remain, so that I can still open it.

## Implementation Decisions

- **Viewer module**: A single client-side PDF viewer module built on react-pdf (pdf.js). It takes a PDF URL and an optional title. It renders all pages stacked, fit to the container width, in a scroll area of about 80vh, and renders pages lazily as they enter view. Above the viewer it shows "Open in new tab" and "Download" links. If loading fails it shows an error message with those same links.
- **Lazy loading**: The viewer is imported dynamically with server-side rendering disabled, so react-pdf and its worker only load on pages that show a PDF. The pdf.js worker must be configured to work under Next.js 14.
- **Minutes detail**: The page shows the viewer when the stored document URL ends in `.pdf` (case-insensitive, ignoring any query string). Other document types keep the current "View Document" link, and a missing document keeps "No document yet". No schema change, no backfill, so existing PDF Minutes display inline on deploy.
- **Article embed representation**: An embedded PDF is stored in the Article Body as an ordinary anchor to the PDF URL with a `data-pdf-viewer` attribute. The Body remains sanitized HTML with embedded content. In emails, and without JavaScript, this degrades to a plain link.
- **Sanitizer**: The Article Body sanitizer allows the `data-pdf-viewer` attribute on anchors, and nothing else new. Iframes, scripts, event handlers and other disallowed content are still stripped, consistent with ADR 0001. All paths that render a Body (public page, publish email) continue to sanitize before rendering.
- **Article public page**: After sanitizing, anchors with `data-pdf-viewer` are replaced by the viewer in place, with the anchor text used as the title. The rest of the Body renders as before.
- **Article editor**: A new "Insert PDF" toolbar button uploads a PDF and inserts the anchor with `data-pdf-viewer` at the cursor. The editor's link handling must preserve the data attribute. In the editor the anchor appears as a styled chip identifying it as a PDF. There is no live viewer in the editor.
- **Upload API**: The upload endpoint gains a `pdf` context accepting only `application/pdf`, with a 4MB cap, stored in the existing Minutes bucket. Errors use the existing style: invalid type returns 400, oversize returns 413 with a clear message, unauthenticated returns 401. The 4MB cap exists because the host limits request bodies to about 4.5MB. Direct-to-storage signed uploads for larger files are a future option.
- **Minutes admin**: PDF uploads from the Minutes admin form are also subject to the 4MB cap, with the error shown to the admin. DOC, DOCX and TXT uploads keep their current behaviour. The upload client helper surfaces the server error message instead of a generic failure so admins see "too large" versus "invalid type".
- **Glossary**: Add a term for the PDF viewer and the embedded PDF in the domain glossary, and note under Body that it may contain embedded PDF links.

## Testing Decisions

- A good test exercises external behaviour: what a caller of the endpoint or a visitor to the page receives, not internal component structure or library calls. react-pdf is mocked at the module boundary because pdf.js does not run in the test environment.
- Three seams, all existing patterns, and no new seams:
  1. The upload endpoint: PDF accepted into the Minutes bucket, non-PDF rejected for the `pdf` context, over-4MB rejected with 413, unauthenticated rejected with 401, and existing image and document contexts unchanged. Prior art: the existing upload endpoint tests.
  2. The Article Body sanitizer: `data-pdf-viewer` survives on anchors, while iframes, scripts, and event handlers are still stripped. Prior art: the existing sanitizer tests.
  3. The public Minutes detail and Article detail pages with the viewer mocked: a `.pdf` Minutes URL renders the viewer, a DOCX URL renders the link, no document renders the empty message, and an Article Body with a `data-pdf-viewer` anchor renders the viewer while normal anchors stay links. Prior art: the existing page-level tests for the articles listing and the card component tests.
- Not tested directly: the viewer component internals, pdf.js rendering, and the TipTap toolbar button, which are covered by manual verification in the running app.

## Out of Scope

- Direct-to-Supabase signed uploads and PDFs over 4MB.
- Live PDF rendering inside the Article editor.
- Page-at-a-time navigation, zoom controls, search, or text selection features beyond what pdf.js gives by default.
- Inline rendering of DOC, DOCX or TXT Minutes.
- Restricting Minutes to PDF only.
- A file type column or any database migration.
- A separate storage bucket for Article PDFs.
- Rendering PDFs inside subscriber emails.
- Showing the viewer on list pages or cards.

## Further Notes

- The domain glossary defines Minutes as backed by an uploaded document (PDF, DOC, DOCX, or TXT), and that remains true.
- Uploaded filenames keep their original extension, which is what makes extension-based PDF detection reliable for existing records.
- The Supabase public bucket must allow cross-origin reads for pdf.js to fetch the file. Verify this once in the real environment.
