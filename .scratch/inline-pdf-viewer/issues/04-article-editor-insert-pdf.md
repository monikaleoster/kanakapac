# 04: Insert PDF in the Article editor

**What to build:** An admin editing an Article clicks "Insert PDF" next to "Insert Image", picks a PDF, and it is uploaded and inserted at the cursor as an anchor with the `data-pdf-viewer` attribute, labelled with a link text the admin can choose (defaulting to the file name). In the editor it appears as a styled PDF link chip rather than a live viewer. The attribute survives editing, saving and sanitizing, so the published Article shows the inline viewer. Errors from the upload (wrong type, over 4MB) are shown to the admin. The domain glossary gains a term for the PDF viewer and embedded PDF, and Body notes that it may contain embedded PDF links.

**Blocked by:** 02: PDF upload context with 4MB cap; 03: Embedded PDFs render in public Articles

**Status:** ready-for-agent

- [ ] "Insert PDF" toolbar button uploads via the `pdf` context and inserts the `data-pdf-viewer` anchor at the cursor
- [ ] Link text defaults to the file name and can be edited
- [ ] Inserted PDF shows as a styled chip in the editor
- [ ] The attribute is preserved through save and re-open of the Article
- [ ] Upload errors (invalid type, over 4MB) are shown to the admin
- [ ] Glossary updated
- [ ] Manually verified end to end: insert, save, publish, view inline on the public page
