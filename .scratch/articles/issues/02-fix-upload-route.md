# 02: Fix /api/upload (bucket-aware + authenticated)

**What to build:** harden the existing file upload endpoint so uploads land in a context-appropriate storage bucket and only an authenticated admin can upload — a correctness/security fix that also corrects the existing settings-logo upload, done ahead of Articles needing it for cover/inline images.

**Blocked by:** None (can start immediately, independent of ticket 01)

**Status:** ready-for-human

- [x] `/api/upload` selects its destination Supabase Storage bucket based on the `context` query param (e.g. an `images` bucket for `context=image`) instead of always uploading to the hardcoded `"minutes"` bucket.
- [x] `/api/upload` returns 401 for any request without a valid admin session, matching every other mutating route.
- [x] Existing callers (`admin/settings` logo upload, `admin/policies` document upload) continue to work end-to-end against the corrected route.

## Comments

Implemented in commit 201e00f. Status set to `ready-for-human` per this tracker's vocabulary (no "done" state) — a human should verify and move this along.
