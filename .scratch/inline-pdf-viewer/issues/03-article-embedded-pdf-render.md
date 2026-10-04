# 03: Embedded PDFs render in public Articles

**What to build:** An Article Body containing an anchor to a PDF marked with the `data-pdf-viewer` attribute shows that PDF in the inline viewer, in place, on the public Article page. Anchors without the attribute stay ordinary links. The Article Body sanitizer keeps the `data-pdf-viewer` attribute on anchors and nothing else new; iframes, scripts and event handlers are still stripped per ADR 0001, and Body rendering paths still sanitize first. In publish-notification emails and without JavaScript the anchor remains a plain link.

**Blocked by:** 01: Minutes inline PDF viewer (reuses the viewer component)

**Status:** ready-for-agent

- [ ] Sanitizer preserves `data-pdf-viewer` on anchors
- [ ] Sanitizer still strips iframes, scripts and inline event handlers
- [ ] Public Article page replaces `data-pdf-viewer` anchors with the viewer, using the anchor text as the title
- [ ] Normal anchors in the Body are unaffected
- [ ] Publish-notification email still contains a plain link for the PDF
- [ ] Jest tests cover the sanitizer and the Article detail page with react-pdf mocked
