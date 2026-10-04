# 01: Minutes inline PDF viewer

**What to build:** A visitor opening a Minutes detail page whose document is a PDF reads it inline in a scrollable viewer instead of clicking "View Document". The viewer is a lazy-loaded react-pdf component showing all pages stacked, fit to container width, about 80vh tall, rendering pages as they scroll into view. "Open in new tab" and "Download" links sit above it, and a load failure shows a message with those same links. Non-PDF documents (DOC, DOCX, TXT) keep the existing link and a missing document keeps "No document yet". PDF detection is by `.pdf` extension on the stored URL (case-insensitive, ignoring query string), so existing PDF minutes work with no migration.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Minutes detail page shows the viewer for a `.pdf` document URL
- [ ] Non-PDF document URLs still show the "View Document" link
- [ ] Missing document still shows "No document yet"
- [ ] Viewer has "Open in new tab" and "Download" links and an error fallback with the same links
- [ ] react-pdf is loaded only when a PDF is shown (dynamic import, no SSR) and the pdf.js worker works under Next 14
- [ ] Viewer has an accessible label
- [ ] Jest tests on the Minutes detail page with react-pdf mocked cover the PDF, non-PDF and empty cases
