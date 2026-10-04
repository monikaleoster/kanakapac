# 02: PDF upload context with 4MB cap

**What to build:** An admin can upload a PDF through the upload endpoint using a new `pdf` context and gets a public URL back. Only PDFs are accepted and files over 4MB are rejected (the cap fits the host's ~4.5MB request-body limit). The existing image and document contexts are unchanged. The Minutes admin form and the upload client helper show the server's specific error ("too large" versus "invalid type") instead of a generic failure, so the 4MB cap applies to Minutes PDFs with a clear message while DOC, DOCX and TXT uploads behave as before.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `pdf` context accepts `application/pdf` and stores it in the existing Minutes bucket
- [ ] Non-PDF files in the `pdf` context return 400; files over 4MB return 413 with a clear message; unauthenticated requests return 401
- [ ] Existing image and document contexts behave exactly as before
- [ ] Minutes admin upload shows the specific server error message
- [ ] Jest tests on the upload route cover accept, wrong type, oversize, unauthenticated and unchanged existing contexts
